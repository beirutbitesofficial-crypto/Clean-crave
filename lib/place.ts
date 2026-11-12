"use client";

import { gsap, ScrollTrigger } from "./gsap";

/**
 * Keeps the reader where they are while the page is rebuilt underneath them.
 *
 * Switching language changes the height of almost everything (Arabic wraps differently, and the pinned
 * scene is taken apart and put back). Call `holdPlace()` just before the change: it remembers the meal
 * or section sitting at the top of the screen. Call the function it returns right after the change and
 * the page is scrolled so that same meal is back in the same spot.
 */
export function holdPlace() {
  const line = 180; // px from the top of the screen — just under the menu's sticky bar
  // Where the element sits on screen, ignoring any rise-in offset an animation has put on it.
  const topOf = (el: Element) => el.getBoundingClientRect().top - (Number(gsap.getProperty(el, "y")) || 0);

  let anchor: Element | null = null;
  let was = -Infinity;
  document.querySelectorAll(".meal, [data-cat], main > section, main > div, footer").forEach((el) => {
    const top = topOf(el);
    if (top <= line && top > was) {
      anchor = el;
      was = top;
    }
  });

  return () => {
    if (!anchor || !anchor.isConnected) return;
    ScrollTrigger.refresh();
    const shift = topOf(anchor) - was;
    if (Math.abs(shift) > 1) window.scrollBy(0, shift);
  };
}
