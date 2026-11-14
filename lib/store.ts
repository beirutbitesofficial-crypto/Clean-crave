import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { get, put } from "@vercel/blob";
import type { Content } from "./content";
import { type Category, type Item, menu as defaultMenu } from "./menu";
import { type Contact, defaultContact } from "./site";

/**
 * Where the admin panel's edits live.
 * On Vercel: one JSON file in the project's Blob store. On a laptop: a file in .data/.
 * With nothing saved yet, the site shows the menu written in lib/menu.ts.
 */
const PATHNAME = "cleancrave/content.json";
const LOCAL = path.join(process.cwd(), ".data", "content.json");
const ACCESS = ["private", "public"] as const;

export const hasBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);
/** Edits can be saved: a Blob store is connected, or this is a laptop. */
export const canSave = () => hasBlob() || !process.env.VERCEL;

const defaults = (): Content => ({ contact: defaultContact, menu: defaultMenu });

async function readRaw(): Promise<string | null> {
  if (hasBlob()) {
    for (const access of ACCESS) {
      try {
        const found = await get(PATHNAME, { access, useCache: false });
        if (found?.stream) return await new Response(found.stream).text();
      } catch {}
    }
    return null;
  }
  try {
    return await fs.readFile(LOCAL, "utf8");
  } catch {
    return null;
  }
}

export async function getContent(): Promise<Content> {
  try {
    const raw = await readRaw();
    if (!raw) return defaults();
    const clean = sanitize(JSON.parse(raw));
    return clean.ok ? clean.content : defaults();
  } catch {
    return defaults();
  }
}

export async function saveContent(content: Content) {
  const body = JSON.stringify(content, null, 2);
  if (hasBlob()) {
    let last: unknown;
    for (const access of ACCESS) {
      try {
        await put(PATHNAME, body, { access, allowOverwrite: true, addRandomSuffix: false, contentType: "application/json", cacheControlMaxAge: 60 });
        return;
      } catch (e) {
        last = e;
      }
    }
    throw last;
  }
  await fs.mkdir(path.dirname(LOCAL), { recursive: true });
  await fs.writeFile(LOCAL, body, "utf8");
}

/* ---------- Checking what the admin panel sends ---------- */

const text = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");
const num = (v: unknown, max: number) => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? Math.min(Math.max(n, 0), max) : 0;
};
const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

/** Keeps ids that are already in use (carts remember them); gives new rows an id from their name. */
function idFor(raw: unknown, name: string, taken: Set<string>, fallback: string) {
  let id = typeof raw === "string" && /^[a-z0-9-]{1,80}$/.test(raw) && !raw.startsWith("new-") ? raw : slug(name) || fallback;
  const base = id;
  for (let n = 2; taken.has(id); n++) id = `${base}-${n}`;
  taken.add(id);
  return id;
}

export function sanitize(input: unknown): { ok: true; content: Content } | { ok: false; error: string } {
  const src = (input ?? {}) as { contact?: Partial<Contact>; menu?: unknown };
  const whatsapp = text(src.contact?.whatsapp, 20).replace(/\D/g, "");
  if (whatsapp.length < 8) return { ok: false, error: "The WhatsApp number needs its country code and at least 8 digits." };
  let instagram = text(src.contact?.instagram, 200);
  if (instagram && !/^https?:\/\//i.test(instagram)) instagram = `https://instagram.com/${instagram.replace(/^@/, "")}`;
  const contact: Contact = { whatsapp, phone: text(src.contact?.phone, 30) || `+${whatsapp}`, instagram };

  if (!Array.isArray(src.menu)) return { ok: false, error: "The menu is missing." };
  const catIds = new Set<string>();
  const itemIds = new Set<string>();
  const menu: Category[] = [];
  for (const c of src.menu.slice(0, 30) as Partial<Category>[]) {
    const title = text(c?.title, 40);
    if (!title) return { ok: false, error: "Every category needs an English title." };
    const items: Item[] = [];
    for (const i of (Array.isArray(c.items) ? c.items.slice(0, 100) : []) as Partial<Item>[]) {
      const name = text(i?.name, 80);
      if (!name) return { ok: false, error: `A meal in “${title}” has no English name.` };
      const item: Item = {
        id: idFor(i.id, name, itemIds, "meal"),
        name,
        desc: text(i.desc, 400),
        ar: { name: text(i.ar?.name, 80) || name, desc: text(i.ar?.desc, 400) },
        price: Math.round(num(i.price, 9999) * 100) / 100,
        kcal: Math.round(num(i.kcal, 9999)),
        p: Math.round(num(i.p, 999)),
        c: Math.round(num(i.c, 999)),
        f: Math.round(num(i.f, 999)),
      };
      if (typeof i.img === "string" && /^[a-z0-9-]{1,60}$/.test(i.img)) item.img = i.img;
      if (i.soldOut) item.soldOut = true;
      items.push(item);
    }
    menu.push({
      id: idFor(c.id, title, catIds, "category"),
      title,
      script: text(c.script, 60),
      ar: { title: text(c.ar?.title, 40) || title, script: text(c.ar?.script, 60) },
      items,
    });
  }
  if (!menu.some((c) => c.items.length)) return { ok: false, error: "The menu needs at least one meal." };
  return { ok: true, content: { contact, menu } };
}
