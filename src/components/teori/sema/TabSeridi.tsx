import type { TabSemasi } from "@/content/teori/tipler";
import { goster } from "./ortak";

// Tab: altı çizgi, üstte 1. tel (ince Mi). Kolondaki rakamlar aynı anda, yan yana olanlar sırayla çalınır.
// `ritim`: tabın altına süreler (sap, kiriş, bayrak) — dörtlük tek sap, sekizlik tek kiriş, onaltılık çift kiriş.

const KW = 26;
const TG = 11;
const SOL = 24;

export default function TabSeridi({ g }: { g: TabSemasi }) {
  const UST = 16;
  const altTab = UST + 5 * TG;
  const ritimH = g.ritim ? 34 : 0;
  const etiketH = g.kolonlar.some((k) => k.e) ? 14 : 0;
  // Ölçü çizgileri: süreler toplamı ölçü boyunu doldurdukça
  const olcuBoy = g.olcu ? g.olcu[0] * (4 / g.olcu[1]) : null;
  const xs: number[] = [];
  const cizgiler: number[] = [];
  let x = SOL + 8;
  let t = 0;
  g.kolonlar.forEach((k, i) => {
    xs.push(x);
    x += KW * (g.ritim ? Math.max(0.8, Math.min(2, (k.d ?? 1) * 1.6)) : 1);
    t += k.d ?? 1;
    if (olcuBoy && Math.abs(t % olcuBoy) < 1e-6 && i < g.kolonlar.length - 1) {
      cizgiler.push(x - KW * 0.35);
      x += KW * 0.2;
    }
  });
  const W = x + 6;
  const H = altTab + 10 + ritimH + etiketH;
  const ty = (tel: number) => UST + (tel - 1) * TG;
  // Kirişler için vuruş grupları (bir vuruş içindeki sekizlik/onaltılıklar)
  const gruplar: number[][] = [];
  if (g.ritim) {
    let b = 0;
    let grup: number[] = [];
    g.kolonlar.forEach((k, i) => {
      const d = k.d ?? 1;
      if (d < 1) grup.push(i);
      b += d;
      if (Math.abs(b - Math.round(b)) < 1e-6) {
        if (grup.length) gruplar.push(grup);
        grup = [];
      }
    });
  }
  const sapUst = altTab + 8;
  const sapAlt = altTab + 8 + 24;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="sema-svg h-auto w-full text-[var(--text)]" style={{ maxWidth: W * 1.5 }} role="img" aria-label={g.baslik}>
      <text x={4} y={UST + TG * 1.3} className="fill-[var(--text)] text-[10px] font-bold">
        T
      </text>
      <text x={4} y={UST + TG * 2.6} className="fill-[var(--text)] text-[10px] font-bold">
        A
      </text>
      <text x={4} y={UST + TG * 3.9} className="fill-[var(--text)] text-[10px] font-bold">
        B
      </text>
      {[1, 2, 3, 4, 5, 6].map((tel) => (
        <line key={tel} x1={SOL - 4} x2={W - 4} y1={ty(tel)} y2={ty(tel)} className="stroke-[var(--muted)]" strokeWidth={0.8} />
      ))}
      <line x1={SOL - 4} x2={SOL - 4} y1={ty(1)} y2={ty(6)} stroke="currentColor" strokeWidth={1.2} />
      <line x1={W - 4} x2={W - 4} y1={ty(1)} y2={ty(6)} stroke="currentColor" strokeWidth={2.2} />
      {cizgiler.map((cx) => (
        <line key={cx} x1={cx} x2={cx} y1={ty(1)} y2={ty(6)} stroke="currentColor" strokeWidth={1} />
      ))}
      {g.kolonlar.map((k, i) => (
        <g key={i}>
          {k.teknik ? (
            <text x={xs[i] - KW * 0.5} y={UST - 5} textAnchor="middle" className="fill-[var(--accent)] text-[9px] font-bold italic">
              {k.teknik}
            </text>
          ) : null}
          {k.n.map((n) => (
            <g key={n.t}>
              <rect x={xs[i] - 6} y={ty(n.t) - 5} width={12} height={10} className="fill-[var(--bg)]" />
              <text x={xs[i]} y={ty(n.t) + 3.5} textAnchor="middle" className="fill-[var(--text)] text-[10px] font-semibold">
                {n.p}
              </text>
            </g>
          ))}
          {g.ritim && k.d !== undefined && k.d < 4 ? <line x1={xs[i]} x2={xs[i]} y1={k.d >= 2 ? sapUst + 10 : sapUst} y2={sapAlt} stroke="currentColor" strokeWidth={1} /> : null}
          {k.e ? (
            <text x={xs[i]} y={H - 3} textAnchor="middle" className="fill-[var(--muted)] text-[8.5px] font-semibold">
              {g.etiket === "nota" ? goster(k.e) : k.e}
            </text>
          ) : null}
        </g>
      ))}
      {gruplar.map((gr, gi) => {
        const d = (i: number) => g.kolonlar[i].d ?? 1;
        if (gr.length === 1) {
          const i = gr[0];
          return (
            <path key={gi} d={`M ${xs[i]} ${sapAlt} q 6 -4 7 -12`} fill="none" stroke="currentColor" strokeWidth={1.2} />
          );
        }
        return (
          <g key={gi}>
            <rect x={xs[gr[0]]} y={sapAlt - 3} width={xs[gr.at(-1)!] - xs[gr[0]]} height={3} fill="currentColor" />
            {gr.slice(0, -1).map((i, j) =>
              d(i) <= 0.25 && d(gr[j + 1]) <= 0.25 ? <rect key={i} x={xs[i]} y={sapAlt - 8} width={xs[gr[j + 1]] - xs[i]} height={3} fill="currentColor" /> : null,
            )}
          </g>
        );
      })}
    </svg>
  );
}
