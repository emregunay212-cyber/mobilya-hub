"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/admin/AdminShell";
import { useParams, useRouter } from "next/navigation";
import DomainSetup from "@/components/admin/DomainSetup";

interface TrustItem {
  icon: string;
  title: string;
  subtitle: string;
}

interface StoreData {
  id: string;
  name: string;
  slug: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  description: string;
  instagram: string;
  is_active: boolean;
  deployment_url?: string;
  settings?: Record<string, unknown>;
}

export default function StoreEditPage() {
  const { token } = useAuth();
  const params = useParams();
  const router = useRouter();
  const storeId = params.id as string;

  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadStore() {
      try {
        const res = await fetch(`/api/admin/stores/${storeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Store not found");
        const data = await res.json();
        setStore(data.store || data);
      } catch {
        setMessage({ type: "error", text: "Magaza bulunamadi" });
      } finally {
        setLoading(false);
      }
    }
    loadStore();
  }, [storeId, token]);

  async function handleSave() {
    if (!store) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/stores/${storeId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(store),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Kaydetme hatasi");
      }
      setMessage({ type: "success", text: "Magaza kaydedildi" });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Kaydetme hatasi";
      setMessage({ type: "error", text: msg });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Bu magazayi silmek istediginize emin misiniz?")) return;
    try {
      await fetch(`/api/admin/stores/${storeId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      router.push("/admin/stores");
    } catch {
      alert("Silme hatasi");
    }
  }

  async function handleRedeploy() {
    try {
      const res = await fetch("/api/admin/deploy", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ store_id: storeId }),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Deploy baslatildi!" });
      } else {
        const err = await res.json();
        setMessage({ type: "error", text: err.error || "Deploy hatasi" });
      }
    } catch {
      setMessage({ type: "error", text: "Deploy hatasi" });
    }
  }

  function updateField(field: keyof StoreData, value: string | boolean) {
    if (!store) return;
    setStore({ ...store, [field]: value });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm" style={{ color: "#9CA3AF" }}>
          Yukleniyor...
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="text-center py-12">
        <p className="text-sm" style={{ color: "#EF4444" }}>
          Magaza bulunamadi
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "#E5E7EB" }}>
          Magaza Duzenle
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRedeploy}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ background: "#10B981" }}
          >
            Redeploy
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ background: "#EF4444" }}
          >
            Sil
          </button>
        </div>
      </div>

      {message && (
        <div
          className="mb-4 p-3 rounded-lg text-sm"
          style={{
            background: message.type === "success" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
            color: message.type === "success" ? "#10B981" : "#EF4444",
          }}
        >
          {message.text}
        </div>
      )}

      <div
        className="rounded-xl border p-6 space-y-4"
        style={{ background: "#1A1D27", borderColor: "#2A2D37" }}
      >
        <Field label="Magaza Adi" value={store.name} onChange={(v) => updateField("name", v)} />
        <Field label="Slug" value={store.slug} onChange={(v) => updateField("slug", v)} />
        <Field label="Telefon" value={store.phone || ""} onChange={(v) => updateField("phone", v)} />
        <Field label="WhatsApp" value={store.whatsapp || ""} onChange={(v) => updateField("whatsapp", v)} />
        <Field label="Email" value={store.email || ""} onChange={(v) => updateField("email", v)} />
        <Field label="Adres" value={store.address || ""} onChange={(v) => updateField("address", v)} />
        <Field label="Sehir" value={store.city || ""} onChange={(v) => updateField("city", v)} />
        <Field label="Instagram" value={store.instagram || ""} onChange={(v) => updateField("instagram", v)} />

        <div>
          <label className="block text-xs mb-1" style={{ color: "#9CA3AF" }}>
            Aciklama
          </label>
          <textarea
            value={store.description || ""}
            onChange={(e) => updateField("description", e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
            style={{ background: "#0F1117", borderColor: "#2A2D37", color: "#E5E7EB" }}
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs" style={{ color: "#9CA3AF" }}>
            Aktif
          </label>
          <button
            onClick={() => updateField("is_active", !store.is_active)}
            className="w-10 h-5 rounded-full relative transition-colors"
            style={{ background: store.is_active ? "#6366F1" : "#2A2D37" }}
          >
            <span
              className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
              style={{ left: store.is_active ? "22px" : "2px" }}
            />
          </button>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-50"
            style={{ background: "#6366F1" }}
          >
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </div>

      {/* Trust Bar Editor */}
      <TrustBarEditor
        items={((store.settings as Record<string, unknown>)?.trustBar as TrustItem[]) || []}
        onChange={(items) => {
          const settings = { ...((store.settings as Record<string, unknown>) || {}), trustBar: items };
          setStore({ ...store, settings });
        }}
      />

      {/* Domain Management */}
      <DomainSetup storeId={storeId} token={token} />
    </div>
  );
}

function TrustBarEditor({ items, onChange }: { items: TrustItem[]; onChange: (items: TrustItem[]) => void }) {
  const [newIcon, setNewIcon] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");

  function addItem() {
    if (!newTitle.trim()) return;
    onChange([...items, { icon: newIcon || "✅", title: newTitle.trim(), subtitle: newSubtitle.trim() }]);
    setNewIcon("");
    setNewTitle("");
    setNewSubtitle("");
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: keyof TrustItem, value: string) {
    const updated = items.map((item, i) => (i === index ? { ...item, [field]: value } : item));
    onChange(updated);
  }

  return (
    <div className="mt-6 rounded-xl border p-6" style={{ background: "#1A1D27", borderColor: "#2A2D37" }}>
      <h3 className="text-sm font-semibold mb-1" style={{ color: "#E5E7EB" }}>
        Guven Cubugu (Trust Bar)
      </h3>
      <p className="text-xs mb-4" style={{ color: "#9CA3AF" }}>
        Sitenizdeki avantaj ikonlarini duzenleyin. Bos birakirsaniz sektor varsayilani kullanilir.
      </p>

      {/* Existing items */}
      <div className="space-y-2 mb-4">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2 p-2.5 rounded-lg"
            style={{ background: "#0F1117" }}
          >
            <input
              type="text"
              value={item.icon}
              onChange={(e) => updateItem(i, "icon", e.target.value)}
              className="w-10 text-center px-1 py-1 rounded border text-sm outline-none"
              style={{ background: "#1A1D27", borderColor: "#2A2D37", color: "#E5E7EB" }}
              placeholder="🚚"
            />
            <input
              type="text"
              value={item.title}
              onChange={(e) => updateItem(i, "title", e.target.value)}
              className="flex-1 px-2 py-1 rounded border text-sm outline-none"
              style={{ background: "#1A1D27", borderColor: "#2A2D37", color: "#E5E7EB" }}
              placeholder="Baslik"
            />
            <input
              type="text"
              value={item.subtitle}
              onChange={(e) => updateItem(i, "subtitle", e.target.value)}
              className="flex-1 px-2 py-1 rounded border text-sm outline-none"
              style={{ background: "#1A1D27", borderColor: "#2A2D37", color: "#E5E7EB" }}
              placeholder="Alt baslik"
            />
            <button
              onClick={() => removeItem(i)}
              className="text-xs px-2 py-1 rounded flex-shrink-0"
              style={{ color: "#EF4444" }}
            >
              Kaldir
            </button>
          </div>
        ))}
      </div>

      {/* Add new */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newIcon}
          onChange={(e) => setNewIcon(e.target.value)}
          className="w-10 text-center px-1 py-1.5 rounded border text-sm outline-none"
          style={{ background: "#0F1117", borderColor: "#2A2D37", color: "#E5E7EB" }}
          placeholder="🚚"
        />
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="flex-1 px-2 py-1.5 rounded border text-sm outline-none"
          style={{ background: "#0F1117", borderColor: "#2A2D37", color: "#E5E7EB" }}
          placeholder="Baslik (ornek: Ucretsiz Kargo)"
        />
        <input
          type="text"
          value={newSubtitle}
          onChange={(e) => setNewSubtitle(e.target.value)}
          className="flex-1 px-2 py-1.5 rounded border text-sm outline-none"
          style={{ background: "#0F1117", borderColor: "#2A2D37", color: "#E5E7EB" }}
          placeholder="Alt baslik"
        />
        <button
          onClick={addItem}
          className="px-3 py-1.5 rounded text-sm font-medium text-white flex-shrink-0"
          style={{ background: "#6366F1" }}
        >
          Ekle
        </button>
      </div>

      {items.length === 0 && (
        <p className="text-xs mt-3" style={{ color: "#6B7280" }}>
          Henuz oge eklenmedi. Sektor varsayilani kullanilacak.
        </p>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
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
        className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
        style={{ background: "#0F1117", borderColor: "#2A2D37", color: "#E5E7EB" }}
      />
    </div>
  );
}
