"use client";

import { getThemesBySector } from "@/lib/themes";
import type { WizardData } from "./index";

interface Props {
  data: WizardData;
  update: (partial: Partial<WizardData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function ThemeStep({ data, update, onNext, onPrev }: Props) {
  const themes = getThemesBySector(data.sector);

  function selectTheme(themeId: string) {
    update({ theme: themeId });
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-1" style={{ color: "#E5E7EB" }}>
        Tema Secin
      </h2>
      <p className="text-sm mb-6" style={{ color: "#9CA3AF" }}>
        Magazanizin gorunumunu belirleyin
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {themes.map((theme) => {
          const selected = data.theme === theme.id;
          return (
            <button
              key={theme.id}
              onClick={() => selectTheme(theme.id)}
              className="text-left p-4 rounded-xl border-2 transition-all"
              style={{
                background: selected ? "rgba(99,102,241,0.08)" : "#0F1117",
                borderColor: selected ? "#6366F1" : "#2A2D37",
              }}
            >
              {/* Color preview */}
              <div className="flex gap-1 mb-3">
                {theme.colors.map((c, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full"
                    style={{ background: c }}
                  />
                ))}
              </div>

              <p className="font-semibold text-sm" style={{ color: "#E5E7EB" }}>
                {theme.name}
              </p>
              <p className="text-xs mt-1" style={{ color: "#9CA3AF" }}>
                {theme.desc}
              </p>

              <div className="flex gap-1 mt-2">
                {theme.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{ background: "#2A2D37", color: "#9CA3AF" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={onPrev}
          className="px-6 py-2.5 rounded-lg text-sm font-medium"
          style={{ background: "#2A2D37", color: "#9CA3AF" }}
        >
          Geri
        </button>
        <button
          onClick={onNext}
          disabled={!data.theme}
          className="px-6 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-30 transition-opacity"
          style={{ background: "#6366F1" }}
        >
          Devam
        </button>
      </div>
    </div>
  );
}
