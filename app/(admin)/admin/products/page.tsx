"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/admin/AdminShell";
import Link from "next/link";

interface Product {
  id: string;
  store_id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  old_price: number | null;
  badge: string | null;
  in_stock: boolean;
  stock_count: number;
  images: string[];
  is_active: boolean;
  sort_order: number;
  categories?: { name: string; slug: string } | null;
}

interface Store {
  id: string;
  name: string;
  slug: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  store_id: string;
}

export default function ProductsPage() {
  const { token } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadStores();
  }, [token]);

  useEffect(() => {
    if (selectedStore) {
      loadProducts();
      loadCategories();
    }
  }, [selectedStore]);

  async function loadStores() {
    try {
      const res = await fetch("/api/admin/stores", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.stores || [];
      setStores(list);
      if (list.length > 0 && !selectedStore) {
        setSelectedStore(list[0].id);
      }
    } catch {
      setStores([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadProducts() {
    try {
      const res = await fetch(`/api/admin/products?store_id=${selectedStore}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setProducts([]);
    }
  }

  async function loadCategories() {
    try {
      const res = await fetch(`/api/admin/categories?store_id=${selectedStore}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setCategories([]);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu urunu silmek istediginize emin misiniz?")) return;
    try {
      await fetch(`/api/admin/products?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Silme hatasi");
    }
  }

  function handleEdit(product: Product) {
    setEditingProduct(product);
    setShowForm(true);
  }

  function handleFormClose() {
    setShowForm(false);
    setEditingProduct(null);
    loadProducts();
  }

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm" style={{ color: "#9CA3AF" }}>Yukleniyor...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "#E5E7EB" }}>Urunler</h1>
        <button
          onClick={() => { setEditingProduct(null); setShowForm(true); }}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: "#6366F1" }}
        >
          + Yeni Urun
        </button>
      </div>

      {/* Store selector + search */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={selectedStore}
          onChange={(e) => setSelectedStore(e.target.value)}
          className="px-3 py-2 rounded-lg border text-sm"
          style={{ background: "#1A1D27", borderColor: "#2A2D37", color: "#E5E7EB" }}
        >
          {stores.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Urun ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-2 rounded-lg border text-sm outline-none"
          style={{ background: "#1A1D27", borderColor: "#2A2D37", color: "#E5E7EB" }}
        />
      </div>

      {/* Product table */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border p-12 text-center" style={{ background: "#1A1D27", borderColor: "#2A2D37" }}>
          <p className="text-sm" style={{ color: "#9CA3AF" }}>
            {products.length === 0 ? "Bu magazada henuz urun yok." : "Sonuc bulunamadi."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden" style={{ background: "#1A1D27", borderColor: "#2A2D37" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid #2A2D37" }}>
                <Th>Gorsel</Th>
                <Th>Urun</Th>
                <Th>Kategori</Th>
                <Th>Fiyat</Th>
                <Th>Stok</Th>
                <Th>Durum</Th>
                <Th>Islemler</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id} style={{ borderBottom: "1px solid #2A2D37" }}>
                  <td className="px-4 py-3">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-10 h-10 rounded object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded flex items-center justify-center text-lg" style={{ background: "#2A2D37" }}>
                        📦
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium" style={{ color: "#E5E7EB" }}>{product.name}</p>
                    <p className="text-xs" style={{ color: "#9CA3AF" }}>/{product.slug}</p>
                  </td>
                  <td className="px-4 py-3" style={{ color: "#9CA3AF" }}>
                    {product.categories?.name || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span style={{ color: "#10B981" }}>{product.price.toLocaleString("tr-TR")} TL</span>
                    {product.old_price && (
                      <span className="block text-xs line-through" style={{ color: "#9CA3AF" }}>
                        {product.old_price.toLocaleString("tr-TR")} TL
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3" style={{ color: "#9CA3AF" }}>
                    {product.stock_count}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: product.in_stock ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                        color: product.in_stock ? "#10B981" : "#EF4444",
                      }}
                    >
                      {product.in_stock ? "Stokta" : "Tukendi"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-xs px-2.5 py-1 rounded"
                        style={{ background: "#2A2D37", color: "#6366F1" }}
                      >
                        Duzenle
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-xs px-2.5 py-1 rounded"
                        style={{ background: "#2A2D37", color: "#EF4444" }}
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Product Form Modal */}
      {showForm && (
        <ProductFormModal
          token={token}
          storeId={selectedStore}
          categories={categories}
          product={editingProduct}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}

/* ── Product Form Modal ─────────────────────────────── */
function ProductFormModal({
  token,
  storeId,
  categories,
  product,
  onClose,
}: {
  token: string;
  storeId: string;
  categories: Category[];
  product: Product | null;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: product?.name || "",
    slug: product?.slug || "",
    description: product?.description || "",
    price: product?.price?.toString() || "",
    old_price: product?.old_price?.toString() || "",
    badge: product?.badge || "",
    category_id: product?.category_id || "",
    in_stock: product?.in_stock ?? true,
    stock_count: product?.stock_count?.toString() || "0",
    images: product?.images || [] as string[],
  });
  const [imageUrl, setImageUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function autoSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
      .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function handleNameChange(name: string) {
    setForm((f) => ({
      ...f,
      name,
      slug: product ? f.slug : autoSlug(name),
    }));
  }

  function addImage() {
    if (!imageUrl.trim()) return;
    setForm((f) => ({ ...f, images: [...f.images, imageUrl.trim()] }));
    setImageUrl("");
  }

  function removeImage(idx: number) {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      ...(product ? { id: product.id } : {}),
      store_id: storeId,
      name: form.name,
      slug: form.slug,
      description: form.description || null,
      price: Number(form.price),
      old_price: form.old_price ? Number(form.old_price) : null,
      badge: form.badge || null,
      category_id: form.category_id || null,
      in_stock: form.in_stock,
      stock_count: Number(form.stock_count),
      images: form.images,
    };

    try {
      const res = await fetch("/api/admin/products", {
        method: product ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Kayit hatasi");
        return;
      }
      onClose();
    } catch {
      setError("Baglanti hatasi");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)" }}>
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border p-6"
        style={{ background: "#1A1D27", borderColor: "#2A2D37" }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold" style={{ color: "#E5E7EB" }}>
            {product ? "Urun Duzenle" : "Yeni Urun"}
          </h2>
          <button onClick={onClose} className="text-xl" style={{ color: "#9CA3AF" }}>&times;</button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded text-sm" style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Urun Adi">
              <input
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ background: "#0F1117", borderColor: "#2A2D37", color: "#E5E7EB" }}
              />
            </Field>
            <Field label="Slug">
              <input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                required
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ background: "#0F1117", borderColor: "#2A2D37", color: "#E5E7EB" }}
              />
            </Field>
          </div>

          <Field label="Aciklama">
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none"
              style={{ background: "#0F1117", borderColor: "#2A2D37", color: "#E5E7EB" }}
            />
          </Field>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Fiyat (TL)">
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ background: "#0F1117", borderColor: "#2A2D37", color: "#E5E7EB" }}
              />
            </Field>
            <Field label="Eski Fiyat">
              <input
                type="number"
                value={form.old_price}
                onChange={(e) => setForm((f) => ({ ...f, old_price: e.target.value }))}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ background: "#0F1117", borderColor: "#2A2D37", color: "#E5E7EB" }}
              />
            </Field>
            <Field label="Badge">
              <input
                value={form.badge}
                onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
                placeholder="Yeni, Kampanya..."
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ background: "#0F1117", borderColor: "#2A2D37", color: "#E5E7EB" }}
              />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Kategori">
              <select
                value={form.category_id}
                onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ background: "#0F1117", borderColor: "#2A2D37", color: "#E5E7EB" }}
              >
                <option value="">Kategori Sec</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Stok Adedi">
              <input
                type="number"
                value={form.stock_count}
                onChange={(e) => setForm((f) => ({ ...f, stock_count: e.target.value }))}
                min="0"
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ background: "#0F1117", borderColor: "#2A2D37", color: "#E5E7EB" }}
              />
            </Field>
            <Field label="Stok Durumu">
              <label className="flex items-center gap-2 h-full pt-1">
                <input
                  type="checkbox"
                  checked={form.in_stock}
                  onChange={(e) => setForm((f) => ({ ...f, in_stock: e.target.checked }))}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm" style={{ color: "#E5E7EB" }}>Stokta</span>
              </label>
            </Field>
          </div>

          {/* Images */}
          <Field label="Gorseller">
            <div className="flex gap-2 mb-2">
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Gorsel URL yapistir..."
                className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ background: "#0F1117", borderColor: "#2A2D37", color: "#E5E7EB" }}
              />
              <button
                type="button"
                onClick={addImage}
                className="px-3 py-2 rounded-lg text-sm text-white"
                style={{ background: "#6366F1" }}
              >
                Ekle
              </button>
            </div>
            {form.images.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.images.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img src={img} alt="" className="w-16 h-16 rounded object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs text-white flex items-center justify-center"
                      style={{ background: "#EF4444" }}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Field>

          <div className="flex justify-end gap-3 pt-4" style={{ borderTop: "1px solid #2A2D37" }}>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm"
              style={{ background: "#2A2D37", color: "#9CA3AF" }}
            >
              Iptal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50"
              style={{ background: "#6366F1" }}
            >
              {saving ? "Kaydediliyor..." : product ? "Guncelle" : "Olustur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs mb-1 block" style={{ color: "#9CA3AF" }}>{label}</span>
      {children}
    </label>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: "#9CA3AF" }}>
      {children}
    </th>
  );
}
