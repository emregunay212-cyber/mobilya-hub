import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "slug gerekli" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("stores")
    .select("id, name, slug, phone, email, whatsapp, city, address, logo_url, social_links, working_hours, settings, is_active")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Magaza bulunamadi" }, { status: 404 });
  }

  return NextResponse.json(data);
}
