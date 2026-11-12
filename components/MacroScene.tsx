"use client";

import { useRef } from "react";
import { useCart } from "@/lib/cart";
import { type Conditions, gsap, MQ, useGSAP } from "@/lib/gsap";
import { money, stats } from "@/lib/menu";
import MacroRing from "./MacroRing";
import { Plus } from "./Icons";

const dish = stats.topProtein;

const ROWS = [
  { k: "p", letter: "P", word: "Protein", grams: dish.p, from: "Chicken, turkey, tuna, eggs, Greek yogurt.", tone: "text-protein", bar: "bg-protein" },
  { k: "c", letter: "C", word: "Carbs", grams: dish.c, from: "Rice, oats, potatoes, pasta, fruit.", tone: "text-carb", bar: "bg-carb" },
  { k: "f", letter: "F", word: "Fat", grams: dish.f, from: "Avocado, pesto, cheese, seeds.", tone: "text-fat", bar: "bg-fat" },
] as const;

/**
 * "How to read the menu" — the page pins while the ring is drawn one macro at a time:
 * protein, then carbs, then fat, each number counting up beside it, until the plate adds up.
 *
 * Scrub map (timeline time 0 → 4):
 *   0.0–1.0  P arc + P row      1.0–2.0  C arc + C row
 *   2.0–3.0  F arc + F row      3.0–4.0  calories land, the dish and its + button appear
 */
export default function MacroScene() {
  const root = useRef<HTMLElement>(null);
  const { add, qtyOf, setOpen } = useCart();
  const inOrder = qtyOf(dish.id) > 0;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const q = gsap.utils.selector(root);

      mm.add(MQ, (context) => {
        const { reduced } = context.conditions as Conditions;
        if (reduced) return;

        const scene = q(".scene")[0];
        const numbers = q("[data-count]") as HTMLElement[];
        const write = (el: HTMLElement, v: number) => (el.textContent = String(Math.round(v)));
        numbers.forEach((el) => write(el, 0));

        // Arriving: the heading rises and the empty ring turns into place.
        const arrive = { trigger: scene, start: "top 72%" };
        gsap.from(q(".scene-head > *"), { y: 44, autoAlpha: 0, duration: 1.2, stagger: 0.12, ease: "expo.out", scrollTrigger: arrive });
        gsap.from(q(".scene-stage"), { scale: 0.8, rotation: -40, autoAlpha: 0, duration: 1.5, ease: "expo.out", scrollTrigger: arrive });

        // Everything the scrub will light up starts dim.
        gsap.set(q(".scene-row"), { autoAlpha: 0.22 });
        gsap.set(q(".scene-bar"), { scaleX: 0 });
        gsap.set(q(".scene-letter"), { autoAlpha: 0.2 });
        gsap.set(q(".scene-end"), { autoAlpha: 0, y: 18 });
        gsap.set(q(".scene-halo"), { autoAlpha: 0, scale: 0.7 });

        // Pinned while it fits the screen; on very short screens it simply plays as it scrolls past.
        const fits = (scene as HTMLElement).offsetHeight <= window.innerHeight + 2;
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: fits
            ? { trigger: scene, start: "top top", end: "+=230%", pin: true, scrub: 0.7, anticipatePin: 1 }
            : { trigger: scene, start: "top 35%", end: "bottom 95%", scrub: 0.7 },
        });

        const count = (sel: string, at: number, dur = 0.8) => {
          const el = q(sel)[0] as HTMLElement;
          const o = { v: 0 };
          tl.to(o, { v: Number(el.dataset.count), duration: dur, ease: "power1.out", onUpdate: () => write(el, o.v) }, at);
        };

        ROWS.forEach((r, i) => {
          const arc = q(`.scene-ring .arc-${r.k}`)[0] as HTMLElement;
          const len = Number(arc.dataset.len);
          tl.fromTo(arc, { strokeDashoffset: len }, { strokeDashoffset: 0, duration: 0.85, ease: "power1.inOut" }, i + 0.1)
            .to(q(`.scene-row-${r.k}`), { autoAlpha: 1, duration: 0.3 }, i + 0.1)
            .fromTo(q(`.scene-row-${r.k} .scene-row-in`), { x: 26 }, { x: 0, duration: 0.5, ease: "power2.out" }, i + 0.1)
            .to(q(`.scene-row-${r.k} .scene-bar`), { scaleX: 1, duration: 0.8, ease: "power1.inOut" }, i + 0.1)
            .to(q(`.scene-letter-${r.k}`), { autoAlpha: 1, scale: 1.3, duration: 0.25, ease: "power2.out" }, i + 0.1)
            .to(q(`.scene-letter-${r.k}`), { scale: 1, duration: 0.4, ease: "power2.inOut" }, i + 0.4);
          count(`.scene-row-${r.k} [data-count]`, i + 0.1);
        });

        count(".scene-kcal", 3.05, 0.6);
        tl.to(q(".scene-halo"), { autoAlpha: 1, scale: 1, duration: 0.7, ease: "power2.out" }, 3)
          .to(q(".scene-end"), { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.12, ease: "power2.out" }, 3.2)
          .to({}, { duration: 0.35 }); // a beat to take it in before the page moves on

        return () => numbers.forEach((el) => (el.textContent = el.dataset.count ?? ""));
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} id="macros" className="relative bg-ink" aria-labelledby="macros-title">
      {/* Sized to fit one phone screen (browser bars included) so it can pin; roomier from lg up. */}
      <div className="scene relative flex min-h-screen-s items-center overflow-hidden px-5 py-5 lg:px-12 lg:py-16">
        <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 55% 45% at 28% 50%, rgba(221,182,94,0.07), transparent 70%)" }} aria-hidden="true" />

        <div className="relative mx-auto grid w-full max-w-[1300px] items-center gap-y-4 lg:grid-cols-[1fr_1.05fr] lg:gap-x-20">
          {/* The ring */}
          <div className="scene-stage relative mx-auto aspect-square w-[min(54vw,24svh)] lg:w-[min(34vw,60vh)]">
            <div className="scene-halo absolute -inset-[22%]" style={{ background: "radial-gradient(circle, rgba(221,182,94,0.22), transparent 62%)" }} aria-hidden="true" />
            <MacroRing p={dish.p} c={dish.c} f={dish.f} stroke={4.5} className="scene-ring relative h-full w-full" />
            <div className="absolute inset-0 grid place-items-center text-center">
              <div>
                <p className="flex items-center justify-center gap-2.5 font-display text-[15px] leading-none lg:gap-3 lg:text-[1.7vw]" aria-hidden="true">
                  {ROWS.map((r) => (
                    <span key={r.k} className={`scene-letter scene-letter-${r.k} inline-block ${r.tone}`}>
                      {r.letter}
                    </span>
                  ))}
                </p>
                <p className="mt-1 font-display text-[min(12.5vw,5.6svh)] leading-none text-ivory lg:mt-2 lg:text-[7.4vw]">
                  <span className="scene-kcal" data-count={dish.kcal}>
                    {dish.kcal}
                  </span>
                </p>
                <p className="mt-0.5 pl-[0.4em] font-cond text-xs font-semibold uppercase tracking-[0.4em] text-gold lg:text-base">kcal</p>
              </div>
            </div>
          </div>

          {/* The reading */}
          <div>
            <div className="scene-head text-center lg:text-left">
              <p className="font-cond text-xs font-semibold uppercase tracking-[0.42em] text-gold lg:text-[13px]">How to read the menu</p>
              <h2 id="macros-title" className="mt-2 font-serif text-[8.4vw] leading-[1.04] sm:text-5xl lg:mt-4 lg:text-[clamp(44px,4.3vw,72px)]">
                Three numbers on <em className="gold-text pr-[0.08em]">every meal.</em>
              </h2>
            </div>

            <ul className="mt-4 lg:mt-10">
              {ROWS.map((r) => (
                <li key={r.k} className={`scene-row scene-row-${r.k} border-t border-ivory/10 py-2 last:border-b lg:py-5`}>
                  <div className="scene-row-in flex items-center gap-4 lg:gap-6">
                    <span className={`w-8 shrink-0 text-center font-display text-[34px] leading-none lg:w-14 lg:text-[64px] ${r.tone}`} aria-hidden="true">
                      {r.letter}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-sans text-[17px] font-bold leading-tight lg:text-2xl">{r.word}</p>
                      <p className="mt-0.5 hidden text-[15px] leading-snug text-ivory/60 lg:block">{r.from}</p>
                      <span className="mt-1.5 block h-px w-full bg-ivory/10 lg:mt-2">
                        <span className={`scene-bar block h-px w-full origin-left ${r.bar}`} />
                      </span>
                    </div>
                    <p className={`shrink-0 font-cond text-[38px] font-bold leading-none tabular-nums lg:text-[68px] ${r.tone}`}>
                      <span data-count={r.grams}>{r.grams}</span>
                      <span className="ml-1 text-sm font-semibold text-ivory/55 lg:text-xl">g</span>
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <p className="scene-end mt-3 hidden text-center text-[13px] italic leading-snug text-ivory/60 lg:mt-4 lg:block lg:text-left [@media(min-height:740px)]:block">
              *Macros are measured in grams: P (protein), C (carbs) and F (fat).
            </p>

            <div className="scene-end mt-3 flex flex-col items-center gap-2.5 lg:mt-7 lg:flex-row lg:gap-5">
              <p className="text-center text-sm text-ivory/75 lg:text-left">
                On the plate: <strong className="font-bold text-ivory">{dish.name}</strong> · <span className="text-gold">{money(dish.price)}</span>
              </p>
              <button type="button" onClick={() => (inOrder ? setOpen(true) : add(dish.id))} className="btn btn-gold !min-h-11 !px-5">
                {inOrder ? (
                  "In your order"
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5" />
                    Add to order
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
