"use client";

import { useEffect, useState } from "react";
import { getSectorById } from "@/lib/sectors";
import type { WizardData } from "./index";

interface Props {
  data: WizardData;
  update: (partial: Partial<WizardData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

function slugify(t: string) {
  return t
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function CategoryStep({ data, update, onNext, onPrev }: Props) {
  const [newCatName, setNewCatName] = useState("");

  // Pre-populate from sector defaults if empty
  useEffect(() => {
    if (data.categories.length === 0 && data.sector) {
      const sector = getSectorById(data.sector);
      if (sector) {
        update({ categories: [...sector.defaultCategories] });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.sector]);

  function addCategory() {
    const name = newCatName.trim();
    if (!name) return;
    const slug = slugify(name);
    if (data.categories.some((c) => c.slug === slug)) return;
    update({ categories: [...data.categories, { name, slug }] });
    setNewCatName("");
  }

  function removeCategory(slug: string) {
    update({ categories: data.categories.filter((c) => c.slug !== slug) });
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-1" style={{ color: "#E5E7EB" }}>
        Kategoriler
      </h2>
      <p className="text-sm mb-6" style={{ color: "#9CA3AF" }}>
        Magazanizin urun kategorilerini duzenleyin
      </p>

      {/* Category list */}
      <div className="space-y-2 mb-4">
        {data.categories.map((cat) => (
          <div
            key={cat.slug}
            className="flex items-center justify-between p-3 rounded-lg"
            style={{ background: "#0F1117" }}
          >
            <div className="flex items-center gap-2">
              {cat.icon && <span>{cat.icon}</span>}
              <span className="text-sm" style={{ color: "#E5E7EB" }}>
                {cat.name}
              </span>
              <span className="text-xs" style={{ color: "#9CA3AF" }}>
                /{cat.slug}
              </span>
            </div>
            <button
              onClick={() => removeCategory(cat.slug)}
              className="text-xs px-2 py-1 rounded"
              style={{ color: "#EF4444" }}
            >
              Kaldir
            </button>
          </div>
        ))}
      </div>

      {/* Add new */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCategory()}
          placeholder="Yeni kategori adi..."
          className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none placeholder:text-gray-600"
          style={{ background: "#0F1117", borderColor: "#2A2D37", color: "#E5E7EB" }}
        />
        <button
          onClick={addCategory}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: "#6366F1" }}
        >
          Ekle
        </button>
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
          disabled={data.categories.length === 0}
          className="px-6 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-30 transition-opacity"
          style={{ background: "#6366F1" }}
        >
          Devam
        </button>
      </div>
    </div>
  );
}
