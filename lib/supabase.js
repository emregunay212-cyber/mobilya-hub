import { createClient } from "@supabase/supabase-js";
import { cache } from "react";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
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
