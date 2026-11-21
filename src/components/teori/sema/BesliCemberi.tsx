import { BESLILER } from "@/content/teori/cember";
import type { CemberSemasi } from "@/content/teori/tipler";
import { goster } from "./ortak";

// Beşliler çemberi: dış halka majör, iç halka paralel minör tonlar, en dışta donanım (♯/♭ sayısı).
// Saat yönü tam beşli yukarı; komşu tonlar tek notada ayrışır. `vurgu`: işaretlenecek majör tonlar.

const R1 = 98;
const R2 = 70;
const R3 = 120;
const C = 132;

export default function BesliCemberi({ g }: { g: CemberSemasi }) {
  const vurgu = new Set(g.vurgu ?? []);
  const nokta = (i: number, r: number) => {
    const a = (i * 30 - 90) * (Math.PI / 180);
    return [C + r * Math.cos(a), C + r * Math.sin(a)] as const;
  };
  const donanim = (d: number) => (d === 0 ? "—" : d > 0 ? `${d}♯` : `${-d}♭`);
  return (
    <svg viewBox={`0 0 ${2 * C} ${2 * C}`} className="sema-svg h-auto w-full text-[var(--text)]" style={{ maxWidth: 2 * C * 1.3 }} role="img" aria-label={g.baslik}>
      <circle cx={C} cy={C} r={(R1 + R3) / 2 - 2} fill="none" className="stroke-[var(--line)]" strokeWidth={1} />
      <circle cx={C} cy={C} r={(R1 + R2) / 2} fill="none" className="stroke-[var(--line)]" strokeWidth={1} />
      <circle cx={C} cy={C} r={R2 - 16} fill="none" className="stroke-[var(--line)]" strokeWidth={1} />
      {BESLILER.map((b, i) => {
        const [x1, y1] = nokta(i, R1);
        const [x2, y2] = nokta(i, R2);
        const [x3, y3] = nokta(i, R3);
        const v = vurgu.has(b.major);
        const major = b.enarmonik ? `${goster(b.major)}/${goster(b.enarmonik.major)}` : goster(b.major);
        const minor = b.enarmonik ? `${goster(b.minor)}m/${goster(b.enarmonik.minor)}m` : `${goster(b.minor)}m`;
        return (
          <g key={b.major}>
            {v ? <circle cx={x1} cy={y1} r={14} className="fill-[var(--accent)]" /> : null}
            <text x={x1} y={y1 + 4.5} textAnchor="middle" className={`${b.enarmonik ? "text-[10px]" : "text-[14px]"} font-bold ${v ? "fill-[var(--accent-ink)]" : "fill-[var(--text)]"}`}>
              {major}
            </text>
            <text x={x2} y={y2 + 3.5} textAnchor="middle" className={`${b.enarmonik ? "text-[7.5px]" : "text-[10px]"} font-semibold ${v ? "fill-[var(--accent)]" : "fill-[var(--muted)]"}`}>
              {minor}
            </text>
            <text x={x3} y={y3 + 3} textAnchor="middle" className="fill-[var(--muted)] text-[9px]">
              {b.enarmonik ? `${donanim(b.donanim)}/${donanim(b.enarmonik.donanim)}` : donanim(b.donanim)}
            </text>
          </g>
        );
      })}
      <text x={C} y={C - 4} textAnchor="middle" className="fill-[var(--muted)] text-[9px] font-semibold">
        saat yönü
      </text>
      <text x={C} y={C + 8} textAnchor="middle" className="fill-[var(--muted)] text-[9px] font-semibold">
        tam 5&apos;li ↑
      </text>
    </svg>
  );
}
