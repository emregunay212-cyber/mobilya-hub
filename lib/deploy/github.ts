/**
 * GitHub API integration for creating repos and pushing generated code.
 */

const GITHUB_API = "https://api.github.com";

function getHeaders(): Record<string, string> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN env var is required");
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };
}

function getOwner(): string {
  return process.env.GITHUB_OWNER || "";
}

export interface GeneratedFile {
  path: string;
  content: string;
}

/**
 * Create a new GitHub repository.
 */
export async function createRepo(name: string, description?: string): Promise<{ url: string; fullName: string }> {
  const res = await fetch(`${GITHUB_API}/user/repos`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      name,
      description: description || `Generated store site`,
      private: false,
      auto_init: true,
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(`GitHub repo oluşturulamadı: ${error.message || res.statusText}`);
  }

  const data = await res.json();
  return { url: data.html_url, fullName: data.full_name };
}

/**
 * Push files to a GitHub repository using the Git Trees API.
 * This creates a single commit with all files.
 */
export async function pushFiles(repoName: string, files: GeneratedFile[], commitMessage?: string): Promise<string> {
  const owner = getOwner();
  const headers = getHeaders();
  const repo = `${owner}/${repoName}`;

  // 1. Get the latest commit SHA on main
  const refRes = await fetch(`${GITHUB_API}/repos/${repo}/git/ref/heads/main`, { headers });
  if (!refRes.ok) {
    throw new Error(`Repo ref alınamadı: ${refRes.statusText}`);
  }
  const refData = await refRes.json();
  const latestCommitSha = refData.object.sha;

  // 2. Get the tree SHA of the latest commit
  const commitRes = await fetch(`${GITHUB_API}/repos/${repo}/git/commits/${latestCommitSha}`, { headers });
  const commitData = await commitRes.json();
  const baseTreeSha = commitData.tree.sha;

  // 3. Create blobs for each file
  const treeItems = [];
  for (const file of files) {
    const blobRes = await fetch(`${GITHUB_API}/repos/${repo}/git/blobs`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        content: file.content,
        encoding: "utf-8",
      }),
    });

    if (!blobRes.ok) {
      throw new Error(`Blob oluşturulamadı: ${file.path}`);
    }

    const blobData = await blobRes.json();
    treeItems.push({
      path: file.path,
      mode: "100644",
      type: "blob",
      sha: blobData.sha,
    });
  }

  // 4. Create a new tree
  const treeRes = await fetch(`${GITHUB_API}/repos/${repo}/git/trees`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      base_tree: baseTreeSha,
      tree: treeItems,
    }),
  });

  if (!treeRes.ok) {
    throw new Error("Git tree oluşturulamadı");
  }

  const treeData = await treeRes.json();

  // 5. Create a new commit
  const newCommitRes = await fetch(`${GITHUB_API}/repos/${repo}/git/commits`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      message: commitMessage || "Auto-generated store site",
      tree: treeData.sha,
      parents: [latestCommitSha],
    }),
  });

  if (!newCommitRes.ok) {
    throw new Error("Commit oluşturulamadı");
  }

  const newCommitData = await newCommitRes.json();

  // 6. Update the main branch reference
  const updateRefRes = await fetch(`${GITHUB_API}/repos/${repo}/git/refs/heads/main`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ sha: newCommitData.sha }),
  });

  if (!updateRefRes.ok) {
    throw new Error("Branch güncellenemedi");
  }

  return newCommitData.sha;
}

/**
 * Check if a repo exists.
 */
export async function repoExists(name: string): Promise<boolean> {
  const owner = getOwner();
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${name}`, {
    headers: getHeaders(),
  });
  return res.ok;
}
