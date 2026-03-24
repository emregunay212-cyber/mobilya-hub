"use client";

import { useState } from "react";

export default function NewsletterForm({ storeId }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(""); // success, error
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setStatus("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ store_id: storeId, email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMsg(data.message || "Basariyla abone oldunuz!");
        setEmail("");
      } else {
        setStatus("error");
        setMsg(data.error || "Bir hata olustu");
      }
    } catch {
      setStatus("error");
      setMsg("Baglanti hatasi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h4 className="font-bold text-sm uppercase tracking-wider mb-3 text-white/80">Bulten</h4>
      <p className="text-sm text-white/60 mb-3">Kampanya ve yeniliklerden haberdar olun.</p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-posta adresiniz"
          required
          className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-sm text-white placeholder-white/40 outline-none focus:border-white/40"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-sm font-medium text-white transition-colors disabled:opacity-50"
        >
          {loading ? "..." : "Abone Ol"}
        </button>
      </form>
      {msg && (
        <p className={`text-xs mt-2 ${status === "success" ? "text-emerald-300" : "text-red-300"}`}>
          {msg}
        </p>
      )}
    </div>
  );
}
