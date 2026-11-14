"use client";

import { useRef } from "react";
import { useCart } from "@/lib/cart";
import { type Conditions, gsap, MQ, useGSAP } from "@/lib/gsap";
import { useLang } from "@/lib/i18n";
import { useContent } from "@/lib/content";

import { WhatsAppIcon } from "./Icons";
import { SplitWords } from "./SplitText";

/** The gold page: one job — get the order onto WhatsApp. */
export default function Order() {
  const root = useRef<HTMLElement>(null);
  const { count, setOpen } = useCart();
  const { t, lang } = useLang();
  const { contact, whatsappLink } = useContent();
  const helloLink = whatsappLink(t.wa.hello);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const q = gsap.utils.selector(root);

      mm.add(MQ, (context) => {
        const { desktop, reduced } = context.conditions as Conditions;
        if (reduced) return;

        gsap
          .timeline({ defaults: { ease: "expo.out" }, scrollTrigger: { trigger: root.current, start: "top 68%" } })
          .from(q(".order-eyebrow"), { autoAlpha: 0, y: 16, duration: 1 }, 0)
          .from(q(".order-title .word"), { yPercent: 115, duration: 1.4, stagger: 0.09 }, 0.05)
          .from(q(".order-fade"), { opacity: 0, y: 28, duration: 1.1, stagger: 0.1 }, 0.45);

        // Rings drift at different speeds behind the words.
        (q(".order-ring") as HTMLElement[]).forEach((ring, i) => {
          gsap.fromTo(ring, { yPercent: 18 + i * 14, rotation: -30 }, { yPercent: -18 - i * 14, rotation: 40, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } });
        });

        // The button leans toward the pointer.
        if (desktop) {
          const btn = q(".order-magnet")[0] as HTMLElement;
          const x = gsap.quickTo(btn, "x", { duration: 0.7, ease: "power3.out" });
          const y = gsap.quickTo(btn, "y", { duration: 0.7, ease: "power3.out" });
          const move = (e: PointerEvent) => {
            const b = btn.getBoundingClientRect();
            x((e.clientX - (b.left + b.width / 2)) * 0.28);
            y((e.clientY - (b.top + b.height / 2)) * 0.28);
          };
          const leave = () => (x(0), y(0));
          const zone = q(".order-zone")[0];
          zone.addEventListener("pointermove", move as EventListener);
          zone.addEventListener("pointerleave", leave);
          return () => {
            zone.removeEventListener("pointermove", move as EventListener);
            zone.removeEventListener("pointerleave", leave);
          };
        }
      });

      return () => mm.revert();
    },
    { scope: root, dependencies: [lang], revertOnUpdate: true }
  );

  return (
    <section ref={root} id="order" className="gold-fill relative overflow-hidden px-5 py-24 text-ink md:px-12 md:py-36" aria-labelledby="order-title">
      {/* Macro rings, oversized, as a watermark */}
      <svg className="order-ring pointer-events-none absolute -right-[26vw] -top-[18vw] h-[78vw] w-[78vw] md:-right-[12vw] md:-top-[14vw] md:h-[52vw] md:w-[52vw]" viewBox="0 0 100 100" fill="none" aria-hidden="true">
        <circle cx="50" cy="50" r="46" stroke="rgba(7,6,5,0.13)" strokeWidth="5" strokeDasharray="150 8 90 8 33 8" />
      </svg>
      <svg className="order-ring pointer-events-none absolute -bottom-[30vw] -left-[24vw] h-[70vw] w-[70vw] md:-bottom-[20vw] md:-left-[10vw] md:h-[38vw] md:w-[38vw]" viewBox="0 0 100 100" fill="none" aria-hidden="true">
        <circle cx="50" cy="50" r="46" stroke="rgba(7,6,5,0.09)" strokeWidth="2.5" strokeDasharray="120 6 110 6 47 6" />
      </svg>

      <div className="relative mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-[1.25fr_1fr] lg:items-end">
        <div>
          <p className="order-eyebrow font-cond text-[13px] font-bold uppercase tracking-[0.42em] text-ink/75 rtl:text-lg">{t.order.eyebrow}</p>
          <h2 id="order-title" className="order-title mt-3 font-serif text-[19vw] leading-[0.9] sm:text-[132px] lg:text-[clamp(120px,11.5vw,196px)] rtl:mt-6 rtl:font-bold rtl:leading-[1.2] rtl:lg:mt-10">
            <span className="sr-only">
              {t.order.l1} {t.order.l2}
            </span>
            <span aria-hidden="true">
              <SplitWords text={t.order.l1} />
              <br />
              <SplitWords text={t.order.l2} wordClass="italic pe-[0.06em]" />
            </span>
          </h2>
        </div>

        <div className="order-zone lg:pb-5">
          <p className="order-fade max-w-[26rem] text-lg leading-relaxed text-ink/85 rtl:text-xl rtl:leading-relaxed">{t.order.text}</p>
          <div className="order-fade mt-7">
            <a href={helloLink} target="_blank" rel="noopener noreferrer" className="order-magnet btn btn-ink !min-h-16 !px-8 !text-[13px]">
              <WhatsAppIcon className="h-5 w-5 text-wa" />
              {t.orderNow}
            </a>
          </div>
          <p className="order-fade mt-7 font-display text-[11.5vw] leading-none tracking-[0.01em] sm:text-6xl lg:text-[clamp(46px,4.2vw,68px)]">
            <a href={helloLink} target="_blank" rel="noopener noreferrer" dir="ltr" lang="en" className="inline-block underline-offset-[0.14em] hover:underline">
              {contact.phone}
            </a>
          </p>
          <div className="order-fade mt-6 flex flex-wrap gap-2">
            <a href="#menu" className="inline-flex min-h-11 items-center rounded-full border border-ink/35 px-5 text-xs font-extrabold uppercase tracking-[0.22em] transition-colors hover:bg-ink hover:text-ivory rtl:text-base">
              {t.backToMenu}
            </a>
            {count > 0 && (
              <button type="button" onClick={() => setOpen(true)} className="inline-flex min-h-11 items-center rounded-full border border-ink/35 px-5 text-xs font-extrabold uppercase tracking-[0.22em] transition-colors hover:bg-ink hover:text-ivory rtl:text-base">
                {t.order.review} · {count}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
