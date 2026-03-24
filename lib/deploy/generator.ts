/**
 * Code generation engine.
 * Generates a standalone Next.js project for a store.
 */

import type { Store, PaymentConfig } from "@/lib/types/database";
import type { SectorDefinition } from "@/lib/types/sectors";
import type { Theme } from "@/lib/themes";
import type { GeneratedFile } from "./github";

interface GeneratorInput {
  store: Store;
  sector: SectorDefinition;
  theme: Theme;
  paymentConfig: PaymentConfig | null;
  categories: { name: string; slug: string }[];
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export function generateStoreProject(input: GeneratorInput): GeneratedFile[] {
  const { store, sector, theme, paymentConfig, categories, supabaseUrl, supabaseAnonKey } = input;
  const hasPayment = paymentConfig && paymentConfig.provider !== "none";
  const files: GeneratedFile[] = [];

  // package.json
  const deps: Record<string, string> = {
    next: "^15.1.0",
    react: "^19.0.0",
    "react-dom": "^19.0.0",
    "@supabase/supabase-js": "^2.47.0",
  };
  if (hasPayment && paymentConfig.provider === "stripe") deps.stripe = "^14.0.0";
  if (hasPayment && paymentConfig.provider === "iyzico") deps.iyzipay = "^2.0.0";

  files.push({
    path: "package.json",
    content: JSON.stringify(
      {
        name: store.slug,
        version: "1.0.0",
        private: true,
        scripts: { dev: "next dev", build: "next build", start: "next start" },
        dependencies: deps,
        devDependencies: { tailwindcss: "^4.0.0", "@tailwindcss/postcss": "^4.0.0" },
      },
      null,
      2
    ),
  });

  // next.config.ts
  files.push({
    path: "next.config.ts",
    content: `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "${new URL(supabaseUrl).hostname}" },
    ],
  },
};

export default nextConfig;
`,
  });

  // tsconfig.json
  files.push({
    path: "tsconfig.json",
    content: JSON.stringify(
      {
        compilerOptions: {
          target: "ES2017",
          lib: ["dom", "dom.iterable", "esnext"],
          allowJs: true,
          skipLibCheck: true,
          strict: true,
          noEmit: true,
          esModuleInterop: true,
          module: "esnext",
          moduleResolution: "bundler",
          resolveJsonModule: true,
          isolatedModules: true,
          jsx: "preserve",
          incremental: true,
          plugins: [{ name: "next" }],
          paths: { "@/*": ["./*"] },
        },
        include: ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
        exclude: ["node_modules"],
      },
      null,
      2
    ),
  });

  // postcss.config.js
  files.push({
    path: "postcss.config.js",
    content: `module.exports = { plugins: { "@tailwindcss/postcss": {} } };
`,
  });

  // .gitignore
  files.push({
    path: ".gitignore",
    content: `node_modules/
.next/
.env
.env.local
.env*.local
`,
  });

  // lib/supabase.ts
  files.push({
    path: "lib/supabase.ts",
    content: `import { createClient } from "@supabase/supabase-js";
import { cache } from "react";

const STORE_ID = process.env.STORE_ID || "";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const getStore = cache(async () => {
  const { data } = await supabase.from("stores").select("*").eq("id", STORE_ID).eq("is_active", true).single();
  return data;
});

export async function getCategories() {
  const { data } = await supabase.from("categories").select("*").eq("store_id", STORE_ID).order("sort_order");
  return data || [];
}

export async function getProducts(categorySlug?: string | null) {
  let query = supabase.from("products").select("*, categories(name, slug)").eq("store_id", STORE_ID).eq("is_active", true).order("sort_order");
  if (categorySlug) {
    const { data: cat } = await supabase.from("categories").select("id").eq("store_id", STORE_ID).eq("slug", categorySlug).single();
    if (cat) query = query.eq("category_id", cat.id);
  }
  const { data } = await query;
  return data || [];
}

export async function getProduct(productSlug: string) {
  const { data } = await supabase.from("products").select("*, categories(name, slug)").eq("store_id", STORE_ID).eq("slug", productSlug).single();
  return data || null;
}
`,
  });

  // lib/cart.ts
  files.push({
    path: "lib/cart.ts",
    content: `"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  slug: string;
  qty: number;
  image?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: { id: string; name: string; price: number; slug: string; images?: string[] }) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  total: number;
  count: number;
  loaded: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const storageKey = "cart_${store.slug}";
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setItems(JSON.parse(saved));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, loaded]);

  const addItem = (product: { id: string; name: string; price: number; slug: string; images?: string[] }) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.id === product.id);
      if (exists) return prev.map((i) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { id: product.id, name: product.name, price: product.price, slug: product.slug, qty: 1, image: product.images?.[0] }];
    });
  };

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));
  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) return removeItem(id);
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, qty } : i));
  };
  const clearCart = () => setItems([]);
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, count, loaded }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
}
`,
  });

  const p = theme.palette;

  // app/globals.css
  files.push({
    path: "app/globals.css",
    content: `@import "tailwindcss";

@theme {
  --font-display: "${theme.fonts?.heading || "Playfair Display"}", Georgia, serif;
  --font-body: "${theme.fonts?.body || "DM Sans"}", system-ui, sans-serif;
  --color-brand: ${p.brand};
  --color-accent: ${p.accent};
  --color-warm: ${p.warm};
  --color-border: ${p.border};
  --color-muted: ${p.muted};
  --color-gold: ${p.gold};
}

body {
  font-family: var(--font-body);
  background: var(--color-warm);
  color: ${p.text};
}

h1, h2, h3 { font-family: var(--font-display); }

body::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 0.025;
  z-index: 50;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

.card-lift {
  transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.4s ease;
}
.card-lift:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-up { animation: fadeUp 0.6s ease forwards; }

.price-old { position: relative; }
.price-old::after {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  height: 1.5px;
  background: var(--color-accent);
}
`,
  });

  // app/layout.tsx
  files.push({
    path: "app/layout.tsx",
    content: `import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "${store.name}",
  description: "${store.description || store.name + " - " + store.city}",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
`,
  });

  // Build trust bar HTML
  const trustBarHtml = sector.trustBarItems
    .map(
      (item) =>
        `<div className="text-center">
              <div className="text-2xl mb-2">${item.icon}</div>
              <div className="font-semibold text-sm">${item.title}</div>
              <div className="text-xs text-[var(--color-muted)]">${item.subtitle}</div>
            </div>`
    )
    .join("\n            ");

  // Build category links
  const categoryLinks = categories
    .map(
      (cat) =>
        `<Link href={\`/?kategori=${cat.slug}\`} className={kategori === "${cat.slug}" ? "px-4 py-2 rounded-full text-sm font-semibold bg-[var(--color-brand)] text-white" : "px-4 py-2 rounded-full text-sm font-semibold border border-[var(--color-border)] hover:border-[var(--color-brand)] transition-colors"}>
              ${cat.name}
            </Link>`
    )
    .join("\n            ");

  // app/page.tsx - Store homepage
  files.push({
    path: "app/page.tsx",
    content: `import { getStore, getProducts, getCategories } from "@/lib/supabase";
import Link from "next/link";
import ProductGrid from "@/components/ProductGrid";
import StoreShell from "@/components/StoreShell";

export const revalidate = 60;

export default async function HomePage({ searchParams }: { searchParams: Promise<{ kategori?: string }> }) {
  const params = await searchParams;
  const store = await getStore();
  if (!store) return <div className="p-20 text-center">Mağaza bulunamadı</div>;

  const kategori = params.kategori || null;
  const [products, categories] = await Promise.all([
    getProducts(kategori),
    getCategories(),
  ]);

  return (
    <StoreShell store={store}>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24 text-center">
          <p className="text-sm font-bold tracking-[0.25em] uppercase text-[var(--color-accent)] mb-4">
            ${store.city}
          </p>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-4">{store.name}</h1>
          <p className="text-lg text-[var(--color-muted)] max-w-lg mx-auto mb-8">
            ${sector.ctaText.heroSubtitle}
          </p>
          ${
            store.whatsapp
              ? `<a href={\`https://wa.me/${store.whatsapp}\`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm tracking-wide transition-colors">
            ${"💬"} ${sector.ctaText.whatsapp}
          </a>`
              : ""
          }
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 mb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          <Link href="/" className={!kategori ? "px-4 py-2 rounded-full text-sm font-semibold bg-[var(--color-brand)] text-white" : "px-4 py-2 rounded-full text-sm font-semibold border border-[var(--color-border)] hover:border-[var(--color-brand)] transition-colors"}>
            Tümü
          </Link>
          {categories.map((cat: { id: string; name: string; slug: string }) => (
            <Link key={cat.id} href={\`/?kategori=\${cat.slug}\`} className={kategori === cat.slug ? "px-4 py-2 rounded-full text-sm font-semibold bg-[var(--color-brand)] text-white" : "px-4 py-2 rounded-full text-sm font-semibold border border-[var(--color-border)] hover:border-[var(--color-brand)] transition-colors"}>
              {cat.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <ProductGrid products={products} />
      </section>

      {/* Trust Bar */}
      <section className="border-t border-[var(--color-border)] py-12">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-6">
          ${trustBarHtml}
        </div>
      </section>
    </StoreShell>
  );
}
`,
  });

  // components/StoreShell.tsx
  files.push({
    path: "components/StoreShell.tsx",
    content: `"use client";
import { CartProvider, useCart } from "@/lib/cart";
import Link from "next/link";
import { useState, type ReactNode } from "react";

function formatPrice(p: number) {
  return new Intl.NumberFormat("tr-TR").format(p);
}

function Navbar({ store }: { store: Record<string, unknown> }) {
  const { count } = useCart();
  const [showCart, setShowCart] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-40 bg-[var(--color-warm)]/90 backdrop-blur-md border-b border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[var(--color-brand)] flex items-center justify-center text-[var(--color-gold)] font-bold text-lg">
              {(store.name as string)?.[0]}
            </div>
            <div>
              <div className="text-base font-bold leading-tight">{store.name as string}</div>
              <div className="text-[10px] tracking-[0.2em] uppercase text-[var(--color-muted)]">{store.city as string}</div>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            {store.whatsapp && (
              <a href={\`https://wa.me/\${store.whatsapp}\`} target="_blank" rel="noopener noreferrer" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-green-700 hover:text-green-800">
                ${"💬"} WhatsApp
              </a>
            )}
            <button onClick={() => setShowCart(true)} className="relative p-2 text-xl">
              ${"🛒"}
              {count > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--color-accent)] text-white text-[11px] font-bold rounded-full flex items-center justify-center">{count}</span>
              )}
            </button>
          </div>
        </div>
      </nav>
      {showCart && <CartDrawer store={store} onClose={() => setShowCart(false)} />}
    </>
  );
}

function CartDrawer({ store, onClose }: { store: Record<string, unknown>; onClose: () => void }) {
  const { items, removeItem, updateQty, total, clearCart } = useCart();

  const whatsappOrder = () => {
    if (!store.whatsapp || items.length === 0) return;
    let msg = \`Merhaba, sipariş vermek istiyorum:\\n\\n\`;
    items.forEach((item) => { msg += \`• \${item.name} x\${item.qty} — \${formatPrice(item.price * item.qty)} ₺\\n\`; });
    msg += \`\\nToplam: \${formatPrice(total)} ₺\`;
    window.open(\`https://wa.me/\${store.whatsapp}?text=\${encodeURIComponent(msg)}\`, "_blank");
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-[var(--color-warm)] z-50 shadow-2xl flex flex-col">
        <div className="p-5 border-b border-[var(--color-border)] flex items-center justify-between">
          <h2 className="text-xl font-bold">Sepetim</h2>
          <button onClick={onClose} className="text-2xl text-[var(--color-muted)] hover:text-[var(--color-brand)]">${"✕"}</button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="text-center py-16 text-[var(--color-muted)]">
              <p className="text-4xl mb-3">${"🛒"}</p><p>Sepetiniz boş</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 pb-4 border-b border-[var(--color-border)]">
                  <div className="flex-1">
                    <p className="font-semibold text-sm leading-tight mb-1">{item.name}</p>
                    <p className="text-[var(--color-accent)] font-bold text-sm">{formatPrice(item.price)} ₺</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-7 h-7 rounded-md border border-[var(--color-border)] flex items-center justify-center text-sm hover:bg-white">${"−"}</button>
                      <span className="text-sm font-semibold w-6 text-center">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)} className="w-7 h-7 rounded-md border border-[var(--color-border)] flex items-center justify-center text-sm hover:bg-white">${"+"}</button>
                    </div>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-[var(--color-accent)] text-lg self-start">${"✕"}</button>
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
            <button onClick={whatsappOrder} className="w-full py-3.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm tracking-wide transition-colors">
              ${"💬"} WhatsApp ile Sipariş Ver
            </button>
            <button onClick={clearCart} className="w-full mt-2 py-2.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors">
              Sepeti Temizle
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default function StoreShell({ store, children }: { store: Record<string, unknown>; children: ReactNode }) {
  return (
    <CartProvider>
      <Navbar store={store} />
      {children}
      <footer className="border-t border-[var(--color-border)] py-8 px-4 text-center text-sm text-[var(--color-muted)]">
        <p className="mb-1">© ${new Date().getFullYear()} {store.name as string} — {store.city as string}</p>
        <p className="text-xs opacity-60">WEBKODA tarafından geliştirildi</p>
      </footer>
    </CartProvider>
  );
}
`,
  });

  // components/ProductGrid.tsx
  files.push({
    path: "components/ProductGrid.tsx",
    content: `"use client";
import { useCart } from "@/lib/cart";
import Link from "next/link";
import Image from "next/image";

function formatPrice(p: number) {
  return new Intl.NumberFormat("tr-TR").format(p);
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  old_price?: number;
  badge?: string;
  in_stock: boolean;
  images?: string[];
  categories?: { name: string; slug: string };
}

export default function ProductGrid({ products }: { products: Product[] }) {
  const { addItem } = useCart();

  if (products.length === 0) {
    return <div className="text-center py-20 text-[var(--color-muted)]">Bu kategoride ${sector.productLabel.toLowerCase()} bulunamadı.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {products.map((product, i) => (
        <div key={product.id} className="card-lift animate-fade-up bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden group" style={{ animationDelay: \`\${i * 60}ms\` }}>
          <Link href={\`/urun/\${product.slug}\`}>
            <div className="relative aspect-[4/3] bg-gradient-to-br from-[var(--color-border)]/40 to-[var(--color-border)]/10 overflow-hidden">
              {product.badge && (
                <span className="absolute top-3 left-3 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded z-10 bg-[var(--color-accent)] text-white">{product.badge}</span>
              )}
              {product.images && product.images[0] ? (
                <Image src={product.images[0]} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl group-hover:scale-110 transition-transform duration-500">${sector.productEmoji}</span>
                </div>
              )}
              {product.old_price && (
                <span className="absolute top-3 right-3 bg-[var(--color-accent)] text-white text-[11px] font-bold px-2 py-0.5 rounded z-10">
                  %{Math.round((1 - product.price / product.old_price) * 100)}
                </span>
              )}
            </div>
          </Link>
          <div className="p-4">
            <p className="text-[11px] tracking-widest uppercase text-[var(--color-muted)] mb-1">{product.categories?.name || "Genel"}</p>
            <Link href={\`/urun/\${product.slug}\`}>
              <h3 className="font-semibold text-[15px] leading-snug mb-1 hover:text-[var(--color-accent)] transition-colors">{product.name}</h3>
            </Link>
            <p className="text-xs text-[var(--color-muted)] line-clamp-1 mb-3">{product.description}</p>
            <div className="flex items-center justify-between">
              <div>
                {product.old_price && <span className="price-old text-xs text-[var(--color-muted)] mr-1.5">{formatPrice(product.old_price)} ₺</span>}
                <span className="text-lg font-bold text-[var(--color-accent)]">{formatPrice(product.price)} ₺</span>
              </div>
              <button onClick={() => addItem(product)} disabled={!product.in_stock} className="px-3 py-2 rounded-lg bg-[var(--color-brand)] text-white text-xs font-bold tracking-wide hover:bg-[var(--color-accent)] transition-colors disabled:bg-gray-300 disabled:text-gray-500">
                {product.in_stock ? "+ Sepet" : "Tükendi"}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
`,
  });

  // app/urun/[slug]/page.tsx - Product detail
  files.push({
    path: "app/urun/[slug]/page.tsx",
    content: `import { getStore, getProduct } from "@/lib/supabase";
import StoreShell from "@/components/StoreShell";
import AddToCartButton from "@/components/AddToCartButton";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 60;

function formatPrice(p: number) {
  return new Intl.NumberFormat("tr-TR").format(p);
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const store = await getStore();
  if (!store) return notFound();

  const product = await getProduct(slug);
  if (!product) return notFound();

  const discount = product.old_price ? Math.round((1 - product.price / product.old_price) * 100) : 0;

  return (
    <StoreShell store={store}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-sm text-[var(--color-muted)] mb-6">
          <Link href="/" className="hover:text-[var(--color-accent)]">Ana Sayfa</Link>
          <span className="mx-2">/</span>
          <span>{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-[var(--color-border)]/40 to-[var(--color-border)]/10">
            {product.images && product.images[0] ? (
              <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" priority />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-8xl">${sector.productEmoji}</div>
            )}
            {discount > 0 && (
              <span className="absolute top-4 right-4 bg-[var(--color-accent)] text-white text-sm font-bold px-3 py-1 rounded">%{discount}</span>
            )}
          </div>

          {/* Info */}
          <div>
            <p className="text-sm tracking-widest uppercase text-[var(--color-muted)] mb-2">{product.categories?.name || "Genel"}</p>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            {product.description && <p className="text-[var(--color-muted)] mb-6 leading-relaxed">{product.description}</p>}

            <div className="mb-6">
              {product.old_price && <span className="price-old text-lg text-[var(--color-muted)] mr-3">{formatPrice(product.old_price)} ₺</span>}
              <span className="text-3xl font-bold text-[var(--color-accent)]">{formatPrice(product.price)} ₺</span>
            </div>

            <p className={\`text-sm font-semibold mb-6 \${product.in_stock ? "text-green-600" : "text-red-500"}\`}>
              {product.in_stock ? "${"✓"} Stokta" : "${"✕"} Stokta Yok"}
            </p>

            <AddToCartButton product={product} />

            {store.whatsapp && (
              <a href={\`https://wa.me/\${store.whatsapp}?text=\${encodeURIComponent(\`Merhaba, \${product.name} hakkında bilgi almak istiyorum.\`)}\`} target="_blank" rel="noopener noreferrer" className="mt-4 w-full py-3.5 rounded-xl border-2 border-green-600 text-green-700 font-bold text-sm text-center block hover:bg-green-50 transition-colors">
                ${"💬"} WhatsApp ile Bilgi Al
              </a>
            )}
          </div>
        </div>
      </div>
    </StoreShell>
  );
}
`,
  });

  // components/AddToCartButton.tsx
  files.push({
    path: "components/AddToCartButton.tsx",
    content: `"use client";
import { useCart } from "@/lib/cart";
import { useState } from "react";

interface Product {
  id: string;
  name: string;
  price: number;
  slug: string;
  in_stock: boolean;
  images?: string[];
}

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <button onClick={handleAdd} disabled={!product.in_stock} className={\`w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all \${
      added ? "bg-emerald-600 text-white" : product.in_stock ? "bg-[var(--color-brand)] text-white hover:bg-[var(--color-accent)]" : "bg-gray-300 text-gray-500 cursor-not-allowed"
    }\`}>
      {added ? "${"✓"} Sepete Eklendi!" : product.in_stock ? "${"🛒"} ${sector.ctaText.addToCart}" : "Stokta Yok"}
    </button>
  );
}
`,
  });

  // .env.local.example
  files.push({
    path: ".env.local.example",
    content: `# Bu dosyayi .env.local olarak kopyalayin
# Bu degerleri Vercel env vars olarak otomatik ayarlanir.
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey}
STORE_ID=${store.id}
STORE_SLUG=${store.slug}
`,
  });

  return files;
}
