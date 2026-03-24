"use client";

import { useState } from "react";
import { useAuth } from "@/components/admin/AdminShell";
import { useRouter } from "next/navigation";
import SectorStep from "./SectorStep";
import ThemeStep from "./ThemeStep";
import InfoStep from "./InfoStep";
import CategoryStep from "./CategoryStep";
import PaymentStep from "./PaymentStep";
import ReviewStep from "./ReviewStep";

export interface WizardData {
  sector: string;
  theme: string;
  name: string;
  slug: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  description: string;
  instagram: string;
  categories: { name: string; slug: string; icon?: string }[];
  paymentProvider: "none" | "iyzico" | "stripe";
  paymentKeys: {
    apiKey: string;
    secretKey: string;
  };
}

const STEPS = ["Sektor", "Tema", "Bilgiler", "Kategoriler", "Odeme", "Onay"];

const INITIAL_DATA: WizardData = {
  sector: "",
  theme: "",
  name: "",
  slug: "",
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
  city: "",
  description: "",
  instagram: "",
  categories: [],
  paymentProvider: "none",
  paymentKeys: { apiKey: "", secretKey: "" },
};

export default function StoreWizard() {
  const { token } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>({ ...INITIAL_DATA });
  const [deploying, setDeploying] = useState(false);
  const [error, setError] = useState("");

  function update(partial: Partial<WizardData>) {
    setData((prev) => ({ ...prev, ...partial }));
  }

  function next() {
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function prev() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleDeploy() {
    setDeploying(true);
    setError("");

    try {
      // Step 1: Create the store
      const storeRes = await fetch("/api/admin/stores", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          slug: data.slug,
          phone: data.phone,
          whatsapp: data.whatsapp,
          email: data.email,
          address: data.address,
          city: data.city,
          description: data.description,
          instagram: data.instagram,
          theme: data.theme,
          sector: data.sector,
          categories: data.categories,
          payment_provider: data.paymentProvider !== "none" ? data.paymentProvider : null,
          payment_keys:
            data.paymentProvider !== "none"
              ? {
                  api_key: data.paymentKeys.apiKey,
                  secret_key: data.paymentKeys.secretKey,
                }
              : null,
        }),
      });

      if (!storeRes.ok) {
        const errData = await storeRes.json();
        throw new Error(errData.error || "Magaza olusturulamadi");
      }

      const storeResult = await storeRes.json();
      const storeId = storeResult.store?.id || storeResult.id;

      // Step 2: Deploy
      const deployRes = await fetch("/api/admin/deploy", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ store_id: storeId }),
      });

      if (!deployRes.ok) {
        const errData = await deployRes.json();
        throw new Error(errData.error || "Deploy baslatılamadi");
      }

      router.push("/admin/stores");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Bir hata olustu";
      setError(msg);
    } finally {
      setDeploying(false);
    }
  }

  return (
    <div>
      {/* Step indicator */}
      <div className="flex items-center gap-1 mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center">
            <button
              onClick={() => i < step && setStep(i)}
              disabled={i > step}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
              style={{
                background: i === step ? "#6366F1" : i < step ? "rgba(99,102,241,0.15)" : "#2A2D37",
                color: i <= step ? (i === step ? "#fff" : "#6366F1") : "#9CA3AF",
                cursor: i < step ? "pointer" : "default",
              }}
            >
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                style={{
                  background: i === step ? "rgba(255,255,255,0.2)" : "transparent",
                }}
              >
                {i < step ? "\u2713" : i + 1}
              </span>
              {label}
            </button>
            {i < STEPS.length - 1 && (
              <div
                className="w-6 h-px mx-1"
                style={{ background: i < step ? "#6366F1" : "#2A2D37" }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div
          className="mb-4 p-3 rounded-lg text-sm"
          style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444" }}
        >
          {error}
        </div>
      )}

      {/* Steps */}
      <div
        className="rounded-xl border p-6"
        style={{ background: "#1A1D27", borderColor: "#2A2D37" }}
      >
        {step === 0 && <SectorStep data={data} update={update} onNext={next} />}
        {step === 1 && <ThemeStep data={data} update={update} onNext={next} onPrev={prev} />}
        {step === 2 && <InfoStep data={data} update={update} onNext={next} onPrev={prev} />}
        {step === 3 && <CategoryStep data={data} update={update} onNext={next} onPrev={prev} />}
        {step === 4 && <PaymentStep data={data} update={update} onNext={next} onPrev={prev} />}
        {step === 5 && (
          <ReviewStep data={data} onPrev={prev} onDeploy={handleDeploy} deploying={deploying} />
        )}
      </div>
    </div>
  );
}
