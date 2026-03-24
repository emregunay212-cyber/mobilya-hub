import { getAdminClient } from "@/lib/supabase";
import { sanitizeString } from "@/lib/validate";
import { NextResponse } from "next/server";

// Get approved reviews for a product
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("product_id");
  if (!productId) return NextResponse.json({ error: "product_id gerekli" }, { status: 400 });

  const admin = getAdminClient();
  const { data, error } = await admin
    .from("reviews")
    .select("id, customer_name, rating, comment, created_at")
    .eq("product_id", productId)
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    // Table may not exist yet
    if (error.message?.includes("reviews")) {
      return NextResponse.json({ reviews: [], avgRating: 0, total: 0 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Calculate average
  const reviews = data || [];
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return NextResponse.json({ reviews, avgRating: Math.round(avgRating * 10) / 10, total: reviews.length });
}

// Submit a review
export async function POST(request: Request) {
  const admin = getAdminClient();
  const body = await request.json();

  if (!body.store_id || !body.product_id || !body.customer_name || !body.rating) {
    return NextResponse.json({ error: "store_id, product_id, customer_name ve rating gerekli" }, { status: 400 });
  }

  const rating = Number(body.rating);
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating 1-5 arasi olmali" }, { status: 400 });
  }

  const { data, error } = await admin.from("reviews").insert({
    store_id: body.store_id,
    product_id: body.product_id,
    customer_id: body.customer_id || null,
    customer_name: sanitizeString(body.customer_name, 100),
    rating,
    comment: body.comment ? sanitizeString(body.comment, 500) : null,
    is_approved: false, // Requires admin approval
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true, review: data, message: "Yorumunuz onay bekliyor" });
}
