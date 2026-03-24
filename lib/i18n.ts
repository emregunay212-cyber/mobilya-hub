/**
 * Simple i18n translation system.
 * Stores use default Turkish. Can be extended per-store via store.settings.language.
 */

type Translations = Record<string, Record<string, string>>;

const translations: Translations = {
  tr: {
    "nav.cart": "Sepet",
    "nav.search": "Urun ara...",
    "product.addToCart": "+ Sepet",
    "product.outOfStock": "Stokta Yok",
    "product.inStock": "Stokta",
    "product.quickView": "Hizli Bak",
    "product.details": "Detay",
    "product.related": "Benzer Urunler",
    "product.reviews": "Yorumlar",
    "cart.title": "Sepetim",
    "cart.empty": "Sepetiniz bos",
    "cart.total": "Toplam",
    "cart.whatsappOrder": "WhatsApp ile Siparis Ver",
    "cart.clear": "Sepeti Temizle",
    "checkout.title": "Siparis Olustur",
    "checkout.delivery": "Teslimat Bilgileri",
    "checkout.payment": "Odeme Yontemi",
    "checkout.summary": "Siparis Ozeti",
    "checkout.confirm": "Siparisi Onayla",
    "checkout.success": "Siparisiniz Alindi!",
    "footer.quickLinks": "Hizli Erisim",
    "footer.contact": "Iletisim",
    "footer.hours": "Calisma Saatleri",
    "footer.newsletter": "Bulten",
    "tracking.title": "Siparis Takip",
    "tracking.search": "Siparis Sorgula",
    "filter.sort": "Siralama",
    "filter.priceAsc": "Fiyat: Dusukten Yuksege",
    "filter.priceDesc": "Fiyat: Yuksekten Dusuge",
    "filter.nameAsc": "A-Z",
    "filter.newest": "En Yeni",
    "filter.stockOnly": "Sadece stokta",
    "common.home": "Ana Sayfa",
    "common.orderTracking": "Siparis Takip",
    "common.allRights": "Tum haklari saklidir",
  },
  en: {
    "nav.cart": "Cart",
    "nav.search": "Search products...",
    "product.addToCart": "+ Cart",
    "product.outOfStock": "Out of Stock",
    "product.inStock": "In Stock",
    "product.quickView": "Quick View",
    "product.details": "Details",
    "product.related": "Related Products",
    "product.reviews": "Reviews",
    "cart.title": "My Cart",
    "cart.empty": "Your cart is empty",
    "cart.total": "Total",
    "cart.whatsappOrder": "Order via WhatsApp",
    "cart.clear": "Clear Cart",
    "checkout.title": "Place Order",
    "checkout.delivery": "Delivery Info",
    "checkout.payment": "Payment Method",
    "checkout.summary": "Order Summary",
    "checkout.confirm": "Confirm Order",
    "checkout.success": "Your order has been placed!",
    "footer.quickLinks": "Quick Links",
    "footer.contact": "Contact",
    "footer.hours": "Working Hours",
    "footer.newsletter": "Newsletter",
    "tracking.title": "Order Tracking",
    "tracking.search": "Track Order",
    "filter.sort": "Sort by",
    "filter.priceAsc": "Price: Low to High",
    "filter.priceDesc": "Price: High to Low",
    "filter.nameAsc": "A-Z",
    "filter.newest": "Newest",
    "filter.stockOnly": "In stock only",
    "common.home": "Home",
    "common.orderTracking": "Order Tracking",
    "common.allRights": "All rights reserved",
  },
};

export function t(key: string, lang = "tr"): string {
  return translations[lang]?.[key] || translations.tr[key] || key;
}

export function getLanguage(store: { settings?: { language?: string } }): string {
  return store?.settings?.language || "tr";
}

export const SUPPORTED_LANGUAGES = [
  { code: "tr", label: "Turkce" },
  { code: "en", label: "English" },
];
