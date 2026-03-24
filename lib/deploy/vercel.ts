/**
 * Vercel API integration for creating projects and triggering deployments.
 */

const VERCEL_API = "https://api.vercel.com";

function getHeaders(): Record<string, string> {
  const token = process.env.VERCEL_TOKEN;
  if (!token) throw new Error("VERCEL_TOKEN env var is required");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

function getTeamId(): string | undefined {
  return process.env.VERCEL_TEAM_ID || undefined;
}

function teamQuery(): string {
  const teamId = getTeamId();
  return teamId ? `?teamId=${teamId}` : "";
}

/**
 * Create a new Vercel project linked to a GitHub repo.
 */
export async function createProject(
  name: string,
  githubRepoFullName: string
): Promise<{ projectId: string; url: string }> {
  const res = await fetch(`${VERCEL_API}/v10/projects${teamQuery()}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      name,
      framework: "nextjs",
      gitRepository: {
        type: "github",
        repo: githubRepoFullName,
      },
      buildCommand: "npm run build",
      outputDirectory: ".next",
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(`Vercel proje oluşturulamadı: ${error.error?.message || res.statusText}`);
  }

  const data = await res.json();
  return {
    projectId: data.id,
    url: `https://${name}.vercel.app`,
  };
}

/**
 * Set environment variables on a Vercel project.
 */
export async function setEnvVars(
  projectId: string,
  vars: Record<string, string>
): Promise<void> {
  const envVars = Object.entries(vars).map(([key, value]) => ({
    key,
    value,
    target: ["production", "preview", "development"],
    type: key.startsWith("NEXT_PUBLIC_") ? "plain" : "encrypted",
  }));

  const res = await fetch(`${VERCEL_API}/v10/projects/${projectId}/env${teamQuery()}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(envVars),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(`Env vars ayarlanamadı: ${error.error?.message || res.statusText}`);
  }
}

/**
 * Trigger a new deployment for a project.
 */
export async function triggerDeploy(
  projectName: string,
  githubRepoFullName: string
): Promise<{ deploymentId: string; url: string }> {
  const [owner, repo] = githubRepoFullName.split("/");

  const res = await fetch(`${VERCEL_API}/v13/deployments${teamQuery()}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      name: projectName,
      project: projectName,
      gitSource: {
        type: "github",
        org: owner,
        repo: repo,
        ref: "main",
      },
      target: "production",
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(`Deploy tetiklenemedi: ${error.error?.message || res.statusText}`);
  }

  const data = await res.json();
  return {
    deploymentId: data.id,
    url: data.url ? `https://${data.url}` : `https://${projectName}.vercel.app`,
  };
}

/**
 * Get the status of a deployment.
 */
export async function getDeploymentStatus(
  deploymentId: string
): Promise<{ status: string; url?: string; error?: string }> {
  const res = await fetch(`${VERCEL_API}/v13/deployments/${deploymentId}${teamQuery()}`, {
    headers: getHeaders(),
  });

  if (!res.ok) {
    return { status: "error", error: "Deploy durumu alınamadı" };
  }

  const data = await res.json();
  return {
    status: data.readyState, // QUEUED, BUILDING, READY, ERROR, CANCELED
    url: data.url ? `https://${data.url}` : undefined,
    error: data.readyState === "ERROR" ? "Deploy başarısız" : undefined,
  };
}

/**
 * Add a custom domain to a Vercel project.
 */
export async function addDomain(
  projectId: string,
  domain: string
): Promise<{ success: boolean; error?: string }> {
  const res = await fetch(`${VERCEL_API}/v10/projects/${projectId}/domains${teamQuery()}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ name: domain }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { success: false, error: data.error?.message || "Domain eklenemedi" };
  }

  return { success: true };
}

/**
 * Get domain configuration and verification status.
 */
export async function getDomainConfig(
  projectId: string,
  domain: string
): Promise<{
  verified: boolean;
  configured: boolean;
  error?: string;
  txtVerification?: { name: string; value: string };
}> {
  const res = await fetch(
    `${VERCEL_API}/v9/projects/${projectId}/domains/${domain}${teamQuery()}`,
    { headers: getHeaders() }
  );

  if (!res.ok) {
    return { verified: false, configured: false, error: "Domain bilgisi alınamadı" };
  }

  const data = await res.json();
  return {
    verified: data.verified === true,
    configured: data.configured === true || data.verified === true,
    txtVerification: data.verification?.[0]
      ? { name: data.verification[0].domain, value: data.verification[0].value }
      : undefined,
  };
}

/**
 * Remove a custom domain from a Vercel project.
 */
export async function removeDomain(projectId: string, domain: string): Promise<boolean> {
  const res = await fetch(
    `${VERCEL_API}/v9/projects/${projectId}/domains/${domain}${teamQuery()}`,
    { method: "DELETE", headers: getHeaders() }
  );
  return res.ok;
}
