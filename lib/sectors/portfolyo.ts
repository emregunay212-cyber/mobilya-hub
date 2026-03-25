import type { SectorDefinition } from "@/lib/types/sectors";

export const portfolyo: SectorDefinition = {
  id: "portfolyo",
  name: "Portfolyo",
  icon: "🎨",
  description: "Tasarım, fotoğraf ve portfolyo web sitesi",
  siteType: "portfolio",
  defaultCategories: [
    { name: "Web Tasarım", slug: "web-tasarim", icon: "🖥️" },
    { name: "Grafik Tasarım", slug: "grafik-tasarim", icon: "🎨" },
    { name: "Fotoğraf", slug: "fotograf", icon: "📸" },
    { name: "Video", slug: "video", icon: "🎬" },
  ],
  compatibleThemes: ["modern-minimal", "navy-gold", "cream-elegant", "business-blue", "midnight-luxe", "ocean-breeze", "slate-corporate", "cherry-bold"],
  defaultTheme: "modern-minimal",
  heroTemplate: "fullwidth",
  trustBarItems: [
    { icon: "🏆", title: "Ödül Kazanan", subtitle: "Yaratıcı projeler" },
    { icon: "💡", title: "Yaratıcı Çözümler", subtitle: "Özgün tasarımlar" },
    { icon: "⏰", title: "Zamanında Teslim", subtitle: "Söz verilen sürede" },
    { icon: "🤝", title: "Müşteri Odaklı", subtitle: "İhtiyaca özel" },
  ],
  productMetadataFields: [
    { key: "client", label: "Müşteri", type: "text" },
    { key: "year", label: "Yıl", type: "text" },
    { key: "tools", label: "Kullanılan Araçlar", type: "text" },
  ],
  ctaText: {
    whatsapp: "WhatsApp ile İletişime Geç",
    addToCart: "Projeyi İncele",
    heroSubtitle: "Yaratıcı tasarımlar, etkileyici projeler",
  },
  productLabel: "Proje",
  productEmoji: "🎨",
};
