/**
 * The CleanCrave signature: a ring split three ways — protein, carbs, fat — by their grams.
 *
 * Every arc is one dash as long as its share, turned to its starting angle. Drawing it in is a
 * single number: animate `stroke-dashoffset` from `data-len` (hidden) to 0 (drawn).
 */
export const RING_R = 42;
export const RING_C = 2 * Math.PI * RING_R;

export type Seg = { k: "p" | "c" | "f"; len: number; start: number };

export function ringSegments(p: number, c: number, f: number, gap = 2.6): Seg[] {
  const total = p + c + f;
  if (total <= 0) return [];
  const usable = RING_C - gap * 3;
  let at = gap / 2;
  return (
    [
      ["p", p],
      ["c", c],
      ["f", f],
    ] as const
  ).map(([k, v]) => {
    const len = (v / total) * usable;
    const seg = { k, len, start: at };
    at += len + gap;
    return seg;
  });
}

const STROKE = { p: "stroke-protein", c: "stroke-carb", f: "stroke-fat" } as const;

export default function MacroRing({
  p,
  c,
  f,
  stroke = 7,
  className = "",
  decorative = false,
}: {
  p: number;
  c: number;
  f: number;
  stroke?: number;
  className?: string;
  /** True when the numbers are already written next to the ring. */
  decorative?: boolean;
}) {
  const segs = ringSegments(p, c, f);
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : `Protein ${p} g, carbs ${c} g, fat ${f} g`}
    >
      <g transform="rotate(-90 50 50)" fill="none" strokeWidth={stroke}>
        <circle cx="50" cy="50" r={RING_R} className="stroke-ivory/[0.07]" />
        {segs.map((s) => (
          <circle
            key={s.k}
            cx="50"
            cy="50"
            r={RING_R}
            className={`ring-arc arc-${s.k} ${STROKE[s.k]}`}
            transform={`rotate(${((s.start / RING_C) * 360).toFixed(2)} 50 50)`}
            strokeDasharray={`${s.len.toFixed(2)} ${RING_C.toFixed(2)}`}
            data-len={s.len.toFixed(2)}
          />
        ))}
      </g>
    </svg>
  );
}
