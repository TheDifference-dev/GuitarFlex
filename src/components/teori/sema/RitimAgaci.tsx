import type { AgacSemasi } from "@/content/teori/tipler";

// Nota değerleri ağacı: her satırda bir üstteki değer ikiye bölünür (birlik → ikilik → dörtlük → sekizlik →
// onaltılık). Sağda aynı süredeki sus işareti. Nota ve sus glifleri SMuFL Bravura yazı tipinden.

const SATIRLAR = [
  { ad: "Birlik", vurus: "4 vuruş", glif: "", sus: "", n: 1 },
  { ad: "İkilik", vurus: "2 vuruş", glif: "", sus: "", n: 2 },
  { ad: "Dörtlük", vurus: "1 vuruş", glif: "", sus: "", n: 4 },
  { ad: "Sekizlik", vurus: "½ vuruş", glif: "", sus: "", n: 8 },
  { ad: "Onaltılık", vurus: "¼ vuruş", glif: "", sus: "", n: 16 },
];
const SOL = 76;
const GEN = 352;
const SAG = 44;
const SH = 40;

export default function RitimAgaci({ g }: { g: AgacSemasi }) {
  const W = SOL + GEN + SAG;
  const H = SATIRLAR.length * SH + 6;
  const x = (n: number, i: number) => SOL + (GEN / n) * (i + 0.5);
  const y = (r: number) => 30 + r * SH;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="sema-svg h-auto w-full text-[var(--text)]" style={{ maxWidth: W * 1.4 }} role="img" aria-label={g.baslik}>
      {SATIRLAR.map((s, r) => (
        <g key={s.ad}>
          <text x={2} y={y(r) - 8} className="fill-[var(--text)] text-[10px] font-semibold">
            {s.ad}
          </text>
          <text x={2} y={y(r) + 3} className="fill-[var(--muted)] text-[9px]">
            {s.vurus}
          </text>
          {r > 0
            ? Array.from({ length: s.n }, (_, i) => (
                <line key={`l${i}`} x1={x(s.n / 2, Math.floor(i / 2)) + 3} y1={y(r - 1) + 4} x2={x(s.n, i) + 3} y2={y(r) - 26} className="stroke-[var(--line)]" strokeWidth={0.9} />
              ))
            : null}
          {Array.from({ length: s.n }, (_, i) => (
            <text key={`n${i}`} x={x(s.n, i) - 1} y={y(r)} fontFamily="GFBravura" fontSize={26} className="fill-current">
              {s.glif}
            </text>
          ))}
          <text x={SOL + GEN + SAG / 2} y={y(r) - (r === 0 ? 10 : r === 1 ? 7 : 4)} textAnchor="middle" fontFamily="GFBravura" fontSize={26} className="fill-[var(--muted)]">
            {s.sus}
          </text>
        </g>
      ))}
      <text x={SOL + GEN + SAG / 2} y={10} textAnchor="middle" className="fill-[var(--muted)] text-[9px] font-semibold">
        sus
      </text>
    </svg>
  );
}
