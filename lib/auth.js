import { NextResponse } from "next/server";

/**
 * Admin API authentication.
 * Checks Authorization: Bearer <ADMIN_SECRET> header.
 * Set ADMIN_SECRET in your .env file.
 */
export function requireAdmin(request) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    return { error: "ADMIN_SECRET is not configured", status: 500 };
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "Yetkilendirme gerekli", status: 401 };
  }

  const token = authHeader.slice(7);
  if (token !== secret) {
    return { error: "Geçersiz yetkilendirme", status: 403 };
  }

  return null; // Auth passed
}

export function authError(result) {
  return NextResponse.json({ error: result.error }, { status: result.status });
}
