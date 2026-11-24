"use client";

import { Metronome, Music, Timer, Volume1, Volume2, VolumeX } from "lucide-react";
import { SES_UST, sesKazanci, type OynaticiAyarlari } from "./ayarlar";

type Kanal = { ad: string; simge: typeof Music; deger: keyof OynaticiAyarlari; sessiz: keyof OynaticiAyarlari; aciklama: string };

/** Üç ses kanalı: Müzik (parçalar), Metronom, Sayım. Her birinin kaydırıcısı ve sessiz düğmesi ayrı. */
export const KANALLAR: Kanal[] = [
  { ad: "Müzik", simge: Music, deger: "anaSes", sessiz: "sessiz", aciklama: "parçalar (MIDI)" },
  { ad: "Metronom", simge: Metronome, deger: "metronomSesi", sessiz: "metronomSessiz", aciklama: "tık" },
  { ad: "Sayım", simge: Timer, deger: "sayimSesi", sessiz: "sayimSessiz", aciklama: "başlamadan önceki ölçü" },
];

/** Kanalın etkin yüzdesi (sessizde 0) */
export const kanalYuzde = (a: OynaticiAyarlari, k: Kanal) => (a[k.sessiz] ? 0 : Math.round(sesKazanci(a[k.deger]) * 100));

/**
 * Ses kanalları paneli (kontrol çubuğundaki "Ses" paneli ve Ayarlar): Müzik, Metronom ve Sayım için ayrı kaydırıcı
 * (%0–450) ve ayrı sessiz düğmesi. Müziği kısmak ya da sessize almak metronomu ve sayımı KAPATMAZ.
 */
export default function SesKanallari({ ayarlar, guncelle }: { ayarlar: OynaticiAyarlari; guncelle: (d: Partial<OynaticiAyarlari>) => void }) {
  return (
    <div className="space-y-2.5" data-ses-kanallari>
      {KANALLAR.map((k) => {
        const yuzde = kanalYuzde(ayarlar, k);
        const sessiz = !!ayarlar[k.sessiz];
        const Simge = k.simge;
        const kayitli = Math.round(sesKazanci(ayarlar[k.deger]) * 100);
        return (
          <div key={k.ad} className="flex items-center gap-2 text-sm" data-ses-kanali={k.deger}>
            <button
              type="button"
              onClick={() => guncelle(sessiz || kayitli === 0 ? { [k.sessiz]: false, ...(kayitli === 0 ? { [k.deger]: 100 } : {}) } : { [k.sessiz]: true })}
              aria-pressed={yuzde === 0}
              aria-label={yuzde === 0 ? `${k.ad} sesini aç` : `${k.ad} sesini kapat`}
              title={yuzde === 0 ? `${k.ad}: sessiz (tıkla: aç)` : `${k.ad}: sessize al`}
              className="flex size-8 shrink-0 items-center justify-center rounded-full hover:bg-ink/[0.08]"
            >
              {yuzde === 0 ? <VolumeX size={16} className="text-bad" /> : yuzde < 50 ? <Volume1 size={16} /> : <Volume2 size={16} />}
            </button>
            <span className="flex w-24 shrink-0 items-center gap-1.5">
              <Simge size={14} className="shrink-0 text-muted" aria-hidden />
              <span className="leading-tight">
                <span className="block font-semibold">{k.ad}</span>
                <span className="block text-[10px] text-muted">{k.aciklama}</span>
              </span>
            </span>
            <input
              type="range"
              min={0}
              max={SES_UST}
              step={5}
              value={yuzde}
              onChange={(e) => guncelle({ [k.deger]: Number(e.target.value), [k.sessiz]: false })}
              className="min-w-0 flex-1 accent-[var(--accent)]"
              aria-label={`${k.ad} sesi`}
              title={`${k.ad} sesi (%0–${SES_UST})`}
            />
            <span className={`w-12 shrink-0 text-right tabular-nums ${yuzde > 150 ? "font-semibold text-text" : "text-muted"}`}>%{yuzde}</span>
          </div>
        );
      })}
      <p className="text-xs text-muted">
        Üç kanal ayrıdır: müziği kısmak ya da sessize almak metronomu ve sayımı kapatmaz. Üst sınır %{SES_UST}; çıkıştaki sınırlayıcı yüksek seslerde bozulmayı önler.
      </p>
    </div>
  );
}
