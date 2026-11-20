"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Ear, Eye, Guitar, Pause, Play, SkipForward } from "lucide-react";
import TabPlayer, { type TabSource } from "@/components/TabPlayer";
import AkorSerisi from "./AkorSerisi";
import { formatClock } from "@/components/CourseView";
import { dersEslik, texOlcuBirimi } from "@/lib/eslik";

// Quick Study (Spec §7.3b): Dinle → 3 dk incele → eşlikle çal. Okuma ölçüleri yalnız porte (alphaTab ölçü aralığı),
// doğaçlama ölçüleri akor şeması. Tek tex: 7–12. ölçüler ilk dinlemedeki örnek doğaçlamadır ve çizilmez.

const INCELEME = 180;
const ADIMLAR = [
  { ad: "Dinle", ikon: Ear, metin: "Parçayı baştan sona bir kez dinle; notayı ve akorları takip et." },
  { ad: "3 dk incele", ikon: Eye, metin: "Donanım, ritim, en tiz ve en pes nota, doğaçlama akorları. Sessizce parmakla dene." },
  { ad: "Eşlikle çal", ikon: Guitar, metin: "Gitar susar; bas, akor ve davul çalar. Okuma bölümünü çal, sonra doğaçla." },
] as const;

type Props = {
  tex: string;
  chords: string[];
  readBars: [number, number];
  improvBars: [number, number];
  onPlayingChange?: (playing: boolean) => void;
};

export default function QuickStudy({ tex, chords, readBars, improvBars, onPlayingChange }: Props) {
  const [adim, setAdim] = useState(0);
  const [dinlendi, setDinlendi] = useState(false);
  const [kalan, setKalan] = useState(INCELEME);
  const [sayiyor, setSayiyor] = useState(false);
  const [bar, setBar] = useState<number | null>(null);
  const [ornek, setOrnek] = useState(false);
  const ob = texOlcuBirimi(tex);
  // Örnek doğaçlama gösterilince bütün ölçüler çizilir: yeni kaynak = yeni oynatıcı
  const source = useMemo<TabSource>(() => ({ kind: "tex", tex: dersEslik(tex, chords) }), [tex, chords, ornek]); // eslint-disable-line react-hooks/exhaustive-deps

  // İnceleme sayacı (3:00, atlanabilir); bitince eşlikle çalmaya geçilir
  const kalanRef = useRef(INCELEME);
  useEffect(() => {
    if (adim !== 1 || !sayiyor) return;
    const id = window.setInterval(() => {
      kalanRef.current = Math.max(0, kalanRef.current - 1);
      setKalan(kalanRef.current);
      if (kalanRef.current === 0) {
        setSayiyor(false);
        setAdim(2);
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [adim, sayiyor]);

  const git = (i: number) => {
    setAdim(i);
    setSayiyor(i === 1);
    if (i === 1 && kalanRef.current === 0) {
      kalanRef.current = INCELEME;
      setKalan(INCELEME);
    }
  };
  const dogaclamada = bar !== null && bar + 1 >= improvBars[0] && bar + 1 <= improvBars[1];
  const okumadaAkor = chords.slice(readBars[0] - 1, readBars[1]);

  return (
    <div className="space-y-4">
      {/* Akış */}
      <ol className="grid gap-3 sm:grid-cols-3">
        {ADIMLAR.map((a, i) => {
          const Ikon = a.ikon;
          const aktif = adim === i;
          const bitti = i < adim || (i === 0 && dinlendi);
          return (
            <li key={a.ad} className={`card p-4 transition ${aktif ? "border-accent/50 shadow-[0_0_0_1px_rgb(255_55_95/0.25)]" : "opacity-80"}`}>
              <button type="button" onClick={() => git(i)} className="flex w-full items-center gap-2 text-left font-semibold">
                <span className={`flex size-7 items-center justify-center rounded-full text-sm ${aktif ? "btn-grad p-0" : bitti ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10"}`}>
                  {bitti && !aktif ? <Check size={15} /> : i + 1}
                </span>
                <Ikon size={16} className={aktif ? "text-accent" : "text-muted"} /> {a.ad}
              </button>
              <p className="mt-1.5 text-sm text-muted">{a.metin}</p>
              {i === 0 && aktif && (
                <button type="button" onClick={() => git(1)} className="btn-soft mt-3 px-3 py-1.5 text-sm">
                  {dinlendi ? "Dinledim, incelemeye geç" : "İncelemeye geç"} <SkipForward size={14} />
                </button>
              )}
              {i === 1 && aktif && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-grad text-3xl font-bold tabular-nums" aria-live="polite">
                    {formatClock(kalan)}
                  </span>
                  <button type="button" onClick={() => setSayiyor((x) => !x)} className="btn-soft px-3 py-1.5 text-sm">
                    {sayiyor ? <Pause size={14} /> : <Play size={14} />} {sayiyor ? "Duraklat" : "Devam"}
                  </button>
                  <button type="button" onClick={() => git(2)} className="btn-soft px-3 py-1.5 text-sm" title="İncelemeyi atla">
                    Atla <SkipForward size={14} />
                  </button>
                </div>
              )}
              {i === 2 && aktif && <p className="mt-3 text-xs font-semibold text-accent">Gitar sessiz · Sayım açık · Çal&apos;a bas</p>}
            </li>
          );
        })}
      </ol>

      <section className="space-y-2">
        <h2 className="flex flex-wrap items-center gap-2 font-semibold">
          Okuma · ölçü {readBars[0]}–{readBars[1]}
          <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-0.5 text-xs font-semibold text-muted">Yalnız porte</span>
          {!dogaclamada && bar !== null && <span className="text-xs text-muted">Şu an: ölçü {bar + 1}</span>}
        </h2>
        <TabPlayer
          source={source}
          compact
          stave="score"
          barRange={ornek ? undefined : readBars}
          mutedTracks={adim === 2 ? [0] : []}
          initialLoop={false}
          onPlayingChange={onPlayingChange}
          onBar={setBar}
          onFinished={() => {
            setBar(null);
            if (adim === 0) setDinlendi(true);
          }}
        />
        <p className="text-xs text-muted">Okuma bölümünün akorları: {okumadaAkor.join(" · ")}</p>
      </section>

      <section className={`card space-y-3 p-5 transition ${dogaclamada ? "border-accent/50" : ""}`}>
        <h2 className="flex flex-wrap items-center gap-2 font-semibold">
          Doğaçlama · ölçü {improvBars[0]}–{improvBars[1]}
          <span className="btn-grad px-2.5 py-0.5 text-xs">Doğaçla</span>
          {dogaclamada && (
            <span className="text-sm text-accent" aria-live="polite">
              Şu an: ölçü {bar! + 1} · {chords[bar!]}
            </span>
          )}
        </h2>
        <p className="text-sm text-muted">Tab yok: akorlara bakarak kendi cümleni çal. Her akorun 1. vuruşunda akorun bir sesini hedefle.</p>
        <AkorSerisi chords={chords.slice(improvBars[0] - 1, improvBars[1])} ob={ob} ilkOlcu={improvBars[0]} aktif={dogaclamada ? bar! - (improvBars[0] - 1) : null} />
        <button type="button" onClick={() => setOrnek((x) => !x)} className="btn-soft px-3 py-1.5 text-sm" title="Dinlemedeki örnek doğaçlamanın notası">
          <Eye size={14} /> {ornek ? "Örnek doğaçlamayı gizle" : "Örnek doğaçlamayı notada göster"}
        </button>
      </section>
    </div>
  );
}
