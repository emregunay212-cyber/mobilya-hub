"use client";

import { useState } from "react";
import Image from "next/image";

export default function ProductGallery({ images = [], name = "", emoji = "🛋️" }) {
  const [selected, setSelected] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square rounded-2xl bg-gradient-to-br from-[var(--color-border)]/30 to-[var(--color-border)]/10 flex items-center justify-center">
        <span className="text-8xl">{emoji}</span>
      </div>
    );
  }

  return (
    <div>
      {/* Main image */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-[var(--color-border)]/30 to-[var(--color-border)]/10 mb-3">
        <Image
          src={images[selected]}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
        {/* Image counter */}
        {images.length > 1 && (
          <span className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
            {selected + 1} / {images.length}
          </span>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollSnapType: "x mandatory" }}>
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelected(idx)}
              className="shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all"
              style={{
                borderColor: idx === selected ? "var(--color-accent)" : "var(--color-border)",
                opacity: idx === selected ? 1 : 0.6,
                scrollSnapAlign: "start",
              }}
            >
              <Image
                src={img}
                alt={`${name} ${idx + 1}`}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
