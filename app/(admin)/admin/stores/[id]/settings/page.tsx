"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/admin/AdminShell";
import Link from "next/link";

interface StoreSettings {
  id: string;
  name: string;
  slug: string;
  phone: string;
  email: string;
  whatsapp: string;
  city: string;
  address: string;
  logo_url: string;
  social_links: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
  };
  working_hours: {
    weekdays?: string;
    saturday?: string;
    sunday?: string;
  };
  shipping_config: {
    free_shipping_min?: number;
    flat_rate?: number;
  };
}

export default function StoreSettingsPage() {
  const { token } = useAuth();
  const params = useParams();
  const storeId = params.id as string;
  const [form, setForm] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    loadSettings();
  }, [storeId]);

  async function loadSettings() {
    try {
      const res = await fetch(`/api/admin/stores/${storeId}/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setForm({
        ...data,
        social_links: data.social_links || {},
        working_hours: data.working_hours || {},
        shipping_config: data.shipping_config || {},
      });
    } catch {
      setForm(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!form) return;
    setSaving(true);
    setMsg("");

    try {
      const res = await fetch(`/api/admin/stores/${storeId}/settings`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setMsg("Ayarlar kaydedildi!");
      } else {
        const err = await res.json();
        setMsg(err.error || "Kayit hatasi");
      }
    } catch {
      setMsg("Baglanti hatasi");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-sm" style={{ color: "#9CA3AF" }}>Yukleniyor...</div></div>;
  }

  if (!form) return <div style={{ color: "#EF4444" }}>Magaza bulunamadi.</div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/admin/stores/${storeId}`} className="text-sm" style={{ color: "#6366F1" }}>← Geri</Link>
        <h1 className="text-2xl font-bold" style={{ color: "#E5E7EB" }}>Magaza Ayarlari</h1>
      </div>

      {msg && (
        <div className="mb-4 p-3 rounded text-sm" style={{
          background: msg.includes("hata") ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
          color: msg.includes("hata") ? "#EF4444" : "#10B981",
        }}>{msg}</div>
      )}

      <div className="space-y-6">
        {/* Basic info */}
        <Section title="Temel Bilgiler">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Magaza Adi" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <Field label="Slug" value={form.slug} disabled />
            <Field label="Telefon" value={form.phone || ""} onChange={(v) => setForm({ ...form, phone: v })} />
            <Field label="E-posta" value={form.email || ""} onChange={(v) => setForm({ ...form, email: v })} />
            <Field label="WhatsApp" value={form.whatsapp || ""} onChange={(v) => setForm({ ...form, whatsapp: v })} />
            <Field label="Sehir" value={form.city || ""} onChange={(v) => setForm({ ...form, city: v })} />
          </div>
          <Field label="Adres" value={form.address || ""} onChange={(v) => setForm({ ...form, address: v })} />
          <Field label="Logo URL" value={form.logo_url || ""} onChange={(v) => setForm({ ...form, logo_url: v })} />
        </Section>

        {/* Social links */}
        <Section title="Sosyal Medya">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Instagram" value={form.social_links.instagram || ""}
              onChange={(v) => setForm({ ...form, social_links: { ...form.social_links, instagram: v } })} />
            <Field label="Facebook" value={form.social_links.facebook || ""}
              onChange={(v) => setForm({ ...form, social_links: { ...form.social_links, facebook: v } })} />
            <Field label="Twitter/X" value={form.social_links.twitter || ""}
              onChange={(v) => setForm({ ...form, social_links: { ...form.social_links, twitter: v } })} />
            <Field label="YouTube" value={form.social_links.youtube || ""}
              onChange={(v) => setForm({ ...form, social_links: { ...form.social_links, youtube: v } })} />
            <Field label="TikTok" value={form.social_links.tiktok || ""}
              onChange={(v) => setForm({ ...form, social_links: { ...form.social_links, tiktok: v } })} />
          </div>
        </Section>

        {/* Working hours */}
        <Section title="Calisma Saatleri">
          <div className="grid grid-cols-3 gap-4">
            <Field label="Hafta Ici" value={form.working_hours.weekdays || "09:00 - 18:00"}
              onChange={(v) => setForm({ ...form, working_hours: { ...form.working_hours, weekdays: v } })} />
            <Field label="Cumartesi" value={form.working_hours.saturday || "09:00 - 14:00"}
              onChange={(v) => setForm({ ...form, working_hours: { ...form.working_hours, saturday: v } })} />
            <Field label="Pazar" value={form.working_hours.sunday || "Kapali"}
              onChange={(v) => setForm({ ...form, working_hours: { ...form.working_hours, sunday: v } })} />
          </div>
        </Section>

        {/* Shipping */}
        <Section title="Kargo Ayarlari">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Ucretsiz Kargo Limiti (TL)"
              value={form.shipping_config.free_shipping_min?.toString() || "0"}
              onChange={(v) => setForm({ ...form, shipping_config: { ...form.shipping_config, free_shipping_min: Number(v) } })}
              type="number" />
            <Field label="Sabit Kargo Ucreti (TL)"
              value={form.shipping_config.flat_rate?.toString() || "0"}
              onChange={(v) => setForm({ ...form, shipping_config: { ...form.shipping_config, flat_rate: Number(v) } })}
              type="number" />
          </div>
        </Section>

        <button onClick={handleSave} disabled={saving}
          className="px-6 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-50"
          style={{ background: "#6366F1" }}>
          {saving ? "Kaydediliyor..." : "Ayarlari Kaydet"}
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-5" style={{ background: "#1A1D27", borderColor: "#2A2D37" }}>
      <h2 className="text-sm font-semibold mb-4" style={{ color: "#E5E7EB" }}>{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", disabled = false }: {
  label: string; value: string; onChange?: (v: string) => void; type?: string; disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs mb-1 block" style={{ color: "#9CA3AF" }}>{label}</span>
      <input type={type} value={value} onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className="w-full px-3 py-2 rounded-lg border text-sm outline-none disabled:opacity-50"
        style={{ background: "#0F1117", borderColor: "#2A2D37", color: "#E5E7EB" }} />
    </label>
  );
}
