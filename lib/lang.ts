/** Shared by the server layout and the client language provider (kept out of the "use client" file on purpose). */
export type Lang = "en" | "ar";

/** Where the visitor's choice is remembered on their device. */
export const LANG_STORAGE = "cleancrave.lang";

/**
 * Runs in <head> before the first paint: marks JavaScript as available (so intro elements can start
 * hidden without a flash) and sets the page's direction and language from the link (?lang=ar) or the
 * remembered choice — so an Arabic visitor never sees the page laid out left-to-right first.
 */
export const langBootScript = `(function(){var d=document.documentElement;d.classList.add('js');try{var m=location.search.match(/[?&]lang=(ar|en)(&|$)/);var l=m?m[1]:localStorage.getItem('${LANG_STORAGE}');if(l==='ar'){d.lang='ar';d.dir='rtl'}}catch(e){}})()`;
