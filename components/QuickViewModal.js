"use client";

import { useCart } from "@/lib/cart";
import Link from "next/link";

function formatPrice(p) {
  return new Intl.NumberFormat("tr-TR").format(p);
}

export default function QuickViewModal({ product, storeSlug, whatsapp, onClose }) {
  const { addItem } = useCart();

  if (!product) return null;

  const imgSrc = product.images?.[0];
  const discount = product.old_price
    ? Math.round((1 - product.price / product.old_price) * 100)
    : 0;

  function handleAdd() {
    addItem(product);
    onClose();
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-2xl z-50 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col sm:flex-row max-h-[90vh]">
        {/* Image */}
        <div className="sm:w-1/2 aspect-square sm:aspect-auto bg-gradient-to-br from-gray-100 to-gray-50 relative flex items-center justify-center shrink-0">
          {imgSrc ? (
            <img src={imgSrc} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-7xl">☕</span>
          )}
          {discount > 0 && (
            <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              %{discount}
            </span>
          )}
          {product.badge && (
            <span className="absolute top-3 left-3 bg-[var(--color-accent)] text-white text-[11px] font-bold uppercase px-2.5 py-1 rounded">
              {product.badge}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="sm:w-1/2 p-6 flex flex-col overflow-y-auto">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:relative sm:top-auto sm:right-auto sm:self-end w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-lg transition-colors"
          >
            &times;
          </button>

          <p className="text-xs tracking-widest uppercase text-[var(--color-muted)] mb-1 mt-2 sm:mt-0">
            {product.categories?.name || ""}
          </p>
          <h2 className="text-xl font-bold mb-2">{product.name}</h2>

          {product.description && (
            <p className="text-sm text-gray-500 mb-4 line-clamp-3">{product.description}</p>
          )}

          {/* Price */}
          <div className="mb-4">
            {product.old_price && (
              <span className="text-sm text-gray-400 line-through mr-2">
                {formatPrice(product.old_price)} TL
              </span>
            )}
            <span className="text-2xl font-bold text-[var(--color-accent)]">
              {formatPrice(product.price)} TL
            </span>
          </div>

          {/* Stock */}
          <p className={`text-xs mb-4 ${product.in_stock ? "text-emerald-600" : "text-red-500"}`}>
            {product.in_stock ? "Stokta mevcut" : "Stokta yok"}
          </p>

          {/* Actions */}
          <div className="mt-auto space-y-2">
            <button
              onClick={handleAdd}
              disabled={!product.in_stock}
              className="w-full py-3 rounded-xl bg-[var(--color-brand)] text-white font-bold text-sm hover:bg-[var(--color-accent)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {product.in_stock ? "Sepete Ekle" : "Stokta Yok"}
            </button>

            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Merhaba, ${product.name} hakkında bilgi almak istiyorum.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
                WhatsApp ile Sor
              </a>
            )}

            <Link
              href={`/${storeSlug}/urun/${product.slug}`}
              onClick={onClose}
              className="block text-center text-sm text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors py-1"
            >
              Detayli Incele →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
