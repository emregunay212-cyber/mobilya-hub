import { getAdminClient } from "@/lib/supabase";
import { sanitizeString } from "@/lib/validate";
import { NextResponse } from "next/server";

function generateOrderNumber(): string {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${y}${m}${d}-${rand}`;
}

interface CartItem {
  product_id: string;
  name: string;
  slug?: string;
  image?: string;
  quantity: number;
  price: number;
}

export async function POST(request: Request) {
  const admin = getAdminClient();
  const body = await request.json();

  // Validate required fields
  if (!body.store_id || !body.customer_name || !body.customer_email || !body.items?.length) {
    return NextResponse.json(
      { error: "store_id, customer_name, customer_email ve items gerekli" },
      { status: 400 }
    );
  }

  // Validate email format
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.customer_email)) {
    return NextResponse.json({ error: "Gecersiz e-posta adresi" }, { status: 400 });
  }

  // Verify store exists and is active
  const { data: store } = await admin
    .from("stores")
    .select("id, is_active")
    .eq("id", body.store_id)
    .single();

  if (!store || !store.is_active) {
    return NextResponse.json({ error: "Magaza bulunamadi" }, { status: 404 });
  }

  const items: CartItem[] = body.items;
  const subtotal = items.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);
  const shippingCost = Number(body.shipping_cost) || 0;
  const discountAmount = Number(body.discount_amount) || 0;
  const total = subtotal - discountAmount + shippingCost;

  // Create or find customer
  let customerId = null;
  const { data: existingCustomer } = await admin
    .from("customers")
    .select("id")
    .eq("store_id", body.store_id)
    .eq("email", body.customer_email)
    .single();

  if (existingCustomer) {
    customerId = existingCustomer.id;
    // Update customer info
    await admin.from("customers").update({
      full_name: sanitizeString(body.customer_name, 200),
      phone: body.customer_phone || null,
      address_line: body.shipping_address || null,
      city: body.shipping_city || null,
      district: body.shipping_district || null,
      postal_code: body.shipping_postal_code || null,
      updated_at: new Date().toISOString(),
    }).eq("id", customerId);
  } else {
    const { data: newCustomer } = await admin
      .from("customers")
      .insert({
        store_id: body.store_id,
        email: body.customer_email,
        full_name: sanitizeString(body.customer_name, 200),
        phone: body.customer_phone || null,
        address_line: body.shipping_address || null,
        city: body.shipping_city || null,
        district: body.shipping_district || null,
        postal_code: body.shipping_postal_code || null,
      })
      .select("id")
      .single();
    customerId = newCustomer?.id || null;
  }

  // Create order
  const orderNumber = generateOrderNumber();
  const { data: order, error: orderError } = await admin
    .from("orders")
    .insert({
      store_id: body.store_id,
      customer_id: customerId,
      order_number: orderNumber,
      status: "pending",
      payment_status: body.payment_method === "cod" ? "pending" : "pending",
      payment_method: body.payment_method || "cod",
      subtotal,
      discount_amount: discountAmount,
      shipping_cost: shippingCost,
      total,
      customer_name: sanitizeString(body.customer_name, 200),
      customer_email: body.customer_email,
      customer_phone: body.customer_phone || null,
      shipping_address: body.shipping_address || null,
      shipping_city: body.shipping_city || null,
      shipping_district: body.shipping_district || null,
      shipping_postal_code: body.shipping_postal_code || null,
      coupon_code: body.coupon_code || null,
      notes: body.notes ? sanitizeString(body.notes, 500) : null,
    })
    .select()
    .single();

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 400 });
  }

  // Create order items
  const orderItems = items.map((item: CartItem) => ({
    order_id: order.id,
    product_id: item.product_id,
    product_name: item.name,
    product_slug: item.slug || null,
    product_image: item.image || null,
    quantity: item.quantity,
    unit_price: item.price,
    total_price: item.price * item.quantity,
  }));

  await admin.from("order_items").insert(orderItems);

  // Decrease stock counts (best-effort)
  for (const item of items) {
    try {
      const { data: product } = await admin
        .from("products")
        .select("stock_count")
        .eq("id", item.product_id)
        .single();
      if (product) {
        await admin
          .from("products")
          .update({ stock_count: Math.max(0, (product.stock_count || 0) - item.quantity) })
          .eq("id", item.product_id);
      }
    } catch {
      // Stock decrement is best-effort
    }
  }

  return NextResponse.json({
    success: true,
    order: {
      id: order.id,
      order_number: orderNumber,
      total,
      status: order.status,
    },
  });
}

// Track order by order number
export async function GET(request: Request) {
  const admin = getAdminClient();
  const { searchParams } = new URL(request.url);
  const orderNumber = searchParams.get("order_number");
  const email = searchParams.get("email");

  if (!orderNumber || !email) {
    return NextResponse.json({ error: "order_number ve email gerekli" }, { status: 400 });
  }

  const { data, error } = await admin
    .from("orders")
    .select("id, order_number, status, payment_status, total, shipping_cost, tracking_number, created_at, order_items(product_name, quantity, unit_price, total_price, product_image)")
    .eq("order_number", orderNumber)
    .eq("customer_email", email)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Siparis bulunamadi" }, { status: 404 });
  }

  return NextResponse.json(data);
}
