"use client";

import { useEffect } from "react";
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

export default function InfoStep({ data, update, onNext, onPrev }: Props) {
  // Auto-generate slug from name
  useEffect(() => {
    if (data.name) {
      update({ slug: slugify(data.name) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.name]);

  const canContinue = data.name.trim() && data.slug.trim() && data.phone.trim();

  // Sektore gore placeholder
  const placeholders: Record<string, { name: string; slug: string; email: string; instagram: string; address: string }> = {
    mobilyaci: { name: "Guzel Mobilya", slug: "guzel-mobilya", email: "info@guzelmobilya.com", instagram: "@guzelmobilya", address: "Sanayi Sitesi No:12" },
    kuyumcu: { name: "Altin Dunyasi", slug: "altin-dunyasi", email: "info@altindunyasi.com", instagram: "@altindunyasi", address: "Kuyumcular Carsisi No:5" },
    cafe: { name: "Lezzet Cafe", slug: "lezzet-cafe", email: "info@lezzetcafe.com", instagram: "@lezzetcafe", address: "Sahil Yolu Cad. No:8" },
    "oto-galeri": { name: "Guven Otomotiv", slug: "guven-otomotiv", email: "info@guvenotomotiv.com", instagram: "@guvenotomotiv", address: "Oto Sanayi Sitesi No:15" },
  };
  const ph = placeholders[data.sector] || placeholders.mobilyaci;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-1" style={{ color: "#E5E7EB" }}>
        Magaza Bilgileri
      </h2>
      <p className="text-sm mb-6" style={{ color: "#9CA3AF" }}>
        Magazanizin temel bilgilerini girin
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          label="Magaza Adi *"
          value={data.name}
          onChange={(v) => update({ name: v })}
          placeholder={`Ornek: ${ph.name}`}
        />
        <Field
          label="Slug (URL)"
          value={data.slug}
          onChange={(v) => update({ slug: v })}
          placeholder={ph.slug}
          hint="Otomatik olusturulur"
        />
        <Field
          label="Telefon *"
          value={data.phone}
          onChange={(v) => update({ phone: v })}
          placeholder="0532 123 4567"
        />
        <Field
          label="WhatsApp"
          value={data.whatsapp}
          onChange={(v) => update({ whatsapp: v })}
          placeholder="905321234567"
        />
        <Field
          label="Email"
          value={data.email}
          onChange={(v) => update({ email: v })}
          placeholder={ph.email}
        />
        <Field
          label="Sehir"
          value={data.city}
          onChange={(v) => update({ city: v })}
          placeholder="Istanbul"
        />
        <Field
          label="Instagram"
          value={data.instagram}
          onChange={(v) => update({ instagram: v })}
          placeholder={ph.instagram}
        />
        <Field
          label="Adres"
          value={data.address}
          onChange={(v) => update({ address: v })}
          placeholder={ph.address}
        />
      </div>

      <div className="mt-4">
        <label className="block text-xs mb-1" style={{ color: "#9CA3AF" }}>
          Aciklama
        </label>
        <textarea
          value={data.description}
          onChange={(e) => update({ description: e.target.value })}
          rows={3}
          placeholder="Magazanizi kisa bir cumle ile tanitin..."
          className="w-full px-3 py-2 rounded-lg border text-sm outline-none placeholder:text-gray-600"
          style={{ background: "#0F1117", borderColor: "#2A2D37", color: "#E5E7EB" }}
        />
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
          disabled={!canContinue}
          className="px-6 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-30 transition-opacity"
          style={{ background: "#6366F1" }}
        >
          Devam
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs mb-1" style={{ color: "#9CA3AF" }}>
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg border text-sm outline-none placeholder:text-gray-600"
        style={{ background: "#0F1117", borderColor: "#2A2D37", color: "#E5E7EB" }}
      />
      {hint && (
        <p className="text-[10px] mt-0.5" style={{ color: "#6366F1" }}>
          {hint}
        </p>
      )}
    </div>
  );
}
