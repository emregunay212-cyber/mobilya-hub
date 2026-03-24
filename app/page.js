import { supabase } from "@/lib/supabase";
import Link from "next/link";

export const revalidate = 60;

// Sektör emoji mapping
const SECTOR_ICONS = {
  mobilyaci: "🛋️",
  kuyumcu: "💎",
  cafe: "☕",
  "oto-galeri": "🚗",
};

function getSectorIcon(store) {
  const sector = store.settings?.sector || "mobilyaci";
  return SECTOR_ICONS[sector] || "🏪";
}

export default async function HomePage() {
  const { data: stores } = await supabase
    .from("stores")
    .select("*")
    .eq("is_active", true);

  return (
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <p className="text-sm font-bold tracking-[0.25em] uppercase text-[var(--color-accent)] mb-4">
          WEBKODA
        </p>
        <h1 className="text-5xl font-bold tracking-tight mb-4">
          Web Sitesi Platformu
        </h1>
        <p className="text-lg text-[var(--color-muted)] mb-16 max-w-lg mx-auto">
          İşletmeler için profesyonel web siteleri tek çatı altında.
        </p>

        <div className="grid gap-6 sm:grid-cols-2">
          {stores?.map((store) => (
            <Link
              key={store.id}
              href={`/${store.slug}`}
              className="card-lift block bg-white rounded-2xl border border-[var(--color-border)] p-8 text-left"
            >
              <div className="w-14 h-14 rounded-xl bg-[var(--color-brand)] flex items-center justify-center text-2xl mb-4">
                {getSectorIcon(store)}
              </div>
              <h2 className="text-xl font-bold mb-1">{store.name}</h2>
              <p className="text-sm text-[var(--color-muted)] mb-3 line-clamp-2">
                {store.description}
              </p>
              <p className="text-sm text-[var(--color-muted)]">
                📍 {store.address}, {store.city}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
