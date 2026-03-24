import { getAdminClient } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { verifyCustomerToken } from "@/lib/customer-auth";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });
  }
  const user = await verifyCustomerToken(authHeader.slice(7));
  if (!user) return NextResponse.json({ error: "Gecersiz token" }, { status: 401 });

  const admin = getAdminClient();
  const { data, error } = await admin
    .from("favorites")
    .select("*, products(id, name, slug, price, old_price, images, in_stock, categories(name))")
    .eq("customer_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });
  }
  const user = await verifyCustomerToken(authHeader.slice(7));
  if (!user) return NextResponse.json({ error: "Gecersiz token" }, { status: 401 });

  const { product_id } = await request.json();
  if (!product_id) return NextResponse.json({ error: "product_id gerekli" }, { status: 400 });

  const admin = getAdminClient();
  const { error } = await admin.from("favorites").insert({
    customer_id: user.id,
    product_id,
  });

  if (error?.code === "23505") {
    return NextResponse.json({ message: "Zaten favorilerde" });
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Yetkilendirme gerekli" }, { status: 401 });
  }
  const user = await verifyCustomerToken(authHeader.slice(7));
  if (!user) return NextResponse.json({ error: "Gecersiz token" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("product_id");
  if (!productId) return NextResponse.json({ error: "product_id gerekli" }, { status: 400 });

  const admin = getAdminClient();
  await admin.from("favorites").delete().eq("customer_id", user.id).eq("product_id", productId);
  return NextResponse.json({ success: true });
}
