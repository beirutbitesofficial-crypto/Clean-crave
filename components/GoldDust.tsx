"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

type Mote = { x: number; y: number; r: number; vy: number; sway: number; ph: number; sp: number; a: number };

/**
 * Gold dust rising through the dark — a single canvas, drawn only while it is on screen.
 * Fewer motes on phones and low-power devices; nothing at all with "reduce motion".
 */
export default function GoldDust({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const small = window.matchMedia("(max-width: 767px)").matches;
    const lowPower = (navigator.hardwareConcurrency || 8) <= 4;
    const count = small || lowPower ? 34 : 84;

    let w = 0;
    let h = 0;
    let t = 0;
    let running = false;
    let visible = true;

    const seed = (m: Mote, fresh: boolean) => {
      m.x = Math.random() * w;
      m.y = fresh ? Math.random() * h : h + 12;
      m.r = Math.random() ** 2 * 1.9 + 0.5;
      m.vy = 7 + Math.random() * 24;
      m.sway = 6 + Math.random() * 20;
      m.ph = Math.random() * Math.PI * 2;
      m.sp = 0.3 + Math.random() * 0.9;
      m.a = 0.14 + Math.random() * 0.6;
      return m;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const box = canvas.getBoundingClientRect();
      w = box.width;
      h = box.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const motes = Array.from({ length: count }, () => seed({} as Mote, true));

    const tick = (_time: number, delta: number) => {
      const dt = Math.min(delta, 50) / 1000;
      t += dt;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = "#F2D48A";
      for (const m of motes) {
        m.y -= m.vy * dt;
        if (m.y < -12) seed(m, false);
        const x = m.x + Math.sin(t * m.sp + m.ph) * m.sway;
        const twinkle = 0.55 + 0.45 * Math.sin(t * m.sp * 2.3 + m.ph);
        // Fade in from the floor and out before the ceiling.
        const edge = Math.min(1, m.y / (h * 0.3), (h - m.y) / (h * 0.14));
        ctx.globalAlpha = Math.max(0, m.a * twinkle * edge);
        ctx.beginPath();
        ctx.arc(x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const sync = () => {
      const want = visible && !document.hidden;
      if (want === running) return;
      running = want;
      if (want) gsap.ticker.add(tick);
      else gsap.ticker.remove(tick);
    };

    const io = new IntersectionObserver(([e]) => ((visible = e.isIntersecting), sync()));
    io.observe(canvas);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    document.addEventListener("visibilitychange", sync);
    sync();

    return () => {
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", sync);
      gsap.ticker.remove(tick);
    };
  }, []);

  return <canvas ref={ref} className={`pointer-events-none ${className}`} aria-hidden="true" />;
}
