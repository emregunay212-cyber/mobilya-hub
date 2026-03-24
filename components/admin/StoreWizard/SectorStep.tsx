"use client";

import { SECTORS } from "@/lib/sectors";
import type { WizardData } from "./index";

interface Props {
  data: WizardData;
  update: (partial: Partial<WizardData>) => void;
  onNext: () => void;
}

export default function SectorStep({ data, update, onNext }: Props) {
  function selectSector(sectorId: string) {
    update({ sector: sectorId, theme: "", categories: [] });
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-1" style={{ color: "#E5E7EB" }}>
        Sektor Secin
      </h2>
      <p className="text-sm mb-6" style={{ color: "#9CA3AF" }}>
        Magazanizin ait oldugu sektoru secin
      </p>

      <div className="grid grid-cols-2 gap-4">
        {SECTORS.map((sector) => {
          const selected = data.sector === sector.id;
          return (
            <button
              key={sector.id}
              onClick={() => selectSector(sector.id)}
              className="text-left p-5 rounded-xl border-2 transition-all"
              style={{
                background: selected ? "rgba(99,102,241,0.08)" : "#0F1117",
                borderColor: selected ? "#6366F1" : "#2A2D37",
              }}
            >
              <div className="text-3xl mb-3">{sector.icon}</div>
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
