import { NextResponse } from "next/server";
import { verifyPassword, createToken, hashPassword } from "@/lib/auth";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { getAdminClient } from "@/lib/supabase";

export async function POST(request: Request) {
  // Rate limit check
  const ip = getClientIp(request);
  const rateLimited = checkRateLimit(`login:${ip}`, RATE_LIMITS.login);
  if (rateLimited) {
    return NextResponse.json(
      { error: rateLimited.error },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimited.retryAfterSeconds) },
      }
    );
  }

  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email ve şifre gerekli" },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

    // Check if admin_users table exists and has entries
    const { data: adminUser, error } = await supabase
      .from("admin_users")
      .select("*")
      .eq("email", email.toLowerCase().trim())
      .eq("is_active", true)
      .single();

    if (error || !adminUser) {
      // Fallback: legacy ADMIN_SECRET auth during migration period
      const secret = process.env.ADMIN_SECRET;
      if (secret && password === secret) {
        // Create a temporary token for legacy auth
        const token = await createToken({
          id: "legacy-admin",
          email: email || "admin@webkoda.com",
          role: "superadmin",
        });
        return NextResponse.json({ token, user: { email, role: "superadmin" } });
      }
      return NextResponse.json(
        { error: "Geçersiz email veya şifre" },
        { status: 401 }
      );
    }

    // Verify password
    const valid = await verifyPassword(password, adminUser.password_hash);
    if (!valid) {
      return NextResponse.json(
        { error: "Geçersiz email veya şifre" },
        { status: 401 }
      );
    }

    // Update last login
    await supabase
      .from("admin_users")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", adminUser.id);

    // For store_owner, find their store
    let storeId: string | undefined;
    let storeName: string | undefined;
    if (adminUser.role === "store_owner") {
      const { data: store } = await supabase
        .from("stores")
        .select("id, name")
        .eq("owner_id", adminUser.id)
        .single();
      storeId = store?.id;
      storeName = store?.name;
    }

    // Create JWT
    const token = await createToken({
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
      store_id: storeId,
    });

    return NextResponse.json({
      token,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        full_name: adminUser.full_name,
        store_id: storeId,
        store_name: storeName,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
