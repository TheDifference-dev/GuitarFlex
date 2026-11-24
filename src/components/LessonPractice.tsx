"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CheckCircle2, Pause, Play } from "lucide-react";
import TabPlayer, { type DevamKomutu, type OynaticiDurumu, type TabSource } from "./TabPlayer";
import Metronome from "./Metronome";
import { formatClock } from "./CourseView";
import { addPracticeTime, useProgress } from "@/lib/progress";
import { defterIsle, defterOku, dersKaydi, kayitGitari, olcumEkle, type Ek, type Kayit } from "@/lib/defter";
import DefterSeridi from "./defter/DefterSeridi";
import type { LessonKind, LessonPart, Stave } from "@/content/types";
import QuickStudy from "./turler/QuickStudy";
import Transkripsiyon from "./turler/Transkripsiyon";
import Kompozisyon from "./turler/Kompozisyon";

type Props = {
  progressKey: string;
  bpm: number;
  minutes: number;
  tex?: string;
  /** Tarayıcıdan erişilebilir tab dosyası adresi */
  tabUrl?: string;
  /** Tabsız okuma adımı: metin sayfada gösterilir, burada sadece sayaç kalır */
  reading?: boolean;
  /** Oynatıcının görünümü (ders alanı `stave`): "score" porte okuma, tab gizli */
  stave?: Stave;
  /** Ders türü (İP6d): quickstudy, transkripsiyon ve kompozisyon kendi çalışma ekranını açar; diğerleri tab oynatıcı */
  kind?: LessonKind;
  readBars?: [number, number];
  improvBars?: [number, number];
  chords?: string[];
  title?: string;
  /** Çalışmanın kısımları (A / A′ / B / C): oynatıcıda kısım düğmeleri */
  parts?: LessonPart[];
  /** Dersin ton ipucundan seçilen gitar sesi (General MIDI programı) */
  guitarProgram?: number;
  /** Ders başlığı (sunucuda çizilir): yanında küçük sayaç durur */
  baslik?: ReactNode;
  /** Başlıkla oynatıcı arasındaki içerik (okuma dersinin metni) */
  children?: ReactNode;
  /** Çalışma Defteri kaydı: kurs adı ve ders adresi (verilmezse defter şeridi gösterilmez) */
  defter?: { kurs: string; href: string };
};

const SAVE_EVERY = 5;

/** Ders ekranı: tab oynatıcı + hedef süre sayacı. Çalma süresi otomatik kaydedilir. */
export default function LessonPractice({ progressKey, bpm, minutes, tex, tabUrl, reading, stave, kind, readBars, improvBars, chords, title, parts, guitarProgram, baslik, children, defter }: Props) {
  const progress = useProgress();
  const saved = progress.exercises[progressKey];
  const target = minutes * 60;

  const [running, setRunning] = useState(false);
  const [pending, setPending] = useState(0);
  const [currentBpm, setCurrentBpm] = useState(bpm);
  const [texFromFile, setTexFromFile] = useState<string | null>(null);
  const pendingRef = useRef(0);
  const bpmRef = useRef(bpm);

  // Çalışma Defteri: yalnız oynatıcı gerçekten çalarken geçen saniyeler (aynı sayaçtan; elle başlatılan sayaç
  // ilerleme kaydına yazılır ama deftere yazılmaz). Ders süresi ilerleme kaydına zaten yazıldığı için defter onu
  // ikinci kez görev sayacına eklemez. Defter kaydı yalnız kullanıcı dersi deftere aldıysa güncellenir (olcumEkle):
  // dersi açmak ya da çalmak deftere/takvime kendiliğinden kayıt açmaz; ilerleme kaydı (Profil) her durumda sayar.
  const bilgi = useMemo(() => (defter ? dersKaydi(progressKey, title ?? progressKey, defter.kurs, defter.href) : null), [defter, progressKey, title]);
  const bilgiRef = useRef(bilgi);
  const calarRef = useRef(false);
  /** Son yazımdan beri çalındı mı: çalınmadan (sayfayı açıp kapatınca) kaldığın yer değişmesin */
  const caldiRef = useRef(false);
  const defterBekleyen = useRef(0);
  const durumRef = useRef<OynaticiDurumu | null>(null);
  const [canliKisim, setCanliKisim] = useState<string | null>(null);
  const [devam, setDevam] = useState<DevamKomutu | undefined>(undefined);
  /** Oynatıcının durumundan deftere yazılacak son konum: kısım (seçili, yoksa ölçünün düştüğü kısım), ölçü, hız */
  const defterEki = useCallback((): Ek => {
    const d = durumRef.current;
    if (!d) return {};
    const kisim = d.kisim ?? parts?.find((p) => d.olcu + 1 >= p.bars[0] && d.olcu + 1 <= p.bars[1])?.name ?? null;
    return { kisim, konum: d.olcu + 1, hiz: d.hiz, tempo: d.bpm, aralik: d.aralik };
  }, [parts]);
  const defterYaz = useCallback(() => {
    const b = bilgiRef.current;
    if (!b) return;
    const sn = defterBekleyen.current;
    defterBekleyen.current = 0;
    if (!sn && !caldiRef.current) return;
    caldiRef.current = calarRef.current;
    const ek = defterEki();
    defterIsle((v) => olcumEkle(v, b, sn, { ...ek, gitar: kayitGitari(v, v.kayitlar[b.id]) }));
  }, [defterEki]);
  const onDurum = useCallback(
    (d: OynaticiDurumu) => {
      durumRef.current = d;
      const k = d.kisim ?? null;
      setCanliKisim((x) => (x === k ? x : k));
    },
    [],
  );
  const calmaDegisti = useCallback((p: boolean) => {
    calarRef.current = p;
    if (p) caldiRef.current = true;
    setRunning(p);
  }, []);
  /** Kaldığın yerden devam: kısım döngüsü (varsa), ölçü ve hız oynatıcıya taşınır */
  const devamEt = useCallback((k: Kayit) => {
    setDevam((x) => ({ n: (x?.n ?? 0) + 1, olcu: k.konum ? k.konum - 1 : undefined, aralik: k.aralik, hiz: k.hiz }));
    document.querySelector("[data-kontrol-cubugu]")?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, []);
  const kisimSec = useCallback(
    (ad: string | null) => {
      const p = parts?.find((x) => x.name === ad);
      setDevam((x) => ({ n: (x?.n ?? 0) + 1, aralik: p ? [p.bars[0] - 1, p.bars[1] - 1] : null, olcu: p ? undefined : 0 }));
    },
    [parts],
  );
  // Defterdeki "Devam et" bağlantısı (#devam): sayfa açılınca kaldığın yere git
  useEffect(() => {
    if (window.location.hash !== "#devam" || !bilgi) return;
    const id = requestAnimationFrame(() => {
      const k = defterOku().kayitlar[bilgi.id];
      if (k?.konum) devamEt(k);
    });
    return () => cancelAnimationFrame(id);
  }, [bilgi, devamEt]);

  const isTexFile = !!tabUrl && /\.a?tex$/i.test(decodeURIComponent(tabUrl));
  useEffect(() => {
    if (!tabUrl || !isTexFile) return;
    let cancelled = false;
    fetch(tabUrl)
      .then((r) => r.text())
      .then((t) => !cancelled && setTexFromFile(t));
    return () => {
      cancelled = true;
    };
  }, [tabUrl, isTexFile]);

  const source = useMemo<TabSource | null>(() => {
    if (tex) return { kind: "tex", tex };
    if (tabUrl && !isTexFile) return { kind: "url", url: tabUrl };
    if (texFromFile) return { kind: "tex", tex: texFromFile };
    return null;
  }, [tex, tabUrl, isTexFile, texFromFile]);

  // Biriken süreyi kaydeder. Ref üzerinden çağrılır ki efektler her render'da yeniden kurulmasın.
  const flushRef = useRef(() => {});
  useEffect(() => {
    bpmRef.current = currentBpm;
    bilgiRef.current = bilgi;
    flushRef.current = () => {
      if (pendingRef.current > 0) {
        addPracticeTime(progressKey, pendingRef.current, bpmRef.current, target);
        pendingRef.current = 0;
        setPending(0);
      }
      // Defter: aynı anda, aynı sayaçtan (çalarken geçen kısmı); duraklayınca 0 sn ile son konum yazılır
      if (defterBekleyen.current > 0 || caldiRef.current) defterYaz();
    };
  });

  useEffect(() => {
    if (!running) {
      flushRef.current();
      return;
    }
    const id = window.setInterval(() => {
      pendingRef.current += 1;
      if (calarRef.current) defterBekleyen.current += 1;
      setPending(pendingRef.current);
      if (pendingRef.current >= SAVE_EVERY) flushRef.current();
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  // Sayfadan çıkarken, yenilerken ya da pencere kapanırken kalan süreyi kaydet
  useEffect(() => {
    const onHide = () => flushRef.current();
    window.addEventListener("pagehide", onHide);
    return () => {
      window.removeEventListener("pagehide", onHide);
      flushRef.current();
    };
  }, []);

  /** Özel çalışma ekranı (Quick Study, transkripsiyon, kompozisyon) yoksa düz tab oynatıcı: kısım ve "devam et" onda */
  const ozelEkran = (kind === "quickstudy" && !!tex && !!chords?.length && !!readBars && !!improvBars) || (kind === "transkripsiyon" && !!tex) || (kind === "kompozisyon" && !!tex && !!chords?.length);
  const duzOynatici = !!source && !ozelEkran;

  const practiced = (saved?.totalSeconds ?? 0) + pending;
  const shown = Math.min(practiced, target);
  const completed = saved?.completed || practiced >= target;

  return (
    <div className="space-y-4">
      {/* Başlık ve sayaç tek satırda: oynatıcı ekranın üstüne yakın başlasın */}
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
        <div className="min-w-0 flex-1">{baslik}</div>
        <div className={`flex w-full max-w-[23rem] shrink-0 items-center gap-3 rounded-full border bg-[var(--panel)] py-1.5 pl-1.5 pr-4 ${completed ? "border-ok/40" : "border-ink/[0.06]"}`} role="group" aria-label="Çalışma sayacı">
          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            className="btn-secondary h-8 w-8 shrink-0 !px-0"
            title={source ? "Sayaç, tab çalarken kendiliğinden çalışır. Tıkla: elle başlat / durdur" : "Sayacı başlat / durdur"}
            aria-label={running ? "Sayacı durdur" : "Sayacı başlat"}
            aria-pressed={running}
          >
            {running ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2 text-xs tabular-nums">
              <span className="font-semibold">
                {formatClock(shown)} / {formatClock(target)} dk
              </span>
              <span className="truncate text-muted">Toplam {formatClock(practiced)}</span>
            </div>
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-ink/10" aria-hidden>
              <div className={`h-full rounded-full transition-all ${completed ? "bg-ok" : "bar-fill"}`} style={{ width: `${(shown / target) * 100}%` }} />
            </div>
          </div>
          {completed && (
            <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-ok" title="Ders tamamlandı">
              <CheckCircle2 size={16} aria-hidden /> Tamam
            </span>
          )}
        </div>
      </div>

      {bilgi && (
        <DefterSeridi
          bilgi={bilgi}
          kisimlar={parts?.map((p) => p.name)}
          canliKisim={canliKisim}
          onKisimSec={duzOynatici && parts?.length ? kisimSec : undefined}
          onDevam={duzOynatici ? devamEt : undefined}
        />
      )}

      {children}

      {kind === "quickstudy" && tex && chords?.length && readBars && improvBars ? (
        <QuickStudy tex={tex} chords={chords} readBars={readBars} improvBars={improvBars} onPlayingChange={calmaDegisti} />
      ) : kind === "transkripsiyon" && tex ? (
        <Transkripsiyon tex={tex} onPlayingChange={calmaDegisti} />
      ) : kind === "kompozisyon" && tex && chords?.length ? (
        <Kompozisyon tex={tex} chords={chords} bpm={bpm} title={title ?? "Kompozisyon"} progressKey={progressKey} onPlayingChange={calmaDegisti} />
      ) : source ? (
        <TabPlayer source={source} compact stave={stave} parts={parts} guitarProgram={guitarProgram} onBpmChange={setCurrentBpm} onPlayingChange={calmaDegisti} onDurum={onDurum} devam={devam} />
      ) : reading ? null : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-3xl border border-dashed border-line p-6 text-sm text-muted">
            Bu dersin tabı henüz eklenmedi. Metronomla çalışıp sayacı elle başlatabilirsin.
          </div>
          <Metronome />
        </div>
      )}
    </div>
  );
}
