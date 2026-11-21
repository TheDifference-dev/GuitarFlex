import { useId } from "react";

/**
 * Oyunsu ilerleme halkası: bulunduğu öğenin renginde ([data-renk] → --r1/--r2) geçişli yay, ortada yüzde.
 * Renk verilmezse vurgu mavisi.
 */
export default function IlerlemeHalkasi({ yuzde, boyut = 44, kalinlik = 5, etiket }: { yuzde: number; boyut?: number; kalinlik?: number; etiket?: string }) {
  const id = useId();
  const r = (boyut - kalinlik) / 2;
  const cevre = 2 * Math.PI * r;
  const y = Math.max(0, Math.min(100, Math.round(yuzde)));
  return (
    <span className="relative inline-flex shrink-0 items-center justify-center" style={{ width: boyut, height: boyut }} role="img" aria-label={etiket ?? `İlerleme %${y}`}>
      <svg width={boyut} height={boyut} viewBox={`0 0 ${boyut} ${boyut}`} className="-rotate-90" aria-hidden>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" style={{ stopColor: "var(--r1, var(--accent))" }} />
            <stop offset="100%" style={{ stopColor: "var(--r2, var(--accent))" }} />
          </linearGradient>
        </defs>
        <circle cx={boyut / 2} cy={boyut / 2} r={r} fill="none" stroke="currentColor" strokeOpacity={0.12} strokeWidth={kalinlik} />
        <circle
          cx={boyut / 2}
          cy={boyut / 2}
          r={r}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={kalinlik}
          strokeLinecap="round"
          strokeDasharray={`${(cevre * y) / 100} ${cevre}`}
          className="transition-[stroke-dasharray] duration-200 motion-reduce:transition-none"
        />
      </svg>
      <span className="absolute text-[11px] font-semibold tabular-nums">%{y}</span>
    </span>
  );
}
