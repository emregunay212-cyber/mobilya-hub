import { getAdminClient } from "@/lib/supabase";
import { requireAdmin, authError, getAuthUser, getAccessibleStoreId } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return authError(denied);

  const user = await getAuthUser(request);
  const admin = getAdminClient();
  const { searchParams } = new URL(request.url);
  const storeId = getAccessibleStoreId(user, searchParams.get("store_id"));
  const status = searchParams.get("status");
  const limit = Math.min(Number(searchParams.get("limit")) || 50, 200);
  const offset = Number(searchParams.get("offset")) || 0;

  let query = admin
    .from("orders")
    .select("*, order_items(*)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (storeId) query = query.eq("store_id", storeId);
  if (status) query = query.eq("status", status);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ orders: data, total: count });
}

export async function PUT(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return authError(denied);

  const admin = getAdminClient();
  const body = await request.json();

  if (!body.id) {
    return NextResponse.json({ error: "Siparis ID gerekli" }, { status: 400 });
  }

  const allowed = ["status", "payment_status", "tracking_number", "notes"];
  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };

  for (const key of allowed) {
    if (body[key] !== undefined) updateData[key] = body[key];
  }

  const { data, error } = await admin
    .from("orders")
    .update(updateData)
    .eq("id", body.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ order: data, success: true });
}
