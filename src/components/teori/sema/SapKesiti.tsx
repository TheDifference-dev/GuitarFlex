import type { SapSemasi } from "@/content/teori/tipler";
import { goster, TEL_HARF } from "./ortak";

// Sap kesiti: yatay sap, üstte 1. tel (ince Mi), altta 6. tel (kalın Mi) — tab ile aynı yön.
// Kök vurgu renginde, karakteristik nota uyarı renginde; gölgeli bölgeler kutu ya da CAGED biçimi.
// Renkler CSS değişkenlerinden; açık ve koyu modda okunur.

const PW = 34; // perde genişliği
const TG = 16; // tel aralığı
const SOL = 20;
const ACIK_W = 24;

export default function SapKesiti({ g }: { g: SapSemasi }) {
  const [bas, son] = g.perde;
  const acik = bas === 0;
  const ilk = acik ? 1 : bas;
  const UST = g.bolgeler?.length ? 24 : 10;
  const x0 = SOL + (acik ? ACIK_W : 6);
  const perdeSay = son - ilk + 1;
  const W = x0 + perdeSay * PW + 8;
  const H = UST + 5 * TG + 26;
  const y = (t: number) => UST + (t - 1) * TG;
  /** Perde p'nin ortası (notanın yeri); açık tel eşiğin solunda */
  const x = (p: number) => (p === 0 ? SOL + ACIK_W / 2 : x0 + (p - ilk + 0.5) * PW);
  const cizgiX = (p: number) => x0 + (p - ilk + 1) * PW; // p. perde telinin x'i
  const isaret = [3, 5, 7, 9, 15, 17, 19, 21].filter((p) => p >= ilk && p <= son);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="sema-svg h-auto w-full text-[var(--text)]" style={{ maxWidth: W * 1.5 }} role="img" aria-label={g.baslik}>
      {g.bolgeler?.map((b, i) => (
        <g key={`b${i}`}>
          <rect x={x0 + (Math.max(b.bas, ilk) - ilk) * PW + 1} y={UST - 6} width={(Math.min(b.son, son) - Math.max(b.bas, ilk) + 1) * PW - 2} height={5 * TG + 12} rx={6} className="fill-[var(--accent)]" fillOpacity={i % 2 ? 0.07 : 0.13} />
          <text x={x0 + ((Math.max(b.bas, ilk) + Math.min(b.son, son) + 1) / 2 - ilk) * PW} y={UST - 10} textAnchor="middle" className="fill-[var(--accent)] text-[10px] font-semibold">
            {b.ad}
          </text>
        </g>
      ))}
      {isaret.map((p) => (
        <circle key={`i${p}`} cx={x(p)} cy={UST + 2.5 * TG} r={3.2} className="fill-[var(--line)]" />
      ))}
      {son >= 12 && ilk <= 12 ? (
        <>
          <circle cx={x(12)} cy={UST + 1.5 * TG} r={3.2} className="fill-[var(--line)]" />
          <circle cx={x(12)} cy={UST + 3.5 * TG} r={3.2} className="fill-[var(--line)]" />
        </>
      ) : null}
      {/* eşik ya da başlangıç çizgisi, perde telleri */}
      <line x1={x0} x2={x0} y1={UST} y2={y(6)} stroke="currentColor" strokeWidth={acik ? 4 : 1.2} />
      {Array.from({ length: perdeSay }, (_, i) => (
        <line key={`p${i}`} x1={cizgiX(ilk + i)} x2={cizgiX(ilk + i)} y1={UST} y2={y(6)} className="stroke-[var(--muted)]" strokeWidth={1.1} />
      ))}
      {[1, 2, 3, 4, 5, 6].map((t) => (
        <g key={`t${t}`}>
          <line x1={acik ? SOL + 4 : x0} x2={W - 8} y1={y(t)} y2={y(t)} stroke="currentColor" strokeOpacity={0.6} strokeWidth={0.6 + t * 0.22} />
          <text x={8} y={y(t) + 3.5} textAnchor="middle" className="fill-[var(--muted)] text-[9px] font-semibold">
            {TEL_HARF[t]}
          </text>
        </g>
      ))}
      {Array.from({ length: perdeSay }, (_, i) => (
        <text key={`n${i}`} x={x(ilk + i)} y={H - 6} textAnchor="middle" className="fill-[var(--muted)] text-[9px]">
          {ilk + i}
        </text>
      ))}
      {acik ? (
        <text x={x(0)} y={H - 6} textAnchor="middle" className="fill-[var(--muted)] text-[9px]">
          0
        </text>
      ) : null}
      {g.baglar?.map(([a, b], i) => {
        const n1 = g.noktalar[a];
        const n2 = g.noktalar[b];
        return <line key={`g${i}`} x1={x(n1.p)} y1={y(n1.t)} x2={x(n2.p)} y2={y(n2.t)} className="stroke-[var(--accent)]" strokeWidth={2} strokeDasharray="3 2.5" />;
      })}
      {g.noktalar.map((n, i) => {
        const etiket = n.e ? goster(n.e) : "";
        const uzun = etiket.length > 2;
        const sinif =
          n.k === "kok" ? "fill-[var(--accent)]" : n.k === "vurgu" ? "fill-[var(--warn)]" : n.k === "soluk" ? "fill-[var(--bg)] stroke-[var(--nota-ikincil)]" : "fill-[var(--nota-ikincil)]";
        const yazi = n.k === "kok" ? "fill-[var(--accent-ink)]" : n.k === "vurgu" ? "fill-[var(--warn-ink)]" : n.k === "soluk" ? "fill-[var(--text)]" : "fill-[var(--bg)]";
        return (
          <g key={`d${i}`}>
            <circle cx={x(n.p)} cy={y(n.t)} r={uzun ? 8.2 : 7.4} className={sinif} strokeWidth={1.2} />
            {etiket ? (
              <text x={x(n.p)} y={y(n.t) + 3.2} textAnchor="middle" className={`${yazi} ${uzun ? "text-[7.5px]" : "text-[8.5px]"} font-semibold`}>
                {etiket}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
