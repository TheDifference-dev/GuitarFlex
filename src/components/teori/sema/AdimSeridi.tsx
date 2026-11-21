import type { AdimSemasi } from "@/content/teori/tipler";
import { goster } from "./ortak";

// Formül şeridi: notalar kutu içinde, aralarındaki adım (T tam = 2 perde, Y yarım = 1 perde, A artık ikili = 3 perde)
// yay ile; altta derece numaraları. Yarım adımlar vurgu renginde, gamın "kırılma" yerleri hemen görünür.

const KW = 34;
const ARA = 14;

export default function AdimSeridi({ g }: { g: AdimSemasi }) {
  const n = g.notalar.length;
  const W = n * KW + (n - 1) * ARA + 4;
  const H = g.dereceler ? 72 : 58;
  const x = (i: number) => 2 + i * (KW + ARA);
  const KY = 24;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="sema-svg h-auto w-full text-[var(--text)]" style={{ maxWidth: W * 1.5 }} role="img" aria-label={g.baslik}>
      {g.adimlar.map((a, i) => {
        const x1 = x(i) + KW / 2;
        const x2 = x(i + 1) + KW / 2;
        const yarim = a === "Y";
        return (
          <g key={`a${i}`}>
            <path d={`M ${x1} ${KY - 2} Q ${(x1 + x2) / 2} ${KY - 20} ${x2} ${KY - 2}`} fill="none" strokeWidth={1.3} className={yarim ? "stroke-[var(--warn)]" : a === "A" ? "stroke-[var(--accent)]" : "stroke-[var(--muted)]"} />
            <text x={(x1 + x2) / 2} y={KY - 13} textAnchor="middle" className={`text-[10px] font-bold ${yarim ? "fill-[var(--warn)]" : a === "A" ? "fill-[var(--accent)]" : "fill-[var(--muted)]"}`}>
              {a === "A" ? "1½" : a}
            </text>
          </g>
        );
      })}
      {g.notalar.map((nota, i) => {
        const vurgu = g.vurgu?.includes(i);
        const kok = i === 0 || i === n - 1;
        return (
          <g key={`n${i}`}>
            <rect x={x(i)} y={KY} width={KW} height={24} rx={6} strokeWidth={1.2} className={kok ? "fill-[var(--accent)] stroke-[var(--accent)]" : vurgu ? "fill-[var(--warn)] stroke-[var(--warn)]" : "fill-none stroke-[var(--muted)]"} />
            <text x={x(i) + KW / 2} y={KY + 16} textAnchor="middle" className={`text-[12px] font-semibold ${kok ? "fill-[var(--accent-ink)]" : vurgu ? "fill-[var(--warn-ink)]" : "fill-[var(--text)]"}`}>
              {goster(nota)}
            </text>
            {g.dereceler ? (
              <text x={x(i) + KW / 2} y={KY + 40} textAnchor="middle" className="fill-[var(--muted)] text-[10px] font-semibold">
                {goster(g.dereceler[i])}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
