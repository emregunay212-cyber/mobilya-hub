"use client";

import { useState, createContext, useContext, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

/* ── Auth context ────────────────────────────────────── */
interface AuthCtx {
  token: string;
  user: { email: string; role: string; full_name?: string };
  logout: () => void;
}

export const AuthContext = createContext<AuthCtx | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AdminShell");
  return ctx;
}

/* ── Sidebar nav items ───────────────────────────────── */
const NAV = [
  { href: "/admin", label: "Dashboard", icon: DashboardIcon },
  { href: "/admin/stores", label: "Magazalar", icon: StoreIcon },
  { href: "/admin/products", label: "Urunler", icon: ProductIcon },
  { href: "/admin/categories", label: "Kategoriler", icon: CategoryIcon },
  { href: "/admin/orders", label: "Siparisler", icon: OrderIcon },
  { href: "/admin/coupons", label: "Kuponlar", icon: CouponIcon },
  { href: "/admin/customers", label: "Musteriler", icon: CustomerIcon },
  { href: "/admin/analytics", label: "Analitik", icon: AnalyticsIcon },
  { href: "/admin/stores/new", label: "Yeni Magaza", icon: PlusIcon },
];

/* ── Component ───────────────────────────────────────── */
export default function AdminShell({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ email: string; role: string; full_name?: string } | null>(null);

  if (!token || !user) {
    return <LoginScreen onLogin={(t, u) => { setToken(t); setUser(u); }} />;
  }

  const logout = () => { setToken(null); setUser(null); };

  return (
    <AuthContext.Provider value={{ token, user, logout }}>
      <div className="flex h-screen" style={{ background: "#0F1117", color: "#E5E7EB" }}>
        {/* Sidebar */}
        <Sidebar user={user} onLogout={logout} />

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Topbar */}
          <header
            className="h-14 flex items-center justify-between px-6 border-b"
            style={{ background: "#1A1D27", borderColor: "#2A2D37" }}
          >
            <h1 className="text-sm font-semibold" style={{ color: "#9CA3AF" }}>
              Mobilya Hub Admin
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-xs" style={{ color: "#9CA3AF" }}>
                {user.email}
              </span>
              <button
                onClick={logout}
                className="text-xs px-3 py-1 rounded"
                style={{ background: "#2A2D37", color: "#EF4444" }}
              >
                Cikis
              </button>
            </div>
          </header>

          {/* Page */}
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </AuthContext.Provider>
  );
}

/* ── Sidebar ─────────────────────────────────────────── */
function Sidebar({
  user,
  onLogout,
}: {
  user: { email: string; role: string; full_name?: string };
  onLogout: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      className="w-60 flex flex-col border-r"
      style={{ background: "#1A1D27", borderColor: "#2A2D37" }}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b" style={{ borderColor: "#2A2D37" }}>
        <span className="text-lg font-bold" style={{ color: "#6366F1" }}>
          MobilyaHub
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-3">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors"
              style={{
                background: active ? "#6366F1" : "transparent",
                color: active ? "#fff" : "#9CA3AF",
              }}
            >
              <item.icon />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User info at bottom */}
      <div className="p-4 border-t" style={{ borderColor: "#2A2D37" }}>
        <p className="text-xs truncate" style={{ color: "#9CA3AF" }}>
          {user.full_name || user.email}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "#6366F1" }}>
          {user.role}
        </p>
      </div>
    </aside>
  );
}

/* ── Login Screen ────────────────────────────────────── */
function LoginScreen({
  onLogin,
}: {
  onLogin: (token: string, user: { email: string; role: string; full_name?: string }) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Giris basarisiz");
        return;
      }
      onLogin(data.token, data.user);
    } catch {
      setError("Baglanti hatasi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "#0F1117" }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm p-8 rounded-xl border"
        style={{ background: "#1A1D27", borderColor: "#2A2D37" }}
      >
        <h2 className="text-xl font-bold mb-6 text-center" style={{ color: "#6366F1" }}>
          Admin Giris
        </h2>

        {error && (
          <div
            className="mb-4 p-3 rounded text-sm text-center"
            style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444" }}
          >
            {error}
          </div>
        )}

        <label className="block mb-4">
          <span className="text-xs mb-1 block" style={{ color: "#9CA3AF" }}>
            Email
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2"
            style={{
              background: "#0F1117",
              borderColor: "#2A2D37",
              color: "#E5E7EB",
              // @ts-expect-error ring color
              "--tw-ring-color": "#6366F1",
            }}
          />
        </label>

        <label className="block mb-6">
          <span className="text-xs mb-1 block" style={{ color: "#9CA3AF" }}>
            Sifre
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2"
            style={{
              background: "#0F1117",
              borderColor: "#2A2D37",
              color: "#E5E7EB",
            }}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg font-medium text-sm text-white transition-opacity disabled:opacity-50"
          style={{ background: "#6366F1" }}
        >
          {loading ? "Giris yapiliyor..." : "Giris Yap"}
        </button>
      </form>
    </div>
  );
}

/* ── Icons ───────────────────────────────────────────── */
function DashboardIcon() {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}

function StoreIcon() {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function ProductIcon() {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  );
}

function OrderIcon() {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
    </svg>
  );
}

function CategoryIcon() {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
    </svg>
  );
}

function CouponIcon() {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
    </svg>
  );
}

function CustomerIcon() {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function AnalyticsIcon() {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  );
}
