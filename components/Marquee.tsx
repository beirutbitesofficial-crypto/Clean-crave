"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { Spark } from "./Icons";

const WORDS = ["Breakfast", "Protein", "Lunch", "Carbs", "Dinner", "Fat", "Snacks", "Counted in grams"];

/** A band of gold lettering that drifts on its own and surges with the scroll. */
export default function Marquee() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const track = root.current!.querySelector(".mq-track");
        const drift = gsap.to(track, { xPercent: -50, duration: 38, ease: "none", repeat: -1 });
        const settle = (speed: number) => gsap.to(drift, { timeScale: speed, duration: 0.9, ease: "power2.out", overwrite: true });
        const skew = gsap.quickTo(track, "skewX", { duration: 0.5, ease: "power3.out" });
        ScrollTrigger.create({
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => (self.isActive ? drift.resume() : drift.pause()),
          onUpdate: (self) => {
            const v = self.getVelocity();
            settle(1 + Math.min(Math.abs(v) / 260, 7));
            skew(gsap.utils.clamp(-7, 7, v / -420));
          },
        });
        // Fall back to cruising speed once the scroll stops.
        const calm = () => (settle(1), skew(0));
        ScrollTrigger.addEventListener("scrollEnd", calm);
        return () => ScrollTrigger.removeEventListener("scrollEnd", calm);
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <div ref={root} className="relative overflow-hidden bg-ink py-7 md:py-10" aria-hidden="true">
      <div className="hairline absolute inset-x-0 top-0 h-px" />
      <div className="hairline absolute inset-x-0 bottom-0 h-px" />
      <div className="mq-track flex w-max will-change-transform">
        {[0, 1].map((r) => (
          <div key={r} className="flex shrink-0 items-center">
            {WORDS.map((w, i) => (
              <span key={w} className="flex items-center">
                <span className={`whitespace-nowrap px-6 font-display text-[11vw] uppercase leading-none tracking-[0.02em] md:px-10 md:text-[5vw] ${i % 2 ? "outline-gold" : "text-ivory"}`}>{w}</span>
                <Spark className="h-4 w-4 shrink-0 text-gold md:h-6 md:w-6" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
