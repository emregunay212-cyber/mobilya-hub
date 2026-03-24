/**
 * Deploy orchestrator.
 * Coordinates code generation, GitHub push, and Vercel deployment.
 */

import { getAdminClient } from "@/lib/supabase";
import { getSectorById } from "@/lib/sectors";
import { getThemeById } from "@/lib/themes";
import { generateStoreProject } from "./generator";
import * as github from "./github";
import * as vercel from "./vercel";
import type { Deployment } from "@/lib/types/database";

async function updateDeploymentStatus(
  deploymentId: string,
  status: Deployment["status"],
  extra: Partial<Deployment> = {}
) {
  const supabase = getAdminClient();
  await supabase
    .from("deployments")
    .update({ status, updated_at: new Date().toISOString(), ...extra })
    .eq("id", deploymentId);
}

/**
 * Full deployment pipeline for a store.
 */
export async function deployStore(storeId: string): Promise<{ deploymentId: string }> {
  const supabase = getAdminClient();

  // 1. Load store data
  const { data: store } = await supabase
    .from("stores")
    .select("*")
    .eq("id", storeId)
    .single();

  if (!store) throw new Error("Mağaza bulunamadı");

  // 2. Create deployment record
  const { data: deployment } = await supabase
    .from("deployments")
    .insert({
      store_id: storeId,
      status: "pending",
    })
    .select()
    .single();

  if (!deployment) throw new Error("Deployment kaydı oluşturulamadı");

  // Run the rest asynchronously
  runDeploymentPipeline(deployment.id, store).catch(async (err) => {
    await updateDeploymentStatus(deployment.id, "failed", {
      error_message: err instanceof Error ? err.message : "Bilinmeyen hata",
    });
  });

  return { deploymentId: deployment.id };
}

async function runDeploymentPipeline(deploymentId: string, store: Record<string, unknown>) {
  const supabase = getAdminClient();
  const storeId = store.id as string;

  try {
    // Load sector
    const sectorId = (store.settings as Record<string, unknown>)?.sector as string ||
                     store.sector_id as string || "mobilyaci";
    const sector = getSectorById(sectorId);
    if (!sector) throw new Error(`Sektör bulunamadı: ${sectorId}`);

    // Load theme
    const themeId = (store.settings as Record<string, unknown>)?.theme as string || sector.defaultTheme;
    const theme = getThemeById(themeId);

    // Load categories
    const { data: categories } = await supabase
      .from("categories")
      .select("name, slug")
      .eq("store_id", storeId)
      .order("sort_order");

    // Load payment config
    const { data: paymentConfig } = await supabase
      .from("payment_configs")
      .select("*")
      .eq("store_id", storeId)
      .single();

    // 2. Generate code
    await updateDeploymentStatus(deploymentId, "generating");

    const files = generateStoreProject({
      store: store as any,
      sector,
      theme,
      paymentConfig,
      categories: categories || [],
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    });

    // 3. Create/push to GitHub
    await updateDeploymentStatus(deploymentId, "pushing");

    const repoName = `store-${store.slug}`;
    const exists = await github.repoExists(repoName);

    let repoFullName: string;
    let repoUrl: string;

    if (!exists) {
      const repo = await github.createRepo(repoName, `${store.name} - ${sector.name} web sitesi`);
      repoFullName = repo.fullName;
      repoUrl = repo.url;
      // Wait a moment for GitHub to initialize the repo
      await new Promise((r) => setTimeout(r, 2000));
    } else {
      const owner = process.env.GITHUB_OWNER || "";
      repoFullName = `${owner}/${repoName}`;
      repoUrl = `https://github.com/${repoFullName}`;
    }

    await github.pushFiles(repoName, files, `Deploy: ${store.name} (${new Date().toISOString()})`);

    await updateDeploymentStatus(deploymentId, "deploying", {
      github_repo_url: repoUrl,
      github_repo_name: repoName,
    });

    // 4. Create Vercel project & deploy
    let vercelProjectId: string;
    let vercelUrl: string;

    try {
      const project = await vercel.createProject(repoName, repoFullName);
      vercelProjectId = project.projectId;
      vercelUrl = project.url;
    } catch {
      // Project may already exist, try to deploy directly
      vercelProjectId = repoName;
      vercelUrl = `https://${repoName}.vercel.app`;
    }

    // 5. Set env vars
    const envVars: Record<string, string> = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      STORE_ID: storeId,
      STORE_SLUG: store.slug as string,
    };

    if (paymentConfig && paymentConfig.provider !== "none") {
      envVars.PAYMENT_PROVIDER = paymentConfig.provider;
      if (paymentConfig.provider === "iyzico") {
        envVars.IYZICO_API_KEY = paymentConfig.config?.api_key || "";
        envVars.IYZICO_SECRET_KEY = paymentConfig.config?.secret_key || "";
      }
      if (paymentConfig.provider === "stripe") {
        envVars.STRIPE_SECRET_KEY = paymentConfig.config?.secret_key || "";
        envVars.STRIPE_PUBLISHABLE_KEY = paymentConfig.config?.publishable_key || "";
        envVars.STRIPE_WEBHOOK_SECRET = paymentConfig.config?.webhook_secret || "";
      }
    }

    await vercel.setEnvVars(vercelProjectId, envVars);

    // 6. Trigger deploy
    const deploy = await vercel.triggerDeploy(repoName, repoFullName);

    // 7. Update deployment record
    await updateDeploymentStatus(deploymentId, "active", {
      vercel_project_id: vercelProjectId,
      vercel_project_url: deploy.url || vercelUrl,
      last_deployed_at: new Date().toISOString(),
    });

    // Update store with deployment reference
    await supabase
      .from("stores")
      .update({ deployment_id: deploymentId })
      .eq("id", storeId);

  } catch (err) {
    await updateDeploymentStatus(deploymentId, "failed", {
      error_message: err instanceof Error ? err.message : "Deployment hatası",
    });
    throw err;
  }
}
