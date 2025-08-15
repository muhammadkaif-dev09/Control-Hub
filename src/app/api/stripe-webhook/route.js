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
  console.log("Raw", rawBody);
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    console.error("❌ Missing Stripe signature");
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
    );
  } catch (err) {
    console.error("❌ Webhook verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  try {
    // 1. Handle checkout.session.completed
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      console.log(session);
      const userId = session.metadata?.userId;
      const priceId = session.metadata?.priceId;
      const name = session.metadata?.name;
      const status = "active";
      const amountPaid = (session.amount_total || 0) / 100;
      const paymentDate = new Date(session.created * 1000).toISOString();

      console.log(
        "PriceId: ",
        priceId,
        "UserId: ",
        userId,
        "Plan Name: ",
        name
      );

      const creditsMap = {
        price_1RvXXeSLa0T8NCkYCN9pBqHn: 10,
        price_1RvXYfSLa0T8NCkYRJjP1tg2: 20,
        price_1RvXZFSLa0T8NCkYIAAyCSqm: 30,
        price_1Rvz8qSLa0T8NCkYKKDVQEaj: 30,
        price_1RvXZgSLa0T8NCkYJm7r1paE: 100,
      };

      // Plan Durations in days
      const durationMap = {
        price_1RvXXeSLa0T8NCkYCN9pBqHn: 28,
        price_1RvXYfSLa0T8NCkYRJjP1tg2: 28,
        price_1RvXZFSLa0T8NCkYIAAyCSqm: 28,
        price_1RvXZgSLa0T8NCkYJm7r1paE: 365,
        price_1Rvz8qSLa0T8NCkYKKDVQEaj: 365,
      };

      const creditsToAdd = creditsMap[priceId] || 0;
      const durationInDays = durationMap[priceId] || 28;

      const expiryDate = new Date(session.created * 1000);
      expiryDate.setDate(expiryDate.getDate() + durationInDays);
      const expiryDateISO = expiryDate.toISOString();

      // Insert the basic purchase record — receipt will be added later by charge.updated
      const { error: insertError } = await supabaseAdmin
        .from("purchases")
        .insert({
          user_id: userId,
          amount_paid: amountPaid,
          payment_date: paymentDate,
          status,
          credit: creditsToAdd,
          paymentReceipt: null,
          payment_intent: session.payment_intent,
          expiry_date: expiryDateISO,
          plan_name: name,
        });

      if (insertError) {
        console.error("❌ Failed to insert purchase:", insertError);
        return NextResponse.json(
          { error: "Failed to insert purchase" },
          { status: 500 }
        );
      }

      // Update user credits
      const { data: user, error: userErr } = await supabaseAdmin
        .from("user_profiles")
        .select("remainingCredits")
        .eq("id", userId)
        .single();

      if (!user || userErr) {
        console.error("❌ Failed to fetch user profile:", userErr);
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

    // 2. Handle charge.updated — to update receipt_url later
    else if (event.type === "charge.updated") {
      const charge = event.data.object;
      const paymentIntentId = charge.payment_intent;
      const receiptUrl = charge.receipt_url;

      if (paymentIntentId && receiptUrl) {
        const { error: updateError } = await supabaseAdmin
          .from("purchases")
          .update({ paymentReceipt: receiptUrl })
          .eq("payment_intent", paymentIntentId);

        if (updateError) {
          console.error(
            "❌ Failed to update receipt_url in purchases:",
            updateError
          );
        } else {
          console.log(
            `✅ Receipt URL updated for payment_intent ${paymentIntentId}`
          );
        }
      } else {
        console.warn(
          "⚠️ Missing payment_intent or receipt_url in charge.updated"
        );
      }
    } else {
      console.log(`ℹ️ Event type not handled: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
