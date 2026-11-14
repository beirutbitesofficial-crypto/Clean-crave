import type { Metadata, Viewport } from "next";
import { Anton, Barlow_Condensed, Manrope, Playfair_Display } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import SkipLink from "@/components/SkipLink";
import { CartProvider } from "@/lib/cart";
import { LangProvider } from "@/lib/i18n";
import { langBootScript } from "@/lib/lang";
import { ContentProvider } from "@/lib/content";
import { site } from "@/lib/site";
import { getContent } from "@/lib/store";

const display = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton", display: "swap" });
const cond = Barlow_Condensed({ weight: ["500", "600", "700"], subsets: ["latin"], variable: "--font-barlow", display: "swap" });
const sans = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const serif = Playfair_Display({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-playfair", display: "swap" });

/*
 * Arabic faces (all SIL Open Font License, files in app/fonts). Each is limited to Arabic letters, so
 * numbers, prices and P · C · F keep the brand's Latin fonts, and the files only download once Arabic
 * is actually on screen. `size-adjust` sets Arabic a little larger, where it reads at the same weight.
 */
const arDisplay = localFont({
  src: "./fonts/noto-kufi-arabic-800.woff2",
  weight: "100 900",
  variable: "--font-ar-display",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  declarations: [
    { prop: "unicode-range", value: "U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFC, U+200C-200F" },
    { prop: "size-adjust", value: "100%" },
  ],
});
const arText = localFont({
  src: "./fonts/noto-sans-arabic.woff2",
  weight: "100 900",
  variable: "--font-ar-text",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  declarations: [
    { prop: "unicode-range", value: "U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFC, U+200C-200F" },
    { prop: "size-adjust", value: "112%" },
  ],
});
const arSerif = localFont({
  src: [
    { path: "./fonts/amiri-400.woff2", weight: "400" },
    { path: "./fonts/amiri-700.woff2", weight: "700" },
  ],
  variable: "--font-ar-serif",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  declarations: [
    { prop: "unicode-range", value: "U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFC, U+200C-200F" },
    { prop: "size-adjust", value: "122%" },
  ],
});

export async function generateMetadata(): Promise<Metadata> {
  const meals = (await getContent()).menu.reduce((n, c) => n + c.items.length, 0);
  return {
    metadataBase: site.url ? new URL(site.url) : undefined,
    title: `${site.name} — ${site.tagline}`,
    description: `${site.name} — ${meals} macro-counted meals for breakfast, lunch, dinner and snacks. See the protein, carbs and fat in every meal, build your order and send it on WhatsApp.`,
    robots: site.preview ? { index: false, follow: false } : undefined,
    openGraph: {
      title: `${site.name} — ${site.tagline}`,
      description: "The full menu with protein, carbs and fat counted on every meal. Order on WhatsApp.",
      type: "website",
      images: [{ url: "/og.jpg", width: 1200, height: 630, alt: `${site.name} — ${site.tagline}` }],
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#070605",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const fonts = [display, cond, sans, serif, arDisplay, arText, arSerif].map((f) => f.variable).join(" ");

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // The menu and contact details as last saved in the admin panel.
  const content = await getContent();
  return (
    <html lang="en" dir="ltr" className={fonts} suppressHydrationWarning>
      <head>
        {/* Before paint: marks JS as available and applies the remembered language and direction. */}
        <script dangerouslySetInnerHTML={{ __html: langBootScript }} />
      </head>
      <body className="bg-ink font-sans text-ivory antialiased">
        <LangProvider>
          <SkipLink />
          <ContentProvider content={content}>
            <CartProvider>{children}</CartProvider>
          </ContentProvider>
        </LangProvider>
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
