import type { SectorDefinition } from "@/lib/types/sectors";

export const otoGaleri: SectorDefinition = {
  id: "oto-galeri",
  name: "Oto Galeri",
  icon: "🚗",
  description: "Oto galeri ve araç satış siteleri için web sitesi",
  siteType: "ecommerce",
  defaultCategories: [
    { name: "Otomobil", slug: "otomobil", icon: "🚗" },
    { name: "SUV", slug: "suv", icon: "🚙" },
    { name: "Ticari Araç", slug: "ticari-arac", icon: "🚐" },
    { name: "Motosiklet", slug: "motosiklet", icon: "🏍️" },
  ],
  compatibleThemes: ["modern-minimal", "navy-gold", "auto-dark"],
  defaultTheme: "modern-minimal",
  heroTemplate: "split",
  trustBarItems: [
    { icon: "✅", title: "Ekspertiz Raporlu", subtitle: "Detaylı kontrol" },
    { icon: "📋", title: "Tramer Sorgusu", subtitle: "Şeffaf geçmiş" },
    { icon: "🔄", title: "Takas İmkanı", subtitle: "Aracınızı değerlendirin" },
    { icon: "💳", title: "Kredi İmkanı", subtitle: "Uygun faiz oranları" },
  ],
  productMetadataFields: [
    { key: "year", label: "Model Yılı", type: "number" },
    { key: "km", label: "Kilometre", type: "number" },
    { key: "fuel_type", label: "Yakıt Tipi", type: "select", options: ["Benzin", "Dizel", "LPG", "Hybrid", "Elektrik"] },
    { key: "transmission", label: "Vites", type: "select", options: ["Manuel", "Otomatik", "Yarı Otomatik"] },
    { key: "engine_cc", label: "Motor (cc)", type: "number" },
    { key: "color", label: "Renk", type: "text" },
    { key: "brand", label: "Marka", type: "text" },
    { key: "model", label: "Model", type: "text" },
  ],
  ctaText: {
    whatsapp: "WhatsApp ile Bilgi Al",
    addToCart: "Randevu Al",
    heroSubtitle: "Hayalinizdeki araç burada",
  },
  productLabel: "Araç",
  productEmoji: "🚗",
};
