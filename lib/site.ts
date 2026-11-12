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

export function whatsappLink(text: string) {
  return `https://wa.me/${site.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}

/** Plain "hello" link for the Order buttons when nothing is in the order yet. */
export const helloLink = whatsappLink(`Hello ${site.name}! I'd like to order.`);
