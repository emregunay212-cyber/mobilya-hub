import type { SectorDefinition, SiteType } from "@/lib/types/sectors";
import { mobilyaci } from "./mobilyaci";
import { kuyumcu } from "./kuyumcu";
import { cafe } from "./cafe";
import { otoGaleri } from "./oto-galeri";
import { tanitim } from "./tanitim";
import { restoran } from "./restoran";
import { portfolyo } from "./portfolyo";
import { kuafor } from "./kuafor";

export const SECTORS: SectorDefinition[] = [
  mobilyaci, kuyumcu, cafe, otoGaleri,
  tanitim, restoran, portfolyo, kuafor,
];

export const SITE_TYPE_LABELS: Record<SiteType, string> = {
  ecommerce: "E-Ticaret",
  showcase: "Tanıtım",
  menu: "Menü",
  portfolio: "Portfolyo",
  appointment: "Randevu",
};

export function getSectorsBySiteType(siteType: SiteType): SectorDefinition[] {
  return SECTORS.filter((s) => s.siteType === siteType);
}

export function getSectorById(id: string): SectorDefinition | undefined {
  return SECTORS.find((s) => s.id === id);
}

export function getSectorBySlug(slug: string): SectorDefinition | undefined {
  return SECTORS.find((s) => s.id === slug);
}
