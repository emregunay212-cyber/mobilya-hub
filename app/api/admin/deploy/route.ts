import { NextResponse } from "next/server";
import { requireAdmin, authError } from "@/lib/auth";
import { checkRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";
import { deployStore } from "@/lib/deploy";

export async function POST(request: Request) {
  // Auth check
  const auth = await requireAdmin(request);
  if (auth) return authError(auth);

  // Rate limit
  const ip = getClientIp(request);
  const rateLimited = checkRateLimit(`deploy:${ip}`, RATE_LIMITS.deploy);
  if (rateLimited) {
    return NextResponse.json(
      { error: rateLimited.error },
      { status: 429, headers: { "Retry-After": String(rateLimited.retryAfterSeconds) } }
    );
  }

  try {
    const body = await request.json();
    const { store_id } = body;

    if (!store_id) {
      return NextResponse.json({ error: "store_id gerekli" }, { status: 400 });
    }

    const result = await deployStore(store_id);

    return NextResponse.json({
      success: true,
      deploymentId: result.deploymentId,
      message: "Deployment başlatıldı",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Deploy hatası" },
      { status: 500 }
    );
  }
}
