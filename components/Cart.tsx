"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import { money } from "@/lib/menu";
import { helloLink, site } from "@/lib/site";
import { Close, Minus, Plus, WhatsAppIcon } from "./Icons";
import MacroRing from "./MacroRing";

/**
 * Floating button, bottom right. Empty order: a WhatsApp shortcut (once you are past the hero).
 * With something picked: "My order" with the count and the running total.
 */
export function OrderDock() {
  const { count, totals, setOpen, pulse } = useCart();
  const [past, setPast] = useState(false);
  const [inMenu, setInMenu] = useState(false);

  useEffect(() => {
    const on = () => setPast(window.scrollY > window.innerHeight * 0.6);
    on();
    window.addEventListener("scroll", on, { passive: true });
    // While the menu fills the screen the shortcut steps aside, so it never sits on top of a + button.
    const menu = document.getElementById("menu");
    const io = new IntersectionObserver(([e]) => setInMenu(e.isIntersecting), { rootMargin: "-45% 0px -45% 0px" });
    if (menu) io.observe(menu);
    return () => {
      window.removeEventListener("scroll", on);
      io.disconnect();
    };
  }, []);
  const show = past && !inMenu;

  if (count > 0) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="gold-fill fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 flex min-h-14 items-center gap-3 rounded-full pl-2.5 pr-6 text-ink shadow-[0_16px_44px_-12px_rgba(221,182,94,0.8)] transition-transform duration-300 hover:-translate-y-0.5 sm:inset-x-auto sm:right-5 md:bottom-8 md:right-8"
        aria-label={`Open my order: ${count} ${count === 1 ? "meal" : "meals"}, ${money(totals.price)}`}
      >
        <span key={pulse} className="pop grid h-9 w-9 place-items-center rounded-full bg-ink font-cond text-base font-bold text-ivory">
          {count}
        </span>
        <span className="text-xs font-extrabold uppercase tracking-[0.22em]">My order</span>
        <span className="ml-auto font-display text-lg leading-none sm:ml-0">{money(totals.price)}</span>
      </button>
    );
  }

  return (
    <a
      href={helloLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Order on WhatsApp — ${site.phone}`}
      inert={!show}
      className={`fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-ink text-wa shadow-[inset_0_0_0_1px_rgba(221,182,94,0.55),0_16px_40px_-14px_rgba(0,0,0,0.9)] transition-all duration-500 hover:-translate-y-0.5 md:bottom-8 md:right-8 ${
        show ? "opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <WhatsAppIcon className="h-6 w-6" />
    </a>
  );
}

export function CartDrawer() {
  const { lines, count, totals, open, setOpen, setQty, clear, name, setName, notes, setNotes, orderLink } = useCart();
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const before = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    closeBtn.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      before?.focus?.();
    };
  }, [open, setOpen]);

  const field = "min-h-12 w-full rounded-2xl border border-ivory/15 bg-ink px-4 text-base text-ivory placeholder:text-ivory/40 focus:border-gold/70 focus:outline-none";

  return (
    <div className={`fixed inset-0 z-[80] ${open ? "" : "pointer-events-none"}`} inert={!open}>
      <div className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} onClick={() => setOpen(false)} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-title"
        className={`absolute inset-y-0 right-0 flex w-full max-w-[470px] flex-col bg-ink-2 transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] ${open ? "translate-x-0 shadow-[-40px_0_80px_-30px_rgba(0,0,0,0.9)]" : "translate-x-full"}`}
      >
        <header className="flex items-center justify-between border-b border-ivory/10 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <img src="/brand/emblem.webp" width={370} height={269} alt="" className="h-9 w-auto" />
            <h2 id="order-title" className="font-serif text-2xl">
              My <em className="gold-text pr-[0.08em]">order</em>
            </h2>
          </div>
          <button ref={closeBtn} type="button" onClick={() => setOpen(false)} className="grid h-11 w-11 place-items-center rounded-full text-ivory/70 transition-colors hover:bg-ivory/10 hover:text-ivory" aria-label="Close my order">
            <Close />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-2 sm:px-6">
          {lines.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-serif text-2xl italic text-ivory/80">Nothing yet.</p>
              <p className="mt-2 text-sm text-ivory/60">Tap + on any meal and its macros add up here.</p>
              <a href="#menu" onClick={() => setOpen(false)} className="btn btn-line mt-7">
                Back to the menu
              </a>
            </div>
          ) : (
            <>
              <ul>
                {lines.map(({ item, qty }) => (
                  <li key={item.id} className="flex items-center gap-3 border-b border-dashed border-ivory/10 py-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-sans text-base font-bold leading-tight">{item.name}</p>
                      <p className="mt-1 font-cond text-sm font-medium tracking-wide text-ivory/60">
                        {item.kcal} kcal · <span className="text-protein">P {item.p}</span> · <span className="text-carb">C {item.c}</span> · <span className="text-fat">F {item.f}</span>
                      </p>
                    </div>
                    <div className="flex h-11 shrink-0 items-center rounded-full border border-ivory/15">
                      <button type="button" className="grid h-11 w-10 place-items-center text-gold" onClick={() => setQty(item.id, qty - 1)} aria-label={`One less ${item.name}`}>
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-5 text-center font-cond text-base font-bold tabular-nums">{qty}</span>
                      <button type="button" className="grid h-11 w-10 place-items-center text-gold" onClick={() => setQty(item.id, qty + 1)} aria-label={`One more ${item.name}`}>
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="w-14 shrink-0 text-right font-display text-lg leading-none text-gold">{money(item.price * qty)}</p>
                  </li>
                ))}
              </ul>

              {/* What the whole order adds up to */}
              <section className="mt-5 rounded-[22px] bg-ink p-4 shadow-[inset_0_0_0_1px_rgba(221,182,94,0.28)]" aria-label="Macros for this order">
                <p className="font-cond text-[13px] font-semibold uppercase tracking-[0.34em] text-gold">This order adds up to</p>
                <div className="mt-3 flex items-center gap-4">
                  <div className="relative h-[92px] w-[92px] shrink-0">
                    <MacroRing p={totals.p} c={totals.c} f={totals.f} stroke={7} className="h-full w-full" decorative />
                    <p className="absolute inset-0 grid place-content-center text-center">
                      <span className="font-cond text-[26px] font-bold leading-[0.9] tabular-nums">{totals.kcal}</span>
                      <span className="font-cond text-[12px] font-semibold uppercase tracking-[0.22em] text-gold">kcal</span>
                    </p>
                  </div>
                  <dl className="grid flex-1 grid-cols-3">
                    {(
                      [
                        ["P", "Protein", totals.p, "text-protein"],
                        ["C", "Carbs", totals.c, "text-carb"],
                        ["F", "Fat", totals.f, "text-fat"],
                      ] as const
                    ).map(([letter, word, grams, tone]) => (
                      <div key={letter} className="border-l border-ivory/10 pl-3 first:border-0 first:pl-0">
                        <dt className="flex items-baseline gap-1.5 font-cond text-xs font-semibold uppercase tracking-[0.14em] text-ivory/60">
                          <span className={`font-display text-[15px] leading-none tracking-normal ${tone}`} aria-hidden="true">
                            {letter}
                          </span>
                          {word}
                        </dt>
                        <dd className={`mt-1 font-cond text-[30px] font-bold leading-none tabular-nums ${tone}`}>
                          {grams}
                          <span className="ml-0.5 text-[13px] font-semibold text-ivory/55">g</span>
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </section>

              <div className="mt-5 space-y-3 pb-3">
                <label className="block">
                  <span className="mb-1.5 block font-cond text-[13px] font-semibold uppercase tracking-[0.24em] text-ivory/65">Your name (optional)</span>
                  <input className={field} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block font-cond text-[13px] font-semibold uppercase tracking-[0.24em] text-ivory/65">Notes (optional)</span>
                  <textarea className={`${field} min-h-20 py-3`} placeholder="Allergies, delivery details, anything we should know" value={notes} onChange={(e) => setNotes(e.target.value)} />
                </label>
                <button type="button" onClick={() => confirm("Clear your whole order?") && clear()} className="min-h-11 text-sm text-ivory/55 underline underline-offset-4 hover:text-ivory">
                  Clear order
                </button>
              </div>
            </>
          )}
        </div>

        {lines.length > 0 && (
          <footer className="border-t border-ivory/10 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 sm:px-6">
            <div className="mb-3 flex items-end justify-between">
              <p className="font-cond text-[13px] font-semibold uppercase tracking-[0.3em] text-ivory/60">
                Total · {count} {count === 1 ? "meal" : "meals"}
              </p>
              <p className="font-display text-[34px] leading-none text-ivory">{money(totals.price)}</p>
            </div>
            <a href={orderLink} target="_blank" rel="noopener noreferrer" className="btn btn-gold w-full !min-h-14">
              <WhatsAppIcon className="h-5 w-5" />
              Send order on WhatsApp
            </a>
            <p className="mt-2.5 text-center text-xs text-ivory/55">
              Opens WhatsApp with your order written out, to{" "}
              <span dir="ltr" className="whitespace-nowrap text-ivory/80">
                {site.phone}
              </span>
              .
            </p>
          </footer>
        )}
      </div>
    </div>
  );
}
