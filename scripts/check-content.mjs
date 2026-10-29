// Validates content/ before every build (npm "prebuild"). Fails on anything that would let an
// unsourced claim or an unreviewed repository reach a page (spec FR-011, constitution III/VII).
// No dependencies: plain Node, run as `node scripts/check-content.mjs`.

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const CONTENT = join(ROOT, "content");
const LOCALES = ["en", "es", "pt"];
const VERSION_RE = /^\d{1,2}\.\d{2}$/;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const REPO_ID_RE = /^[A-Za-z0-9-]+\/[A-Za-z0-9._-]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const EVIDENCE_VALUES = ["proven", "reported"];
const RANGE_STATUSES = ["public", "none", "unknown"];
const REPO_CATEGORIES = ["exploit", "hen", "loader", "homebrew", "store", "utility", "backup", "research", "package-manager", "payload", "emulator", "guide"];
const REPO_STATUSES = ["listed", "review", "excluded"];
const SOURCE_KINDS = ["readme", "release", "sony-support", "news", "forum", "video", "archive"];
const GUIDE_MENUS = ["jailbreak", "packages", "apps", "payloads", "transfer", "backup", "emulators"];
const ERROR_SEVERITIES = ["low", "medium", "high"];

const errors = [];
const fail = (where, msg) => errors.push(`[${where}] ${msg}`);

function readJSON(name) {
  const path = join(CONTENT, name);
  if (!existsSync(path)) {
    fail(name, "file not found");
    return null;
  }
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    fail(name, `invalid JSON: ${e.message}`);
    return null;
  }
}

function checkLocalized(where, obj, fieldName) {
  if (!obj || typeof obj !== "object") {
    fail(where, `${fieldName} must be an object`);
    return;
  }
  for (const loc of LOCALES) {
    if (typeof obj[loc] !== "string" || obj[loc].trim() === "") {
      fail(where, `${fieldName}.${loc} is missing or empty`);
    }
  }
}

// --- sources.json ---
const sourcesData = readJSON("sources.json");
const sourceIds = new Set();

if (sourcesData) {
  const sources = sourcesData.sources;
  if (!Array.isArray(sources)) {
    fail("sources.json", "sources must be an array");
  } else {
    for (const s of sources) {
      const w = `sources.json[${s.id}]`;
      if (!s.id || typeof s.id !== "string") { fail(w, "missing id"); continue; }
      if (sourceIds.has(s.id)) fail(w, "duplicate source id");
      sourceIds.add(s.id);
      if (!s.url || typeof s.url !== "string") fail(w, "missing url");
      if (!s.title || typeof s.title !== "string") fail(w, "missing title");
      if (!SOURCE_KINDS.includes(s.kind)) fail(w, `invalid kind "${s.kind}"`);
      if (!DATE_RE.test(s.accessedAt)) fail(w, `invalid accessedAt "${s.accessedAt}"`);
    }
  }
}

function requireSource(where, id) {
  if (!id || typeof id !== "string") {
    fail(where, "source id is missing");
    return;
  }
  if (!sourceIds.has(id)) {
    fail(where, `source "${id}" not found in sources.json`);
  }
}

// --- repos.json ---
const reposData = readJSON("repos.json");
const repoIds = new Set();
const listedRepoIds = new Set();

if (reposData) {
  const repos = reposData.repos;
  if (!Array.isArray(repos)) {
    fail("repos.json", "repos must be an array");
  } else {
    for (const r of repos) {
      const w = `repos.json[${r.id}]`;
      if (!r.id || typeof r.id !== "string") { fail(w, "missing id"); continue; }
      if (!REPO_ID_RE.test(r.id)) fail(w, `id "${r.id}" is not owner/name format`);
      if (repoIds.has(r.id)) fail(w, "duplicate repo id");
      repoIds.add(r.id);
      if (!REPO_CATEGORIES.includes(r.category)) fail(w, `invalid category "${r.category}"`);
      if (!REPO_STATUSES.includes(r.status)) fail(w, `invalid status "${r.status}"`);

      if (r.status === "listed") {
        listedRepoIds.add(r.id);
        if (!r.reviewedBy || typeof r.reviewedBy !== "string") fail(w, "listed repo must have reviewedBy");
        if (!DATE_RE.test(r.reviewedAt)) fail(w, `listed repo must have valid reviewedAt`);
      }

      if (!Array.isArray(r.firmware)) {
        fail(w, "firmware must be an array");
      } else {
        for (const fw of r.firmware) {
          if (!VERSION_RE.test(fw.min)) fail(w, `firmware.min "${fw.min}" invalid`);
          if (!VERSION_RE.test(fw.max)) fail(w, `firmware.max "${fw.max}" invalid`);
          if (!EVIDENCE_VALUES.includes(fw.evidence)) fail(w, `firmware.evidence "${fw.evidence}" invalid`);
          requireSource(w, fw.source);
        }
      }
    }
  }
}

// --- firmware.json ---
const fwData = readJSON("firmware.json");
const rangeIds = new Set();

if (fwData) {
  if (!VERSION_RE.test(fwData.latestKnownFirmware)) {
    fail("firmware.json", `latestKnownFirmware "${fwData.latestKnownFirmware}" invalid`);
  }

  const ranges = fwData.ranges;
  if (!Array.isArray(ranges)) {
    fail("firmware.json", "ranges must be an array");
  } else {
    const intervals = [];

    for (const r of ranges) {
      const w = `firmware.json[${r.id}]`;
      if (!r.id || typeof r.id !== "string") { fail(w, "missing id"); continue; }
      if (rangeIds.has(r.id)) fail(w, "duplicate range id");
      rangeIds.add(r.id);

      if (!VERSION_RE.test(r.min)) fail(w, `min "${r.min}" invalid`);
      if (!VERSION_RE.test(r.max)) fail(w, `max "${r.max}" invalid`);
      if (!RANGE_STATUSES.includes(r.status)) fail(w, `status "${r.status}" invalid`);
      if (!DATE_RE.test(r.reviewedAt)) fail(w, `reviewedAt "${r.reviewedAt}" invalid`);
      checkLocalized(w, r.title, "title");

      // Parse versions for overlap check
      if (VERSION_RE.test(r.min) && VERSION_RE.test(r.max)) {
        const [majMin, minMin] = r.min.split(".").map(Number);
        const [majMax, minMax] = r.max.split(".").map(Number);
        const lo = majMin * 100 + minMin;
        const hi = majMax * 100 + minMax;
        if (lo > hi) fail(w, `min ${r.min} > max ${r.max}`);
        intervals.push({ id: r.id, lo, hi });
      }

      // Repo references must exist in repos.json (unlisted ones are skipped at render time)
      if (!Array.isArray(r.repos)) {
        fail(w, "repos must be an array");
      } else {
        for (const repoId of r.repos) {
          if (!repoIds.has(repoId)) fail(w, `repo "${repoId}" not in repos.json`);
        }
      }

      // Claims must have valid evidence and source
      if (!Array.isArray(r.claims)) {
        fail(w, "claims must be an array");
      } else {
        for (const c of r.claims) {
          if (!c.text || typeof c.text !== "string") fail(w, "claim missing text");
          if (!EVIDENCE_VALUES.includes(c.evidence)) fail(w, `claim evidence "${c.evidence}" invalid`);
          requireSource(w, c.source);
        }
      }

      // Published "public" ranges need at least an EN MDX tutorial
      if (!r.draft && r.status === "public") {
        const mdxPath = join(CONTENT, "en", `${r.id}.mdx`);
        if (!existsSync(mdxPath)) {
          fail(w, `non-draft range needs content/en/${r.id}.mdx`);
        }
      }
    }

    // Check for overlapping ranges
    intervals.sort((a, b) => a.lo - b.lo);
    for (let i = 0; i < intervals.length - 1; i++) {
      const a = intervals[i];
      const b = intervals[i + 1];
      if (a.hi >= b.lo) {
        fail("firmware.json", `ranges "${a.id}" and "${b.id}" overlap`);
      }
    }
  }
}

// --- guides.json ---
const guidesData = readJSON("guides.json");
const guideSlugs = new Set();

if (guidesData) {
  const guides = guidesData.guides;
  if (!Array.isArray(guides)) {
    fail("guides.json", "guides must be an array");
  } else {
    for (const g of guides) {
      const w = `guides.json[${g.slug}]`;
      if (!g.slug || typeof g.slug !== "string") { fail(w, "missing slug"); continue; }
      if (!SLUG_RE.test(g.slug)) fail(w, `slug "${g.slug}" invalid`);
      if (guideSlugs.has(g.slug)) fail(w, "duplicate guide slug");
      guideSlugs.add(g.slug);

      if (!GUIDE_MENUS.includes(g.menu)) fail(w, `menu "${g.menu}" invalid`);
      if (!DATE_RE.test(g.reviewedAt)) fail(w, `reviewedAt "${g.reviewedAt}" invalid`);
      checkLocalized(w, g.title, "title");
      checkLocalized(w, g.summary, "summary");

      if (!g.requires || typeof g.requires !== "object") {
        fail(w, "missing requires");
      } else {
        if (!Array.isArray(g.requires.ranges)) {
          fail(w, "requires.ranges must be an array");
        } else {
          for (const rid of g.requires.ranges) {
            if (!rangeIds.has(rid)) fail(w, `requires range "${rid}" not in firmware.json`);
          }
        }
        if (typeof g.requires.hen !== "boolean") fail(w, "requires.hen must be boolean");
      }

      if (!Array.isArray(g.repos)) {
        fail(w, "repos must be an array");
      } else {
        for (const repoId of g.repos) {
          if (!repoIds.has(repoId)) fail(w, `repo "${repoId}" not in repos.json`);
        }
      }

      // Each guide needs at least an EN MDX
      const mdxPath = join(CONTENT, "en", "guides", `${g.slug}.mdx`);
      if (!existsSync(mdxPath)) {
        fail(w, `guide needs content/en/guides/${g.slug}.mdx`);
      }
    }
  }
}

// --- errors.json ---
const errorsData = readJSON("errors.json");
const errorSlugs = new Set();

if (errorsData) {
  const errs = errorsData.errors;
  if (!Array.isArray(errs)) {
    fail("errors.json", "errors must be an array");
  } else {
    for (const e of errs) {
      const w = `errors.json[${e.slug}]`;
      if (!e.slug || typeof e.slug !== "string") { fail(w, "missing slug"); continue; }
      if (!SLUG_RE.test(e.slug)) fail(w, `slug "${e.slug}" invalid`);
      if (errorSlugs.has(e.slug)) fail(w, "duplicate error slug");
      errorSlugs.add(e.slug);

      if (!ERROR_SEVERITIES.includes(e.severity)) fail(w, `severity "${e.severity}" invalid`);
      if (!DATE_RE.test(e.reviewedAt)) fail(w, `reviewedAt "${e.reviewedAt}" invalid`);
      checkLocalized(w, e.title, "title");

      if (!e.symptoms || typeof e.symptoms !== "object") {
        fail(w, "missing symptoms");
      } else {
        for (const loc of LOCALES) {
          if (!Array.isArray(e.symptoms[loc]) || e.symptoms[loc].length === 0) {
            fail(w, `symptoms.${loc} must be a non-empty array`);
          }
        }
      }

      if (!existsSync(join(CONTENT, "en", "errors", `${e.slug}.mdx`))) {
        fail(w, `error needs content/en/errors/${e.slug}.mdx`);
      }

      if (!Array.isArray(e.sources) || e.sources.length === 0) {
        fail(w, "sources must be a non-empty array");
      } else {
        for (const sid of e.sources) {
          requireSource(w, sid);
        }
      }
    }
  }
}

// --- MDX: <Repo id> must be listed, <Claim> needs evidence + a known src ---
function listMdx(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? listMdx(join(dir, d.name)) : d.name.endsWith(".mdx") ? [join(dir, d.name)] : [],
  );
}

const attr = (tag, name) => new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`).exec(tag)?.[1];

for (const loc of LOCALES) {
  for (const file of listMdx(join(CONTENT, loc))) {
    const w = relative(ROOT, file).replaceAll("\\", "/");
    const text = readFileSync(file, "utf8");

    for (const [tag] of text.matchAll(/<Repo\b[^>]*>/g)) {
      const id = attr(tag, "id");
      if (!id) fail(w, `${tag} has no id`);
      else if (!listedRepoIds.has(id)) fail(w, `<Repo id="${id}"> is not "listed" in repos.json`);
    }

    for (const [tag] of text.matchAll(/<Step\b[^>]*>/g)) {
      const src = attr(tag, "src");
      if (src !== undefined) requireSource(w, src);
    }

    for (const [tag] of text.matchAll(/<Claim\b[^>]*>/g)) {
      const evidence = attr(tag, "evidence");
      if (!EVIDENCE_VALUES.includes(evidence)) fail(w, `${tag} needs evidence="proven|reported"`);
      requireSource(w, attr(tag, "src"));
    }
  }
}

// --- Claim texts in firmware.json are dictionary keys: each needs EN, ES and PT text ---
const dictSource = readFileSync(join(ROOT, "src", "i18n", "dictionaries.ts"), "utf8");
for (const r of fwData?.ranges ?? []) {
  for (const c of r.claims ?? []) {
    const hits = dictSource.split(`"${c.text}":`).length - 1;
    if (hits < LOCALES.length) {
      fail(`firmware.json[${r.id}]`, `claim "${c.text}" has text in ${hits} of ${LOCALES.length} dictionaries`);
    }
  }
}

// --- List pages link to /guias/<slug> and /erros/<slug>; those routes only exist once there is
// content (Cache Components rejects an empty generateStaticParams), so entries need the route. ---
for (const [file, set, route] of [
  ["guides.json", guideSlugs, "guias"],
  ["errors.json", errorSlugs, "erros"],
]) {
  const page = join(ROOT, "src", "app", "[lang]", route, "[slug]", "page.tsx");
  if (set.size > 0 && !existsSync(page)) {
    fail(file, `has entries but src/app/[lang]/${route}/[slug]/page.tsx does not exist yet`);
  }
}

// --- Cross-check: slug uniqueness across guides and errors ---
for (const slug of guideSlugs) {
  if (errorSlugs.has(slug)) {
    fail("cross-check", `slug "${slug}" appears in both guides.json and errors.json`);
  }
}

// --- Report ---
if (errors.length > 0) {
  console.error(`\n  check-content: ${errors.length} problem(s) found:\n`);
  for (const e of errors) console.error(`    ${e}`);
  console.error("");
  process.exit(1);
} else {
  console.log("check-content: all content files valid.");
}
