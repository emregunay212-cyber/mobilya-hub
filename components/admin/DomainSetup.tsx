"use client";
import { useState, useEffect, useCallback } from "react";

const S = {
  bg: "#0F1117", card: "#1A1D27", bdr: "#2A2D37",
  pri: "#6366F1", grn: "#10B981", red: "#EF4444",
  org: "#F59E0B", txt: "#E5E7EB", mut: "#9CA3AF",
};

interface DomainSetupProps {
  storeId: string;
  token: string;
}

interface DnsRecord {
  type: string;
  name: string;
  value: string;
}

interface DomainStatus {
  domain: string | null;
  status: "none" | "pending" | "active" | "dns_required" | "no_deployment";
  verified?: boolean;
  configured?: boolean;
  dns_instructions?: { records: DnsRecord[] };
}

export default function DomainSetup({ storeId, token }: DomainSetupProps) {
  const [domainInput, setDomainInput] = useState("");
  const [domainStatus, setDomainStatus] = useState<DomainStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/domain?store_id=${storeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDomainStatus(data);
      if (data.domain) setDomainInput(data.domain);
    } catch {}
  }, [storeId, token]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const handleAddDomain = async () => {
    if (!domainInput.trim()) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/admin/domain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ store_id: storeId, domain: domainInput.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Domain eklenemedi");
      } else {
        setSuccess("Domain başarıyla eklendi! DNS ayarlarını yapın.");
        await fetchStatus();
      }
    } catch {
      setError("Bağlantı hatası");
    }
    setLoading(false);
  };

  const handleRemoveDomain = async () => {
    if (!confirm("Domain'i kaldırmak istediğinize emin misiniz?")) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/domain?store_id=${storeId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setDomainInput("");
        setDomainStatus(null);
        setSuccess("Domain kaldırıldı");
      }
    } catch {
      setError("Domain kaldırılamadı");
    }
    setLoading(false);
  };

  const statusBadge = () => {
    if (!domainStatus?.domain) return null;
    const badges: Record<string, { color: string; text: string }> = {
      active: { color: S.grn, text: "✓ Aktif" },
      pending: { color: S.org, text: "⏳ DNS Bekleniyor" },
      dns_required: { color: S.org, text: "⚠ DNS Ayarı Gerekli" },
      no_deployment: { color: S.red, text: "✗ Deploy Yok" },
    };
    const b = badges[domainStatus.status] || badges.dns_required;
    return (
      <span style={{ color: b.color, fontSize: 13, fontWeight: 600 }}>{b.text}</span>
    );
  };

  const dnsRecords = domainStatus?.dns_instructions?.records || [
    { type: "A", name: "@", value: "76.76.21.21" },
    { type: "CNAME", name: "www", value: "cname.vercel-dns.com" },
  ];

  return (
    <div style={{ background: S.card, borderRadius: 12, border: `1px solid ${S.bdr}`, padding: 20, marginTop: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ color: "#fff", fontSize: 16, fontWeight: 700, margin: 0 }}>
          🌐 Custom Domain
        </h3>
        {statusBadge()}
      </div>

      {/* Domain Input */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          type="text"
          placeholder="ornek.com"
          value={domainInput}
          onChange={(e) => setDomainInput(e.target.value)}
          disabled={loading}
          style={{
            flex: 1, padding: "10px 14px", borderRadius: 8,
            background: S.bg, border: `1px solid ${S.bdr}`,
            color: S.txt, fontSize: 14, outline: "none",
          }}
        />
        {domainStatus?.domain ? (
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => fetchStatus()}
              disabled={loading}
              style={{
                padding: "10px 16px", borderRadius: 8, border: `1px solid ${S.bdr}`,
                background: S.bg, color: S.txt, fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}
            >
              🔄 Kontrol
            </button>
            <button
              onClick={handleRemoveDomain}
              disabled={loading}
              style={{
                padding: "10px 16px", borderRadius: 8, border: "none",
                background: S.red, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}
            >
              Kaldır
            </button>
          </div>
        ) : (
          <button
            onClick={handleAddDomain}
            disabled={loading || !domainInput.trim()}
            style={{
              padding: "10px 20px", borderRadius: 8, border: "none",
              background: S.pri, color: "#fff", fontSize: 13, fontWeight: 600,
              cursor: loading ? "wait" : "pointer", opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Ekleniyor..." : "Domain Ekle"}
          </button>
        )}
      </div>

      {error && <p style={{ color: S.red, fontSize: 13, margin: "8px 0" }}>{error}</p>}
      {success && <p style={{ color: S.grn, fontSize: 13, margin: "8px 0" }}>{success}</p>}

      {/* DNS Instructions - shown when domain is set */}
      {domainStatus?.domain && (
        <div style={{ marginTop: 16, background: S.bg, borderRadius: 8, padding: 16, border: `1px solid ${S.bdr}` }}>
          <p style={{ color: S.txt, fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
            📋 DNS Ayarları (domain sağlayıcınızda yapın)
          </p>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${S.bdr}` }}>
                <th style={{ textAlign: "left", padding: "6px 8px", color: S.mut }}>Tip</th>
                <th style={{ textAlign: "left", padding: "6px 8px", color: S.mut }}>Ad</th>
                <th style={{ textAlign: "left", padding: "6px 8px", color: S.mut }}>Değer</th>
              </tr>
            </thead>
            <tbody>
              {dnsRecords.map((rec, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${S.bdr}` }}>
                  <td style={{ padding: "8px", color: S.org, fontWeight: 600 }}>{rec.type}</td>
                  <td style={{ padding: "8px", color: S.txt, fontFamily: "monospace" }}>{rec.name}</td>
                  <td style={{ padding: "8px", color: S.grn, fontFamily: "monospace" }}>{rec.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ color: S.mut, fontSize: 12, marginTop: 12 }}>
            💡 DNS yayılması 24 saate kadar sürebilir. SSL sertifikası Vercel tarafından otomatik sağlanır.
          </p>
        </div>
      )}
    </div>
  );
}
