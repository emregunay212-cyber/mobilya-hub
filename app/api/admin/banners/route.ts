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

  let query = admin.from("banners").select("*").order("sort_order");
  if (storeId) query = query.eq("store_id", storeId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return authError(denied);

  const admin = getAdminClient();
  const body = await request.json();

  if (!body.store_id || !body.title) {
    return NextResponse.json({ error: "store_id ve title gerekli" }, { status: 400 });
  }

  const { data, error } = await admin.from("banners").insert({
    store_id: body.store_id,
    title: sanitizeString(body.title, 200),
    subtitle: body.subtitle ? sanitizeString(body.subtitle, 300) : null,
    image_url: body.image_url || null,
    link_url: body.link_url || null,
    sort_order: body.sort_order ?? 0,
    is_active: body.is_active ?? true,
    expires_at: body.expires_at || null,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return authError(denied);

  const admin = getAdminClient();
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "Banner ID gerekli" }, { status: 400 });

  const updateData: Record<string, unknown> = {};
  if (body.title) updateData.title = sanitizeString(body.title, 200);
  if (body.subtitle !== undefined) updateData.subtitle = body.subtitle;
  if (body.image_url !== undefined) updateData.image_url = body.image_url;
  if (body.link_url !== undefined) updateData.link_url = body.link_url;
  if (body.sort_order != null) updateData.sort_order = body.sort_order;
  if (body.is_active !== undefined) updateData.is_active = body.is_active;
  if (body.expires_at !== undefined) updateData.expires_at = body.expires_at;

  const { data, error } = await admin.from("banners").update(updateData).eq("id", body.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return authError(denied);

  const admin = getAdminClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Banner ID gerekli" }, { status: 400 });

  const { error } = await admin.from("banners").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
