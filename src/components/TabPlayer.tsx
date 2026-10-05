"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { noteName } from "@/lib/music";

// alphaTab tarayıcıya klasik bir <script> olarak yüklenir (public/alphatab, bkz. scripts/copy-alphatab.mjs).
// Böylece web worker ve font dosyalarını kendi yolundan bulur; bundler ayarı gerekmez.

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    alphaTab?: any;
  }
}

const SCRIPT = "/alphatab/alphaTab.min.js";
let loader: Promise<any> | null = null;

function loadAlphaTab(): Promise<any> {
  if (window.alphaTab) return Promise.resolve(window.alphaTab);
  loader ??= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT;
    s.async = true;
    s.onload = () => resolve(window.alphaTab);
    s.onerror = () => {
      loader = null;
      reject(new Error("alphaTab yüklenemedi"));
    };
    document.head.appendChild(s);
  });
  return loader;
}

export type TabSource =
  | { kind: "tex"; tex: string }
  | { kind: "url"; url: string }
  | { kind: "file"; data: ArrayBuffer; name: string };

type View = "tab" | "score-tab" | "score";
type TrackInfo = { index: number; name: string; percussion: boolean; tuning: string };

type Props = {
  source: TabSource;
  /** Egzersiz modu: tek track, sade araç çubuğu. */
  compact?: boolean;
  onBpmChange?: (bpm: number) => void;
  onPlayingChange?: (playing: boolean) => void;
};

const SPEEDS = [50, 75, 100];
/** "Sayım" (başlamadan önce bir ölçü say) tercihi tarayıcıda saklanır */
const COUNT_IN_KEY = "gf-sayim";

const COUNT_IN_EVENT = "gf-sayim-degisti";

function storedCountIn(): string | null {
  try {
    return window.localStorage.getItem(COUNT_IN_KEY);
  } catch {
    return null;
  }
}

function subscribeCountIn(onChange: () => void) {
  window.addEventListener(COUNT_IN_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(COUNT_IN_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function saveCountIn(on: boolean) {
  try {
    window.localStorage.setItem(COUNT_IN_KEY, on ? "1" : "0");
  } catch {
    // Saklanamazsa tercih sadece bu sayfada geçerli olur.
  }
  window.dispatchEvent(new Event(COUNT_IN_EVENT));
}

function formatTime(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// Her kaynak nesnesine sabit bir anahtar ver: kaynak değişince oynatıcı temiz durumla yeniden kurulur.
const sourceIds = new WeakMap<TabSource, number>();
let nextSourceId = 0;

export default function TabPlayer(props: Props) {
  let id = sourceIds.get(props.source);
  if (id === undefined) {
    id = ++nextSourceId;
    sourceIds.set(props.source, id);
  }
  return <Player key={id} {...props} />;
}

function Player({ source, compact = false, onBpmChange, onPlayingChange }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);
  const atRef = useRef<any>(null);

  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [playerReady, setPlayerReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [meta, setMeta] = useState<{ title: string; artist: string; tempo: number }>({ title: "", artist: "", tempo: 120 });
  const [tracks, setTracks] = useState<TrackInfo[]>([]);
  const [shown, setShown] = useState(0);
  const [muted, setMuted] = useState<Set<number>>(new Set());
  const [solo, setSolo] = useState<Set<number>>(new Set());
  const [position, setPosition] = useState({ current: 0, end: 0 });
  const [hasRange, setHasRange] = useState(false);

  const [speed, setSpeed] = useState(100);
  const [metronome, setMetronome] = useState(compact);
  const stored = useSyncExternalStore(subscribeCountIn, storedCountIn, () => null);
  const [countInOverride, setCountInOverride] = useState<boolean | null>(null);
  const countIn = countInOverride ?? (stored === null ? compact : stored === "1");
  const setCountIn = useCallback((on: boolean) => {
    setCountInOverride(on);
    saveCountIn(on);
  }, []);
  /** Sayım sürerken kalan vuruş (ekranda büyük rakam); sayım yoksa null */
  const [counting, setCounting] = useState<number | null>(null);
  const [loop, setLoop] = useState(compact);
  const [zoom, setZoom] = useState(100);
  const [horizontal, setHorizontal] = useState(false);
  const [view, setView] = useState<View>("tab");

  // Callback'leri ve görünüm ayarlarını ref'te tut: değişmeleri player'ı yeniden kurmasın.
  const callbacks = useRef({ onBpmChange, onPlayingChange });
  const display = useRef({ view, zoom, horizontal });
  const playback = useRef({ countIn, speed });
  /** "Hemen başla" ile sayımsız başlatılan çalmada sayım gösterilmez */
  const skipNext = useRef(false);
  useEffect(() => {
    callbacks.current = { onBpmChange, onPlayingChange };
    display.current = { view, zoom, horizontal };
    playback.current = { countIn, speed };
  });

  const staveProfile = useCallback((v: View, percussion: boolean) => {
    const P = atRef.current.StaveProfile;
    if (percussion || v === "score") return P.Score;
    return v === "tab" ? P.Tab : P.ScoreTab;
  }, []);

  // Kaynak değiştiğinde player'ı kur.
  useEffect(() => {
    let disposed = false;

    loadAlphaTab()
      .then((at) => {
        if (disposed || !hostRef.current) return;
        atRef.current = at;
        // Worker'lar blob üzerinden açıldığı için yollar tam URL olmalı.
        const abs = (path: string) => new URL(path, window.location.href).href;
        const { view: v, zoom: z, horizontal: h } = display.current;
        // Tab renkleri paletten (globals.css) okunur.
        const css = getComputedStyle(document.documentElement);
        const color = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
        const ink = color("--sheet-ink", "#000000");
        const api = new at.AlphaTabApi(hostRef.current, {
          core: { fontDirectory: abs("/alphatab/font/"), scriptFile: abs(SCRIPT) },
          display: {
            staveProfile: staveProfile(v, false),
            scale: z / 100,
            layoutMode: h ? at.LayoutMode.Horizontal : at.LayoutMode.Page,
            resources: {
              mainGlyphColor: ink,
              secondaryGlyphColor: color("--muted", "#666666"),
              staffLineColor: color("--muted", "#666666"),
              barSeparatorColor: ink,
              barNumberColor: color("--accent", "#c00000"),
            },
          },
          // Parmak numaraları (sol el 1–4, sağ el p-i-m-a) tab görünümünde de notaların üstünde görünsün
          notation: { fingeringMode: at.FingeringMode.SingleNoteEffectBand },
          player: {
            playerMode: at.PlayerMode.EnabledSynthesizer,
            soundFont: abs("/alphatab/soundfont/sonivox.sf2"),
            scrollElement: viewportRef.current,
            enableUserInteraction: true,
          },
        });
        apiRef.current = api;
        // Şarkı adı, sanatçı ve akort zaten arayüzde gösteriliyor; tab alanında tekrar çizilmesin.
        const E = at.NotationElement;
        for (const el of [E.ScoreTitle, E.ScoreSubTitle, E.ScoreArtist, E.ScoreAlbum, E.ScoreWords, E.ScoreMusic, E.ScoreWordsAndMusic, E.ScoreCopyright, E.GuitarTuning]) {
          api.settings.notation.elements.set(el, false);
        }
        api.updateSettings();

        api.scoreLoaded.on((score: any) => {
          if (disposed) return;
          setMeta({ title: score.title, artist: score.artist, tempo: score.tempo });
          setTracks(
            score.tracks.map((t: any) => {
              const staff = t.staves[0];
              // alphaTab akordu inceden kalına tutar; kalından inceye yaz (E A D G B E).
              const tuning = staff?.isPercussion ? "" : [...(staff?.tuning ?? [])].reverse().map((m: number) => noteName(m)).join(" ");
              return { index: t.index, name: t.name || `Track ${t.index + 1}`, percussion: !!staff?.isPercussion, tuning };
            }),
          );
        });
        api.renderFinished.on(() => !disposed && setStatus("ready"));
        api.error.on(() => !disposed && setStatus("error"));
        api.playerReady.on(() => !disposed && setPlayerReady(true));
        let countTimer = 0;
        const stopCounting = () => {
          window.clearInterval(countTimer);
          setCounting(null);
        };
        api.playerStateChanged.on((e: { state: number }) => {
          if (disposed) return;
          const isPlaying = e.state === 1;
          setPlaying(isPlaying);
          callbacks.current.onPlayingChange?.(isPlaying);
          stopCounting();
          const skipped = skipNext.current;
          if (isPlaying) skipNext.current = false;
          if (!isPlaying || skipped || !playback.current.countIn || !api.score) return;
          // alphaTab çalmaya başlamadan önce bulunulan ölçünün vuruş sayısı kadar sayar
          const tick = api.tickPosition ?? 0;
          const bars = api.score.masterBars;
          const bar = [...bars].reverse().find((b: any) => b.start <= tick) ?? bars[0];
          const tempo = (bar?.tempoAutomations?.[0]?.value ?? api.score.tempo) * (playback.current.speed / 100);
          const beatMs = (60000 / tempo) * (4 / bar.timeSignatureDenominator);
          let left = bar.timeSignatureNumerator;
          setCounting(left);
          countTimer = window.setInterval(() => {
            left--;
            if (left > 0) setCounting(left);
            else stopCounting();
          }, beatMs);
        });
        let last = 0;
        api.playerPositionChanged.on((e: { currentTime: number; endTime: number }) => {
          if (disposed) return;
          const now = performance.now();
          if (now - last < 200 && e.currentTime !== 0) return;
          last = now;
          setPosition({ current: e.currentTime, end: e.endTime });
        });
        api.playbackRangeChanged.on((e: { playbackRange: unknown }) => !disposed && setHasRange(!!e.playbackRange));

        if (source.kind === "tex") api.tex(source.tex, [0]);
        else if (source.kind === "url") api.load(source.url, [0]);
        else api.load(new Uint8Array(source.data), [0]);
      })
      .catch(() => !disposed && setStatus("error"));

    return () => {
      disposed = true;
      setCounting(null);
      apiRef.current?.destroy();
      apiRef.current = null;
    };
  }, [source, staveProfile]);

  // Görünen track ve görünüm türü
  useEffect(() => {
    const api = apiRef.current;
    const track = api?.score?.tracks[shown];
    if (!track) return;
    api.settings.display.staveProfile = staveProfile(view, !!track.staves[0]?.isPercussion);
    api.updateSettings();
    api.renderTracks([track]);
  }, [shown, view, tracks, staveProfile]);

  // Zoom ve yerleşim
  useEffect(() => {
    const api = apiRef.current;
    if (!api?.score) return;
    api.settings.display.scale = zoom / 100;
    api.settings.display.layoutMode = horizontal ? atRef.current.LayoutMode.Horizontal : atRef.current.LayoutMode.Page;
    api.updateSettings();
    api.render();
  }, [zoom, horizontal]);

  // Çalma ayarları
  useEffect(() => {
    const api = apiRef.current;
    if (!api) return;
    api.playbackSpeed = speed / 100;
    api.metronomeVolume = metronome ? 1 : 0;
    api.isLooping = loop;
    api.countInVolume = countIn ? 1 : 0;
  }, [speed, metronome, loop, countIn, playerReady]);

  useEffect(() => {
    callbacks.current.onBpmChange?.(Math.round((meta.tempo * speed) / 100));
  }, [meta.tempo, speed]);

  /** Sayımı iptal et: çalma başlamadan durur */
  const cancelCountIn = useCallback(() => {
    apiRef.current?.pause();
    setCounting(null);
  }, []);

  /** Sayımı atla: beklemeden hemen çalmaya başlar */
  const skipCountIn = useCallback(() => {
    const api = apiRef.current;
    if (!api) return;
    api.pause();
    skipNext.current = true;
    api.countInVolume = 0;
    api.play();
    api.countInVolume = playback.current.countIn ? 1 : 0;
    setCounting(null);
  }, []);

  const clearRange = useCallback(() => {
    const api = apiRef.current;
    if (!api) return;
    api.playbackRange = null;
    api.clearPlaybackRangeHighlight();
    setHasRange(false);
  }, []);

  // Klavye kısayolları: boşluk = çal/duraklat, L = döngü, M = metronom, Esc = seçimi temizle
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest("input, textarea, select, button, [contenteditable]")) return;
      if (e.code === "Space") {
        e.preventDefault();
        apiRef.current?.playPause();
      } else if (e.key === "l" || e.key === "L") setLoop((x) => !x);
      else if (e.key === "m" || e.key === "M") setMetronome((x) => !x);
      else if (e.key === "Escape") {
        if (counting !== null) cancelCountIn();
        else clearRange();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [clearRange, cancelCountIn, counting]);

  const toggleIn = (set: Set<number>, i: number) => {
    const next = new Set(set);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    return next;
  };

  const toggleMute = (i: number) => {
    const api = apiRef.current;
    const next = toggleIn(muted, i);
    setMuted(next);
    api?.changeTrackMute([api.score.tracks[i]], next.has(i));
  };

  const toggleSolo = (i: number) => {
    const api = apiRef.current;
    const next = toggleIn(solo, i);
    setSolo(next);
    api?.changeTrackSolo([api.score.tracks[i]], next.has(i));
  };

  const changeVolume = (i: number, value: number) => {
    const api = apiRef.current;
    api?.changeTrackVolume([api.score.tracks[i]], value / 100);
  };

  const bpm = Math.round((meta.tempo * speed) / 100);
  const btn = "rounded-md border border-line px-2.5 py-1.5 text-sm disabled:opacity-40";
  const on = "border-accent bg-accent text-accent-ink";

  return (
    <div className="rounded-xl border border-line bg-panel">
      {/* Ana araç çubuğu */}
      <div className="sticky top-[57px] z-[5] space-y-3 rounded-t-xl border-b border-line bg-panel p-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => apiRef.current?.playPause()}
            disabled={!playerReady}
            className="min-w-28 rounded-lg bg-accent px-4 py-2 font-semibold text-accent-ink disabled:opacity-40"
            title="Çal / Duraklat (Boşluk)"
          >
            {playing ? "❚❚ Duraklat" : "▶ Çal"}
          </button>
          <button type="button" onClick={() => apiRef.current?.stop()} disabled={!playerReady} className={btn} title="Başa dön">
            ■
          </button>

          <div className="flex min-w-48 flex-1 items-center gap-2 text-sm tabular-nums">
            <span>{formatTime(position.current)}</span>
            <input
              type="range"
              min={0}
              max={Math.max(1, position.end)}
              value={position.current}
              onChange={(e) => {
                const t = Number(e.target.value);
                if (apiRef.current) apiRef.current.timePosition = t;
                setPosition((p) => ({ ...p, current: t }));
              }}
              disabled={!playerReady}
              className="flex-1 accent-[var(--accent)]"
              aria-label="Konum"
            />
            <span className="text-muted">{formatTime(position.end)}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted">Hız</span>
          {SPEEDS.map((s) => (
            <button key={s} type="button" onClick={() => setSpeed(s)} className={`${btn} ${speed === s ? on : ""}`}>
              %{s}
            </button>
          ))}
          <input
            type="range"
            min={25}
            max={200}
            step={5}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-24 accent-[var(--accent)]"
            aria-label="Hız"
          />
          <span className="w-16 tabular-nums">{bpm} BPM</span>

          <span className="mx-1 h-5 w-px bg-line" />
          <button type="button" onClick={() => setMetronome((x) => !x)} className={`${btn} ${metronome ? on : ""}`} title="Metronom (M)">
            Metronom
          </button>
          <button
            type="button"
            onClick={() => setCountIn(!countIn)}
            className={`${btn} ${countIn ? on : ""}`}
            title={countIn ? "Sayım açık: başlamadan önce bir ölçü sayar. Kapatmak için tıkla." : "Sayım kapalı: Çal'a basınca hemen başlar."}
          >
            Sayım {countIn ? "açık" : "kapalı"}
          </button>
          <button type="button" onClick={() => setLoop((x) => !x)} className={`${btn} ${loop ? on : ""}`} title="Döngü (L)">
            Döngü
          </button>
          {hasRange && (
            <button type="button" onClick={clearRange} className={btn} title="Seçimi temizle (Esc)">
              Seçimi kaldır ✕
            </button>
          )}

          <span className="mx-1 h-5 w-px bg-line" />
          <div className="flex overflow-hidden rounded-md border border-line">
            {(
              [
                ["tab", "Tab"],
                ["score-tab", "Nota+Tab"],
                ["score", "Nota"],
              ] as const
            ).map(([v, label]) => (
              <button key={v} type="button" onClick={() => setView(v)} className={`px-2.5 py-1.5 ${view === v ? "bg-accent text-accent-ink" : ""}`}>
                {label}
              </button>
            ))}
          </div>
          {!compact && (
            <button type="button" onClick={() => setHorizontal((x) => !x)} className={`${btn} ${horizontal ? on : ""}`} title="Tek satırda kaydır">
              Yatay
            </button>
          )}
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setZoom((z) => Math.max(60, z - 10))} className={btn} aria-label="Uzaklaştır">
              −
            </button>
            <span className="w-11 text-center tabular-nums">%{zoom}</span>
            <button type="button" onClick={() => setZoom((z) => Math.min(160, z + 10))} className={btn} aria-label="Yakınlaştır">
              +
            </button>
          </div>
        </div>

        {tracks[shown]?.tuning && (
          <p className="text-xs text-muted">
            Akort: <span className="font-mono text-text">{tracks[shown].tuning}</span>
          </p>
        )}

        {/* Track listesi */}
        {tracks.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {tracks.map((t) => (
              <div
                key={t.index}
                className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 text-sm ${shown === t.index ? "border-accent" : "border-line"}`}
              >
                <button type="button" onClick={() => setShown(t.index)} className={`font-medium ${shown === t.index ? "text-accent" : ""}`} title="Bu track'i göster">
                  {t.percussion ? "🥁" : "🎸"} {t.name}
                </button>
                <button
                  type="button"
                  onClick={() => toggleMute(t.index)}
                  className={`rounded px-1.5 text-xs font-bold ${muted.has(t.index) ? "bg-red-600 text-white" : "bg-line"}`}
                  title="Sessize al"
                >
                  M
                </button>
                <button
                  type="button"
                  onClick={() => toggleSolo(t.index)}
                  className={`rounded px-1.5 text-xs font-bold ${solo.has(t.index) ? "bg-yellow-500 text-black" : "bg-line"}`}
                  title="Solo"
                >
                  S
                </button>
                <input
                  type="range"
                  min={0}
                  max={100}
                  defaultValue={100}
                  onChange={(e) => changeVolume(t.index, Number(e.target.value))}
                  className="w-16 accent-[var(--accent)]"
                  aria-label={`${t.name} ses`}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div ref={viewportRef} className={`relative overflow-auto rounded-b-xl bg-[var(--sheet)] p-2 text-[var(--sheet-ink)] ${compact ? "max-h-[60vh]" : "max-h-[75vh]"}`}>
        {counting !== null && (
          <div className="sticky inset-x-0 top-0 z-10 flex justify-center p-2" role="status" aria-live="assertive">
            <div className="flex items-center gap-4 rounded-2xl border border-accent bg-panel px-5 py-3 text-text shadow-2xl">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Sayım</span>
              <span className="w-10 text-center text-4xl font-black tabular-nums text-accent">{counting}</span>
              <button type="button" onClick={skipCountIn} className="rounded-lg bg-accent px-3 py-2 text-sm font-bold text-accent-ink" title="Beklemeden başla">
                Hemen başla
              </button>
              <button type="button" onClick={cancelCountIn} className="rounded-lg border border-line px-3 py-2 text-sm font-bold" title="Sayımı iptal et (Esc)">
                İptal ✕
              </button>
              <button
                type="button"
                onClick={() => {
                  setCountIn(false);
                  skipCountIn();
                }}
                className="text-xs text-muted underline-offset-2 hover:text-text hover:underline"
                title="Sayımı kapat ve hemen başla; tercih saklanır"
              >
                Sayımı kapat
              </button>
            </div>
          </div>
        )}
        {status === "loading" && <p className="p-6 text-center text-sm text-muted">Tab yükleniyor…</p>}
        {status === "error" && <p className="p-6 text-center text-sm text-red-400">Tab açılamadı. Dosya bozuk ya da desteklenmeyen bir formatta olabilir.</p>}
        <div ref={hostRef} />
      </div>
      {!compact && (
        <p className="border-t border-line px-3 py-2 text-xs text-muted">
          İpucu: Notaya tıklayarak oradan çal, sürükleyerek bölüm seç (döngü açıksa seçili bölüm tekrar eder). Kısayollar: Boşluk çal/duraklat · L döngü · M metronom · Esc sayımı iptal et / seçimi kaldır.
        </p>
      )}
    </div>
  );
}
