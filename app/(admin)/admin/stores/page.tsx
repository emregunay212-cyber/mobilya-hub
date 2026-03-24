"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/admin/AdminShell";
import Link from "next/link";

interface Store {
  id: string;
  name: string;
  slug: string;
  city: string;
  is_active: boolean;
  deployment_url?: string;
  deployment_status?: string;
  settings?: { theme?: string; sector?: string };
  created_at: string;
  _productCount?: number;
}

export default function StoresPage() {
  const { token } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadStores() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stores", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const list: Store[] = Array.isArray(data) ? data : data.stores || [];

      // Fetch product counts
      const enriched = await Promise.all(
        list.map(async (store) => {
          try {
            const pRes = await fetch(`/api/admin/products?store_id=${store.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const pData = await pRes.json();
            const products = Array.isArray(pData) ? pData : pData.products || [];
            return { ...store, _productCount: products.length };
          } catch {
            return { ...store, _productCount: 0 };
          }
        })
      );

      setStores(enriched);
    } catch {
      setStores([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleDelete(id: string) {
    if (!confirm("Bu magazayi silmek istediginize emin misiniz?")) return;
    try {
      await fetch(`/api/admin/stores/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setStores((prev) => prev.filter((s) => s.id !== id));
    } catch {
      alert("Silme hatasi");
    }
  }

  async function handleRedeploy(id: string) {
    try {
      const res = await fetch("/api/admin/deploy", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ store_id: id }),
      });
      if (res.ok) {
        alert("Deploy baslatildi!");
        loadStores();
      } else {
        const err = await res.json();
        alert(err.error || "Deploy hatasi");
      }
    } catch {
      alert("Deploy hatasi");
    }
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "#E5E7EB" }}>
          Magazalar
        </h1>
        <Link
          href="/admin/stores/new"
          className="px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: "#6366F1" }}
        >
          + Yeni Magaza
        </Link>
      </div>

      {stores.length === 0 ? (
        <div
          className="rounded-xl border p-12 text-center"
          style={{ background: "#1A1D27", borderColor: "#2A2D37" }}
        >
          <p className="text-sm mb-2" style={{ color: "#9CA3AF" }}>
            Henuz magaza yok.
          </p>
          <Link href="/admin/stores/new" style={{ color: "#6366F1" }} className="text-sm">
            Ilk magazanizi olusturun
          </Link>
        </div>
      ) : (
        <div
          className="rounded-xl border overflow-hidden"
          style={{ background: "#1A1D27", borderColor: "#2A2D37" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid #2A2D37" }}>
                <Th>Magaza</Th>
                <Th>Sektor</Th>
                <Th>Sehir</Th>
                <Th>Durum</Th>
                <Th>Deploy</Th>
                <Th>Urunler</Th>
                <Th>Islemler</Th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => (
                <tr key={store.id} style={{ borderBottom: "1px solid #2A2D37" }}>
                  <td className="px-4 py-3">
                    <p className="font-medium" style={{ color: "#E5E7EB" }}>
                      {store.name}
                    </p>
                    <p className="text-xs" style={{ color: "#9CA3AF" }}>
                      /{store.slug}
                    </p>
                  </td>
                  <td className="px-4 py-3" style={{ color: "#9CA3AF" }}>
                    {store.settings?.sector || "-"}
                  </td>
                  <td className="px-4 py-3" style={{ color: "#9CA3AF" }}>
                    {store.city || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: store.is_active
                          ? "rgba(16,185,129,0.1)"
                          : "rgba(239,68,68,0.1)",
                        color: store.is_active ? "#10B981" : "#EF4444",
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: store.is_active ? "#10B981" : "#EF4444" }}
                      />
                      {store.is_active ? "Aktif" : "Pasif"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {store.deployment_url ? (
                      <span className="text-xs" style={{ color: "#10B981" }}>
                        Yayinda
                      </span>
                    ) : (
                      <span className="text-xs" style={{ color: "#9CA3AF" }}>
                        -
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3" style={{ color: "#9CA3AF" }}>
                    {store._productCount ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/stores/${store.id}`}
                        className="text-xs px-2.5 py-1 rounded"
                        style={{ background: "#2A2D37", color: "#6366F1" }}
                      >
                        Duzenle
                      </Link>
                      <button
                        onClick={() => handleRedeploy(store.id)}
                        className="text-xs px-2.5 py-1 rounded"
                        style={{ background: "#2A2D37", color: "#10B981" }}
                      >
                        Deploy
                      </button>
                      <button
                        onClick={() => handleDelete(store.id)}
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
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider"
      style={{ color: "#9CA3AF" }}
    >
      {children}
    </th>
  );
}
