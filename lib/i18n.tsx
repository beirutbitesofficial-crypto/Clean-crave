"use client";

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { type Lang, LANG_STORAGE as STORAGE } from "./lang";
import type { Category, Item } from "./menu";
import { site } from "./site";

export type { Lang };

/**
 * English / Arabic.
 *
 * Every sentence on the site lives here, once per language. Meal names and ingredients live with the
 * menu itself (`lib/menu.ts`, the `ar` field on each meal). The letters P · C · F, prices and numbers
 * stay as they are in both languages — they are the brand's own notation, as on the printed menu.
 *
 * The visitor's choice is remembered on their device. A link ending in `?lang=ar` opens the site in
 * Arabic, `?lang=en` in English.
 */
/** A sentence in pieces: [text, bold?]. */
type Rich = readonly (readonly [string, boolean])[];

const en = {
  title: `${site.name} — Meals that fuel your goals`,
  tagline: "Meals that fuel your goals",
  skip: "Skip to the menu",
  language: "Language",
  g: "g",
  kcal: "kcal",
  protein: "Protein",
  carbs: "Carbs",
  carbsShort: "Carbs",
  fat: "Fat",
  meals: (n: number) => `${n} ${n === 1 ? "meal" : "meals"}`,
  orderNow: "Order now",
  backToMenu: "Back to the menu",
  myOrder: "My order",

  nav: { home: `${site.name} — home`, main: "Main", macros: "Macros", menu: "Menu", order: "Order", orderShort: "Order" },

  hero: {
    eyebrow: "Macro-counted meals",
    l1: "Meals that",
    l2: "Fuel your",
    gold: "Goals",
    sub: "Breakfast, lunch, dinner and snacks — with the protein, carbs and fat already counted for you.",
    seeMenu: "See the menu",
    stats: ["meals on the menu", "protein in one meal", "meals start at"],
    left: "P · C · F — counted in grams",
    right: "Breakfast — Lunch — Dinner — Snacks",
    scroll: "Scroll",
  },

  marquee: ["Breakfast", "Protein", "Lunch", "Carbs", "Dinner", "Fat", "Snacks", "Counted in grams"],

  scene: {
    eyebrow: "How to read the menu",
    title: "Three numbers on",
    titleEm: "every meal.",
    from: { p: "Chicken, turkey, tuna, eggs, Greek yogurt.", c: "Rice, oats, potatoes, pasta, fruit.", f: "Avocado, pesto, cheese, seeds." },
    note: "*Macros are measured in grams: P (protein), C (carbs) and F (fat).",
    onPlate: "On the plate:",
    add: "Add to order",
    inOrder: "In your order",
  },

  menu: {
    eyebrow: "Breakfast · Lunch · Dinner · Snacks",
    title: "The",
    titleEm: "Menu",
    macros: "Macros",
    note: [
      ["*Macros are measured in ", false],
      ["grams", true],
      [" and include: ", false],
      ["P", true],
      [" (protein), ", false],
      ["C", true],
      [" (carbs) and ", false],
      ["F", true],
      [" (fat).", false],
    ] as Rich,
    showMe: "Show me",
    filter: "Filter the menu",
    range: (lo: number, hi: number) => (lo === hi ? `${lo} kcal` : `${lo}–${hi} kcal`),
    upTo: (g: number) => `up to ${g} g protein`,
    soldOut: "Sold out",
    add: (name: string) => `Add ${name} to your order`,
    less: (name: string) => `One less ${name}`,
    more: (name: string) => `One more ${name}`,
    inOrder: (n: number) => `${n} in your order`,
  },

  cart: {
    title: "My",
    titleEm: "order",
    close: "Close my order",
    open: (meals: string, price: string) => `Open my order: ${meals}, ${price}`,
    whatsapp: "Order on WhatsApp",
    empty: "Nothing yet.",
    emptyHint: "Tap + on any meal and its macros add up here.",
    adds: "This order adds up to",
    macrosFor: "Macros for this order",
    name: "Your name (optional)",
    notes: "Notes (optional)",
    notesHint: "Allergies, delivery details, anything we should know",
    clear: "Clear order",
    clearConfirm: "Clear your whole order?",
    total: "Total",
    send: "Send order on WhatsApp",
    sendHint: "Opens WhatsApp with your order written out, to",
  },

  steps: {
    facts: {
      meals: "meals on the menu",
      protein: (dish: string) => `protein in the ${dish}`,
      lightest: "kcal in the lightest meals",
      from: "is where the menu starts",
    },
    eyebrow: "How to order",
    title: "Three taps to",
    titleEm: "fuelled.",
    list: [
      { title: "Pick your meals", text: "Tap + on anything you like, breakfast through snacks." },
      { title: "Watch the macros add up", text: "Your order totals the calories, protein, carbs and fat as you go." },
      { title: "Send it on WhatsApp", text: "One tap writes the whole order out and sends it to {phone}." },
    ],
  },

  order: {
    eyebrow: "Hungry?",
    l1: "Crave",
    l2: "clean.",
    text: "Build your order from the menu, or just message us what you feel like. Either way it lands on WhatsApp.",
    review: "Review my order",
  },

  footer: {
    nav: "Footer",
    top: "Top",
    instagram: "Instagram",
    note: "Macros measured in grams · P protein · C carbs · F fat",
  },

  /** The WhatsApp message. Meal names always go out in English so the kitchen reads the same names as on its menu. */
  wa: {
    hello: `Hello ${site.name}! I'd like to order.`,
    intro: `Hello ${site.name}! I'd like to order:`,
    total: "Total",
    macros: "Macros",
    name: "Name",
    notes: "Notes",
  },
};

export type Dict = typeof en;

/** Arabic plural: 1 وجبة واحدة · 2 وجبتان · 3–10 وجبات · 11+ وجبة */
const arMeals = (n: number) => (n === 1 ? "وجبة واحدة" : n === 2 ? "وجبتان" : n >= 3 && n <= 10 ? `${n} وجبات` : `${n} وجبة`);

const ar: Dict = {
  title: `${site.name} — وجبات تغذّي أهدافك`,
  tagline: "وجبات تغذّي أهدافك",
  skip: "انتقل إلى المنيو",
  language: "اللغة",
  g: "غ",
  kcal: "سعرة",
  protein: "بروتين",
  carbs: "كربوهيدرات",
  carbsShort: "كارب",
  fat: "دهون",
  meals: arMeals,
  orderNow: "اطلب الآن",
  backToMenu: "العودة إلى المنيو",
  myOrder: "طلبي",

  nav: { home: `${site.name} — الرئيسية`, main: "القائمة الرئيسية", macros: "الماكروز", menu: "المنيو", order: "اطلب", orderShort: "اطلب" },

  hero: {
    eyebrow: "وجبات محسوبة الماكروز",
    l1: "وجبات",
    l2: "تغذّي",
    gold: "أهدافك",
    sub: "فطور، غداء، عشاء وسناك — والبروتين والكربوهيدرات والدهون محسوبة لك مسبقاً.",
    seeMenu: "تصفّح المنيو",
    stats: ["وجبة في المنيو", "بروتين في وجبة واحدة", "الأسعار تبدأ من"],
    left: "P · C · F — محسوبة بالغرام",
    right: "فطور — غداء — عشاء — سناك",
    scroll: "مرّر",
  },

  marquee: ["فطور", "بروتين", "غداء", "كربوهيدرات", "عشاء", "دهون", "سناك", "محسوبة بالغرام"],

  scene: {
    eyebrow: "كيف تقرأ المنيو",
    title: "ثلاثة أرقام على",
    titleEm: "كل وجبة.",
    from: { p: "دجاج، حبش، تونا، بيض، لبن يوناني.", c: "أرز، شوفان، بطاطا، باستا، فواكه.", f: "أفوكادو، بيستو، جبنة، بذور." },
    note: "*الماكروز محسوبة بالغرام: P (بروتين)، C (كربوهيدرات) و F (دهون).",
    onPlate: "في الطبق:",
    add: "أضف إلى الطلب",
    inOrder: "في طلبك",
  },

  menu: {
    eyebrow: "فطور · غداء · عشاء · سناك",
    title: "قائمة",
    titleEm: "الوجبات",
    macros: "الماكروز",
    note: [
      ["*الماكروز محسوبة بـ", false],
      ["الغرام", true],
      [" وتشمل: ", false],
      ["P", true],
      [" (بروتين)، ", false],
      ["C", true],
      [" (كربوهيدرات) و ", false],
      ["F", true],
      [" (دهون).", false],
    ] as Rich,
    showMe: "أرني",
    filter: "تصفية المنيو",
    range: (lo: number, hi: number) => (lo === hi ? `${lo} سعرة` : `${lo} إلى ${hi} سعرة`),
    upTo: (g: number) => `حتى ${g} غ بروتين`,
    soldOut: "نفدت الكمية",
    add: (name: string) => `أضف ${name} إلى الطلب`,
    less: (name: string) => `إنقاص ${name}`,
    more: (name: string) => `زيادة ${name}`,
    inOrder: (n: number) => `${n} في طلبك`,
  },

  cart: {
    title: "",
    titleEm: "طلبي",
    close: "إغلاق الطلب",
    open: (meals: string, price: string) => `فتح طلبي: ${meals}، ${price}`,
    whatsapp: "اطلب عبر واتساب",
    empty: "لا شيء بعد.",
    emptyHint: "اضغط + على أي وجبة لتُجمع ماكروزها هنا.",
    adds: "مجموع هذا الطلب",
    macrosFor: "ماكروز هذا الطلب",
    name: "الاسم (اختياري)",
    notes: "ملاحظات (اختياري)",
    notesHint: "حساسية، تفاصيل التوصيل، أو أي شيء يجب أن نعرفه",
    clear: "مسح الطلب",
    clearConfirm: "هل تريد مسح الطلب كاملاً؟",
    total: "المجموع",
    send: "أرسل الطلب عبر واتساب",
    sendHint: "يفتح واتساب مع طلبك مكتوباً، إلى",
  },

  steps: {
    facts: {
      meals: "وجبة في المنيو",
      protein: (dish: string) => `بروتين في ${dish}`,
      lightest: "سعرة في أخفّ الوجبات",
      from: "أدنى سعر في المنيو",
    },
    eyebrow: "طريقة الطلب",
    title: "ثلاث نقرات",
    titleEm: "وطلبك جاهز.",
    list: [
      { title: "اختر وجباتك", text: "اضغط + على أي وجبة تعجبك، من الفطور إلى السناك." },
      { title: "تابع مجموع الماكروز", text: "يجمع طلبك السعرات والبروتين والكربوهيدرات والدهون تلقائياً." },
      { title: "أرسله عبر واتساب", text: "بنقرة واحدة يُكتب الطلب كاملاً ويُرسل إلى {phone}." },
    ],
  },

  order: {
    eyebrow: "جائع؟",
    l1: "أكل",
    l2: "نظيف.",
    text: "كوّن طلبك من المنيو، أو راسلنا بما تشتهي. في الحالتين يصلنا عبر واتساب.",
    review: "مراجعة طلبي",
  },

  footer: {
    nav: "روابط التذييل",
    top: "الأعلى",
    instagram: "إنستغرام",
    note: "الماكروز محسوبة بالغرام · P بروتين · C كربوهيدرات · F دهون",
  },

  wa: {
    hello: `مرحباً ${site.name}! أودّ أن أطلب.`,
    intro: `مرحباً ${site.name}! أودّ أن أطلب:`,
    total: "المجموع",
    macros: "الماكروز",
    name: "الاسم",
    notes: "ملاحظات",
  },
};

const dicts: Record<Lang, Dict> = { en, ar };

type Ctx = {
  lang: Lang;
  rtl: boolean;
  /** False until the remembered language has been read — intro animations wait for it. */
  ready: boolean;
  t: Dict;
  setLang: (l: Lang) => void;
  /** Name / ingredients of a meal, title / subtitle of a category, in the current language. */
  name: (i: Item) => string;
  desc: (i: Item) => string;
  title: (c: Category) => string;
  script: (c: Category) => string;
};

const LangContext = createContext<Ctx | null>(null);

// Layout effect on the client (before paint), plain effect on the server (where it never runs).
const useBeforePaint = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [ready, setReady] = useState(false);

  // First visit: the link (?lang=ar) wins, then the remembered choice, then English.
  useBeforePaint(() => {
    let l: Lang = "en";
    try {
      const fromLink = new URLSearchParams(window.location.search).get("lang");
      const saved = fromLink === "ar" || fromLink === "en" ? fromLink : localStorage.getItem(STORAGE);
      if (saved === "ar") l = "ar";
      if (fromLink === "ar" || fromLink === "en") localStorage.setItem(STORAGE, fromLink);
    } catch {}
    setLangState(l);
    setReady(true);
  }, []);

  // Keep the page itself in step: direction and language…
  useBeforePaint(() => {
    if (!ready) return;
    const root = document.documentElement;
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang, ready]);

  // …and the tab title. The framework writes the English title into <head> on its own schedule,
  // so the title is watched and put back whenever it stops matching the chosen language.
  useEffect(() => {
    if (!ready) return;
    const want = dicts[lang].title;
    const apply = () => {
      if (document.title !== want) document.title = want;
    };
    apply();
    const watch = new MutationObserver(apply);
    watch.observe(document.head, { childList: true, subtree: true, characterData: true });
    return () => watch.disconnect();
  }, [lang, ready]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE, l);
    } catch {}
  }, []);

  const value = useMemo<Ctx>(() => {
    const arabic = lang === "ar";
    return {
      lang,
      rtl: arabic,
      ready,
      t: dicts[lang],
      setLang,
      name: (i) => (arabic ? i.ar.name : i.name),
      desc: (i) => (arabic ? i.ar.desc : i.desc),
      title: (c) => (arabic ? c.ar.title : c.title),
      script: (c) => (arabic ? c.ar.script : c.script),
    };
  }, [lang, ready, setLang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside <LangProvider>");
  return ctx;
}
