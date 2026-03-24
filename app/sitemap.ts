import { getAdminClient } from "@/lib/supabase";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = getAdminClient();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mobilyahub.com";

  const entries: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
  ];

  // Active stores
  const { data: stores } = await supabase
    .from("stores")
    .select("slug, updated_at")
    .eq("is_active", true);

  if (stores) {
    for (const store of stores) {
      entries.push({
        url: `${baseUrl}/${store.slug}`,
        lastModified: store.updated_at || new Date(),
        changeFrequency: "daily",
        priority: 0.8,
      });

      // Products for each store
      const { data: products } = await supabase
        .from("products")
        .select("slug, updated_at")
        .eq("store_id", store.slug)
        .eq("is_active", true)
        .limit(500);

      if (products) {
        for (const product of products) {
          entries.push({
            url: `${baseUrl}/${store.slug}/urun/${product.slug}`,
            lastModified: product.updated_at || new Date(),
            changeFrequency: "weekly",
            priority: 0.6,
          });
        }
      }
    }
  }

  return entries;
}
