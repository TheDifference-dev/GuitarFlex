import type { PiyanoSemasi } from "@/content/teori/tipler";
import { goster, notaSinifi } from "./ortak";

// Bir oktavlık klavye (Do'dan Do'ya): 12 farklı ses yan yana. Beyaz tuşlar doğal notalar, siyah tuşlar
// diyez/bemol. Ara notası olmayan Mi–Fa ve Si–Do yarım adımları köşeli çizgiyle işaretlenir.

const BW = 30;
const BH = 96;
const SW = 18;
const SH = 58;
const BEYAZ = ["C", "D", "E", "F", "G", "A", "B", "C"];
const SOLFEJ = ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si", "Do"];
const SIYAH: [number, string, string][] = [
  [1, "C#", "Db"],
  [2, "D#", "Eb"],
  [4, "F#", "Gb"],
  [5, "G#", "Ab"],
  [6, "A#", "Bb"],
];

export default function PiyanoKlavye({ g }: { g: PiyanoSemasi }) {
  const W = BEYAZ.length * BW + 4;
  const UST = 22;
  const H = UST + BH + 28;
  const vurgu = new Set((g.vurgu ?? []).map(notaSinifi));
  const yarimX = (a: string) => {
    const i = BEYAZ.indexOf(a);
    return 2 + (i + 1) * BW;
  };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="sema-svg h-auto w-full text-[var(--text)]" style={{ maxWidth: W * 1.5 }} role="img" aria-label={g.baslik}>
      {BEYAZ.map((n, i) => {
        const v = vurgu.has(notaSinifi(n));
        return (
          <g key={`w${i}`}>
            <rect x={2 + i * BW} y={UST} width={BW} height={BH} rx={3} strokeWidth={1} className={`stroke-[var(--muted)] ${v ? "fill-[var(--accent)]" : "fill-[var(--bg)]"}`} fillOpacity={v ? 0.25 : 1} />
            <text x={2 + i * BW + BW / 2} y={UST + BH - 18} textAnchor="middle" className="fill-[var(--text)] text-[11px] font-bold">
              {n}
            </text>
            <text x={2 + i * BW + BW / 2} y={UST + BH - 6} textAnchor="middle" className="fill-[var(--muted)] text-[8.5px]">
              {SOLFEJ[i]}
            </text>
          </g>
        );
      })}
      {SIYAH.map(([i, d, b]) => {
        const v = vurgu.has(notaSinifi(d));
        const cx = 2 + i * BW;
        return (
          <g key={d}>
            <rect x={cx - SW / 2} y={UST} width={SW} height={SH} rx={2} className={v ? "fill-[var(--accent)]" : "fill-[var(--text)]"} />
            <text x={cx} y={UST - 11} textAnchor="middle" className="fill-[var(--muted)] text-[8px] font-semibold">
              {goster(d)}
            </text>
            <text x={cx} y={UST - 2} textAnchor="middle" className="fill-[var(--muted)] text-[8px] font-semibold">
              {goster(b)}
            </text>
          </g>
        );
      })}
      {(g.yarimlar ?? []).map(([a]) => {
        const xx = yarimX(a);
        return (
          <g key={`y${a}`}>
            <path d={`M ${xx - 11} ${UST + BH + 5} v 5 h 22 v -5`} fill="none" strokeWidth={1.3} className="stroke-[var(--warn)]" />
            <text x={xx} y={UST + BH + 21} textAnchor="middle" className="fill-[var(--warn)] text-[9px] font-bold">
              Y
            </text>
          </g>
        );
      })}
    </svg>
  );
}
