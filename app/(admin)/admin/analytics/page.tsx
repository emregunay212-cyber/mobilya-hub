"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/admin/AdminShell";

interface AnalyticsData {
  storeCount: number;
  productCount: number;
  orderCount: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  dailyRevenue: Record<string, number>;
  dailyOrders: Record<string, number>;
  statusBreakdown: Record<string, number>;
  topProducts: Array<{ name: string; count: number }>;
}

interface Store { id: string; name: string; }

const STATUS_COLORS: Record<string, string> = {
  pending: "#F59E0B",
  confirmed: "#3B82F6",
  processing: "#8B5CF6",
  shipped: "#6366F1",
  delivered: "#10B981",
  cancelled: "#EF4444",
  refunded: "#9CA3AF",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Beklemede",
  confirmed: "Onaylandi",
  processing: "Hazirlaniyor",
  shipped: "Kargoda",
  delivered: "Teslim Edildi",
  cancelled: "Iptal",
  refunded: "Iade",
};

export default function AnalyticsPage() {
  const { token } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState("");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStores(); }, [token]);

  useEffect(() => { loadAnalytics(); }, [selectedStore]);

  async function loadStores() {
    try {
      const res = await fetch("/api/admin/stores", { headers: { Authorization: `Bearer ${token}` } });
      const d = await res.json();
      setStores(Array.isArray(d) ? d : d.stores || []);
    } catch { setStores([]); }
  }

  async function loadAnalytics() {
    setLoading(true);
    try {
      let url = "/api/admin/analytics";
      if (selectedStore) url += `?store_id=${selectedStore}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      setData(await res.json());
    } catch { setData(null); }
    finally { setLoading(false); }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-sm" style={{ color: "#9CA3AF" }}>Yukleniyor...</div></div>;
  }

  if (!data) return null;

  // Chart data - last 7 days
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  const maxRevenue = Math.max(...days.map((d) => data.dailyRevenue[d] || 0), 1);
  const maxOrders = Math.max(...days.map((d) => data.dailyOrders[d] || 0), 1);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "#E5E7EB" }}>Analitik</h1>
        <select value={selectedStore} onChange={(e) => setSelectedStore(e.target.value)}
          className="px-3 py-2 rounded-lg border text-sm"
          style={{ background: "#1A1D27", borderColor: "#2A2D37", color: "#E5E7EB" }}>
          <option value="">Tum Magazalar</option>
          {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard label="Toplam Gelir" value={`${data.totalRevenue.toLocaleString("tr-TR")} TL`} color="#10B981" />
        <StatCard label="Toplam Siparis" value={data.orderCount.toString()} color="#6366F1" />
        <StatCard label="Bekleyen" value={data.pendingOrders.toString()} color="#F59E0B" />
        <StatCard label="Tamamlanan" value={data.completedOrders.toString()} color="#3B82F6" />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Revenue chart */}
        <div className="rounded-xl border p-5" style={{ background: "#1A1D27", borderColor: "#2A2D37" }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "#E5E7EB" }}>Son 7 Gun - Gelir</h3>
          <div className="flex items-end gap-1 h-32">
            {days.map((day) => {
              const val = data.dailyRevenue[day] || 0;
              const height = (val / maxRevenue) * 100;
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px]" style={{ color: "#9CA3AF" }}>
                    {val > 0 ? `${(val / 1000).toFixed(0)}k` : "0"}
                  </span>
                  <div className="w-full rounded-t" style={{ height: `${Math.max(height, 2)}%`, background: "#10B981" }} />
                  <span className="text-[9px]" style={{ color: "#6B7280" }}>{day.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Orders chart */}
        <div className="rounded-xl border p-5" style={{ background: "#1A1D27", borderColor: "#2A2D37" }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "#E5E7EB" }}>Son 7 Gun - Siparis</h3>
          <div className="flex items-end gap-1 h-32">
            {days.map((day) => {
              const val = data.dailyOrders[day] || 0;
              const height = (val / maxOrders) * 100;
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px]" style={{ color: "#9CA3AF" }}>{val}</span>
                  <div className="w-full rounded-t" style={{ height: `${Math.max(height, 2)}%`, background: "#6366F1" }} />
                  <span className="text-[9px]" style={{ color: "#6B7280" }}>{day.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Status breakdown */}
        <div className="rounded-xl border p-5" style={{ background: "#1A1D27", borderColor: "#2A2D37" }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "#E5E7EB" }}>Siparis Durumlari</h3>
          <div className="space-y-2">
            {Object.entries(data.statusBreakdown).map(([status, count]) => {
              const pct = data.orderCount > 0 ? (count / data.orderCount) * 100 : 0;
              return (
                <div key={status} className="flex items-center gap-3">
                  <div className="w-20 text-xs" style={{ color: STATUS_COLORS[status] || "#9CA3AF" }}>
                    {STATUS_LABELS[status] || status}
                  </div>
                  <div className="flex-1 h-2 rounded-full" style={{ background: "#2A2D37" }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: STATUS_COLORS[status] || "#9CA3AF" }} />
                  </div>
                  <span className="text-xs w-8 text-right" style={{ color: "#9CA3AF" }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top products */}
        <div className="rounded-xl border p-5" style={{ background: "#1A1D27", borderColor: "#2A2D37" }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "#E5E7EB" }}>En Cok Satan Urunler</h3>
          {data.topProducts.length === 0 ? (
            <p className="text-sm" style={{ color: "#9CA3AF" }}>Henuz veri yok.</p>
          ) : (
            <div className="space-y-2">
              {data.topProducts.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg" style={{ background: "#0F1117" }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold w-5 text-center" style={{ color: "#6366F1" }}>#{idx + 1}</span>
                    <span className="text-sm" style={{ color: "#E5E7EB" }}>{p.name}</span>
                  </div>
                  <span className="text-xs" style={{ color: "#10B981" }}>{p.count} adet</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl border p-4" style={{ background: "#1A1D27", borderColor: "#2A2D37" }}>
      <p className="text-xs mb-1" style={{ color: "#9CA3AF" }}>{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
    </div>
  );
}
