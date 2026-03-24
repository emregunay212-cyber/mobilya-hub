/**
 * Sector template type definitions.
 */

export interface ProductMetadataField {
  key: string;
  label: string;
  type: "text" | "number" | "select";
  options?: string[];
  required?: boolean;
}

export interface TrustBarItem {
  icon: string;
  title: string;
  subtitle: string;
}

export interface SectorDefinition {
  id: string;
  name: string;
  icon: string;
  description: string;
  defaultCategories: { name: string; slug: string; icon?: string }[];
  compatibleThemes: string[];
  defaultTheme: string;
  heroTemplate: "standard" | "fullwidth" | "split" | "carousel";
  trustBarItems: TrustBarItem[];
  productMetadataFields: ProductMetadataField[];
  ctaText: {
    whatsapp: string;
    addToCart: string;
    heroSubtitle: string;
  };
  productLabel: string; // "Urun" / "Menu" / "Arac" etc.
  productEmoji: string; // Default emoji when no image
}
