import { getAdminClient } from "@/lib/supabase";
import { requireAdmin, authError } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return authError(denied);

  const admin = getAdminClient();
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get("store_id");
  const search = searchParams.get("search");

  // Query customers table directly (works with existing DB schema)
  let query = admin
    .from("customers")
    .select("id, full_name, email, phone, city, created_at")
    .order("created_at", { ascending: false });

  if (storeId) query = query.eq("store_id", storeId);

  const { data: customers, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Fetch order stats per customer email
  const customerEmails = (customers || []).map((c) => c.email).filter(Boolean);
  let orderStats: Record<string, { count: number; total: number; last: string }> = {};

  if (customerEmails.length > 0) {
    const { data: orders } = await admin
      .from("orders")
      .select("customer_email, total, created_at")
      .in("customer_email", customerEmails);

    if (orders) {
      for (const o of orders) {
        const email = o.customer_email;
        if (!orderStats[email]) {
          orderStats[email] = { count: 0, total: 0, last: o.created_at };
        }
        orderStats[email].count++;
        orderStats[email].total += Number(o.total) || 0;
        if (o.created_at > orderStats[email].last) {
          orderStats[email].last = o.created_at;
        }
      }
    }
  }

  let result = (customers || []).map((c) => {
    const stats = orderStats[c.email] || { count: 0, total: 0, last: null };
    return {
      email: c.email || "",
      name: c.full_name || "",
      phone: c.phone || "",
      city: c.city || "",
      order_count: stats.count,
      total_spent: stats.total,
      last_order: stats.last || c.created_at,
    };
  });

  // Search filter
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q))
    );
  }

  return NextResponse.json({ customers: result, total: result.length });
}
