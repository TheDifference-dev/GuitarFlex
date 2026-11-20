"use client";

import { Drum, Eye, Guitar, Music, Volume2, VolumeX } from "lucide-react";

export type MikserIzi = {
  index: number;
  name: string;
  percussion: boolean;
  /** General MIDI programı (simge seçimi için) */
  program: number;
};

type Props = {
  izler: MikserIzi[];
  gosterilen: number;
  sessiz: Set<number>;
  solo: Set<number>;
  ses: Record<number, number>;
  onGoster: (i: number) => void;
  onSessiz: (i: number) => void;
  onSolo: (i: number) => void;
  onSes: (i: number, deger: number) => void;
};

function Simge({ iz }: { iz: MikserIzi }) {
  if (iz.percussion) return <Drum size={15} aria-hidden />;
  if (iz.program >= 24 && iz.program <= 39) return <Guitar size={15} aria-hidden />;
  return <Music size={15} aria-hidden />;
}

/** Çok enstrümanlı parçada track başına ses seviyesi, solo, sessiz ve tabı görüntülenen track seçimi. */
export default function Mikser({ izler, gosterilen, sessiz, solo, ses, onGoster, onSessiz, onSolo, onSes }: Props) {
  const herhangiSolo = solo.size > 0;
  return (
    <div className="space-y-1.5" role="group" aria-label="Mikser">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 text-[11px] font-semibold uppercase tracking-wide text-muted sm:grid-cols-[minmax(10rem,14rem)_minmax(0,1fr)_auto]">
        <span>Enstrüman · tabı göster</span>
        <span className="hidden sm:block">Ses</span>
        <span className="text-right">Solo · Sessiz</span>
      </div>
      {izler.map((iz) => {
        const kapali = sessiz.has(iz.index) || (herhangiSolo && !solo.has(iz.index));
        const seviye = ses[iz.index] ?? 100;
        return (
          <div
            key={iz.index}
            className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 rounded-xl border px-2.5 py-1.5 sm:grid-cols-[minmax(10rem,14rem)_minmax(0,1fr)_auto] ${gosterilen === iz.index ? "border-accent/50 bg-accent/[0.07]" : "border-white/[0.07] bg-white/[0.03]"} ${kapali ? "opacity-60" : ""}`}
          >
            <button
              type="button"
              onClick={() => onGoster(iz.index)}
              className={`flex min-w-0 items-center gap-2 text-left text-sm font-semibold ${gosterilen === iz.index ? "text-accent" : "hover:text-text"}`}
              title={iz.percussion ? "Davul notasını göster" : "Bu track'in tabını göster"}
              aria-pressed={gosterilen === iz.index}
            >
              <Simge iz={iz} />
              <span className="truncate">{iz.name}</span>
              {gosterilen === iz.index && <Eye size={13} className="shrink-0 opacity-80" aria-label="görüntüleniyor" />}
            </button>
            <label className="col-span-2 flex items-center gap-2 sm:col-span-1">
              {seviye === 0 ? <VolumeX size={14} className="text-muted" aria-hidden /> : <Volume2 size={14} className="text-muted" aria-hidden />}
              <input
                type="range"
                min={0}
                max={150}
                step={5}
                value={seviye}
                onChange={(e) => onSes(iz.index, Number(e.target.value))}
                className="w-full accent-[var(--accent)]"
                aria-label={`${iz.name} ses seviyesi`}
              />
              <span className="w-10 text-right text-xs tabular-nums text-muted">%{seviye}</span>
            </label>
            <div className="row-start-1 flex justify-end gap-1 sm:row-start-auto">
              <button
                type="button"
                onClick={() => onSolo(iz.index)}
                className={`h-7 w-7 rounded-lg text-xs font-bold transition ${solo.has(iz.index) ? "bg-amber-400 text-black" : "bg-white/[0.07] text-muted hover:bg-white/[0.12] hover:text-text"}`}
                title="Solo: yalnız bu track (ve diğer solo track'ler) çalar"
                aria-pressed={solo.has(iz.index)}
              >
                S
              </button>
              <button
                type="button"
                onClick={() => onSessiz(iz.index)}
                className={`h-7 w-7 rounded-lg text-xs font-bold transition ${sessiz.has(iz.index) ? "bg-rose-500 text-white" : "bg-white/[0.07] text-muted hover:bg-white/[0.12] hover:text-text"}`}
                title="Sessiz"
                aria-pressed={sessiz.has(iz.index)}
              >
                M
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
