import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Admin sign-in. The username and password are set as ADMIN_USER and ADMIN_PASSWORD
 * in the hosting settings — never in the code. Changing either signs everyone out.
 */
const COOKIE = "cc_admin";
const DAYS = 7;

const user = () => process.env.ADMIN_USER?.trim() ?? "";
const pass = () => process.env.ADMIN_PASSWORD ?? "";

export const authConfigured = () => user().length > 0 && pass().length >= 8;

const secret = () => createHash("sha256").update(`${user()}\n${pass()}\n${process.env.BLOB_READ_WRITE_TOKEN ?? ""}`).digest();
const sign = (exp: string) => createHmac("sha256", secret()).update(exp).digest("hex");

function same(a: string, b: string) {
  const x = createHash("sha256").update(a).digest();
  const y = createHash("sha256").update(b).digest();
  return timingSafeEqual(x, y);
}

export function checkLogin(username: string, password: string) {
  if (!authConfigured()) return false;
  // Both compared in full, so the time taken says nothing about which one was wrong.
  const u = same(username.trim().toLowerCase(), user().toLowerCase());
  const p = same(password, pass());
  return u && p;
}

export async function startSession() {
  const exp = String(Date.now() + DAYS * 864e5);
  (await cookies()).set(COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: DAYS * 86400,
  });
}

export async function endSession() {
  (await cookies()).set(COOKIE, "", { path: "/admin", maxAge: 0 });
}

export async function signedIn() {
  if (!authConfigured()) return false;
  const [exp, mac] = ((await cookies()).get(COOKIE)?.value ?? "").split(".");
  if (!exp || !mac || !/^\d+$/.test(exp) || Number(exp) < Date.now()) return false;
  return same(mac, sign(exp));
}
