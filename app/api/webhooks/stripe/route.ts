import { getAdminClient } from "@/lib/supabase";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

function getStripe() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const StripeSDK = require("stripe").default;
  return new StripeSDK(process.env.STRIPE_SECRET_KEY || "");
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !webhookSecret || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Webhook yapilandirmasi eksik" }, { status: 400 });
  }

  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Imza dogrulanamadi" }, { status: 400 });
  }

  const admin = getAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.order_id;
      if (orderId) {
        await admin
          .from("orders")
          .update({
            payment_status: "paid",
            payment_id: session.payment_intent as string,
            status: "confirmed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId);
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const intent = event.data.object as Stripe.PaymentIntent;
      const orderId = intent.metadata?.order_id;
      if (orderId) {
        await admin
          .from("orders")
          .update({
            payment_status: "failed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId);
      }
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const orderId = charge.metadata?.order_id;
      if (orderId) {
        await admin
          .from("orders")
          .update({
            payment_status: "refunded",
            status: "refunded",
            updated_at: new Date().toISOString(),
          })
          .eq("id", orderId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
