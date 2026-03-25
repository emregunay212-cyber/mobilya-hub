import { createClient } from "@supabase/supabase-js";
import { cache } from "react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function getAdminClient() {
  return createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder"
  );
}

// Deduplicated per request via React cache — layout + page share the same result
export const getStore = cache(async (slug) => {
  const { data } = await supabase.from("stores").select("*").eq("slug", slug).eq("is_active", true).single();
  return data;
});

export async function getCategories(storeId) {
  const { data } = await supabase.from("categories").select("*").eq("store_id", storeId).order("sort_order");
  return data || [];
}

export async function getProducts(storeId, categorySlug = null) {
  let query = supabase.from("products").select("*, categories(name, slug)").eq("store_id", storeId).eq("is_active", true).order("sort_order");
  if (categorySlug) {
    const { data: cat } = await supabase.from("categories").select("id").eq("store_id", storeId).eq("slug", categorySlug).single();
    if (cat) query = query.eq("category_id", cat.id);
  }
  const { data } = await query;
  return data || [];
}

export async function getProduct(storeId, productSlug) {
  const { data } = await supabase.from("products").select("*, categories(name, slug)").eq("store_id", storeId).eq("slug", productSlug).single();
  return data || null;
}

export async function getRelatedProducts(storeId, categoryId, excludeProductId, limit = 4) {
  let query = supabase
    .from("products")
    .select("*, categories(name, slug)")
    .eq("store_id", storeId)
    .eq("is_active", true)
    .neq("id", excludeProductId)
    .order("sort_order")
    .limit(limit);

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data } = await query;
  return data || [];
}

export async function getProductReviews(productId) {
  const { data } = await supabase
    .from("reviews")
    .select("customer_name, rating, comment, created_at")
    .eq("product_id", productId)
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(20);
  return data || [];
}
