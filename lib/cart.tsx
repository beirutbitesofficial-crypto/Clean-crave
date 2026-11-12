"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLang } from "./i18n";
import { findItem, type Item, money } from "./menu";
import { whatsappLink } from "./site";

export type Line = { id: string; qty: number };
export type FullLine = Line & { item: Item };
export type Totals = { price: number; kcal: number; p: number; c: number; f: number };

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
};

const CartContext = createContext<Cart | null>(null);
const STORAGE = "cleancrave.order.v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [raw, setRaw] = useState<Line[]>([]);
  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(0);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [restored, setRestored] = useState(false);
  const { t } = useLang();

  // Restore (per-device convenience only; ignore if storage is blocked).
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE) || "null") as { lines?: Line[]; name?: string; notes?: string } | null;
      if (saved) {
        setRaw((saved.lines ?? []).filter((l) => findItem(l.id) && l.qty > 0));
        setName(saved.name ?? "");
        setNotes(saved.notes ?? "");
      }
    } catch {}
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem(STORAGE, JSON.stringify({ lines: raw, name, notes }));
    } catch {}
  }, [raw, name, notes, restored]);

  const add = useCallback((id: string) => {
    if (!findItem(id)) return;
    setRaw((ls) => (ls.some((l) => l.id === id) ? ls.map((l) => (l.id === id ? { ...l, qty: l.qty + 1 } : l)) : [...ls, { id, qty: 1 }]));
    setPulse((p) => p + 1);
  }, []);

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
    const extra = [name.trim() && `${t.wa.name}: ${name.trim()}`, notes.trim() && `${t.wa.notes}: ${notes.trim()}`].filter(Boolean) as string[];
    const message = [
      t.wa.intro,
      "",
      ...lines.map(({ item, qty }) => `• ${qty} × ${item.name} — ${money(item.price * qty)}`),
      "",
      `${t.wa.total}: ${money(totals.price)}`,
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
    };
  }, [raw, open, add, setQty, name, notes, pulse, t]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
