import { getAdminClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const admin = getAdminClient();
  const body = await request.json();

  if (!body.store_id || !body.code) {
    return NextResponse.json({ error: "store_id ve code gerekli" }, { status: 400 });
  }

  const { data: coupon, error } = await admin
    .from("coupons")
    .select("*")
    .eq("store_id", body.store_id)
    .eq("code", body.code.toUpperCase())
    .eq("is_active", true)
    .single();

  if (error || !coupon) {
    return NextResponse.json({ error: "Gecersiz kupon kodu" }, { status: 404 });
  }

  // Check expiry
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return NextResponse.json({ error: "Kupon suresi dolmus" }, { status: 400 });
  }

  // Check usage limit
  if (coupon.max_uses > 0 && coupon.used_count >= coupon.max_uses) {
    return NextResponse.json({ error: "Kupon kullanim limiti dolmus" }, { status: 400 });
  }

  // Check minimum order amount
  const orderTotal = Number(body.order_total) || 0;
  if (coupon.min_order_amount > 0 && orderTotal < coupon.min_order_amount) {
    return NextResponse.json({
      error: `Minimum siparis tutari ${coupon.min_order_amount} TL olmalidir`,
    }, { status: 400 });
  }

  // Calculate discount
  let discountAmount = 0;
  if (coupon.discount_type === "percentage") {
    discountAmount = (orderTotal * coupon.discount_value) / 100;
  } else {
    discountAmount = coupon.discount_value;
  }

  return NextResponse.json({
    valid: true,
    discount_type: coupon.discount_type,
    discount_value: coupon.discount_value,
    discount_amount: Math.min(discountAmount, orderTotal),
  });
}
