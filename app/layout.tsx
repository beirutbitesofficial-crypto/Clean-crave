import type { Metadata, Viewport } from "next";
import { Anton, Barlow_Condensed, Manrope, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import { stats } from "@/lib/menu";
import { site } from "@/lib/site";

const display = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton", display: "swap" });
const cond = Barlow_Condensed({ weight: ["500", "600", "700"], subsets: ["latin"], variable: "--font-barlow", display: "swap" });
const sans = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const serif = Playfair_Display({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-playfair", display: "swap" });

const description = `${site.name} — ${stats.meals} macro-counted meals for breakfast, lunch, dinner and snacks. See the protein, carbs and fat in every meal, build your order and send it on WhatsApp.`;

export const metadata: Metadata = {
  metadataBase: site.url ? new URL(site.url) : undefined,
  title: `${site.name} — ${site.tagline}`,
  description,
  robots: site.preview ? { index: false, follow: false } : undefined,
  openGraph: {
    title: `${site.name} — ${site.tagline}`,
    description: "The full menu with protein, carbs and fat counted on every meal. Order on WhatsApp.",
    type: "website",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: `${site.name} — ${site.tagline}` }],
  },
};

export const viewport: Viewport = {
  themeColor: "#070605",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${cond.variable} ${sans.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        {/* Marks JS as available before paint so intro elements can start hidden without a flash. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="bg-ink font-sans text-ivory antialiased">
        <a href="#menu" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-gold focus:px-5 focus:py-3 focus:text-sm focus:font-bold focus:text-ink">
          Skip to the menu
        </a>
        <CartProvider>{children}</CartProvider>
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
