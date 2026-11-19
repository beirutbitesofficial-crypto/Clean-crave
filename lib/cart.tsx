"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { checkCode, recordOrder } from "@/app/actions";
import { useLang } from "./i18n";
import { useContent } from "./content";
import { type Item, money } from "./menu";

export type Line = { id: string; qty: number };
export type FullLine = Line & { item: Item };
export type Totals = { price: number; kcal: number; p: number; c: number; f: number };
export type Promo = { code: string; discount: number };

type Cart = {
  lines: FullLine[];
  count: number;
  totals: Totals;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  qtyOf: (id: string) => number;
  clear: () => void;
  name: string;
  setName: (t: string) => void;
  notes: string;
  setNotes: (t: string) => void;
  /** Bumped on every add — the order pill uses it to bounce. */
  pulse: number;
  /** wa.me link with the whole order written out. */
  orderLink: string;
  /** The promo or referral code in use, if any, and what it takes off. */
  promo: Promo | null;
  discount: number;
  /** What the customer pays: the meals less the discount. */
  toPay: number;
  applyCode: (code: string) => Promise<boolean>;
  removeCode: () => void;
  /** Call when the order goes to WhatsApp. */
  sent: () => void;
};

const CartContext = createContext<Cart | null>(null);
const STORAGE = "cleancrave.order.v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [raw, setRaw] = useState<Line[]>([]);
  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(0);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [promo, setPromo] = useState<Promo | null>(null);
  const [restored, setRestored] = useState(false);
  const { t } = useLang();
  const { findItem, whatsappLink } = useContent();

  // Restore (per-device convenience only; ignore if storage is blocked).
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE) || "null") as { lines?: Line[]; name?: string; notes?: string; promo?: Promo | null } | null;
      if (saved) {
        setRaw((saved.lines ?? []).filter((l) => findItem(l.id) && l.qty > 0));
        setName(saved.name ?? "");
        setNotes(saved.notes ?? "");
        // Re-checked, in case the code was switched off or its discount changed since.
        if (saved.promo?.code) checkCode(saved.promo.code).then(setPromo, () => setPromo(saved.promo ?? null));
      }
    } catch {}
    setRestored(true);
    // A partner's link: cleancrave.com/?ref=CODE. The code sticks until it is removed.
    try {
      const url = new URL(window.location.href);
      const ref = url.searchParams.get("ref") || url.searchParams.get("code");
      if (ref) {
        checkCode(ref).then((p) => p && setPromo(p), () => {});
        url.searchParams.delete("ref");
        url.searchParams.delete("code");
        history.replaceState(history.state, "", url.pathname + url.search + url.hash);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem(STORAGE, JSON.stringify({ lines: raw, name, notes, promo }));
    } catch {}
  }, [raw, name, notes, promo, restored]);

  const applyCode = useCallback(async (code: string) => {
    try {
      const found = await checkCode(code);
      if (found) setPromo(found);
      return Boolean(found);
    } catch {
      return false;
    }
  }, []);

  const add = useCallback((id: string) => {
    if (!findItem(id)) return;
    setRaw((ls) => (ls.some((l) => l.id === id) ? ls.map((l) => (l.id === id ? { ...l, qty: l.qty + 1 } : l)) : [...ls, { id, qty: 1 }]));
    setPulse((p) => p + 1);
  }, [findItem]);

  const setQty = useCallback((id: string, qty: number) => {
    setRaw((ls) => (qty <= 0 ? ls.filter((l) => l.id !== id) : ls.map((l) => (l.id === id ? { ...l, qty: Math.min(qty, 99) } : l))));
  }, []);

  const value = useMemo<Cart>(() => {
    const lines = raw.flatMap((l) => {
      const item = findItem(l.id);
      return item ? [{ ...l, item }] : [];
    });
    const totals = lines.reduce<Totals>(
      (t, { item, qty }) => ({
        price: t.price + item.price * qty,
        kcal: t.kcal + item.kcal * qty,
        p: t.p + item.p * qty,
        c: t.c + item.c * qty,
        f: t.f + item.f * qty,
      }),
      { price: 0, kcal: 0, p: 0, c: 0, f: 0 }
    );
    // Greeting and labels follow the visitor's language; meal names stay as on the kitchen's menu.
    const discount = promo ? Math.round(totals.price * promo.discount) / 100 : 0;
    const toPay = Math.round((totals.price - discount) * 100) / 100;
    const priceLines = !promo
      ? [`${t.wa.total}: ${money(totals.price)}`]
      : discount > 0
        ? [`${t.wa.subtotal}: ${money(totals.price)}`, `${t.wa.discount} (${promo.code}, ${promo.discount}%): -${money(discount)}`, `${t.wa.total}: ${money(toPay)}`]
        : [`${t.wa.total}: ${money(totals.price)}`, `${t.wa.code}: ${promo.code}`];
    const extra = [name.trim() && `${t.wa.name}: ${name.trim()}`, notes.trim() && `${t.wa.notes}: ${notes.trim()}`].filter(Boolean) as string[];
    const message = [
      t.wa.intro,
      "",
      ...lines.map(({ item, qty }) => `• ${qty} × ${item.name} — ${money(item.price * qty)}`),
      "",
      ...priceLines,
      `${t.wa.macros}: ${totals.kcal} kcal · P ${totals.p} g · C ${totals.c} g · F ${totals.f} g`,
      ...(extra.length ? ["", ...extra] : []),
    ].join("\n");

    return {
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      totals,
      open,
      setOpen,
      add,
      setQty,
      qtyOf: (id) => raw.find((l) => l.id === id)?.qty ?? 0,
      clear: () => (setRaw([]), setNotes("")),
      name,
      setName,
      notes,
      setNotes,
      pulse,
      orderLink: whatsappLink(message),
      promo,
      discount,
      toPay,
      applyCode,
      removeCode: () => setPromo(null),
      sent: () => {
        if (promo) recordOrder(promo.code, raw).catch(() => {});
      },
    };
  }, [raw, open, add, setQty, name, notes, pulse, t, findItem, whatsappLink, promo, applyCode]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
