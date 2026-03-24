import { NextResponse } from "next/server";
import { requireAdmin, authError } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";
import { addDomain, getDomainConfig, removeDomain } from "@/lib/deploy/vercel";

/**
 * POST - Add a custom domain to a store's Vercel project
 */
export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (auth) return authError(auth);

  try {
    const { store_id, domain } = await request.json();

    if (!store_id || !domain) {
      return NextResponse.json({ error: "store_id ve domain gerekli" }, { status: 400 });
    }

    // Clean domain
    const cleanDomain = domain
      .toLowerCase()
      .trim()
      .replace(/^https?:\/\//, "")
      .replace(/\/+$/, "");

    const supabase = getAdminClient();

    // Get store and its deployment
    const { data: store } = await supabase
      .from("stores")
      .select("*, deployments(*)")
      .eq("id", store_id)
      .single();

    if (!store) {
      return NextResponse.json({ error: "Mağaza bulunamadı" }, { status: 404 });
    }

    // Find active deployment
    const { data: deployment } = await supabase
      .from("deployments")
      .select("*")
      .eq("store_id", store_id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!deployment?.vercel_project_id) {
      return NextResponse.json(
        { error: "Bu mağazanın aktif bir deploy'u yok. Önce deploy edin." },
        { status: 400 }
      );
    }

    // Add domain to Vercel
    const result = await addDomain(deployment.vercel_project_id, cleanDomain);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Also add www subdomain
    await addDomain(deployment.vercel_project_id, `www.${cleanDomain}`);

    // Update store custom_domain
    await supabase
      .from("stores")
      .update({ custom_domain: cleanDomain })
      .eq("id", store_id);

    // Update deployment
    await supabase
      .from("deployments")
      .update({ custom_domain: cleanDomain })
      .eq("id", deployment.id);

    return NextResponse.json({
      success: true,
      domain: cleanDomain,
      dns_instructions: {
        records: [
          { type: "A", name: "@", value: "76.76.21.21" },
          { type: "CNAME", name: "www", value: "cname.vercel-dns.com" },
        ],
        message: "Domain sağlayıcınızda (GoDaddy, Namecheap vb.) yukarıdaki DNS kayıtlarını ekleyin. DNS yayılması 24 saate kadar sürebilir.",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Sunucu hatası" },
      { status: 500 }
    );
  }
}

/**
 * GET - Check domain verification status
 */
export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (auth) return authError(auth);

  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get("store_id");

  if (!storeId) {
    return NextResponse.json({ error: "store_id gerekli" }, { status: 400 });
  }

  const supabase = getAdminClient();

  const { data: store } = await supabase
    .from("stores")
    .select("custom_domain")
    .eq("id", storeId)
    .single();

  if (!store?.custom_domain) {
    return NextResponse.json({ domain: null, status: "none" });
  }

  const { data: deployment } = await supabase
    .from("deployments")
    .select("vercel_project_id")
    .eq("store_id", storeId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!deployment?.vercel_project_id) {
    return NextResponse.json({ domain: store.custom_domain, status: "no_deployment" });
  }

  const config = await getDomainConfig(deployment.vercel_project_id, store.custom_domain);

  return NextResponse.json({
    domain: store.custom_domain,
    status: config.verified ? "active" : config.configured ? "pending" : "dns_required",
    verified: config.verified,
    configured: config.configured,
    txtVerification: config.txtVerification,
    dns_instructions: {
      records: [
        { type: "A", name: "@", value: "76.76.21.21" },
        { type: "CNAME", name: "www", value: "cname.vercel-dns.com" },
      ],
    },
  });
}

/**
 * DELETE - Remove custom domain from store
 */
export async function DELETE(request: Request) {
  const auth = await requireAdmin(request);
  if (auth) return authError(auth);

  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get("store_id");

  if (!storeId) {
    return NextResponse.json({ error: "store_id gerekli" }, { status: 400 });
  }

  const supabase = getAdminClient();

  const { data: store } = await supabase
    .from("stores")
    .select("custom_domain")
    .eq("id", storeId)
    .single();

  if (!store?.custom_domain) {
    return NextResponse.json({ success: true });
  }

  const { data: deployment } = await supabase
    .from("deployments")
    .select("vercel_project_id")
    .eq("store_id", storeId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (deployment?.vercel_project_id) {
    await removeDomain(deployment.vercel_project_id, store.custom_domain);
    await removeDomain(deployment.vercel_project_id, `www.${store.custom_domain}`);
  }

  await supabase.from("stores").update({ custom_domain: null }).eq("id", storeId);
  await supabase.from("deployments").update({ custom_domain: null }).eq("store_id", storeId);

  return NextResponse.json({ success: true });
}
