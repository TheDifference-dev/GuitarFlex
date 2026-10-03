"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Pause, Play } from "lucide-react";
import TabPlayer, { type TabSource } from "./TabPlayer";
import Metronome from "./Metronome";
import { formatClock } from "./CourseView";
import { addPracticeTime, useProgress } from "@/lib/progress";

type Props = {
  progressKey: string;
  bpm: number;
  minutes: number;
  tex?: string;
  /** Tarayıcıdan erişilebilir tab dosyası adresi */
  tabUrl?: string;
  /** Tabsız okuma adımı: metin sayfada gösterilir, burada sadece sayaç kalır */
  reading?: boolean;
};

const SAVE_EVERY = 5;

/** Ders ekranı: tab oynatıcı + hedef süre sayacı. Çalma süresi otomatik kaydedilir. */
export default function LessonPractice({ progressKey, bpm, minutes, tex, tabUrl, reading }: Props) {
  const progress = useProgress();
  const saved = progress.exercises[progressKey];
  const target = minutes * 60;

  const [running, setRunning] = useState(false);
  const [pending, setPending] = useState(0);
  const [currentBpm, setCurrentBpm] = useState(bpm);
  const [texFromFile, setTexFromFile] = useState<string | null>(null);
  const pendingRef = useRef(0);
  const bpmRef = useRef(bpm);

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
    flushRef.current = () => {
      if (pendingRef.current > 0) {
        addPracticeTime(progressKey, pendingRef.current, bpmRef.current, target);
        pendingRef.current = 0;
        setPending(0);
      }
    };
  });

  useEffect(() => {
    if (!running) {
      flushRef.current();
      return;
    }
    const id = window.setInterval(() => {
      pendingRef.current += 1;
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

  const practiced = (saved?.totalSeconds ?? 0) + pending;
  const shown = Math.min(practiced, target);
  const completed = saved?.completed || practiced >= target;

  return (
    <div className="space-y-4">
      <div className={`flex flex-wrap items-center gap-4 rounded-2xl border bg-panel p-4 ${completed ? "border-green-500/60" : "border-line"}`}>
        <button
          type="button"
          onClick={() => setRunning((r) => !r)}
          className="flex items-center gap-2 rounded-xl border border-line bg-bg px-3 py-2 text-sm font-bold"
          title={source ? "Sayaç, tab çalarken kendiliğinden çalışır" : "Sayacı başlat / durdur"}
        >
          {running ? <Pause size={16} /> : <Play size={16} />} {running ? "Sayacı durdur" : "Sayacı başlat"}
        </button>
        <div className="min-w-48 flex-1">
          <div className="flex justify-between text-sm font-bold tabular-nums">
            <span>
              {formatClock(shown)} / {formatClock(target)} dk
            </span>
            <span className="text-muted">Toplam çalışma: {formatClock(practiced)}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-line">
            <div className={`h-full transition-all ${completed ? "bg-green-500" : "bg-accent"}`} style={{ width: `${(shown / target) * 100}%` }} />
          </div>
        </div>
        {completed && (
          <span className="flex items-center gap-1.5 text-sm font-bold text-green-400">
            <CheckCircle2 size={18} /> Tamamlandı
          </span>
        )}
      </div>

      {source ? (
        <TabPlayer source={source} compact onBpmChange={setCurrentBpm} onPlayingChange={setRunning} />
      ) : reading ? null : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-2xl border border-dashed border-line p-6 text-sm text-muted">
            Bu dersin tabı henüz eklenmedi. Metronomla çalışıp sayacı elle başlatabilirsin.
          </div>
          <Metronome />
        </div>
      )}
    </div>
  );
}
