"use client";
import { CartProvider, useCart } from "@/lib/cart";
import { getThemeById } from "@/lib/themes";
import Link from "next/link";
import { useState, useEffect } from "react";
import StoreFooter from "./StoreFooter";

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
        <div className="max-w-6xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          <Link href={`/${store.slug}`} className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[var(--color-brand)] flex items-center justify-center text-[var(--color-gold)] font-bold text-base sm:text-lg shrink-0">
              {store.name[0]}
            </div>
            <div className="min-w-0">
              <div className="text-sm sm:text-base font-bold leading-tight truncate">{store.name}</div>
              <div className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-[var(--color-muted)]">
                {store.city}
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
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
              className="relative p-2 text-lg sm:text-xl hidden sm:block"
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

/* ── Mobile Bottom Navigation ──────────────────── */
function BottomNav({ store }) {
  const { count } = useCart();
  const [showCart, setShowCart] = useState(false);

  return (
    <>
      <div
        className="fixed bottom-0 left-0 right-0 z-40 sm:hidden border-t"
        style={{
          background: "var(--color-warm)",
          borderColor: "var(--color-border)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div className="grid grid-cols-4 h-16">
          <Link
            href={`/${store.slug}`}
            className="flex flex-col items-center justify-center gap-0.5 text-[var(--color-muted)] active:text-[var(--color-brand)] transition-colors"
          >
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            <span className="text-[10px] font-medium">Ana Sayfa</span>
          </Link>

          <Link
            href={`/${store.slug}`}
            className="flex flex-col items-center justify-center gap-0.5 text-[var(--color-muted)] active:text-[var(--color-brand)] transition-colors"
          >
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
            <span className="text-[10px] font-medium">Ürünler</span>
          </Link>

          {store.whatsapp ? (
            <a
              href={`https://wa.me/${store.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-0.5 text-green-600 active:text-green-700 transition-colors"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span className="text-[10px] font-medium">WhatsApp</span>
            </a>
          ) : (
            <div />
          )}

          <button
            onClick={() => setShowCart(true)}
            className="flex flex-col items-center justify-center gap-0.5 text-[var(--color-muted)] active:text-[var(--color-brand)] transition-colors relative"
          >
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
            {count > 0 && (
              <span className="absolute top-1.5 right-1/2 translate-x-4 w-4 h-4 bg-[var(--color-accent)] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
            <span className="text-[10px] font-medium">Sepet</span>
          </button>
        </div>
      </div>

      {showCart && <CartDrawer store={store} onClose={() => setShowCart(false)} />}
    </>
  );
}

/* ── Scroll Reveal Observer ────────────────────── */
function ScrollRevealProvider({ children }) {
  useEffect(() => {
    const elements = document.querySelectorAll(".scroll-reveal");
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return children;
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
        <div className="p-4 sm:p-5 border-b border-[var(--color-border)] flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold">Sepetim</h2>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-2xl text-[var(--color-muted)] hover:text-[var(--color-brand)]">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
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
                        className="w-8 h-8 rounded-md border border-[var(--color-border)] flex items-center justify-center text-sm active:bg-[var(--color-border)] transition-colors"
                      >−</button>
                      <span className="text-sm font-semibold w-6 text-center">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        className="w-8 h-8 rounded-md border border-[var(--color-border)] flex items-center justify-center text-sm active:bg-[var(--color-border)] transition-colors"
                      >+</button>
                    </div>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-[var(--color-accent)] text-lg self-start p-1">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t-2 border-[var(--color-brand)]">
            <div className="flex justify-between mb-4">
              <span className="font-semibold">Toplam</span>
              <span className="text-xl font-bold text-[var(--color-accent)]">{formatPrice(total)} ₺</span>
            </div>
            <button
              onClick={whatsappOrder}
              className="w-full py-3.5 rounded-xl bg-green-600 active:bg-green-700 text-white font-bold text-sm tracking-wide transition-colors"
            >
              💬 WhatsApp ile Sipariş Ver
            </button>
            <button
              onClick={clearCart}
              className="w-full mt-2 py-2.5 text-sm text-[var(--color-muted)] active:text-[var(--color-accent)] transition-colors"
            >
              Sepeti Temizle
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default function StoreShell({ store, categories = [], children }) {
  const themeId = store.settings?.theme || "classic-warm";
  const theme = getThemeById(themeId);

  return (
    <CartProvider storeSlug={store.slug}>
      <ThemeStyle palette={theme.palette} />
      <ScrollRevealProvider>
        <Navbar store={store} />
        <div className="has-bottom-nav">{children}</div>
        <StoreFooter store={store} categories={categories} />
        <BottomNav store={store} />
      </ScrollRevealProvider>
    </CartProvider>
  );
}
