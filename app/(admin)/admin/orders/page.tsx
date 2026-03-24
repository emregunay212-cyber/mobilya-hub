"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/admin/AdminShell";

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_image?: string;
}

interface Order {
  id: string;
  store_id: string;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string;
  total: number;
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  tracking_number: string;
  notes: string;
  coupon_code: string;
  created_at: string;
  order_items: OrderItem[];
}

interface Store {
  id: string;
  name: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "Beklemede", color: "#F59E0B" },
  confirmed: { label: "Onaylandi", color: "#3B82F6" },
  processing: { label: "Hazirlaniyor", color: "#8B5CF6" },
  shipped: { label: "Kargoda", color: "#6366F1" },
  delivered: { label: "Teslim Edildi", color: "#10B981" },
  cancelled: { label: "Iptal", color: "#EF4444" },
  refunded: { label: "Iade", color: "#9CA3AF" },
};

const PAYMENT_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "Beklemede", color: "#F59E0B" },
  paid: { label: "Odendi", color: "#10B981" },
  failed: { label: "Basarisiz", color: "#EF4444" },
  refunded: { label: "Iade Edildi", color: "#9CA3AF" },
};

export default function OrdersPage() {
  const { token } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    loadStores();
  }, [token]);

  useEffect(() => {
    if (selectedStore) loadOrders();
  }, [selectedStore, statusFilter]);

  async function loadStores() {
    try {
      const res = await fetch("/api/admin/stores", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.stores || [];
      setStores(list);
      if (list.length > 0) setSelectedStore(list[0].id);
    } catch {
      setStores([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadOrders() {
    try {
      let url = `/api/admin/orders?store_id=${selectedStore}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(data.orders || []);
    } catch {
      setOrders([]);
    }
  }

  async function updateOrderStatus(orderId: string, field: string, value: string) {
    try {
      await fetch("/api/admin/orders", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: orderId, [field]: value }),
      });
      loadOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => prev ? { ...prev, [field]: value } : null);
      }
    } catch {
      alert("Guncelleme hatasi");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-sm" style={{ color: "#9CA3AF" }}>Yukleniyor...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: "#E5E7EB" }}>Siparisler</h1>

      {/* Filters */}
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
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border text-sm"
          style={{ background: "#1A1D27", borderColor: "#2A2D37", color: "#E5E7EB" }}
        >
          <option value="">Tum Durumlar</option>
          {Object.entries(STATUS_LABELS).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border p-12 text-center" style={{ background: "#1A1D27", borderColor: "#2A2D37" }}>
          <p className="text-sm" style={{ color: "#9CA3AF" }}>Siparis bulunamadi.</p>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden" style={{ background: "#1A1D27", borderColor: "#2A2D37" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid #2A2D37" }}>
                <Th>Siparis No</Th>
                <Th>Musteri</Th>
                <Th>Toplam</Th>
                <Th>Durum</Th>
                <Th>Odeme</Th>
                <Th>Tarih</Th>
                <Th>Islem</Th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const st = STATUS_LABELS[order.status] || { label: order.status, color: "#9CA3AF" };
                const pt = PAYMENT_LABELS[order.payment_status] || { label: order.payment_status, color: "#9CA3AF" };
                return (
                  <tr key={order.id} style={{ borderBottom: "1px solid #2A2D37" }}>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs" style={{ color: "#6366F1" }}>
                        {order.order_number}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p style={{ color: "#E5E7EB" }}>{order.customer_name}</p>
                      <p className="text-xs" style={{ color: "#9CA3AF" }}>{order.customer_email}</p>
                    </td>
                    <td className="px-4 py-3" style={{ color: "#10B981" }}>
                      {Number(order.total).toLocaleString("tr-TR")} TL
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: `${st.color}15`, color: st.color }}
                      >
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: `${pt.color}15`, color: pt.color }}
                      >
                        {pt.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "#9CA3AF" }}>
                      {new Date(order.created_at).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-xs px-2.5 py-1 rounded"
                        style={{ background: "#2A2D37", color: "#6366F1" }}
                      >
                        Detay
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={updateOrderStatus}
        />
      )}
    </div>
  );
}

function OrderDetailModal({
  order,
  onClose,
  onUpdateStatus,
}: {
  order: Order;
  onClose: () => void;
  onUpdateStatus: (id: string, field: string, value: string) => void;
}) {
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)" }}>
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border p-6"
        style={{ background: "#1A1D27", borderColor: "#2A2D37" }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold" style={{ color: "#E5E7EB" }}>
            Siparis #{order.order_number}
          </h2>
          <button onClick={onClose} className="text-xl" style={{ color: "#9CA3AF" }}>&times;</button>
        </div>

        {/* Customer info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <InfoBlock label="Musteri" value={order.customer_name} />
          <InfoBlock label="E-posta" value={order.customer_email} />
          <InfoBlock label="Telefon" value={order.customer_phone || "-"} />
          <InfoBlock label="Sehir" value={order.shipping_city || "-"} />
          <InfoBlock label="Adres" value={order.shipping_address || "-"} />
          <InfoBlock label="Tarih" value={new Date(order.created_at).toLocaleString("tr-TR")} />
        </div>

        {/* Order items */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-2" style={{ color: "#E5E7EB" }}>Urunler</h3>
          <div className="space-y-2">
            {order.order_items?.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: "#0F1117" }}>
                <div className="flex items-center gap-3">
                  {item.product_image ? (
                    <img src={item.product_image} alt="" className="w-8 h-8 rounded object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: "#2A2D37" }}>📦</div>
                  )}
                  <div>
                    <p className="text-sm" style={{ color: "#E5E7EB" }}>{item.product_name}</p>
                    <p className="text-xs" style={{ color: "#9CA3AF" }}>{item.quantity} adet x {Number(item.unit_price).toLocaleString("tr-TR")} TL</p>
                  </div>
                </div>
                <span className="text-sm" style={{ color: "#10B981" }}>
                  {Number(item.total_price).toLocaleString("tr-TR")} TL
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="mb-6 p-4 rounded-lg" style={{ background: "#0F1117" }}>
          <div className="flex justify-between text-sm mb-1">
            <span style={{ color: "#9CA3AF" }}>Ara Toplam</span>
            <span style={{ color: "#E5E7EB" }}>{Number(order.subtotal).toLocaleString("tr-TR")} TL</span>
          </div>
          {Number(order.discount_amount) > 0 && (
            <div className="flex justify-between text-sm mb-1">
              <span style={{ color: "#9CA3AF" }}>Indirim {order.coupon_code && `(${order.coupon_code})`}</span>
              <span style={{ color: "#EF4444" }}>-{Number(order.discount_amount).toLocaleString("tr-TR")} TL</span>
            </div>
          )}
          <div className="flex justify-between text-sm mb-1">
            <span style={{ color: "#9CA3AF" }}>Kargo</span>
            <span style={{ color: "#E5E7EB" }}>{Number(order.shipping_cost).toLocaleString("tr-TR")} TL</span>
          </div>
          <div className="flex justify-between text-sm font-bold pt-2" style={{ borderTop: "1px solid #2A2D37" }}>
            <span style={{ color: "#E5E7EB" }}>Toplam</span>
            <span style={{ color: "#10B981" }}>{Number(order.total).toLocaleString("tr-TR")} TL</span>
          </div>
        </div>

        {/* Status controls */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <label className="block">
            <span className="text-xs mb-1 block" style={{ color: "#9CA3AF" }}>Siparis Durumu</span>
            <select
              value={order.status}
              onChange={(e) => onUpdateStatus(order.id, "status", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{ background: "#0F1117", borderColor: "#2A2D37", color: "#E5E7EB" }}
            >
              {Object.entries(STATUS_LABELS).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs mb-1 block" style={{ color: "#9CA3AF" }}>Odeme Durumu</span>
            <select
              value={order.payment_status}
              onChange={(e) => onUpdateStatus(order.id, "payment_status", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{ background: "#0F1117", borderColor: "#2A2D37", color: "#E5E7EB" }}
            >
              {Object.entries(PAYMENT_LABELS).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </label>
        </div>

        {/* Tracking number */}
        <div className="flex gap-2">
          <input
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Kargo takip no..."
            className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none"
            style={{ background: "#0F1117", borderColor: "#2A2D37", color: "#E5E7EB" }}
          />
          <button
            onClick={() => onUpdateStatus(order.id, "tracking_number", trackingNumber)}
            className="px-4 py-2 rounded-lg text-sm text-white"
            style={{ background: "#6366F1" }}
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs" style={{ color: "#9CA3AF" }}>{label}</p>
      <p className="text-sm" style={{ color: "#E5E7EB" }}>{value}</p>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: "#9CA3AF" }}>
      {children}
    </th>
  );
}
