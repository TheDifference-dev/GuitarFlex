"use client";

import { Eye, Headphones, Volume2, VolumeX } from "lucide-react";
import { AILE_ADI, enstruman } from "@/lib/enstruman";
import EnstrumanSimgesi from "./EnstrumanSimgesi";

export type MikserIzi = {
  index: number;
  name: string;
  percussion: boolean;
  /** General MIDI programı (aile, ad ve simge için; bkz. src/lib/enstruman.ts) */
  program: number;
  /** Akort (kalından inceye, ör. "E A D G B E"); telsiz track'te boş */
  tuning?: string;
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
  /** Pan (−100 sol … 100 sağ); verilmezse pan sütunu gösterilmez */
  pan?: Record<number, number>;
  onPan?: (i: number, deger: number) => void;
  /** Ana ses (%) */
  ana?: number;
  onAna?: (deger: number) => void;
  /** Play-along: yalnız bu track susar, ötekiler çalar */
  onYalnizBunuSustur?: (i: number) => void;
  /** Mikser ayarları bu şarkı için saklanıyor mu (bilgi satırı) */
  hatirlaniyor?: boolean;
};

const panYazi = (v: number) => (v === 0 ? "O" : v < 0 ? `S${-v}` : `Sğ${v}`);

/** Çok enstrümanlı parçada track başına ses, pan, solo, sessiz ve tabı/notası görüntülenen track seçimi. */
export default function Mikser({ izler, gosterilen, sessiz, solo, ses, onGoster, onSessiz, onSolo, onSes, pan, onPan, ana, onAna, onYalnizBunuSustur, hatirlaniyor }: Props) {
  const herhangiSolo = solo.size > 0;
  const gosterilenIz = izler.find((t) => t.index === gosterilen);
  const playAlong = !!gosterilenIz && sessiz.has(gosterilen) && sessiz.size === 1 && !herhangiSolo;
  const sutun = pan ? "sm:grid-cols-[minmax(11rem,15rem)_minmax(0,1fr)_7.5rem_auto]" : "sm:grid-cols-[minmax(11rem,15rem)_minmax(0,1fr)_auto]";
  return (
    <div className="space-y-2" role="group" aria-label="Mikser">
      {(onAna || onYalnizBunuSustur) && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pb-1">
          {onAna && ana !== undefined && (
            <label className="flex min-w-56 flex-1 items-center gap-2 text-sm">
              <span className="font-semibold">Ana ses</span>
              <input type="range" min={0} max={150} step={5} value={ana} onChange={(e) => onAna(Number(e.target.value))} className="w-full max-w-64 accent-[var(--accent)]" aria-label="Ana ses (mikser)" title="Ana ses: çalma çubuğundaki ses kaydırıcısıyla aynı" />
              <span className="w-10 text-right text-xs tabular-nums text-muted">%{ana}</span>
            </label>
          )}
          {onYalnizBunuSustur && gosterilenIz && (
            <button
              type="button"
              onClick={() => onYalnizBunuSustur(gosterilen)}
              aria-pressed={playAlong}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition ${playAlong ? "border-accent bg-accent text-accent-ink" : "border-ink/10 bg-ink/[0.04] hover:bg-ink/10"}`}
              title="Play-along: gösterilen track susar, bütün öteki enstrümanlar çalar; sen o partiyi çalarsın. Yeniden basınca hepsi açılır."
            >
              <Headphones size={14} /> {playAlong ? `Benim partim sessiz: ${gosterilenIz.name}` : `Benim enstrümanımı sessize al (${gosterilenIz.name})`}
            </button>
          )}
        </div>
      )}
      <div className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 text-[11px] font-semibold uppercase tracking-wide text-muted ${sutun}`}>
        <span>Enstrüman · göster</span>
        <span className="hidden sm:block">Ses</span>
        {pan && <span className="hidden sm:block">Pan</span>}
        <span className="text-right">Solo · Sessiz</span>
      </div>
      {izler.map((iz) => {
        const kapali = sessiz.has(iz.index) || (herhangiSolo && !solo.has(iz.index));
        const seviye = ses[iz.index] ?? 100;
        const e = enstruman(iz.program, iz.percussion, iz.name);
        const tab = !iz.percussion && !!iz.tuning;
        return (
          <div
            key={iz.index}
            className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 rounded-xl border px-2.5 py-1.5 ${sutun} ${gosterilen === iz.index ? "border-accent/50 bg-accent/[0.07]" : "border-ink/[0.07] bg-ink/[0.03]"} ${kapali ? "opacity-60" : ""}`}
          >
            <button
              type="button"
              onClick={() => onGoster(iz.index)}
              className={`flex min-w-0 items-center gap-2 text-left text-sm ${gosterilen === iz.index ? "text-accent" : "hover:text-text"}`}
              title={`${e.ad} · ${AILE_ADI[e.aile]}${iz.tuning ? ` · akort ${iz.tuning}` : ""}. Tıkla: bu track'in ${tab ? "tabını" : "notasını"} göster.`}
              aria-pressed={gosterilen === iz.index}
            >
              <EnstrumanSimgesi simge={e.simge} />
              <span className="min-w-0">
                <span className="block truncate font-semibold leading-tight">{iz.name}</span>
                <span className="block truncate text-[11px] leading-tight text-muted">
                  {e.ad} · {iz.percussion ? "davul notası" : tab ? "tab" : "nota"}
                </span>
              </span>
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
                onChange={(ev) => onSes(iz.index, Number(ev.target.value))}
                className="w-full accent-[var(--accent)]"
                aria-label={`${iz.name} ses seviyesi`}
              />
              <span className="w-10 text-right text-xs tabular-nums text-muted">%{seviye}</span>
            </label>
            {pan && onPan && (
              <label className="col-span-2 flex items-center gap-2 sm:col-span-1" title="Pan: sol – orta – sağ (çift tık: ortaya al)">
                <input
                  type="range"
                  min={-100}
                  max={100}
                  step={10}
                  value={pan[iz.index] ?? 0}
                  onChange={(ev) => onPan(iz.index, Number(ev.target.value))}
                  onDoubleClick={() => onPan(iz.index, 0)}
                  className="w-full accent-[var(--accent)]"
                  aria-label={`${iz.name} pan`}
                  aria-valuetext={panYazi(pan[iz.index] ?? 0)}
                />
                <span className="w-9 text-right text-xs tabular-nums text-muted">{panYazi(pan[iz.index] ?? 0)}</span>
              </label>
            )}
            <div className="row-start-1 flex justify-end gap-1 sm:row-start-auto">
              <button
                type="button"
                onClick={() => onSolo(iz.index)}
                className={`h-7 w-7 rounded-lg text-xs font-bold transition ${solo.has(iz.index) ? "bg-warn text-warn-ink" : "bg-ink/[0.07] text-muted hover:bg-ink/[0.12] hover:text-text"}`}
                title="Solo: yalnız bu track (ve diğer solo track'ler) çalar"
                aria-pressed={solo.has(iz.index)}
              >
                S
              </button>
              <button
                type="button"
                onClick={() => onSessiz(iz.index)}
                className={`h-7 w-7 rounded-lg text-xs font-bold transition ${sessiz.has(iz.index) ? "bg-bad text-bad-ink" : "bg-ink/[0.07] text-muted hover:bg-ink/[0.12] hover:text-text"}`}
                title="Sessiz"
                aria-pressed={sessiz.has(iz.index)}
              >
                M
              </button>
            </div>
          </div>
        );
      })}
      {hatirlaniyor && <p className="pt-1 text-xs text-muted">Ses, pan, solo ve sessiz ayarları bu şarkı için bu bilgisayarda hatırlanır.</p>}
    </div>
  );
}
