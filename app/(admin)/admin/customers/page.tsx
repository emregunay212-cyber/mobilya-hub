"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/admin/AdminShell";

interface Customer {
  email: string;
  name: string;
  phone: string;
  order_count: number;
  total_spent: number;
  last_order: string;
}

interface Store { id: string; name: string; }

export default function CustomersPage() {
  const { token } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { loadStores(); }, [token]);
  useEffect(() => { if (selectedStore) loadCustomers(); }, [selectedStore, search]);

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

  async function loadCustomers() {
    try {
      let url = `/api/admin/customers?store_id=${selectedStore}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setCustomers(data.customers || []);
    } catch { setCustomers([]); }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-sm" style={{ color: "#9CA3AF" }}>Yukleniyor...</div></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: "#E5E7EB" }}>Musteriler</h1>

      <div className="flex flex-wrap gap-3 mb-4">
        <select value={selectedStore} onChange={(e) => setSelectedStore(e.target.value)}
          className="px-3 py-2 rounded-lg border text-sm"
          style={{ background: "#1A1D27", borderColor: "#2A2D37", color: "#E5E7EB" }}>
          {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Musteri ara..." className="flex-1 min-w-[200px] px-3 py-2 rounded-lg border text-sm outline-none"
          style={{ background: "#1A1D27", borderColor: "#2A2D37", color: "#E5E7EB" }} />
      </div>

      {customers.length === 0 ? (
        <div className="rounded-xl border p-12 text-center" style={{ background: "#1A1D27", borderColor: "#2A2D37" }}>
          <p className="text-sm" style={{ color: "#9CA3AF" }}>
            {search ? "Sonuc bulunamadi." : "Henuz musteri yok."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden" style={{ background: "#1A1D27", borderColor: "#2A2D37" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid #2A2D37" }}>
                <Th>Musteri</Th><Th>Telefon</Th><Th>Siparis</Th><Th>Toplam Harcama</Th><Th>Son Siparis</Th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.email} style={{ borderBottom: "1px solid #2A2D37" }}>
                  <td className="px-4 py-3">
                    <p className="font-medium" style={{ color: "#E5E7EB" }}>{c.name}</p>
                    <p className="text-xs" style={{ color: "#9CA3AF" }}>{c.email}</p>
                  </td>
                  <td className="px-4 py-3" style={{ color: "#9CA3AF" }}>{c.phone || "-"}</td>
                  <td className="px-4 py-3">
                    <span className="font-bold" style={{ color: "#6366F1" }}>{c.order_count}</span>
                  </td>
                  <td className="px-4 py-3" style={{ color: "#10B981" }}>
                    {c.total_spent.toLocaleString("tr-TR")} TL
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "#9CA3AF" }}>
                    {new Date(c.last_order).toLocaleDateString("tr-TR")}
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
  return <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider" style={{ color: "#9CA3AF" }}>{children}</th>;
}
