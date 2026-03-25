import type { SectorDefinition } from "@/lib/types/sectors";

export const kuafor: SectorDefinition = {
  id: "kuafor",
  name: "Kuaför & Güzellik",
  icon: "💇",
  description: "Kuaför, güzellik salonu ve randevu web sitesi",
  siteType: "appointment",
  defaultCategories: [
    { name: "Saç Bakımı", slug: "sac-bakimi", icon: "💇" },
    { name: "Cilt Bakımı", slug: "cilt-bakimi", icon: "✨" },
    { name: "Tırnak", slug: "tirnak", icon: "💅" },
    { name: "Makyaj", slug: "makyaj", icon: "💄" },
    { name: "Epilasyon", slug: "epilasyon", icon: "🌟" },
  ],
  compatibleThemes: ["cream-elegant", "modern-minimal", "classic-warm", "salon-chic"],
  defaultTheme: "salon-chic",
  heroTemplate: "standard",
  trustBarItems: [
    { icon: "👩‍🔬", title: "Uzman Kadro", subtitle: "Sertifikalı ekip" },
    { icon: "🧼", title: "Hijyenik Ortam", subtitle: "Steril malzeme" },
    { icon: "📅", title: "Online Randevu", subtitle: "Hızlı & kolay" },
    { icon: "⭐", title: "Müşteri Memnuniyeti", subtitle: "%98 memnuniyet" },
  ],
  productMetadataFields: [
    { key: "duration", label: "Süre (dk)", type: "number" },
    { key: "price_range", label: "Fiyat Aralığı", type: "text" },
  ],
  ctaText: {
    whatsapp: "WhatsApp ile Randevu Al",
    addToCart: "Randevu Al",
    heroSubtitle: "Uzman eller, doğal güzellik",
  },
  productLabel: "Hizmet",
  productEmoji: "💇",
};
