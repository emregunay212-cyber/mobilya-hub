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
