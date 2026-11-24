"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Check, ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import TabPlayer, { type DevamKomutu, type TabSource } from "@/components/TabPlayer";
import { formatClock } from "@/components/CourseView";
import { RUTIN_KURSU, gununRutini, type GunKodu, type RutinBlok, type TeknikId } from "@/content/rutin";
import { lessonKey } from "@/content/courses";
import { addPracticeTime, today, useProgress } from "@/lib/progress";
import { useDefter } from "@/lib/defter";
import { gorevler, gunler, kurallar, type GorevKurali } from "@/lib/oyun";
import { gununTeknikleri, teknikSec, useTeknikSecimi } from "@/lib/gunun-teknikleri";

export type RutinBlokVerisi = RutinBlok & { baslik: string; aciklama: string; tex: string; hedefDk: number; href: string; guitarProgram?: number };
export type RutinVerisi = {
  rutinler: { gun: GunKodu; ad: string; aciklama: string; dakika: number; teknikler: TeknikId[]; bloklar: RutinBlokVerisi[] }[];
  /** Görünen kursu olan teknikler (seçim listesi) */
  teknikler: { id: TeknikId; ad: string; href: string }[];
  /** İçerik paketindeki görev kuralları (yoksa varsayılanlar) */
  kural: GorevKurali | null;
};

const VARSAYILAN_KURAL: GorevKurali = { egzersizDk: 30, kalkanGun: 7, kalkanMaks: 10, oyMaks: 10 };
const KAYIT_ARALIGI = 5;
const hic = () => () => {};

/** Yerel bugün (sunucuda null): rutin sırası tarayıcının saatine göre */
function useBugun(): string | null {
  return useSyncExternalStore(hic, today, () => null);
}

export default function RutinSayfasi({ veri, gunParam }: { veri: RutinVerisi; gunParam: GunKodu | null }) {
  const bugun = useBugun();
  const bugununGunu = bugun ? gununRutini(bugun).gun : null;
  const [secilen, setSecilen] = useState<GunKodu | null>(gunParam);
  const gun = secilen ?? bugununGunu ?? "A";
  const r = veri.rutinler.find((x) => x.gun === gun)!;

  return (
    <div className="space-y-8">
      <div className="card flex flex-wrap items-center gap-3 p-3 sm:p-4" role="tablist" aria-label="Rutin">
        {veri.rutinler.map((x) => (
          <button
            key={x.gun}
            type="button"
            role="tab"
            aria-selected={x.gun === gun}
            onClick={() => setSecilen(x.gun)}
            data-rutin-gun={x.gun}
            className={`flex min-w-[11rem] flex-1 items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${x.gun === gun ? "border-accent bg-accent text-accent-ink" : "border-ink/10 bg-ink/[0.04] hover:bg-ink/[0.08]"}`}
          >
            <span className="font-[family-name:var(--font-display)] text-3xl font-semibold leading-none">{x.gun}</span>
            <span className="min-w-0">
              <span className="block font-semibold leading-tight">{x.ad}</span>
              <span className={`block text-xs ${x.gun === gun ? "opacity-85" : "text-muted"}`}>
                {x.bloklar.length} blok · {formatDk(x.dakika)}
                {x.gun === bugununGunu ? " · bugün" : ""}
              </span>
            </span>
          </button>
        ))}
      </div>

      {/* Rutin değişince oynatıcı ve sayaç sıfırlanır */}
      <RutinOynatici key={r.gun} rutin={r} bugunMu={r.gun === bugununGunu} />

      <GununPlani rutin={r} veri={veri} bugun={bugun} />
    </div>
  );
}

const formatDk = (dk: number) => `${String(dk).replace(".", ",")} dk`;

function RutinOynatici({ rutin, bugunMu }: { rutin: RutinVerisi["rutinler"][number]; bugunMu: boolean }) {
  const [idx, setIdx] = useState(0);
  const [kalan, setKalan] = useState(() => Math.round(rutin.bloklar[0].dakika * 60));
  const kalanRef = useRef(Math.round(rutin.bloklar[0].dakika * 60));
  const [acik, setAcik] = useState(false);
  const [caliyor, setCaliyor] = useState(false);
  const [bitti, setBitti] = useState(false);
  const [devam, setDevam] = useState<DevamKomutu | undefined>(undefined);
  const blok = rutin.bloklar[idx];
  const kaynak = useMemo<TabSource>(() => ({ kind: "tex", tex: blok.tex }), [blok.tex]);

  // Çalma süresi bloğun dersine yazılır (Kromatik Isınma; günlük "Isınma" görevi bu süreyi sayar)
  const bekleyen = useRef(0);
  const bpmRef = useRef(blok.bpm);
  const blokRef = useRef(blok);
  useEffect(() => {
    blokRef.current = blok;
  }, [blok]);
  const yaz = useCallback(() => {
    if (bekleyen.current <= 0) return;
    const b = blokRef.current;
    addPracticeTime(lessonKey(RUTIN_KURSU, b.ders), bekleyen.current, bpmRef.current, b.hedefDk * 60);
    bekleyen.current = 0;
  }, []);

  const git = useCallback(
    (i: number, cal: boolean) => {
      yaz();
      const j = Math.max(0, Math.min(rutin.bloklar.length - 1, i));
      setIdx(j);
      kalanRef.current = Math.round(rutin.bloklar[j].dakika * 60);
      setKalan(kalanRef.current);
      setBitti(false);
      setCaliyor(false);
      setDevam((x) => ({ n: (x?.n ?? 0) + 1, oynat: cal ? "cal" : undefined }));
    },
    [rutin.bloklar, yaz],
  );

  // Zamanlayıcı: rutin açıkken ve tab çalarken geri sayar; süre dolunca sıradaki blok açılır ve çalmaya başlar
  const sayac = useRef({ acik, caliyor, idx });
  useEffect(() => {
    sayac.current = { acik, caliyor, idx };
  });
  useEffect(() => {
    const id = window.setInterval(() => {
      const { acik: a, caliyor: c, idx: i } = sayac.current;
      if (c) {
        bekleyen.current += 1;
        if (bekleyen.current >= KAYIT_ARALIGI) yaz();
      }
      if (!a || !c || kalanRef.current <= 0) return;
      kalanRef.current -= 1;
      setKalan(kalanRef.current);
      if (kalanRef.current > 0) return;
      // Süre doldu: sıradaki blok açılır ve çalmaya başlar; son bloktan sonra rutin biter
      if (i + 1 < rutin.bloklar.length) git(i + 1, true);
      else {
        yaz();
        setAcik(false);
        setBitti(true);
        setDevam((x) => ({ n: (x?.n ?? 0) + 1, oynat: "dur" }));
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [git, rutin.bloklar.length, yaz]);
  useEffect(() => {
    const onHide = () => yaz();
    window.addEventListener("pagehide", onHide);
    return () => {
      window.removeEventListener("pagehide", onHide);
      yaz();
    };
  }, [yaz]);

  const baslatDurdur = () => {
    if (acik) {
      setAcik(false);
      setDevam((x) => ({ n: (x?.n ?? 0) + 1, oynat: "dur" }));
      return;
    }
    if (bitti) git(0, true);
    else setDevam((x) => ({ n: (x?.n ?? 0) + 1, oynat: "cal" }));
    setAcik(true);
  };

  const toplam = Math.round(blok.dakika * 60);
  const gecenToplam = rutin.bloklar.slice(0, idx).reduce((n, b) => n + b.dakika * 60, 0) + (toplam - kalan);
  const rutinToplam = rutin.dakika * 60;

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]" aria-label="Rutin oynatıcı" data-rutin-oynatici>
      <div className="min-w-0 space-y-4">
        <div className="card flex flex-wrap items-center gap-x-6 gap-y-3 p-4 sm:p-5">
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-muted">
              Rutin {rutin.gun}
              {bugunMu ? " · bugün sırada" : ""} · Blok {idx + 1}/{rutin.bloklar.length} · {blok.tur}
            </p>
            <h2 className="mt-0.5 text-[clamp(1.25rem,1.05rem+0.6vw,1.6rem)] font-semibold leading-tight">{blok.baslik}</h2>
            <p className="mt-1 text-sm text-muted">{blok.odak}</p>
            <p className="mt-1 text-xs text-muted">
              Metronom: {blok.bpm} BPM ile başla, öneri {blok.bpmAralik[0]}–{blok.bpmAralik[1]} BPM ·{" "}
              <Link href={blok.href} className="underline underline-offset-2 hover:text-accent">
                Dersi aç
              </Link>
            </p>
          </div>
          <div className="flex w-full max-w-[20rem] shrink-0 flex-col gap-2" role="group" aria-label="Rutin zamanlayıcı">
            <div className="flex items-baseline justify-between text-sm tabular-nums">
              <span className="text-2xl font-semibold" data-blok-kalan>
                {formatClock(kalan)}
              </span>
              <span className="text-muted">
                Rutin {formatClock(Math.round(gecenToplam))} / {formatClock(rutinToplam)}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-ink/10" aria-hidden>
              <div className="bar-fill h-full rounded-full transition-all" style={{ width: `${((toplam - kalan) / toplam) * 100}%` }} />
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => git(idx - 1, acik)} disabled={idx === 0} className="btn-secondary h-9 w-9 !px-0" aria-label="Önceki blok" title="Önceki blok">
                <ChevronLeft size={16} />
              </button>
              <button type="button" onClick={baslatDurdur} className="btn-primary h-9 flex-1 px-4 text-sm" data-rutin-baslat aria-pressed={acik}>
                {acik ? <Pause size={15} /> : <Play size={15} />} {acik ? "Rutini duraklat" : bitti ? "Rutini yeniden çal" : "Rutini başlat"}
              </button>
              <button type="button" onClick={() => git(idx + 1, acik)} disabled={idx === rutin.bloklar.length - 1} className="btn-secondary h-9 w-9 !px-0" aria-label="Sonraki blok" title="Sonraki blok">
                <ChevronRight size={16} />
              </button>
              <button type="button" onClick={() => git(idx, false)} className="btn-secondary h-9 w-9 !px-0" aria-label="Bloğu baştan al" title="Bloğu baştan al">
                <RotateCcw size={15} />
              </button>
            </div>
            <p className="text-[11px] leading-snug text-muted">Zamanlayıcı tab çalarken işler; süre dolunca sıradaki blok açılır ve çalmaya başlar.</p>
          </div>
        </div>
        {bitti && (
          <p className="card border-ok/40 p-4 text-sm font-semibold text-ok" role="status">
            <Check size={16} className="mr-1 inline" aria-hidden /> Rutin {rutin.gun} bitti. Sıradaki: 20 dakika — günün üç tekniğinden en az ikisi, sonra bir şarkı.
          </p>
        )}
        <TabPlayer
          source={kaynak}
          compact
          guitarProgram={blok.guitarProgram}
          devam={devam}
          onBpmChange={(b) => (bpmRef.current = b)}
          onPlayingChange={setCaliyor}
        />
      </div>

      <ol className="card h-fit space-y-1 p-3" aria-label="Bloklar">
        {rutin.bloklar.map((b, i) => (
          <li key={b.ders}>
            <button
              type="button"
              onClick={() => git(i, acik)}
              aria-current={i === idx ? "step" : undefined}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition ${i === idx ? "bg-accent text-accent-ink" : "hover:bg-ink/[0.06]"}`}
            >
              <span className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${i === idx ? "bg-black/20" : i < idx ? "bg-ok text-ok-ink" : "bg-ink/10"}`}>
                {i < idx ? <Check size={12} strokeWidth={3} /> : i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{b.tur}</span>
                <span className={`block truncate text-xs ${i === idx ? "opacity-85" : "text-muted"}`}>{b.baslik}</span>
              </span>
              <span className={`shrink-0 text-right text-xs tabular-nums ${i === idx ? "opacity-85" : "text-muted"}`}>
                {formatDk(b.dakika)}
                <span className="block">{b.bpm} BPM</span>
              </span>
            </button>
          </li>
        ))}
        <li className="px-3 pt-2 text-xs text-muted">
          Toplam {formatDk(rutin.dakika)} · {rutin.aciklama}
        </li>
      </ol>
    </section>
  );
}

/** Günün planı: ısınma (bu rutin) → 20 dk teknik (üç teknikten en az ikisi) → kalan sürede bir şarkı; teknik seçimi */
function GununPlani({ rutin, veri, bugun }: { rutin: RutinVerisi["rutinler"][number]; veri: RutinVerisi; bugun: string | null }) {
  const p = useProgress();
  const defter = useDefter();
  const secim = useTeknikSecimi();
  const kural = veri.kural ?? VARSAYILAN_KURAL;
  const k = kurallar(kural);
  const tarih = bugun ?? "1970-01-01";
  const teknikler = gununTeknikleri(secim, tarih);
  const gv = gorevler(gunler(p, defter).get(tarih), kural, teknikler);
  const [duzenle, setDuzenle] = useState(false);
  const [taslak, setTaslak] = useState<TeknikId[]>([]);
  const sec = (id: TeknikId) => setTaslak((t) => (t.includes(id) ? t.filter((x) => x !== id) : t.length < 3 ? [...t, id] : t));
  const ad = (id: TeknikId) => veri.teknikler.find((t) => t.id === id)?.ad ?? id;

  return (
    <section id="gunun-teknikleri" className="scroll-mt-24 space-y-4" aria-label="Günün planı">
      <h2 className="baslik-orta">Günün planı</h2>
      <ol className="grid gap-3 md:grid-cols-3">
        {gv.map((g, i) => (
          <li key={g.ad} className={`card p-5 ${g.tamam ? "border-ok/40" : ""}`} data-gorev={i}>
            <p className="flex items-center justify-between text-[13px] font-semibold text-muted">
              <span>{["1 · Isınma", "2 · Teknik", "3 · Şarkı"][i]}</span>
              {g.tamam ? <Check size={16} className="text-ok" aria-label="tamam" /> : <span>{i === 0 ? `${k.isinmaDk}–15 dk` : i === 1 ? `${k.calismaDk} dk içinde` : "kalan süre"}</span>}
            </p>
            <p className="mt-1 text-lg font-semibold">
              {i === 0 ? `Rutin ${rutin.gun}: ${rutin.ad}` : i === 1 ? `${teknikler.length} teknikten en az ${k.teknikHedef}` : `${k.sarkiHedef} şarkı`}
            </p>
            <p className="mt-1 text-sm tabular-nums text-muted">
              {Math.min(g.deger, g.hedef)} / {g.hedef} {i === 0 ? "dk" : i === 1 ? "teknik" : "şarkı"} {i === 1 ? `(her biri ≥ ${k.teknikDk} dk)` : i === 2 ? `(≥ ${k.sarkiDk} dk)` : ""}
            </p>
            {g.alt && (
              <ul className="mt-2 space-y-1 text-sm">
                {g.alt.map((a) => (
                  <li key={a.ad} className="flex items-center justify-between gap-2">
                    <Link href={a.href} className={`hover:text-accent ${a.tamam ? "font-semibold text-ok" : ""}`}>
                      {a.ad}
                    </Link>
                    <span className="tabular-nums text-muted">
                      {Math.min(a.dk, a.hedefDk)}/{a.hedefDk} dk
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {i === 2 && (
              <p className="mt-2 text-sm">
                <Link href="/sarki-kutuphanesi/rehber" className="metin-bag">
                  Rehber Şarkılar
                </Link>{" "}
                ·{" "}
                <Link href="/sarki-kutuphanesi" className="metin-bag">
                  Şarkı Kütüphanesi
                </Link>
              </p>
            )}
          </li>
        ))}
      </ol>

      <div className="card p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-semibold">Günün üç tekniği</h3>
          {!duzenle ? (
            <button
              type="button"
              className="text-sm font-semibold text-accent hover:underline"
              onClick={() => {
                setTaslak(teknikler);
                setDuzenle(true);
              }}
              disabled={!bugun}
            >
              Değiştir
            </button>
          ) : null}
        </div>
        {!duzenle ? (
          <p className="mt-1 text-sm text-muted">
            {teknikler.map(ad).join(" · ")}
            {bugun && secim[bugun] ? " (senin seçimin)" : ` (Rutin ${gununRutini(tarih).gun}'nin önerisi)`}
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Teknik seç (üç tane)">
              {veri.teknikler.map((t) => {
                const on = taslak.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => sec(t.id)}
                    className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${on ? "border-accent bg-accent text-accent-ink" : "border-ink/10 bg-ink/[0.05] hover:bg-ink/10"}`}
                  >
                    {t.ad}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <button
                type="button"
                className="btn-primary px-4 py-2 text-sm"
                disabled={taslak.length !== 3 || !bugun}
                onClick={() => {
                  if (bugun) teknikSec(bugun, taslak);
                  setDuzenle(false);
                }}
              >
                Kaydet ({taslak.length}/3)
              </button>
              <button
                type="button"
                className="btn-secondary px-4 py-2 text-sm"
                onClick={() => {
                  if (bugun) teknikSec(bugun, null);
                  setDuzenle(false);
                }}
              >
                Rutinin önerisine dön
              </button>
              <button type="button" className="text-muted hover:text-text" onClick={() => setDuzenle(false)}>
                Vazgeç
              </button>
            </div>
          </div>
        )}
        <p className="mt-3 text-xs text-muted">
          Teknik süresi o tekniğin kursundaki derslerde (tab çalarken) ölçülür; ısınma süresi Kromatik Isınma derslerinde ve bu sayfada. Şarkı: Şarkı Kütüphanesi, kendi dosyaların ya da Çalışma Defteri&apos;ne yazdığın Songsterr süresi.
        </p>
      </div>
    </section>
  );
}
