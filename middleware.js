import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Middleware runs on Edge — create a lightweight client
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// Domains that belong to the platform itself (not a store)
const PLATFORM_PATHS = ["/admin", "/api", "/_next", "/favicon.ico"];

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  // Skip platform paths — always serve normally
  if (PLATFORM_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Skip localhost / Vercel preview domains — use default slug-based routing
  const isLocalhost = hostname.includes("localhost") || hostname.includes("127.0.0.1");
  const isVercel = hostname.includes(".vercel.app");
  if (isLocalhost || isVercel) {
    return NextResponse.next();
  }

  // Custom domain detected — look up which store it belongs to
  // Strip port if present
  const domain = hostname.split(":")[0];

  try {
    const supabase = getSupabase();
    const { data: store } = await supabase
      .from("stores")
      .select("slug")
      .eq("custom_domain", domain)
      .eq("is_active", true)
      .single();

    if (store) {
      // Rewrite: kurtderelimobilya.com/ → /kurtdereli-mobilya
      // Rewrite: kurtderelimobilya.com/urun/x → /kurtdereli-mobilya/urun/x
      const url = request.nextUrl.clone();
      url.pathname = `/${store.slug}${pathname}`;
      return NextResponse.rewrite(url);
    }
  } catch {
    // Domain not found — fall through to default routing
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
