"use client";

import { getThemesBySector } from "@/lib/themes";
import ThemePreview from "./ThemePreview";
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

      <div className="flex gap-6">
        {/* Theme cards */}
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-2 gap-3">
            {themes.map((theme) => {
              const selected = data.theme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => selectTheme(theme.id)}
                  className="text-left p-3 rounded-xl border-2 transition-all"
                  style={{
                    background: selected ? "rgba(99,102,241,0.08)" : "#0F1117",
                    borderColor: selected ? "#6366F1" : "#2A2D37",
                  }}
                >
                  <div className="flex gap-1 mb-2">
                    {theme.colors.map((c, i) => (
                      <div
                        key={i}
                        className="w-5 h-5 rounded-full"
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                  <p className="font-semibold text-xs" style={{ color: "#E5E7EB" }}>
                    {theme.name}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: "#9CA3AF" }}>
                    {theme.desc}
                  </p>
                  <div className="flex gap-1 mt-1.5">
                    {theme.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] px-1.5 py-0.5 rounded-full"
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
        </div>

        {/* Live preview - sticky sidebar */}
        {data.theme && (
          <div className="w-64 flex-shrink-0 hidden lg:block">
            <div className="sticky top-0">
              <p className="text-xs font-medium mb-2" style={{ color: "#9CA3AF" }}>
                Onizleme
              </p>
              <ThemePreview themeId={data.theme} sectorId={data.sector} />
            </div>
          </div>
        )}
      </div>

      {/* Mobile preview - below cards */}
      {data.theme && (
        <div className="mt-4 lg:hidden">
          <p className="text-xs font-medium mb-2" style={{ color: "#9CA3AF" }}>
            Onizleme
          </p>
          <div className="max-w-xs mx-auto">
            <ThemePreview themeId={data.theme} sectorId={data.sector} />
          </div>
        </div>
      )}

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
