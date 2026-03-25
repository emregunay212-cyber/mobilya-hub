import { NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || process.env.ADMIN_SECRET || "change-me-in-production"
);
const TOKEN_EXPIRY = "24h";

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  store_id?: string;
}

export interface AuthResult {
  error: string;
  status: number;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createToken(user: AdminUser): Promise<string> {
  const payload: Record<string, unknown> = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };
  if (user.store_id) payload.store_id = user.store_id;

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<AdminUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: payload.sub as string,
      email: payload.email as string,
      role: payload.role as string,
      store_id: (payload.store_id as string) || undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Middleware: require admin auth. Returns null if ok, AuthResult if denied.
 */
export async function requireAdmin(request: Request): Promise<AuthResult | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "Yetkilendirme gerekli", status: 401 };
  }

  const token = authHeader.slice(7);
  const user = await verifyToken(token);
  if (user) return null;

  const secret = process.env.ADMIN_SECRET;
  if (secret && token === secret) return null;

  return { error: "Geçersiz yetkilendirme", status: 403 };
}

/**
 * Get the authenticated user from request. Returns null if not authenticated.
 */
export async function getAuthUser(request: Request): Promise<AdminUser | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return verifyToken(authHeader.slice(7));
}

/**
 * Check if user can access a specific store.
 * superadmin/admin → can access any store
 * store_owner → can only access their own store
 */
export function canAccessStore(user: AdminUser | null, storeId: string): boolean {
  if (!user) return false;
  if (user.role === "superadmin" || user.role === "admin") return true;
  if (user.role === "store_owner") return user.store_id === storeId;
  return false;
}

/**
 * Get the store_id this user is allowed to access.
 * superadmin → returns the requested storeId (or null for all)
 * store_owner → always returns their own store_id
 */
export function getAccessibleStoreId(user: AdminUser | null, requestedStoreId?: string | null): string | null {
  if (!user) return null;
  if (user.role === "store_owner") return user.store_id || null;
  return requestedStoreId || null;
}

/**
 * Require superadmin role. Returns AuthResult if denied.
 */
export async function requireSuperAdmin(request: Request): Promise<AuthResult | null> {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const user = await getAuthUser(request);
  if (!user || (user.role !== "superadmin" && user.role !== "admin")) {
    return { error: "Bu islem icin yetkiniz yok", status: 403 };
  }
  return null;
}

export function authError(result: AuthResult): NextResponse {
  return NextResponse.json({ error: result.error }, { status: result.status });
}
