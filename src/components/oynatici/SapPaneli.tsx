"use client";

import { X } from "lucide-react";
import { noteName } from "@/lib/music";

/** Sapta gösterilecek bir nota: tel (1 = en kalın), perde, ölü (x) ya da bağlı (önceki notanın devamı) */
export type SapNotasi = { tel: number; perde: number; olu?: boolean; bagli?: boolean };

type Props = {
  /** Akort, inceden kalına (alphaTab sırası), MIDI */
  akort: number[];
  notalar: SapNotasi[];
  /** Ölçü ve vuruş bilgisi (ör. "Ölçü 5 · A7") */
  etiket?: string;
  /** Verilirse başlıkta kapat düğmesi (tercih kalıcı) */
  onKapat?: () => void;
};

const MARKERS = [3, 5, 7, 9, 15, 17, 19, 21];

/** Çalan notaları gitar sapı üzerinde gösteren alt panel (Songsterr'ın sap görünümüne benzer). */
export default function SapPaneli({ akort, notalar, etiket, onKapat }: Props) {
  const telSayisi = akort.length || 6;
  const enYuksek = notalar.reduce((m, n) => Math.max(m, n.perde), 0);
  const perdeSayisi = enYuksek > 15 ? 24 : 15;
  const W = 1000;
  const SOL = 34;
  const SAG = 8;
  const UST = 14;
  const ARA = 18;
  const H = UST + (telSayisi - 1) * ARA + 26;
  const pw = (W - SOL - SAG) / (perdeSayisi + 1);
  // 0. perde (boş tel) eşik çizgisinin solunda; diğerleri perde telleri arasında
  const x = (perde: number) => SOL + perde * pw + pw / 2;
  // Üstte en ince tel (tab yazımı gibi)
  const y = (tel: number) => UST + (telSayisi - tel) * ARA;

  return (
    <div className="glass border-t border-line px-3 pb-1.5 pt-1" role="region" aria-label="Sap paneli: çalan notalar">
      <div className="flex items-center gap-3 text-[11px] text-muted">
        <span className="font-semibold uppercase tracking-wide">Sap</span>
        <span className="tabular-nums">{etiket}</span>
        {onKapat && (
          <button type="button" onClick={onKapat} className="ml-auto rounded-full p-0.5 hover:bg-ink/10 hover:text-text" title="Sap panelini kapat (Ayarlar'dan yeniden açılır)" aria-label="Sap panelini kapat">
            <X size={14} />
          </button>
        )}
      </div>
      {/* İnce panel: yükseklik sınırlı, sap ortalanır (tabı sıkıştırmaz) */}
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto block max-h-[7.5rem] w-full" role="img" aria-label={notalar.length ? `Çalan: ${notalar.map((n) => `${n.tel}. tel ${n.olu ? "x" : n.perde}`).join(", ")}` : "Çalan nota yok"}>
        {MARKERS.filter((f) => f <= perdeSayisi).map((f) => (
          <circle key={f} cx={x(f)} cy={UST + ((telSayisi - 1) * ARA) / 2} r={4} className="fill-ink/10" />
        ))}
        {perdeSayisi >= 12 && (
          <>
            <circle cx={x(12)} cy={UST + ARA * 1.5} r={4} className="fill-ink/10" />
            <circle cx={x(12)} cy={UST + (telSayisi - 2.5) * ARA} r={4} className="fill-ink/10" />
          </>
        )}
        {Array.from({ length: perdeSayisi + 1 }, (_, f) => (
          <g key={f}>
            <line x1={SOL + (f + 1) * pw} x2={SOL + (f + 1) * pw} y1={UST} y2={UST + (telSayisi - 1) * ARA} className="stroke-ink/25" strokeWidth={f === 0 ? 4 : 1.2} />
            {f > 0 && (
              <text x={x(f)} y={H - 4} textAnchor="middle" className="fill-[var(--muted)] text-[10px]">
                {f}
              </text>
            )}
          </g>
        ))}
        {Array.from({ length: telSayisi }, (_, i) => {
          const tel = telSayisi - i;
          return (
            <g key={tel}>
              <line x1={SOL} x2={W - SAG} y1={y(tel)} y2={y(tel)} className="stroke-ink/45" strokeWidth={0.7 + (telSayisi - i) * 0.25} />
              <text x={12} y={y(tel) + 3.5} textAnchor="middle" className="fill-[var(--muted)] text-[10px] font-semibold">
                {akort[i] !== undefined ? noteName(akort[i]) : ""}
              </text>
            </g>
          );
        })}
        {notalar.map((n, i) => (
          <g key={`${n.tel}-${n.perde}-${i}`} className={n.bagli ? "opacity-50" : undefined}>
            {n.olu ? (
              <text x={x(n.perde)} y={y(n.tel) + 4} textAnchor="middle" className="fill-[var(--muted)] text-[13px] font-bold">
                ×
              </text>
            ) : (
              <>
                <circle cx={x(n.perde)} cy={y(n.tel)} r={8} className="fill-primary" />
                <text x={x(n.perde)} y={y(n.tel) + 3.5} textAnchor="middle" className="pointer-events-none fill-primary-ink text-[9.5px] font-bold">
                  {akort[telSayisi - n.tel] !== undefined ? noteName(akort[telSayisi - n.tel] + n.perde) : n.perde}
                </text>
              </>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
