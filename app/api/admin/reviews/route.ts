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
  const approved = searchParams.get("approved");

  let query = admin.from("reviews").select("*, products(name)").order("created_at", { ascending: false });
  if (storeId) query = query.eq("store_id", storeId);
  if (approved === "true") query = query.eq("is_approved", true);
  if (approved === "false") query = query.eq("is_approved", false);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ reviews: data || [], success: true });
}

export async function PUT(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return authError(denied);

  const admin = getAdminClient();
  const body = await request.json();

  if (!body.id) return NextResponse.json({ error: "Review ID gerekli" }, { status: 400 });

  const updateData: Record<string, unknown> = {};
  if (body.is_approved !== undefined) updateData.is_approved = body.is_approved;

  const { error } = await admin.from("reviews").update(updateData).eq("id", body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return authError(denied);

  const admin = getAdminClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Review ID gerekli" }, { status: 400 });

  const { error } = await admin.from("reviews").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
