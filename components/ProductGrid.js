"use client";
import { useCart } from "@/lib/cart";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import QuickViewModal from "./QuickViewModal";

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
    <span className={`absolute top-3 left-3 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded z-10 ${colors[text] || "bg-gray-500 text-white"}`}>
      {text}
    </span>
  );
}

function ProductImage({ images, name, emoji = "🛋️", inStock = true }) {
  const src = images && images.length > 0 ? images[0] : null;

  if (!src) {
    return (
      <div className={`absolute inset-0 flex items-center justify-center ${!inStock ? "opacity-50 grayscale" : ""}`}>
        <span className="text-5xl group-hover:scale-110 transition-transform duration-500">{emoji}</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={name}
      fill
      className={`object-cover group-hover:scale-105 transition-transform duration-500 ${!inStock ? "opacity-50 grayscale" : ""}`}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
    />
  );
}

export default function ProductGrid({ products, storeSlug, productEmoji = "🛋️", whatsapp }) {
  const { addItem } = useCart();
  const [quickView, setQuickView] = useState(null);

  if (products.length === 0) {
    return (
      <div className="text-center py-20 text-[var(--color-muted)]">
        Bu kategoride urun bulunamadi.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {products.map((product, i) => (
          <div
            key={product.id}
            className="card-lift animate-fade-up bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden group"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {/* Image Area */}
            <div className="relative aspect-[4/3] bg-gradient-to-br from-[var(--color-border)]/40 to-[var(--color-border)]/10 overflow-hidden">
              <Badge text={product.badge} />
              <ProductImage images={product.images} name={product.name} emoji={productEmoji} inStock={product.in_stock} />
              {product.old_price && (
                <span className="absolute top-3 right-3 bg-[var(--color-accent)] text-white text-[11px] font-bold px-2 py-0.5 rounded z-10">
                  %{Math.round((1 - product.price / product.old_price) * 100)}
                </span>
              )}
              {!product.in_stock && (
                <span className="absolute bottom-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded z-10">
                  Tukendi
                </span>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                <button
                  onClick={(e) => { e.preventDefault(); setQuickView(product); }}
                  className="px-4 py-2 bg-white rounded-lg text-xs font-bold text-gray-800 hover:bg-gray-100 transition-colors shadow-lg"
                >
                  Hizli Bak
                </button>
                <Link
                  href={`/${storeSlug}/urun/${product.slug}`}
                  className="px-4 py-2 bg-[var(--color-brand)] rounded-lg text-xs font-bold text-white hover:bg-[var(--color-accent)] transition-colors shadow-lg"
                >
                  Detay
                </Link>
              </div>
            </div>

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
                  disabled={!product.in_stock}
                  className="px-3 py-2 rounded-lg bg-[var(--color-brand)] text-white text-xs font-bold tracking-wide hover:bg-[var(--color-accent)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  + Sepet
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick View Modal */}
      {quickView && (
        <QuickViewModal
          product={quickView}
          storeSlug={storeSlug}
          whatsapp={whatsapp}
          onClose={() => setQuickView(null)}
        />
      )}
    </>
  );
}
