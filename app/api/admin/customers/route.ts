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

  let result = (customers || []).map((c) => ({
    email: c.email || "",
    name: c.full_name || "",
    phone: c.phone || "",
    city: c.city || "",
    order_count: 0,
    total_spent: 0,
    last_order: c.created_at,
  }));

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
