import { getAdminClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request) {
  const admin = getAdminClient();
  const body = await request.json();

  // 1. Mağaza oluştur
  const { data: store, error: storeErr } = await admin
    .from("stores")
    .insert({
      name: body.name,
      slug: body.slug,
      phone: body.phone,
      whatsapp: body.whatsapp || null,
      email: body.email || null,
      address: body.address || null,
      city: body.city || "Balıkesir",
      description: body.description || null,
      instagram: body.instagram || null,
      settings: { theme: body.theme },
    })
    .select()
    .single();

  if (storeErr) {
    return NextResponse.json({ error: storeErr.message }, { status: 400 });
  }

  // 2. Kategorileri oluştur
  if (body.categories && body.categories.length > 0) {
    const catRows = body.categories.map((cat, i) => ({
      store_id: store.id,
      name: cat.name,
      slug: cat.slug,
      sort_order: i + 1,
    }));

    const { error: catErr } = await admin.from("categories").insert(catRows);
    if (catErr) {
      return NextResponse.json({ error: catErr.message, store }, { status: 400 });
    }
  }

  return NextResponse.json({ store, success: true });
}

// Mağaza listesi
export async function GET() {
  const admin = getAdminClient();
  const { data, error } = await admin
    .from("stores")
    .select("*, categories(count), products(count)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
