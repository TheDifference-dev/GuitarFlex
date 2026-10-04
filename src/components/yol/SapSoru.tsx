"use client";

import type { Sap } from "@/lib/alistirma/sorular";
import { anahtar } from "@/lib/alistirma/sorular";

// Teori yolları için sap: perde aralığı soruya göre değişir, her konum tıklanabilir.

const ISARET = [3, 5, 7, 9, 15, 17];
const TEL_Y = (s: number) => 20 + (s - 1) * 26;

type Props = {
  sap: Sap;
  secili?: string[];
  /** Cevaptan sonra: doğru konumlar (yeşil) ve yanlış seçilenler (kırmızı) */
  dogrular?: string[];
  kilitli?: boolean;
  onTik?: (s: number, f: number) => void;
};

export default function SapSoru({ sap, secili = [], dogrular, kilitli, onTik }: Props) {
  const [lo, hi] = sap.perde;
  const ilk = Math.max(lo, 1);
  const m = hi - ilk + 1;
  const sol = lo === 0 ? 34 : 18;
  const fw = Math.min(64, 900 / m);
  const W = sol + m * fw + 10;
  const H = TEL_Y(6) + 34;
  // Perde f'nin hücre ortası; açık teller (0) eşiğin solunda
  const x = (f: number) => (f === 0 ? sol - 16 : sol + (f - ilk) * fw + fw / 2);
  const perdeX = (f: number) => sol + (f - ilk + 1) * fw;
  const noktaAt = new Map(sap.noktalar.map((p) => [anahtar(p.s, p.f), p]));
  const perdeler = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-panel p-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full" style={{ minWidth: Math.min(W, 640), maxWidth: W * 1.25 }} role="img" aria-label="Gitar sapı">
        {/* tel vurgusu */}
        {sap.tel ? <rect x={0} y={TEL_Y(sap.tel) - 11} width={W} height={22} rx={6} className="fill-[var(--accent)]" opacity={0.18} /> : null}
        {/* perde çizgileri: 0'dan başlıyorsa kalın eşik */}
        {perdeler.map((f) =>
          f === 0 ? null : (
            <line key={`p${f}`} x1={perdeX(f)} x2={perdeX(f)} y1={TEL_Y(1)} y2={TEL_Y(6)} className="stroke-[var(--muted)]" strokeWidth={1.4} />
          ),
        )}
        <line x1={sol} x2={sol} y1={TEL_Y(1) - (lo === 0 ? 2 : 0)} y2={TEL_Y(6) + (lo === 0 ? 2 : 0)} className={lo === 0 ? "stroke-[var(--text)]" : "stroke-[var(--muted)]"} strokeWidth={lo === 0 ? 5 : 1.4} />
        {perdeler.map((f) =>
          f === 0 ? null : (
            <g key={`i${f}`}>
              {ISARET.includes(f) ? <circle cx={x(f)} cy={(TEL_Y(3) + TEL_Y(4)) / 2} r={4.5} className="fill-[var(--line)]" /> : null}
              {f === 12 ? (
                <>
                  <circle cx={x(f)} cy={(TEL_Y(2) + TEL_Y(3)) / 2} r={4.5} className="fill-[var(--line)]" />
                  <circle cx={x(f)} cy={(TEL_Y(4) + TEL_Y(5)) / 2} r={4.5} className="fill-[var(--line)]" />
                </>
              ) : null}
              <text x={x(f)} y={H - 6} textAnchor="middle" className="fill-[var(--muted)] text-[11px]">
                {f}
              </text>
            </g>
          ),
        )}
        {[1, 2, 3, 4, 5, 6].map((s) => (
          <line key={`t${s}`} x1={4} x2={W - 4} y1={TEL_Y(s)} y2={TEL_Y(s)} className="stroke-[var(--text)]" strokeOpacity={0.55} strokeWidth={0.7 + s * 0.35} />
        ))}
        {[1, 2, 3, 4, 5, 6].flatMap((s) =>
          perdeler.map((f) => {
            const k = anahtar(s, f);
            const p = noktaAt.get(k);
            const sec = secili.includes(k);
            const dogru = dogrular?.includes(k);
            const yanlis = dogrular && sec && !dogru;
            const cx = x(f);
            const cy = TEL_Y(s);
            let sinif = "";
            if (dogrular && dogru) sinif = "fill-emerald-500";
            else if (yanlis) sinif = "fill-rose-500";
            else if (sec) sinif = "fill-[var(--accent)]";
            else if (p?.tur === "kok") sinif = "fill-[var(--accent)]";
            else if (p?.tur === "soru") sinif = "fill-sky-500";
            else if (p?.tur === "referans") sinif = "fill-violet-500";
            else if (p) sinif = "fill-[var(--muted)]";
            const goster = Boolean(sinif);
            const etiket = p?.etiket ?? (dogrular && dogru && !p ? "✓" : yanlis ? "✕" : "");
            return (
              <g
                key={k}
                onClick={kilitli || !onTik ? undefined : () => onTik(s, f)}
                className={kilitli || !onTik ? "" : "cursor-pointer"}
                role={onTik && !kilitli ? "button" : undefined}
                aria-label={onTik && !kilitli ? `${s}. tel ${f}. perde` : undefined}
              >
                <rect x={cx - (f === 0 ? 14 : fw / 2)} y={cy - 12} width={f === 0 ? 28 : fw} height={24} fill="transparent" />
                {goster ? <circle cx={cx} cy={cy} r={10} className={sinif} /> : null}
                {goster && etiket ? (
                  <text x={cx} y={cy + 4} textAnchor="middle" className="pointer-events-none fill-white text-[11px] font-bold">
                    {etiket}
                  </text>
                ) : null}
              </g>
            );
          }),
        )}
      </svg>
    </div>
  );
}
