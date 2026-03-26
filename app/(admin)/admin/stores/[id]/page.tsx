"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/admin/AdminShell";
import { useParams, useRouter } from "next/navigation";
import DomainSetup from "@/components/admin/DomainSetup";
import ThemePreview from "@/components/admin/StoreWizard/ThemePreview";
import { THEMES, getThemesBySector } from "@/lib/themes";

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

      {/* Theme Selector */}
      <ThemeSelector
        currentTheme={(store.settings as Record<string, unknown>)?.theme as string || "classic-warm"}
        sector={(store.settings as Record<string, unknown>)?.sector as string || "mobilyaci"}
        onSelect={(themeId) => {
          const settings = { ...((store.settings as Record<string, unknown>) || {}), theme: themeId };
          setStore({ ...store, settings });
        }}
      />

      {/* Trust Bar Editor */}
      <TrustBarEditor
        items={((store.settings as Record<string, unknown>)?.trustBar as TrustItem[]) || []}
        onChange={(items) => {
          const settings = { ...((store.settings as Record<string, unknown>) || {}), trustBar: items };
          setStore({ ...store, settings });
        }}
      />

      {/* Store Owner Management */}
      <StoreOwnerManager storeId={storeId} token={token} />

      {/* Domain Management */}
      <DomainSetup storeId={storeId} token={token} />
    </div>
  );
}

function StoreOwnerManager({ storeId, token }: { storeId: string; token: string }) {
  const [owner, setOwner] = useState<{ id: string; email: string; full_name?: string; last_login_at?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    loadOwner();
  }, [storeId]);

  async function loadOwner() {
    try {
      const res = await fetch(`/api/admin/store-users?store_id=${storeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOwner(data.owner || null);
    } catch {
      setOwner(null);
    } finally {
      setLoading(false);
    }
  }

  async function createOwner() {
    if (!email || !password) return;
    setMsg(null);
    try {
      const res = await fetch("/api/admin/store-users", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ store_id: storeId, email, password, full_name: fullName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMsg({ type: "success", text: "Yonetici olusturuldu" });
      setEmail(""); setPassword(""); setFullName("");
      loadOwner();
    } catch (e: unknown) {
      setMsg({ type: "error", text: e instanceof Error ? e.message : "Hata" });
    }
  }

  async function resetPassword() {
    if (!newPassword) return;
    setMsg(null);
    try {
      const res = await fetch("/api/admin/store-users", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ store_id: storeId, new_password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMsg({ type: "success", text: "Sifre sifirlandi" });
      setNewPassword("");
    } catch (e: unknown) {
      setMsg({ type: "error", text: e instanceof Error ? e.message : "Hata" });
    }
  }

  async function removeOwner() {
    if (!confirm("Bu yoneticiyi kaldirmak istediginize emin misiniz?")) return;
    try {
      await fetch(`/api/admin/store-users?store_id=${storeId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setMsg({ type: "success", text: "Yonetici kaldirildi" });
      setOwner(null);
    } catch {
      setMsg({ type: "error", text: "Hata" });
    }
  }

  if (loading) return null;

  return (
    <div className="mt-6 rounded-xl border p-6" style={{ background: "#1A1D27", borderColor: "#2A2D37" }}>
      <h3 className="text-sm font-semibold mb-1" style={{ color: "#E5E7EB" }}>
        Magaza Yoneticisi
      </h3>
      <p className="text-xs mb-4" style={{ color: "#9CA3AF" }}>
        Musterinize kendi magazasini yonetebilecegi bir hesap verin
      </p>

      {msg && (
        <div
          className="mb-3 p-2 rounded text-xs"
          style={{
            background: msg.type === "success" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
            color: msg.type === "success" ? "#10B981" : "#EF4444",
          }}
        >
          {msg.text}
        </div>
      )}

      {owner ? (
        <div>
          <div className="p-3 rounded-lg mb-3" style={{ background: "#0F1117" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: "#E5E7EB" }}>
                  {owner.full_name || owner.email}
                </p>
                <p className="text-xs" style={{ color: "#9CA3AF" }}>{owner.email}</p>
                {owner.last_login_at && (
                  <p className="text-xs mt-1" style={{ color: "#6B7280" }}>
                    Son giris: {new Date(owner.last_login_at).toLocaleDateString("tr-TR")}
                  </p>
                )}
              </div>
              <button
                onClick={removeOwner}
                className="text-xs px-3 py-1.5 rounded"
                style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444" }}
              >
                Kaldir
              </button>
            </div>
          </div>
          {/* Reset password */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Yeni sifre (min 6 karakter)"
              className="flex-1 px-3 py-1.5 rounded border text-sm outline-none"
              style={{ background: "#0F1117", borderColor: "#2A2D37", color: "#E5E7EB" }}
            />
            <button
              onClick={resetPassword}
              disabled={newPassword.length < 6}
              className="px-3 py-1.5 rounded text-xs font-medium text-white disabled:opacity-30"
              style={{ background: "#F59E0B" }}
            >
              Sifre Sifirla
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Ad Soyad"
            className="w-full px-3 py-2 rounded border text-sm outline-none"
            style={{ background: "#0F1117", borderColor: "#2A2D37", color: "#E5E7EB" }}
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-3 py-2 rounded border text-sm outline-none"
            style={{ background: "#0F1117", borderColor: "#2A2D37", color: "#E5E7EB" }}
          />
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Sifre (min 6 karakter)"
            className="w-full px-3 py-2 rounded border text-sm outline-none"
            style={{ background: "#0F1117", borderColor: "#2A2D37", color: "#E5E7EB" }}
          />
          <button
            onClick={createOwner}
            disabled={!email || password.length < 6}
            className="w-full py-2 rounded text-sm font-medium text-white disabled:opacity-30"
            style={{ background: "#10B981" }}
          >
            Yonetici Olustur
          </button>
        </div>
      )}
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

function ThemeSelector({
  currentTheme,
  sector,
  onSelect,
}: {
  currentTheme: string;
  sector: string;
  onSelect: (themeId: string) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const sectorThemes = getThemesBySector(sector);
  const allThemes = THEMES;
  const themes = showAll ? allThemes : sectorThemes;

  return (
    <div className="mt-6 rounded-xl border p-6" style={{ background: "#1A1D27", borderColor: "#2A2D37" }}>
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold" style={{ color: "#E5E7EB" }}>
          Tema Secimi
        </h3>
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-xs px-2 py-1 rounded"
          style={{ background: "#2A2D37", color: "#9CA3AF" }}
        >
          {showAll ? "Sektor temalari" : "Tum temalar"}
        </button>
      </div>
      <p className="text-xs mb-4" style={{ color: "#9CA3AF" }}>
        Mevcut: {THEMES.find((t) => t.id === currentTheme)?.name || currentTheme}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Theme list */}
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => onSelect(theme.id)}
              className="w-full text-left p-3 rounded-lg border transition-all"
              style={{
                background: currentTheme === theme.id ? "#6366F115" : "#0F1117",
                borderColor: currentTheme === theme.id ? "#6366F1" : "#2A2D37",
              }}
            >
              <div className="flex items-center gap-3">
                {/* Color swatches */}
                <div className="flex gap-1 flex-shrink-0">
                  {theme.colors.slice(0, 4).map((c, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-full border"
                      style={{ background: c, borderColor: "#2A2D37" }}
                    />
                  ))}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: "#E5E7EB" }}>
                    {theme.name}
                    {currentTheme === theme.id && (
                      <span className="ml-2 text-[10px]" style={{ color: "#6366F1" }}>● Aktif</span>
                    )}
                  </p>
                  <p className="text-[10px] truncate" style={{ color: "#9CA3AF" }}>
                    {theme.desc}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Live preview */}
        <div className="sticky top-0">
          <p className="text-xs mb-2 font-medium" style={{ color: "#9CA3AF" }}>Canli Onizleme</p>
          <ThemePreview themeId={currentTheme} sectorId={sector} />
        </div>
      </div>
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
