"use client";

import { useRef } from "react";
import { type Conditions, gsap, MQ, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { money, stats } from "@/lib/menu";
import { helloLink, site } from "@/lib/site";
import GoldDust from "./GoldDust";
import { Arrow, WhatsAppIcon } from "./Icons";
import { SplitChars } from "./SplitText";

/** The three macros sitting on the orbit around the logo. Angle in degrees, 0 = three o'clock. */
const NODES = [
  { k: "P", word: "Protein", angle: -132, tone: "text-protein", label: "right-full mr-2.5" },
  { k: "C", word: "Carbs", angle: -48, tone: "text-carb", label: "left-full ml-2.5" },
  { k: "F", word: "Fat", angle: 90, tone: "text-fat", label: "left-full ml-2.5" },
] as const;

const at = (deg: number) => {
  const a = (deg * Math.PI) / 180;
  return { left: `${(50 + 50 * Math.cos(a)).toFixed(3)}%`, top: `${(50 + 50 * Math.sin(a)).toFixed(3)}%` };
};

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const q = gsap.utils.selector(root);

      mm.add(MQ, (context) => {
        const { desktop, reduced } = context.conditions as Conditions;
        if (reduced) {
          gsap.set(q(".hero-reveal"), { autoAlpha: 1 });
          return;
        }

        // ---- Curtain: the gold ring closes around the mark, then the black lifts ----
        const IN = 1.5; // when the hero itself starts
        const intro = gsap.timeline({ defaults: { ease: "expo.out" } });
        intro
          .fromTo(q(".pre-mark"), { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1, duration: 1 }, 0.05)
          .fromTo(q(".pre-ring"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.15, ease: "power2.inOut" }, 0.05)
          .fromTo(q(".pre-word"), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 0.3)
          .to(q(".pre-inner, .pre-word"), { autoAlpha: 0, y: -24, duration: 0.45, ease: "power2.in" }, 1.15)
          .to(q(".pre"), { yPercent: -100, duration: 0.95, ease: "expo.inOut" }, 1.3)
          .set(q(".pre"), { display: "none" })

          // ---- Hero: halo, orbit, logo out of the dark, then the line from the menu ----
          .set(q(".hero-orbit, .hero-l1, .hero-l2"), { autoAlpha: 1 }, IN)
          .fromTo(q(".hero-glow"), { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 2.6, ease: "power2.out" }, IN)
          .fromTo(q(".hero-ring"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.9, ease: "power3.inOut" }, IN)
          .fromTo(q(".hero-dash"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.6, ease: "power2.out" }, IN + 0.7)
          .fromTo(
            q(".hero-logo"),
            { autoAlpha: 0, scale: 0.84, y: 26, filter: "blur(14px)" },
            { autoAlpha: 1, scale: 1, y: 0, filter: "blur(0px)", duration: 1.7, clearProps: "filter" },
            IN + 0.15
          )
          .fromTo(q(".hero-node"), { autoAlpha: 0, scale: 0 }, { autoAlpha: 1, scale: 1, duration: 0.9, stagger: 0.12, ease: "back.out(2)" }, IN + 0.95)
          .fromTo(q(".hero-l1 .char"), { yPercent: 125 }, { yPercent: 0, duration: 1.1, stagger: 0.028 }, IN + 0.35)
          .fromTo(q(".hero-l2 .char"), { yPercent: 118 }, { yPercent: 0, duration: 1.25, stagger: 0.04 }, IN + 0.5)
          .fromTo(q(".hero-gold"), { yPercent: 118 }, { yPercent: 0, duration: 1.3 }, IN + 0.9)
          .fromTo(q(".hero-gold"), { backgroundPosition: "100% 0" }, { backgroundPosition: "0% 0", duration: 2.6, ease: "power2.inOut" }, IN + 0.95)
          .fromTo(q(".hero-fade"), { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.09 }, IN + 1)
          .fromTo(q(".hero-chrome > *"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2, stagger: 0.1, ease: "power2.out" }, IN + 1.6);

        // ---- Idle life: the macros sway along the orbit and stay upright; the dotted ring turns ----
        const sway = { duration: 9, ease: "sine.inOut", yoyo: true, repeat: -1 };
        const idle = [
          gsap.fromTo(q(".hero-spin"), { rotation: -9 }, { rotation: 9, ...sway }),
          gsap.fromTo(q(".hero-node-in"), { rotation: 9 }, { rotation: -9, ...sway }),
          gsap.to(q(".hero-dash"), { rotation: -360, svgOrigin: "100 100", duration: 180, ease: "none", repeat: -1 }),
          gsap.to(q(".hero-glow-in"), { scale: 1.1, opacity: 0.8, duration: 5, ease: "sine.inOut", yoyo: true, repeat: -1 }),
        ];
        ScrollTrigger.create({
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => idle.forEach((tw) => (self.isActive ? tw.resume() : tw.pause())),
        });

        // ---- Scroll out: copy lifts away, the mark sinks back slower ----
        gsap
          .timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } })
          .to(q(".hero-copy"), { yPercent: -20, autoAlpha: 0 }, 0)
          .to(q(".hero-stage"), { yPercent: 14, scale: 1.06 }, 0)
          .to(q(".hero-chrome"), { autoAlpha: 0, duration: 0.3 }, 0);

        if (desktop) {
          const layers = q("[data-depth]").map((el) => ({
            depth: Number((el as HTMLElement).dataset.depth),
            x: gsap.quickTo(el, "x", { duration: 1.2, ease: "power3.out" }),
            y: gsap.quickTo(el, "y", { duration: 1.2, ease: "power3.out" }),
          }));
          const onMove = (e: PointerEvent) => {
            const nx = e.clientX / window.innerWidth - 0.5;
            const ny = e.clientY / window.innerHeight - 0.5;
            layers.forEach((l) => (l.x(nx * l.depth), l.y(ny * l.depth)));
          };
          window.addEventListener("pointermove", onMove, { passive: true });
          return () => window.removeEventListener("pointermove", onMove);
        }
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} id="top" className="relative flex min-h-screen-s w-full flex-col overflow-hidden bg-ink" aria-label={`${site.name} — ${site.tagline}`}>
      {/* Curtain shown while the page settles (JS only; skipped with reduce-motion) */}
      <div className="preloader pre fixed inset-0 z-[100] place-items-center bg-ink" aria-hidden="true">
        <div className="pre-inner relative grid place-items-center">
          <svg className="h-44 w-44" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="48" stroke="rgba(246,240,228,0.08)" strokeWidth="0.6" />
            <circle className="pre-ring" cx="50" cy="50" r="48" stroke="#DDB65E" strokeWidth="1" strokeLinecap="round" transform="rotate(-90 50 50)" pathLength={1} strokeDasharray="1" strokeDashoffset="1" />
          </svg>
          <img src="/brand/emblem.webp" width={370} height={269} alt="" className="pre-mark invisible absolute w-28" />
        </div>
        <p className="pre-word invisible absolute bottom-[16%] left-0 w-full pl-[0.5em] text-center font-cond text-xs font-semibold uppercase tracking-[0.5em] text-ivory/60">{site.tagline}</p>
      </div>

      {/* Backdrop */}
      <GoldDust className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute inset-0 vignette" aria-hidden="true" />

      <div className="relative z-10 mx-auto grid w-full max-w-[1500px] flex-1 grid-cols-1 content-center items-center gap-y-7 px-5 pb-20 pt-24 short:gap-y-4 short:pb-8 short:pt-20 lg:grid-cols-[1.08fr_1fr] lg:gap-x-10 lg:px-12 lg:pb-24 lg:pt-28">
        {/* Stage: halo, orbit, logo */}
        <div className="hero-stage relative mx-auto aspect-square w-[min(72vw,36svh)] will-change-transform short:w-[min(62vw,30svh)] lg:order-2 lg:w-[min(38vw,64vh)]">
          <div className="absolute inset-0" data-depth="16">
            <div className="hero-glow hero-reveal invisible-pre absolute -inset-[34%]" aria-hidden="true">
              <div className="hero-glow-in h-full w-full" style={{ background: "radial-gradient(circle, rgba(221,182,94,0.26) 0%, rgba(221,182,94,0.08) 38%, transparent 66%)" }} />
            </div>
            <svg className="hero-orbit hero-reveal invisible-pre absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 200 200" fill="none" aria-hidden="true">
              <circle className="hero-dash" cx="100" cy="100" r="90" stroke="rgba(246,240,228,0.22)" strokeWidth="0.5" strokeDasharray="0.6 5" />
              <circle className="hero-ring" cx="100" cy="100" r="99.5" stroke="url(#hero-gold)" strokeWidth="0.9" transform="rotate(-90 100 100)" pathLength={1} strokeDasharray="1" strokeDashoffset="0" />
              <defs>
                <linearGradient id="hero-gold" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#F8E8B6" />
                  <stop offset="0.5" stopColor="#DDB65E" />
                  <stop offset="1" stopColor="#7A5A1E" />
                </linearGradient>
              </defs>
            </svg>
            <div className="hero-spin absolute inset-0" aria-hidden="true">
              {NODES.map((n) => (
                <div key={n.k} className="hero-node hero-reveal invisible-pre absolute -ml-[22px] -mt-[22px] h-11 w-11" style={at(n.angle)}>
                  <div className="hero-node-in relative grid h-full w-full place-items-center rounded-full bg-ink shadow-[0_0_0_1px_rgba(221,182,94,0.55),0_0_26px_-4px_rgba(221,182,94,0.6)]">
                    <span className={`font-display text-[19px] leading-none ${n.tone}`}>{n.k}</span>
                    <span className={`absolute top-1/2 hidden -translate-y-1/2 font-cond text-xs font-semibold uppercase tracking-[0.3em] text-ivory/60 lg:block ${n.label}`}>{n.word}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute inset-0 grid place-items-center" data-depth="-12">
            <img
              src="/brand/logo.webp"
              width={1176}
              height={728}
              alt={site.name}
              fetchPriority="high"
              decoding="async"
              className="hero-logo hero-reveal invisible-pre w-[92%] max-w-none drop-shadow-[0_24px_50px_rgba(0,0,0,0.85)]"
            />
          </div>
        </div>

        {/* Copy */}
        <div className="hero-copy flex flex-col items-center text-center lg:order-1 lg:items-start lg:text-left">
          <p className="hero-fade hero-reveal invisible-pre flex items-center gap-3 font-cond text-[13px] font-semibold uppercase tracking-[0.42em] text-gold">
            <span className="h-px w-8 bg-gold/70" />
            Macro-counted meals
            <span className="h-px w-8 bg-gold/70 lg:hidden" />
          </p>

          <h1 className="sr-only">
            {site.name} — {site.tagline}
          </h1>
          <div className="mt-5 font-display uppercase leading-none" aria-hidden="true">
            <p className="hero-l1 hero-reveal invisible-pre pl-[0.42em] text-[6.2vw] tracking-[0.42em] text-ivory/90 sm:text-[30px] lg:pl-0 lg:text-[clamp(22px,2.05vw,34px)]">
              <SplitChars text="Meals that" />
            </p>
            <p className="hero-l2 hero-reveal invisible-pre mt-3 whitespace-nowrap text-[13.2vw] leading-[0.98] tracking-[0.012em] sm:text-[76px] lg:mt-4 lg:text-[clamp(64px,6.35vw,112px)]">
              <SplitChars text="Fuel your" />{" "}
              <span className="inline-block overflow-hidden pb-[0.08em] -mb-[0.08em] pt-[0.06em] -mt-[0.06em] align-top">
                <span className="hero-gold gold-text inline-block will-change-transform">Goals</span>
              </span>
            </p>
          </div>

          <p className="hero-fade hero-reveal invisible-pre mt-5 max-w-[31rem] text-[15px] leading-relaxed text-ivory/70 short:mt-3 short:leading-snug lg:mt-7 lg:text-[17px]">
            Breakfast, lunch, dinner and snacks — with the protein, carbs and fat already counted for you.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5 short:mt-5 sm:gap-3 lg:justify-start">
            <span className="hero-fade hero-reveal invisible-pre inline-flex">
              <a href="#menu" className="btn btn-gold">
                See the menu
                <Arrow />
              </a>
            </span>
            <span className="hero-fade hero-reveal invisible-pre inline-flex">
              <a href={helloLink} target="_blank" rel="noopener noreferrer" className="btn btn-line">
                <WhatsAppIcon className="h-4 w-4 text-wa" />
                Order now
              </a>
            </span>
          </div>

          <dl className="hero-fade hero-reveal invisible-pre mt-12 hidden gap-9 lg:flex">
            {[
              [String(stats.meals), "meals on the menu"],
              [`${stats.topProtein.p} g`, "protein in one meal"],
              [money(stats.from), "meals start at"],
            ].map(([n, label]) => (
              <div key={label} className="flex flex-col-reverse border-l border-gold/35 pl-4">
                <dt className="mt-1.5 font-cond text-xs font-semibold uppercase tracking-[0.26em] text-ivory/55">{label}</dt>
                <dd className="font-display text-[38px] leading-none text-ivory">{n}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="hero-chrome pointer-events-none absolute inset-0 z-10" aria-hidden="true">
        <div className="hero-reveal invisible-pre absolute left-4 top-1/2 hidden -translate-y-1/2 font-cond text-xs font-semibold uppercase tracking-[0.5em] text-ivory/35 [writing-mode:vertical-rl] 2xl:block">
          P · C · F — counted in grams
        </div>
        <div className="hero-reveal invisible-pre absolute right-4 top-1/2 hidden -translate-y-1/2 font-cond text-xs font-semibold uppercase tracking-[0.5em] text-ivory/35 [writing-mode:vertical-rl] 2xl:block">
          Breakfast — Lunch — Dinner — Snacks
        </div>
        <div className="hero-reveal invisible-pre absolute bottom-5 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2.5 [@media(max-height:800px)]:hidden">
          <span className="pl-[0.5em] font-cond text-xs font-semibold uppercase tracking-[0.5em] text-ivory/55">Scroll</span>
          <span className="relative block h-9 w-px overflow-hidden bg-ivory/15">
            <span className="scroll-tick absolute inset-x-0 top-0 h-1/2 bg-gold" />
          </span>
        </div>
      </div>
    </section>
  );
}
