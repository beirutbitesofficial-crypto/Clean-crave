"use client";

import { useLang } from "@/lib/i18n";

/**
 * English / Arabic switch. Each side is written in its own language, so it reads to the people it is for.
 * `tone="dark"` is for the gold page, where the switch sits on a light ground.
 */
export default function LangToggle({ className = "", tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  const { lang, setLang, t } = useLang();
  const frame = tone === "dark" ? "shadow-[inset_0_0_0_1px_rgba(7,6,5,0.35)]" : "bg-ink/60 shadow-[inset_0_0_0_1px_rgba(246,240,228,0.2)]";
  const on = tone === "dark" ? "bg-ink text-ivory" : "gold-fill text-ink";
  const off = tone === "dark" ? "text-ink/80 hover:text-ink" : "text-ivory/75 hover:text-gold";
  const side = "grid h-9 min-w-10 place-items-center rounded-full px-2.5 transition-colors duration-300";

  return (
    <div role="group" aria-label={t.language} dir="ltr" className={`inline-flex h-11 shrink-0 items-center gap-0.5 rounded-full p-1 ${frame} ${className}`}>
      <button type="button" lang="en" aria-pressed={lang === "en"} aria-label="English" onClick={() => setLang("en")} className={`${side} font-sans text-[11px] font-extrabold tracking-[0.14em] ${lang === "en" ? on : off}`}>
        EN
      </button>
      <button type="button" lang="ar" aria-pressed={lang === "ar"} aria-label="العربية" onClick={() => setLang("ar")} className={`${side} font-sans text-[14px] font-bold leading-none ${lang === "ar" ? on : off}`}>
        عربي
      </button>
    </div>
  );
}
