import type { SectorDefinition } from "@/lib/types/sectors";

export const mobilyaci: SectorDefinition = {
  id: "mobilyaci",
  name: "Mobilyacı",
  icon: "🛋️",
  description: "Mobilya mağazaları için profesyonel web sitesi",
  siteType: "ecommerce",
  defaultCategories: [
    { name: "Koltuk Takımları", slug: "koltuk-takimlari", icon: "🛋️" },
    { name: "Yatak Odası", slug: "yatak-odasi", icon: "🛏️" },
    { name: "Yemek Odası", slug: "yemek-odasi", icon: "🪑" },
    { name: "TV Ünitesi", slug: "tv-unitesi", icon: "📺" },
    { name: "Genç Odası", slug: "genc-odasi", icon: "🎒" },
    { name: "Mutfak", slug: "mutfak", icon: "🍳" },
  ],
  compatibleThemes: ["classic-warm", "navy-gold", "modern-minimal", "forest-natural", "cream-elegant", "sunset-terracotta", "cherry-bold", "honey-warm"],
  defaultTheme: "classic-warm",
  heroTemplate: "standard",
  trustBarItems: [
    { icon: "🚚", title: "Ücretsiz Kargo", subtitle: "Türkiye geneli" },
    { icon: "🔧", title: "Ücretsiz Montaj", subtitle: "Profesyonel ekip" },
    { icon: "↩️", title: "14 Gün İade", subtitle: "Koşulsuz değişim" },
    { icon: "💳", title: "9 Taksit", subtitle: "Tüm kartlara" },
  ],
  productMetadataFields: [
    { key: "material", label: "Malzeme", type: "text" },
    { key: "dimensions", label: "Boyutlar", type: "text" },
    { key: "color", label: "Renk", type: "text" },
    { key: "weight", label: "Ağırlık (kg)", type: "number" },
  ],
  ctaText: {
    whatsapp: "WhatsApp ile Bilgi Al",
    addToCart: "Sepete Ekle",
    heroSubtitle: "Kaliteli mobilya, uygun fiyat",
  },
  productLabel: "Ürün",
  productEmoji: "🛋️",
};
