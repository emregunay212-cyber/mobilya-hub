import { getAdminClient } from "@/lib/supabase";
import { requireAdmin, authError } from "@/lib/auth";
import { sanitizeString } from "@/lib/validate";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return authError(denied);

  const admin = getAdminClient();
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get("store_id");

  let query = admin.from("coupons").select("*").order("created_at", { ascending: false });
  if (storeId) query = query.eq("store_id", storeId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return authError(denied);

  const admin = getAdminClient();
  const body = await request.json();

  if (!body.store_id || !body.code || !body.discount_value) {
    return NextResponse.json({ error: "store_id, code ve discount_value gerekli" }, { status: 400 });
  }

  const { data, error } = await admin
    .from("coupons")
    .insert({
      store_id: body.store_id,
      code: sanitizeString(body.code, 30).toUpperCase(),
      discount_type: body.discount_type || "percentage",
      discount_value: Number(body.discount_value),
      min_order_amount: Number(body.min_order_amount) || 0,
      max_uses: Number(body.max_uses) || 0,
      is_active: body.is_active ?? true,
      expires_at: body.expires_at || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return authError(denied);

  const admin = getAdminClient();
  const body = await request.json();

  if (!body.id) {
    return NextResponse.json({ error: "Kupon ID gerekli" }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};
  if (body.code) updateData.code = sanitizeString(body.code, 30).toUpperCase();
  if (body.discount_type) updateData.discount_type = body.discount_type;
  if (body.discount_value != null) updateData.discount_value = Number(body.discount_value);
  if (body.min_order_amount != null) updateData.min_order_amount = Number(body.min_order_amount);
  if (body.max_uses != null) updateData.max_uses = Number(body.max_uses);
  if (body.is_active !== undefined) updateData.is_active = body.is_active;
  if (body.expires_at !== undefined) updateData.expires_at = body.expires_at;

  const { data, error } = await admin
    .from("coupons")
    .update(updateData)
    .eq("id", body.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return authError(denied);

  const admin = getAdminClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "Kupon ID gerekli" }, { status: 400 });

  const { error } = await admin.from("coupons").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
