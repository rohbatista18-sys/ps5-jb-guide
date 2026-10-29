import type { NextRequest } from "next/server";
import type { PresenceResponse } from "@/lib/types";
import { countOnline, heartbeat, leave } from "@/lib/presence";
import { rateLimit } from "@/lib/rate-limit";
import { clientIp, isForeignOrigin, readBody } from "@/lib/request";

const MAX_BODY_BYTES = 200;
const LIMIT_PER_MIN = 30; // ~3 heartbeats/min per tab, leaves room for shared IPs (NAT) and page switches
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function json(body: PresenceResponse | { error: string }, status = 200, extra: HeadersInit = {}) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", ...extra } });
}

async function guard(req: NextRequest): Promise<Response | null> {
  const { ok } = await rateLimit(`presence:${clientIp(req)}`, LIMIT_PER_MIN, 60);
  return ok ? null : json({ error: "too many requests" }, 429, { "Retry-After": "60" });
}

export async function GET(req: NextRequest) {
  return (await guard(req)) ?? json(await countOnline());
}

export async function POST(req: NextRequest) {
  if (isForeignOrigin(req)) return json({ error: "forbidden" }, 403);
  const limited = await guard(req);
  if (limited) return limited;
  const raw = await readBody(req, MAX_BODY_BYTES);
  if (raw === null) return json({ error: "payload too large" }, 413);
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return json({ error: "invalid json" }, 400);
  }
  const { id, leave: isLeave, view } = (typeof data === "object" && data ? data : {}) as { id?: unknown; leave?: unknown; view?: unknown };
  if (typeof id !== "string" || !UUID_V4.test(id)) return json({ error: "invalid id" }, 400);
  const tab = id.toLowerCase();
  return json(isLeave === true ? await leave(tab) : await heartbeat(tab, view === true));
}
