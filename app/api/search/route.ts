import { getAdminClient } from "@/lib/supabase";
import { sanitizeString } from "@/lib/validate";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const storeId = searchParams.get("store_id");
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);

  if (!query || !storeId) {
    return NextResponse.json({ error: "q ve store_id gerekli" }, { status: 400 });
  }

  const cleanQuery = sanitizeString(query, 100);
  const admin = getAdminClient();

  // Search products by name and description using ilike
  const { data, error } = await admin
    .from("products")
    .select("id, name, slug, price, old_price, images, in_stock, categories(name, slug)")
    .eq("store_id", storeId)
    .eq("is_active", true)
    .or(`name.ilike.%${cleanQuery}%,description.ilike.%${cleanQuery}%`)
    .order("sort_order")
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ results: data || [], query: cleanQuery });
}
