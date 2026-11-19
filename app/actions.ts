"use server";

import { headers } from "next/headers";
import { cleanCode, getContent, hasBlob, logOrder } from "@/lib/store";

/** A little brake on scripted calls: per address, per hour. */
const hits = new Map<string, { n: number; until: number }>();
async function allowed(kind: string, max: number) {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const key = `${kind}:${ip}`;
  const now = Date.now();
  const h = hits.get(key);
  if (!h || h.until < now) {
    hits.set(key, { n: 1, until: now + 3600_000 });
    return true;
  }
  return ++h.n <= max;
}

async function findCode(raw: string) {
  const code = cleanCode(raw);
  if (!code) return null;
  return (await getContent()).codes.find((c) => c.code === code && c.active) ?? null;
}

/** Checks a promo or referral code. Only the code and its discount come back — never the partner's share. */
export async function checkCode(raw: string): Promise<{ code: string; discount: number } | null> {
  if (!(await allowed("check", 60))) return null;
  const found = await findCode(raw);
  return found ? { code: found.code, discount: found.discount } : null;
}

/**
 * Notes an order sent to WhatsApp with a code, so the admin panel can show each partner's orders.
 * The total is worked out here from the saved menu, not taken from the browser.
 */
export async function recordOrder(raw: string, lines: { id: string; qty: number }[]) {
  if (!Array.isArray(lines) || !(await allowed("order", 20))) return;
  const found = await findCode(raw);
  if (!found || (process.env.VERCEL && !hasBlob())) return;
  const items = new Map((await getContent()).menu.flatMap((c) => c.items).map((i) => [i.id, i]));
  let cents = 0;
  for (const l of lines.slice(0, 100)) {
    const item = items.get(String(l?.id));
    const qty = Math.min(Math.max(Math.floor(Number(l?.qty)) || 0, 0), 99);
    if (item && !item.soldOut) cents += Math.round(item.price * 100) * qty;
  }
  if (cents <= 0) return;
  cents = Math.round(cents * (1 - found.discount / 100));
  try {
    await logOrder(found.code, cents);
  } catch {}
}
