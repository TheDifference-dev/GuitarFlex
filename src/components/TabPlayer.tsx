"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Metronome as MetronomeIcon, Pause, Play, Repeat, Settings2, SkipBack, SlidersHorizontal, TrendingUp, X } from "lucide-react";
import { noteName } from "@/lib/music";
import type { LessonPart, Stave } from "@/content/types";
import { useOynaticiAyarlari, type OynaticiAyarlari } from "./oynatici/ayarlar";
import AyarPaneli from "./oynatici/AyarPaneli";
import Mikser, { type MikserIzi } from "./oynatici/Mikser";
import SapPaneli, { type SapNotasi } from "./oynatici/SapPaneli";

// alphaTab tarayıcıya klasik bir <script> olarak yüklenir (public/alphatab, bkz. scripts/copy-alphatab.mjs).
// Böylece web worker ve font dosyalarını kendi yolundan bulur; bundler ayarı gerekmez.
// alphaTab.gf.js = alphaTab.min.js + çizim düzeltmesi (scripts/alphatab-ek.js).

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    alphaTab?: any;
  }
}

const SCRIPT = "/alphatab/alphaTab.gf.js";
const SES_BANKASI = { generaluser: "/alphatab/soundfont/GeneralUser.sf2", sonivox: "/alphatab/soundfont/sonivox.sf2" } as const;
let loader: Promise<any> | null = null;

export function loadAlphaTab(): Promise<any> {
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

/** GeneralUser GS sunucuda var mı (paket kurulmamışsa sonivox'a dönülür) */
let generalUser: Promise<boolean> | null = null;
function generalUserVar(): Promise<boolean> {
  generalUser ??= fetch(SES_BANKASI.generaluser, { method: "HEAD" })
    .then((r) => r.ok)
    .catch(() => false);
  return generalUser;
}

export type TabSource =
  | { kind: "tex"; tex: string }
  | { kind: "url"; url: string }
  | { kind: "file"; data: ArrayBuffer; name: string };

type View = OynaticiAyarlari["gorunum"];
/** Ders alanı `stave` → oynatıcının ilk görünümü (verilmezse kayıtlı tercih) */
const STAVE_VIEW: Record<Stave, View> = { score: "score", tab: "tab", both: "score-tab" };
type TrackInfo = MikserIzi & { tuning: string; tuningMidi: number[] };

type Props = {
  source: TabSource;
  /** Egzersiz modu: tek track, sade araç çubuğu. */
  compact?: boolean;
  onBpmChange?: (bpm: number) => void;
  onPlayingChange?: (playing: boolean) => void;
  /** İlk görünüm: "score" yalnız nota (porte okuma: tab gizli, görünüm düğmeleri kapalı), "tab", "both" (nota + tab) */
  stave?: Stave;
  /** Yalnız bu ölçüleri çiz [ilk, son] (1'den; Quick Study okuma bölümü). Çalma bütün parçayı kapsar. */
  barRange?: [number, number];
  /** Yalnız ses (transkripsiyon): nota/tab alanı ve görünüm düğmeleri gizlenir, "Tekrar" düğmesi çıkar */
  audioOnly?: boolean;
  /** Sessize alınan track'ler (0'dan; ör. eşlikle çalarken gitar). Verilirse mikser gösterilmez. */
  mutedTracks?: number[];
  /** Parça yüklenince alphaTab score nesnesi (cevap anahtarı, ölçü bilgisi) */
  onScore?: (score: any) => void;
  /** Çalarken o anki ölçü (0'dan) */
  onBar?: (bar: number) => void;
  /** Parça sona erdi (döngüde her turun sonunda da) */
  onFinished?: () => void;
  /** Döngü başlangıçta açık mı (verilmezse compact ile aynı) */
  initialLoop?: boolean;
  /** Dersin kısımları (A / A′ / B / C): düğmeyle o kısım döngüye girer */
  parts?: LessonPart[];
  /** Tabda `\instrument` yoksa gitar track'lerinin General MIDI programı (ör. 27 temiz, 29 overdrive, 30 distortion) */
  guitarProgram?: number;
};

const SPEEDS = [50, 75, 100];
const MIN_SPEED = 25;
const MAX_SPEED = 150;
/** alphaTex'te `\instrument` verilmezse alphaTab'ın kullandığı program (çelik telli akustik) */
const ALPHATEX_DEFAULT_PROGRAM = 25;

function formatTime(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// Her kaynak nesnesine sabit bir anahtar ver: kaynak değişince oynatıcı temiz durumla yeniden kurulur.
const sourceIds = new WeakMap<TabSource, number>();
let nextSourceId = 0;

// Klavye kısayolları sayfadaki tek oynatıcıya gider: en son tıklanan, yoksa ilk açılan.
const mountedPlayers: string[] = [];
let lastTouchedPlayer: string | null = null;
function isActivePlayer(id: string) {
  if (lastTouchedPlayer && mountedPlayers.includes(lastTouchedPlayer)) return lastTouchedPlayer === id;
  return mountedPlayers[0] === id;
}

export default function TabPlayer(props: Props) {
  const [ayarlar] = useOynaticiAyarlari();
  let id = sourceIds.get(props.source);
  if (id === undefined) {
    id = ++nextSourceId;
    sourceIds.set(props.source, id);
  }
  return <Player key={`${id}-${ayarlar.sesBankasi}`} {...props} bank={ayarlar.sesBankasi} />;
}

type Range = { startTick: number; endTick: number };

function Player({
  source,
  compact = false,
  onBpmChange,
  onPlayingChange,
  stave,
  barRange,
  audioOnly = false,
  mutedTracks,
  onScore,
  onBar,
  onFinished,
  initialLoop,
  parts,
  guitarProgram,
  bank,
}: Props & { bank: OynaticiAyarlari["sesBankasi"] }) {
  const playerId = useId();
  const hostRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);
  const atRef = useRef<any>(null);

  const [ayarlar, guncelle] = useOynaticiAyarlari();

  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [playerReady, setPlayerReady] = useState(false);
  const [sfPercent, setSfPercent] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [meta, setMeta] = useState<{ title: string; artist: string; tempo: number; bars: number; barStarts: number[] }>({ title: "", artist: "", tempo: 120, bars: 0, barStarts: [] });
  const [tracks, setTracks] = useState<TrackInfo[]>([]);
  const [shown, setShown] = useState(0);
  const [muted, setMuted] = useState<Set<number>>(new Set());
  const [solo, setSolo] = useState<Set<number>>(new Set());
  const [volumes, setVolumes] = useState<Record<number, number>>({});
  const [position, setPosition] = useState({ current: 0, end: 0, tick: 0, endTick: 0 });
  const [currentBar, setCurrentBar] = useState(0);
  const [range, setRange] = useState<Range | null>(null);
  const [panel, setPanel] = useState<"ayar" | "mikser" | null>(null);
  const [fretNotes, setFretNotes] = useState<{ notes: SapNotasi[]; bar: number } | null>(null);

  const [speed, setSpeedState] = useState(100);
  const setSpeed = useCallback((s: number) => setSpeedState(Math.min(MAX_SPEED, Math.max(MIN_SPEED, Math.round(s)))), []);
  const [metronome, setMetronome] = useState(compact);
  const countIn = ayarlar.sayim ?? compact;
  const setCountIn = useCallback((on: boolean) => guncelle({ sayim: on }), [guncelle]);
  /** Sayım sürerken kalan vuruş (ekranda büyük rakam); sayım yoksa null */
  const [counting, setCounting] = useState<number | null>(null);
  const [loop, setLoop] = useState(initialLoop ?? compact);
  /** Kademeli hızlanma açık mı (her döngü turunda hız artar) */
  const [ramp, setRamp] = useState(false);

  /** Porte okuma: yalnız nota gösterilir, tab'a geçilemez */
  const scoreOnly = stave === "score";
  const [viewOverride, setViewOverride] = useState<View | null>(null);
  const view: View = scoreOnly ? "score" : (viewOverride ?? (stave ? STAVE_VIEW[stave] : ayarlar.gorunum));
  const chooseView = (v: View) => {
    if (stave) setViewOverride(v);
    else guncelle({ gorunum: v });
  };
  const zoom = ayarlar.zoom;
  const horizontal = ayarlar.yerlesim === "yatay";
  /** Sap paneli porte okuma ve transkripsiyonda kapalı (tabı ele verir) */
  const fretLock = audioOnly ? "transkripsiyonda kapalı" : scoreOnly ? "porte okumada kapalı" : undefined;
  const showFret = ayarlar.sap && !fretLock;
  /** Metronom ölçü başında: tıklar MIDI'ye eklenir (alphaTab'ın metronomu her vuruşta çalar) */
  const barClicks = metronome && ayarlar.metronomKipi === "olcu";

  // Callback'leri ve ayarları ref'te tut: değişmeleri player'ı yeniden kurmasın.
  const callbacks = useRef({ onBpmChange, onPlayingChange, onScore, onBar, onFinished });
  const display = useRef({ view, zoom, horizontal, follow: ayarlar.imlecTakibi });
  /** Kurulumda okunur: değişirse oynatıcı yeniden kurulmaz (Quick Study'de sabit) */
  const rangeRef = useRef(barRange);
  const audioOnlyRef = useRef(audioOnly);
  const programRef = useRef(guitarProgram);
  const playback = useRef({ countIn, speed, loop, ramp, rampa: ayarlar.rampa, barClicks, showFret, shown });
  /** "Hemen başla" ile sayımsız başlatılan çalmada sayım gösterilmez */
  const skipNext = useRef(false);
  /** Shift+tık aralık seçimi: tıklama anında Shift basılı mıydı, son tıklanan ölçü */
  const shiftRef = useRef(false);
  const anchorBar = useRef<number | null>(null);
  useEffect(() => {
    callbacks.current = { onBpmChange, onPlayingChange, onScore, onBar, onFinished };
    display.current = { view, zoom, horizontal, follow: ayarlar.imlecTakibi };
    playback.current = { countIn, speed, loop, ramp, rampa: ayarlar.rampa, barClicks, showFret, shown };
  });

  const staveProfile = useCallback((v: View, percussion: boolean) => {
    const P = atRef.current.StaveProfile;
    if (percussion || v === "score") return P.Score;
    return v === "tab" ? P.Tab : P.ScoreTab;
  }, []);
  /** Yalnız tab görünümünde ritim (sap/kiriş) tabın altında gösterilir (Songsterr gibi) */
  const rhythmMode = useCallback((v: View) => {
    const R = atRef.current.TabRhythmMode;
    return v === "tab" ? R.ShowWithBars : R.Automatic;
  }, []);

  // Kaynak değiştiğinde player'ı kur.
  useEffect(() => {
    let disposed = false;

    Promise.all([loadAlphaTab(), bank === "generaluser" ? generalUserVar() : Promise.resolve(false)])
      .then(([at, guOk]) => {
        if (disposed || !hostRef.current) return;
        atRef.current = at;
        // Worker'lar blob üzerinden açıldığı için yollar tam URL olmalı.
        const abs = (path: string) => new URL(path, window.location.href).href;
        const { view: v, zoom: z, horizontal: h, follow } = display.current;
        const range = rangeRef.current;
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
            // Efekt satırları arasında biraz boşluk (akor adı, P.M., pena işaretleri birbirine yapışmasın)
            effectBandPaddingBottom: 4,
            ...(range ? { startBar: range[0], barCount: range[1] - range[0] + 1 } : {}),
            resources: {
              mainGlyphColor: ink,
              secondaryGlyphColor: color("--sheet-muted", "#666666"),
              staffLineColor: color("--sheet-line", "#666666"),
              barSeparatorColor: ink,
              barNumberColor: color("--sheet-muted", "#666666"),
              // Sayfa başındaki akor diyagramları (\chord) alphaTab'da "score info" rengiyle çizilir; varsayılanı siyah.
              scoreInfoColor: ink,
            },
          },
          notation: {
            // Parmak numaraları (sol el 1–4, sağ el p-i-m-a) tab görünümünde de notaların üstünde görünsün
            fingeringMode: at.FingeringMode.SingleNoteEffectBand,
            rhythmMode: rhythmMode(v),
          },
          player: {
            playerMode: at.PlayerMode.EnabledSynthesizer,
            soundFont: abs(guOk ? SES_BANKASI.generaluser : SES_BANKASI.sonivox),
            scrollElement: viewportRef.current,
            scrollMode: follow ? at.ScrollMode.Continuous : at.ScrollMode.Off,
            enableUserInteraction: !audioOnlyRef.current,
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
          // Dersin ton bilgisi: tabda enstrüman verilmemişse gitar track'lerinin sesi (MIDI üretiminden önce)
          const program = programRef.current;
          if (program !== undefined && source.kind === "tex" && !/\\instrument\b/.test(source.tex)) {
            for (const t of score.tracks) {
              if (!t.staves[0]?.isPercussion && t.playbackInfo.program === ALPHATEX_DEFAULT_PROGRAM) t.playbackInfo.program = program;
            }
          }
          callbacks.current.onScore?.(score);
          setMeta({ title: score.title, artist: score.artist, tempo: score.tempo, bars: score.masterBars.length, barStarts: score.masterBars.map((m: any) => m.start) });
          const infos: TrackInfo[] = score.tracks.map((t: any) => {
            const staff = t.staves[0];
            const percussion = !!staff?.isPercussion;
            const tuningMidi: number[] = percussion ? [] : [...(staff?.tuning ?? [])];
            // alphaTab akordu inceden kalına tutar; kalından inceye yaz (E A D G B E).
            const tuning = [...tuningMidi].reverse().map((m: number) => noteName(m)).join(" ");
            return { index: t.index, name: t.name || `Track ${t.index + 1}`, percussion, program: t.playbackInfo.program, tuning, tuningMidi };
          });
          setTracks(infos);
          // Çok track'li parçada tabı gösterilen: ilk gitar track'i (yoksa ilk perküsyon olmayan)
          if (infos.length > 1) {
            const guitar = infos.find((t) => !t.percussion && t.program >= 24 && t.program <= 31) ?? infos.find((t) => !t.percussion);
            if (guitar) setShown(guitar.index);
          }
        });
        api.renderFinished.on(() => !disposed && setStatus("ready"));
        api.error.on(() => !disposed && setStatus("error"));
        api.soundFontLoad.on((e: { loaded: number; total: number }) => {
          if (!disposed && e.total > 0) setSfPercent(Math.round((e.loaded / e.total) * 100));
        });
        api.playerReady.on(() => {
          if (disposed) return;
          setPlayerReady(true);
          setSfPercent(null);
        });

        // "Yalnız ölçü başı" metronomu: her ölçünün ilk vuruşuna perküsyon kanalında tık
        api.midiLoad.on((midi: any) => {
          if (disposed || !playback.current.barClicks) return;
          const M = at.midi;
          const shift = midi.tickShift ?? 0;
          const lookups: any[] = api.tickCache?.masterBars ?? [];
          midi.addEvent(new M.ProgramChangeEvent(0, shift, 9, 0));
          for (const mb of lookups) {
            const t = mb.start + shift;
            midi.addEvent(new M.NoteOnEvent(0, t, 9, 33, 112));
            midi.addEvent(new M.NoteOffEvent(0, t + 240, 9, 33, 0));
          }
        });

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
        // Çalınan ölçü (onBar): tick konumundan; çizilmeyen ölçülerde de (Quick Study doğaçlama bölümü) çalışır
        let sonOlcu = -1;
        api.playerPositionChanged.on((e: { currentTime: number; endTime: number; currentTick: number; endTick: number }) => {
          if (disposed) return;
          const mbs = api.score?.masterBars;
          if (mbs?.length) {
            let i = mbs.length - 1;
            while (i > 0 && mbs[i].start > e.currentTick) i--;
            if (i !== sonOlcu) {
              sonOlcu = i;
              setCurrentBar(i);
              callbacks.current.onBar?.(i);
            }
          }
          const now = performance.now();
          if (now - last < 150 && e.currentTime !== 0) return;
          last = now;
          setPosition({ current: e.currentTime, end: e.endTime, tick: e.currentTick, endTick: e.endTick });
        });
        api.playbackRangeChanged.on((e: { playbackRange: Range | null }) => {
          if (disposed) return;
          const r = e.playbackRange;
          setRange(r ? { startTick: r.startTick, endTick: r.endTick } : null);
        });
        api.playerFinished.on(() => {
          if (disposed) return;
          // Kademeli hızlanma: döngünün her turunda hız bir adım artar (hedefe kadar)
          const p = playback.current;
          if (p.loop && p.ramp) {
            const next = Math.min(p.rampa.hedef, p.speed + p.rampa.adim);
            if (next !== p.speed) {
              playback.current.speed = next;
              api.playbackSpeed = next / 100;
              setSpeedState(next);
            }
          }
          callbacks.current.onFinished?.();
        });

        // Sap paneli: çalan vuruşların notaları (görüntülenen track)
        const beatNotes = (beats: any[]) => {
          const notes: SapNotasi[] = [];
          let bar = -1;
          for (const b of beats) {
            if (b.voice?.bar?.staff?.track?.index !== playback.current.shown || b.voice.bar.staff.isPercussion) continue;
            bar = b.voice.bar.index;
            for (const n of b.notes ?? []) if (n.string > 0) notes.push({ tel: n.string, perde: n.fret, olu: n.isDead, bagli: n.isTieDestination });
          }
          return { notes, bar };
        };
        api.activeBeatsChanged.on((e: { activeBeats: any[] }) => {
          if (disposed || !playback.current.showFret) return;
          const r = beatNotes(e.activeBeats);
          if (r.bar >= 0 || e.activeBeats.length === 0) setFretNotes(r.bar >= 0 ? r : null);
        });
        api.playedBeatChanged.on((beat: any) => {
          if (disposed || !playback.current.showFret || api.playerState === 1) return;
          const r = beatNotes([beat]);
          if (r.bar >= 0) setFretNotes(r);
        });

        // Shift + tık: son tıklanan ölçüden bu ölçüye kadar bütün ölçüler seçilir
        api.beatMouseUp.on((beat: any) => {
          if (disposed || !beat) return;
          const barIndex = beat.voice.bar.index;
          if (shiftRef.current && anchorBar.current !== null) selectBarsRef.current(Math.min(anchorBar.current, barIndex), Math.max(anchorBar.current, barIndex));
          else anchorBar.current = barIndex;
        });

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
  }, [source, bank, staveProfile, rhythmMode]);

  /** Ölçüleri (0'dan, kapsayıcı) çalma aralığı yap ve tabda işaretle */
  const selectBars = useCallback((a: number, b: number) => {
    const api = apiRef.current;
    const mbs = api?.score?.masterBars;
    if (!mbs?.length) return;
    a = Math.max(0, Math.min(a, mbs.length - 1));
    b = Math.max(a, Math.min(b, mbs.length - 1));
    const start = (mb: any) => api.tickCache?.getMasterBarStart?.(mb) ?? mb.start;
    const startTick = start(mbs[a]);
    const endTick = start(mbs[b]) + mbs[b].calculateDuration() - 50;
    api.playbackRange = { startTick, endTick };
    setRange({ startTick, endTick });
    const track = api.tracks?.[0];
    const bars = track?.staves?.[0]?.bars;
    const first = bars?.[a]?.voices?.[0]?.beats?.[0];
    const lastBeats = bars?.[b]?.voices?.[0]?.beats;
    try {
      if (first && lastBeats?.length) api.highlightPlaybackRange(first, lastBeats[lastBeats.length - 1]);
    } catch {
      // Çizilmeyen ölçüler (Quick Study) işaretlenemez; çalma aralığı yine geçerli
    }
    api.tickPosition = startTick;
    anchorBar.current = a;
    setLoop(true);
  }, []);
  const selectBarsRef = useRef(selectBars);

  const clearRange = useCallback(() => {
    const api = apiRef.current;
    if (!api) return;
    api.playbackRange = null;
    api.clearPlaybackRangeHighlight();
    setRange(null);
  }, []);

  const gotoBar = useCallback((i: number) => {
    const api = apiRef.current;
    const mbs = api?.score?.masterBars;
    if (!mbs?.length) return;
    const bar = mbs[Math.max(0, Math.min(i, mbs.length - 1))];
    api.tickPosition = api.tickCache?.getMasterBarStart?.(bar) ?? bar.start;
  }, []);

  // Görünen track ve görünüm türü
  useEffect(() => {
    const api = apiRef.current;
    const track = api?.score?.tracks[shown];
    if (!track) return;
    // Telsiz track'ler (davul, piyano, org, yaylılar) tab çizemez: her görünümde nota
    const st = track.staves[0];
    const tabsiz = !!st?.isPercussion || st?.showTablature === false || !(st?.tuning?.length);
    api.settings.display.staveProfile = staveProfile(view, tabsiz);
    api.settings.notation.rhythmMode = rhythmMode(view);
    api.updateSettings();
    api.renderTracks([track]);
  }, [shown, view, tracks, staveProfile, rhythmMode]);

  // Zoom ve yerleşim
  useEffect(() => {
    const api = apiRef.current;
    if (!api?.score) return;
    api.settings.display.scale = zoom / 100;
    api.settings.display.layoutMode = horizontal ? atRef.current.LayoutMode.Horizontal : atRef.current.LayoutMode.Page;
    api.updateSettings();
    api.render();
  }, [zoom, horizontal]);

  // İmleç takibi
  const follow = ayarlar.imlecTakibi;
  useEffect(() => {
    const api = apiRef.current;
    if (!api) return;
    api.settings.player.scrollMode = follow ? atRef.current.ScrollMode.Continuous : atRef.current.ScrollMode.Off;
    api.updateSettings();
  }, [follow, playerReady]);

  // Çalma ayarları
  useEffect(() => {
    const api = apiRef.current;
    if (!api) return;
    api.playbackSpeed = speed / 100;
    api.metronomeVolume = metronome && !barClicks ? 1 : 0;
    api.isLooping = loop;
    api.countInVolume = countIn ? 1 : 0;
  }, [speed, metronome, barClicks, loop, countIn, playerReady]);

  // Ölçü başı tıkları MIDI'nin parçası: açılıp kapanınca MIDI yeniden üretilir (çalıyorsa kaldığı yerden sürer)
  const clicksLoaded = useRef<boolean | null>(null);
  useEffect(() => {
    const api = apiRef.current;
    if (!api?.score || !playerReady) return;
    // İlk hazır olduğunda MIDI zaten o anki tercihle üretildi
    if (clicksLoaded.current === null) clicksLoaded.current = barClicks;
    if (clicksLoaded.current === barClicks) return;
    clicksLoaded.current = barClicks;
    const wasPlaying = api.playerState === 1;
    const tick = api.tickPosition;
    const keepRange = api.playbackRange;
    api.loadMidiForScore();
    if (keepRange) api.playbackRange = keepRange;
    api.tickPosition = tick;
    if (wasPlaying) {
      skipNext.current = true;
      api.countInVolume = 0;
      api.play();
      api.countInVolume = playback.current.countIn ? 1 : 0;
    }
  }, [barClicks, playerReady]);

  // Dışarıdan verilen sessiz track'ler (ör. Quick Study'de "eşlikle çal": gitar susar, eşlik çalar)
  const mutedKey = mutedTracks?.join(",");
  useEffect(() => {
    const api = apiRef.current;
    if (!api?.score || mutedKey === undefined) return;
    const off = new Set(mutedKey ? mutedKey.split(",").map(Number) : []);
    for (const t of api.score.tracks) api.changeTrackMute([t], off.has(t.index));
  }, [mutedKey, tracks, playerReady]);

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

  const toggleRamp = () => {
    if (!ramp) {
      // Başlangıç hızından başla, döngü açık olsun
      setSpeed(ayarlar.rampa.baslangic);
      setLoop(true);
    }
    setRamp(!ramp);
  };

  // Klavye kısayolları (yalnız etkin oynatıcı): boşluk, ←/→ ölçü, L döngü, ↑/↓ hız, M metronom, Esc
  useEffect(() => {
    mountedPlayers.push(playerId);
    const onKey = (e: KeyboardEvent) => {
      if (!isActivePlayer(playerId) || e.ctrlKey || e.metaKey || e.altKey) return;
      const el = e.target as HTMLElement;
      if (el.closest("input, textarea, select, [contenteditable]")) return;
      if (e.code === "Space") {
        if (el.closest("button")) return;
        e.preventDefault();
        apiRef.current?.playPause();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        const api = apiRef.current;
        const mbs = api?.score?.masterBars;
        if (!mbs?.length) return;
        const tick = api.tickPosition ?? 0;
        let i = mbs.length - 1;
        while (i > 0 && mbs[i].start > tick) i--;
        // Ölçünün ortasındaysa ← önce ölçü başına döner
        if (e.key === "ArrowLeft") gotoBar(tick - mbs[i].start > 240 ? i : i - 1);
        else gotoBar(i + 1);
      } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        setSpeed(playback.current.speed + (e.key === "ArrowUp" ? 5 : -5));
      } else if (e.key === "l" || e.key === "L") setLoop((x) => !x);
      else if (e.key === "m" || e.key === "M") setMetronome((x) => !x);
      else if (e.key === "Escape") {
        if (counting !== null) cancelCountIn();
        else clearRange();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      const i = mountedPlayers.indexOf(playerId);
      if (i >= 0) mountedPlayers.splice(i, 1);
    };
  }, [playerId, clearRange, cancelCountIn, counting, gotoBar, setSpeed]);

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
    setVolumes((v) => ({ ...v, [i]: value }));
    api?.changeTrackVolume([api.score.tracks[i]], value / 100);
  };

  // İlerleme çubuğu: tıkla-git ve sürükle
  const barRef = useRef<HTMLDivElement>(null);
  const seekTo = (clientX: number) => {
    const api = apiRef.current;
    const el = barRef.current;
    if (!api || !el || !position.endTick) return;
    const r = el.getBoundingClientRect();
    const f = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    const tick = Math.round(f * position.endTick);
    api.tickPosition = tick;
    setPosition((p) => ({ ...p, tick, current: p.end * f }));
  };

  const starts = meta.barStarts;
  const barTick = (i: number) => starts[i] ?? 0;
  const pct = (tick: number) => (position.endTick ? Math.min(100, Math.max(0, (tick / position.endTick) * 100)) : 0);
  /** Tick'in düştüğü ölçü (0'dan) */
  const barOf = (tick: number) => {
    let i = starts.length - 1;
    while (i > 0 && starts[i] > tick) i--;
    return i;
  };
  const rangeBars = range && starts.length ? ([barOf(range.startTick), barOf(range.endTick)] as const) : null;
  const activePart = parts?.find((p) => rangeBars && rangeBars[0] === p.bars[0] - 1 && rangeBars[1] === p.bars[1] - 1);

  const bpm = Math.round((meta.tempo * speed) / 100);
  const multiTrack = tracks.length > 1 && mutedTracks === undefined && !audioOnly;
  const showParts = !!parts?.length && !barRange && meta.bars > 0;
  const btn = "inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-ink/[0.04] px-3 py-1.5 text-sm transition hover:bg-ink/10 disabled:opacity-40";
  const on = "!border-accent !bg-accent !text-accent-ink hover:!bg-accent/85";
  const iconBtn = "inline-flex h-8 w-8 items-center justify-center rounded-full border border-ink/10 bg-ink/[0.04] text-sm transition hover:bg-ink/10 disabled:opacity-40";
  const shownTrack = tracks.find((t) => t.index === shown);

  return (
    <div className="card overflow-clip" onPointerDown={() => (lastTouchedPlayer = playerId)}>
      {/* Ana araç çubuğu */}
      <div className="glass sticky top-[57px] z-[5] space-y-2.5 border-b border-line p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => apiRef.current?.playPause()}
            disabled={!playerReady}
            className="btn-primary min-w-28 px-5 py-2 disabled:opacity-40"
            title="Çal / Duraklat (Boşluk)"
          >
            {playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
            {!playerReady && sfPercent !== null ? `Ses %${sfPercent}` : playing ? "Duraklat" : "Çal"}
          </button>
          <button type="button" onClick={() => apiRef.current?.stop()} disabled={!playerReady} className={iconBtn} title="Başa dön" aria-label="Başa dön">
            <SkipBack size={15} />
          </button>
          {audioOnly && (
            <button
              type="button"
              onClick={() => {
                const api = apiRef.current;
                if (!api) return;
                api.stop();
                skipNext.current = true;
                api.play();
              }}
              disabled={!playerReady}
              className={btn}
              title="Baştan bir kez daha dinle"
            >
              ↺ Tekrar
            </button>
          )}

          <div className="flex min-w-48 flex-1 items-center gap-2 text-sm tabular-nums">
            <span className="w-10 text-right">{formatTime(position.current)}</span>
            <div
              ref={barRef}
              role="slider"
              tabIndex={0}
              aria-label="Konum"
              aria-valuemin={0}
              aria-valuemax={Math.round(position.end / 1000)}
              aria-valuenow={Math.round(position.current / 1000)}
              aria-valuetext={`${formatTime(position.current)} / ${formatTime(position.end)}`}
              aria-disabled={!playerReady}
              className={`group relative mx-2 h-6 flex-1 touch-none ${playerReady ? "cursor-pointer" : "opacity-40"}`}
              onPointerDown={(e) => {
                if (!playerReady) return;
                e.currentTarget.setPointerCapture(e.pointerId);
                seekTo(e.clientX);
              }}
              onPointerMove={(e) => e.currentTarget.hasPointerCapture(e.pointerId) && seekTo(e.clientX)}
            >
              <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-ink/10">
                {range && <div className="absolute inset-y-0 bg-ink/20" style={{ left: `${pct(range.startTick)}%`, width: `${pct(range.endTick) - pct(range.startTick)}%` }} />}
                <div className="bar-fill absolute inset-y-0 left-0 rounded-full" style={{ width: `${pct(position.tick)}%` }} />
              </div>
              {/* Kısım sınırları */}
              {showParts &&
                parts!.slice(1).map((p) => (
                  <span key={p.name} className="absolute top-1/2 h-3 w-px -translate-y-1/2 bg-ink/40" style={{ left: `${pct(barTick(p.bars[0] - 1))}%` }} aria-hidden />
                ))}
              <span
                className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_0_0.5px_rgb(0_0_0/0.12),0_1px_4px_rgb(0_0_0/0.25)] transition-transform group-hover:scale-110"
                style={{ left: `${pct(position.tick)}%` }}
                aria-hidden
              />
            </div>
            <span className="w-10 text-muted">{formatTime(position.end)}</span>
          </div>
          {meta.bars > 0 && (
            <div className="flex items-center gap-0.5 text-sm tabular-nums">
              <button type="button" className={iconBtn} onClick={() => gotoBar(currentBar - 1)} disabled={!playerReady} title="Önceki ölçü (←)" aria-label="Önceki ölçü">
                <ChevronLeft size={15} />
              </button>
              <span className="min-w-[5.5rem] whitespace-nowrap text-center text-muted" aria-live="off">
                Ölçü <span className="text-text">{currentBar + 1}</span>/{meta.bars}
              </span>
              <button type="button" className={iconBtn} onClick={() => gotoBar(currentBar + 1)} disabled={!playerReady} title="Sonraki ölçü (→)" aria-label="Sonraki ölçü">
                <ChevronRight size={15} />
              </button>
            </div>
          )}
          {multiTrack && (
            <button type="button" onClick={() => setPanel((p) => (p === "mikser" ? null : "mikser"))} className={`${btn} ${panel === "mikser" ? on : ""}`} aria-expanded={panel === "mikser"} title="Mikser: track sesleri, solo, sessiz">
              <SlidersHorizontal size={14} /> Mikser
            </button>
          )}
          <button
            type="button"
            data-ayar-dugmesi
            onClick={() => setPanel((p) => (p === "ayar" ? null : "ayar"))}
            className={`${btn} ${panel === "ayar" ? on : ""}`}
            aria-expanded={panel === "ayar"}
            title="Görünüm, yerleşim, yakınlaştırma, sap, metronom, kısayollar"
          >
            <Settings2 size={14} /> Ayarlar
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Hız">
            <span className="text-muted">Hız</span>
            <button type="button" className={iconBtn} onClick={() => setSpeed(speed - 5)} disabled={speed <= MIN_SPEED} aria-label="Yavaşlat (↓)" title="Yavaşlat (↓)">
              −
            </button>
            <input
              type="range"
              min={MIN_SPEED}
              max={MAX_SPEED}
              step={5}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-24 accent-[var(--accent)] sm:w-28"
              aria-label="Hız"
            />
            <button type="button" className={iconBtn} onClick={() => setSpeed(speed + 5)} disabled={speed >= MAX_SPEED} aria-label="Hızlandır (↑)" title="Hızlandır (↑)">
              +
            </button>
            <span className="whitespace-nowrap tabular-nums">
              %{speed} <span className="text-muted">· {bpm} BPM</span>
            </span>
            {SPEEDS.map((s) => (
              <button key={s} type="button" onClick={() => setSpeed(s)} className={`${btn} px-2.5 py-1 ${speed === s ? on : ""}`}>
                %{s}
              </button>
            ))}
          </div>

          <span className="mx-0.5 hidden h-5 w-px bg-line sm:block" />
          <button type="button" onClick={() => setLoop((x) => !x)} className={`${btn} ${loop ? on : ""}`} title="Döngü (L): seçili aralık ya da bütün parça tekrar eder" aria-pressed={loop}>
            <Repeat size={14} /> Döngü
          </button>
          <button
            type="button"
            onClick={() => selectBars(currentBar, currentBar)}
            disabled={!playerReady}
            className={`${btn} ${rangeBars && rangeBars[0] === rangeBars[1] && rangeBars[0] === currentBar ? on : ""}`}
            title="Bulunulan ölçüyü döngüye al (Shift + tık ile birden çok ölçü seçilir)"
          >
            Bu ölçü
          </button>
          <button
            type="button"
            onClick={toggleRamp}
            className={`${btn} ${ramp ? on : ""}`}
            title={`Kademeli hızlanma: %${ayarlar.rampa.baslangic}'tan başla, her döngüde +%${ayarlar.rampa.adim}, hedef %${ayarlar.rampa.hedef} (ayarlardan değiştir)`}
            aria-pressed={ramp}
          >
            <TrendingUp size={14} /> Kademeli
            {ramp && (
              <span className="tabular-nums text-xs">
                {speed >= ayarlar.rampa.hedef ? "hedefte" : `→ %${ayarlar.rampa.hedef}`}
              </span>
            )}
          </button>

          <span className="mx-0.5 hidden h-5 w-px bg-line sm:block" />
          <button
            type="button"
            onClick={() => setMetronome((x) => !x)}
            className={`${btn} ${metronome ? on : ""}`}
            title={`Metronom (M) · ${ayarlar.metronomKipi === "olcu" ? "yalnız ölçü başı" : "her vuruş"} (ayarlardan değiştir)`}
            aria-pressed={metronome}
          >
            <MetronomeIcon size={14} /> Metronom
            {metronome && ayarlar.metronomKipi === "olcu" && <span className="text-xs">· ölçü başı</span>}
          </button>
          <button
            type="button"
            onClick={() => setCountIn(!countIn)}
            className={`${btn} ${countIn ? on : ""}`}
            title={countIn ? "Sayım açık: başlamadan önce bir ölçü sayar. Kapatmak için tıkla." : "Sayım kapalı: Çal'a basınca hemen başlar."}
            aria-pressed={countIn}
          >
            Sayım
          </button>
          {audioOnly && (
            <span className="rounded-full border border-ink/[0.08] bg-ink/[0.05] px-3 py-1" title="Transkripsiyon: tab ve nota gizli, yalnız ses çalar">
              Yalnız ses
            </span>
          )}
          {scoreOnly && !audioOnly && (
            <span className="rounded-full border border-ink/[0.08] bg-ink/[0.05] px-3 py-1" title="Porte okuma dersi: tab gizli, notayı porteden oku">
              Yalnız nota
            </span>
          )}

        </div>

        {(showParts || range || (shownTrack?.tuning && !audioOnly)) && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {showParts && (
              <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Kısımlar">
                <span className="text-muted">Kısım</span>
                <button type="button" onClick={clearRange} className={`${btn} px-2.5 py-1 ${!range ? on : ""}`} title="Bütün çalışma">
                  Tümü
                </button>
                {parts!.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => selectBars(p.bars[0] - 1, p.bars[1] - 1)}
                    disabled={!playerReady}
                    className={`${btn} px-2.5 py-1 ${activePart === p ? on : ""}`}
                    title={`${p.name} (ölçü ${p.bars[0]}–${p.bars[1]}): ${p.focus}. Tıkla: bu kısım döngüye girer.`}
                  >
                    <span className="font-semibold">{p.name}</span>
                    <span className="text-xs tabular-nums opacity-70">
                      {p.bars[0]}–{p.bars[1]}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {range && rangeBars && !activePart && (
              <span className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 py-1 pl-3 pr-1 text-accent">
                Seçim: ölçü {rangeBars[0] + 1}
                {rangeBars[1] !== rangeBars[0] ? `–${rangeBars[1] + 1}` : ""}
                <button type="button" onClick={clearRange} className="rounded-full p-0.5 hover:bg-accent/20" title="Seçimi kaldır (Esc)" aria-label="Seçimi kaldır">
                  <X size={14} />
                </button>
              </span>
            )}
            {shownTrack?.tuning && !audioOnly && (
              <span className="ml-auto text-xs text-muted">
                Akort: <span className="font-mono text-text">{shownTrack.tuning}</span>
              </span>
            )}
          </div>
        )}
        {activePart && <p className="text-xs text-muted">{activePart.name} · {activePart.focus}</p>}

        {panel === "ayar" && (
          <AyarPaneli
            ayarlar={ayarlar}
            guncelle={guncelle}
            gorunum={view}
            onGorunum={chooseView}
            gorunumKilit={audioOnly ? "yalnız ses" : scoreOnly ? "porte okuma: yalnız nota" : undefined}
            sapKilit={fretLock}
            sayim={countIn}
            onSayim={setCountIn}
            onKapat={() => setPanel(null)}
          />
        )}
      </div>

      {multiTrack && panel === "mikser" && (
        <div className="border-b border-line bg-ink/[0.02] p-3 sm:p-4">
          <Mikser izler={tracks} gosterilen={shown} sessiz={muted} solo={solo} ses={volumes} onGoster={setShown} onSessiz={toggleMute} onSolo={toggleSolo} onSes={changeVolume} />
        </div>
      )}

      <div
        ref={viewportRef}
        aria-hidden={audioOnly || undefined}
        className={`relative isolate overflow-auto bg-[var(--sheet)] text-[var(--sheet-ink)] ${audioOnly ? "h-0 p-0" : `p-2 ${compact ? "max-h-[60vh]" : "max-h-[75vh]"}`}`}
        onPointerDownCapture={(e) => (shiftRef.current = e.shiftKey)}
      >
        {counting !== null && (
          <div className="sticky inset-x-0 top-0 z-10 flex justify-center p-2" role="status" aria-live="assertive">
            <div className="bg-elevated flex items-center gap-4 rounded-full border border-ink/10 py-2 pl-6 pr-2 text-text shadow-[var(--shadow-pop)]">
              <span className="text-xs font-semibold text-muted">Sayım</span>
              <span className="text-accent w-10 text-center text-4xl font-bold tabular-nums">{counting}</span>
              <button type="button" onClick={skipCountIn} className="btn-primary px-4 py-2 text-sm" title="Beklemeden başla">
                Hemen başla
              </button>
              <button type="button" onClick={cancelCountIn} className="btn-secondary px-4 py-2 text-sm" title="Sayımı iptal et (Esc)">
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
        {status === "error" && <p className="p-6 text-center text-sm text-bad">Tab açılamadı. Dosya bozuk ya da desteklenmeyen bir formatta olabilir.</p>}
        <div ref={hostRef} />
      </div>

      {showFret && !audioOnly && (
        <div className="sticky bottom-0 z-[4]">
          <SapPaneli
            akort={shownTrack?.tuningMidi.length ? shownTrack.tuningMidi : [64, 59, 55, 50, 45, 40]}
            notalar={fretNotes?.notes ?? []}
            etiket={fretNotes ? `Ölçü ${fretNotes.bar + 1}` : "Çal'a bas ya da bir notaya tıkla"}
          />
        </div>
      )}
      {!compact && !audioOnly && (
        <p className="border-t border-line px-3 py-2 text-xs text-muted">
          İpucu: Notaya tıklayarak oradan çal, sürükleyerek ya da Shift + tıkla ölçü aralığı seç (döngü açıksa seçili aralık tekrar eder). Kısayollar Ayarlar&apos;da.
        </p>
      )}
    </div>
  );
}
