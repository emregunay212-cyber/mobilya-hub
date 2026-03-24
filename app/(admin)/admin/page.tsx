"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/admin/AdminShell";
import Link from "next/link";

interface DashboardData {
  storeCount: number;
  productCount: number;
  activeDeployments: number;
  recentStores: Array<{
    id: string;
    name: string;
    slug: string;
    city: string;
    is_active: boolean;
    created_at: string;
  }>;
}

export default function DashboardPage() {
  const { token } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/stores", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const stores = await res.json();
        const storeList = Array.isArray(stores) ? stores : stores.stores || [];

        // Fetch product counts for each store
        let totalProducts = 0;
        for (const store of storeList.slice(0, 50)) {
          try {
            const pRes = await fetch(`/api/admin/products?store_id=${store.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const pData = await pRes.json();
            const products = Array.isArray(pData) ? pData : pData.products || [];
            totalProducts += products.length;
          } catch {
            // skip
          }
        }

        const activeCount = storeList.filter(
          (s: { is_active?: boolean; deployment_url?: string }) => s.is_active && s.deployment_url
        ).length;

        setData({
          storeCount: storeList.length,
          productCount: totalProducts,
          activeDeployments: activeCount,
          recentStores: storeList.slice(0, 5),
        });
      } catch {
        setData({ storeCount: 0, productCount: 0, activeDeployments: 0, recentStores: [] });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm" style={{ color: "#9CA3AF" }}>
          Yukleniyor...
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: "#E5E7EB" }}>
        Dashboard
      </h1>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Toplam Magaza" value={data.storeCount} color="#6366F1" />
        <StatCard label="Toplam Urun" value={data.productCount} color="#10B981" />
        <StatCard label="Aktif Deploy" value={data.activeDeployments} color="#F59E0B" />
      </div>

      {/* Recent stores */}
      <div
        className="rounded-xl border p-5"
        style={{ background: "#1A1D27", borderColor: "#2A2D37" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold" style={{ color: "#E5E7EB" }}>
            Son Magazalar
          </h2>
          <Link
            href="/admin/stores"
            className="text-xs px-3 py-1 rounded-lg"
            style={{ background: "#2A2D37", color: "#6366F1" }}
          >
            Tumunu Gor
          </Link>
        </div>

        {data.recentStores.length === 0 ? (
          <p className="text-sm" style={{ color: "#9CA3AF" }}>
            Henuz magaza yok.{" "}
            <Link href="/admin/stores/new" style={{ color: "#6366F1" }}>
              Yeni magaza olustur
            </Link>
          </p>
        ) : (
          <div className="space-y-2">
            {data.recentStores.map((store) => (
              <div
                key={store.id}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ background: "#0F1117" }}
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: "#E5E7EB" }}>
                    {store.name}
                  </p>
                  <p className="text-xs" style={{ color: "#9CA3AF" }}>
                    {store.city} &middot; /{store.slug}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{ background: store.is_active ? "#10B981" : "#EF4444" }}
                  />
                  <Link
                    href={`/admin/stores/${store.id}`}
                    className="text-xs px-2 py-1 rounded"
                    style={{ background: "#2A2D37", color: "#6366F1" }}
                  >
                    Duzenle
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      className="rounded-xl border p-5"
      style={{ background: "#1A1D27", borderColor: "#2A2D37" }}
    >
      <p className="text-xs mb-1" style={{ color: "#9CA3AF" }}>
        {label}
      </p>
      <p className="text-3xl font-bold" style={{ color }}>
        {value}
      </p>
    </div>
  );
}
