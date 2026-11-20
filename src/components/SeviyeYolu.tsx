"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { CheckCircle2, ChevronRight, Circle, Clock } from "lucide-react";
import type { Level } from "@/content/types";
import {
  BITIRME_ORANI,
  EKSEN,
  LEVELS,
  SEVIYE,
  type SeviyeDers,
  type SeviyeGrubu,
  type SeviyeSatiri,
  type SeviyeVerisi,
  type SeviyeYolu,
} from "@/content/seviyeler";
import { useProgress, type Progress } from "@/lib/progress";
import { Bant, HapBag, MetinBag, SayfaBasi } from "./site/Vitrin";

// Seviye Yolu (Müfredat Spec v2.2 §10). Veri sunucuda kurulur (src/lib/seviye.ts);
// ilerleme tarayıcıdaki kayıttan (localStorage) burada sayılır. Kilit yok, yalnız öneri ve ilerleme.

/** Ders tamamlandı mı: pratik kartında teori yolu adımı geçilmiş olmalı, diğerlerinde ders tamamlanmış (CourseView ile aynı kural) */
const done = (p: Progress, d: SeviyeDers) => (d.step ? Boolean(p.steps[d.step]?.passed) : Boolean(p.exercises[d.key]?.completed));

const count = (p: Progress, lessons: SeviyeDers[]) => lessons.filter((d) => done(p, d)).length;

const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);

const allRows = (v: SeviyeVerisi): SeviyeSatiri[] =>
  [...v.groups, ...(v.ekler ?? []), ...(v.stiller ?? [])].flatMap((g) => g.rows);

/** Tablı drill'ler: bitirme koşulunun temeli (§3) */
const tabLessons = (rows: SeviyeSatiri[]) => rows.flatMap((r) => r.lessons.filter((d) => d.tab));

/** Yol adımı geçildi mi (teori yolu kaydı: progress.steps["<yol>/<kod>"]) */
const stepDone = (p: Progress, steps: string[]) => steps.filter((st) => p.steps[st]?.passed).length;
const yolSteps = (yollar: SeviyeYolu[]) => yollar.flatMap((y) => y.adimlar.map((a) => a.step));
/** Okuma, Kulak, Ritim yolu koşulu: bu seviyede adım yoksa koşul aranmaz */
const yolOk = (p: Progress, steps: string[]) => !steps.length || stepDone(p, steps) / steps.length >= BITIRME_ORANI;

function Bar({ value, total, goal }: { value: number; total: number; goal?: boolean }) {
  return (
    <div className="relative mt-1.5 h-1 overflow-hidden rounded-full bg-ink/10">
      <div className={`h-full rounded-full ${total && value >= total ? "bg-ok" : "bar-fill"}`} style={{ width: `${pct(value, total)}%` }} />
      {goal && <span className="absolute inset-y-0 w-px bg-ink/60" style={{ left: `${BITIRME_ORANI * 100}%` }} title={`Hedef: %${BITIRME_ORANI * 100}`} />}
    </div>
  );
}

// ── /seviye: beş seviyenin özet kartları ────────────────────────────────────

export type SeviyeOzeti = { level: Level; rows: number; lessons: number; tab: SeviyeDers[]; yolAdim: string[] };

export function SeviyeKartlari({ items }: { items: SeviyeOzeti[] }) {
  const p = useProgress();
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((s) => {
        const tabDone = count(p, s.tab);
        const yolDone = stepDone(p, s.yolAdim);
        const ok = s.tab.length > 0 && tabDone / s.tab.length >= BITIRME_ORANI && yolOk(p, s.yolAdim);
        return (
          <Link key={s.level} href={`/seviye/${s.level}`} className="card group flex flex-col p-5 transition duration-300 hover:-translate-y-0.5 hover:border-ink/15">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-3xl font-bold tracking-tight">
                <span className="text-accent">{s.level}</span>
              </span>
              {ok && (
                <span className="flex items-center gap-1 rounded-full bg-ok/15 px-2.5 py-0.5 text-xs font-semibold text-ok">
                  <CheckCircle2 size={12} /> %{BITIRME_ORANI * 100} geçildi
                </span>
              )}
            </div>
            <h2 className="mt-1 text-lg font-semibold">{SEVIYE[s.level].ad}</h2>
            <p className="mt-1 flex-1 text-sm leading-relaxed text-muted">{SEVIYE[s.level].tanim}</p>
            <p className="mt-4 text-xs font-medium text-muted">
              <span className="font-semibold text-text">{s.rows}</span> alt bölüm · <span className="font-semibold text-text">{s.lessons}</span> ders
            </p>
            <div className="mt-3 border-t border-line/70 pt-3">
              <p className="flex justify-between text-xs font-medium text-muted">
                <span>Tablı ders</span>
                <span className="tabular-nums">
                  <span className="font-semibold text-text">{tabDone}</span> / {s.tab.length} · %{pct(tabDone, s.tab.length)}
                </span>
              </p>
              <Bar value={tabDone} total={s.tab.length} goal />
              {s.yolAdim.length ? (
                <>
                  <p className="mt-2.5 flex justify-between text-xs font-medium text-muted">
                    <span>Okuma, Kulak, Ritim adımı</span>
                    <span className="tabular-nums">
                      <span className="font-semibold text-text">{yolDone}</span> / {s.yolAdim.length} · %{pct(yolDone, s.yolAdim.length)}
                    </span>
                  </p>
                  <Bar value={yolDone} total={s.yolAdim.length} goal />
                </>
              ) : null}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// ── /seviye/[seviye]: tek seviyenin sayfası ─────────────────────────────────

function Yakinda({ title, text }: { title: string; text: string }) {
  return (
    <div className="card flex items-start gap-3 p-4">
      <Clock size={16} className="mt-0.5 shrink-0 text-accent" />
      <div>
        <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
          {title}
          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-ink">Yakında</span>
        </p>
        <p className="mt-0.5 text-sm text-muted">{text}</p>
      </div>
    </div>
  );
}

function Satir({ row, p }: { row: SeviyeSatiri; p: Progress }) {
  const n = count(p, row.lessons);
  const complete = n === row.lessons.length;
  return (
    <Link
      href={row.href}
      className={`card flex items-center gap-3 px-4 py-3 transition hover:border-ink/15 hover:bg-panel-2 ${complete ? "border-ok/40" : ""}`}
    >
      <span className="w-10 shrink-0 rounded-full bg-accent/15 px-2 py-0.5 text-center text-xs font-semibold text-accent">{row.code}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{row.title}</span>
        <span className="block truncate text-xs text-muted">{row.courseTitle}</span>
      </span>
      <span className="w-24 shrink-0 text-right text-xs font-medium tabular-nums text-muted">
        <span className={complete ? "text-ok" : "text-text"}>{n}</span> / {row.lessons.length} ders
        <Bar value={n} total={row.lessons.length} />
      </span>
      <ChevronRight size={16} className="shrink-0 text-muted" />
    </Link>
  );
}

function Gruplar({ groups, p, bos }: { groups: SeviyeGrubu[]; p: Progress; bos: string }) {
  return (
    <div className="space-y-6">
      {groups.map((g) => {
        const lessons = g.rows.flatMap((r) => r.lessons);
        return (
          <section key={g.axis} id={`eksen-${g.axis}`} className="scroll-mt-24 space-y-2">
            <div className="flex items-baseline gap-3 border-b border-line/70 pb-2">
              <h3 className="flex-1 text-lg font-semibold">{EKSEN[g.axis]}</h3>
              <span className="text-sm font-medium tabular-nums text-muted">
                {g.rows.length} alt bölüm · {count(p, lessons)} / {lessons.length} ders
              </span>
            </div>
            {g.rows.length ? (
              <div className="space-y-2">
                {g.rows.map((r) => (
                  <Satir key={`${r.course}/${r.code}/${g.axis}`} row={r} p={p} />
                ))}
              </div>
            ) : (
              <p className="px-1 text-sm text-muted">{bos}</p>
            )}
          </section>
        );
      })}
    </div>
  );
}

function Kosul({ ok, children, yakinda }: { ok?: boolean; children: ReactNode; yakinda?: boolean }) {
  return (
    <li className="flex items-start gap-2 text-sm">
      {ok ? <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-ok" /> : yakinda ? <Clock size={16} className="mt-0.5 shrink-0 text-muted" /> : <Circle size={16} className="mt-0.5 shrink-0 text-muted" />}
      <span className={yakinda ? "text-muted" : ""}>{children}</span>
    </li>
  );
}

export function SeviyeSayfasi({ data }: { data: SeviyeVerisi }) {
  const p = useProgress();
  const { level } = data;
  const meta = SEVIYE[level];
  const i = LEVELS.indexOf(level);
  const prev = LEVELS[i - 1];
  const next = LEVELS[i + 1];
  const rows = allRows(data);
  const tab = tabLessons(rows);
  const tabDone = count(p, tab);
  const tabOk = tab.length > 0 && tabDone / tab.length >= BITIRME_ORANI;
  const etutLessons = data.etut?.flatMap((r) => r.lessons) ?? [];
  const etutDone = etutLessons.length > 0 && count(p, etutLessons) === etutLessons.length;
  const hedef = `%${BITIRME_ORANI * 100}`;
  const ySteps = yolSteps(data.yollar);
  const yDone = stepDone(p, ySteps);

  return (
    <div>
      <SayfaBasi
        kirinti={[{ href: "/seviye", label: "Seviye Yolu" }, { label: `${level} ${meta.ad}` }]}
        ust={`Seviye Yolu · ${level}`}
        baslik={meta.ad}
        alt={meta.tanim}
      >
        {prev && (
          <MetinBag href={`/seviye/${prev}`} buyuk geri>
            {prev} {SEVIYE[prev].ad}
          </MetinBag>
        )}
        <HapBag href="#eksen-technique">Derslere geç</HapBag>
        {next && (
          <MetinBag href={`/seviye/${next}`} buyuk>
            {next} {SEVIYE[next].ad}
          </MetinBag>
        )}
      </SayfaBasi>
      <Bant ton="gri" className="space-y-12 pt-12">
      {/* Seviye özeti: eksen başına tablı ders ve bitirme koşulu (§3) */}
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="card p-5">
          <h2 className="text-lg font-semibold">Tablı dersler</h2>
          <p className="text-sm text-muted">Eksen başına tamamlanan / toplam</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {data.groups.map((g) => {
              const extra = [...(data.ekler ?? []), ...(data.stiller ?? [])].filter((x) => x.axis === g.axis).flatMap((x) => x.rows);
              const t = tabLessons([...g.rows, ...extra]);
              const n = count(p, t);
              return (
                <a key={g.axis} href={`#eksen-${g.axis}`} className="rounded-xl bg-ink/[0.04] p-3 transition hover:bg-ink/[0.08]">
                  <p className="flex justify-between text-sm font-semibold">
                    {EKSEN[g.axis]}
                    <span className="tabular-nums text-muted">
                      <span className="text-text">{n}</span> / {t.length}
                    </span>
                  </p>
                  <Bar value={n} total={t.length} />
                </a>
              );
            })}
          </div>
          <div className="mt-4 border-t border-line/70 pt-3">
            <p className="flex justify-between text-sm font-semibold">
              Toplam
              <span className="tabular-nums text-muted">
                <span className="text-text">{tabDone}</span> / {tab.length} · %{pct(tabDone, tab.length)}
              </span>
            </p>
            <Bar value={tabDone} total={tab.length} goal />
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-lg font-semibold">Seviyeyi bitirme koşulu</h2>
          <p className="text-sm text-muted">Kilit yok: bütün dersler açık, bu liste yalnız yol gösterir.</p>
          <ul className="mt-4 space-y-2.5">
            <Kosul ok={tabOk}>
              Bu seviyedeki tablı derslerin en az {hedef}&apos;i tamamlandı{" "}
              <span className="tabular-nums text-muted">
                ({tabDone} / {tab.length})
              </span>
            </Kosul>
            {ySteps.length ? (
              <Kosul ok={yolOk(p, ySteps)}>
                Okuma, Kulak ve Ritim yolu adımlarının en az {hedef}&apos;i geçildi{" "}
                <span className="tabular-nums text-muted">
                  ({yDone} / {ySteps.length})
                </span>
              </Kosul>
            ) : (
              <Kosul ok>Okuma, Kulak ve Ritim yollarında bu seviyeye ait adım yok</Kosul>
            )}
            {data.etut?.length ? (
              <Kosul ok={etutDone}>Seviye etüdü {meta.etut}: %100 tempo turu</Kosul>
            ) : (
              <Kosul yakinda>Seviye etüdü {meta.etut}: %100 tempo turu · yakında</Kosul>
            )}
            <Kosul yakinda>Öneri: seviye resitali · yakında</Kosul>
          </ul>
        </div>
      </section>

      {/* Okuma, Kulak, Ritim yolu adımları (bitirme koşulu §3) */}
      {data.yollar.length ? (
        <section className="space-y-3">
          <div>
            <h2 className="text-[28px] font-semibold leading-tight tracking-tight">Yol adımları</h2>
            <p className="text-sm text-muted">Okuma, Kulak ve Ritim yollarında bu seviyedeki adımlar; geçilen / toplam.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {data.yollar.map((y) => {
              const steps = y.adimlar.map((a) => a.step);
              const n = stepDone(p, steps);
              const bolumler = [...new Set(y.adimlar.map((a) => a.bolum))];
              return (
                <Link key={y.slug} href={`/teori/yol/${y.slug}`} className="card p-4 transition hover:border-ink/15 hover:bg-panel-2">
                  <p className="flex items-baseline justify-between text-sm font-semibold">
                    {y.ad}
                    <span className="tabular-nums text-muted">
                      <span className={n === steps.length ? "text-ok" : "text-text"}>{n}</span> / {steps.length} adım
                    </span>
                  </p>
                  <Bar value={n} total={steps.length} goal />
                  <ul className="mt-3 space-y-1">
                    {bolumler.map((b) => {
                      const bs = y.adimlar.filter((a) => a.bolum === b).map((a) => a.step);
                      return (
                        <li key={b} className="flex justify-between gap-2 text-xs text-muted">
                          <span className="truncate">{b}</span>
                          <span className="shrink-0 tabular-nums">
                            {stepDone(p, bs)} / {bs.length}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* 1. Kurslardaki etiketli alt bölümler, eksene göre */}
      <section className="space-y-4">
        <div>
          <h2 className="text-[28px] font-semibold leading-tight tracking-tight">Kurslardan alt bölümler</h2>
          <p className="text-sm text-muted">Önce temel beceriler, sonra onların üstüne kurulanlar; eşitlikte kurs sırası.</p>
        </div>
        <Gruplar groups={data.groups} p={p} bos="Bu eksende bu seviyeye ait alt bölüm yok." />
      </section>

      {/* 2. Ek kurs ve Stil kursu */}
      <section className="space-y-4">
        <h2 className="text-[28px] font-semibold leading-tight tracking-tight">Ek kurs</h2>
        {data.ekler ? (
          <Gruplar groups={data.ekler} p={p} bos="Ek kursta bu eksende bu seviyeye ait alt bölüm yok." />
        ) : (
          <Yakinda title="Ek kurs" text="Kurslarda olmayan becerilerin kısa dersleri (ritim okuma, porte okuma, doğaçlama, armoni ve daha fazlası) bu seviyeye eklenecek." />
        )}
        {data.stiller ? (
          <>
            <h2 className="pt-2 text-[28px] font-semibold leading-tight tracking-tight">Stil kursu</h2>
            <Gruplar groups={data.stiller} p={p} bos="Stil kursunda bu eksende bu seviyeye ait alt bölüm yok." />
          </>
        ) : (
          <Yakinda title="Stil kursu" text="Blues, rock, funk, metal, caz, bossa nova, bebop ve füzyon dili, seviyelere göre." />
        )}
      </section>

      {/* 3. Seviye etüdü */}
      <section className="space-y-4">
        <h2 className="text-[28px] font-semibold leading-tight tracking-tight">Seviye etüdü</h2>
        {data.etut?.length ? (
          <div className="space-y-2">
            {data.etut.map((r) => (
              <Satir key={`${r.course}/${r.code}`} row={r} p={p} />
            ))}
          </div>
        ) : (
          <Yakinda title={`Etüt ${meta.etut}`} text="Seviyenin dört ekseninden becerileri bir araya getiren, formlu ve üç tempo turlu uzun parça." />
        )}
      </section>
      </Bant>
    </div>
  );
}
