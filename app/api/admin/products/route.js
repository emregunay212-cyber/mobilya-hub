import { getAdminClient } from "@/lib/supabase";
import { requireAdmin, authError } from "@/lib/auth";
import { validateProduct, sanitizeString } from "@/lib/validate";
import { NextResponse } from "next/server";

export async function POST(request) {
  const denied = requireAdmin(request);
  if (denied) return authError(denied);

  const admin = getAdminClient();
  const body = await request.json();

  // Validate
  const errors = validateProduct(body);
  if (errors) {
    return NextResponse.json({ error: errors.join(", ") }, { status: 400 });
  }

  const productData = {
    store_id: body.store_id,
    category_id: body.category_id || null,
    name: sanitizeString(body.name, 200),
    slug: body.slug.toLowerCase().trim(),
    description: body.description ? sanitizeString(body.description, 1000) : null,
    price: Number(body.price),
    old_price: body.old_price ? Number(body.old_price) : null,
    badge: body.badge ? sanitizeString(body.badge, 30) : null,
    in_stock: body.in_stock ?? true,
    stock_count: body.stock_count ? Number(body.stock_count) : 0,
    images: Array.isArray(body.images) ? body.images.slice(0, 10) : [],
  };

  const { data, error } = await admin
    .from("products")
    .insert(productData)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ product: data, success: true });
}

export async function PUT(request) {
  const denied = requireAdmin(request);
  if (denied) return authError(denied);

  const admin = getAdminClient();
  const body = await request.json();

  if (!body.id) {
    return NextResponse.json({ error: "Ürün ID gerekli" }, { status: 400 });
  }

  const updateData = {};
  if (body.name) updateData.name = sanitizeString(body.name, 200);
  if (body.slug) updateData.slug = body.slug.toLowerCase().trim();
  if (body.description !== undefined) updateData.description = sanitizeString(body.description, 1000);
  if (body.price != null) updateData.price = Number(body.price);
  if (body.old_price !== undefined) updateData.old_price = body.old_price ? Number(body.old_price) : null;
  if (body.badge !== undefined) updateData.badge = body.badge || null;
  if (body.in_stock !== undefined) updateData.in_stock = body.in_stock;
  if (body.stock_count != null) updateData.stock_count = Number(body.stock_count);
  if (body.category_id !== undefined) updateData.category_id = body.category_id || null;
  if (body.images !== undefined) updateData.images = Array.isArray(body.images) ? body.images.slice(0, 10) : [];
  if (body.sort_order != null) updateData.sort_order = Number(body.sort_order);

  const { data, error } = await admin
    .from("products")
    .update(updateData)
    .eq("id", body.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ product: data, success: true });
}

export async function GET(request) {
  const denied = requireAdmin(request);
  if (denied) return authError(denied);

  const admin = getAdminClient();
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get("store_id");

  let query = admin.from("products").select("*, categories(name, slug)").order("sort_order");
  if (storeId) query = query.eq("store_id", storeId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(request) {
  const denied = requireAdmin(request);
  if (denied) return authError(denied);

  const admin = getAdminClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id || typeof id !== "string" || id.length < 10) {
    return NextResponse.json({ error: "Geçerli bir ürün ID gerekli" }, { status: 400 });
  }

  const { error } = await admin.from("products").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
