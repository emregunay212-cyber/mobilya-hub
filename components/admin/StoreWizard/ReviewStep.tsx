"use client";

import { SECTORS } from "@/lib/sectors";
import { getThemeById } from "@/lib/themes";
import type { WizardData } from "./index";

interface Props {
  data: WizardData;
  onPrev: () => void;
  onDeploy: () => void;
  deploying: boolean;
}

export default function ReviewStep({ data, onPrev, onDeploy, deploying }: Props) {
  const sector = SECTORS.find((s) => s.id === data.sector);
  const theme = getThemeById(data.theme);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-1" style={{ color: "#E5E7EB" }}>
        Onay & Deploy
      </h2>
      <p className="text-sm mb-6" style={{ color: "#9CA3AF" }}>
        Bilgileri kontrol edin ve magazanizi yayina alin
      </p>

      <div className="space-y-4">
        {/* Sector & Theme */}
        <Section title="Sektor & Tema">
          <Row label="Sektor" value={sector ? `${sector.icon} ${sector.name}` : data.sector} />
          <Row label="Tema" value={theme.name}>
            <div className="flex gap-1 mt-1">
              {theme.colors.map((c, i) => (
                <div key={i} className="w-4 h-4 rounded-full" style={{ background: c }} />
              ))}
            </div>
          </Row>
        </Section>

        {/* Store Info */}
        <Section title="Magaza Bilgileri">
          <Row label="Ad" value={data.name} />
          <Row label="Slug" value={`/${data.slug}`} />
          <Row label="Telefon" value={data.phone} />
          {data.whatsapp && <Row label="WhatsApp" value={data.whatsapp} />}
          {data.email && <Row label="Email" value={data.email} />}
          {data.city && <Row label="Sehir" value={data.city} />}
          {data.address && <Row label="Adres" value={data.address} />}
          {data.instagram && <Row label="Instagram" value={data.instagram} />}
          {data.description && <Row label="Aciklama" value={data.description} />}
        </Section>

        {/* Categories */}
        <Section title={`Kategoriler (${data.categories.length})`}>
          <div className="flex flex-wrap gap-2">
            {data.categories.map((cat) => (
              <span
                key={cat.slug}
                className="text-xs px-2.5 py-1 rounded-full"
                style={{ background: "#2A2D37", color: "#E5E7EB" }}
              >
                {cat.icon && `${cat.icon} `}
                {cat.name}
              </span>
            ))}
          </div>
        </Section>

        {/* Payment */}
        <Section title="Odeme">
          <Row
            label="Saglayici"
            value={
              data.paymentProvider === "none"
                ? "Odeme yok (WhatsApp siparis)"
                : data.paymentProvider
            }
          />
          {data.paymentProvider !== "none" && (
            <Row label="API Key" value={data.paymentKeys.apiKey ? "***" + data.paymentKeys.apiKey.slice(-4) : "-"} />
          )}
        </Section>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onPrev}
          disabled={deploying}
          className="px-6 py-2.5 rounded-lg text-sm font-medium"
          style={{ background: "#2A2D37", color: "#9CA3AF" }}
        >
          Geri
        </button>
        <button
          onClick={onDeploy}
          disabled={deploying}
          className="px-8 py-2.5 rounded-lg text-sm font-bold text-white disabled:opacity-50 transition-opacity"
          style={{ background: "#10B981" }}
        >
          {deploying ? "Deploy ediliyor..." : "Magazayi Olustur & Deploy Et"}
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-lg" style={{ background: "#0F1117" }}>
      <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#6366F1" }}>
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between">
      <span className="text-xs" style={{ color: "#9CA3AF" }}>
        {label}
      </span>
      <div className="text-right">
        <span className="text-sm" style={{ color: "#E5E7EB" }}>
          {value}
        </span>
        {children}
      </div>
    </div>
  );
}
