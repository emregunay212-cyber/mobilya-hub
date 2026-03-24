import { getAdminClient } from "@/lib/supabase";
import { requireAdmin, authError } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin(request);
  if (denied) return authError(denied);

  const { id } = await params;
  const admin = getAdminClient();

  const { data, error } = await admin
    .from("stores")
    .select("id, name, slug, phone, email, whatsapp, city, address, logo_url, social_links, working_hours, shipping_config, settings")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin(request);
  if (denied) return authError(denied);

  const { id } = await params;
  const admin = getAdminClient();
  const body = await request.json();

  const updateData: Record<string, unknown> = {};

  // Basic fields
  const basicFields = ["name", "phone", "email", "whatsapp", "city", "address", "logo_url"];
  for (const field of basicFields) {
    if (body[field] !== undefined) updateData[field] = body[field];
  }

  // JSON fields
  if (body.social_links !== undefined) updateData.social_links = body.social_links;
  if (body.working_hours !== undefined) updateData.working_hours = body.working_hours;
  if (body.shipping_config !== undefined) updateData.shipping_config = body.shipping_config;

  // Settings merge
  if (body.settings) {
    const { data: current } = await admin.from("stores").select("settings").eq("id", id).single();
    updateData.settings = { ...(current?.settings || {}), ...body.settings };
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
