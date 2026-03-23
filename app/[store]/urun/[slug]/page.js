import { getStore, getProduct } from "@/lib/supabase";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/AddToCartButton";
import Link from "next/link";
import Image from "next/image";

export const revalidate = 60;

function formatPrice(p) {
  return new Intl.NumberFormat("tr-TR").format(p);
}

export async function generateMetadata({ params }) {
  const { store: storeSlug, slug } = await params;
  const store = await getStore(storeSlug);
  if (!store) return {};
  const product = await getProduct(store.id, slug);
  if (!product) return {};
  return {
    title: `${product.name} | ${store.name}`,
    description: product.description,
  };
}

function ProductImage({ images, name }) {
  const src = images && images.length > 0 ? images[0] : null;

  if (!src) {
    return <span className="text-[120px]">🛋️</span>;
  }

  return (
    <Image
      src={src}
      alt={name}
      fill
      className="object-cover"
      sizes="(max-width: 1024px) 100vw, 50vw"
      priority
    />
  );
}

function ImageGallery({ images, name }) {
  if (!images || images.length <= 1) return null;

  return (
    <div className="flex gap-2 mt-3">
      {images.slice(0, 5).map((src, i) => (
        <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-[var(--color-border)]">
          <Image src={src} alt={`${name} ${i + 1}`} fill className="object-cover" sizes="64px" />
        </div>
      ))}
    </div>
  );
}

export default async function ProductPage({ params }) {
  const { store: storeSlug, slug } = await params;
  const store = await getStore(storeSlug);
  if (!store) notFound();
  const product = await getProduct(store.id, slug);
  if (!product) notFound();

  const discount = product.old_price
    ? Math.round((1 - product.price / product.old_price) * 100)
    : 0;

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
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
        <span className="text-[var(--color-brand)] font-medium">{product.name}</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Image */}
        <div>
          <div className="aspect-square rounded-3xl bg-gradient-to-br from-[var(--color-border)]/40 to-[var(--color-border)]/10 flex items-center justify-center relative overflow-hidden">
            <ProductImage images={product.images} name={product.name} />
            {discount > 0 && (
              <span className="absolute top-6 right-6 bg-[var(--color-accent)] text-white text-sm font-bold px-4 py-2 rounded-xl z-10">
                %{discount} İndirim
              </span>
            )}
            {product.badge && (
              <span className="absolute top-6 left-6 bg-[var(--color-brand)] text-[var(--color-gold)] text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider z-10">
                {product.badge}
              </span>
            )}
          </div>
          <ImageGallery images={product.images} name={product.name} />
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center">
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-[var(--color-accent)] mb-2">
            {product.categories?.name || "Genel"}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            {product.name}
          </h1>
          <p className="text-[var(--color-muted)] leading-relaxed mb-8">
            {product.description}
          </p>

          {/* Price */}
          <div className="mb-8">
            {product.old_price && (
              <p className="price-old inline text-lg text-[var(--color-muted)] mr-3">
                {formatPrice(product.old_price)} ₺
              </p>
            )}
            <p className="text-3xl font-black text-[var(--color-accent)] inline">
              {formatPrice(product.price)} ₺
            </p>
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
              href={`https://wa.me/${store.whatsapp}?text=${encodeURIComponent(`Merhaba, "${product.name}" hakkında bilgi almak istiyorum.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 w-full py-3.5 rounded-xl border-2 border-green-600 text-green-700 font-bold text-center text-sm hover:bg-green-50 transition-colors block"
            >
              💬 WhatsApp ile Sor
            </a>
          )}

          {/* Features */}
          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              ["🚚", "Ücretsiz Kargo"],
              ["🔧", "Ücretsiz Montaj"],
              ["🔄", "14 Gün İade"],
              ["💳", "9 Taksit"],
            ].map(([icon, text]) => (
              <div key={text} className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
                <span>{icon}</span> {text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
