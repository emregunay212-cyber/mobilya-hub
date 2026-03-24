"use client";

import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";

const STATUS_MAP = {
  pending: { label: "Beklemede", color: "#F59E0B", step: 0 },
  confirmed: { label: "Onaylandi", color: "#3B82F6", step: 1 },
  processing: { label: "Hazirlaniyor", color: "#8B5CF6", step: 2 },
  shipped: { label: "Kargoda", color: "#6366F1", step: 3 },
  delivered: { label: "Teslim Edildi", color: "#10B981", step: 4 },
  cancelled: { label: "Iptal Edildi", color: "#EF4444", step: -1 },
};

const STEPS = ["Alindi", "Onaylandi", "Hazirlaniyor", "Kargoda", "Teslim"];

export default function OrderTrackingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const storeSlug = params.store;

  const [orderNumber, setOrderNumber] = useState(searchParams.get("order") || "");
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  async function handleSearch(e) {
    e?.preventDefault();
    if (!orderNumber || !email) return;

    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const res = await fetch(
        `/api/orders?order_number=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(email)}`
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Siparis bulunamadi");
        setOrder(null);
      } else {
        setOrder(data);
      }
    } catch {
      setError("Baglanti hatasi");
    } finally {
      setLoading(false);
    }
  }

  // Auto-search if params provided
  useState(() => {
    if (orderNumber && email) handleSearch();
  });

  const statusInfo = order ? STATUS_MAP[order.status] || { label: order.status, color: "#9CA3AF", step: 0 } : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href={`/${storeSlug}`} className="text-sm text-indigo-500 mb-4 inline-block">
          ← Magazaya Don
        </Link>

        <h1 className="text-2xl font-bold text-gray-800 mb-6">Siparis Takip</h1>

        {/* Search form */}
        <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 mb-1 block">Siparis Numarasi</span>
              <input
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="ORD-XXXXXX-XXXX"
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700 mb-1 block">E-posta</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@email.com"
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50"
          >
            {loading ? "Araniyor..." : "Siparis Sorgula"}
          </button>
        </form>

        {error && searched && (
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {/* Order result */}
        {order && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-gray-500">Siparis No</p>
                <p className="text-lg font-bold text-indigo-600">{order.order_number}</p>
              </div>
              <span
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{ background: `${statusInfo.color}15`, color: statusInfo.color }}
              >
                {statusInfo.label}
              </span>
            </div>

            {/* Progress steps */}
            {statusInfo.step >= 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  {STEPS.map((step, idx) => (
                    <div key={idx} className="flex flex-col items-center flex-1">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{
                          background: idx <= statusInfo.step ? "#6366F1" : "#E5E7EB",
                          color: idx <= statusInfo.step ? "#fff" : "#9CA3AF",
                        }}
                      >
                        {idx <= statusInfo.step ? "✓" : idx + 1}
                      </div>
                      <span className="text-[10px] mt-1 text-gray-500">{step}</span>
                    </div>
                  ))}
                </div>
                <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      background: "#6366F1",
                      width: `${(statusInfo.step / (STEPS.length - 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Tracking number */}
            {order.tracking_number && (
              <div className="bg-indigo-50 p-4 rounded-xl mb-4">
                <p className="text-sm text-indigo-600">
                  <strong>Kargo Takip No:</strong> {order.tracking_number}
                </p>
              </div>
            )}

            {/* Items */}
            <h3 className="font-semibold text-gray-800 mb-3">Urunler</h3>
            <div className="space-y-2 mb-4">
              {order.order_items?.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    {item.product_image ? (
                      <img src={item.product_image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">📦</div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-800">{item.product_name}</p>
                      <p className="text-xs text-gray-500">{item.quantity} adet</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-800">
                    {Number(item.total_price).toLocaleString("tr-TR")} TL
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t pt-3 flex justify-between items-center">
              <span className="font-semibold text-gray-800">Toplam</span>
              <span className="text-lg font-bold text-emerald-600">
                {Number(order.total).toLocaleString("tr-TR")} TL
              </span>
            </div>

            <p className="text-xs text-gray-400 mt-4">
              Tarih: {new Date(order.created_at).toLocaleString("tr-TR")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
