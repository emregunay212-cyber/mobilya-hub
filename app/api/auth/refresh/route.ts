import { NextResponse } from "next/server";
import { verifyToken, createToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Token gerekli" },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.json(
        { error: "Geçersiz veya süresi dolmuş token" },
        { status: 401 }
      );
    }

    // Issue a fresh token
    const newToken = await createToken(user);

    return NextResponse.json({ token: newToken, user });
  } catch {
    return NextResponse.json(
      { error: "Sunucu hatası" },
      { status: 500 }
    );
  }
}
