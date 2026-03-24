import { getAdminClient } from "@/lib/supabase";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { verifyCustomerToken } from "@/lib/customer-auth";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "change-me-in-production"
);

async function createCustomerToken(customer: { id: string; email: string; store_id: string }) {
  return new SignJWT({ sub: customer.id, email: customer.email, store_id: customer.store_id, type: "customer" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

// Register
export async function POST(request: Request) {
  const admin = getAdminClient();
  const body = await request.json();
  const { action } = body;

  if (action === "register") {
    if (!body.store_id || !body.email || !body.password || !body.full_name) {
      return NextResponse.json({ error: "Tum alanlar gerekli" }, { status: 400 });
    }
    if (body.password.length < 6) {
      return NextResponse.json({ error: "Sifre en az 6 karakter olmali" }, { status: 400 });
    }

    // Check existing
    const { data: existing } = await admin
      .from("customers")
      .select("id")
      .eq("store_id", body.store_id)
      .eq("email", body.email)
      .single();

    if (existing) {
      // Check if already has password (registered)
      const { data: withPw } = await admin
        .from("customers")
        .select("password_hash")
        .eq("id", existing.id)
        .single();

      if (withPw?.password_hash) {
        return NextResponse.json({ error: "Bu e-posta zaten kayitli" }, { status: 400 });
      }
      // Update existing customer with password
      const hash = await bcrypt.hash(body.password, 12);
      await admin.from("customers").update({
        password_hash: hash,
        full_name: body.full_name,
        phone: body.phone || null,
      }).eq("id", existing.id);

      const token = await createCustomerToken({ id: existing.id, email: body.email, store_id: body.store_id });
      return NextResponse.json({ token, customer: { id: existing.id, email: body.email, name: body.full_name } });
    }

    // Create new customer
    const hash = await bcrypt.hash(body.password, 12);
    const { data: customer, error } = await admin.from("customers").insert({
      store_id: body.store_id,
      email: body.email,
      full_name: body.full_name,
      phone: body.phone || null,
      password_hash: hash,
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const token = await createCustomerToken({ id: customer.id, email: body.email, store_id: body.store_id });
    return NextResponse.json({ token, customer: { id: customer.id, email: body.email, name: body.full_name } });
  }

  if (action === "login") {
    if (!body.store_id || !body.email || !body.password) {
      return NextResponse.json({ error: "Email ve sifre gerekli" }, { status: 400 });
    }

    const { data: customer } = await admin
      .from("customers")
      .select("*")
      .eq("store_id", body.store_id)
      .eq("email", body.email)
      .single();

    if (!customer || !customer.password_hash) {
      return NextResponse.json({ error: "Gecersiz email veya sifre" }, { status: 401 });
    }

    const valid = await bcrypt.compare(body.password, customer.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Gecersiz email veya sifre" }, { status: 401 });
    }

    await admin.from("customers").update({ last_login_at: new Date().toISOString() }).eq("id", customer.id);

    const token = await createCustomerToken({ id: customer.id, email: customer.email, store_id: body.store_id });
    return NextResponse.json({
      token,
      customer: { id: customer.id, email: customer.email, name: customer.full_name, phone: customer.phone },
    });
  }

  if (action === "profile") {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });
    }
    const user = await verifyCustomerToken(authHeader.slice(7));
    if (!user) return NextResponse.json({ error: "Gecersiz token" }, { status: 401 });

    const { data: customer } = await admin
      .from("customers")
      .select("id, email, full_name, phone, address_line, city, district, postal_code")
      .eq("id", user.id)
      .single();

    if (!customer) return NextResponse.json({ error: "Musteri bulunamadi" }, { status: 404 });

    // Get orders
    const { data: orders } = await admin
      .from("orders")
      .select("id, order_number, status, payment_status, total, created_at")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    return NextResponse.json({ customer, orders: orders || [] });
  }

  return NextResponse.json({ error: "Gecersiz action" }, { status: 400 });
}
