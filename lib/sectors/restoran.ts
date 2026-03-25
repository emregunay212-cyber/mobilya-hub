import type { SectorDefinition } from "@/lib/types/sectors";

export const restoran: SectorDefinition = {
  id: "restoran",
  name: "Restoran Menü",
  icon: "🍽️",
  description: "Restoran menü ve QR kod destekli web sitesi",
  siteType: "menu",
  defaultCategories: [
    { name: "Ana Yemekler", slug: "ana-yemekler", icon: "🥩" },
    { name: "Başlangıçlar", slug: "baslangiclar", icon: "🥗" },
    { name: "Tatlılar", slug: "tatlilar", icon: "🍰" },
    { name: "İçecekler", slug: "icecekler", icon: "🥤" },
    { name: "Kahvaltı", slug: "kahvalti", icon: "🍳" },
  ],
  compatibleThemes: ["classic-warm", "cafe-cozy", "modern-minimal", "forest-natural", "cream-elegant"],
  defaultTheme: "cafe-cozy",
  heroTemplate: "carousel",
  trustBarItems: [
    { icon: "🥬", title: "Taze Malzeme", subtitle: "Günlük tedarik" },
    { icon: "📋", title: "Günlük Menü", subtitle: "Her gün yenilenir" },
    { icon: "⚡", title: "Hızlı Servis", subtitle: "Bekletmeden" },
    { icon: "🧼", title: "Hijyen Sertifikalı", subtitle: "A sınıfı işletme" },
  ],
  productMetadataFields: [
    { key: "calories", label: "Kalori", type: "number" },
    { key: "portion", label: "Porsiyon", type: "text" },
    { key: "allergens", label: "Alerjenler", type: "text" },
    { key: "prep_time", label: "Hazırlanma Süresi", type: "text" },
  ],
  ctaText: {
    whatsapp: "WhatsApp ile Sipariş Ver",
    addToCart: "Menüye Bak",
    heroSubtitle: "Taze lezzetler, unutulmaz tatlar",
  },
  productLabel: "Menü",
  productEmoji: "🍽️",
};
