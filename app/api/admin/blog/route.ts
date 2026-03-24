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

  let query = admin.from("blog_posts").select("*").order("created_at", { ascending: false });
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

  const slug = body.slug || sanitizeString(body.title, 100)
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const { data, error } = await admin.from("blog_posts").insert({
    store_id: body.store_id,
    title: sanitizeString(body.title, 200),
    slug,
    content: body.content || null,
    excerpt: body.excerpt ? sanitizeString(body.excerpt, 300) : null,
    cover_image: body.cover_image || null,
    is_published: body.is_published ?? false,
    published_at: body.is_published ? new Date().toISOString() : null,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return authError(denied);

  const admin = getAdminClient();
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "Post ID gerekli" }, { status: 400 });

  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.title) updateData.title = sanitizeString(body.title, 200);
  if (body.content !== undefined) updateData.content = body.content;
  if (body.excerpt !== undefined) updateData.excerpt = body.excerpt;
  if (body.cover_image !== undefined) updateData.cover_image = body.cover_image;
  if (body.is_published !== undefined) {
    updateData.is_published = body.is_published;
    if (body.is_published) updateData.published_at = new Date().toISOString();
  }

  const { data, error } = await admin.from("blog_posts").update(updateData).eq("id", body.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const denied = await requireAdmin(request);
  if (denied) return authError(denied);

  const admin = getAdminClient();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Post ID gerekli" }, { status: 400 });

  const { error } = await admin.from("blog_posts").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
