"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const storeSlug = params.store;
  const [cart, setCart] = useState([]);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponResult, setCouponResult] = useState(null);
  const [couponError, setCouponError] = useState("");

  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    shipping_address: "",
    shipping_city: "",
    shipping_district: "",
    shipping_postal_code: "",
    payment_method: "cod",
    notes: "",
    coupon_code: "",
  });

  useEffect(() => {
    // Load cart from localStorage
    const stored = localStorage.getItem(`cart_${storeSlug}`);
    if (stored) {
      try {
        setCart(JSON.parse(stored));
      } catch {
        setCart([]);
      }
    }

    // Load store info
    fetch(`/api/stores?slug=${storeSlug}`)
      .then((r) => r.json())
      .then((data) => setStore(data))
      .catch(() => {});
  }, [storeSlug]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discountAmount = couponResult?.discount_amount || 0;
  const total = Math.max(0, subtotal - discountAmount);

  async function handleApplyCoupon() {
    if (!form.coupon_code.trim() || !store?.id) return;
    setCouponLoading(true);
    setCouponError("");
    setCouponResult(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store_id: store.id,
          code: form.coupon_code,
          order_total: subtotal,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error || "Gecersiz kupon");
      } else {
        setCouponResult(data);
      }
    } catch {
      setCouponError("Baglanti hatasi");
    } finally {
      setCouponLoading(false);
    }
  }

  function handleRemoveCoupon() {
    setCouponResult(null);
    setCouponError("");
    setForm((f) => ({ ...f, coupon_code: "" }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (cart.length === 0) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store_id: store?.id,
          ...form,
          discount_amount: discountAmount,
          items: cart.map((item) => ({
            product_id: item.id,
            name: item.name,
            slug: item.slug,
            image: item.images?.[0] || null,
            quantity: item.qty,
            price: item.price,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Siparis olusturulamadi");
        return;
      }

      // Clear cart
      localStorage.removeItem(`cart_${storeSlug}`);
      setSuccess(data.order);
    } catch {
      setError("Baglanti hatasi");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Siparisiniz Alindi!</h1>
          <p className="text-gray-500 mb-4">
            Siparis numaraniz: <strong className="text-indigo-600">{success.order_number}</strong>
          </p>
          <p className="text-gray-500 mb-6">
            Toplam: <strong className="text-emerald-600">{Number(success.total).toLocaleString("tr-TR")} TL</strong>
          </p>
          <div className="space-y-3">
            <Link
              href={`/${storeSlug}/siparis-takip?order=${success.order_number}&email=${form.customer_email}`}
              className="block w-full py-3 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600 transition-colors"
            >
              Siparisi Takip Et
            </Link>
            <Link
              href={`/${storeSlug}`}
              className="block w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Alişverişe Devam Et
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href={`/${storeSlug}`} className="text-sm text-indigo-500 mb-4 inline-block">
          ← Magazaya Don
        </Link>

        <h1 className="text-2xl font-bold text-gray-800 mb-6">Siparis Olustur</h1>

        {cart.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <p className="text-gray-500 mb-4">Sepetiniz bos.</p>
            <Link href={`/${storeSlug}`} className="text-indigo-500 font-medium">
              Alişverişe Basla
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Form */}
              <div className="md:col-span-2 space-y-4">
                <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
                  <h2 className="font-semibold text-gray-800 mb-3 sm:mb-4">Teslimat Bilgileri</h2>

                  {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <InputField label="Ad Soyad" required value={form.customer_name}
                      onChange={(v) => setForm((f) => ({ ...f, customer_name: v }))} />
                    <InputField label="E-posta" type="email" required value={form.customer_email}
                      onChange={(v) => setForm((f) => ({ ...f, customer_email: v }))} />
                    <InputField label="Telefon" value={form.customer_phone}
                      onChange={(v) => setForm((f) => ({ ...f, customer_phone: v }))} />
                    <InputField label="Sehir" value={form.shipping_city}
                      onChange={(v) => setForm((f) => ({ ...f, shipping_city: v }))} />
                    <div className="sm:col-span-2">
                      <InputField label="Adres" value={form.shipping_address}
                        onChange={(v) => setForm((f) => ({ ...f, shipping_address: v }))} />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Not</label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-200 resize-none"
                    />
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
                  <h2 className="font-semibold text-gray-800 mb-3 sm:mb-4">Odeme Yontemi</h2>
                  <div className="space-y-2">
                    {[
                      { value: "cod", label: "Kapida Odeme" },
                      { value: "bank_transfer", label: "Banka Havale/EFT" },
                      { value: "credit_card", label: "Kredi Karti" },
                    ].map((opt) => (
                      <label key={opt.value} className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer"
                        style={{ borderColor: form.payment_method === opt.value ? "#6366F1" : "#E5E7EB" }}>
                        <input type="radio" name="payment" value={opt.value}
                          checked={form.payment_method === opt.value}
                          onChange={() => setForm((f) => ({ ...f, payment_method: opt.value }))}
                          className="w-4 h-4" />
                        <span className="text-sm text-gray-700">{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div>
                <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:sticky md:top-4">
                  <h2 className="font-semibold text-gray-800 mb-4">Siparis Ozeti</h2>
                  <div className="space-y-3 mb-4">
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.name} <span className="text-gray-400">x{item.qty}</span>
                        </span>
                        <span className="text-gray-800 font-medium">
                          {(item.price * item.qty).toLocaleString("tr-TR")} TL
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Toplam</span>
                      <span className="text-emerald-600">{total.toLocaleString("tr-TR")} TL</span>
                    </div>
                  </div>

                  {/* Discount */}
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600 mt-2">
                      <span>Indirim ({form.coupon_code})</span>
                      <span>-{discountAmount.toLocaleString("tr-TR")} TL</span>
                    </div>
                  )}

                  {/* Coupon */}
                  <div className="mt-4">
                    {couponResult ? (
                      <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                        <div>
                          <span className="text-sm font-bold text-emerald-700">{form.coupon_code}</span>
                          <span className="text-xs text-emerald-600 ml-2">
                            {couponResult.discount_type === "percentage"
                              ? `%${couponResult.discount_value} indirim`
                              : `${couponResult.discount_value} TL indirim`}
                          </span>
                        </div>
                        <button type="button" onClick={handleRemoveCoupon} className="text-xs text-red-500 hover:text-red-700">Kaldir</button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          value={form.coupon_code}
                          onChange={(e) => setForm((f) => ({ ...f, coupon_code: e.target.value.toUpperCase() }))}
                          placeholder="Kupon kodu..."
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={couponLoading || !form.coupon_code.trim()}
                          className="px-4 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-900 disabled:opacity-50"
                        >
                          {couponLoading ? "..." : "Uygula"}
                        </button>
                      </div>
                    )}
                    {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-4 py-3 bg-indigo-500 text-white rounded-xl font-medium hover:bg-indigo-600 transition-colors disabled:opacity-50"
                  >
                    {loading ? "Isleniyor..." : "Siparisi Onayla"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, type = "text", required = false }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700 mb-1 block">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-200"
      />
    </label>
  );
}
