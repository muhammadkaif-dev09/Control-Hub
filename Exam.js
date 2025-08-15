import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/supabase/adminClient";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

export const config = {
  runtime: "node",
};

export async function POST(req) {
  const buf = await req.arrayBuffer();
  const rawBody = Buffer.from(buf);
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    console.error("❌Missing Stripe signature");
    return NextResponse.json(
      { error: "Missing Stripe signature" },
      { status: 400 }
    );
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    ); // console.log("✅ Stripe event verified:", event.type);
  } catch (err) {
    // console.error("❌ Webhook verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  console.log(event); // const receipt_url = event.data.object.receipt_url; // console.log("My URL", receipt_url); // console.log("Receipt URL:", event.data.object.receipt_url);
  try {
    // ✅ Handle only checkout.sesson.completed
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const priceId = session.metadata?.priceId; // console.log("Session Data", session);
      const status = "active";
      const amountPaid = (session.amount_total || 0) / 100;
      const paymentDate = new Date(session.created * 1000).toISOString(); // ➕ Add credits

      const creditsMap = {
        price_1Rv9QHSqNy9q0EJz2DSwcK0W: 10,
        price_1RvC8PSqNy9q0EJzyvc1G6FT: 20,
        price_1RvGIkSqNy9q0EJztAiwnvpy: 30,
        price_1RvGKOSqNy9q0EJz3esKKyV5: 100, // price_1Rv9QHSqNy9q0EJz2DSwcK0W: 10, // price_1RvC8PSqNy9q0EJzyvc1G6FT: 20, // price_1RvGIkSqNy9q0EJztAiwnvpy: 30, // price_1RvGKOSqNy9q0EJz3esKKyV5: 100,
      };

      // ✅ Fetch receipt URL from payment_intent
      let receipt_url = null;
      if (session.payment_intent) {
        const paymentIntent = await stripe.paymentIntents.retrieve(
          session.payment_intent
        );
        const charges = paymentIntent.charges?.data || [];
        if (charges.length > 0) {
          receipt_url = charges[0].receipt_url;
        }
      }

      const creditsToAdd = creditsMap[priceId] || 0; // Insert purchase table
      const { error: insertError } = await supabaseAdmin
        .from("purchases")
        .insert({
          user_id: userId,
          amount_paid: amountPaid,
          payment_date: paymentDate,
          status,
          credit: creditsToAdd, 
          paymentReceipt: receipt_url,
        }); // console.log("receipt_url: ", receipt_url);

      if (insertError) {
        console.error("❌ Failed to insert purchase:", insertError);
        return NextResponse.json(
          { error: "Failed to insert purchase" },
          { status: 500 }
        );
      } // console.log(receipt_url); // console.log(`✅ Purchase inserted for user ${userId}`);

      if (creditsToAdd > 0) {
        const { data: user, error: userErr } = await supabaseAdmin
          .from("user_profiles")
          .select("remainingCredits")
          .eq("id", userId)
          .single();

        if (userErr || !user) {
          console.error("❌ Failed to fetch user credits:", userErr);
        } else {
          const updatedCredits = (user.remainingCredits || 0) + creditsToAdd;

          const { error: updateError } = await supabaseAdmin
            .from("user_profiles")
            .update({ remainingCredits: updatedCredits })
            .eq("id", userId);

          if (updateError) {
            console.error("❌ Failed to update user credits:", updateError);
          } else {
            console.log(`✅ Added ${creditsToAdd} credits to user ${userId}`);
          }
        }
      }
    } else {
      console.log(`ℹ️ Event type not handled: ${event.type}`);
    }
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
