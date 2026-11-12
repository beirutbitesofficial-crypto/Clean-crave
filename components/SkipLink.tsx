"use client";

import { useLang } from "@/lib/i18n";

export default function SkipLink() {
  const { t } = useLang();
  return (
    <a href="#menu" className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-gold focus:px-5 focus:py-3 focus:text-sm focus:font-bold focus:text-ink">
      {t.skip}
    </a>
  );
}
