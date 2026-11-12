/**
 * Tiny, dependency-free text splitters. Each piece sits inside an
 * overflow-hidden mask so it can slide in with transforms only.
 * Use an sr-only copy of the text alongside for screen readers.
 *
 * Arabic letters join into words, so Arabic is never cut letter by letter: it rises word by word,
 * inside a taller mask that leaves room for its dots and marks.
 */
const ARABIC = /[؀-ۿ]/;
const MASK = "pb-[0.08em] -mb-[0.08em] pt-[0.06em] -mt-[0.06em]";
const MASK_AR = "pb-[0.5em] -mb-[0.5em] pt-[0.4em] -mt-[0.4em] px-[0.08em] -mx-[0.08em]";

export function SplitChars({ text, className = "", charClass = "" }: { text: string; className?: string; charClass?: string }) {
  const arabic = ARABIC.test(text);
  const parts = arabic ? text.split(" ") : Array.from(text);
  return (
    <span className={`inline-flex ${arabic ? "gap-[0.26em]" : ""} ${className}`}>
      {parts.map((c, i) => (
        <span key={i} className={`inline-block overflow-hidden ${arabic ? MASK_AR : MASK}`}>
          <span className={`char inline-block will-change-transform ${charClass}`}>{c === " " ? " " : c}</span>
        </span>
      ))}
    </span>
  );
}

export function SplitWords({ text, className = "", wordClass = "" }: { text: string; className?: string; wordClass?: string }) {
  const words = text.split(" ");
  const mask = ARABIC.test(text) ? MASK_AR : "pb-[0.14em] -mb-[0.14em]";
  return (
    <>
      {words.map((w, i) => (
        <span key={i}>
          <span className={`inline-block overflow-hidden align-top ${mask} ${className}`}>
            <span className={`word inline-block will-change-transform ${wordClass}`}>{w}</span>
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </>
  );
}
