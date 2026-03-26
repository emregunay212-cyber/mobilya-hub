"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/admin/AdminShell";

interface Coupon {
  id: string;
  store_id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_amount: number;
  max_uses: number;
  used_count: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

interface Store { id: string; name: string; }

export default function CouponsPage() {
  const { token } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState("");
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  useEffect(() => { loadStores(); }, [token]);
  useEffect(() => { if (selectedStore) loadCoupons(); }, [selectedStore]);

  async function loadStores() {
    try {
      const res = await fetch("/api/admin/stores", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.stores || [];
      setStores(list);
      if (list.length > 0) setSelectedStore(list[0].id);
    } catch { setStores([]); }
    finally { setLoading(false); }
  }

  async function loadCoupons() {
    try {
      const res = await fetch(`/api/admin/coupons?store_id=${selectedStore}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCoupons(Array.isArray(data) ? data : []);
    } catch { setCoupons([]); }
  }

  async function handleToggle(coupon: Coupon) {
    await fetch("/api/admin/coupons", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ id: coupon.id, is_active: !coupon.is_active }),
    });
    loadCoupons();
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu kuponu silmek istediginize emin misiniz?")) return;
    await fetch(`/api/admin/coupons?id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    loadCoupons();
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-sm" style={{ color: "#9CA3AF" }}>Yukleniyor...</div></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "#E5E7EB" }}>Kuponlar</h1>
        <button onClick={() => { setEditingCoupon(null); setShowForm(true); }}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: "#6366F1" }}>
          + Yeni Kupon
        </button>
      </div>

      <select value={selectedStore} onChange={(e) => setSelectedStore(e.target.value)}
        className="mb-4 px-3 py-2 rounded-lg border text-sm"
        style={{ background: "#1A1D27", borderColor: "#2A2D37", color: "#E5E7EB" }}>
        {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>

      {coupons.length === 0 ? (
        <div className="rounded-xl border p-12 text-center" style={{ background: "#1A1D27", borderColor: "#2A2D37" }}>
          <p className="text-sm" style={{ color: "#9CA3AF" }}>Henuz kupon yok.</p>
        </div>
      ) : (
        <div className="rounded-xl border overflow-x-auto" style={{ background: "#1A1D27", borderColor: "#2A2D37" }}>
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr style={{ borderBottom: "1px solid #2A2D37" }}>
                <Th>Kod</Th><Th>Tip</Th><Th>Deger</Th><Th>Min Tutar</Th><Th>Kullanim</Th><Th>Son Tarih</Th><Th>Durum</Th><Th>Islem</Th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} style={{ borderBottom: "1px solid #2A2D37" }}>
                  <td className="px-4 py-3 font-mono font-bold" style={{ color: "#6366F1" }}>{c.code}</td>
                  <td className="px-4 py-3" style={{ color: "#9CA3AF" }}>{c.discount_type === "percentage" ? "Yuzde" : "Sabit"}</td>
                  <td className="px-4 py-3" style={{ color: "#10B981" }}>
                    {c.discount_type === "percentage" ? `%${c.discount_value}` : `${c.discount_value} TL`}
                  </td>
                  <td className="px-4 py-3" style={{ color: "#9CA3AF" }}>{c.min_order_amount > 0 ? `${c.min_order_amount} TL` : "-"}</td>
                  <td className="px-4 py-3" style={{ color: "#9CA3AF" }}>{c.used_count}/{c.max_uses || "∞"}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: "#9CA3AF" }}>
                    {c.expires_at ? new Date(c.expires_at).toLocaleDateString("tr-TR") : "Suresiz"}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggle(c)} className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: c.is_active ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: c.is_active ? "#10B981" : "#EF4444" }}>
                      {c.is_active ? "Aktif" : "Pasif"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingCoupon(c); setShowForm(true); }}
                        className="text-xs px-2 py-1 rounded" style={{ background: "#2A2D37", color: "#6366F1" }}>Duzenle</button>
                      <button onClick={() => handleDelete(c.id)}
                        className="text-xs px-2 py-1 rounded" style={{ background: "#2A2D37", color: "#EF4444" }}>Sil</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <CouponFormModal token={token} storeId={selectedStore} coupon={editingCoupon}
          onClose={() => { setShowForm(false); setEditingCoupon(null); loadCoupons(); }} />
      )}
    </div>
  );
}

function CouponFormModal({ token, storeId, coupon, onClose }: {
  token: string; storeId: string; coupon: Coupon | null; onClose: () => void;
}) {
  const [form, setForm] = useState({
    code: coupon?.code || "",
    discount_type: coupon?.discount_type || "percentage",
    discount_value: coupon?.discount_value?.toString() || "",
    min_order_amount: coupon?.min_order_amount?.toString() || "0",
    max_uses: coupon?.max_uses?.toString() || "0",
    expires_at: coupon?.expires_at?.split("T")[0] || "",
    is_active: coupon?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/admin/coupons", {
        method: coupon ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(coupon ? { id: coupon.id } : { store_id: storeId }),
          code: form.code,
          discount_type: form.discount_type,
          discount_value: Number(form.discount_value),
          min_order_amount: Number(form.min_order_amount),
          max_uses: Number(form.max_uses),
          expires_at: form.expires_at || null,
          is_active: form.is_active,
        }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error || "Hata"); return; }
      onClose();
    } catch { setError("Baglanti hatasi"); }
    finally { setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)" }}>
      <div className="w-full max-w-md rounded-xl border p-6" style={{ background: "#1A1D27", borderColor: "#2A2D37" }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold" style={{ color: "#E5E7EB" }}>{coupon ? "Kupon Duzenle" : "Yeni Kupon"}</h2>
          <button onClick={onClose} className="text-xl" style={{ color: "#9CA3AF" }}>&times;</button>
        </div>
        {error && <div className="mb-4 p-3 rounded text-sm" style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444" }}>{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Kupon Kodu">
            <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required placeholder="INDIRIM20" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Indirim Tipi">
              <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })}>
                <option value="percentage">Yuzde (%)</option>
                <option value="fixed">Sabit (TL)</option>
              </select>
            </Field>
            <Field label={form.discount_type === "percentage" ? "Yuzde (%)" : "Tutar (TL)"}>
              <input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} required min="0" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Min Siparis (TL)">
              <input type="number" value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })} min="0" />
            </Field>
            <Field label="Maks Kullanim (0=sinirsiz)">
              <input type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} min="0" />
            </Field>
          </div>
          <Field label="Son Kullanim Tarihi (bos=suresiz)">
            <input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
          </Field>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4" />
            <span className="text-sm" style={{ color: "#E5E7EB" }}>Aktif</span>
          </label>
          <div className="flex justify-end gap-3 pt-4" style={{ borderTop: "1px solid #2A2D37" }}>
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm" style={{ background: "#2A2D37", color: "#9CA3AF" }}>Iptal</button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50" style={{ background: "#6366F1" }}>
              {saving ? "Kaydediliyor..." : coupon ? "Guncelle" : "Olustur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactElement }) {
  return (
    <label className="block">
      <span className="text-xs mb-1 block" style={{ color: "#9CA3AF" }}>{label}</span>
      <div className="[&>*]:w-full [&>*]:px-3 [&>*]:py-2 [&>*]:rounded-lg [&>*]:border [&>*]:text-sm [&>*]:outline-none"
        style={{ ['--tw-border-opacity' as string]: 1 }}>
        <div style={{ display: "contents" }} className="[&>*]:bg-[#0F1117] [&>*]:border-[#2A2D37] [&>*]:text-[#E5E7EB]">
          {children}
        </div>
      </div>
    </label>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: "#9CA3AF" }}>{children}</th>;
}
