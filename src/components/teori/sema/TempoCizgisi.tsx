import type { TempoSemasi } from "@/content/teori/tipler";

// Tempo zaman çizgisi: aynı süre (saniye) içinde farklı BPM'lerin vuruşları. Vuruş aralığı = 60 / BPM saniye.

const SOL = 54;
const GEN = 300;
const SH = 26;

export default function TempoCizgisi({ g }: { g: TempoSemasi }) {
  const W = SOL + GEN + 10;
  const H = g.bpm.length * SH + 22;
  const x = (sn: number) => SOL + (sn / g.saniye) * GEN;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="sema-svg h-auto w-full text-[var(--text)]" style={{ maxWidth: W * 1.5 }} role="img" aria-label={g.baslik}>
      {Array.from({ length: g.saniye + 1 }, (_, s) => (
        <g key={`s${s}`}>
          <line x1={x(s)} x2={x(s)} y1={6} y2={H - 16} className="stroke-[var(--line)]" strokeWidth={1} strokeDasharray="2 2" />
          <text x={x(s)} y={H - 4} textAnchor="middle" className="fill-[var(--muted)] text-[9px]">
            {s} sn
          </text>
        </g>
      ))}
      {g.bpm.map((b, r) => {
        const yy = 14 + r * SH;
        const aralik = 60 / b;
        const n = Math.floor(g.saniye / aralik + 1e-9);
        return (
          <g key={b}>
            <text x={2} y={yy + 4} className="fill-[var(--text)] text-[10px] font-bold">
              {b} BPM
            </text>
            <line x1={SOL} x2={SOL + GEN} y1={yy} y2={yy} className="stroke-[var(--muted)]" strokeWidth={0.8} />
            {Array.from({ length: n + 1 }, (_, i) => (
              <circle key={i} cx={x(i * aralik)} cy={yy} r={i % 4 === 0 ? 4.5 : 3.2} className={i % 4 === 0 ? "fill-[var(--accent)]" : "fill-[var(--nota-ikincil)]"} />
            ))}
          </g>
        );
      })}
    </svg>
  );
}
