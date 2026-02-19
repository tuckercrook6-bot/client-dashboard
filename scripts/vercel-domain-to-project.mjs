/**
 * Move app.lowcoresystems.com to client-dashboard-main.
 * Requires: VERCEL_TOKEN (from https://vercel.com/account/tokens)
 * Run: node scripts/vercel-domain-to-project.mjs
 */
const VERCEL_API = "https://api.vercel.com";
const TEAM_ID = "team_yt1PFbutbqtUhjghflBnoVkj";
const TARGET_PROJECT = "client-dashboard-main";
const DOMAIN = "app.lowcoresystems.com";

const token = process.env.VERCEL_TOKEN;
if (!token) {
  console.error("Set VERCEL_TOKEN (from https://vercel.com/account/tokens)");
  process.exit(1);
}

const headers = { Authorization: `Bearer ${token}` };

async function listProjects() {
  const r = await fetch(`${VERCEL_API}/v9/projects?teamId=${TEAM_ID}`, { headers });
  if (!r.ok) throw new Error(`Projects: ${r.status} ${await r.text()}`);
  return r.json();
}

async function listProjectDomains(projectId) {
  const r = await fetch(`${VERCEL_API}/v9/projects/${projectId}/domains?teamId=${TEAM_ID}`, { headers });
  if (!r.ok) throw new Error(`Domains: ${r.status} ${await r.text()}`);
  return r.json();
}

async function removeDomain(projectId, domain) {
  const r = await fetch(
    `${VERCEL_API}/v9/projects/${projectId}/domains/${domain}?teamId=${TEAM_ID}`,
    { method: "DELETE", headers }
  );
  if (!r.ok && r.status !== 404) throw new Error(`Remove: ${r.status} ${await r.text()}`);
}

async function addDomain(projectId, domain) {
  const r = await fetch(`${VERCEL_API}/v9/projects/${projectId}/domains?teamId=${TEAM_ID}`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ name: domain }),
  });
  if (!r.ok) throw new Error(`Add: ${r.status} ${await r.text()}`);
}

async function main() {
  const { projects } = await listProjects();
  let projectWithDomain = null;
  let targetProjectId = null;

  for (const p of projects) {
    if (p.name === TARGET_PROJECT) targetProjectId = p.id;
    const raw = await listProjectDomains(p.id);
    const list = Array.isArray(raw) ? raw : (raw.domains || []);
    const names = list.map((d) => (typeof d === "string" ? d : d.name || d.redirect || ""));
    if (names.includes(DOMAIN)) projectWithDomain = p;
  }

  if (!targetProjectId) {
    console.error("Target project", TARGET_PROJECT, "not found");
    process.exit(1);
  }

  if (projectWithDomain) {
    console.log("Removing", DOMAIN, "from project", projectWithDomain.name);
    await removeDomain(projectWithDomain.id, DOMAIN);
  }

  console.log("Adding", DOMAIN, "to", TARGET_PROJECT);
  await addDomain(targetProjectId, DOMAIN);
  console.log("Done. App will be at https://" + DOMAIN);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
