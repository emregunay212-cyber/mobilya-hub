import { getAdminClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const admin = getAdminClient();
  const body = await request.json();

  if (!body.store_id || !body.email) {
    return NextResponse.json({ error: "store_id ve email gerekli" }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return NextResponse.json({ error: "Gecersiz e-posta adresi" }, { status: 400 });
  }

  const { error } = await admin.from("newsletter_subscribers").insert({
    store_id: body.store_id,
    email: body.email.toLowerCase().trim(),
  });

  if (error?.code === "23505") {
    return NextResponse.json({ message: "Zaten abone olmusunuz" });
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true, message: "Basariyla abone oldunuz!" });
}
