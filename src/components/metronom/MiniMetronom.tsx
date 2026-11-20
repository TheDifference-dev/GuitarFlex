"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpLeft, GripHorizontal, Minus, Pause, Play, Plus, Volume2, VolumeX, X } from "lucide-react";
import { BPM_EN_AZ, BPM_EN_COK, TapTempo, masaustuKoprusu, metronomMotoru, olcuBul, type OlcuId } from "@/lib/metronom";
import { useMetronom, useVurusGostergesi } from "./kanca";
import s from "./MiniMetronom.module.css";

/** Küçük pencerede sunulan ölçüler (ana metronomda başka bir ölçü seçiliyse o da listelenir) */
const MINI_OLCULER: OlcuId[] = ["2/4", "3/4", "4/4", "6/8"];

export type MiniTur = "masaustu" | "pip" | "acilir";

type Props = {
  tur: MiniTur;
  /** Klavye ve ekran yenilemesi için pencere (tarayıcıdaki üstte pencerede o pencere) */
  pencere?: Window | null;
  onKapat?: () => void;
  onAnaPencere?: () => void;
};

/** Her zaman üstte duran küçük metronom: büyük BPM, −/+, kaydırıcı, çal/durdur, ölçü, vuruş noktaları, tap, ses */
export default function MiniMetronom({ tur, pencere, onKapat, onAnaPencere }: Props) {
  const motor = metronomMotoru();
  const d = useMetronom();
  const olcu = olcuBul(d.olcu);
  const tap = useRef(new TapTempo());
  const [tapYanik, setTapYanik] = useState(false);
  const [uyari, setUyari] = useState<string | null>(null);
  const oncekiSes = useRef(0.8);
  useVurusGostergesi(d.calisiyor, pencere);

  const calDurdur = async () => {
    const ok = await motor.degistir();
    setUyari(ok ? null : "Ses açılamadı: ▶ düğmesine bir kez tıkla.");
  };
  const tapVur = () => {
    const bpm = tap.current.vur();
    if (bpm !== null) motor.ayarla({ bpm });
    setTapYanik(true);
    window.setTimeout(() => setTapYanik(false), 90);
  };

  // Klavye: boşluk çal/durdur, ↑/↓ BPM (Shift ile 5), T tap tempo
  const tusRef = useRef({ calDurdur, tapVur });
  useEffect(() => {
    tusRef.current = { calDurdur, tapVur };
  });
  useEffect(() => {
    const w = pencere ?? window;
    const tus = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const hedef = e.target as HTMLElement | null;
      const etiket = hedef?.tagName;
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        if (e.repeat) return;
        // Odaktaki düğme boşlukla ayrıca tıklanmasın
        if (etiket === "BUTTON" || etiket === "INPUT" || etiket === "SELECT") hedef?.blur();
        void tusRef.current.calDurdur();
      } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        if (etiket === "SELECT") return;
        e.preventDefault();
        const adim = (e.shiftKey ? 5 : 1) * (e.key === "ArrowUp" ? 1 : -1);
        motor.ayarla({ bpm: motor.anlik().bpm + adim });
      } else if (e.code === "KeyT" || e.key === "t" || e.key === "T") {
        if (e.repeat) return;
        e.preventDefault();
        tusRef.current.tapVur();
      }
    };
    w.addEventListener("keydown", tus);
    return () => w.removeEventListener("keydown", tus);
  }, [pencere, motor]);

  const olcuSecenekleri = MINI_OLCULER.includes(d.olcu) ? MINI_OLCULER : [...MINI_OLCULER, d.olcu];
  const sessiz = d.ses === 0;
  const masaustu = tur === "masaustu";

  const dugme =
    "inline-flex items-center justify-center rounded-full text-muted transition-colors hover:bg-ink/10 hover:text-text";

  return (
    <div className={`${s.kok} flex h-full w-full flex-col bg-bg text-text`} aria-label="Küçük metronom">
      {/* Üst şerit: masaüstünde pencereyi sürükler; vuruş noktaları burada */}
      <div className={`${masaustu ? s.surukle : ""} flex h-[2em] shrink-0 items-center gap-[0.4em] px-[0.55em]`}>
        {masaustu && <GripHorizontal aria-hidden className="h-[1em] w-[1em] shrink-0 text-muted" />}
        <div className="flex flex-1 items-center justify-center gap-[0.45em]" aria-hidden>
          {Array.from({ length: olcu.vurus }, (_, i) => (
            <span key={i} className={s.nokta} data-bas={i === 0 ? "1" : undefined} data-yanik={d.vurus === i ? "1" : undefined} />
          ))}
        </div>
        {onAnaPencere && (
          <button type="button" onClick={onAnaPencere} title="Ana pencereye dön" aria-label="Ana pencereye dön" className={`${s.surukleme} ${dugme} h-[1.6em] w-[1.6em]`}>
            <ArrowUpLeft className="h-[1em] w-[1em]" />
          </button>
        )}
        {onKapat && (
          <button type="button" onClick={onKapat} title="Kapat" aria-label="Kapat" className={`${s.surukleme} ${dugme} h-[1.6em] w-[1.6em]`}>
            <X className="h-[1.05em] w-[1.05em]" />
          </button>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col justify-between gap-[0.3em] px-[0.75em] pb-[0.55em]">
        {/* BPM ve çal/durdur */}
        <div className="flex items-center gap-[0.45em]">
          <button type="button" onClick={() => motor.ayarla({ bpm: d.bpm - 1 })} aria-label="Tempoyu 1 azalt" className={`${dugme} h-[2em] w-[2em] border border-ink/15`}>
            <Minus className="h-[1em] w-[1em]" />
          </button>
          <div className="flex min-w-0 flex-1 items-baseline justify-center gap-[0.25em]" aria-live="polite">
            <span className={s.bpm}>{d.bpm}</span>
            <span className="text-[0.75em] text-muted">BPM</span>
          </div>
          <button type="button" onClick={() => motor.ayarla({ bpm: d.bpm + 1 })} aria-label="Tempoyu 1 artır" className={`${dugme} h-[2em] w-[2em] border border-ink/15`}>
            <Plus className="h-[1em] w-[1em]" />
          </button>
          <button
            type="button"
            onClick={() => void calDurdur()}
            aria-label={d.calisiyor ? "Durdur (boşluk)" : "Çal (boşluk)"}
            title={d.calisiyor ? "Durdur (boşluk)" : "Çal (boşluk)"}
            className="btn-primary ml-[0.2em] h-[2.7em] w-[2.7em] shrink-0 !rounded-full"
          >
            {d.calisiyor ? <Pause className="h-[1.2em] w-[1.2em]" fill="currentColor" /> : <Play className="ml-[0.1em] h-[1.2em] w-[1.2em]" fill="currentColor" />}
          </button>
        </div>

        <input
          type="range"
          min={BPM_EN_AZ}
          max={BPM_EN_COK}
          value={d.bpm}
          onChange={(e) => motor.ayarla({ bpm: Number(e.target.value) })}
          className={s.aralik}
          aria-label="Tempo"
        />

        {uyari && <p className="text-[0.75em] text-warn">{uyari}</p>}

        {/* Ölçü, tap tempo, ses */}
        <div className="flex items-center gap-[0.45em] text-[0.85em]">
          <select
            value={d.olcu}
            onChange={(e) => motor.ayarla({ olcu: e.target.value as OlcuId })}
            aria-label="Ölçü"
            className="h-[1.9em] rounded-[0.5em] border border-ink/15 bg-ink/[0.06] px-[0.35em]"
          >
            {olcuSecenekleri.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={tapVur}
            title="Tap tempo (T)"
            className={`h-[1.9em] rounded-[0.5em] border border-ink/15 px-[0.6em] font-medium transition-colors ${tapYanik ? "bg-primary text-primary-ink" : "bg-ink/[0.06] hover:bg-ink/10"}`}
          >
            Tap
          </button>
          <button
            type="button"
            onClick={() => {
              if (sessiz) motor.ayarla({ ses: oncekiSes.current || 0.8 });
              else {
                oncekiSes.current = d.ses;
                motor.ayarla({ ses: 0 });
              }
            }}
            aria-label={sessiz ? "Sesi aç" : "Sesi kapat"}
            className={`${dugme} h-[1.9em] w-[1.9em] shrink-0`}
          >
            {sessiz ? <VolumeX className="h-[1.1em] w-[1.1em]" /> : <Volume2 className="h-[1.1em] w-[1.1em]" />}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(d.ses * 100)}
            onChange={(e) => motor.ayarla({ ses: Number(e.target.value) / 100 })}
            className={`${s.aralik} min-w-0 flex-1`}
            aria-label="Ses düzeyi"
          />
        </div>
      </div>
    </div>
  );
}

/** Masaüstü uygulamasının küçük penceresinde (/metronom/mini) kapat / ana pencere düğmeleri */
export function miniPencereEylemleri(): { tur: MiniTur; onKapat: () => void; onAnaPencere: () => void } {
  const kopru = masaustuKoprusu();
  if (kopru) return { tur: "masaustu", onKapat: () => kopru.metronomMiniKapat(), onAnaPencere: () => kopru.anaPencereyeDon() };
  return {
    tur: "acilir",
    onKapat: () => window.close(),
    onAnaPencere: () => {
      const ana = window.opener as Window | null;
      if (ana && !ana.closed) ana.focus();
      else window.open("/araclar#metronom", "_blank");
    },
  };
}
