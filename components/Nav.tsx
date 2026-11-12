"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { helloLink, site } from "@/lib/site";
import { WhatsAppIcon } from "./Icons";

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-sans font-extrabold italic tracking-[-0.02em] ${className}`}>
      <span className="text-ivory">Clean</span>
      <span className="gold-text pr-[0.12em]">Crave</span>
    </span>
  );
}

/** Top bar over the hero. Past the hero it slides away — the menu's own bar and the order button take over. */
export default function Nav() {
  const [gone, setGone] = useState(false);
  const { count, setOpen } = useCart();

  useEffect(() => {
    const on = () => setGone(window.scrollY > window.innerHeight * 0.6);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const link = "hidden min-h-11 items-center px-3 text-ivory/70 transition-colors hover:text-gold md:inline-flex";

  return (
    <header className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${gone ? "pointer-events-none -translate-y-full opacity-0" : "opacity-100"}`} inert={gone}>
      <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-4 lg:px-12 lg:py-5">
        <a href="#top" aria-label={`${site.name} — home`} className="flex min-h-11 items-center gap-2.5">
          <img src="/brand/emblem.webp" width={740} height={538} alt="" className="h-9 w-auto" />
          <Wordmark className="text-[19px]" />
        </a>
        <nav aria-label="Main" className="flex items-center gap-1 text-xs font-bold uppercase tracking-[0.24em]">
          <a href="#macros" className={link}>
            Macros
          </a>
          <a href="#menu" className={link}>
            Menu
          </a>
          <a href="#order" className={link}>
            Order
          </a>
          {count > 0 ? (
            <button type="button" onClick={() => setOpen(true)} className="ml-2 inline-flex min-h-11 items-center gap-2.5 rounded-full border border-gold/50 px-4 text-ivory transition-colors hover:border-gold">
              My order
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[11px] tracking-normal text-ink">{count}</span>
            </button>
          ) : (
            <a href={helloLink} target="_blank" rel="noopener noreferrer" className="ml-2 inline-flex min-h-11 items-center gap-2.5 rounded-full border border-ivory/20 px-4 text-ivory transition-colors hover:border-gold">
              <WhatsAppIcon className="h-4 w-4 text-wa" />
              <span className="sm:hidden">Order</span>
              <span dir="ltr" className="hidden tracking-[0.12em] sm:inline">
                {site.phone}
              </span>
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}
