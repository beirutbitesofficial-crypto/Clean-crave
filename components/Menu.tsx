"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { type Category, type GoalId, goals, type Item, menu, money } from "@/lib/menu";
import { Minus, Plus } from "./Icons";
import MacroRing from "./MacroRing";
import { SplitChars } from "./SplitText";

const MACROS = [
  { k: "p", letter: "P", word: "Protein", tone: "text-protein" },
  { k: "c", letter: "C", word: "Carbs", tone: "text-carb" },
  { k: "f", letter: "F", word: "Fat", tone: "text-fat" },
] as const;

function AddControl({ item }: { item: Item }) {
  const { qtyOf, add, setQty } = useCart();
  const qty = qtyOf(item.id);

  if (item.soldOut) {
    return <span className="inline-flex min-h-11 items-center rounded-full border border-ivory/15 px-4 font-cond text-xs font-semibold uppercase tracking-[0.2em] text-ivory/55">Sold out</span>;
  }
  if (qty === 0) {
    return (
      <button
        type="button"
        onClick={() => add(item.id)}
        aria-label={`Add ${item.name} to your order`}
        className="gold-fill grid h-12 w-12 shrink-0 place-items-center rounded-full text-ink shadow-[0_12px_30px_-12px_rgba(221,182,94,0.9)] transition-transform duration-300 hover:scale-110 active:scale-95"
      >
        <Plus />
      </button>
    );
  }
  return (
    <div className="flex h-12 shrink-0 items-center rounded-full bg-ink shadow-[inset_0_0_0_1px_rgba(221,182,94,0.6)]">
      <button type="button" onClick={() => setQty(item.id, qty - 1)} aria-label={`One less ${item.name}`} className="grid h-12 w-11 place-items-center rounded-full text-gold">
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span key={qty} className="pop w-5 text-center font-cond text-lg font-bold tabular-nums" aria-live="polite" aria-label={`${qty} in your order`}>
        {qty}
      </span>
      <button type="button" onClick={() => setQty(item.id, qty + 1)} aria-label={`One more ${item.name}`} className="grid h-12 w-11 place-items-center rounded-full text-gold">
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function MealCard({ item }: { item: Item }) {
  const inOrder = useCart().qtyOf(item.id) > 0;

  const spot = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    const box = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - box.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - box.top}px`);
  };

  return (
    <article className="meal relative flex flex-col rounded-[24px] p-4 sm:p-5" data-in-order={inOrder} onPointerMove={spot}>
      <div className="relative flex items-start gap-4">
        {/* The ring: grams of protein / carbs / fat. Calories — or the photo — sit inside. */}
        <div className="relative h-[88px] w-[88px] shrink-0 sm:h-[100px] sm:w-[100px]">
          <MacroRing p={item.p} c={item.c} f={item.f} stroke={item.img ? 5 : 7} className="meal-ring h-full w-full" decorative />
          {item.img ? (
            <img src={`/menu/${item.img}.webp`} alt="" loading="lazy" decoding="async" className="absolute inset-[11%] h-[78%] w-[78%] rounded-full object-cover" />
          ) : (
            <p className="absolute inset-0 grid place-content-center text-center">
              <span className="font-cond text-[28px] font-bold leading-[0.9] tabular-nums text-ivory sm:text-[32px]">{item.kcal}</span>
              <span className="font-cond text-[12px] font-semibold uppercase tracking-[0.22em] text-gold">kcal</span>
            </p>
          )}
        </div>

        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex items-start justify-between gap-3">
            <h4 className="font-sans text-[17px] font-bold leading-[1.22] sm:text-[19px]">{item.name}</h4>
            <p className="shrink-0 font-display text-[23px] leading-none text-gold sm:text-[26px]">{money(item.price)}</p>
          </div>
          <p className="mt-1.5 font-cond text-[15.5px] font-medium leading-[1.32] text-ivory/65 sm:text-base">{item.desc}</p>
          {item.img && <p className="mt-1.5 font-cond text-sm font-semibold uppercase tracking-[0.2em] text-gold">{item.kcal} kcal</p>}
        </div>
      </div>

      <div className="relative mt-auto flex items-end gap-3 pt-4">
        <dl className="grid flex-1 grid-cols-3 border-t border-ivory/10 pt-3">
          {MACROS.map((m) => (
            <div key={m.k} className="border-l border-ivory/10 pl-3 first:border-0 first:pl-0 sm:pl-4">
              <dt className="flex items-baseline gap-1.5 font-cond text-xs font-semibold uppercase tracking-[0.16em] text-ivory/60">
                <span className={`font-display text-[15px] leading-none tracking-normal ${m.tone}`} aria-hidden="true">
                  {m.letter}
                </span>
                {m.word}
              </dt>
              <dd className={`mt-1 font-cond text-[30px] font-bold leading-none tabular-nums ${m.tone}`}>
                {item[m.k]}
                <span className="ml-0.5 text-[13px] font-semibold text-ivory/55">g</span>
              </dd>
            </div>
          ))}
        </dl>
        <AddControl item={item} />
      </div>
    </article>
  );
}

function CategoryBlock({ cat, items, index }: { cat: Category; items: Item[]; index: number }) {
  const kcals = items.map((i) => i.kcal);
  const lo = Math.min(...kcals);
  const hi = Math.max(...kcals);
  const top = Math.max(...items.map((i) => i.p));

  return (
    <section id={`cat-${cat.id}`} data-cat={cat.id} className="scroll-mt-20 pt-16 md:pt-24" aria-labelledby={`cat-${cat.id}-title`}>
      <div className="grid gap-7 xl:grid-cols-[330px_minmax(0,1fr)] xl:gap-14">
        <header className="cat-head xl:sticky xl:top-28 xl:self-start">
          <p className="cat-meta flex items-center gap-3 font-cond text-[13px] font-semibold uppercase tracking-[0.4em] text-gold/80">
            {String(index + 1).padStart(2, "0")}
            <span className="cat-line h-px w-10 origin-left bg-gold/60" />
            {String(menu.length).padStart(2, "0")}
          </p>
          <h3 id={`cat-${cat.id}-title`} className="mt-2 font-display text-[19vw] uppercase leading-[0.92] tracking-[0.01em] sm:text-[112px] xl:text-[78px]">
            <span className="sr-only">{cat.title}</span>
            <span aria-hidden="true">
              <SplitChars text={cat.title} className="cat-title" charClass="gold-text" />
            </span>
          </h3>
          <p className="cat-meta mt-1 font-serif text-2xl italic text-ivory/75 md:text-[28px]">{cat.script}</p>
          <p className="cat-meta mt-3 font-cond text-[13px] font-semibold uppercase tracking-[0.2em] text-ivory/55">
            {items.length} {items.length === 1 ? "meal" : "meals"} · {lo === hi ? lo : `${lo}–${hi}`} kcal · up to {top} g protein
          </p>
        </header>

        <div className="grid gap-3 md:grid-cols-2 md:gap-4">
          {items.map((it) => (
            <MealCard key={it.id} item={it} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Menu() {
  const root = useRef<HTMLElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [goal, setGoal] = useState<GoalId>("all");
  const [active, setActive] = useState(menu[0].id);

  const shown = useMemo(() => {
    const test = goals.find((g) => g.id === goal)!.test;
    return menu.map((cat, index) => ({ cat, index, items: cat.items.filter(test) })).filter((x) => x.items.length);
  }, [goal]);
  const total = shown.reduce((n, x) => n + x.items.length, 0);

  // Highlight the category in view.
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-cat]"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive((e.target as HTMLElement).dataset.cat!);
        });
      },
      { rootMargin: "-30% 0px -65% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [shown]);

  // Keep the active chip visible in the bar.
  useEffect(() => {
    const b = bar.current;
    const chip = b?.querySelector<HTMLElement>(`[data-chip="${active}"]`);
    if (!b || !chip) return;
    b.scrollTo({ left: chip.offsetLeft - b.clientWidth / 2 + chip.clientWidth / 2, behavior: "smooth" });
  }, [active]);

  // Scroll reveals. Re-run when the filter changes so the new set of cards deals itself in again.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const q = gsap.utils.selector(root);

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(q(".menu-head > *"), { y: 46, autoAlpha: 0, duration: 1.2, stagger: 0.1, ease: "expo.out", scrollTrigger: { trigger: q(".menu-head")[0], start: "top 82%" } });

        (q(".cat-head") as HTMLElement[]).forEach((head) => {
          const h = gsap.utils.selector(head);
          gsap
            .timeline({ defaults: { ease: "expo.out" }, scrollTrigger: { trigger: head, start: "top 86%" } })
            .from(h(".cat-title .char"), { yPercent: 118, duration: 1.2, stagger: 0.035 }, 0)
            .from(h(".cat-line"), { scaleX: 0, duration: 1 }, 0.15)
            .from(h(".cat-meta"), { autoAlpha: 0, y: 16, duration: 1, stagger: 0.08 }, 0.25);
        });

        // Cards rise in rows; each ring draws its three arcs as the card lands.
        const cards = q(".meal");
        gsap.set(cards, { autoAlpha: 0, y: 46 });
        const lenOf = (arc: Element) => Number((arc as HTMLElement).dataset.len);
        gsap.set(q(".meal .ring-arc"), { strokeDashoffset: (_i: number, arc: Element) => lenOf(arc) });
        ScrollTrigger.batch(cards, {
          start: "top 92%",
          once: true,
          onEnter: (batch) =>
            batch.forEach((card, i) => {
              const delay = i * 0.09;
              gsap.to(card, { autoAlpha: 1, y: 0, duration: 1.1, delay, ease: "expo.out", clearProps: "transform" });
              gsap.to(card.querySelectorAll(".ring-arc"), { strokeDashoffset: 0, duration: 1.1, delay: delay + 0.2, stagger: 0.16, ease: "power2.inOut" });
            }),
        });
      });

      // The page below just changed height — put every scroll trigger back where it belongs.
      ScrollTrigger.refresh();
      return () => mm.revert();
    },
    { scope: root, dependencies: [goal], revertOnUpdate: true }
  );

  return (
    <section ref={root} id="menu" className="relative bg-ink px-5 pb-28 pt-24 md:px-12 md:pb-36 md:pt-32" aria-labelledby="menu-title">
      <div className="menu-head mx-auto flex max-w-[1400px] flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-cond text-[13px] font-semibold uppercase tracking-[0.42em] text-gold">Breakfast · Lunch · Dinner · Snacks</p>
          <h2 id="menu-title" className="mt-3 font-serif text-[17vw] leading-[0.95] sm:text-[104px] lg:text-[clamp(96px,8vw,136px)]">
            The <em className="gold-text pr-[0.1em]">Menu</em>
          </h2>
        </div>

        <div className="lg:max-w-[440px]">
          {/* Legend — as on the printed menu */}
          <div className="flex items-center gap-5">
            <p className="font-cond text-sm font-semibold uppercase tracking-[0.3em] text-ivory/70">
              Macros<span className="text-gold">*</span>
            </p>
            <ul className="flex gap-4">
              {MACROS.map((m) => (
                <li key={m.k} className="flex items-baseline gap-1.5">
                  <span className={`font-display text-[28px] leading-none ${m.tone}`} aria-hidden="true">
                    {m.letter}
                  </span>
                  <span className="font-cond text-[13px] font-semibold uppercase tracking-[0.18em] text-ivory/60">{m.word}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-3 text-[13px] italic leading-relaxed text-ivory/60">
            *Macros are measured in <strong className="font-bold text-ivory/85">grams</strong> and include: <strong className="font-bold text-ivory/85">P</strong> (protein), <strong className="font-bold text-ivory/85">C</strong> (carbs) and{" "}
            <strong className="font-bold text-ivory/85">F</strong> (fat).
          </p>
        </div>
      </div>

      {/* What are you eating for? */}
      <div className="mx-auto mt-9 flex max-w-[1400px] flex-wrap items-center gap-2" role="group" aria-label="Filter the menu">
        <span className="mr-2 font-cond text-[13px] font-semibold uppercase tracking-[0.3em] text-ivory/55">Show me</span>
        {goals.map((g) => (
          <button
            key={g.id}
            type="button"
            aria-pressed={goal === g.id}
            onClick={() => setGoal(g.id)}
            className={`min-h-11 rounded-full px-4 font-cond text-[15px] font-semibold uppercase tracking-[0.14em] transition-colors duration-300 ${
              goal === g.id ? "gold-fill text-ink" : "text-ivory/75 shadow-[inset_0_0_0_1px_rgba(246,240,228,0.16)] hover:text-gold hover:shadow-[inset_0_0_0_1px_rgba(221,182,94,0.6)]"
            }`}
          >
            {g.label}
          </button>
        ))}
        <span className="ml-auto hidden font-cond text-[13px] font-semibold uppercase tracking-[0.3em] text-ivory/55 sm:block" aria-live="polite">
          {total} {total === 1 ? "meal" : "meals"}
        </span>
      </div>

      {/* Sticky category bar */}
      <div className="sticky top-0 z-30 -mx-5 mt-7 border-y border-ivory/10 bg-ink/85 backdrop-blur-md md:-mx-12">
        <div ref={bar} className="no-scrollbar mx-auto flex max-w-[1400px] gap-1.5 overflow-x-auto px-5 py-2.5 md:px-12">
          {shown.map(({ cat, items }) => (
            <a
              key={cat.id}
              data-chip={cat.id}
              href={`#cat-${cat.id}`}
              aria-current={active === cat.id ? "true" : undefined}
              className={`flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-xs font-bold uppercase tracking-[0.2em] transition-colors duration-300 ${active === cat.id ? "bg-ivory text-ink" : "text-ivory/65 hover:text-ivory"}`}
            >
              {cat.title}
              <span className={`font-cond text-[13px] tracking-normal ${active === cat.id ? "text-ink/60" : "text-gold/80"}`}>{items.length}</span>
            </a>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-[1400px]">
        {shown.map(({ cat, items, index }) => (
          <CategoryBlock key={cat.id} cat={cat} items={items} index={index} />
        ))}
      </div>
    </section>
  );
}
