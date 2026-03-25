import type { SectorDefinition } from "@/lib/types/sectors";

export const kuyumcu: SectorDefinition = {
  id: "kuyumcu",
  name: "Kuyumcu",
  icon: "💎",
  description: "Kuyumcu ve mücevherat mağazaları için web sitesi",
  siteType: "ecommerce",
  defaultCategories: [
    { name: "Yüzük", slug: "yuzuk", icon: "💍" },
    { name: "Kolye", slug: "kolye", icon: "📿" },
    { name: "Bileklik", slug: "bileklik", icon: "⌚" },
    { name: "Küpe", slug: "kupe", icon: "✨" },
    { name: "Set Takım", slug: "set-takim", icon: "💎" },
    { name: "Pırlanta", slug: "pirlanta", icon: "💠" },
    { name: "Altın", slug: "altin", icon: "🥇" },
  ],
  compatibleThemes: ["navy-gold", "cream-elegant", "modern-minimal", "jewel-sparkle", "midnight-luxe", "rose-garden"],
  defaultTheme: "navy-gold",
  heroTemplate: "fullwidth",
  trustBarItems: [
    { icon: "📜", title: "Sertifikalı", subtitle: "GIA / IGI belgeli" },
    { icon: "🚚", title: "Ücretsiz Kargo", subtitle: "Sigortalı gönderim" },
    { icon: "🎁", title: "Hediye Paketi", subtitle: "Özel kutulama" },
    { icon: "💳", title: "12 Taksit", subtitle: "Tüm kartlara" },
  ],
  productMetadataFields: [
    { key: "karat", label: "Ayar", type: "select", options: ["8K", "14K", "18K", "22K", "24K"] },
    { key: "stone", label: "Taş", type: "text" },
    { key: "weight_grams", label: "Ağırlık (gr)", type: "number" },
    { key: "certificate", label: "Sertifika", type: "text" },
  ],
  ctaText: {
    whatsapp: "WhatsApp ile Bilgi Al",
    addToCart: "Sepete Ekle",
    heroSubtitle: "Işıltınızı tamamlayın",
  },
  productLabel: "Ürün",
  productEmoji: "💎",
};
