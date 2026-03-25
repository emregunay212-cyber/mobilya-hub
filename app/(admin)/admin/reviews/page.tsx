"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/admin/AdminShell";

interface Review {
  id: string;
  store_id: string;
  product_id: string;
  customer_name: string;
  customer_email: string;
  rating: number;
  comment: string;
  is_approved: boolean;
  created_at: string;
  products?: { name: string };
}

interface Store {
  id: string;
  name: string;
}

export default function ReviewsPage() {
  const { token } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadStores();
  }, [token]);

  useEffect(() => {
    if (selectedStore) loadReviews();
  }, [selectedStore, filter]);

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

  async function loadReviews() {
    try {
      let url = `/api/admin/reviews?store_id=${selectedStore}`;
      if (filter === "pending") url += "&approved=false";
      if (filter === "approved") url += "&approved=true";
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setReviews(data.reviews || (Array.isArray(data) ? data : []));
    } catch {
      setReviews([]);
    }
  }

  async function approveReview(id: string) {
    setActionLoading(id);
    try {
      await fetch("/api/admin/reviews", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, is_approved: true }),
      });
      loadReviews();
    } catch {
      alert("Onaylama hatasi");
    } finally {
      setActionLoading(null);
    }
  }

  async function rejectReview(id: string) {
    setActionLoading(id);
    try {
      await fetch("/api/admin/reviews", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, is_approved: false }),
      });
      loadReviews();
    } catch {
      alert("Reddetme hatasi");
    } finally {
      setActionLoading(null);
    }
  }

  async function deleteReview(id: string) {
    if (!confirm("Bu yorumu silmek istediginize emin misiniz?")) return;
    setActionLoading(id);
    try {
      await fetch(`/api/admin/reviews?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      loadReviews();
    } catch {
      alert("Silme hatasi");
    } finally {
      setActionLoading(null);
    }
  }

  const pendingCount = reviews.filter((r) => !r.is_approved).length;
  const approvedCount = reviews.filter((r) => r.is_approved).length;

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
        <h1 className="text-2xl font-bold" style={{ color: "#E5E7EB" }}>Yorumlar</h1>
        {pendingCount > 0 && (
          <span
            className="text-xs px-3 py-1 rounded-full font-medium"
            style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B" }}
          >
            {pendingCount} onay bekliyor
          </span>
        )}
      </div>

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

        <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "#2A2D37" }}>
          {([
            { key: "all", label: `Tumu (${reviews.length})` },
            { key: "pending", label: `Bekleyen (${pendingCount})` },
            { key: "approved", label: `Onaylanan (${approvedCount})` },
          ] as const).map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className="px-3 py-2 text-xs font-medium transition-colors"
              style={{
                background: filter === item.key ? "#6366F1" : "#1A1D27",
                color: filter === item.key ? "#fff" : "#9CA3AF",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-xl border p-12 text-center" style={{ background: "#1A1D27", borderColor: "#2A2D37" }}>
          <p className="text-sm" style={{ color: "#9CA3AF" }}>Yorum bulunamadi.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-xl border p-4"
              style={{
                background: "#1A1D27",
                borderColor: review.is_approved ? "#2A2D37" : "#F59E0B30",
              }}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left: Review info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium" style={{ color: "#E5E7EB" }}>
                      {review.customer_name}
                    </span>
                    <Stars rating={review.rating} />
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: review.is_approved ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)",
                        color: review.is_approved ? "#10B981" : "#F59E0B",
                      }}
                    >
                      {review.is_approved ? "Onaylandi" : "Beklemede"}
                    </span>
                  </div>

                  <p className="text-xs mb-1" style={{ color: "#9CA3AF" }}>
                    {review.customer_email} &middot; {review.products?.name || "Urun"} &middot;{" "}
                    {new Date(review.created_at).toLocaleDateString("tr-TR")}
                  </p>

                  <p className="text-sm mt-2" style={{ color: "#D1D5DB" }}>
                    {review.comment}
                  </p>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!review.is_approved && (
                    <button
                      onClick={() => approveReview(review.id)}
                      disabled={actionLoading === review.id}
                      className="text-xs px-3 py-1.5 rounded font-medium disabled:opacity-50"
                      style={{ background: "rgba(16,185,129,0.15)", color: "#10B981" }}
                    >
                      Onayla
                    </button>
                  )}
                  {review.is_approved && (
                    <button
                      onClick={() => rejectReview(review.id)}
                      disabled={actionLoading === review.id}
                      className="text-xs px-3 py-1.5 rounded font-medium disabled:opacity-50"
                      style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B" }}
                    >
                      Geri Al
                    </button>
                  )}
                  <button
                    onClick={() => deleteReview(review.id)}
                    disabled={actionLoading === review.id}
                    className="text-xs px-3 py-1.5 rounded font-medium disabled:opacity-50"
                    style={{ background: "rgba(239,68,68,0.15)", color: "#EF4444" }}
                  >
                    Sil
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={i <= rating ? "#F59E0B" : "none"}
          stroke={i <= rating ? "#F59E0B" : "#4B5563"}
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
          />
        </svg>
      ))}
    </div>
  );
}
