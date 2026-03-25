"use client";

import { SECTORS, SITE_TYPE_LABELS } from "@/lib/sectors";
import type { SiteType } from "@/lib/types/sectors";
import type { WizardData } from "./index";

interface Props {
  data: WizardData;
  update: (partial: Partial<WizardData>) => void;
  onNext: () => void;
}

const SITE_TYPE_ORDER: SiteType[] = ["ecommerce", "showcase", "menu", "portfolio", "appointment"];

export default function SectorStep({ data, update, onNext }: Props) {
  function selectSector(sectorId: string) {
    update({ sector: sectorId, theme: "", categories: [] });
  }

  // Group sectors by site type
  const grouped = SITE_TYPE_ORDER.map((type) => ({
    type,
    label: SITE_TYPE_LABELS[type],
    sectors: SECTORS.filter((s) => s.siteType === type),
  })).filter((g) => g.sectors.length > 0);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-1" style={{ color: "#E5E7EB" }}>
        Site Tipi & Sektor Secin
      </h2>
      <p className="text-sm mb-6" style={{ color: "#9CA3AF" }}>
        Olusturmak istediginiz web sitesi tipini secin
      </p>

      {grouped.map((group) => (
        <div key={group.type} className="mb-6">
          <h3
            className="text-xs font-semibold uppercase tracking-wider mb-3 px-1"
            style={{ color: "#6366F1" }}
          >
            {group.label}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {group.sectors.map((sector) => {
              const selected = data.sector === sector.id;
              return (
                <button
                  key={sector.id}
                  onClick={() => selectSector(sector.id)}
                  className="text-left p-4 rounded-xl border-2 transition-all"
                  style={{
                    background: selected ? "rgba(99,102,241,0.08)" : "#0F1117",
                    borderColor: selected ? "#6366F1" : "#2A2D37",
                  }}
                >
                  <div className="text-2xl mb-2">{sector.icon}</div>
                  <p className="font-semibold text-sm" style={{ color: "#E5E7EB" }}>
                    {sector.name}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#9CA3AF" }}>
                    {sector.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex justify-end mt-6">
        <button
          onClick={onNext}
          disabled={!data.sector}
          className="px-6 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-30 transition-opacity"
          style={{ background: "#6366F1" }}
        >
          Devam
        </button>
      </div>
    </div>
  );
}
