"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { BookText, Check, ChevronDown, FileText, ListChecks, ListTree, ListVideo, PlayCircle, Sparkles } from "lucide-react";
import type { Course, Lesson, Section } from "@/content/types";
import { lessonKey } from "@/content/courses";
import { chapterLevels, isAcoustic } from "@/content/seviyeler";
import SeviyeRozeti from "./SeviyeRozeti";
import Cekmece from "./site/Cekmece";
import Kirinti from "./site/Kirinti";
import KursSecici, { type SeciciKurs } from "./site/KursSecici";
import { AILE_ADI, AILE_ADRESI, type KursAilesi } from "@/lib/katalog";
import { useProgress, type Progress, type StepProgress } from "@/lib/progress";

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

/** Bölüm sonundaki sınav satırı: sınavın adı ve kademelerin BPM eşikleri (Altın I · Platin I · Elmas I · Usta) */
function ExamRow({ section: s }: { section: Section }) {
  const tiers = s.examTiers ?? [];
  return (
    <div className="mt-1.5 rounded-xl bg-white/[0.04] px-2.5 py-2 text-xs" title="Sınava girmek istediğin kademeyi ve BPM'i seç">
      <span className="flex items-center gap-1.5 font-semibold text-accent">
        <Sparkles size={12} className="shrink-0" /> {s.examName ?? "Sınav"}
      </span>
      {!!tiers.length && (
        <span className="mt-1 flex flex-wrap gap-1">
          {tiers.map((bpm, i) => (
            <span key={i} className="rounded-full bg-white/[0.06] px-2 py-0.5 font-medium tabular-nums text-muted">
              {s.examTierNames?.[i] ? `${s.examTierNames[i]} ` : ""}
              <span className="text-text">{bpm}</span>
            </span>
          ))}
        </span>
      )}
    </div>
  );
}

/** Adresteki "#bolum-<kod>" (ör. Seviye Yolu'ndan gelen bağlantı); sunucuda boş */
const subscribeHash = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};
const readHash = () => window.location.hash;

export default function CourseView({ course, image, kurslar = [], aile }: { course: Course; image?: string; kurslar?: SeciciKurs[]; aile: KursAilesi }) {
  const p = useProgress();
  const [tab, setTab] = useState<"egzersiz" | "rehber">("egzersiz");
  const [cekmece, setCekmece] = useState(false);
  const kapatCekmece = useCallback(() => setCekmece(false), []);
  const firstOpen = course.sections.findIndex((s) => !sectionDone(p, course, s));
  const [selected, setSelected] = useState<number | null>(null);
  const hash = useSyncExternalStore(subscribeHash, readHash, () => "");
  const hashCode = hash.startsWith("#bolum-") ? decodeURIComponent(hash.slice(7)) : null;
  const hashSection = hashCode ? course.sections.findIndex((s) => s.chapters.some((c) => c.code === hashCode)) : -1;
  const current = course.sections[selected ?? (hashSection >= 0 ? hashSection : Math.max(0, firstOpen))] ?? course.sections[0];
  const badges = !isAcoustic(course);

  // Kurs ilerlemesi ve sıradaki ders (GuitarBear: "İLERLEME x/N", "MEVCUT BÖLÜM: x.y")
  const hepsi = course.sections.flatMap((s) => s.chapters.flatMap((c) => c.lessons.map((l) => ({ l, s, c }))));
  const tamam = hepsi.filter((x) => lessonDone(p, course, x.l)).length;
  const siradaki = hepsi.find((x) => !lessonDone(p, course, x.l));
  const yuzde = hepsi.length ? Math.round((tamam / hepsi.length) * 100) : 0;
  const dersHref = (l: Lesson) => (l.practice ? `/teori/yol/${l.practice.yol}/${encodeURIComponent(l.practice.kod)}` : `/calis/${course.slug}/${encodeURIComponent(l.id)}`);

  // Bağlantıyla gelinen alt bölüm başka bölümdeyse, bölüm açıldıktan sonra ona kaydır
  useEffect(() => {
    if (hashSection >= 0) document.getElementById(`bolum-${hashCode}`)?.scrollIntoView();
  }, [hashCode, hashSection]);

  /** Sol panel (masaüstü) ve mobil çekmecedeki içerik: Egzersiz/Rehber, eğitim videoları, bölümler ve alt bölümler */
  const panel = (mobil: boolean) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-1 rounded-full border border-white/[0.08] bg-white/[0.05] p-1">
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
            className={`flex items-center justify-center gap-1.5 rounded-full py-2 text-sm font-semibold transition ${tab === id ? "bg-white/[0.14] text-text shadow-[0_1px_2px_rgb(0_0_0/0.5)]" : "text-muted hover:text-text"}`}
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
            const active = s === current;
            const bitti = sectionDone(p, course, s);
            const dersler = s.chapters.flatMap((c) => c.lessons);
            const dk = Math.round(dersler.reduce((n, l) => n + (l.practice ? 0 : l.minutes), 0));
            return (
              <div key={s.number} className={active ? "rounded-2xl bg-white/[0.05]" : ""}>
                <button
                  type="button"
                  onClick={() => {
                    setSelected(si);
                    setTab("egzersiz");
                    if (mobil) setCekmece(false);
                  }}
                  aria-current={active ? "true" : undefined}
                  className={`flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-sm font-semibold ${active ? "text-accent" : ""}`}
                >
                  <span
                    className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] ${bitti ? "bg-emerald-500 text-black" : active ? "bg-[image:var(--grad)] text-white" : "bg-white/10 text-text"}`}
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
                  {s.chapters.map((c) => {
                    const done = c.lessons.every((l) => lessonDone(p, course, l));
                    return (
                      <a
                        key={c.code}
                        href={`#bolum-${c.code}`}
                        onClick={() => {
                          setSelected(si);
                          setTab("egzersiz");
                          if (mobil) setCekmece(false);
                        }}
                        className={`flex items-center gap-2 rounded-lg px-2 py-1 text-xs transition ${done ? "text-emerald-400" : "text-text/90"} hover:bg-white/[0.06]`}
                      >
                        <span className="w-7 shrink-0 font-semibold">{c.code}</span>
                        <span className="flex-1 truncate">{c.title}</span>
                        <span className="shrink-0 text-muted">{c.lessons.length} ders</span>
                      </a>
                    );
                  })}
                  {(s.exam || !!s.examTiers?.length) && <ExamRow section={s} />}
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
    <div className="space-y-6">
      {/* Kurs başı: kırıntı, kurs seçici, ilerleme ve sıradaki ders */}
      <header className="space-y-4">
        <Kirinti halkalar={[{ href: AILE_ADRESI[aile], label: AILE_ADI[aile] }, { label: course.cardTitle ?? course.title }]} />
        {kurslar.length > 1 ? <KursSecici baslik={course.title} slug={course.slug} kurslar={kurslar} /> : <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{course.title}</h1>}
        {course.description && <p className="max-w-3xl text-muted">{course.description}</p>}
        <div className="card flex flex-wrap items-center gap-x-6 gap-y-3 p-4">
          <div className="min-w-[12rem] flex-1">
            <div className="flex justify-between gap-3 text-xs font-medium text-muted">
              <span>
                İlerleme <span className="font-semibold text-text">%{yuzde}</span>
              </span>
              <span className="tabular-nums">
                {tamam}/{hepsi.length} · {hepsi.length - tamam} kaldı
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="bar-grad h-full rounded-full" style={{ width: `${yuzde}%` }} />
            </div>
          </div>
          {siradaki && (
            <p className="text-sm text-muted">
              Mevcut bölüm: <span className="font-semibold text-text">{siradaki.c.code}</span>
            </p>
          )}
          {siradaki ? (
            <Link href={dersHref(siradaki.l)} className="btn-grad w-full min-w-0 px-5 py-2.5 text-sm sm:w-auto" title={siradaki.l.title}>
              <PlayCircle size={16} className="shrink-0" />
              <span className="shrink-0 whitespace-nowrap">{tamam ? "Devam et" : "Başla"}:</span>
              <span className="min-w-0 truncate sm:max-w-[14rem]">{siradaki.l.title}</span>
            </Link>
          ) : (
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3.5 py-2 text-sm font-semibold text-emerald-400">
              <Check size={16} /> Kurs tamamlandı
            </span>
          )}
        </div>
      </header>

      {/* Mobil: bölüm seçimi yapışkan çubukta, liste çekmecede */}
      <div className="sticky top-[3.6rem] z-20 -mx-4 border-y border-white/[0.07] bg-bg/85 px-4 py-2 sm:-mx-6 sm:px-6 backdrop-blur lg:hidden">
        <button type="button" onClick={() => setCekmece(true)} className="flex w-full items-center gap-2 text-left text-sm font-semibold">
          <ListTree size={16} className="shrink-0 text-accent" />
          <span className="min-w-0 flex-1 truncate">
            {tab === "rehber" ? "Rehber" : `Bölüm ${current.number} – ${current.title}`}
          </span>
          <span className="shrink-0 text-xs font-medium text-muted">Bölümler</span>
          <ChevronDown size={16} className="shrink-0 text-muted" />
        </button>
      </div>
      <Cekmece acik={cekmece} kapat={kapatCekmece} baslik={course.title}>
        {panel(true)}
      </Cekmece>

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      {/* Sol panel */}
      <aside className="hidden h-fit card p-3 lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-7rem)] lg:overflow-auto">{panel(false)}</aside>

      {/* Ana alan */}
      <div className="min-w-0 space-y-8">
        {tab === "egzersiz" && (
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-2xl font-bold tracking-tight">
              Bölüm {current.number} – {current.title}
            </h2>
            <span className="text-sm font-medium text-muted">
              {current.level ? `${current.level} · ` : ""}
              {bolumMeta(current)}
            </span>
          </div>
        )}

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
          current.chapters.map((c) => {
            const total = Math.round(c.lessons.reduce((sum, l) => sum + l.minutes, 0) * 10) / 10;
            return (
              <section key={c.code} id={`bolum-${c.code}`} className="scroll-mt-24 space-y-4">
                <div className="flex items-center gap-3 border-b border-line/70 pb-3">
                  <span className="rounded-full bg-accent/15 px-3 py-0.5 text-xs font-semibold text-accent">{c.code}</span>
                  <h2 className="flex-1 text-lg font-semibold">{c.title}</h2>
                  {badges && chapterLevels(c).map((lv) => <SeviyeRozeti key={lv} level={lv} />)}
                  <span className="text-sm font-medium text-muted">{total} dk</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {c.lessons.map((l) => {
                    const ep = p.exercises[lessonKey(course.slug, l.id)];
                    const target = l.minutes * 60;
                    const done = Math.min(ep?.totalSeconds ?? 0, target);
                    if (l.practice) return <PratikKarti key={l.id} lesson={l} sonuc={p.steps[`${l.practice.yol}/${l.practice.kod}`]} image={image} />;
                    return (
                      <Link
                        key={l.id}
                        href={`/calis/${course.slug}/${encodeURIComponent(l.id)}`}
                        className={`card group relative block overflow-hidden p-4 transition duration-300 hover:-translate-y-0.5 hover:border-white/15 ${ep?.completed ? "border-emerald-500/40" : siradaki?.l === l ? "border-accent/60 pt-7 shadow-[0_0_0_1px_rgb(255_55_95/0.35)]" : ""}`}
                      >
                        {siradaki?.l === l && (
                          <span className="absolute left-3 top-0 z-10 rounded-b-lg bg-[image:var(--grad)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Sıradaki</span>
                        )}
                        {image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={image} alt="" className="absolute inset-0 size-full object-cover opacity-25" />
                        ) : (
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgb(255_55_95/0.14),transparent_55%)]" />
                        )}
                        <div className="relative">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold leading-tight">{l.title}</h3>
                            <span className="flex shrink-0 items-center gap-1.5">
                              {/* Alt bölümünden farklı seviyedeki ders: seviyesi kartta yazar (rozet alt bölüm başlığında) */}
                              {badges && l.level && l.level !== c.level && (
                                <span className="rounded-full border border-white/10 bg-white/[0.06] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-text/90" title="Dersin seviyesi">
                                  {l.level}
                                </span>
                              )}
                              <span className="rounded-full bg-white/[0.07] p-1.5">
                                <ListVideo size={14} />
                              </span>
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
                          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                            <div className={`h-full ${ep?.completed ? "bg-emerald-500" : "bar-grad"}`} style={{ width: `${(done / target) * 100}%` }} />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })
        )}
      </div>
      </div>
    </div>
  );
}

const KART = { egitim: "Eğitim", pratik: "Pratik", ek: "Ek İnceleme" } as const;

/** Teori dersindeki Pratik kartı: soruları teori yolu adımında çözülür, sonucu oradan gelir */
function PratikKarti({ lesson: l, sonuc, image }: { lesson: Lesson; sonuc?: StepProgress; image?: string }) {
  return (
    <Link
      href={`/teori/yol/${l.practice!.yol}/${encodeURIComponent(l.practice!.kod)}`}
      className={`card group relative block overflow-hidden p-4 transition duration-300 hover:-translate-y-0.5 hover:border-white/15 ${sonuc?.passed ? "border-emerald-500/40" : ""}`}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="absolute inset-0 size-full object-cover opacity-25" />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgb(191_90_242/0.14),transparent_55%)]" />
      )}
      <div className="relative">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight">{l.title}</h3>
          <span className="rounded-full bg-white/[0.07] p-1.5">
            <ListChecks size={14} />
          </span>
        </div>
        {l.target && <p className="mt-2 text-xs font-medium text-muted">Rozet: <span className="text-accent">{l.target}</span></p>}
        <p className={`${l.target ? "mt-4" : "mt-10"} text-right text-sm font-semibold tabular-nums`}>
          <span className="float-left text-xs font-semibold text-accent">Pratik</span>
          {sonuc ? `En iyi %${sonuc.best}` : "Sorular"}
        </p>
        <div className="mt-3 flex items-center justify-between border-t border-line/70 pt-3 text-xs font-medium">
          <span className="text-muted">{sonuc ? `${sonuc.attempts} deneme` : "Başlanmadı"}</span>
          <span className={`rounded-full px-2.5 py-0.5 ${sonuc?.passed ? "bg-emerald-500/15 text-emerald-400" : "bg-accent/15 text-accent"}`}>
            {sonuc?.passed ? "Geçildi" : "Geçilmedi"}
          </span>
        </div>
      </div>
    </Link>
  );
}
