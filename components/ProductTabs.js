"use client";

import { useState } from "react";

export default function ProductTabs({ description, metadata = {}, sectorFeatures = [] }) {
  const [activeTab, setActiveTab] = useState(0);

  const metaEntries = Object.entries(metadata).filter(([, v]) => v);
  const hasMeta = metaEntries.length > 0;
  const hasFeatures = sectorFeatures.length > 0;

  const tabs = [
    { label: "Detay", show: true },
    { label: "Ozellikler", show: hasMeta },
    { label: "Teslimat", show: hasFeatures },
  ].filter((t) => t.show);

  if (tabs.length === 0 && !description) return null;

  return (
    <div className="mt-8">
      {/* Tab headers */}
      <div className="flex border-b border-[var(--color-border)]">
        {tabs.map((tab, idx) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(idx)}
            className="px-5 py-3 text-sm font-semibold transition-colors relative"
            style={{
              color: activeTab === idx ? "var(--color-accent)" : "var(--color-muted)",
            }}
          >
            {tab.label}
            {activeTab === idx && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-accent)]" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="py-5">
        {/* Detay tab */}
        {tabs[activeTab]?.label === "Detay" && (
          <div className="text-sm leading-relaxed text-[var(--color-muted)]">
            {description || "Urun detayi bulunmuyor."}
          </div>
        )}

        {/* Ozellikler tab */}
        {tabs[activeTab]?.label === "Ozellikler" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {metaEntries.map(([key, value]) => (
              <div
                key={key}
                className="flex justify-between p-3 rounded-lg bg-[var(--color-border)]/20"
              >
                <span className="text-sm text-[var(--color-muted)] capitalize">
                  {key.replace(/_/g, " ")}
                </span>
                <span className="text-sm font-medium">{String(value)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Teslimat tab */}
        {tabs[activeTab]?.label === "Teslimat" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sectorFeatures.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-border)]/20"
              >
                <span className="text-lg">{feature.icon || "✓"}</span>
                <span className="text-sm">{feature.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
