import type { SectorDefinition } from "@/lib/types/sectors";
import { mobilyaci } from "./mobilyaci";
import { kuyumcu } from "./kuyumcu";
import { cafe } from "./cafe";
import { otoGaleri } from "./oto-galeri";

export const SECTORS: SectorDefinition[] = [mobilyaci, kuyumcu, cafe, otoGaleri];

export function getSectorById(id: string): SectorDefinition | undefined {
  return SECTORS.find((s) => s.id === id);
}

export function getSectorBySlug(slug: string): SectorDefinition | undefined {
  return SECTORS.find((s) => s.id === slug);
}
