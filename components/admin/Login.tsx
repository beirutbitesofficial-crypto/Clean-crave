"use client";

import { useActionState } from "react";
import { login } from "@/app/admin/actions";

const field = "min-h-12 w-full rounded-xl border border-ivory/15 bg-ink-2 px-3.5 text-base text-ivory placeholder:text-ivory/30 focus:border-gold/70 focus:outline-none";

export default function Login() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <main dir="ltr" lang="en" className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-5 py-16">
      <img src="/brand/logo.webp" width={1176} height={728} alt="CleanCrave" className="-ms-3 w-48" />
      <h1 className="mt-6 font-serif text-4xl text-ivory">Admin</h1>
      <form action={action} className="mt-8 space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm text-ivory/70">Username</span>
          <input name="username" defaultValue={state?.username} autoComplete="username" autoCapitalize="none" autoCorrect="off" required className={field} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm text-ivory/70">Password</span>
          <input name="password" type="password" autoComplete="current-password" required className={field} />
        </label>
        <p role="alert" className="min-h-5 text-sm text-[#ff9d8a]">
          {state?.error}
        </p>
        <button type="submit" disabled={pending} className="btn btn-gold w-full disabled:opacity-60">
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
