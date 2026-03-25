import { getStore, getCategories, getProducts } from "@/lib/supabase";
import { notFound } from "next/navigation";
import ProductGrid from "@/components/ProductGrid";

export const revalidate = 60;

// Sektör bazlı konfigürasyon
const SECTOR_CONFIG = {
  mobilyaci: {
    emoji: "🛋️",
    heroLabel: (city) => `✦ ${city}'nin Mobilya Markası`,
    collectionTitle: "Ürünlerimiz",
    collectionLabel: "KOLEKSİYON",
    productUnit: "ürün",
    ctaTitle: "Hayalinizdeki Mobilyayı Bulalım",
    ctaDesc: "WhatsApp üzerinden 7/24 iletişime geçebilir, özel fiyat alabilirsiniz.",
    trustBar: [
      ["🚚", "Ücretsiz Kargo", "Tüm Türkiye"],
      ["🔧", "Ücretsiz Montaj", "Profesyonel ekip"],
      ["🔄", "14 Gün İade", "Koşulsuz"],
      ["💳", "9 Taksit", "Tüm kartlara"],
    ],
  },
  kuyumcu: {
    emoji: "💎",
    heroLabel: (city) => `✦ ${city}'nin Kuyumcusu`,
    collectionTitle: "Koleksiyonumuz",
    collectionLabel: "MÜCEVHERAT",
    productUnit: "ürün",
    ctaTitle: "Işıltınızı Tamamlayın",
    ctaDesc: "WhatsApp üzerinden özel tasarım ve fiyat bilgisi alabilirsiniz.",
    trustBar: [
      ["📜", "Sertifikalı", "GIA / IGI belgeli"],
      ["🚚", "Ücretsiz Kargo", "Sigortalı gönderim"],
      ["🎁", "Hediye Paketi", "Özel kutulama"],
      ["💳", "12 Taksit", "Tüm kartlara"],
    ],
  },
  cafe: {
    emoji: "☕",
    heroLabel: (city) => `✦ ${city}'nin Lezzet Durağı`,
    collectionTitle: "Menümüz",
    collectionLabel: "MENÜ",
    productUnit: "ürün",
    ctaTitle: "Siparişinizi Verin",
    ctaDesc: "WhatsApp üzerinden hızlıca sipariş verebilirsiniz.",
    trustBar: [
      ["🌿", "Taze Malzeme", "Her gün taze"],
      ["🚴", "Hızlı Teslimat", "30 dakikada kapında"],
      ["🧑‍🍳", "Şef Yapımı", "Profesyonel mutfak"],
      ["📱", "Online Sipariş", "Kolay ve hızlı"],
    ],
  },
  "oto-galeri": {
    emoji: "🚗",
    heroLabel: (city) => `✦ ${city}'nin Güvenilir Galerisi`,
    collectionTitle: "Araçlarımız",
    collectionLabel: "STOK",
    productUnit: "araç",
    ctaTitle: "Hayalinizdeki Araç Burada",
    ctaDesc: "WhatsApp üzerinden detaylı bilgi ve randevu alabilirsiniz.",
    trustBar: [
      ["✅", "Ekspertiz Raporlu", "Detaylı kontrol"],
      ["📋", "Tramer Sorgusu", "Şeffaf geçmiş"],
      ["🔄", "Takas İmkanı", "Aracınızı değerlendirin"],
      ["💳", "Kredi İmkanı", "Uygun faiz oranları"],
    ],
  },
  tanitim: {
    emoji: "🏢",
    heroLabel: (city) => `✦ ${city}'de Profesyonel Hizmet`,
    collectionTitle: "Hizmetlerimiz",
    collectionLabel: "HİZMETLER",
    productUnit: "hizmet",
    ctaTitle: "Sizinle Çalışmak İsteriz",
    ctaDesc: "WhatsApp üzerinden bilgi alabilir, teklif isteyebilirsiniz.",
    trustBar: [
      ["✅", "Profesyonel Hizmet", "Uzman ekip"],
      ["📅", "Yıllık Deneyim", "Sektörde güvenilir"],
      ["⭐", "Müşteri Memnuniyeti", "%100 memnuniyet"],
      ["📞", "7/24 Destek", "Her zaman ulaşılabilir"],
    ],
  },
  restoran: {
    emoji: "🍽️",
    heroLabel: (city) => `✦ ${city}'nin Lezzet Adresi`,
    collectionTitle: "Menümüz",
    collectionLabel: "MENÜ",
    productUnit: "yemek",
    ctaTitle: "Rezervasyon Yapın",
    ctaDesc: "WhatsApp üzerinden rezervasyon yapabilir, menü hakkında bilgi alabilirsiniz.",
    trustBar: [
      ["🥬", "Taze Malzeme", "Günlük tedarik"],
      ["📋", "Günlük Menü", "Her gün yenilenir"],
      ["⚡", "Hızlı Servis", "Bekletmeden"],
      ["🧼", "Hijyen Sertifikalı", "A sınıfı"],
    ],
  },
  portfolyo: {
    emoji: "🎨",
    heroLabel: (city) => `✦ Yaratıcı Tasarım Stüdyosu`,
    collectionTitle: "Projelerimiz",
    collectionLabel: "PORTFOLYO",
    productUnit: "proje",
    ctaTitle: "Projenizi Konuşalım",
    ctaDesc: "WhatsApp üzerinden proje detayları ve fiyat bilgisi alabilirsiniz.",
    trustBar: [
      ["🏆", "Ödül Kazanan", "Yaratıcı projeler"],
      ["💡", "Yaratıcı Çözümler", "Özgün tasarımlar"],
      ["⏰", "Zamanında Teslim", "Söz verilen sürede"],
      ["🤝", "Müşteri Odaklı", "İhtiyaca özel"],
    ],
  },
  kuafor: {
    emoji: "💇",
    heroLabel: (city) => `✦ ${city}'nin Güzellik Merkezi`,
    collectionTitle: "Hizmetlerimiz",
    collectionLabel: "HİZMETLER",
    productUnit: "hizmet",
    ctaTitle: "Randevunuzu Alın",
    ctaDesc: "WhatsApp üzerinden hızlıca randevu oluşturabilirsiniz.",
    trustBar: [
      ["👩‍🔬", "Uzman Kadro", "Sertifikalı ekip"],
      ["🧼", "Hijyenik Ortam", "Steril malzeme"],
      ["📅", "Online Randevu", "Hızlı & kolay"],
      ["⭐", "Müşteri Memnuniyeti", "%98 memnuniyet"],
    ],
  },
};

function getSectorConfig(store) {
  const sector = store.settings?.sector || "mobilyaci";
  return SECTOR_CONFIG[sector] || SECTOR_CONFIG.mobilyaci;
}

export default async function StorePage({ params, searchParams }) {
  const { store: slug } = await params;
  const sp = await searchParams;
  const store = await getStore(slug);
  if (!store) notFound();

  const config = getSectorConfig(store);
  const categories = await getCategories(store.id);
  const categoryFilter = sp?.kategori || null;
  const products = await getProducts(store.id, categoryFilter);

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(44,36,32,0.05) 1px, transparent 0)", backgroundSize: "32px 32px" }}>
        <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-[var(--color-accent)] mb-3">
              {config.heroLabel(store.city)}
            </p>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-[1.1] mb-4">
              {store.name}
            </h1>
            <p className="text-base text-[var(--color-muted)] leading-relaxed mb-8 max-w-lg">
              {store.description}
            </p>
            <div className="flex flex-wrap gap-6 text-sm">
              {store.phone && (
                <a href={`tel:${store.phone}`} className="flex items-center gap-1.5 text-[var(--color-muted)] hover:text-[var(--color-brand)]">
                  📞 {store.phone}
                </a>
              )}
              {store.address && (
                <span className="text-[var(--color-muted)]">📍 {store.address}</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-[var(--color-accent)] mb-1">{config.collectionLabel}</p>
            <h2 className="text-3xl font-bold tracking-tight">{config.collectionTitle}</h2>
          </div>
          <p className="text-sm text-[var(--color-muted)]">{products.length} {config.productUnit}</p>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap mb-8">
          <a
            href={`/${slug}`}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
              !categoryFilter
                ? "bg-[var(--color-brand)] text-white border-[var(--color-brand)]"
                : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
            }`}
          >
            Tümü
          </a>
          {categories.map((cat) => (
            <a
              key={cat.id}
              href={`/${slug}?kategori=${cat.slug}`}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                categoryFilter === cat.slug
                  ? "bg-[var(--color-brand)] text-white border-[var(--color-brand)]"
                  : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
              }`}
            >
              {cat.name}
            </a>
          ))}
        </div>

        <ProductGrid products={products} storeSlug={slug} productEmoji={config.emoji} whatsapp={store.whatsapp} />
      </section>

      {/* Trust Bar */}
      <section className="bg-[var(--color-brand)] text-white">
        <div className="max-w-6xl mx-auto px-4 py-10 flex flex-wrap justify-around gap-8 text-center">
          {(store.settings?.trustBar || config.trustBar).map((item) => {
            const [icon, title, sub] = Array.isArray(item) ? item : [item.icon, item.title, item.subtitle];
            return (
              <div key={title}>
                <p className="text-2xl mb-1">{icon}</p>
                <p className="font-bold text-sm">{title}</p>
                <p className="text-xs text-white/60">{sub}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* WhatsApp CTA */}
      {store.whatsapp && (
        <section className="py-16 px-4 text-center">
          <h2 className="text-2xl font-bold mb-3">{config.ctaTitle}</h2>
          <p className="text-[var(--color-muted)] mb-6 max-w-md mx-auto">
            {config.ctaDesc}
          </p>
          <a
            href={`https://wa.me/${store.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3.5 rounded-full transition-colors"
          >
            💬 WhatsApp ile Yaz
          </a>
        </section>
      )}
    </main>
  );
}
