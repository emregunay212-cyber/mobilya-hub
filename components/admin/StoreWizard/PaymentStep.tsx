"use client";

import type { WizardData } from "./index";

interface Props {
  data: WizardData;
  update: (partial: Partial<WizardData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const PROVIDERS = [
  {
    id: "none" as const,
    name: "Odeme Yok",
    desc: "Sadece WhatsApp ile siparis",
  },
  {
    id: "iyzico" as const,
    name: "iyzico",
    desc: "Turkiye'nin odeme altyapisi",
  },
  {
    id: "stripe" as const,
    name: "Stripe",
    desc: "Uluslararasi odeme sistemi",
  },
];

export default function PaymentStep({ data, update, onNext, onPrev }: Props) {
  function selectProvider(id: "none" | "iyzico" | "stripe") {
    update({
      paymentProvider: id,
      paymentKeys: id === "none" ? { apiKey: "", secretKey: "" } : data.paymentKeys,
    });
  }

  function updateKey(field: "apiKey" | "secretKey", value: string) {
    update({
      paymentKeys: { ...data.paymentKeys, [field]: value },
    });
  }

  const needsKeys = data.paymentProvider !== "none";
  const canContinue = !needsKeys || (data.paymentKeys.apiKey.trim() && data.paymentKeys.secretKey.trim());

  return (
    <div>
      <h2 className="text-lg font-semibold mb-1" style={{ color: "#E5E7EB" }}>
        Odeme Ayarlari
      </h2>
      <p className="text-sm mb-6" style={{ color: "#9CA3AF" }}>
        Odeme saglayicinizi secin (istege bagli)
      </p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {PROVIDERS.map((p) => {
          const selected = data.paymentProvider === p.id;
          return (
            <button
              key={p.id}
              onClick={() => selectProvider(p.id)}
              className="text-left p-4 rounded-xl border-2 transition-all"
              style={{
                background: selected ? "rgba(99,102,241,0.08)" : "#0F1117",
                borderColor: selected ? "#6366F1" : "#2A2D37",
              }}
            >
              <p className="font-semibold text-sm" style={{ color: "#E5E7EB" }}>
                {p.name}
              </p>
              <p className="text-xs mt-1" style={{ color: "#9CA3AF" }}>
                {p.desc}
              </p>
            </button>
          );
        })}
      </div>

      {needsKeys && (
        <div className="space-y-4 p-4 rounded-lg" style={{ background: "#0F1117" }}>
          <div>
            <label className="block text-xs mb-1" style={{ color: "#9CA3AF" }}>
              API Key
            </label>
            <input
              type="text"
              value={data.paymentKeys.apiKey}
              onChange={(e) => updateKey("apiKey", e.target.value)}
              placeholder={`${data.paymentProvider} API Key`}
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none placeholder:text-gray-600"
              style={{ background: "#1A1D27", borderColor: "#2A2D37", color: "#E5E7EB" }}
            />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: "#9CA3AF" }}>
              Secret Key
            </label>
            <input
              type="password"
              value={data.paymentKeys.secretKey}
              onChange={(e) => updateKey("secretKey", e.target.value)}
              placeholder={`${data.paymentProvider} Secret Key`}
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none placeholder:text-gray-600"
              style={{ background: "#1A1D27", borderColor: "#2A2D37", color: "#E5E7EB" }}
            />
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
