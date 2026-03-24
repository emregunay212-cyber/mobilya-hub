import { getStore, getCategories } from "@/lib/supabase";
import { notFound } from "next/navigation";
import StoreShell from "@/components/StoreShell";
import { LocalBusinessJsonLd } from "@/components/JsonLd";
import { GoogleAnalytics, FacebookPixel } from "@/components/Analytics";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

export async function generateMetadata({ params }) {
  const { store: slug } = await params;
  const store = await getStore(slug);
  if (!store) return {};

  const title = `${store.name} | Online Magaza`;
  const description = store.description || `${store.name} - ${store.city}`;
  const url = `${baseUrl}/${store.slug}`;
  const image = store.logo_url || undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: store.name,
      ...(image ? { images: [{ url: image, width: 600, height: 600 }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
    alternates: { canonical: url },
  };
}

export default async function StoreLayout({ children, params }) {
  const { store: slug } = await params;
  const store = await getStore(slug);
  if (!store) notFound();

  const categories = await getCategories(store.id);

  return (
    <>
      <GoogleAnalytics measurementId={store.settings?.ga_id} />
      <FacebookPixel pixelId={store.settings?.fb_pixel_id} />
      <LocalBusinessJsonLd store={store} />
      <StoreShell store={store} categories={categories}>{children}</StoreShell>
    </>
  );
}
