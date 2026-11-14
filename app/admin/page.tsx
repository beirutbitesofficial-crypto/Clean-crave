import type { Metadata } from "next";
import Editor from "@/components/admin/Editor";
import Login from "@/components/admin/Login";
import { authConfigured, signedIn } from "@/lib/auth";
import { canSave, getContent } from "@/lib/store";

export const metadata: Metadata = { title: "CleanCrave — Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Admin() {
  if (!authConfigured()) {
    return (
      <main dir="ltr" lang="en" className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-5 py-16">
        <h1 className="font-serif text-4xl text-gold">Admin is not set up yet</h1>
        <p className="leading-relaxed text-ivory/75">
          Add two environment variables in Vercel (Project → Settings → Environment Variables), then redeploy:
        </p>
        <ul className="space-y-2 rounded-2xl border border-ivory/15 bg-ink-2 p-5 font-mono text-sm text-ivory/90">
          <li>ADMIN_USER — your username</li>
          <li>ADMIN_PASSWORD — at least 8 characters</li>
        </ul>
      </main>
    );
  }
  if (!(await signedIn())) return <Login />;
  return <Editor initial={await getContent()} canSave={canSave()} />;
}
