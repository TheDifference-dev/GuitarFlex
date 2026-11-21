import type { AkisSemasi as Veri } from "@/content/teori/tipler";

// Akış şeması: sırayla yapılacak adımlar kutularda, aralarında ok; `dongu` ise sondan başa dönüş oku.

const KW = 74;
const ARA = 18;

export default function AkisSemasi({ g }: { g: Veri }) {
  const n = g.adimlar.length;
  const W = n * KW + (n - 1) * ARA + 4;
  const H = g.dongu ? 62 : 44;
  const x = (i: number) => 2 + i * (KW + ARA);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="sema-svg h-auto w-full text-[var(--text)]" style={{ maxWidth: W * 1.5 }} role="img" aria-label={g.baslik}>
      <defs>
        <marker id="akis-ok" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0 0 L8 4 L0 8 z" className="fill-[var(--muted)]" />
        </marker>
      </defs>
      {g.adimlar.map((a, i) => {
        const [ust, alt] = a.split("|");
        return (
          <g key={a}>
            <rect x={x(i)} y={4} width={KW} height={34} rx={8} className={i === 0 ? "fill-[var(--accent)]" : "fill-none stroke-[var(--muted)]"} strokeWidth={1.2} />
            <text x={x(i) + KW / 2} y={alt ? 18 : 25} textAnchor="middle" className={`text-[10.5px] font-bold ${i === 0 ? "fill-[var(--accent-ink)]" : "fill-[var(--text)]"}`}>
              {ust}
            </text>
            {alt ? (
              <text x={x(i) + KW / 2} y={31} textAnchor="middle" className={`text-[8.5px] ${i === 0 ? "fill-[var(--accent-ink)]" : "fill-[var(--muted)]"}`}>
                {alt}
              </text>
            ) : null}
            {i < n - 1 ? <line x1={x(i) + KW + 2} x2={x(i + 1) - 3} y1={21} y2={21} className="stroke-[var(--muted)]" strokeWidth={1.3} markerEnd="url(#akis-ok)" /> : null}
          </g>
        );
      })}
      {g.dongu ? (
        <path d={`M ${x(n - 1) + KW / 2} 40 V 54 H ${x(0) + KW / 2} V 43`} fill="none" className="stroke-[var(--muted)]" strokeWidth={1.2} strokeDasharray="3 2" markerEnd="url(#akis-ok)" />
      ) : null}
    </svg>
  );
}
