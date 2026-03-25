import type { SectorDefinition } from "@/lib/types/sectors";

export const cafe: SectorDefinition = {
  id: "cafe",
  name: "Cafe & Restoran",
  icon: "☕",
  description: "Cafe, restoran ve yeme-içme mekanları için web sitesi",
  siteType: "ecommerce",
  defaultCategories: [
    { name: "Sıcak İçecekler", slug: "sicak-icecekler", icon: "☕" },
    { name: "Soğuk İçecekler", slug: "soguk-icecekler", icon: "🧊" },
    { name: "Kahvaltı", slug: "kahvalti", icon: "🥐" },
    { name: "Tatlılar", slug: "tatlilar", icon: "🍰" },
    { name: "Sandviç & Tost", slug: "sandvic-tost", icon: "🥪" },
    { name: "Salata", slug: "salata", icon: "🥗" },
  ],
  compatibleThemes: ["forest-natural", "modern-minimal", "cream-elegant", "cafe-cozy", "sunset-terracotta", "ocean-breeze", "emerald-fresh", "honey-warm"],
  defaultTheme: "forest-natural",
  heroTemplate: "carousel",
  trustBarItems: [
    { icon: "🌿", title: "Taze Malzeme", subtitle: "Her gün taze" },
    { icon: "🚴", title: "Hızlı Teslimat", subtitle: "30 dakikada kapında" },
    { icon: "🧑‍🍳", title: "Şef Yapımı", subtitle: "Profesyonel mutfak" },
    { icon: "📱", title: "Online Sipariş", subtitle: "Kolay ve hızlı" },
  ],
  productMetadataFields: [
    { key: "allergens", label: "Alerjenler", type: "text" },
    { key: "calories", label: "Kalori", type: "number" },
    { key: "portion_size", label: "Porsiyon", type: "text" },
    { key: "prep_time", label: "Hazırlık Süresi", type: "text" },
  ],
  ctaText: {
    whatsapp: "WhatsApp ile Sipariş Ver",
    addToCart: "Sepete Ekle",
    heroSubtitle: "Lezzetin adresi",
  },
  productLabel: "Menü",
  productEmoji: "☕",
};
