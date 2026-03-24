"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/admin/AdminShell";

interface Category {
  id: string;
  store_id: string;
  name: string;
  slug: string;
  icon: string | null;
  sort_order: number;
  is_default: boolean;
}

interface Store { id: string; name: string; }

export default function CategoriesPage() {
  const { token } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCat, setNewCat] = useState({ name: "", icon: "" });
  const [editForm, setEditForm] = useState({ name: "", icon: "" });

  useEffect(() => { loadStores(); }, [token]);
  useEffect(() => { if (selectedStore) loadCategories(); }, [selectedStore]);

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

  async function loadCategories() {
    try {
      const res = await fetch(`/api/admin/categories?store_id=${selectedStore}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch { setCategories([]); }
  }

  async function handleAdd() {
    if (!newCat.name.trim()) return;
    try {
      await fetch("/api/admin/categories", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          store_id: selectedStore,
          name: newCat.name,
          icon: newCat.icon || null,
          sort_order: categories.length,
        }),
      });
      setNewCat({ name: "", icon: "" });
      loadCategories();
    } catch { alert("Ekleme hatasi"); }
  }

  async function handleUpdate(id: string) {
    try {
      await fetch("/api/admin/categories", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ id, name: editForm.name, icon: editForm.icon || null }),
      });
      setEditingId(null);
      loadCategories();
    } catch { alert("Guncelleme hatasi"); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu kategoriyi silmek istediginize emin misiniz?")) return;
    try {
      await fetch(`/api/admin/categories?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      loadCategories();
    } catch { alert("Silme hatasi"); }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-sm" style={{ color: "#9CA3AF" }}>Yukleniyor...</div></div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: "#E5E7EB" }}>Kategoriler</h1>

      <select value={selectedStore} onChange={(e) => setSelectedStore(e.target.value)}
        className="mb-4 px-3 py-2 rounded-lg border text-sm"
        style={{ background: "#1A1D27", borderColor: "#2A2D37", color: "#E5E7EB" }}>
        {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>

      {/* Add new */}
      <div className="flex gap-2 mb-4">
        <input value={newCat.icon} onChange={(e) => setNewCat((f) => ({ ...f, icon: e.target.value }))}
          placeholder="Ikon (emoji)" className="w-16 px-3 py-2 rounded-lg border text-sm text-center"
          style={{ background: "#1A1D27", borderColor: "#2A2D37", color: "#E5E7EB" }} />
        <input value={newCat.name} onChange={(e) => setNewCat((f) => ({ ...f, name: e.target.value }))}
          placeholder="Kategori adi..." className="flex-1 px-3 py-2 rounded-lg border text-sm"
          style={{ background: "#1A1D27", borderColor: "#2A2D37", color: "#E5E7EB" }}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
        <button onClick={handleAdd} className="px-4 py-2 rounded-lg text-sm text-white" style={{ background: "#6366F1" }}>
          Ekle
        </button>
      </div>

      {/* Category list */}
      <div className="rounded-xl border overflow-hidden" style={{ background: "#1A1D27", borderColor: "#2A2D37" }}>
        {categories.length === 0 ? (
          <div className="p-8 text-center text-sm" style={{ color: "#9CA3AF" }}>Henuz kategori yok.</div>
        ) : (
          <div className="divide-y" style={{ borderColor: "#2A2D37" }}>
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between px-4 py-3" style={{ borderColor: "#2A2D37" }}>
                {editingId === cat.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input value={editForm.icon} onChange={(e) => setEditForm((f) => ({ ...f, icon: e.target.value }))}
                      className="w-12 px-2 py-1 rounded border text-sm text-center"
                      style={{ background: "#0F1117", borderColor: "#2A2D37", color: "#E5E7EB" }} />
                    <input value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                      className="flex-1 px-2 py-1 rounded border text-sm"
                      style={{ background: "#0F1117", borderColor: "#2A2D37", color: "#E5E7EB" }} />
                    <button onClick={() => handleUpdate(cat.id)} className="text-xs px-2 py-1 rounded" style={{ background: "#10B981", color: "#fff" }}>Kaydet</button>
                    <button onClick={() => setEditingId(null)} className="text-xs px-2 py-1 rounded" style={{ background: "#2A2D37", color: "#9CA3AF" }}>Iptal</button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{cat.icon || "📁"}</span>
                      <span className="text-sm" style={{ color: "#E5E7EB" }}>{cat.name}</span>
                      <span className="text-xs" style={{ color: "#6B7280" }}>/{cat.slug}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setEditingId(cat.id); setEditForm({ name: cat.name, icon: cat.icon || "" }); }}
                        className="text-xs px-2 py-1 rounded" style={{ background: "#2A2D37", color: "#6366F1" }}>Duzenle</button>
                      <button onClick={() => handleDelete(cat.id)}
                        className="text-xs px-2 py-1 rounded" style={{ background: "#2A2D37", color: "#EF4444" }}>Sil</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
