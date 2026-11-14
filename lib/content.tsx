"use client";

import { createContext, useContext, useMemo } from "react";
import { type Category, type Item, menu as defaultMenu, menuStats } from "./menu";
import { type Contact, defaultContact, whatsappUrl } from "./site";

/** Everything the admin panel can edit: the menu and the contact details. */
export type Content = { contact: Contact; menu: Category[] };

export const defaultContent: Content = { contact: defaultContact, menu: defaultMenu };

function derive(content: Content) {
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

export function ContentProvider({ content, children }: { content: Content; children: React.ReactNode }) {
  const value = useMemo(() => derive(content), [content]);
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export const useContent = () => useContext(ContentContext);
