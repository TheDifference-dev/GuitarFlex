"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, ChevronRight } from "lucide-react";
import type { Axis } from "@/content/types";
import { BITIRME_ORANI, EKSEN, KADEME, KADEMELER, type Kademe, type SeviyeSatiri, type SeviyeVerisi } from "@/content/seviyeler";
import { useProgress, type Progress } from "@/lib/progress";
import { bilgiDuzeyiYaz, dersBitti, kademeIlerlemesi, oneriler, otomatikKademe, useBilgiDuzeyi, type Oneri } from "@/lib/seviye-oneri";
import { Bant, HapBag, MetinBag, SayfaBasi } from "./site/Vitrin";
import UygulamaSimgesi from "./site/UygulamaSimgesi";
import { kademeSimgesi, kursSimgesi, yolSimgesi } from "@/lib/simge";

// Seviye Yolu: dört kademe (Başlangıç, Orta, Orta-Üst, Üst Düzey). Veri sunucuda kurulur (src/lib/seviye.ts),
// ilerleme ve öneriler tarayıcıda (src/lib/seviye-oneri.ts). Kilit yok; öneri bilgi düzeyine göre.

const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);
const satirSimgesi = (r: SeviyeSatiri) => (r.course.startsWith("yol:") ? yolSimgesi(r.course.slice(4)) : kursSimgesi(r.course));
const KAYNAK_ADI: Partial<Record<SeviyeSatiri["kaynak"], string>> = { yol: "Teori yolu", ek: "Ek kurs", stil: "Stil kursu", etut: "Etüt" };

function Bar({ value, total, goal }: { value: number; total: number; goal?: boolean }) {
  return (
    <div className="relative mt-2 h-1.5 overflow-hidden rounded-full bg-ink/10">
      <div className={`h-full rounded-full ${total && value >= total ? "bg-ok" : "bar-fill"}`} style={{ width: `${pct(value, total)}%` }} />
      {goal && <span className="absolute inset-y-0 w-px bg-ink/60" style={{ left: `${BITIRME_ORANI * 100}%` }} title={`Hedef: %${BITIRME_ORANI * 100}`} />}
    </div>
  );
}

/** Bilgi düzeyi: seçilen kademe ya da ilerlemeye göre otomatik */
function useKademem(veriler: Record<Kademe, SeviyeVerisi>, p: Progress) {
  const secim = useBilgiDuzeyi();
  const oto = useMemo(() => otomatikKademe(p, veriler), [p, veriler]);
  return { secim, oto, kademe: secim === "otomatik" ? oto : secim };
}

function BilgiDuzeyiSecici({ oto }: { oto: Kademe }) {
  const secim = useBilgiDuzeyi();
  const cls = (on: boolean) =>
    `rounded-full px-3.5 py-2 text-sm font-semibold transition ${on ? "bg-seg text-text shadow-[var(--shadow-seg)]" : "text-muted hover:text-text"}`;
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-sm font-medium text-muted">Bilgi düzeyin</p>
      <div className="flex flex-wrap justify-center gap-1 rounded-full border border-ink/[0.08] bg-ink/[0.05] p-1" role="radiogroup" aria-label="Bilgi düzeyin">
        <button type="button" role="radio" aria-checked={secim === "otomatik"} className={cls(secim === "otomatik")} onClick={() => bilgiDuzeyiYaz("otomatik")}>
          Otomatik · {KADEME[oto].ad}
        </button>
        {KADEMELER.map((k) => (
          <button key={k} type="button" role="radio" aria-checked={secim === k} className={cls(secim === k)} onClick={() => bilgiDuzeyiYaz(k)}>
            {KADEME[k].ad}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted">Otomatik: tamamladığın derslere ve teori adımlarına göre.</p>
    </div>
  );
}

function OneriKartlari({ liste, bos }: { liste: Oneri[]; bos: string }) {
  if (!liste.length) return <p className="card p-5 text-center text-sm text-muted">{bos}</p>;
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {liste.map((o) => (
        <Link key={o.ders.key} href={o.ders.href} className="card group flex flex-col p-4 transition hover:-translate-y-0.5 hover:border-ink/15">
          <span className="flex items-center gap-2.5">
            <UygulamaSimgesi simge={satirSimgesi(o.satir)} boyut={32} />
            <span className="text-xs font-semibold uppercase tracking-wide text-accent">{o.neden}</span>
          </span>
          <span className="mt-3 line-clamp-2 font-semibold leading-snug">{o.ders.ad}</span>
          <span className="mt-1 line-clamp-1 flex-1 text-xs text-muted">
            {o.satir.courseTitle} · {o.satir.title}
          </span>
          <span className="mt-3 flex items-center gap-1 text-sm font-semibold text-accent">
            Başla <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
          </span>
        </Link>
      ))}
    </div>
  );
}

// ── /seviye: kademeler, bilgi düzeyi ve öneriler ────────────────────────────

export function SeviyeAnasayfa({ veriler }: { veriler: Record<Kademe, SeviyeVerisi> }) {
  const p = useProgress();
  const { oto, kademe } = useKademem(veriler, p);
  const liste = oneriler(p, veriler[kademe]);
  return (
    <div className="space-y-12">
      <BilgiDuzeyiSecici oto={oto} />
      <section className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-[28px] font-semibold leading-tight tracking-tight">Sana önerilen</h2>
          <Link href={`/seviye/${kademe}`} className="text-sm font-semibold text-accent hover:underline">
            {KADEME[kademe].ad} seviyesinin tüm dersleri ›
          </Link>
        </div>
        <OneriKartlari liste={liste} bos={`${KADEME[kademe].ad} seviyesindeki bütün dersleri bitirdin. Bir üst seviyeye geç.`} />
      </section>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KADEMELER.map((k) => {
          const il = kademeIlerlemesi(p, veriler[k]);
          const ders = veriler[k].rows.reduce((n, r) => n + r.lessons.length, 0);
          return (
            <Link
              key={k}
              href={`/seviye/${k}`}
              className={`card flex flex-col p-5 transition duration-300 hover:-translate-y-0.5 hover:border-ink/15 ${k === kademe ? "ring-2 ring-accent/60" : ""}`}
            >
              <span className="flex items-center justify-between gap-2">
                <UygulamaSimgesi simge={kademeSimgesi(k)} boyut={44} />
                {il.tamam ? (
                  <span className="flex items-center gap-1 rounded-full bg-ok/15 px-2.5 py-0.5 text-xs font-semibold text-ok">
                    <CheckCircle2 size={12} /> Tamamlandı
                  </span>
                ) : k === kademe ? (
                  <span className="rounded-full bg-accent/12 px-2.5 py-0.5 text-xs font-semibold text-accent">Senin seviyen</span>
                ) : null}
              </span>
              <h2 className="mt-3 text-xl font-semibold">{KADEME[k].ad}</h2>
              <p className="mt-1 flex-1 text-sm leading-relaxed text-muted">{KADEME[k].tanim}</p>
              <p className="mt-4 flex justify-between text-xs font-medium text-muted">
                <span>{ders} ders</span>
                <span className="tabular-nums">
                  <span className="font-semibold text-text">%{pct(il.bitti, il.toplam)}</span>
                </span>
              </p>
              <Bar value={il.bitti} total={il.toplam} goal />
            </Link>
          );
        })}
      </section>
    </div>
  );
}

// ── /seviye/[kademe]: tek kademenin sayfası ─────────────────────────────────

function Satir({ row, p }: { row: SeviyeSatiri; p: Progress }) {
  const n = row.lessons.filter((d) => dersBitti(p, d)).length;
  const complete = n === row.lessons.length;
  const ilk = row.lessons.find((d) => !dersBitti(p, d)) ?? row.lessons[0];
  return (
    <Link href={ilk?.href ?? row.href} className={`card flex items-center gap-3 px-4 py-3 transition hover:border-ink/15 hover:bg-panel-2 ${complete ? "border-ok/40" : ""}`}>
      <UygulamaSimgesi simge={satirSimgesi(row)} boyut={32} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{row.title}</span>
        <span className="block truncate text-xs text-muted">
          {row.courseTitle} · {EKSEN[row.axis]}
          {KAYNAK_ADI[row.kaynak] ? ` · ${KAYNAK_ADI[row.kaynak]}` : ""}
        </span>
      </span>
      <span className="w-24 shrink-0 text-right text-xs font-medium tabular-nums text-muted">
        <span className={complete ? "text-ok" : "text-text"}>{n}</span> / {row.lessons.length}
        <Bar value={n} total={row.lessons.length} />
      </span>
      <ChevronRight size={16} className="shrink-0 text-muted" />
    </Link>
  );
}

const FILTRE: (Axis | "")[] = ["", "technique", "fretboard", "rhythm", "theory_ear"];

export function SeviyeSayfasi({ data, veriler }: { data: SeviyeVerisi; veriler: Record<Kademe, SeviyeVerisi> }) {
  const p = useProgress();
  const { kademe: benim } = useKademem(veriler, p);
  const [eksen, setEksen] = useState<Axis | "">("");
  const [bitenler, setBitenler] = useState(false);
  const k = data.kademe;
  const meta = KADEME[k];
  const i = KADEMELER.indexOf(k);
  const prev = KADEMELER[i - 1];
  const next = KADEMELER[i + 1];
  const il = kademeIlerlemesi(p, data);
  const liste = oneriler(p, data);

  const filtreli = data.rows.filter((r) => !eksen || r.axis === eksen);
  const biten = filtreli.filter((r) => r.lessons.every((d) => dersBitti(p, d)));
  const gorunen = bitenler ? filtreli : filtreli.filter((r) => !biten.includes(r));
  const chip = (on: boolean) => `rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${on ? "bg-text text-bg" : "bg-ink/[0.06] text-muted hover:text-text"}`;

  return (
    <div>
      <SayfaBasi kirinti={[{ href: "/seviye", label: "Seviye Yolu" }, { label: meta.ad }]} simge={kademeSimgesi(k)} ust="Seviye Yolu" baslik={meta.ad} alt={meta.tanim}>
        {prev && (
          <MetinBag href={`/seviye/${prev}`} buyuk geri>
            {KADEME[prev].ad}
          </MetinBag>
        )}
        <HapBag href="#oneriler">Önerilenlerle başla</HapBag>
        {next && (
          <MetinBag href={`/seviye/${next}`} buyuk>
            {KADEME[next].ad}
          </MetinBag>
        )}
      </SayfaBasi>
      <Bant ton="gri" className="space-y-12 pt-12">
        <section className="card p-5">
          <p className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-lg font-semibold">
              İlerleme {il.tamam && <CheckCircle2 size={16} className="ml-1 inline text-ok" />}
              {k === benim && !il.tamam && <span className="ml-2 rounded-full bg-accent/12 px-2.5 py-0.5 align-middle text-xs font-semibold text-accent">Senin seviyen</span>}
            </span>
            <span className="text-sm tabular-nums text-muted">
              <span className="font-semibold text-text">{il.bitti}</span> / {il.toplam} · %{pct(il.bitti, il.toplam)}
            </span>
          </p>
          <Bar value={il.bitti} total={il.toplam} goal />
          <p className="mt-2 text-xs text-muted">
            Seviyeyi bitirmek için tablı derslerin ve Okuma, Kulak, Ritim adımlarının %{BITIRME_ORANI * 100}&apos;i. Kilit yok, her ders açık.
          </p>
        </section>

        <section id="oneriler" className="scroll-mt-24 space-y-4">
          <h2 className="text-[28px] font-semibold leading-tight tracking-tight">Sıradaki</h2>
          <OneriKartlari liste={liste} bos="Bu seviyedeki bütün dersleri bitirdin." />
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[28px] font-semibold leading-tight tracking-tight">Dersler</h2>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Eksen">
              {FILTRE.map((f) => (
                <button key={f || "tum"} type="button" className={chip(eksen === f)} aria-pressed={eksen === f} onClick={() => setEksen(f)}>
                  {f ? EKSEN[f] : "Tümü"}
                </button>
              ))}
            </div>
          </div>
          <p className="text-sm text-muted">Kolaydan zora sıralı: önce temel beceriler, sonra onların üstüne kurulanlar.</p>
          {gorunen.length ? (
            <div className="space-y-2">
              {gorunen.map((r) => (
                <Satir key={`${r.course}/${r.code}/${r.axis}/${r.level}`} row={r} p={p} />
              ))}
            </div>
          ) : (
            <p className="px-1 text-sm text-muted">{filtreli.length ? "Bu listedeki bütün dersleri bitirdin." : "Bu eksende bu seviyeye ait ders yok."}</p>
          )}
          {biten.length > 0 && (
            <button type="button" className="text-sm font-semibold text-accent hover:underline" onClick={() => setBitenler(!bitenler)}>
              {bitenler ? "Tamamlananları gizle" : `Tamamlananları göster (${biten.length})`}
            </button>
          )}
        </section>
      </Bant>
    </div>
  );
}
