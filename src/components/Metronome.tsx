"use client";

import { useEffect } from "react";
import { BPM_EN_AZ, BPM_EN_COK, OLCULER, metronomMotoru, olcuBul, type OlcuId } from "@/lib/metronom";
import { useMetronom, useVurusGostergesi } from "./metronom/kanca";
import MiniPencereDugmesi from "./metronom/MiniPencereDugmesi";

/** Web Audio ile zamanlanan, kaymayan metronom. Ayarlar küçük pencereyle paylaşılır (src/lib/metronom.ts). */
export default function Metronome() {
  const motor = metronomMotoru();
  const d = useMetronom();
  const beats = olcuBul(d.olcu).vurus;
  useVurusGostergesi(d.calisiyor);

  // Sayfadan ayrılınca sustur
  useEffect(() => () => motor.durdur(), [motor]);

  return (
    <div className="space-y-5 card p-6">
      <div className="flex items-end gap-4">
        <p className="text-6xl font-semibold tabular-nums">{d.bpm}</p>
        <p className="pb-2 text-muted">BPM</p>
      </div>
      <input
        type="range"
        min={BPM_EN_AZ}
        max={BPM_EN_COK}
        value={d.bpm}
        onChange={(e) => motor.ayarla({ bpm: Number(e.target.value) })}
        className="w-full accent-[var(--accent)]"
        aria-label="Tempo"
      />
      <div className="flex flex-wrap items-center gap-2">
        {[-5, -1, 1, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => motor.ayarla({ bpm: d.bpm + n })}
            className="rounded-md border border-line px-3 py-1.5 tabular-nums"
          >
            {n > 0 ? `+${n}` : n}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-2 text-sm">
          Ölçü
          <select value={d.olcu} onChange={(e) => motor.ayarla({ olcu: e.target.value as OlcuId })} className="rounded-lg border border-ink/10 bg-ink/[0.05] px-2.5 py-1.5">
            {OLCULER.map((o) => (
              <option key={o.id} value={o.id}>
                {o.id}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex gap-2">
        {Array.from({ length: beats }, (_, i) => (
          <span key={i} className={`h-3 flex-1 rounded-full ${d.vurus === i ? "bg-accent" : "bg-line"}`} />
        ))}
      </div>
      <button type="button" onClick={() => void motor.degistir()} className="btn-primary w-full py-3 text-lg">
        {d.calisiyor ? "Durdur" : "Başlat"}
      </button>
      <MiniPencereDugmesi />
    </div>
  );
}
