import { getAdminClient } from "@/lib/supabase";
import { requireAdmin, authError, getAuthUser, getAccessibleStoreId, canAccessStore } from "@/lib/auth";
import { sanitizeString } from "@/lib/validate";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return authError(denied);

  const user = await getAuthUser(request);
  const admin = getAdminClient();
  const { searchParams } = new URL(request.url);
  const storeId = getAccessibleStoreId(user, searchParams.get("store_id"));

  let query = admin.from("categories").select("*").order("sort_order");
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

  if (!body.store_id || !body.name) {
    return NextResponse.json({ error: "store_id ve name gerekli" }, { status: 400 });
  }

  const slug = body.slug || sanitizeString(body.name, 100)
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const { data, error } = await admin
    .from("categories")
    .insert({
      store_id: body.store_id,
      name: sanitizeString(body.name, 100),
      slug,
      icon: body.icon || null,
      sort_order: body.sort_order ?? 0,
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
    return NextResponse.json({ error: "Kategori ID gerekli" }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};
  if (body.name) updateData.name = sanitizeString(body.name, 100);
  if (body.slug) updateData.slug = body.slug;
  if (body.icon !== undefined) updateData.icon = body.icon;
  if (body.sort_order != null) updateData.sort_order = Number(body.sort_order);

  const { data, error } = await admin
    .from("categories")
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

  if (!id || id.length < 10) {
    return NextResponse.json({ error: "Gecerli bir kategori ID gerekli" }, { status: 400 });
  }

  const { error } = await admin.from("categories").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
