import { getAdminClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const admin = getAdminClient();
  const body = await request.json();

  // iyzico sends callback with these fields
  const { token, status, paymentId, conversationId } = body;

  if (!token || !conversationId) {
    return NextResponse.json({ error: "Eksik parametreler" }, { status: 400 });
  }

  // conversationId = order ID
  const orderId = conversationId;

  if (status === "SUCCESS") {
    await admin
      .from("orders")
      .update({
        payment_status: "paid",
        payment_id: paymentId || token,
        status: "confirmed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);
  } else {
    await admin
      .from("orders")
      .update({
        payment_status: "failed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);
  }

  return NextResponse.json({ received: true });
}
