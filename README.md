# CleanCrave — website

Cinematic one-page site and full online menu for **CleanCrave** — _meals that fuel your goals_.
Next.js (App Router) · React · TypeScript · Tailwind CSS 4 · GSAP + ScrollTrigger. Same stack and style as Sushi Bento / BASST CUT / 24i.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start   # production (Vercel deploys it automatically on push)
```

## What is on the page

| Section | What it does |
| --- | --- |
| Hero | A gold ring closes around the logo, the curtain lifts, the logo comes out of the dark with **P · C · F** on its orbit, and "Meals that fuel your goals" rises letter by letter. Gold dust drifts behind; the logo follows the pointer on desktop. |
| Marquee | Band of gold lettering that speeds up with the scroll. |
| How to read the menu | The page pins while a ring is drawn one macro at a time — protein, carbs, fat — with each number counting up, using the highest-protein meal on the menu. |
| The Menu | Every meal with its price, calories and a ring showing its P / C / F split. Sticky category bar, and quick filters: 50 g+ protein, 350 kcal or less, 20 g carbs or less. |
| My order | Tap **+** on a meal and the drawer totals the price, calories, protein, carbs and fat. One button opens WhatsApp with the whole order written out. |
| How to order · Order now | Three steps, then the gold "Crave clean." page with the WhatsApp number. |
| Footer | The name in hollow letters, filled with gold as the page ends. |

Everything respects "reduce motion", and the page still reads normally with JavaScript off.

## Where to change things

| What | Where |
| --- | --- |
| **The menu** — meals, prices, calories, P / C / F | [`lib/menu.ts`](lib/menu.ts) |
| WhatsApp number, Instagram link, site address, preview mode | [`lib/site.ts`](lib/site.ts) |
| Colours and fonts | top of [`app/globals.css`](app/globals.css) and [`app/layout.tsx`](app/layout.tsx) |
| Hero animation | [`components/Hero.tsx`](components/Hero.tsx) |
| Pinned P · C · F scene (timeline map at the top of the file) | [`components/MacroScene.tsx`](components/MacroScene.tsx) |
| Order drawer and the WhatsApp message | [`components/Cart.tsx`](components/Cart.tsx), [`lib/cart.tsx`](lib/cart.tsx) |
| Logo files | `public/brand/` |

The numbers in the hero and the stats band (how many meals, most protein, lightest meal, lowest price) are worked out from `lib/menu.ts`, so they stay right when the menu changes.

### Before going live — `lib/site.ts`

| Field | What |
| --- | --- |
| `whatsapp` | Number that receives orders, digits only with country code. Currently `96181640785`. |
| `instagram` | Full Instagram URL. Empty hides the link. |
| `url` | The live address, once there is a domain (used for link previews). |
| `preview` | `true` = hidden from Google (noindex). Set to `false` when the site is approved and goes live. |

### Adding food photos

The menu works without photos — each meal shows its calories inside the macro ring.
To put a photo in the ring instead: save it as `public/menu/<name>.webp` (square, about 400 px) and add `img: "<name>"` to that meal in `lib/menu.ts`.

### Two things to confirm on the printed menu

- **Chicken Caesar Salad** — the name says chicken, the ingredients say "cooked lean steak". The site shows it exactly as printed.
- **Protein Pancakes & Berries** — printed as 340 kcal with 52 P / 39 C / 10 F. Those macros usually add up to more than 340 kcal, so one of the numbers may be a typo.

### The logo

`public/brand/logo.webp` and `emblem.webp` were cut out of the 828 px artwork. A higher-resolution file (or the original vector) will make the logo sharper on large screens — replace the two files, keeping the names.
