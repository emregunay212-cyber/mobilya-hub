import { getAdminClient } from "@/lib/supabase";
import { requireAdmin, authError } from "@/lib/auth";
import { validateStore, sanitizeString } from "@/lib/validate";
import { NextResponse } from "next/server";

export async function POST(request) {
  const denied = await requireAdmin(request);
  if (denied) return authError(denied);

  const admin = getAdminClient();
  const body = await request.json();

  // Validate
  const errors = validateStore(body);
  if (errors) {
    return NextResponse.json({ error: errors.join(", ") }, { status: 400 });
  }

  // Sanitize
  const storeData = {
    name: sanitizeString(body.name, 100),
    slug: body.slug.toLowerCase().trim(),
    phone: sanitizeString(body.phone, 20),
    whatsapp: body.whatsapp ? sanitizeString(body.whatsapp, 15) : null,
    email: body.email ? sanitizeString(body.email, 100) : null,
    address: body.address ? sanitizeString(body.address, 200) : null,
    city: sanitizeString(body.city || "Balıkesir", 50),
    description: body.description ? sanitizeString(body.description, 500) : null,
    instagram: body.instagram ? sanitizeString(body.instagram, 50) : null,
    settings: { theme: body.theme || "classic-warm", sector: body.sector || "mobilyaci" },
    sector_id: body.sector_id || null,
    payment_enabled: body.payment_enabled || false,
  };

  // 1. Create store
  const { data: store, error: storeErr } = await admin
    .from("stores")
    .insert(storeData)
    .select()
    .single();

  if (storeErr) {
    return NextResponse.json({ error: storeErr.message }, { status: 400 });
  }

  // 2. Create categories
  if (body.categories && body.categories.length > 0) {
    const catRows = body.categories.slice(0, 20).map((cat, i) => ({
      store_id: store.id,
      name: sanitizeString(cat.name, 50),
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

export async function GET(request) {
  const denied = await requireAdmin(request);
  if (denied) return authError(denied);

  const admin = getAdminClient();
  const { data, error } = await admin
    .from("stores")
    .select("*, categories(count), products(count)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
