import "server-only";
import type { PresenceResponse } from "./types";

// Same Supabase project as ps5-jb-tracker, counted separately: supabase/001_guide_presence.sql
// keeps the guide's tabs in guide_presence and its views under 'guide:pageviews'.
const FLUSH_FN = "guide_presence_flush";
const PRESENCE_TTL_MS = 120_000;
// Each server instance batches heartbeats into one RPC at most once per FLUSH_MS.
const FLUSH_MS = 15_000;
const TIMEOUT_MS = 5000;
const MAX_MEMORY_ENTRIES = 10_000;

// Local view: random tab ids seen recently by this instance (no IP/UA), pruned on use.
// Doubles as the only store when Supabase is not configured (e.g. local dev).
const memory = new Map<string, number>();
const pending = new Map<string, number>();
const removed = new Set<string>();
let pendingViews = 0;
let memoryViews = 0;
let lastFlush = 0;
let flushing: Promise<void> | null = null;
let shared: { online: number; views: number } | null = null;

function supabaseConfig() {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/+$/, "");
  const key = process.env.SUPABASE_SECRET_KEY?.trim();
  return url?.startsWith("https://") && key ? { url, key } : null;
}

async function rpcFlush(cfg: { url: string; key: string }, args: Record<string, unknown>) {
  const res = await fetch(`${cfg.url}/rest/v1/rpc/${FLUSH_FN}`, {
    method: "POST",
    headers: { apikey: cfg.key, "content-type": "application/json" },
    body: JSON.stringify(args),
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: "no-store",
    redirect: "error", // never forward the key to another host
  });
  if (!res.ok) throw new Error(`Supabase HTTP ${res.status} on ${FLUSH_FN}`);
  const [row] = (await res.json()) as { online: number; pageviews: number }[];
  return { online: Number(row?.online) || 0, views: Number(row?.pageviews) || 0 };
}

function pruneMemory(now: number): number {
  const cutoff = now - PRESENCE_TTL_MS;
  for (const [id, seen] of memory) if (seen < cutoff) memory.delete(id);
  return memory.size;
}

async function flush(now: number) {
  const cfg = supabaseConfig();
  if (!cfg) return;
  const beats = [...pending];
  const gone = [...removed];
  const views = pendingViews;
  pending.clear();
  removed.clear();
  pendingViews = 0;
  try {
    shared = await rpcFlush(cfg, {
      beats: Object.fromEntries(beats),
      gone,
      ttl_seconds: PRESENCE_TTL_MS / 1000,
      views,
    });
  } catch (err) {
    console.error("[presence] store error", err instanceof Error ? err.message : err);
    pendingViews += views; // keep them for the next flush instead of losing them
    for (const [id, seen] of beats) if (!pending.has(id) && pending.size < MAX_MEMORY_ENTRIES) pending.set(id, seen);
    for (const id of gone) removed.add(id);
  }
  lastFlush = now; // after a failure, back off a full interval instead of retrying every request
}

async function snapshot(): Promise<PresenceResponse> {
  const now = Date.now();
  const local = { online: pruneMemory(now), views: memoryViews };
  // lastFlush starts at 0, so the first request flushes; after a failure, wait a full interval.
  if (supabaseConfig() && now - lastFlush >= FLUSH_MS) {
    flushing ??= flush(now).finally(() => (flushing = null));
    await flushing;
  }
  // Between flushes (or with Supabase down), never show fewer than this instance can see itself.
  const online = shared ? Math.max(shared.online, local.online) : local.online;
  const visits = shared ? shared.views + pendingViews : local.views;
  return { online, visits };
}

export async function heartbeat(id: string, newView = false): Promise<PresenceResponse> {
  const now = Date.now();
  pruneMemory(now);
  if (memory.size < MAX_MEMORY_ENTRIES || memory.has(id)) memory.set(id, now);
  pending.set(id, now);
  removed.delete(id);
  if (newView) {
    memoryViews++;
    pendingViews++;
  }
  return snapshot();
}

export async function leave(id: string): Promise<PresenceResponse> {
  memory.delete(id);
  pending.delete(id);
  removed.add(id);
  return snapshot();
}

export function countOnline(): Promise<PresenceResponse> {
  return snapshot();
}
