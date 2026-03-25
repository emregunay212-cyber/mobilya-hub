"use client";

import { getThemeById } from "@/lib/themes";
import { getSectorById } from "@/lib/sectors";

interface Props {
  themeId: string;
  sectorId: string;
}

export default function ThemePreview({ themeId, sectorId }: Props) {
  const theme = getThemeById(themeId);
  const sector = getSectorById(sectorId);
  if (!theme || !sector) return null;

  const p = theme.palette;
  const cats = sector.defaultCategories.slice(0, 3);
  const trust = sector.trustBarItems.slice(0, 4);

  return (
    <div
      className="rounded-xl overflow-hidden border text-[11px]"
      style={{ background: p.warm, color: p.text, borderColor: p.border }}
    >
      {/* Navbar */}
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ background: p.brand }}
      >
        <span className="font-bold text-white text-xs">Magaza Adi</span>
        <div className="flex gap-2">
          <span style={{ color: "rgba(255,255,255,0.7)" }}>📞</span>
          <span style={{ color: "rgba(255,255,255,0.7)" }}>🛒</span>
        </div>
      </div>

      {/* Hero */}
      <div className="px-4 py-5" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0)", backgroundSize: "16px 16px" }}>
        <p className="font-bold tracking-widest uppercase mb-1" style={{ color: p.accent, fontSize: "8px" }}>
          {sector.icon} {sector.name}
        </p>
        <p className="font-bold text-sm leading-tight" style={{ color: p.text }}>
          Ornek Magaza
        </p>
        <p className="mt-1" style={{ color: p.muted, fontSize: "9px" }}>
          {sector.ctaText.heroSubtitle}
        </p>
      </div>

      {/* Category Tabs */}
      <div className="px-3 py-2 flex gap-1.5">
        <span
          className="px-2 py-0.5 rounded-full font-medium"
          style={{ background: p.brand, color: "#fff", fontSize: "8px" }}
        >
          Tumu
        </span>
        {cats.map((cat) => (
          <span
            key={cat.slug}
            className="px-2 py-0.5 rounded-full"
            style={{ background: p.border, color: p.muted, fontSize: "8px" }}
          >
            {cat.name}
          </span>
        ))}
      </div>

      {/* Product Grid */}
      <div className="px-3 pb-3 grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg overflow-hidden" style={{ background: p.border }}>
            <div className="aspect-square" style={{ background: `linear-gradient(135deg, ${p.border}, ${p.muted}40)` }} />
            <div className="p-1.5">
              <p className="font-medium truncate" style={{ fontSize: "8px", color: p.text }}>
                {sector.productLabel} {i}
              </p>
              <p className="font-bold" style={{ fontSize: "9px", color: p.accent }}>
                {i * 1250} TL
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Trust Bar */}
      <div
        className="px-3 py-2.5 grid grid-cols-4 gap-1"
        style={{ background: p.brand }}
      >
        {trust.map((item, i) => (
          <div key={i} className="text-center">
            <div style={{ fontSize: "12px" }}>{item.icon}</div>
            <p className="font-medium leading-tight" style={{ color: "#fff", fontSize: "7px" }}>
              {item.title}
            </p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="px-3 py-3 text-center" style={{ background: p.warm }}>
        <p className="font-bold mb-1" style={{ fontSize: "9px", color: p.text }}>
          {sector.ctaText.whatsapp}
        </p>
        <div
          className="inline-block px-3 py-1 rounded-full font-medium"
          style={{ background: "#25D366", color: "#fff", fontSize: "8px" }}
        >
          WhatsApp
        </div>
      </div>

      {/* Footer */}
      <div
        className="px-3 py-2 text-center"
        style={{ background: p.brand, fontSize: "7px", color: "rgba(255,255,255,0.5)" }}
      >
        WebKoda ile olusturuldu
      </div>
    </div>
  );
}
