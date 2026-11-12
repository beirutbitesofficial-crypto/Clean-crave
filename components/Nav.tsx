"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { useLang } from "@/lib/i18n";
import { site, whatsappLink } from "@/lib/site";
import { WhatsAppIcon } from "./Icons";
import LangToggle from "./LangToggle";

/** The name, set in type. Always Latin, always left-to-right — it is the brand's own lettering. */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span lang="en" dir="ltr" className={`font-sans font-extrabold italic tracking-[-0.02em] ${className}`}>
      <span className="text-ivory">Clean</span>
      <span className="gold-text pr-[0.12em]">Crave</span>
    </span>
  );
}

/** Top bar over the hero. Past the hero it slides away — the menu's own bar and the order button take over. */
export default function Nav() {
  const [gone, setGone] = useState(false);
  const { count, setOpen } = useCart();
  const { t } = useLang();

  useEffect(() => {
    const on = () => setGone(window.scrollY > window.innerHeight * 0.6);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const link = "hidden min-h-11 items-center px-3 text-ivory/70 transition-colors hover:text-gold md:inline-flex";

  return (
    <header className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${gone ? "pointer-events-none -translate-y-full opacity-0" : "opacity-100"}`} inert={gone}>
      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-2 px-5 py-4 lg:px-12 lg:py-5">
        <a href="#top" aria-label={t.nav.home} className="flex min-h-11 items-center gap-2.5">
          <img src="/brand/emblem.webp" width={370} height={269} alt="" className="h-9 w-auto" />
          <Wordmark className="text-[19px]" />
        </a>
        <nav aria-label={t.nav.main} className="flex items-center gap-1 text-xs font-bold uppercase tracking-[0.24em] rtl:text-[15px]">
          <a href="#macros" className={link}>
            {t.nav.macros}
          </a>
          <a href="#menu" className={link}>
            {t.nav.menu}
          </a>
          <a href="#order" className={link}>
            {t.nav.order}
          </a>
          <LangToggle className="ms-1 md:ms-2" />
          {count > 0 ? (
            <button type="button" onClick={() => setOpen(true)} className="ms-1 inline-flex min-h-11 items-center gap-2.5 rounded-full border border-gold/50 px-3 text-ivory transition-colors hover:border-gold sm:px-4">
              <span className="hidden sm:inline">{t.myOrder}</span>
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[11px] tracking-normal text-ink">{count}</span>
            </button>
          ) : (
            <a
              href={whatsappLink(t.wa.hello)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${t.cart.whatsapp} — ${site.phone}`}
              className="ms-1 inline-flex min-h-11 min-w-11 items-center justify-center gap-2.5 rounded-full border border-ivory/20 text-ivory transition-colors hover:border-gold sm:px-4"
            >
              <WhatsAppIcon className="h-[18px] w-[18px] text-wa sm:h-4 sm:w-4" />
              <span dir="ltr" lang="en" className="hidden tracking-[0.12em] sm:inline">
                {site.phone}
              </span>
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}
