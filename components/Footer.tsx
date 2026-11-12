"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { helloLink, site } from "@/lib/site";
import { WhatsAppIcon } from "./Icons";

const LINKS = [
  ["Macros", "#macros"],
  ["Menu", "#menu"],
  ["Order", "#order"],
  ["Top", "#top"],
] as const;

/** Closing signature: the name in hollow letters, poured full of gold as the page ends. */
export default function Footer() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const q = gsap.utils.selector(root);
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          q(".sig-fill"),
          { clipPath: "inset(0 100% 0 0)" },
          { clipPath: "inset(0 0% 0 0)", ease: "none", scrollTrigger: { trigger: q(".sig")[0], start: "top 96%", end: "bottom 78%", scrub: 0.8 } }
        );
        gsap.from(q(".foot-fade"), { autoAlpha: 0, y: 22, duration: 1.1, stagger: 0.08, ease: "expo.out", scrollTrigger: { trigger: root.current, start: "top 85%" } });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <footer ref={root} className="relative overflow-hidden bg-ink px-5 pb-28 pt-16 md:px-12 md:pb-10 md:pt-24">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <div className="foot-fade">
          <img src="/brand/logo.webp" width={1176} height={728} alt={site.name} loading="lazy" decoding="async" className="-ml-3 w-56 md:w-72" />
          <p className="mt-3 pl-[0.2em] font-cond text-[13px] font-semibold uppercase tracking-[0.5em] text-ivory/60">{site.tagline}</p>
        </div>

        <div className="flex flex-col gap-6 md:items-end">
          <a href={helloLink} target="_blank" rel="noopener noreferrer" className="foot-fade inline-flex min-h-11 items-center gap-3 self-start text-ivory transition-colors hover:text-gold md:self-end">
            <WhatsAppIcon className="h-5 w-5 text-wa" />
            <span className="font-cond text-sm font-semibold uppercase tracking-[0.3em] text-gold">Order now</span>
            <span dir="ltr" className="font-display text-2xl leading-none tracking-[0.02em]">
              {site.phone}
            </span>
          </a>
          <nav aria-label="Footer" className="foot-fade">
            <ul className="flex flex-wrap gap-x-7 gap-y-1 text-xs font-bold uppercase tracking-[0.3em] text-ivory/65">
              {LINKS.map(([label, href]) => (
                <li key={label}>
                  <a href={href} className="inline-flex min-h-11 items-center transition-colors hover:text-gold">
                    {label}
                  </a>
                </li>
              ))}
              {site.instagram && (
                <li>
                  <a href={site.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center transition-colors hover:text-gold">
                    Instagram
                  </a>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </div>

      <div className="sig relative mx-auto mt-12 max-w-[1400px] select-none md:mt-16" aria-hidden="true">
        <p className="outline-gold whitespace-nowrap text-center font-display text-[20.5vw] uppercase leading-[0.9] tracking-[0.01em] min-[1500px]:text-[306px]">CleanCrave</p>
        <p className="sig-fill gold-text absolute inset-0 whitespace-nowrap text-center font-display text-[20.5vw] uppercase leading-[0.9] tracking-[0.01em] min-[1500px]:text-[306px]">CleanCrave</p>
      </div>

      <div className="mx-auto mt-8 flex max-w-[1400px] flex-wrap items-center justify-between gap-3 border-t border-ivory/10 pt-6 font-cond text-[13px] font-semibold uppercase tracking-[0.3em] text-ivory/55">
        <span>
          © {new Date().getFullYear()} {site.name}
        </span>
        <span>Macros measured in grams · P protein · C carbs · F fat</span>
      </div>
    </footer>
  );
}
