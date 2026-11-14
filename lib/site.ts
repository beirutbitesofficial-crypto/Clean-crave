/**
 * Central place for brand content & links.
 */
export const site = {
  name: "CleanCrave",
  tagline: "Meals that fuel your goals",
  country: "Lebanon",
  /** WhatsApp number that receives orders — digits only, with country code. */
  whatsapp: "96181640785",
  /** The same number, as printed on the menu. */
  phone: "+961 81 640 785",
  /** Full Instagram URL. Empty hides the link. */
  instagram: "",
  /** Live address, e.g. "https://cleancrave.com". Used for link previews. Empty is fine until there is a domain. */
  url: "",
  /** Preview mode: keeps Google from indexing the site. Set to false once the site is approved and live. */
  preview: true,
};

/** The contact details the admin panel can change. */
export type Contact = { whatsapp: string; phone: string; instagram: string };

export const defaultContact: Contact = { whatsapp: site.whatsapp, phone: site.phone, instagram: site.instagram };

export function whatsappUrl(number: string, text: string) {
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}
