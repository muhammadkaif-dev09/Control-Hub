import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const { priceId, userId, name } = await req.json();
    // console.log(priceId, userId, name);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId: userId,
        priceId: priceId,
        name: name,
      },
      billing_address_collection: "required",
      success_url: "http://172.16.16.133:3000/payment-success",
      cancel_url: "http://172.16.16.133:3000/PaymentCancelled",
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
