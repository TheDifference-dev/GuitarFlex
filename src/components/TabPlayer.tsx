"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AudioLines, ChevronDown, ChevronLeft, ChevronRight, Gauge, Metronome as MetronomeIcon, Pause, Play, Repeat, Settings2, SkipBack, SlidersHorizontal, Timer, TrendingUp, Volume1, Volume2, VolumeX, X } from "lucide-react";
import { noteName } from "@/lib/music";
import type { LessonPart, Stave } from "@/content/types";
import { SES_UST, sesKazanci, useOynaticiAyarlari, type OynaticiAyarlari } from "./oynatici/ayarlar";
import Acilir from "./oynatici/Acilir";
import SesKanallari from "./oynatici/SesKanallari";
import AyarPaneli from "./oynatici/AyarPaneli";
import Mikser, { type MikserIzi } from "./oynatici/Mikser";
import SapPaneli, { type SapNotasi } from "./oynatici/SapPaneli";
import { BANKA_ADI, sesBankasiYukle } from "./oynatici/sesBankasi";
import { mikserOku, mikserYaz } from "@/lib/kutuphane-yerel";

// alphaTab tarayıcıya klasik bir <script> olarak yüklenir (public/alphatab, bkz. scripts/copy-alphatab.mjs).
// Böylece web worker ve font dosyalarını kendi yolundan bulur; bundler ayarı gerekmez.
// alphaTab.gf.js = alphaTab.min.js + çizim düzeltmesi (scripts/alphatab-ek.js).

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    alphaTab?: any;
    /** Test kancası (scripts/oynatici-testi.mjs): sayfadaki oynatıcıların alphaTab api'leri. Uygulama bunu okumaz. */
    __gfTest?: { players: any[] };
  }
}

const SCRIPT = "/alphatab/alphaTab.gf.js";
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

export type TabSource =
  | { kind: "tex"; tex: string }
  | { kind: "url"; url: string }
  | { kind: "file"; data: ArrayBuffer; name: string };

/** Oynatıcının o anki çalışma durumu (Çalışma Defteri için; bkz. onDurum) */
export type OynaticiDurumu = {
  /** Bulunulan ölçü (0'dan) */
  olcu: number;
  /** Hız (%) */
  hiz: number;
  bpm: number;
  /** Döngü aralığı (ölçü, 0'dan, kapsayıcı); seçim yoksa null */
  aralik: [number, number] | null;
  /** Seçili ders kısmı (A / A′ / B / C); yoksa null */
  kisim: string | null;
};
/** Dışarıdan "kaldığın yerden devam": `n` her değiştiğinde (oynatıcı hazır olunca) bir kez uygulanır */
export type DevamKomutu = { n: number; olcu?: number; aralik?: [number, number] | null; hiz?: number | null; /** Uygulandıktan sonra çal ya da durdur (Günlük Rutin: blok değişince) */ oynat?: "cal" | "dur" };

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
  /** Verilirse mikser (ana ses, track ses/pan/solo/sessiz) bu anahtarla bu bilgisayarda saklanır (ör. "s:<slug>", "d:<id>") */
  mikserKaydi?: string;
  /** Ölçü, hız, döngü aralığı ya da kısım değişince (Çalışma Defteri). Oynatıcının işleyişini değiştirmez. */
  onDurum?: (d: OynaticiDurumu) => void;
  /** Kaldığın yerden devam: döngüyü/konumu ve hızı verilen ölçüye taşır */
  devam?: DevamKomutu;
};

const SPEEDS = [50, 75, 100];
const MIN_SPEED = 25;
const MAX_SPEED = 150;
/** alphaTex'te `\instrument` verilmezse alphaTab'ın kullandığı program (çelik telli akustik) */
const ALPHATEX_DEFAULT_PROGRAM = 25;

/** Mikser pan (−100 … 100) → track'in MIDI pan değeri (alphaTab balance 0–16, 8 orta); MIDI üretiminde okunur */
function setBalance(track: any, pan: number) {
  track.playbackInfo.balance = Math.round(((pan + 100) / 200) * 16);
}

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

/** alphaTab'ın ana sesi sabittir: kanallar (Müzik, Metronom, Sayım) ayrı ayrı ayarlanır (bkz. muzikSesi) */
const CIKIS = 1;

/** Parçada perküsyon kanalını (9) kullanan iz var mı */
const davulKanaliVar = (api: any) => !!api?.score?.tracks?.some((t: any) => t.playbackInfo?.primaryChannel === 9 || t.playbackInfo?.secondaryChannel === 9);

/**
 * Çıkışa sınırlayıcı (limiter): kanallar %450'ye kadar çıkabildiği için toplam ses 0 dBFS'yi aşınca kırpılıp bozulmasın.
 * alphaTab 1.8.4 sesini kendi AudioContext'inde `worklet.connect(ctx.destination)` ile bağlar (AlphaSynthAudioWorkletOutput
 * › play); bu bağlam örneğinin `destination`'ı sınırlayıcıya yönlendirilir, sınırlayıcı gerçek çıkışa bağlanır.
 * Ses yolunun geri kalanı değişmez. Sınırlayıcı eşiğin (-4 dBFS) altındaki sese dokunmaz.
 */
function sinirlayiciKur(api: any) {
  try {
    const ctx: (AudioContext & { __gfSinirlayici?: DynamicsCompressorNode }) | null | undefined = api?.player?.output?.context;
    if (!ctx || ctx.__gfSinirlayici || typeof ctx.createDynamicsCompressor !== "function") return;
    const gercek = ctx.destination;
    const s = ctx.createDynamicsCompressor();
    // Attack 0: tellerin aynı anda vurulduğu akorlarda (6 nota, 450 %) 2 ms'lik attack tepe değeri 1'in üstüne kaçırıyordu
    s.threshold.value = -4;
    s.knee.value = 0;
    s.ratio.value = 20;
    s.attack.value = 0;
    s.release.value = 0.15;
    s.connect(gercek);
    Object.defineProperty(ctx, "destination", { configurable: true, get: () => s });
    ctx.__gfSinirlayici = s;
  } catch {
    // Sınırlayıcı kurulamazsa ses yolu olduğu gibi kalır
  }
}

export default function TabPlayer(props: Props) {
  const [ayarlar] = useOynaticiAyarlari();
  let id = sourceIds.get(props.source);
  if (id === undefined) {
    id = ++nextSourceId;
    sourceIds.set(props.source, id);
  }
  // Yerleşim değişince de yeniden kurulur: alphaTab kaydırma kabını (sayfa ya da yatay kutu) yalnız kurulumda okur
  return <Player key={`${id}-${ayarlar.sesBankasi}-${ayarlar.yerlesim}`} {...props} bank={ayarlar.sesBankasi} />;
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
  mikserKaydi,
  onDurum,
  devam,
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
  /** Ses bankası sorunu: "yedek" seçilen banka yüklenemedi, öteki bankayla çalınıyor · "hata" hiçbiri yüklenemedi (çalınamaz) */
  const [sesSorunu, setSesSorunu] = useState<"yedek" | "hata" | null>(null);
  const sesYukleRef = useRef<() => void>(() => {});
  const [playing, setPlaying] = useState(false);
  const [meta, setMeta] = useState<{ title: string; artist: string; tempo: number; bars: number; barStarts: number[] }>({ title: "", artist: "", tempo: 120, bars: 0, barStarts: [] });
  const [tracks, setTracks] = useState<TrackInfo[]>([]);
  const [shown, setShown] = useState(0);
  const [muted, setMuted] = useState<Set<number>>(new Set());
  const [solo, setSolo] = useState<Set<number>>(new Set());
  const [volumes, setVolumes] = useState<Record<number, number>>({});
  /** Pan (−100 … 100): mikserKaydi ile saklanır. Ana ses tek kaynaktan gelir: oynatıcı ayarları (gf-oynatici › anaSes). */
  const [pans, setPans] = useState<Record<number, number>>({});
  const mikserRef = useRef(mikserKaydi);
  const [position, setPosition] = useState({ current: 0, end: 0, tick: 0, endTick: 0 });
  const [currentBar, setCurrentBar] = useState(0);
  const [range, setRange] = useState<Range | null>(null);
  /** Kontrol çubuğundan açılan panel (aynı anda biri) */
  const [panel, setPanel] = useState<"ayar" | "mikser" | "hiz" | "dongu" | "ses" | null>(null);
  const panelRef = useRef(panel);
  const kapat = useCallback(() => setPanel(null), []);
  const ac = (p: NonNullable<typeof panel>) => setPanel((x) => (x === p ? null : p));
  const hizTetik = useRef<HTMLButtonElement>(null);
  const donguTetik = useRef<HTMLButtonElement>(null);
  const ayarTetik = useRef<HTMLButtonElement>(null);
  const mikserTetik = useRef<HTMLButtonElement>(null);
  const sesTetik = useRef<HTMLButtonElement>(null);
  /** Yapışkan kontrol çubuğu: yüksekliği imleç takibinin kaydırma payını belirler */
  const cubukRef = useRef<HTMLDivElement>(null);
  const isaretRef = useRef<HTMLDivElement>(null);
  const [yapisti, setYapisti] = useState(false);
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
  const callbacks = useRef({ onBpmChange, onPlayingChange, onScore, onBar, onFinished, onDurum });
  const display = useRef({ view, zoom, horizontal });
  /** Kurulumda okunur: değişirse oynatıcı yeniden kurulmaz (Quick Study'de sabit) */
  const rangeRef = useRef(barRange);
  const audioOnlyRef = useRef(audioOnly);
  const programRef = useRef(guitarProgram);
  /**
   * Üç AYRI ses kanalı (0–4,5 kazanç; %0–450): Müzik (parçalar), Metronom, Sayım. alphaTab'ın masterVolume'u bütün
   * sesleri (metronom dahil) çarptığı için SABİT tutulur (CIKIS); Müzik kanalı her track'in karışım sesine çarpan olarak
   * uygulanır (changeTrackVolume → kanal mixVolume), metronom ve sayım alphaTab'ın kendi kanalında (metronomeVolume /
   * countInVolume, üst sınırı yok). Böylece müzik %0 ya da sessizken metronom ve sayım çalmaya devam eder.
   * Kazanç 1'in üstüne çıkınca bozulmasın diye çıkışa sınırlayıcı (DynamicsCompressor) konur (sinirlayiciKur).
   */
  const muzikSesi = ayarlar.sessiz ? 0 : sesKazanci(ayarlar.anaSes);
  const metronomSesi = ayarlar.metronomSessiz ? 0 : sesKazanci(ayarlar.metronomSesi);
  const sayimSesi = ayarlar.sayimSessiz ? 0 : sesKazanci(ayarlar.sayimSesi);
  /** Müzik (%) ve ayarlayıcısı: çalma çubuğundaki kaydırıcı ile mikserdeki aynı değeri değiştirir */
  const anaYuzde = Math.round(muzikSesi * 100);
  const metronomYuzde = Math.round(metronomSesi * 100);
  const anaSesiAyarla = useCallback((v: number) => guncelle({ anaSes: v, sessiz: false }), [guncelle]);
  const playback = useRef({ countIn, speed, loop, ramp, rampa: ayarlar.rampa, barClicks, showFret, shown, metronomSesi, sayimSesi, muzikSesi });
  /** "Hemen başla" ile sayımsız başlatılan çalmada sayım gösterilmez */
  const skipNext = useRef(false);
  /** Shift+tık aralık seçimi: tıklama anında Shift basılı mıydı, son tıklanan ölçü */
  const shiftRef = useRef(false);
  const anchorBar = useRef<number | null>(null);
  useEffect(() => {
    callbacks.current = { onBpmChange, onPlayingChange, onScore, onBar, onFinished, onDurum };
    panelRef.current = panel;
    display.current = { view, zoom, horizontal };
    playback.current = { countIn, speed, loop, ramp, rampa: ayarlar.rampa, barClicks, showFret, shown, metronomSesi, sayimSesi, muzikSesi };
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

  // İmleç takibinde çalınan satır yapışkan çubuğun hemen altına gelsin: pay = çubuğun üst konumu + yüksekliği + boşluk
  const kaydirmaPayi = useCallback(() => {
    const el = cubukRef.current;
    if (!el) return 120;
    return (parseFloat(getComputedStyle(el).top) || 0) + el.offsetHeight + 12;
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
            // Sayfa yerleşiminde tab sayfayla birlikte uzar: imleç takibi sayfayı kaydırır (kontrol çubuğunun altına,
            // bkz. scrollOffsetY). Yatay yerleşimde tab kendi yatay kutusunda kayar.
            scrollElement: h ? viewportRef.current : "html,body",
            scrollOffsetY: -kaydirmaPayi(),
            // Takip yalnız çalarken açılır (bkz. "İmleç takibi"): duruyorken notaya tıklamak sayfayı oynatmasın
            scrollMode: at.ScrollMode.Off,
            enableUserInteraction: !audioOnlyRef.current,
          },
        });
        apiRef.current = api;
        (window.__gfTest ??= { players: [] }).players.push(api);
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
          // Saklı mikser: pan MIDI'ye yazılır (üretimden önce); ses/solo/sessiz oynatıcı hazır olunca uygulanır
          const kayit = mikserRef.current ? mikserOku(mikserRef.current, score.tracks.length) : null;
          if (kayit) {
            for (const t of score.tracks) if (kayit.pan[t.index] !== undefined) setBalance(t, kayit.pan[t.index]);
            setPans(kayit.pan);
            setVolumes(kayit.ses);
            setMuted(new Set(kayit.sessiz));
            setSolo(new Set(kayit.solo));
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
        // Parça yüklendikten sonraki hata tabın değil sesin hatasıdır: tab ekranda kalır
        api.error.on(() => !disposed && !api.score && setStatus("error"));
        api.playerReady.on(() => {
          if (disposed) return;
          sinirlayiciKur(api);
          setPlayerReady(true);
          setSfPercent(null);
        });

        // Ses bankası kendi yükleyicimizle gelir (yüzde, yedek banka, anlaşılır hata; bkz. oynatici/sesBankasi.ts)
        api.player?.soundFontLoadFailed.on(() => !disposed && setSesSorunu("hata"));
        const sesYukle = () => {
          setSesSorunu(null);
          setSfPercent(0);
          sesBankasiYukle(bank, (yuzde) => !disposed && setSfPercent(yuzde))
            .then(({ veri, yedek }) => {
              if (disposed) return;
              const sentez = api.player;
              if (!sentez) return setSesSorunu("hata");
              if (yedek) setSesSorunu("yedek");
              // Sentezleyici hazır olunca verilir (hazırsa hemen)
              let verildi = false;
              sentez.ready.on(() => {
                if (verildi || disposed) return;
                verildi = true;
                api.loadSoundFont(veri, false);
              });
            })
            .catch(() => !disposed && setSesSorunu("hata"));
        };
        sesYukleRef.current = sesYukle;
        sesYukle();

        // "Yalnız ölçü başı" metronomu: her ölçünün ilk vuruşuna perküsyon kanalında (9) tık. Parçada davul izi yoksa
        // kanal 9 yalnız bu tıklarındır: sesi Metronom kanalından gelir (kanal karışım sesi, Müzik'ten bağımsız). Davul izi
        // varsa kanal paylaşılır; tıkın gücü vuruş hızıyla (velocity) ayarlanır.
        api.midiLoad.on((midi: any) => {
          if (disposed || !playback.current.barClicks) return;
          const M = at.midi;
          const shift = midi.tickShift ?? 0;
          const lookups: any[] = api.tickCache?.masterBars ?? [];
          const davul = davulKanaliVar(api);
          const hiz = davul ? Math.min(127, Math.round(112 * Math.min(1, playback.current.metronomSesi))) : 112;
          midi.addEvent(new M.ProgramChangeEvent(0, shift, 9, 0));
          for (const mb of lookups) {
            const t = mb.start + shift;
            midi.addEvent(new M.NoteOnEvent(0, t, 9, 33, hiz));
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
      const kanca = window.__gfTest?.players;
      if (kanca && apiRef.current) kanca.splice(kanca.indexOf(apiRef.current) >>> 0, 1);
      apiRef.current?.destroy();
      apiRef.current = null;
    };
  }, [source, bank, staveProfile, rhythmMode, kaydirmaPayi]);

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

  // İmleç takibi: yalnız çalarken. Sayfa yerleşiminde alphaTab sayfayı (html) kaydırır; çalınan satır kontrol çubuğunun
  // hemen altına gelir. Duruyorken (yükleme, notaya tıklama, ölçü atlama) sayfa yerinden oynamaz.
  const follow = ayarlar.imlecTakibi;
  useEffect(() => {
    const api = apiRef.current;
    if (!api || !atRef.current) return;
    const mod = follow && playing && !audioOnlyRef.current ? atRef.current.ScrollMode.Continuous : atRef.current.ScrollMode.Off;
    if (api.settings.player.scrollMode === mod) return;
    api.settings.player.scrollMode = mod;
    api.updateSettings();
  }, [follow, playerReady, playing]);

  useEffect(() => {
    const el = cubukRef.current;
    if (!el) return;
    const guncelPay = () => {
      const api = apiRef.current;
      if (api) api.settings.player.scrollOffsetY = -kaydirmaPayi();
    };
    guncelPay();
    const ro = new ResizeObserver(guncelPay);
    ro.observe(el);
    return () => ro.disconnect();
  }, [kaydirmaPayi, playerReady]);

  // Çubuk yapıştı mı (köşeler düzleşir, gölge çıkar): çubuğun hemen üstündeki işaret gezinme çubuğunun altına geçince
  useEffect(() => {
    const el = isaretRef.current;
    if (!el) return;
    const ust = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h")) * 16 || 48;
    const io = new IntersectionObserver(([e]) => setYapisti(!e.isIntersecting && e.boundingClientRect.top < ust + 1), { rootMargin: `-${ust + 1}px 0px 0px 0px` });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Çalma ayarları
  useEffect(() => {
    const api = apiRef.current;
    if (!api) return;
    api.playbackSpeed = speed / 100;
    api.masterVolume = CIKIS;
    api.metronomeVolume = metronome && !barClicks ? metronomSesi : 0;
    api.isLooping = loop;
    api.countInVolume = countIn ? sayimSesi : 0;
    // Ölçü başı tıkları (kanal 9, davul izi yoksa): Metronom kanalının sesi
    if (barClicks && api.score && !davulKanaliVar(api)) api.player?.setChannelVolume?.(9, metronomSesi);
  }, [speed, metronome, barClicks, loop, countIn, metronomSesi, sayimSesi, playerReady]);

  // Müzik kanalı: her track'in karışım sesi = mikserdeki track sesi × Müzik. Metronom ve sayım bundan etkilenmez.
  useEffect(() => {
    const api = apiRef.current;
    if (!api?.score || !playerReady) return;
    for (const t of api.score.tracks) api.changeTrackVolume([t], ((volumes[t.index] ?? 100) / 100) * muzikSesi);
  }, [volumes, muzikSesi, playerReady, tracks]);

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
      api.countInVolume = playback.current.countIn ? playback.current.sayimSesi : 0;
    }
  }, [barClicks, playerReady]);

  // Saklı mikser ayarlarını oynatıcıya uygula (ses bankası yüklenince) ve değiştikçe sakla
  useEffect(() => {
    const api = apiRef.current;
    if (!api?.score || !playerReady || !mikserRef.current) return;
    for (const t of api.score.tracks) {
      if (mutedTracks === undefined) {
        api.changeTrackMute([t], muted.has(t.index));
        api.changeTrackSolo([t], solo.has(t.index));
      }
    }
    // Yalnız ilk hazır oluşta; sonraki değişiklikleri düğmeler doğrudan uygular
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerReady]);
  useEffect(() => {
    if (!mikserRef.current || !tracks.length) return;
    mikserYaz(mikserRef.current, { izSayisi: tracks.length, ana: anaYuzde, ses: volumes, pan: pans, sessiz: [...muted], solo: [...solo] });
  }, [tracks.length, anaYuzde, volumes, pans, muted, solo]);

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
    api.countInVolume = playback.current.countIn ? playback.current.sayimSesi : 0;
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
        // Açık panel varsa Esc yalnız paneli kapatır (Acilir)
        if (panelRef.current) return;
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

  /** Track sesi (mikser): uygulanan kazanç track sesi × Müzik kanalıdır (yukarıdaki etki) */
  const changeVolume = (i: number, value: number) => setVolumes((v) => ({ ...v, [i]: value }));

  // Pan: track'in MIDI pan değeri (0–16) değişir, MIDI yeniden üretilir (çalıyorsa kaldığı yerden sürer)
  const panTimer = useRef(0);
  const changePan = (i: number, value: number) => {
    const api = apiRef.current;
    setPans((p) => ({ ...p, [i]: value }));
    const t = api?.score?.tracks[i];
    if (!t) return;
    setBalance(t, value);
    window.clearTimeout(panTimer.current);
    panTimer.current = window.setTimeout(() => {
      if (apiRef.current !== api || !api.score) return;
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
        api.countInVolume = playback.current.countIn ? playback.current.sayimSesi : 0;
      }
    }, 250);
  };
  /** Play-along: yalnız i susar (soloları kaldırır); zaten öyleyse bütün track'ler açılır */
  const muteOnly = (i: number) => {
    const api = apiRef.current;
    const already = muted.has(i) && muted.size === 1 && solo.size === 0;
    const next = already ? new Set<number>() : new Set([i]);
    setMuted(next);
    setSolo(new Set());
    for (const t of api?.score?.tracks ?? []) {
      api.changeTrackSolo([t], false);
      api.changeTrackMute([t], next.has(t.index));
    }
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

  // Çalışma Defteri: ölçü, hız, aralık ya da kısım değişince bildir (yalnız okur)
  const durumA = rangeBars ? rangeBars[0] : -1;
  const durumB = rangeBars ? rangeBars[1] : -1;
  const durumKisim = activePart?.name ?? null;
  useEffect(() => {
    if (!meta.bars) return;
    callbacks.current.onDurum?.({ olcu: currentBar, hiz: speed, bpm, aralik: durumA >= 0 ? [durumA, durumB] : null, kisim: durumKisim });
  }, [meta.bars, currentBar, speed, bpm, durumA, durumB, durumKisim]);

  // Kaldığın yerden devam: oynatıcı hazır olunca bir kez (n değişince yeniden)
  const devamUygulandi = useRef(0);
  useEffect(() => {
    if (!devam || !playerReady || devam.n === devamUygulandi.current) return;
    // Bir sonraki karede uygulanır (oynatıcı hazır olduğu karede ölçü bilgisi tamamlanmış olsun)
    const id = requestAnimationFrame(() => {
      devamUygulandi.current = devam.n;
      if (devam.hiz) setSpeed(devam.hiz);
      const ar = devam.aralik;
      if (ar) selectBars(ar[0], ar[1]);
      if (devam.olcu !== undefined && (!ar || (devam.olcu > ar[0] && devam.olcu <= ar[1]))) gotoBar(devam.olcu);
      if (devam.oynat === "cal" && apiRef.current?.playerState !== 1) apiRef.current?.play();
      if (devam.oynat === "dur") apiRef.current?.pause();
    });
    return () => cancelAnimationFrame(id);
  }, [devam, playerReady, selectBars, gotoBar, setSpeed]);

  const multiTrack = tracks.length > 1 && mutedTracks === undefined && !audioOnly;
  const showParts = !!parts?.length && !barRange && meta.bars > 0;
  const shownTrack = tracks.find((t) => t.index === shown);
  /** Kontrol çubuğu düğmeleri: zeminsiz, üstüne gelince hafif dolgu (apple.com), açıkken vurgu rengi */
  const ctl =
    "inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-full px-2.5 text-sm transition hover:bg-ink/[0.08] disabled:opacity-40 disabled:hover:bg-transparent focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--accent)]";
  const ikon = `${ctl} w-8 !px-0`;
  const kucukIkon = `${ctl} h-7 w-7 !px-0`;
  const on = "!bg-accent !text-accent-ink hover:!bg-accent/85";
  const ayrac = <span className="mx-0.5 h-5 w-px shrink-0 bg-line" aria-hidden />;
  const calEtiketi = playerReady ? (playing ? "Duraklat" : "Çal") : sesSorunu === "hata" ? "Ses yok" : sfPercent !== null && sfPercent < 100 ? `Ses %${sfPercent}` : "Ses hazırlanıyor…";
  const ozelSecim = range && rangeBars && !activePart ? `${rangeBars[0] + 1}${rangeBars[1] !== rangeBars[0] ? `–${rangeBars[1] + 1}` : ""}` : null;

  return (
    <div className="card relative" onPointerDown={() => (lastTouchedPlayer = playerId)}>
      {/* Yapışma işareti: bu çizgi gezinme çubuğunun altına geçince kontrol çubuğu "yapışmış" sayılır */}
      <div ref={isaretRef} className="h-0" aria-hidden />
      {/* Kontrol çubuğu: bütün kontroller tek satırda; sayfa kayarken üstte (site gezinmesinin altında) yapışkan kalır */}
      <div
        ref={cubukRef}
        role="region"
        aria-label="Oynatıcı kontrolleri"
        data-kontrol-cubugu
        data-yapisti={yapisti || undefined}
        className={`glass @container sticky top-[var(--nav-h)] z-[6] border-b border-line transition-[border-radius,box-shadow] ${yapisti ? "rounded-none shadow-[0_6px_16px_-10px_rgb(0_0_0/0.35)]" : "rounded-t-[var(--radius-card)]"}`}
      >
        <div className="flex min-h-[3.25rem] flex-wrap items-center gap-x-1 gap-y-1 px-2 py-1.5 sm:px-3">
          <button
            type="button"
            onClick={() => apiRef.current?.playPause()}
            disabled={!playerReady}
            className={`btn-primary h-9 shrink-0 disabled:opacity-40 ${playerReady ? "w-9 !px-0" : "px-3 text-xs tabular-nums"}`}
            title={playerReady ? "Çal / Duraklat (Boşluk)" : sesSorunu === "hata" ? "Çal / Duraklat: ses yüklenemedi" : "Çal / Duraklat: ses bankası yükleniyor, hazır olunca açılır"}
          >
            {playerReady ? (
              <>
                {playing ? <Pause size={16} fill="currentColor" aria-hidden /> : <Play size={16} fill="currentColor" className="translate-x-px" aria-hidden />}
                <span className="sr-only">{calEtiketi}</span>
              </>
            ) : (
              calEtiketi
            )}
          </button>
          <button type="button" onClick={() => apiRef.current?.stop()} disabled={!playerReady} className={ikon} title="Başa dön" aria-label="Başa dön">
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
              className={ctl}
              title="Baştan bir kez daha dinle"
            >
              ↺ Tekrar
            </button>
          )}

          {/* Konum: süre, ilerleme (tıkla-git, sürükle), kısım sınırları */}
          <div className="flex min-w-[6rem] flex-1 items-center gap-1.5 px-1 text-xs tabular-nums">
            <span className="w-8 text-right">{formatTime(position.current)}</span>
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
              className={`group relative mx-1 h-6 flex-1 touch-none rounded-full focus-visible:outline-2 focus-visible:outline-[var(--accent)] ${playerReady ? "cursor-pointer" : "opacity-40"}`}
              onPointerDown={(e) => {
                if (!playerReady) return;
                e.currentTarget.setPointerCapture(e.pointerId);
                seekTo(e.clientX);
              }}
              onPointerMove={(e) => e.currentTarget.hasPointerCapture(e.pointerId) && seekTo(e.clientX)}
            >
              <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-ink/10">
                {range && <div className="absolute inset-y-0 bg-ink/20" style={{ left: `${pct(range.startTick)}%`, width: `${pct(range.endTick) - pct(range.startTick)}%` }} />}
                <div className="bar-fill absolute inset-y-0 left-0 rounded-full" style={{ width: `${pct(position.tick)}%` }} />
              </div>
              {showParts &&
                parts!.slice(1).map((p) => (
                  <span key={p.name} className="absolute top-1/2 h-2.5 w-px -translate-y-1/2 bg-ink/40" style={{ left: `${pct(barTick(p.bars[0] - 1))}%` }} aria-hidden />
                ))}
              <span
                className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_0_0.5px_rgb(0_0_0/0.12),0_1px_4px_rgb(0_0_0/0.25)] transition-transform group-hover:scale-110"
                style={{ left: `${pct(position.tick)}%` }}
                aria-hidden
              />
            </div>
            <span className="w-8 text-muted">{formatTime(position.end)}</span>
          </div>

          {meta.bars > 0 && (
            <div className="flex shrink-0 items-center text-sm tabular-nums" role="group" aria-label="Ölçü">
              <button type="button" className={kucukIkon} onClick={() => gotoBar(currentBar - 1)} disabled={!playerReady} title="Önceki ölçü (←)" aria-label="Önceki ölçü">
                <ChevronLeft size={15} />
              </button>
              <span className="min-w-[4.75rem] whitespace-nowrap text-center text-xs text-muted @max-6xl:min-w-[3rem]" aria-live="off">
                {/* Dar çubukta (72rem altı) etiket yazıları gizlenir, kontroller tek satırda kalsın */}
                <span className="@max-6xl:sr-only">Ölçü </span>
                <span className="text-sm font-semibold text-text">{currentBar + 1}</span>/{meta.bars}
              </span>
              <button type="button" className={kucukIkon} onClick={() => gotoBar(currentBar + 1)} disabled={!playerReady} title="Sonraki ölçü (→)" aria-label="Sonraki ölçü">
                <ChevronRight size={15} />
              </button>
            </div>
          )}

          {ayrac}
          {/* Hız: −/+ ve açılır panel (kaydırıcı, %50/%75/%100, kademeli hızlanma) */}
          <div className="relative flex shrink-0 items-center" role="group" aria-label="Hız">
            <button type="button" className={kucukIkon} onClick={() => setSpeed(speed - 5)} disabled={speed <= MIN_SPEED} aria-label="Yavaşlat (↓)" title="Yavaşlat %5 (↓)">
              −
            </button>
            <button
              ref={hizTetik}
              type="button"
              data-hiz-dugmesi
              onClick={() => ac("hiz")}
              className={`${ctl} px-2 tabular-nums ${panel === "hiz" ? "bg-ink/[0.08]" : ""}`}
              aria-haspopup="dialog"
              aria-expanded={panel === "hiz"}
              aria-label={`Hız %${speed}, ${bpm} BPM${ramp ? ", kademeli hızlanma açık" : ""}: hız panelini aç`}
              title={`Hız %${speed} · ${bpm} BPM${ramp ? ` · kademeli → %${ayarlar.rampa.hedef}` : ""}`}
            >
              {ramp ? <TrendingUp size={14} className="text-accent" aria-hidden /> : <Gauge size={14} className="text-muted" aria-hidden />}
              <span className="min-w-[2.6rem] text-left">%{speed}</span>
              <ChevronDown size={12} className="-ml-1 text-muted" aria-hidden />
            </button>
            <button type="button" className={kucukIkon} onClick={() => setSpeed(speed + 5)} disabled={speed >= MAX_SPEED} aria-label="Hızlandır (↑)" title="Hızlandır %5 (↑)">
              +
            </button>
            {panel === "hiz" && (
              <Acilir tetik={hizTetik} onKapat={kapat} etiket="Hız" className="left-0 w-[19rem] space-y-3">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-semibold">Hız</h3>
                  <span className="text-sm tabular-nums">
                    %{speed} <span className="text-muted">· {bpm} BPM</span>
                  </span>
                </div>
                <input type="range" min={MIN_SPEED} max={MAX_SPEED} step={5} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="w-full accent-[var(--accent)]" aria-label="Hız" />
                <div className="flex gap-1.5">
                  {SPEEDS.map((v) => (
                    <button key={v} type="button" onClick={() => setSpeed(v)} aria-pressed={speed === v} className={`flex-1 rounded-full border border-ink/10 bg-ink/[0.04] py-1 text-sm tabular-nums transition hover:bg-ink/10 ${speed === v ? on : ""}`}>
                      %{v}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={ramp}
                  onClick={toggleRamp}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border-t border-ink/[0.07] px-1 pt-3 text-left text-sm"
                  title="Kademeli hızlanma: döngü açılır, her turda hız bir adım artar"
                >
                  <span>
                    <span className="flex items-center gap-1.5 font-semibold">
                      <TrendingUp size={14} /> Kademeli hızlanma
                    </span>
                    <span className="block text-xs text-muted tabular-nums">
                      %{ayarlar.rampa.baslangic}&apos;tan başla, her döngüde +%{ayarlar.rampa.adim}, hedef %{ayarlar.rampa.hedef}
                      {ramp ? (speed >= ayarlar.rampa.hedef ? " · hedefte" : ` · şimdi %${speed}`) : ""}
                    </span>
                  </span>
                  <span className={`relative h-5 w-9 shrink-0 rounded-full transition ${ramp ? "bar-fill" : "bg-ink/15"}`}>
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${ramp ? "left-[1.125rem]" : "left-0.5"}`} />
                  </span>
                </button>
                <p className="text-xs text-muted">↑ ↓ tuşları ±%5 · adımlar Ayarlar&apos;da</p>
              </Acilir>
            )}
          </div>

          {/* Döngü: aç/kapa (L) ve açılır panel (bu ölçü, seçim) */}
          <div className="relative flex shrink-0 items-center" role="group" aria-label="Döngü">
            <button type="button" onClick={() => setLoop((x) => !x)} className={`${ikon} w-[1.875rem] !rounded-l-full !rounded-r-none ${loop ? on : ""}`} title="Döngü (L): seçili aralık ya da bütün parça tekrar eder" aria-label="Döngü (L)" aria-pressed={loop}>
              <Repeat size={15} />
            </button>
            <button
              ref={donguTetik}
              type="button"
              data-dongu-dugmesi
              onClick={() => ac("dongu")}
              className={`${ctl} h-8 w-5 !rounded-l-none !rounded-r-full !px-0 ${loop ? "bg-accent/15" : ""} ${panel === "dongu" ? "!bg-ink/[0.12]" : ""}`}
              aria-haspopup="dialog"
              aria-expanded={panel === "dongu"}
              aria-label="Döngü seçenekleri: bu ölçü, seçim"
              title="Döngü seçenekleri: bu ölçüyü döngüye al, seçimi kaldır"
            >
              <ChevronDown size={12} className="text-muted" />
            </button>
            {panel === "dongu" && (
              <Acilir tetik={donguTetik} onKapat={kapat} etiket="Döngü" className="left-0 w-[19rem] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Döngü</h3>
                  <span className="text-xs text-muted">{loop ? "açık" : "kapalı"} · L</span>
                </div>
                <button
                  type="button"
                  onClick={() => selectBars(currentBar, currentBar)}
                  disabled={!playerReady}
                  className={`flex w-full items-center justify-between rounded-xl border border-ink/10 bg-ink/[0.04] px-3 py-2 text-sm transition hover:bg-ink/10 disabled:opacity-40 ${rangeBars && rangeBars[0] === rangeBars[1] && rangeBars[0] === currentBar ? on : ""}`}
                  title="Bulunulan ölçüyü döngüye al (Shift + tık ile birden çok ölçü seçilir)"
                >
                  Bu ölçü <span className="text-xs tabular-nums opacity-75">ölçü {currentBar + 1} döngüye girer</span>
                </button>
                {range && rangeBars ? (
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span>
                      Seçim: ölçü {rangeBars[0] + 1}
                      {rangeBars[1] !== rangeBars[0] ? `–${rangeBars[1] + 1}` : ""}
                      {activePart ? ` (kısım ${activePart.name})` : ""}
                    </span>
                    <button type="button" onClick={clearRange} className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-[var(--link)] hover:bg-ink/10" title="Seçimi kaldır (Esc)">
                      Seçimi kaldır
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-muted">Seçim yok: döngü bütün parçayı tekrarlar.</p>
                )}
                <p className="text-xs text-muted">Tabda sürükleyerek ya da Shift + tıkla ölçü aralığı seç; notaya tıklayınca oradan çalar.</p>
              </Acilir>
            )}
          </div>
          {ozelSecim && (
            <span className="inline-flex h-7 shrink-0 items-center gap-0.5 rounded-full bg-accent/10 pl-2.5 pr-0.5 text-xs font-semibold tabular-nums text-accent">
              Seçim {ozelSecim}
              <button type="button" onClick={clearRange} className="rounded-full p-1 hover:bg-accent/20" title="Seçimi kaldır (Esc)" aria-label="Seçimi kaldır">
                <X size={12} />
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={() => setMetronome((x) => !x)}
            className={`${ikon} ${metronome ? on : ""}`}
            title={`Metronom (M) · ${ayarlar.metronomKipi === "olcu" ? "yalnız ölçü başı" : "her vuruş"} (ayarlardan değiştir)`}
            aria-label="Metronom (M)"
            aria-pressed={metronome}
          >
            <MetronomeIcon size={15} />
          </button>
          {/* Metronomun kendi ses kaydırıcısı (Metronom kanalı; müziğin sesinden bağımsız) */}
          <input
            type="range"
            min={0}
            max={SES_UST}
            step={5}
            value={metronomYuzde}
            onChange={(e) => guncelle({ metronomSesi: Number(e.target.value), metronomSessiz: false })}
            className={`w-14 shrink-0 accent-[var(--accent)] ${metronome ? "" : "opacity-50"}`}
            aria-label="Metronom sesi"
            title={`Metronom sesi %${metronomYuzde} (%0–${SES_UST}; müzikten ayrı)`}
            data-metronom-sesi
          />
          <button
            type="button"
            onClick={() => setCountIn(!countIn)}
            className={`${ctl} ${countIn ? on : ""}`}
            title={countIn ? "Sayım açık: başlamadan önce bir ölçü sayar. Kapatmak için tıkla." : "Sayım kapalı: Çal'a basınca hemen başlar."}
            aria-pressed={countIn}
          >
            <Timer size={14} aria-hidden />
            <span className="@max-6xl:sr-only">Sayım</span>
          </button>

          {showParts && (
            <>
              {ayrac}
              <div className="flex shrink-0 gap-0.5 rounded-full border border-ink/[0.08] bg-ink/[0.05] p-0.5 text-sm" role="group" aria-label="Kısımlar">
                <button type="button" onClick={clearRange} aria-pressed={!range} className={`rounded-full px-2.5 py-0.5 transition ${!range ? "bg-seg text-text shadow-[var(--shadow-seg)]" : "text-muted hover:text-text"}`} title="Bütün çalışma">
                  Tümü
                </button>
                {parts!.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => selectBars(p.bars[0] - 1, p.bars[1] - 1)}
                    disabled={!playerReady}
                    aria-pressed={activePart === p}
                    aria-label={`Kısım ${p.name}, ölçü ${p.bars[0]}–${p.bars[1]}: ${p.focus}`}
                    className={`min-w-8 rounded-full px-2.5 py-0.5 font-semibold transition disabled:opacity-40 ${activePart === p ? "bg-seg text-text shadow-[var(--shadow-seg)]" : "text-muted hover:text-text"}`}
                    title={`${p.name} (ölçü ${p.bars[0]}–${p.bars[1]}): ${p.focus}. Tıkla: bu kısım döngüye girer.`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </>
          )}
          {audioOnly && (
            <span className="shrink-0 rounded-full bg-ink/[0.06] px-2.5 py-0.5 text-xs text-muted" title="Transkripsiyon: tab ve nota gizli, yalnız ses çalar">
              Yalnız ses
            </span>
          )}
          {scoreOnly && !audioOnly && (
            <span className="shrink-0 rounded-full bg-ink/[0.06] px-2.5 py-0.5 text-xs text-muted" title="Porte okuma dersi: tab gizli, notayı porteden oku">
              Yalnız nota
            </span>
          )}

          <div className="ml-auto flex shrink-0 items-center gap-1">
            {/* Müzik kanalı: her oynatıcıda görünür; tercih kalıcı (gf-oynatici › anaSes), mikserdeki "Müzik" ile aynı değer.
                Hoparlör düğmesi yalnız müziği susturur: metronom ve sayım çalmaya devam eder. */}
            <div className="flex items-center gap-1 text-sm" role="group" aria-label="Müzik sesi">
              <button
                type="button"
                data-ana-ses-dugmesi
                onClick={() => guncelle(muzikSesi === 0 ? { sessiz: false, ...(sesKazanci(ayarlar.anaSes) === 0 ? { anaSes: 100 } : {}) } : { sessiz: true })}
                className={ikon}
                aria-pressed={muzikSesi === 0}
                title={muzikSesi === 0 ? "Müziği aç" : "Müziği sessize al (metronom ve sayım çalmaya devam eder)"}
                aria-label={muzikSesi === 0 ? "Müziği aç" : "Müziği sessize al"}
              >
                {muzikSesi === 0 ? <VolumeX size={16} className="text-bad" /> : muzikSesi < 0.5 ? <Volume1 size={16} /> : <Volume2 size={16} />}
              </button>
              <input
                type="range"
                min={0}
                max={SES_UST}
                step={5}
                value={anaYuzde}
                onChange={(e) => anaSesiAyarla(Number(e.target.value))}
                className="w-20 accent-[var(--accent)]"
                aria-label="Müzik sesi"
                title={`Müzik sesi (%0–${SES_UST}); metronom ve sayımın sesi ayrı`}
              />
              <span className="w-9 whitespace-nowrap text-xs tabular-nums text-muted @max-6xl:sr-only">%{anaYuzde}</span>
            </div>
            <button
              ref={sesTetik}
              type="button"
              data-ses-kanallari-dugmesi
              onClick={() => ac("ses")}
              className={`${ikon} ${panel === "ses" ? on : ""}`}
              aria-haspopup="dialog"
              aria-expanded={panel === "ses"}
              aria-label="Ses kanalları"
              title="Ses kanalları: müzik, metronom ve sayım ayrı ayrı (%0–450)"
            >
              <AudioLines size={16} />
            </button>
            {multiTrack && (
              <button
                ref={mikserTetik}
                type="button"
                data-mikser-dugmesi
                onClick={() => ac("mikser")}
                className={`${ctl} ${panel === "mikser" ? on : ""}`}
                aria-haspopup="dialog"
                aria-expanded={panel === "mikser"}
                title="Mikser: track sesleri, pan, solo, sessiz, gösterilen track"
              >
                <SlidersHorizontal size={14} aria-hidden /> <span className="@max-6xl:sr-only">Mikser</span>
              </button>
            )}
            <button
              ref={ayarTetik}
              type="button"
              data-ayar-dugmesi
              onClick={() => ac("ayar")}
              className={`${ikon} ${panel === "ayar" ? on : ""}`}
              aria-haspopup="dialog"
              aria-expanded={panel === "ayar"}
              aria-label="Ayarlar"
              title="Ayarlar: görünüm, yerleşim, yakınlaştırma, sap paneli, metronom, ses seviyeleri, kısayollar"
            >
              <Settings2 size={16} />
            </button>
          </div>
        </div>

        {/* Ses durumu: yüklenirken yüzde, sorun varsa anlaşılır mesaj (tab görünür kalır) */}
        {status !== "error" && (!playerReady || sesSorunu) && (
          <div data-ses-durumu role="status" className={`flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line/60 px-3 py-1 text-xs ${sesSorunu === "hata" ? "text-bad" : "text-muted"}`}>
            {sesSorunu === "hata" ? (
              <span>Ses yüklenemedi: ses bankası dosyası indirilemedi. Tab görünür ama çalınamaz; bağlantıyı ya da kurulumu (npm install) kontrol et.</span>
            ) : !playerReady ? (
              <>
                <span className="tabular-nums">Ses bankası yükleniyor{sfPercent !== null && sfPercent < 100 ? ` %${sfPercent}.` : "…"} Hazır olunca Çal düğmesi açılır.</span>
                <span className="h-1 w-24 overflow-hidden rounded-full bg-ink/10" aria-hidden>
                  <span className="bar-fill block h-full rounded-full transition-all" style={{ width: `${sfPercent ?? 100}%` }} />
                </span>
              </>
            ) : (
              <span>
                {BANKA_ADI[bank]} ses bankası yüklenemedi; yedek banka ({BANKA_ADI[bank === "generaluser" ? "sonivox" : "generaluser"]}) ile çalınıyor.
              </span>
            )}
            {sesSorunu && (
              <button type="button" onClick={() => sesYukleRef.current()} className="rounded-full border border-ink/15 px-2.5 py-0.5 font-semibold text-text hover:bg-ink/10">
                Yeniden dene
              </button>
            )}
          </div>
        )}

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
            onKapat={kapat}
            tetik={ayarTetik}
            akort={!audioOnly ? shownTrack?.tuning : undefined}
          />
        )}
        {panel === "ses" && (
          <Acilir tetik={sesTetik} onKapat={kapat} etiket="Ses kanalları" className="right-0 w-[min(24rem,calc(100vw-2rem))]">
            <p className="mb-3 text-sm font-semibold">Ses kanalları</p>
            <SesKanallari ayarlar={ayarlar} guncelle={guncelle} />
          </Acilir>
        )}
        {multiTrack && panel === "mikser" && (
          <Acilir tetik={mikserTetik} onKapat={kapat} etiket="Mikser" className="right-0 w-[min(56rem,calc(100vw-2rem))]">
            <Mikser
              izler={tracks}
              gosterilen={shown}
              sessiz={muted}
              solo={solo}
              ses={volumes}
              onGoster={setShown}
              onSessiz={toggleMute}
              onSolo={toggleSolo}
              onSes={changeVolume}
              pan={pans}
              onPan={changePan}
              ana={anaYuzde}
              onAna={anaSesiAyarla}
              onYalnizBunuSustur={muteOnly}
              hatirlaniyor={!!mikserKaydi}
            />
          </Acilir>
        )}

        {/* Sayım: çubuğun altında, tabın üstünde yüzer */}
        {counting !== null && (
          <div className="pointer-events-none absolute inset-x-0 top-full z-10 flex justify-center p-2" role="status" aria-live="assertive">
            <div className="bg-elevated pointer-events-auto flex items-center gap-4 rounded-full border border-ink/10 py-2 pl-6 pr-2 text-text shadow-[var(--shadow-pop)]">
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
      </div>

      {activePart && !audioOnly && (
        <p className="border-b border-line/60 px-4 py-1.5 text-xs text-muted">
          <span className="font-semibold text-text">Kısım {activePart.name}</span> · ölçü {activePart.bars[0]}–{activePart.bars[1]} · {activePart.focus}
        </p>
      )}

      {/* Tab: sayfa yerleşiminde kendi kaydırma kutusu yok, sayfayla aşağı uzar; yatay yerleşimde yana kayar */}
      <div
        ref={viewportRef}
        aria-hidden={audioOnly || undefined}
        className={`relative isolate bg-[var(--sheet)] text-[var(--sheet-ink)] ${audioOnly ? "h-0 overflow-hidden p-0" : `p-2 ${horizontal ? "overflow-x-auto" : ""}`} ${showFret && !audioOnly ? "" : "rounded-b-[var(--radius-card)]"}`}
        onPointerDownCapture={(e) => (shiftRef.current = e.shiftKey)}
      >
        {status === "loading" && <p className="p-6 text-center text-sm text-muted">Tab yükleniyor…</p>}
        {status === "error" && <p className="p-6 text-center text-sm text-bad">Tab açılamadı. Dosya bozuk ya da desteklenmeyen bir formatta olabilir.</p>}
        <div ref={hostRef} />
      </div>

      {showFret && !audioOnly && (
        <div className="sticky bottom-0 z-[5] overflow-hidden rounded-b-[var(--radius-card)]">
          <SapPaneli
            akort={shownTrack?.tuningMidi.length ? shownTrack.tuningMidi : [64, 59, 55, 50, 45, 40]}
            notalar={fretNotes?.notes ?? []}
            etiket={fretNotes ? `Ölçü ${fretNotes.bar + 1}` : "Çal'a bas ya da bir notaya tıkla"}
            onKapat={() => guncelle({ sap: false })}
          />
        </div>
      )}
    </div>
  );
}
