"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { checkLogin, endSession, signedIn, startSession } from "@/lib/auth";
import type { Content } from "@/lib/content";
import { canSave, sanitize, saveContent } from "@/lib/store";

/** Slows password guessing: after 5 wrong tries, an address waits 10 minutes. */
const tries = new Map<string, { n: number; until: number }>();

type LoginState = { error: string; username: string } | null;

export async function login(_: LoginState, form: FormData): Promise<LoginState> {
  const username = String(form.get("username") ?? "");
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const now = Date.now();
  const seen = tries.get(ip);
  if (seen && seen.until > now && seen.n >= 5) return { error: "Too many tries. Wait 10 minutes and try again.", username };

  const ok = checkLogin(username, String(form.get("password") ?? ""));
  if (!ok) {
    await new Promise((r) => setTimeout(r, 900));
    tries.set(ip, { n: (seen && seen.until > now ? seen.n : 0) + 1, until: now + 10 * 60_000 });
    return { error: "Wrong username or password.", username };
  }
  tries.delete(ip);
  await startSession();
  revalidatePath("/admin");
  return null;
}

export async function logout() {
  await endSession();
  revalidatePath("/admin");
}

export async function save(content: Content): Promise<{ ok: true; content: Content } | { ok: false; error: string }> {
  if (!(await signedIn())) return { ok: false, error: "You were signed out. Reload the page and sign in again." };
  if (!canSave()) return { ok: false, error: "Storage is not connected yet, so nothing can be saved." };
  const clean = sanitize(content);
  if (!clean.ok) return clean;
  try {
    await saveContent(clean.content);
  } catch {
    return { ok: false, error: "Could not save. Check the connection and try again." };
  }
  revalidatePath("/", "layout");
  return clean;
}
