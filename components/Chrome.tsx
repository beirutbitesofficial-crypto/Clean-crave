"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

/**
 * Page-level motion plumbing: the gold reading-progress hairline at the top of the screen,
 * and a watcher that re-measures every scroll trigger whenever the page changes height
 * (fonts landing, the menu being filtered, a phone rotating).
 */
export default function Chrome() {
  const bar = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(bar.current, { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });
  });

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let last = document.body.offsetHeight;
    const ro = new ResizeObserver(() => {
      const now = document.body.offsetHeight;
      if (Math.abs(now - last) < 2) return;
      last = now;
      clearTimeout(timer);
      timer = setTimeout(() => ScrollTrigger.refresh(), 200);
    });
    ro.observe(document.body);
    return () => {
      clearTimeout(timer);
      ro.disconnect();
    };
  }, []);

  return <div ref={bar} className="gold-fill pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] origin-left scale-x-0" aria-hidden="true" />;
}
