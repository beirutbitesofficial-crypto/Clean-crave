"use client";

import { createContext, useContext, useMemo } from "react";
import { type Category, type Item, menu as defaultMenu, menuStats } from "./menu";
import { type Contact, defaultContact, whatsappUrl } from "./site";

/**
 * A partner's referral code, e.g. one per gym. It rides in the partner's link and QR code so the
 * owner can tell which partner each order came from. Customers never see it.
 */
export type PromoCode = {
  code: string;
  /** Who the code belongs to, e.g. the gym's name. */
  partner: string;
  /** What the partner earns for each order, in dollars (a fixed amount, whatever the order's size). */
  perOrder: number;
  active: boolean;
};

/** What every visitor gets: the menu and the contact details. */
export type PublicContent = { contact: Contact; menu: Category[] };

/** Everything the admin panel can edit. */
export type Content = PublicContent & { codes: PromoCode[] };

export const defaultContent: PublicContent = { contact: defaultContact, menu: defaultMenu };

function derive(content: PublicContent) {
  // Categories with no meals are kept in the admin panel but never shown.
  const menu = content.menu.filter((c) => c.items.length);
  const allItems: Item[] = menu.flatMap((c) => c.items);
  const byId = new Map(allItems.map((i) => [i.id, i]));
  return {
    menu,
    contact: content.contact,
    allItems,
    findItem: (id: string) => byId.get(id),
    stats: menuStats(allItems),
    whatsappLink: (text: string) => whatsappUrl(content.contact.whatsapp, text),
  };
}

const ContentContext = createContext(derive(defaultContent));

export function ContentProvider({ content, children }: { content: PublicContent; children: React.ReactNode }) {
  const value = useMemo(() => derive(content), [content]);
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export const useContent = () => useContext(ContentContext);
