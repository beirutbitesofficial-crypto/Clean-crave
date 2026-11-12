"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useLang } from "@/lib/i18n";
import { stats } from "@/lib/menu";
import { site } from "@/lib/site";
import { SplitWords } from "./SplitText";

/** Drops the phone number into a sentence, kept left-to-right so its groups never swap places in Arabic. */
function withPhone(text: string) {
  if (!text.includes("{phone}")) return text;
  const [before, after] = text.split("{phone}");
  return (
    <>
      {before}
      <span dir="ltr" lang="en" className="whitespace-nowrap">
        {site.phone}
      </span>
      {after}
    </>
  );
}

/** The numbers, then how ordering works — a gold line draws itself through the three steps as you scroll. */
export default function Steps() {
  const root = useRef<HTMLElement>(null);
  const { t, lang, name } = useLang();

  const facts = [
    { value: stats.meals, prefix: "", unit: "", label: t.steps.facts.meals },
    { value: stats.topProtein.p, prefix: "", unit: t.g, label: t.steps.facts.protein(name(stats.topProtein)) },
    { value: stats.lightest, prefix: "", unit: "", label: t.steps.facts.lightest },
    { value: stats.from, prefix: "$", unit: "", label: t.steps.facts.from },
  ];

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const q = gsap.utils.selector(root);

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Facts count up from zero.
        const facts = q(".fact");
        gsap.from(facts, { autoAlpha: 0, y: 30, duration: 1.1, stagger: 0.1, ease: "expo.out", scrollTrigger: { trigger: q(".facts")[0], start: "top 86%" } });
        (q("[data-count]") as HTMLElement[]).forEach((el, i) => {
          const to = Number(el.dataset.count);
          const o = { v: 0 };
          el.textContent = "0";
          gsap.to(o, {
            v: to,
            duration: 1.8,
            delay: i * 0.1,
            ease: "power3.out",
            scrollTrigger: { trigger: q(".facts")[0], start: "top 86%" },
            onUpdate: () => (el.textContent = String(Math.round(o.v))),
            onComplete: () => (el.textContent = el.dataset.count!),
          });
        });

        gsap
          .timeline({ defaults: { ease: "expo.out" }, scrollTrigger: { trigger: q(".steps-head")[0], start: "top 82%" } })
          .from(q(".steps-eyebrow"), { autoAlpha: 0, y: 16, duration: 1 }, 0)
          .from(q(".steps-head .word"), { yPercent: 115, duration: 1.3, stagger: 0.06 }, 0.1);

        gsap.fromTo(q(".steps-line"), { scaleX: 0, scaleY: 0 }, { scaleX: 1, scaleY: 1, ease: "none", scrollTrigger: { trigger: q(".steps-list")[0], start: "top 78%", end: "bottom 62%", scrub: 0.6 } });
        (q(".step") as HTMLElement[]).forEach((step) => {
          gsap
            .timeline({ defaults: { ease: "expo.out" }, scrollTrigger: { trigger: step, start: "top 84%" } })
            .from(step.querySelector(".step-n"), { yPercent: 60, autoAlpha: 0, duration: 1.2 }, 0)
            .from(step.querySelectorAll(".step-copy > *"), { y: 24, autoAlpha: 0, duration: 1, stagger: 0.1 }, 0.15)
            .from(step.querySelector(".step-dot"), { scale: 0, duration: 0.8, ease: "back.out(3)" }, 0.1);
        });

        return () => (q("[data-count]") as HTMLElement[]).forEach((el) => (el.textContent = el.dataset.count ?? ""));
      });

      return () => mm.revert();
    },
    { scope: root, dependencies: [lang], revertOnUpdate: true }
  );

  return (
    <section ref={root} className="relative overflow-hidden bg-ink-2 px-5 py-24 md:px-12 md:py-36" aria-labelledby="steps-title">
      <div className="hairline absolute inset-x-0 top-0 h-px" aria-hidden="true" />

      <dl className="facts mx-auto grid max-w-[1400px] grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
        {facts.map((f) => (
          <div key={f.label} className="fact flex flex-col-reverse justify-end border-s border-gold/40 ps-4 md:ps-6">
            <dt className="mt-2 max-w-[15rem] font-cond text-sm font-semibold uppercase leading-snug tracking-[0.18em] text-ivory/60 rtl:text-base rtl:leading-normal">{f.label}</dt>
            <dd className="font-display text-[17vw] leading-[0.9] text-ivory sm:text-[92px] lg:text-[clamp(72px,7vw,116px)]">
              <span className="gold-text">
                {f.prefix}
                <span data-count={f.value}>{f.value}</span>
              </span>
              {f.unit && <span className="ms-[0.18em] text-[0.42em] text-ivory/70">{f.unit}</span>}
            </dd>
          </div>
        ))}
      </dl>

      <div className="steps-head mx-auto mt-24 max-w-[1400px] md:mt-36">
        <p className="steps-eyebrow font-cond text-[13px] font-semibold uppercase tracking-[0.42em] text-gold rtl:text-base">{t.steps.eyebrow}</p>
        <h2 id="steps-title" className="mt-3 font-serif text-[11.5vw] leading-[1] sm:text-6xl lg:text-[clamp(60px,5.6vw,92px)] rtl:mt-1 rtl:leading-[1.35]">
          <span className="sr-only">
            {t.steps.title} {t.steps.titleEm}
          </span>
          <span aria-hidden="true">
            <SplitWords text={t.steps.title} /> <SplitWords text={t.steps.titleEm} wordClass="gold-text italic pe-[0.08em]" />
          </span>
        </h2>
      </div>

      <ol className="steps-list relative mx-auto mt-12 grid max-w-[1400px] gap-10 md:mt-20 md:grid-cols-3 md:gap-8">
        {/* The line: runs down the side on phones, across the top on wider screens. */}
        <span className="steps-line absolute start-[5px] top-2 h-[calc(100%-1rem)] w-px origin-top bg-gradient-to-b from-gold via-gold/60 to-gold/10 md:start-0 md:top-[5px] md:h-px md:w-full md:origin-left md:bg-gradient-to-r rtl:md:origin-right rtl:md:bg-gradient-to-l" aria-hidden="true" />
        {t.steps.list.map((s, i) => (
          <li key={i} className="step relative ps-9 md:ps-0 md:pt-12">
            <span className="step-dot absolute start-0 top-2 h-[11px] w-[11px] rounded-full bg-gold shadow-[0_0_0_5px_rgba(221,182,94,0.16)] md:top-0" aria-hidden="true" />
            <p className="step-n outline-gold font-display text-[84px] leading-[0.85] md:text-[clamp(96px,9vw,150px)]" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </p>
            <div className="step-copy mt-4">
              <h3 className="font-serif text-[28px] leading-tight md:text-[34px] rtl:leading-snug">{s.title}</h3>
              <p className="mt-2 max-w-[24rem] text-base leading-relaxed text-ivory/70 rtl:text-[17px]">{withPhone(s.text)}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
