"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { checkCode, recordOrder } from "@/app/actions";
import { useLang } from "./i18n";
import { useContent } from "./content";
import { type Item, money } from "./menu";

export type Line = { id: string; qty: number };
export type FullLine = Line & { item: Item };
export type Totals = { price: number; kcal: number; p: number; c: number; f: number };
/** The partner (e.g. a gym) whose link or QR code brought this visitor. Never shown to them. */
export type Ref = { code: string; at: number };

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
  /** Call when the order goes to WhatsApp. */
  sent: () => void;
};

const CartContext = createContext<Cart | null>(null);
const STORAGE = "cleancrave.order.v1";
/** A partner gets the visitor's orders for this long after the visitor opened their link. */
const REF_DAYS = 30;
/** Every order carries a short number, so the kitchen and the admin panel can point at the same order. */
const newOrderNo = () => String(Math.floor(10000 + Math.random() * 90000));

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [raw, setRaw] = useState<Line[]>([]);
  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(0);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [ref, setRef] = useState<Ref | null>(null);
  const [orderNo, setOrderNo] = useState("");
  const [restored, setRestored] = useState(false);
  const { t } = useLang();
  const { findItem, whatsappLink } = useContent();

  // Restore (per-device convenience only; ignore if storage is blocked).
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE) || "null") as { lines?: Line[]; name?: string; notes?: string; ref?: Ref | null } | null;
      if (saved) {
        setRaw((saved.lines ?? []).filter((l) => findItem(l.id) && l.qty > 0));
        setName(saved.name ?? "");
        setNotes(saved.notes ?? "");
        if (saved.ref?.code && Date.now() - saved.ref.at < REF_DAYS * 864e5) setRef(saved.ref);
      }
    } catch {}
    setOrderNo(newOrderNo());
    setRestored(true);
    // A partner's link or QR code: cleancrave.com/?ref=CODE. Checked quietly, then taken out of the address bar.
    try {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("ref");
      if (code) {
        checkCode(code).then((found) => found && setRef({ code: found, at: Date.now() }), () => {});
        url.searchParams.delete("ref");
        history.replaceState(history.state, "", url.pathname + url.search + url.hash);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem(STORAGE, JSON.stringify({ lines: raw, name, notes, ref }));
    } catch {}
  }, [raw, name, notes, ref, restored]);

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
    const extra = [name.trim() && `${t.wa.name}: ${name.trim()}`, notes.trim() && `${t.wa.notes}: ${notes.trim()}`].filter(Boolean) as string[];
    const message = [
      t.wa.intro,
      "",
      ...lines.map(({ item, qty }) => `• ${qty} × ${item.name} — ${money(item.price * qty)}`),
      "",
      `${t.wa.total}: ${money(totals.price)}`,
      `${t.wa.macros}: ${totals.kcal} kcal · P ${totals.p} g · C ${totals.c} g · F ${totals.f} g`,
      ...(extra.length ? ["", ...extra] : []),
      ...(orderNo ? ["", `${t.wa.order} #${orderNo}`] : []),
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
      sent: () => {
        if (ref) recordOrder(ref.code, raw, orderNo).catch(() => {});
        setOrderNo(newOrderNo());
      },
    };
  }, [raw, open, add, setQty, name, notes, pulse, t, findItem, whatsappLink, ref, orderNo]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
