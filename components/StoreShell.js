"use client";
import { CartProvider, useCart } from "@/lib/cart";
import { getThemeById } from "@/lib/themes";
import Link from "next/link";
import { useState } from "react";

function formatPrice(p) {
  return new Intl.NumberFormat("tr-TR").format(p);
}

function ThemeStyle({ palette }) {
  return (
    <style>{`
      :root {
        --color-brand: ${palette.brand};
        --color-accent: ${palette.accent};
        --color-warm: ${palette.warm};
        --color-border: ${palette.border};
        --color-muted: ${palette.muted};
        --color-gold: ${palette.gold};
      }
      body {
        background: ${palette.warm};
        color: ${palette.text};
      }
    `}</style>
  );
}

function Navbar({ store }) {
  const { count } = useCart();
  const [showCart, setShowCart] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-40 bg-[var(--color-warm)]/90 backdrop-blur-md border-b border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href={`/${store.slug}`} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[var(--color-brand)] flex items-center justify-center text-[var(--color-gold)] font-bold text-lg">
              {store.name[0]}
            </div>
            <div>
              <div className="text-base font-bold leading-tight">{store.name}</div>
              <div className="text-[10px] tracking-[0.2em] uppercase text-[var(--color-muted)]">
                {store.city}
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            {store.whatsapp && (
              <a
                href={`https://wa.me/${store.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-green-700 hover:text-green-800"
              >
                💬 WhatsApp
              </a>
            )}
            <button
              onClick={() => setShowCart(true)}
              className="relative p-2 text-xl"
            >
              🛒
              {count > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--color-accent)] text-white text-[11px] font-bold rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {showCart && <CartDrawer store={store} onClose={() => setShowCart(false)} />}
    </>
  );
}

function CartDrawer({ store, onClose }) {
  const { items, removeItem, updateQty, total, clearCart } = useCart();

  const whatsappOrder = () => {
    if (!store.whatsapp || items.length === 0) return;
    let msg = `Merhaba, sipariş vermek istiyorum:\n\n`;
    items.forEach((item) => {
      msg += `• ${item.name} x${item.qty} — ${formatPrice(item.price * item.qty)} ₺\n`;
    });
    msg += `\nToplam: ${formatPrice(total)} ₺`;
    window.open(`https://wa.me/${store.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-[var(--color-warm)] z-50 shadow-2xl flex flex-col">
        <div className="p-5 border-b border-[var(--color-border)] flex items-center justify-between">
          <h2 className="text-xl font-bold">Sepetim</h2>
          <button onClick={onClose} className="text-2xl text-[var(--color-muted)] hover:text-[var(--color-brand)]">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="text-center py-16 text-[var(--color-muted)]">
              <p className="text-4xl mb-3">🛒</p>
              <p>Sepetiniz boş</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 pb-4 border-b border-[var(--color-border)]">
                  <div className="flex-1">
                    <p className="font-semibold text-sm leading-tight mb-1">{item.name}</p>
                    <p className="text-[var(--color-accent)] font-bold text-sm">
                      {formatPrice(item.price)} ₺
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQty(item.id, item.qty - 1)}
                        className="w-7 h-7 rounded-md border border-[var(--color-border)] flex items-center justify-center text-sm hover:bg-white"
                      >−</button>
                      <span className="text-sm font-semibold w-6 text-center">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        className="w-7 h-7 rounded-md border border-[var(--color-border)] flex items-center justify-center text-sm hover:bg-white"
                      >+</button>
                    </div>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-[var(--color-accent)] text-lg self-start">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-5 border-t-2 border-[var(--color-brand)]">
            <div className="flex justify-between mb-4">
              <span className="font-semibold">Toplam</span>
              <span className="text-xl font-bold text-[var(--color-accent)]">{formatPrice(total)} ₺</span>
            </div>
            <button
              onClick={whatsappOrder}
              className="w-full py-3.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm tracking-wide transition-colors"
            >
              💬 WhatsApp ile Sipariş Ver
            </button>
            <button
              onClick={clearCart}
              className="w-full mt-2 py-2.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors"
            >
              Sepeti Temizle
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default function StoreShell({ store, children }) {
  const themeId = store.settings?.theme || "classic-warm";
  const theme = getThemeById(themeId);

  return (
    <CartProvider storeSlug={store.slug}>
      <ThemeStyle palette={theme.palette} />
      <Navbar store={store} />
      {children}
      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] py-8 px-4 text-center text-sm text-[var(--color-muted)]">
        <p className="mb-1">© 2026 {store.name} — {store.city}</p>
        <p className="text-xs opacity-60">WEBKODA tarafından geliştirildi</p>
      </footer>
    </CartProvider>
  );
}
