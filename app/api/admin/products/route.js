import { getAdminClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request) {
  const admin = getAdminClient();
  const body = await request.json();

  const { data, error } = await admin
    .from("products")
    .insert({
      store_id: body.store_id,
      category_id: body.category_id || null,
      name: body.name,
      slug: body.slug,
      description: body.description || null,
      price: body.price,
      old_price: body.old_price || null,
      badge: body.badge || null,
      in_stock: body.in_stock ?? true,
      stock_count: body.stock_count || 0,
      images: body.images || [],
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ product: data, success: true });
}

export async function GET(request) {
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
  const admin = getAdminClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  const { error } = await admin.from("products").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
