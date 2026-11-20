"use client";

import { useEffect, useMemo, useState } from "react";
import { Layers, Lightbulb, ListMusic, Music } from "lucide-react";
import TabPlayer, { type TabSource } from "@/components/TabPlayer";
import type { LibrarySong } from "@/content/types";
import { addPracticeTime } from "@/lib/progress";
import { SERBEST } from "@/lib/oyun";
import { ROL_ADI } from "./ortak";

/** Şarkı sayfası: çok track'li tab oynatıcı, kısım listesi, akorlar, çalışma ipuçları ve track bilgisi */
export default function LibrarySongView({ song }: { song: LibrarySong }) {
  const source = useMemo<TabSource>(() => ({ kind: "tex", tex: song.tex }), [song.tex]);
  // Çalarken geçen süre "Serbest Çalışma" görevine yazılır (5 sn'de bir; Doğaçlama sayfasındaki gibi)
  const [caliyor, setCaliyor] = useState(false);
  useEffect(() => {
    if (!caliyor) return;
    const key = `${SERBEST}kutuphane/${song.slug}`;
    let bekleyen = 0;
    const id = window.setInterval(() => {
      if (++bekleyen >= 5) {
        addPracticeTime(key, bekleyen, song.bpm, Number.MAX_SAFE_INTEGER);
        bekleyen = 0;
      }
    }, 1000);
    return () => {
      window.clearInterval(id);
      if (bekleyen) addPracticeTime(key, bekleyen, song.bpm, Number.MAX_SAFE_INTEGER);
    };
  }, [caliyor, song.slug, song.bpm]);

  return (
    <div className="space-y-6">
      <TabPlayer source={source} onPlayingChange={setCaliyor} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className="card p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <ListMusic size={18} className="text-accent" /> Form ve kısımlar
          </h2>
          <p className="mt-1 text-sm text-muted">
            {song.bars} yazılı ölçü{song.playedBars !== song.bars ? `, tekrarlarla ${song.playedBars} ölçü` : ""} · {song.timeSignature}
            {song.feel ? ` · ${song.feel}` : ""}. Ölçü numaraları tabdaki gibidir; kısım adları tabın üstünde yazar.
          </p>
          <ol className="mt-3 divide-y divide-line/60">
            {song.parts.map((p) => (
              <li key={`${p.name}-${p.bars[0]}`} className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-3 py-2.5 text-sm">
                <span>
                  <span className="block font-semibold">{p.name}</span>
                  <span className="block text-xs tabular-nums text-muted">
                    {p.bars[0]}–{p.bars[1]}. ölçü{p.repeat ? ` · ${p.repeat}×` : ""}
                  </span>
                </span>
                <span className="min-w-0">
                  <span className="flex flex-wrap gap-1">
                    {p.chords.map((c) => (
                      <span key={c} className="rounded-md bg-white/[0.07] px-1.5 py-0.5 font-mono text-xs">
                        {c}
                      </span>
                    ))}
                  </span>
                  {p.focus && <span className="mt-1 block text-xs text-muted">{p.focus}</span>}
                </span>
              </li>
            ))}
          </ol>
        </section>

        <div className="space-y-6">
          <section className="card p-5">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Music size={18} className="text-accent" /> Akorlar
            </h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {song.chords.map((c) => (
                <span key={c} className="rounded-lg border border-white/10 bg-white/[0.05] px-2.5 py-1 font-mono text-sm font-semibold">
                  {c}
                </span>
              ))}
            </div>
            {!!song.techniques.length && (
              <p className="mt-3 text-sm text-muted">
                Teknikler: <span className="text-text">{song.techniques.join(", ")}</span>
              </p>
            )}
          </section>

          <section className="card p-5">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Layers size={18} className="text-accent" /> Track&apos;ler
            </h2>
            <ul className="mt-2 space-y-1.5 text-sm">
              {song.tracks.map((t, i) => (
                <li key={`${t.name}-${i}`} className="flex items-baseline justify-between gap-3">
                  <span className="font-semibold">{t.name}</span>
                  <span className="text-right text-xs text-muted">
                    {ROL_ADI[t.role]} · {t.instrument}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted">
              Oynatıcıdaki Mikser&apos;den bir enstrümanın tabını gösterebilir, sesini ayarlayabilir, sessize alabilir (M) ya da tek başına çalabilirsin (S).
              {song.tracks.some((t) => ["keys", "strings", "organ"].includes(t.role)) &&
                " Piyano, org ve yaylılar notayla gösterilir."}
            </p>
          </section>
        </div>
      </div>

      <section className="card p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Lightbulb size={18} className="text-accent" /> Çalışma ipuçları
        </h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-muted">
          {song.tips.map((t) => (
            <li key={t}>{t}</li>
          ))}
          <li>Döngü açıkken parça sürekli tekrar eder; hız ayarıyla tempoyu düşürebilir, bir kısmı seçip yalnız onu çalışabilirsin.</li>
        </ul>
      </section>

      <p className="text-xs text-muted">
        Kaynak: {song.source}
        {song.origin ? ` · ${song.origin}` : ""}. Notalar, düzenleme ve eşlik GuitarFlex&apos;e aittir.
      </p>
    </div>
  );
}
