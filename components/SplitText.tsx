/**
 * Tiny, dependency-free text splitters. Each piece sits inside an
 * overflow-hidden mask so it can slide in with transforms only.
 * Use an sr-only copy of the text alongside for screen readers.
 */
export function SplitChars({ text, className = "", charClass = "" }: { text: string; className?: string; charClass?: string }) {
  return (
    <span className={`inline-flex ${className}`}>
      {Array.from(text).map((c, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] -mb-[0.08em] pt-[0.06em] -mt-[0.06em]">
          <span className={`char inline-block will-change-transform ${charClass}`}>{c === " " ? "\u00A0" : c}</span>
        </span>
      ))}
    </span>
  );
}

export function SplitWords({ text, className = "", wordClass = "" }: { text: string; className?: string; wordClass?: string }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((w, i) => (
        <span key={i}>
          <span className={`inline-block overflow-hidden pb-[0.14em] -mb-[0.14em] align-top ${className}`}>
            <span className={`word inline-block will-change-transform ${wordClass}`}>{w}</span>
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </>
  );
}
