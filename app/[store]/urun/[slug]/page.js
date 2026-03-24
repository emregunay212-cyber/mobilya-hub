import { getStore, getProduct, getRelatedProducts } from "@/lib/supabase";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/AddToCartButton";
import ProductGallery from "@/components/ProductGallery";
import ProductTabs from "@/components/ProductTabs";
import ProductGrid from "@/components/ProductGrid";
import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import Link from "next/link";

export const revalidate = 60;

function formatPrice(p) {
  return new Intl.NumberFormat("tr-TR").format(p);
}

const SECTOR_CONFIG = {
  mobilyaci: {
    emoji: "🛋️",
    features: [
      { icon: "🚚", text: "Ucretsiz Kargo" },
      { icon: "🔧", text: "Ucretsiz Montaj" },
      { icon: "🔄", text: "14 Gun Iade" },
      { icon: "💳", text: "9 Taksit" },
    ],
    whatsappText: "WhatsApp ile Sor",
  },
  kuyumcu: {
    emoji: "💎",
    features: [
      { icon: "📜", text: "Sertifikali" },
      { icon: "🚚", text: "Sigortali Kargo" },
      { icon: "🎁", text: "Hediye Paketi" },
      { icon: "💳", text: "12 Taksit" },
    ],
    whatsappText: "WhatsApp ile Sor",
  },
  cafe: {
    emoji: "☕",
    features: [
      { icon: "🌿", text: "Taze Malzeme" },
      { icon: "🚴", text: "Hizli Teslimat" },
      { icon: "🧑‍🍳", text: "Sef Yapimi" },
      { icon: "📱", text: "Online Siparis" },
    ],
    whatsappText: "WhatsApp ile Siparis Ver",
  },
  "oto-galeri": {
    emoji: "🚗",
    features: [
      { icon: "✅", text: "Ekspertiz Raporlu" },
      { icon: "📋", text: "Tramer Sorgusu" },
      { icon: "🔄", text: "Takas Imkani" },
      { icon: "💳", text: "Kredi Imkani" },
    ],
    whatsappText: "WhatsApp ile Bilgi Al",
  },
};

function getSectorConfig(store) {
  const sector = store.settings?.sector || "mobilyaci";
  return SECTOR_CONFIG[sector] || SECTOR_CONFIG.mobilyaci;
}

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

export async function generateMetadata({ params }) {
  const { store: storeSlug, slug } = await params;
  const store = await getStore(storeSlug);
  if (!store) return {};
  const product = await getProduct(store.id, slug);
  if (!product) return {};

  const title = `${product.name} | ${store.name}`;
  const description = product.description || `${product.name} - ${store.name}`;
  const url = `${baseUrl}/${storeSlug}/urun/${slug}`;
  const image = product.images?.[0] || undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "website",
      ...(image ? { images: [{ url: image, width: 800, height: 800 }] } : {}),
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

export default async function ProductPage({ params }) {
  const { store: storeSlug, slug } = await params;
  const store = await getStore(storeSlug);
  if (!store) notFound();
  const product = await getProduct(store.id, slug);
  if (!product) notFound();

  const config = getSectorConfig(store);
  const discount = product.old_price
    ? Math.round((1 - product.price / product.old_price) * 100)
    : 0;

  // Related products
  const relatedProducts = await getRelatedProducts(
    store.id,
    product.category_id,
    product.id,
    4
  );

  const breadcrumbItems = [
    { name: store.name, url: `${baseUrl}/${storeSlug}` },
    ...(product.categories
      ? [{ name: product.categories.name, url: `${baseUrl}/${storeSlug}?kategori=${product.categories.slug}` }]
      : []),
    { name: product.name },
  ];

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <ProductJsonLd product={product} store={store} />
      <BreadcrumbJsonLd items={breadcrumbItems} />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[var(--color-muted)] mb-8">
        <Link href={`/${storeSlug}`} className="hover:text-[var(--color-brand)]">
          {store.name}
        </Link>
        <span>/</span>
        {product.categories && (
          <>
            <Link
              href={`/${storeSlug}?kategori=${product.categories.slug}`}
              className="hover:text-[var(--color-brand)]"
            >
              {product.categories.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-[var(--color-brand)] font-medium truncate">{product.name}</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Gallery */}
        <ProductGallery images={product.images} name={product.name} emoji={config.emoji} />

        {/* Details */}
        <div className="flex flex-col justify-center">
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-[var(--color-accent)] mb-2">
            {product.categories?.name || "Genel"}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            {product.name}
          </h1>
          <p className="text-[var(--color-muted)] leading-relaxed mb-6">
            {product.description}
          </p>

          {/* Price */}
          <div className="mb-6">
            {product.old_price && (
              <p className="price-old inline text-lg text-[var(--color-muted)] mr-3">
                {formatPrice(product.old_price)} ₺
              </p>
            )}
            <p className="text-3xl font-black text-[var(--color-accent)] inline">
              {formatPrice(product.price)} ₺
            </p>
            {discount > 0 && (
              <span className="ml-3 bg-[var(--color-accent)] text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                %{discount} Indirim
              </span>
            )}
          </div>

          {/* Stock */}
          <p className={`text-sm mb-6 ${product.in_stock ? "text-emerald-600" : "text-red-500"}`}>
            {product.in_stock
              ? `✓ Stokta — ${product.stock_count} adet`
              : "✗ Stokta yok"}
          </p>

          <AddToCartButton product={product} />

          {/* WhatsApp */}
          {store.whatsapp && (
            <a
              href={`https://wa.me/${store.whatsapp}?text=${encodeURIComponent(`Merhaba, "${product.name}" hakkinda bilgi almak istiyorum.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 w-full py-3.5 rounded-xl border-2 border-green-600 text-green-700 font-bold text-center text-sm hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
              {config.whatsappText}
            </a>
          )}

          {/* Features */}
          <div className="mt-8 grid grid-cols-2 gap-3">
            {config.features.map((f) => (
              <div key={f.text} className="flex items-center gap-2.5 p-3 rounded-lg bg-[var(--color-border)]/20 text-sm">
                <span className="text-lg">{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product Tabs */}
      <ProductTabs
        description={product.description}
        metadata={product.metadata || {}}
        sectorFeatures={config.features}
      />

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Benzer Urunler</h2>
          <ProductGrid
            products={relatedProducts}
            storeSlug={storeSlug}
            productEmoji={config.emoji}
            whatsapp={store.whatsapp}
          />
        </section>
      )}
    </main>
  );
}
