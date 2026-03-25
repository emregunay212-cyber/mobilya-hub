import type { SectorDefinition } from "@/lib/types/sectors";

export const tanitim: SectorDefinition = {
  id: "tanitim",
  name: "Kurumsal Tanıtım",
  icon: "🏢",
  description: "Firma tanıtım ve kurumsal web sitesi",
  siteType: "showcase",
  defaultCategories: [
    { name: "Hakkımızda", slug: "hakkimizda", icon: "📋" },
    { name: "Hizmetlerimiz", slug: "hizmetlerimiz", icon: "⚙️" },
    { name: "Referanslarımız", slug: "referanslarimiz", icon: "🤝" },
    { name: "İletişim", slug: "iletisim", icon: "📞" },
  ],
  compatibleThemes: ["modern-minimal", "navy-gold", "classic-warm", "cream-elegant", "business-blue"],
  defaultTheme: "business-blue",
  heroTemplate: "standard",
  trustBarItems: [
    { icon: "✅", title: "Profesyonel Hizmet", subtitle: "Alanında uzman ekip" },
    { icon: "📅", title: "Yıllık Deneyim", subtitle: "Sektörde güvenilir" },
    { icon: "⭐", title: "Müşteri Memnuniyeti", subtitle: "%100 memnuniyet" },
    { icon: "📞", title: "7/24 Destek", subtitle: "Her zaman ulaşılabilir" },
  ],
  productMetadataFields: [],
  ctaText: {
    whatsapp: "WhatsApp ile İletişime Geç",
    addToCart: "Detaylı Bilgi Al",
    heroSubtitle: "Profesyonel çözümler, güvenilir hizmet",
  },
  productLabel: "Hizmet",
  productEmoji: "⚙️",
};
