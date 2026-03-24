"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function BannerSlider({ banners = [] }) {
  const [current, setCurrent] = useState(0);

  const active = banners.filter((b) => {
    if (!b.is_active) return false;
    if (b.expires_at && new Date(b.expires_at) < new Date()) return false;
    return true;
  });

  useEffect(() => {
    if (active.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % active.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [active.length]);

  if (active.length === 0) return null;

  const banner = active[current];

  return (
    <div className="relative overflow-hidden rounded-2xl mb-8">
      <div
        className="relative min-h-[200px] sm:min-h-[280px] flex items-center justify-center p-8 text-center transition-all duration-500"
        style={{
          background: banner.image_url
            ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.5)), url(${banner.image_url}) center/cover`
            : "linear-gradient(135deg, var(--color-brand), var(--color-accent))",
        }}
      >
        <div className="relative z-10 max-w-lg">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{banner.title}</h2>
          {banner.subtitle && (
            <p className="text-sm sm:text-base text-white/80 mb-4">{banner.subtitle}</p>
          )}
          {banner.link_url && (
            <Link
              href={banner.link_url}
              className="inline-block px-6 py-2.5 bg-white text-gray-800 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-colors"
            >
              Kesfet
            </Link>
          )}
        </div>
      </div>

      {/* Dots */}
      {active.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {active.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className="w-2 h-2 rounded-full transition-all"
              style={{
                background: idx === current ? "#fff" : "rgba(255,255,255,0.4)",
                width: idx === current ? "16px" : "8px",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
