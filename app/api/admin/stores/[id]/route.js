import { getAdminClient } from "@/lib/supabase";
import { requireAdmin, authError } from "@/lib/auth";
import { sanitizeString } from "@/lib/validate";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const denied = await requireAdmin(request);
  if (denied) return authError(denied);

  const { id } = await params;
  const admin = getAdminClient();

  const { data, error } = await admin
    .from("stores")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: "Store not found" }, { status: 404 });
  return NextResponse.json({ store: data });
}

export async function PUT(request, { params }) {
  const denied = await requireAdmin(request);
  if (denied) return authError(denied);

  const { id } = await params;
  const admin = getAdminClient();
  const body = await request.json();

  const updateData = {};
  if (body.name) updateData.name = sanitizeString(body.name, 100);
  if (body.phone) updateData.phone = sanitizeString(body.phone, 20);
  if (body.whatsapp !== undefined) updateData.whatsapp = body.whatsapp ? sanitizeString(body.whatsapp, 15) : null;
  if (body.email !== undefined) updateData.email = body.email ? sanitizeString(body.email, 100) : null;
  if (body.address !== undefined) updateData.address = body.address ? sanitizeString(body.address, 200) : null;
  if (body.city) updateData.city = sanitizeString(body.city, 50);
  if (body.description !== undefined) updateData.description = body.description ? sanitizeString(body.description, 500) : null;
  if (body.instagram !== undefined) updateData.instagram = body.instagram ? sanitizeString(body.instagram, 50) : null;
  if (body.is_active !== undefined) updateData.is_active = Boolean(body.is_active);
  if (body.theme) updateData.settings = { theme: body.theme };
  if (body.custom_domain !== undefined) {
    const domain = body.custom_domain ? sanitizeString(body.custom_domain, 100).toLowerCase().replace(/^https?:\/\//, "").replace(/\/+$/, "") : null;
    updateData.custom_domain = domain || null;
  }

  const { data, error } = await admin
    .from("stores")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ store: data, success: true });
}

export async function DELETE(request, { params }) {
  const denied = await requireAdmin(request);
  if (denied) return authError(denied);

  const { id } = await params;
  const admin = getAdminClient();

  // Delete related data first
  await admin.from("products").delete().eq("store_id", id);
  await admin.from("categories").delete().eq("store_id", id);

  const { error } = await admin.from("stores").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
