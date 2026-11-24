"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { BookText, Check, ChevronDown, FileText, ListTree, ListVideo, PlayCircle, Sparkles } from "lucide-react";
import type { Course, Lesson, Section } from "@/content/types";
import { lessonKey } from "@/content/courses";
import { chapterLevels, isAcoustic } from "@/content/seviyeler";
import SeviyeRozeti from "./SeviyeRozeti";
import Cekmece from "./site/Cekmece";
import Kirinti from "./site/Kirinti";
import { Bant, Eylemler, HapBag } from "./site/Vitrin";
import KursSecici, { type SeciciKurs } from "./site/KursSecici";
import UygulamaSimgesi from "./site/UygulamaSimgesi";
import { DERS_TURU_ADI, dersSimgesi, dersTuru, kursSimgesi } from "@/lib/simge";
import { AILE_ADI, AILE_ADRESI, type KursAilesi } from "@/lib/katalog";
import { useProgress, type Progress, type StepProgress } from "@/lib/progress";
import { dersKaydi } from "@/lib/defter";
import EylemDugmeleri from "./defter/Eylemler";
import { bolumeKaydir, useBolumIzleyici } from "./site/BolumGezgini";

export function formatClock(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** Ders tamamlandı mı: pratik kartında adım geçilmiş olmalı, diğerlerinde çalışma süresi dolmuş */
const lessonDone = (p: Progress, course: Course, l: Lesson) =>
  l.practice ? Boolean(p.steps[`${l.practice.yol}/${l.practice.kod}`]?.passed) : Boolean(p.exercises[lessonKey(course.slug, l.id)]?.completed);

function sectionDone(p: Progress, course: Course, s: Section) {
  const lessons = s.chapters.flatMap((c) => c.lessons);
  return lessons.length > 0 && lessons.every((l) => lessonDone(p, course, l));
}

/** Sınav alt bölümü: bütün dersleri sınav (kind "sinav"); kenar listesinde alt bölüm olarak değil, sınav satırında gösterilir */
const sinavBolumu = (c: Section["chapters"][number]) => c.lessons.length > 0 && c.lessons.every((l) => l.kind === "sinav");

/** Bölüm sonundaki sınav satırı: sınavın adı ve kademelerin BPM eşikleri (Altın I · Platin I · Elmas I · Usta).
 *  Bölümde sınav dersi varsa satır o derse gider. */
function ExamRow({ section: s, href, done, onClick }: { section: Section; href?: string; done?: boolean; onClick?: () => void }) {
  const tiers = s.examTiers ?? [];
  const govde = (
    <>
      <span className={`flex items-center gap-1.5 font-semibold ${done ? "text-ok" : "text-accent"}`}>
        {done ? <Check size={12} className="shrink-0" /> : <Sparkles size={12} className="shrink-0" />} {s.examName ?? "Sınav"}
      </span>
      {!!tiers.length && (
        <span className="mt-1 flex flex-wrap gap-1">
          {tiers.map((bpm, i) => (
            <span key={i} className="rounded-full bg-ink/[0.06] px-2 py-0.5 font-medium tabular-nums text-muted">
              {s.examTierNames?.[i] ? `${s.examTierNames[i]} ` : ""}
              <span className="text-text">{bpm}</span>
            </span>
          ))}
        </span>
      )}
    </>
  );
  const sinif = "mt-1.5 block rounded-xl bg-ink/[0.04] px-2.5 py-2 text-xs";
  return href ? (
    <Link href={href} onClick={onClick} className={`${sinif} transition hover:bg-ink/[0.08]`} title="Sınava git: kademeni ve BPM'i seç">
      {govde}
    </Link>
  ) : (
    <div className={sinif} title="Sınava girmek istediğin kademeyi ve BPM'i seç">
      {govde}
    </div>
  );
}

export default function CourseView({ course, kurslar = [], aile }: { course: Course; kurslar?: SeciciKurs[]; aile: KursAilesi }) {
  const p = useProgress();
  const [tab, setTab] = useState<"egzersiz" | "rehber">("egzersiz");
  const [cekmece, setCekmece] = useState(false);
  const kapatCekmece = useCallback(() => setCekmece(false), []);
  const badges = !isAcoustic(course);
  // Kurs sayfası her zaman BÜTÜN bölümleri gösterir; kenar çubuğu filtre değil, içindekiler: tıklayınca o bölüme
  // yumuşak kayar, görünen bölüm vurgulanır (scrollspy). Bağlantıyla gelinen "#bolum-<kod>" açılışta oraya kayar.
  const bolumIdleri = course.sections.map((s) => `bolum-s${s.number}`);
  const altIdleri = course.sections.flatMap((s) => s.chapters.map((c) => `bolum-${c.code}`));
  const gorunen = useBolumIzleyici(tab === "egzersiz" ? bolumIdleri : []);
  const gorunenAlt = useBolumIzleyici(tab === "egzersiz" ? altIdleri : []);
  const current = course.sections[Math.max(0, bolumIdleri.indexOf(gorunen ?? ""))] ?? course.sections[0];

  // Kurs ilerlemesi ve sıradaki ders (GuitarBear: "İLERLEME x/N", "MEVCUT BÖLÜM: x.y")
  const hepsi = course.sections.flatMap((s) => s.chapters.flatMap((c) => c.lessons.map((l) => ({ l, s, c }))));
  const tamam = hepsi.filter((x) => lessonDone(p, course, x.l)).length;
  const siradaki = hepsi.find((x) => !lessonDone(p, course, x.l));
  const yuzde = hepsi.length ? Math.round((tamam / hepsi.length) * 100) : 0;
  const dersHref = (l: Lesson) => (l.practice ? `/teori/yol/${l.practice.yol}/${encodeURIComponent(l.practice.kod)}` : `/calis/${course.slug}/${encodeURIComponent(l.id)}`);

  // Bağlantıyla gelinen bölüm (#bolum-1.2, Seviye Yolu'ndan): sayfa açılınca oraya (anında) kayar
  useEffect(() => {
    const git = () => {
      const h = decodeURIComponent(window.location.hash.slice(1));
      if (h.startsWith("bolum-") && document.getElementById(h)) {
        setTab("egzersiz");
        requestAnimationFrame(() => bolumeKaydir(h, { aninda: true, adres: false }));
      }
    };
    git();
    window.addEventListener("hashchange", git);
    return () => window.removeEventListener("hashchange", git);
  }, []);
  /** Kenar çubuğundan bölüme git: rehberdeysek egzersize döner, sonra yumuşak kayar */
  const git = (id: string, mobil: boolean) => {
    if (mobil) setCekmece(false);
    if (tab !== "egzersiz") {
      setTab("egzersiz");
      requestAnimationFrame(() => requestAnimationFrame(() => bolumeKaydir(id)));
    } else requestAnimationFrame(() => bolumeKaydir(id));
  };

  /** Sol panel (masaüstü) ve mobil çekmecedeki içerik: Egzersiz/Rehber, eğitim videoları, bölümler ve alt bölümler */
  const panel = (mobil: boolean) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-1 rounded-full border border-ink/[0.08] bg-ink/[0.05] p-1">
        {(
          [
            ["egzersiz", "Egzersiz", FileText],
            ["rehber", "Rehber", BookText],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setTab(id);
              if (mobil) setCekmece(false);
            }}
            className={`flex items-center justify-center gap-1.5 rounded-full py-2 text-sm font-semibold transition ${tab === id ? "bg-seg text-text shadow-[var(--shadow-seg)]" : "text-muted hover:text-text"}`}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {!!course.videos?.length && (
        <div>
          <p className="mb-2 flex items-center gap-2 px-1 text-xs font-semibold text-muted">
            <ListVideo size={14} /> Eğitim Videoları
          </p>
          {course.videos.map((v, i) => (
            <a key={v.title} href={v.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-lg px-1 py-2 text-sm hover:bg-bg">
              <span className="w-4 text-center text-xs text-muted">{i + 1}</span>
              <span className="flex h-10 w-16 shrink-0 items-center justify-center rounded-md bg-bg">
                <PlayCircle size={18} className="text-accent" />
              </span>
              <span className="leading-tight">
                <span className="block font-semibold">{v.title}</span>
                {v.channel && <span className="text-xs text-muted">{v.channel}</span>}
              </span>
            </a>
          ))}
        </div>
      )}

      <div>
        <p className="mb-2 flex items-center gap-2 px-1 text-xs font-semibold text-muted">
          <FileText size={14} /> Bölümler
        </p>
        <div className="space-y-2">
          {course.sections.map((s, si) => {
            const active = tab === "egzersiz" && s === current;
            const bitti = sectionDone(p, course, s);
            const dersler = s.chapters.flatMap((c) => c.lessons);
            const dk = Math.round(dersler.reduce((n, l) => n + (l.practice ? 0 : l.minutes), 0));
            return (
              <div key={s.number} className={active ? "rounded-2xl bg-ink/[0.05]" : ""}>
                <button
                  type="button"
                  onClick={() => git(bolumIdleri[si], mobil)}
                  aria-current={active ? "location" : undefined}
                  data-bolum-dugmesi={s.number}
                  className={`flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-sm font-semibold ${active ? "text-accent" : ""}`}
                >
                  <span
                    className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] ${bitti ? "bg-ok text-ok-ink" : active ? "bg-primary text-primary-ink" : "bg-ink/10 text-text"}`}
                  >
                    {bitti ? <Check size={12} /> : s.number}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate">
                      Bölüm {s.number} – {s.title}
                    </span>
                    <span className="block truncate text-[11px] font-medium text-muted">
                      {s.level ? `${s.level} · ` : ""}
                      {dersler.length} ders{dk > 0 ? ` · Toplam: ${dk}dk` : ""}
                    </span>
                  </span>
                </button>
                <div className="space-y-0.5 pb-2 pl-3 pr-2">
                  {s.chapters.filter((c) => !sinavBolumu(c)).map((c) => {
                    const done = c.lessons.every((l) => lessonDone(p, course, l));
                    const altAktif = tab === "egzersiz" && gorunenAlt === `bolum-${c.code}`;
                    return (
                      <a
                        key={c.code}
                        href={`#bolum-${c.code}`}
                        onClick={(e) => {
                          e.preventDefault();
                          git(`bolum-${c.code}`, mobil);
                        }}
                        aria-current={altAktif ? "location" : undefined}
                        data-kaydirma="kendi"
                        className={`flex items-center gap-2 rounded-lg px-2 py-1 text-xs transition ${done ? "text-ok" : "text-text/90"} ${altAktif ? "bg-ink/[0.08] font-semibold" : ""} hover:bg-ink/[0.06]`}
                      >
                        <span className="w-7 shrink-0 font-semibold">{c.code}</span>
                        <span className="flex-1 truncate">{c.title}</span>
                        <span className="shrink-0 text-muted">{c.lessons.length} ders</span>
                      </a>
                    );
                  })}
                  {(s.exam || !!s.examTiers?.length) &&
                    (() => {
                      const sinav = s.chapters.find(sinavBolumu)?.lessons[0];
                      return (
                        <ExamRow
                          section={s}
                          href={sinav ? dersHref(sinav) : undefined}
                          done={sinav ? lessonDone(p, course, sinav) : undefined}
                          onClick={mobil ? () => setCekmece(false) : undefined}
                        />
                      );
                    })()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const bolumMeta = (s: Section) => {
    const dersler = s.chapters.flatMap((c) => c.lessons);
    const bitenler = dersler.filter((l) => lessonDone(p, course, l)).length;
    return `${bitenler}/${dersler.length} ders`;
  };

  return (
    <div>
      {/* Kurs başı: kırıntı, ortalı büyük başlık (kurs seçici), ilerleme ve sıradaki ders */}
      <Bant ton="beyaz" bas className="pb-12 pt-10">
        <Kirinti halkalar={[{ href: AILE_ADRESI[aile], label: AILE_ADI[aile] }, { label: course.cardTitle ?? course.title }]} className="mb-8 justify-center" />
        <div className="mx-auto max-w-[980px] text-center">
          <UygulamaSimgesi simge={kursSimgesi(course.slug)} boyut={96} className="mb-6" />
          <p className="text-[17px] font-semibold text-muted sm:text-[19px]">{AILE_ADI[aile]}</p>
          <div className="mt-2 flex justify-center">
            {kurslar.length > 1 ? <KursSecici baslik={course.title} slug={course.slug} kurslar={kurslar} /> : <h1 className="baslik-buyuk text-balance">{course.title}</h1>}
          </div>
          {course.description && <p className="alt-baslik mx-auto mt-4 max-w-[760px] text-pretty text-muted">{course.description}</p>}
          <Eylemler>
            {siradaki ? (
              <HapBag href={dersHref(siradaki.l)} title={siradaki.l.title} className="max-w-full">
                <span className="shrink-0">{tamam ? "Devam Edin" : "Başlayın"}:</span>
                <span className="min-w-0 truncate sm:max-w-[18rem]">{siradaki.l.title}</span>
              </HapBag>
            ) : (
              <span className="flex items-center gap-1.5 rounded-full bg-ok/15 px-4 py-2.5 font-semibold text-ok">
                <Check size={16} /> Kurs tamamlandı
              </span>
            )}
            <button type="button" onClick={() => setTab("rehber")} className="metin-bag text-[19px] sm:text-[21px]">
              Rehberi oku <span aria-hidden>›</span>
            </button>
          </Eylemler>
          <div className="mx-auto mt-8 max-w-sm">
            <div className="h-1 overflow-hidden rounded-full bg-ink/10" role="progressbar" aria-valuenow={yuzde} aria-valuemin={0} aria-valuemax={100} aria-label="Kurs ilerlemesi">
              <div className="bar-fill h-full rounded-full" style={{ width: `${yuzde}%` }} />
            </div>
            <p className="mt-2 text-xs tabular-nums text-muted">
              %{yuzde} · {tamam}/{hepsi.length} ders · {hepsi.length - tamam} kaldı
              {siradaki && (
                <>
                  {" "}
                  · Mevcut bölüm <span className="font-semibold text-text">{sinavBolumu(siradaki.c) ? `${siradaki.s.number}. bölüm sınavı` : siradaki.c.code}</span>
                </>
              )}
            </p>
          </div>
        </div>
      </Bant>

      <Bant ton="gri" className="pt-10">
      {/* Mobil: bölüm seçimi yapışkan çubukta, liste çekmecede */}
      <div className="sticky top-12 z-20 -mx-4 mb-6 border-y border-ink/[0.07] bg-bg/85 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6 lg:hidden">
        <button type="button" onClick={() => setCekmece(true)} className="flex w-full items-center gap-2 text-left text-sm font-semibold">
          <ListTree size={16} className="shrink-0 text-accent" />
          <span className="min-w-0 flex-1 truncate">
            {tab === "rehber" ? "Rehber" : `Bölüm ${current.number} – ${current.title}`}
          </span>
          <span className="shrink-0 text-xs font-medium text-muted">Bölümler</span>
          <ChevronDown size={16} className="shrink-0 text-muted" />
        </button>
      </div>
      <Cekmece
        acik={cekmece}
        kapat={kapatCekmece}
        baslik={
          <span className="flex items-center gap-2.5">
            <UygulamaSimgesi simge={kursSimgesi(course.slug)} boyut={32} /> {course.title}
          </span>
        }
      >
        {panel(true)}
      </Cekmece>

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      {/* Sol panel */}
      <aside className="hidden h-fit card p-3 lg:sticky lg:top-16 lg:block lg:max-h-[calc(100vh-5rem)] lg:overflow-auto">{panel(false)}</aside>

      {/* Ana alan */}
      <div className="min-w-0 space-y-8">
        {tab === "rehber" ? (
          <article className="card max-w-3xl space-y-3 p-6 leading-relaxed sm:p-8">
            {(course.guide?.length ? course.guide : [course.description]).map((para, i) =>
              para.startsWith("## ") ? (
                <h2 key={i} className="pt-2 text-xl font-semibold">
                  {para.slice(3)}
                </h2>
              ) : (
                <p key={i} className="text-muted">
                  {para}
                </p>
              ),
            )}
          </article>
        ) : (
          course.sections.map((sec) => (
          <section key={sec.number} id={`bolum-s${sec.number}`} data-bolum className="scroll-mt-28 space-y-8 lg:scroll-mt-20">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-[28px] font-semibold leading-tight tracking-tight">
                Bölüm {sec.number} – {sec.title}
              </h2>
              <span className="text-sm font-medium text-muted">
                {sec.level ? `${sec.level} · ` : ""}
                {bolumMeta(sec)}
              </span>
            </div>
          {sec.chapters.map((c) => {
            const total = Math.round(c.lessons.reduce((sum, l) => sum + l.minutes, 0) * 10) / 10;
            return (
              <section key={c.code} id={`bolum-${c.code}`} className="scroll-mt-28 space-y-4 lg:scroll-mt-20">
                <div className="flex items-center gap-3 border-b border-line/70 pb-3">
                  <span className="rounded-full bg-accent/15 px-3 py-0.5 text-xs font-semibold text-accent">{sinavBolumu(c) ? "Sınav" : c.code}</span>
                  <h2 className="flex-1 text-lg font-semibold">{c.title}</h2>
                  {badges && chapterLevels(c).map((lv) => <SeviyeRozeti key={lv} level={lv} />)}
                  <span className="text-sm font-medium text-muted">{total} dk</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {c.lessons.map((l) => {
                    const ep = p.exercises[lessonKey(course.slug, l.id)];
                    const target = l.minutes * 60;
                    const done = Math.min(ep?.totalSeconds ?? 0, target);
                    if (l.practice) return <PratikKarti key={l.id} lesson={l} sonuc={p.steps[`${l.practice.yol}/${l.practice.kod}`]} />;
                    const href = `/calis/${course.slug}/${encodeURIComponent(l.id)}`;
                    return (
                      <div
                        key={l.id}
                        className={`card group relative block overflow-hidden p-4 transition duration-300 hover:-translate-y-0.5 hover:border-ink/15 ${ep?.completed ? "border-ok/40" : siradaki?.l === l ? "border-accent/60 pt-7" : ""}`}
                      >
                        {siradaki?.l === l && (
                          <span className="absolute left-3 top-0 z-10 rounded-b-lg bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-ink">Sıradaki</span>
                        )}
                        <div className="relative">
                          <div className="flex items-start gap-3">
                            <UygulamaSimgesi simge={dersSimgesi(dersTuru(l), course.slug)} boyut={32} etiket={DERS_TURU_ADI[dersTuru(l) ?? "drill"]} />
                            <h3 className="min-w-0 flex-1 font-semibold leading-tight">
                              {/* Kartın tamamı derse gider (gerilen bağlantı); eylem düğmeleri bağlantının üstünde */}
                              <Link href={href} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none" data-ders-karti>
                                {l.title}
                              </Link>
                            </h3>
                            <span className="flex shrink-0 items-center gap-1.5">
                              {/* Alt bölümünden farklı seviyedeki ders: seviyesi kartta yazar (rozet alt bölüm başlığında) */}
                              {badges && l.level && l.level !== c.level && (
                                <span className="rounded-full border border-ink/10 bg-ink/[0.06] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-text/90" title="Dersin seviyesi">
                                  {l.level}
                                </span>
                              )}
                            </span>
                          </div>
                          {l.target && <p className="mt-2 text-xs font-medium text-muted">Hedef: <span className="text-accent">{l.target}</span></p>}
                          <p className={`${l.target ? "mt-4" : "mt-10"} text-right text-sm font-semibold tabular-nums`}>
                            {l.card ? <span className="float-left text-xs font-semibold text-accent">{KART[l.card]}</span> : null}
                            {l.tex || l.tabFile ? `${l.bpmRange ? `${l.bpmRange[0]}–${l.bpmRange[1]}` : l.bpm} BPM` : "Okuma"}
                          </p>
                          <div className="mt-3 flex items-center justify-between border-t border-line/70 pt-3 text-xs font-medium">
                            <span className="tabular-nums text-muted">
                              {formatClock(done)} / {formatClock(target)} dk
                            </span>
                            <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-accent">
                              {Number.isInteger(l.minutes) ? `Toplam: ${l.minutes}dk` : `Min. ${Math.round(l.minutes * 60)} sn`}
                            </span>
                          </div>
                          <div className="mt-2 h-1 overflow-hidden rounded-full bg-ink/10">
                            <div className={`h-full ${ep?.completed ? "bg-ok" : "bar-fill"}`} style={{ width: `${(done / target) * 100}%` }} />
                          </div>
                        </div>
                        <div className="relative z-[1] mt-3 flex justify-end">
                          <EylemDugmeleri bilgi={dersKaydi(lessonKey(course.slug, l.id), l.title, course.cardTitle ?? course.title, href)} yalnizSimge />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
          </section>
          ))
        )}
      </div>
      </div>
      </Bant>
    </div>
  );
}

const KART = { egitim: "Eğitim", pratik: "Pratik", ek: "Ek İnceleme" } as const;

/** Teori dersindeki Pratik kartı: soruları teori yolu adımında çözülür, sonucu oradan gelir */
function PratikKarti({ lesson: l, sonuc }: { lesson: Lesson; sonuc?: StepProgress }) {
  return (
    <Link
      href={`/teori/yol/${l.practice!.yol}/${encodeURIComponent(l.practice!.kod)}`}
      className={`card group relative block overflow-hidden p-4 transition duration-300 hover:-translate-y-0.5 hover:border-ink/15 ${sonuc?.passed ? "border-ok/40" : ""}`}
    >
      <div className="relative">
        <div className="flex items-start gap-3">
          <UygulamaSimgesi simge={dersSimgesi("pratik")} boyut={32} etiket={DERS_TURU_ADI.pratik} />
          <h3 className="min-w-0 flex-1 font-semibold leading-tight">{l.title}</h3>
        </div>
        {l.target && <p className="mt-2 text-xs font-medium text-muted">Rozet: <span className="text-accent">{l.target}</span></p>}
        <p className={`${l.target ? "mt-4" : "mt-10"} text-right text-sm font-semibold tabular-nums`}>
          <span className="float-left text-xs font-semibold text-accent">Pratik</span>
          {sonuc ? `En iyi %${sonuc.best}` : "Sorular"}
        </p>
        <div className="mt-3 flex items-center justify-between border-t border-line/70 pt-3 text-xs font-medium">
          <span className="text-muted">{sonuc ? `${sonuc.attempts} deneme` : "Başlanmadı"}</span>
          <span className={`rounded-full px-2.5 py-0.5 ${sonuc?.passed ? "bg-ok/15 text-ok" : "bg-accent/15 text-accent"}`}>
            {sonuc?.passed ? "Geçildi" : "Geçilmedi"}
          </span>
        </div>
      </div>
    </Link>
  );
}
