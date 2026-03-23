"use client";
import { useCart } from "@/lib/cart";
import Link from "next/link";

function formatPrice(p) {
  return new Intl.NumberFormat("tr-TR").format(p);
}

function Badge({ text }) {
  if (!text) return null;
  const colors = {
    "Çok Satan": "bg-[var(--color-accent)] text-white",
    "Yeni": "bg-emerald-700 text-white",
    "İndirim": "bg-[var(--color-gold)] text-[var(--color-brand)]",
  };
  return (
    <span className={`absolute top-3 left-3 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded ${colors[text] || "bg-gray-500 text-white"}`}>
      {text}
    </span>
  );
}

export default function ProductGrid({ products, storeSlug }) {
  const { addItem } = useCart();

  if (products.length === 0) {
    return (
      <div className="text-center py-20 text-[var(--color-muted)]">
        Bu kategoride ürün bulunamadı.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {products.map((product, i) => (
        <div
          key={product.id}
          className="card-lift animate-fade-up bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden group"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          {/* Image Area */}
          <Link href={`/${storeSlug}/urun/${product.slug}`}>
            <div className="relative aspect-[4/3] bg-gradient-to-br from-[var(--color-border)]/40 to-[var(--color-border)]/10 flex items-center justify-center">
              <Badge text={product.badge} />
              <span className="text-5xl group-hover:scale-110 transition-transform duration-500">
                🛋️
              </span>
              {product.old_price && (
                <span className="absolute top-3 right-3 bg-[var(--color-accent)] text-white text-[11px] font-bold px-2 py-0.5 rounded">
                  %{Math.round((1 - product.price / product.old_price) * 100)}
                </span>
              )}
            </div>
          </Link>

          {/* Info */}
          <div className="p-4">
            <p className="text-[11px] tracking-widest uppercase text-[var(--color-muted)] mb-1">
              {product.categories?.name || "Genel"}
            </p>
            <Link href={`/${storeSlug}/urun/${product.slug}`}>
              <h3 className="font-semibold text-[15px] leading-snug mb-1 hover:text-[var(--color-accent)] transition-colors">
                {product.name}
              </h3>
            </Link>
            <p className="text-xs text-[var(--color-muted)] line-clamp-1 mb-3">
              {product.description}
            </p>
            <div className="flex items-center justify-between">
              <div>
                {product.old_price && (
                  <span className="price-old text-xs text-[var(--color-muted)] mr-1.5">
                    {formatPrice(product.old_price)} ₺
                  </span>
                )}
                <span className="text-lg font-bold text-[var(--color-accent)]">
                  {formatPrice(product.price)} ₺
                </span>
              </div>
              <button
                onClick={() => addItem(product)}
                className="px-3 py-2 rounded-lg bg-[var(--color-brand)] text-white text-xs font-bold tracking-wide hover:bg-[var(--color-accent)] transition-colors"
              >
                + Sepet
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
