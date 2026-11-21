import type { VurguSemasi } from "@/content/teori/tipler";

// Vuruş gücü çizelgesi: her satır bir ölçü; sütun yüksekliği vuruşun ağırlığı (3 güçlü, 2 orta, 1 zayıf).
// Altında sayım heceleri. Ölçü işaretlerinin "nasıl hissedildiğini" karşılaştırmak için.

const SW = 22;
const SOL = 52;
const SH = 52;

export default function VurguCizelgesi({ g }: { g: VurguSemasi }) {
  const enCok = Math.max(...g.satirlar.map((s) => s.vuruslar.length));
  const W = SOL + enCok * SW + 6;
  const H = g.satirlar.length * SH + 4;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="sema-svg h-auto w-full text-[var(--text)]" style={{ maxWidth: W * 1.5 }} role="img" aria-label={g.baslik}>
      {g.satirlar.map((s, r) => {
        const taban = r * SH + 32;
        return (
          <g key={s.ad}>
            <text x={2} y={taban - 6} className="fill-[var(--text)] text-[11px] font-bold">
              {s.ad}
            </text>
            <line x1={SOL - 2} x2={SOL + s.vuruslar.length * SW} y1={taban} y2={taban} className="stroke-[var(--line)]" strokeWidth={1} />
            {s.vuruslar.map((v, i) => (
              <g key={i}>
                <rect x={SOL + i * SW + 3} y={taban - v * 8} width={SW - 6} height={v * 8} rx={2} className={v === 3 ? "fill-[var(--accent)]" : v === 2 ? "fill-[var(--nota-ikincil)]" : "fill-[var(--line)]"} />
                <text x={SOL + i * SW + SW / 2} y={taban + 12} textAnchor="middle" className={`text-[9px] ${v === 3 ? "fill-[var(--text)] font-bold" : "fill-[var(--muted)]"}`}>
                  {s.sayim?.[i] ?? i + 1}
                </text>
              </g>
            ))}
          </g>
        );
      })}
    </svg>
  );
}
