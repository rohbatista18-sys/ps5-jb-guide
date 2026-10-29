// `npm run verify:repos`: snapshots every repo in content/repos.json from the GitHub API
// (spec FR-021/FR-024) and writes content/repos.snapshot.json plus verify-report.md.
// The build never touches the network; it only reads the snapshot (FR-022).
// Token: GITHUB_TOKEN / GH_TOKEN, else `gh auth token`, else unauthenticated (60 req/h).

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const REPOS_PATH = join(ROOT, "content", "repos.json");
const SNAPSHOT_PATH = join(ROOT, "content", "repos.snapshot.json");
const REPORT_PATH = join(ROOT, "verify-report.md");

const DAY = 86_400_000;
const MIN_REPO_AGE_DAYS = 30;
const MIN_OWNER_AGE_DAYS = 90;
const MIN_STARS = 5;
const WINDOWS_BINARY = /\.(exe|msi|scr|bat|cmd|ps1)$/i;
const SCAM_PHRASES = [/free games/i, /download games/i, /donat\w* to unlock/i, /pay to unlock/i];
const UNLOCK_INVITE = /(discord\.gg|discord\.com\/invite|t\.me\/).*(unlock|liberar|desbloquear)|(unlock|liberar|desbloquear).*(discord\.gg|discord\.com\/invite|t\.me\/)/i;

function token() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN;
  try {
    return execSync("gh auth token", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return null;
  }
}

const TOKEN = token();

async function gh(path, raw = false) {
  const res = await fetch(`https://api.github.com/${path}`, {
    headers: {
      Accept: raw ? "application/vnd.github.raw" : "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "ps5-jb-guide-verify",
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
    },
  });
  if (res.status === 404) return { status: 404, data: null };
  if (!res.ok) throw new Error(`GET ${path} → ${res.status} ${await res.text()}`);
  return { status: res.status, data: raw ? await res.text() : await res.json() };
}

const repos = JSON.parse(readFileSync(REPOS_PATH, "utf8")).repos;
const ids = new Set(repos.map((r) => r.id.toLowerCase()));
const now = Date.now();
const ageDays = (iso) => Math.floor((now - new Date(iso).getTime()) / DAY);

const snapshots = {};
const errors = [];
const rows = [];
const ownerCreated = new Map();

console.log(`verify-repos: ${repos.length} repositories (${TOKEN ? "authenticated" : "unauthenticated, 60 req/h"})\n`);

for (const entry of repos) {
  const { id } = entry;
  const repo = await gh(`repos/${id}`);
  if (repo.status === 404) {
    errors.push(`${id}: 404 (deleted, private or never existed)`);
    rows.push({ id, status: entry.status, flags: ["NOT FOUND"] });
    continue;
  }
  const data = repo.data;
  if (data.full_name !== id) {
    // GitHub redirects renamed/transferred repos; a different owner is a common scam pattern.
    errors.push(`${id}: API returned "${data.full_name}" (renamed or transferred)`);
  }
  if (data.archived && entry.archived !== true) {
    errors.push(`${id}: archived on GitHub but not marked "archived": true in repos.json`);
  }

  const flags = [];
  if (ageDays(data.created_at) < MIN_REPO_AGE_DAYS) flags.push("new-repo");
  if (data.stargazers_count < MIN_STARS) flags.push("few-stars");
  if (data.fork && data.parent && ids.has(data.parent.full_name.toLowerCase())) flags.push("fork-of-listed");
  else if (data.fork) flags.push("fork");
  const sameName = repos.find(
    (r) => r.id !== id && r.id.split("/")[1].toLowerCase() === data.name.toLowerCase(),
  );
  if (sameName) flags.push(`same-name-as:${sameName.id}`);

  const owner = data.owner.login;
  if (!ownerCreated.has(owner)) ownerCreated.set(owner, (await gh(`users/${owner}`)).data?.created_at ?? null);
  const ownerSince = ownerCreated.get(owner);
  if (ownerSince && ageDays(ownerSince) < MIN_OWNER_AGE_DAYS) flags.push("new-account");

  const releases = (await gh(`repos/${id}/releases?per_page=3`)).data ?? [];
  if (releases.some((r) => r.assets?.some((a) => WINDOWS_BINARY.test(a.name)))) flags.push("windows-binary");

  const readme = (await gh(`repos/${id}/readme`, true)).data ?? "";
  if (SCAM_PHRASES.some((p) => p.test(readme))) flags.push("readme-scam-phrase");
  if (readme.split("\n").some((line) => UNLOCK_INVITE.test(line))) flags.push("readme-unlock-invite");

  const latest = releases[0];
  snapshots[id] = {
    full_name: data.full_name,
    html_url: data.html_url,
    archived: data.archived,
    fork: data.fork,
    created_at: data.created_at,
    pushed_at: data.pushed_at,
    stargazers_count: data.stargazers_count,
    license: data.license?.spdx_id ?? null,
    latestRelease: latest ? { tag: latest.tag_name, published_at: latest.published_at } : null,
    flags,
  };
  rows.push({ id, status: entry.status, flags, stars: data.stargazers_count, pushed: data.pushed_at.slice(0, 10) });
  console.log(`  ${id.padEnd(48)} ${flags.length ? flags.join(", ") : "ok"}`);
}

// A same-name pair is suspicious only on the younger side; the original keeps a clean record.
for (const [id, snap] of Object.entries(snapshots)) {
  snap.flags = snap.flags.filter((f) => {
    if (!f.startsWith("same-name-as:")) return true;
    const other = snapshots[f.slice("same-name-as:".length)];
    return !other || new Date(snap.created_at) > new Date(other.created_at);
  });
  rows.find((r) => r.id === id).flags = snap.flags;
}

const checkedAt = new Date(now).toISOString();
writeFileSync(SNAPSHOT_PATH, JSON.stringify({ checkedAt, repos: snapshots }, null, 2) + "\n");

const listedWithFlags = rows.filter((r) => r.status === "listed" && r.flags.length);
const report = [
  `# verify-repos — ${checkedAt.slice(0, 10)}`,
  "",
  `${repos.length} repos, ${errors.length} error(s), ${listedWithFlags.length} listed repo(s) with flags.`,
  "Flags never change `status` on their own: a person decides (spec FR-024).",
  "",
  ...(errors.length ? ["## Errors", "", ...errors.map((e) => `- ${e}`), ""] : []),
  "## Repos",
  "",
  "| Repo | Status | Stars | Last push | Flags |",
  "| --- | --- | --- | --- | --- |",
  ...rows.map((r) => `| ${r.id} | ${r.status} | ${r.stars ?? "—"} | ${r.pushed ?? "—"} | ${r.flags.join(", ") || "—"} |`),
  "",
].join("\n");
writeFileSync(REPORT_PATH, report);

console.log(`\nWrote content/repos.snapshot.json and verify-report.md.`);
if (errors.length) {
  console.error(`\n${errors.length} error(s):\n${errors.map((e) => `  ${e}`).join("\n")}`);
  process.exit(1);
}
