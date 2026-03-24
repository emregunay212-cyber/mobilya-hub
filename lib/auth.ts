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
}

export interface AuthResult {
  error: string;
  status: number;
}

/**
 * Hash a password with bcrypt.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Verify a password against a bcrypt hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Create a signed JWT token for an admin user.
 */
export async function createToken(user: AdminUser): Promise<string> {
  return new SignJWT({ sub: user.id, email: user.email, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

/**
 * Verify and decode a JWT token.
 */
export async function verifyToken(token: string): Promise<AdminUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: payload.sub as string,
      email: payload.email as string,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
}

/**
 * Middleware helper: require admin auth on API routes.
 * Supports both:
 * - New JWT auth (Authorization: Bearer <jwt>)
 * - Legacy ADMIN_SECRET auth (for backward compatibility during migration)
 */
export async function requireAdmin(request: Request): Promise<AuthResult | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "Yetkilendirme gerekli", status: 401 };
  }

  const token = authHeader.slice(7);

  // Try JWT verification first
  const user = await verifyToken(token);
  if (user) return null; // Auth passed via JWT

  // Fallback: legacy ADMIN_SECRET comparison (will be removed after full migration)
  const secret = process.env.ADMIN_SECRET;
  if (secret && token === secret) return null;

  return { error: "Geçersiz yetkilendirme", status: 403 };
}

/**
 * Convert auth error result to JSON response.
 */
export function authError(result: AuthResult): NextResponse {
  return NextResponse.json({ error: result.error }, { status: result.status });
}
