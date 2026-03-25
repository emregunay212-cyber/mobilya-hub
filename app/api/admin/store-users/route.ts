import { getAdminClient } from "@/lib/supabase";
import { requireSuperAdmin, authError, hashPassword } from "@/lib/auth";
import { NextResponse } from "next/server";

// GET - Get store owner for a store
export async function GET(request: Request) {
  const denied = await requireSuperAdmin(request);
  if (denied) return authError(denied);

  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get("store_id");
  if (!storeId) return NextResponse.json({ error: "store_id gerekli" }, { status: 400 });

  const admin = getAdminClient();
  const { data: store } = await admin
    .from("stores")
    .select("owner_id")
    .eq("id", storeId)
    .single();

  if (!store?.owner_id) {
    return NextResponse.json({ owner: null });
  }

  const { data: owner } = await admin
    .from("admin_users")
    .select("id, email, full_name, is_active, last_login_at")
    .eq("id", store.owner_id)
    .single();

  return NextResponse.json({ owner });
}

// POST - Create store owner
export async function POST(request: Request) {
  const denied = await requireSuperAdmin(request);
  if (denied) return authError(denied);

  const body = await request.json();
  const { store_id, email, password, full_name } = body;

  if (!store_id || !email || !password) {
    return NextResponse.json({ error: "store_id, email ve sifre gerekli" }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "Sifre en az 6 karakter olmali" }, { status: 400 });
  }

  const admin = getAdminClient();

  // Check if email already exists
  const { data: existing } = await admin
    .from("admin_users")
    .select("id")
    .eq("email", email.toLowerCase().trim())
    .single();

  if (existing) {
    return NextResponse.json({ error: "Bu email zaten kullaniliyor" }, { status: 400 });
  }

  // Create the store_owner user
  const passwordHash = await hashPassword(password);
  const { data: newUser, error: userErr } = await admin
    .from("admin_users")
    .insert({
      email: email.toLowerCase().trim(),
      password_hash: passwordHash,
      full_name: full_name || null,
      role: "store_owner",
      is_active: true,
    })
    .select("id, email, full_name")
    .single();

  if (userErr) {
    return NextResponse.json({ error: userErr.message }, { status: 400 });
  }

  // Link store to owner
  const { error: storeErr } = await admin
    .from("stores")
    .update({ owner_id: newUser.id })
    .eq("id", store_id);

  if (storeErr) {
    return NextResponse.json({ error: storeErr.message }, { status: 400 });
  }

  return NextResponse.json({ owner: newUser, success: true });
}

// DELETE - Remove store owner
export async function DELETE(request: Request) {
  const denied = await requireSuperAdmin(request);
  if (denied) return authError(denied);

  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get("store_id");
  if (!storeId) return NextResponse.json({ error: "store_id gerekli" }, { status: 400 });

  const admin = getAdminClient();

  // Get current owner
  const { data: store } = await admin
    .from("stores")
    .select("owner_id")
    .eq("id", storeId)
    .single();

  if (store?.owner_id) {
    // Remove owner link
    await admin.from("stores").update({ owner_id: null }).eq("id", storeId);
    // Deactivate the user
    await admin.from("admin_users").update({ is_active: false }).eq("id", store.owner_id);
  }

  return NextResponse.json({ success: true });
}

// PUT - Reset password for store owner
export async function PUT(request: Request) {
  const denied = await requireSuperAdmin(request);
  if (denied) return authError(denied);

  const body = await request.json();
  const { store_id, new_password } = body;

  if (!store_id || !new_password) {
    return NextResponse.json({ error: "store_id ve new_password gerekli" }, { status: 400 });
  }

  if (new_password.length < 6) {
    return NextResponse.json({ error: "Sifre en az 6 karakter olmali" }, { status: 400 });
  }

  const admin = getAdminClient();
  const { data: store } = await admin
    .from("stores")
    .select("owner_id")
    .eq("id", store_id)
    .single();

  if (!store?.owner_id) {
    return NextResponse.json({ error: "Bu magazanin yoneticisi yok" }, { status: 404 });
  }

  const passwordHash = await hashPassword(new_password);
  await admin
    .from("admin_users")
    .update({ password_hash: passwordHash })
    .eq("id", store.owner_id);

  return NextResponse.json({ success: true });
}
