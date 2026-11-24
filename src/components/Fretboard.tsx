"use client";

import { INTERVALS, degreeIn, noteName, pitchAt, playMidi, type PitchSet } from "@/lib/music";

const MARKERS = [3, 5, 7, 9, 15, 17];
const W = 980;
const H = 210;
const LEFT = 40;
const TOP = 22;
const STRING_GAP = (H - TOP - 30) / 5;

/** Sap Gezgini: bir perdedeki işaret (etiket ve tür); null ise boş */
export type SapIsaret = { e: string; k: "kok" | "nota" | "vurgu" | "soluk" };

type Props = {
  /** Gösterilecek gam/akor; boşsa tüm notalar soluk görünür. */
  set?: PitchSet;
  root?: number;
  label?: "note" | "interval";
  solfege?: boolean;
  /** Tek bir pozisyonu vurgula (nota bulma testi). */
  highlight?: { string: number; fret: number } | null;
  hideLabels?: boolean;
  onPick?: (string: number, fret: number) => void;
  /** Gösterilen perde sayısı (varsayılan 15) */
  frets?: number;
  /** Verilirse notalar set/root yerine bu işlevle işaretlenir (Sap Gezgini) */
  isaret?: (string: number, fret: number, midi: number) => SapIsaret | null;
};

const yFor = (string: number) => TOP + (string - 1) * STRING_GAP;

export default function Fretboard({ set, root = 0, label = "note", solfege = false, highlight, hideLabels, onPick, frets = 15, isaret }: Props) {
  const FRETS = frets;
  const FRET_W = (W - LEFT - 10) / (FRETS + 1);
  const xFor = (fret: number) => LEFT + fret * FRET_W + FRET_W / 2;
  return (
    <div className="overflow-x-auto card p-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="min-w-[720px]" role="img" aria-label="Gitar sapı">
        {/* perde numaraları */}
        {Array.from({ length: FRETS + 1 }, (_, f) => (
          <text key={`n${f}`} x={xFor(f)} y={H - 4} textAnchor="middle" className="fill-[var(--muted)] text-[11px]">
            {f}
          </text>
        ))}
        {/* işaret noktaları */}
        {MARKERS.filter((f) => f <= FRETS).map((f) => (
          <circle key={`m${f}`} cx={xFor(f)} cy={TOP + 2.5 * STRING_GAP} r={5} className="fill-[var(--line)]" />
        ))}
        <circle cx={xFor(12)} cy={TOP + 1.5 * STRING_GAP} r={5} className="fill-[var(--line)]" />
        <circle cx={xFor(12)} cy={TOP + 3.5 * STRING_GAP} r={5} className="fill-[var(--line)]" />
        {/* perde telleri */}
        {Array.from({ length: FRETS + 1 }, (_, f) => (
          <line
            key={`f${f}`}
            x1={LEFT + (f + 1) * FRET_W}
            x2={LEFT + (f + 1) * FRET_W}
            y1={TOP}
            y2={TOP + 5 * STRING_GAP}
            className="stroke-[var(--muted)]"
            strokeWidth={f === 0 ? 5 : 1.5}
          />
        ))}
        {/* teller */}
        {[1, 2, 3, 4, 5, 6].map((s) => (
          <g key={`s${s}`}>
            <line x1={LEFT} x2={W - 10} y1={yFor(s)} y2={yFor(s)} className="stroke-[var(--text)]" strokeOpacity={0.55} strokeWidth={0.8 + s * 0.35} />
            <text x={14} y={yFor(s) + 4} textAnchor="middle" className="fill-[var(--muted)] text-[12px] font-semibold">
              {noteName(pitchAt(s, 0))}
            </text>
          </g>
        ))}
        {/* notalar */}
        {[1, 2, 3, 4, 5, 6].flatMap((s) =>
          Array.from({ length: FRETS + 1 }, (_, f) => {
            const midi = pitchAt(s, f);
            if (isaret) {
              const x = isaret(s, f, midi);
              if (!x) return null;
              const soluk = x.k === "soluk";
              return (
                <g key={`${s}-${f}`} onClick={() => playMidi(midi)} className="cursor-pointer" data-sap={`${s}:${f}`} data-tur={x.k}>
                  <circle
                    cx={xFor(f)}
                    cy={yFor(s)}
                    r={soluk ? 9 : 12}
                    className={x.k === "kok" ? "fill-[var(--accent)]" : x.k === "vurgu" ? "fill-[var(--warn)]" : soluk ? "fill-[var(--line)]" : "fill-[var(--nota-ikincil)]"}
                  />
                  <text
                    x={xFor(f)}
                    y={yFor(s) + 3.5}
                    textAnchor="middle"
                    className={`pointer-events-none font-semibold ${x.e.length > 2 ? "text-[8.5px]" : "text-[10px]"} ${x.k === "kok" ? "fill-[var(--accent-ink)]" : x.k === "vurgu" ? "fill-[var(--warn-ink)]" : soluk ? "fill-[var(--muted)]" : "fill-[var(--bg)]"}`}
                  >
                    {x.e}
                  </text>
                </g>
              );
            }
            const deg = set ? degreeIn(midi, root, set) : null;
            const isHighlight = highlight?.string === s && highlight?.fret === f;
            const shown = isHighlight || deg !== null;
            if (!shown && !onPick) return null;
            const isRoot = deg === 0;
            const text = isHighlight && hideLabels ? "?" : label === "interval" && deg !== null ? INTERVALS[deg] : noteName(midi, solfege);
            return (
              <g
                key={`${s}-${f}`}
                onClick={() => (onPick ? onPick(s, f) : playMidi(midi))}
                className="cursor-pointer"
              >
                <circle
                  cx={xFor(f)}
                  cy={yFor(s)}
                  r={shown ? 12 : 10}
                  className={
                    isHighlight
                      ? "fill-[var(--accent)]"
                      : isRoot
                        ? "fill-[var(--accent)]"
                        : shown
                          ? "fill-[var(--nota-ikincil)]"
                          : "fill-transparent hover:fill-[var(--line)]"
                  }
                />
                {shown && !(hideLabels && !isHighlight) && (
                  <text
                    x={xFor(f)}
                    y={yFor(s) + 4}
                    textAnchor="middle"
                    className={`pointer-events-none text-[10px] font-semibold ${isHighlight || isRoot ? "fill-[var(--accent-ink)]" : "fill-[var(--bg)]"}`}
                  >
                    {text}
                  </text>
                )}
              </g>
            );
          }),
        )}
      </svg>
    </div>
  );
}
