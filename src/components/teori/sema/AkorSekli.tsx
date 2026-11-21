import type { AkorSekliVeri } from "@/content/teori/tipler";
import { ACIK, akorAdi, goster, notaSinifi, pc } from "./ortak";

// Akor diyagramı (dikey): solda kalın Mi, üstte eşik. Kök vurgu renginde, içindeki sayı parmak numarası
// (1 işaret, 2 orta, 3 yüzük, 4 serçe). Aynı parmak aynı perdede birden çok teldeyse barre çizilir.

const W = 92;
const SOL = 16;
const UST = 30;
const TEL = (W - SOL - 8) / 5;
const PG = 17;

export default function AkorSekli({ a }: { a: AkorSekliVeri }) {
  const perdeler = a.sekil.split(" ").map((x) => (x === "x" ? null : Number(x)));
  const parmak = a.parmak?.split(" ").map(Number) ?? [];
  const basili = perdeler.filter((f): f is number => f !== null && f > 0);
  const enUst = Math.max(...basili, 1);
  const enAlt = Math.min(...basili, 99);
  const ilk = enUst > 5 ? enAlt : 1;
  const satir = Math.max(4, enUst - ilk + 1);
  const H = UST + satir * PG + 18;
  const kokPc = notaSinifi(a.kok);
  const tx = (i: number) => SOL + i * TEL;
  const py = (f: number) => UST + (f - ilk + 0.5) * PG;
  // Barre: aynı parmak numarası, aynı perde, en az üç tel
  const barre: { f: number; ilk: number; son: number; n: number } | null = (() => {
    for (const n of [1, 2, 3]) {
      const idx = perdeler.map((f, i) => (f && parmak[i] === n ? i : -1)).filter((i) => i >= 0);
      if (idx.length >= 2 && idx.every((i) => perdeler[i] === perdeler[idx[0]]) && idx.at(-1)! - idx[0] >= 2) return { f: perdeler[idx[0]]!, ilk: idx[0], son: idx.at(-1)!, n };
    }
    return null;
  })();
  return (
    <figure className="akor-sekli flex flex-col items-center">
      <svg viewBox={`0 0 ${W} ${H}`} className="sema-svg h-auto w-full text-[var(--text)]" style={{ maxWidth: W * 1.45 }} role="img" aria-label={`${a.ad} akoru: ${a.sekil}`}>
        <text x={W / 2 + SOL / 2 - 4} y={11} textAnchor="middle" className="fill-[var(--text)] text-[12px] font-bold">
          {akorAdi(a.ad)}
        </text>
        {ilk === 1 ? <rect x={tx(0)} y={UST - 3} width={tx(5) - tx(0)} height={3.5} fill="currentColor" /> : (
          <text x={2} y={py(ilk) + 3.5} className="fill-[var(--muted)] text-[9px] font-semibold">
            {ilk}
          </text>
        )}
        {Array.from({ length: satir + 1 }, (_, r) => (
          <line key={`r${r}`} x1={tx(0)} x2={tx(5)} y1={UST + r * PG} y2={UST + r * PG} className="stroke-[var(--muted)]" strokeWidth={0.9} />
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <line key={`s${i}`} x1={tx(i)} x2={tx(i)} y1={UST} y2={UST + satir * PG} stroke="currentColor" strokeOpacity={0.7} strokeWidth={0.9} />
        ))}
        {barre ? <rect x={tx(barre.ilk) - 6} y={py(barre.f) - 6} width={tx(barre.son) - tx(barre.ilk) + 12} height={12} rx={6} className="fill-[var(--nota-ikincil)]" /> : null}
        {perdeler.map((f, i) => {
          const kok = f !== null && kokPc !== null && pc(ACIK[6 - i] + f) === kokPc;
          if (f === null)
            return (
              <text key={i} x={tx(i)} y={UST - 7} textAnchor="middle" className="fill-[var(--muted)] text-[9px]">
                ✕
              </text>
            );
          if (f === 0) return <circle key={i} cx={tx(i)} cy={UST - 10} r={3.3} fill="none" strokeWidth={1.2} className={kok ? "stroke-[var(--accent)]" : "stroke-[var(--text)]"} />;
          const barreIci = barre && f === barre.f && i > barre.ilk && i < barre.son && parmak[i] === barre.n && !kok;
          if (barreIci) return null;
          return (
            <g key={i}>
              <circle cx={tx(i)} cy={py(f)} r={6.2} className={kok ? "fill-[var(--accent)]" : "fill-[var(--nota-ikincil)]"} />
              {parmak[i] ? (
                <text x={tx(i)} y={py(f) + 3} textAnchor="middle" className={`${kok ? "fill-[var(--accent-ink)]" : "fill-[var(--bg)]"} text-[8px] font-semibold`}>
                  {parmak[i]}
                </text>
              ) : null}
            </g>
          );
        })}
        <text x={(tx(0) + tx(5)) / 2} y={H - 4} textAnchor="middle" className="fill-[var(--muted)] text-[8.5px]">
          {a.alt ?? a.formul.split(" ").map(goster).join(" ")}
        </text>
      </svg>
    </figure>
  );
}
