"use client";

import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";
import type { Yol, YolBolum } from "@/lib/alistirma/tipler";
import { useProgress } from "@/lib/progress";
import ModulDersi from "../teori/ModulDersi";
import { SayfaBasi } from "../site/Vitrin";
import UygulamaSimgesi from "../site/UygulamaSimgesi";
import { yerSimgesi, yolSimgesi } from "@/lib/simge";
import { bolumeKaydir, useBolumIzleyici } from "../site/BolumGezgini";

// Teori yolu: GuitarBear'deki ana bölümler ve adımlar, ardından ayrı başlıkla bizim eklediğimiz "Ek bölümler"
// (bölümde ek: true; kodlar E1.1 …). Kilit yok: bütün adımlar her zaman açık. Üstteki ilerleme yalnız ana yolu
// sayar; Ek bölümler kendi sayacıyla ayrı gösterilir. Kenar çubuğu (geniş ekranda) bölümlerin içindekiler listesidir:
// filtre değil, tıklayınca bölüme yumuşak kayar, görünen bölüm vurgulanır (kurs sayfalarıyla aynı düzen).

export default function YolSayfasi({ yol }: { yol: Yol }) {
  const progress = useProgress();
  const [sekme, setSekme] = useState(0);
  const sonuc = (kod: string) => progress.steps[`${yol.slug}/${kod}`];
  const anaBolumler = yol.bolumler.filter((b) => !b.ek);
  const ekBolumler = yol.bolumler.filter((b) => b.ek);
  const adimlariOf = (bs: YolBolum[]) => yol.adimlar.filter((a) => bs.some((b) => b.no === a.bolum));
  const anaAdimlar = adimlariOf(anaBolumler);
  const ekAdimlar = adimlariOf(ekBolumler);
  const gecilen = anaAdimlar.filter((a) => sonuc(a.kod)?.passed).length;
  const ekGecilen = ekAdimlar.filter((a) => sonuc(a.kod)?.passed).length;
  const bolumId = (b: YolBolum) => `yol-bolum-${b.no}`;
  const gorunen = useBolumIzleyici(yol.bolumler.map(bolumId));

  const bolumGoster = (b: YolBolum) => {
    const adimlar = yol.adimlar.filter((a) => a.bolum === b.no);
    const biten = adimlar.filter((a) => sonuc(a.kod)?.passed).length;
    return (
      <section key={b.no} id={bolumId(b)} data-bolum className="scroll-mt-20 space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            {b.etiket ? <p className="eyebrow">{b.etiket}</p> : null}
            <h2 className="text-xl font-semibold">
              {b.kod ?? b.no}. {b.ad}
            </h2>
          </div>
          <span className="text-sm text-muted">
            {b.seviye ? `Seviye: ${b.seviye} · ` : ""}
            {biten}/{adimlar.length}
          </span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {adimlar.map((a) => {
            const r = sonuc(a.kod);
            return (
              <Link key={a.kod} href={`/teori/yol/${yol.slug}/${a.kod}`} className={`card p-3 transition hover:border-ink/15 ${r?.passed ? "border-ok/40" : ""}`}>
                <div className="flex items-start gap-3">
                  <UygulamaSimgesi simge={a.kontrol ? yerSimgesi("gorev") : yolSimgesi(yol.slug)} boyut={32} className="mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-accent">
                        {a.kod}
                        {a.kontrol ? " · Kontrol" : ""}
                      </p>
                      {r?.passed ? <Check size={16} className="text-ok" /> : null}
                    </div>
                    <h3 className="font-semibold">{a.ad}</h3>
                    <p className="text-xs text-muted">
                      {a.seviye && !b.ek ? `${a.seviye} · ` : ""}
                      {a.soru} soru · Geçme %{a.gecme.dogruluk}
                      {r ? ` · En iyi %${r.best}` : ""}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    );
  };

  return (
    <div className="space-y-8">
      <SayfaBasi
        kirinti={[{ href: "/teori", label: "Müzik Teorisi" }, { label: yol.ad }]}
        simge={yolSimgesi(yol.slug)}
        ust="Pratik Yolu"
        baslik={yol.ad}
        alt={yol.ozet}
        className="!pb-12"
        ek={
          <div className="mx-auto mt-8 flex max-w-sm flex-col items-center gap-2">
            <div className="h-1 w-full overflow-hidden rounded-full bg-ink/10">
              <div className="bar-fill h-full rounded-full" style={{ width: `${(gecilen / (anaAdimlar.length || 1)) * 100}%` }} />
            </div>
            <span className="text-xs tabular-nums text-muted">
              {gecilen} / {anaAdimlar.length} adım geçildi
              {ekAdimlar.length ? ` · Ek bölümler ${ekGecilen} / ${ekAdimlar.length}` : ""}
            </span>
          </div>
        }
      />

      {yol.modul.sekmeler.length ? (
        <section className="space-y-3 card p-5">
          <p className="eyebrow">Modül</p>
          <h2 className="text-xl font-semibold">{yol.modul.ad}</h2>
          <div className="flex flex-wrap gap-2" role="tablist">
            {yol.modul.sekmeler.map((s, i) => (
              <button
                key={s}
                type="button"
                role="tab"
                aria-selected={i === sekme}
                onClick={() => setSekme(i)}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${i === sekme ? "border-transparent bg-accent text-accent-ink" : "border-ink/10 bg-ink/[0.05] hover:bg-ink/10"}`}
              >
                {s}
              </button>
            ))}
          </div>
          <ModulDersi yol={yol.slug} yolAdi={yol.ad} sekme={yol.modul.sekmeler[sekme]} />
        </section>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <nav aria-label="Bölümler" className="card hidden h-fit p-3 lg:sticky lg:top-16 lg:block lg:max-h-[calc(100vh-5rem)] lg:overflow-auto" data-bolum-gezgini>
          <p className="mb-2 px-1 text-xs font-semibold text-muted">Bölümler</p>
          <ul className="space-y-0.5">
            {yol.bolumler.map((b, i) => {
              const adimlar = yol.adimlar.filter((a) => a.bolum === b.no);
              const biten = adimlar.filter((a) => sonuc(a.kod)?.passed).length;
              const aktif = gorunen === bolumId(b);
              return (
                <li key={b.no}>
                  {b.ek && !yol.bolumler[i - 1]?.ek && <p className="mb-1 mt-3 px-1 text-[11px] font-semibold text-muted">Ek bölümler</p>}
                  <a
                    href={`#${bolumId(b)}`}
                    data-kaydirma="kendi"
                    onClick={(e) => {
                      e.preventDefault();
                      bolumeKaydir(bolumId(b));
                    }}
                    aria-current={aktif ? "location" : undefined}
                    className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition hover:bg-ink/[0.06] ${aktif ? "bg-ink/[0.07] font-semibold text-accent" : ""}`}
                  >
                    <span className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${biten === adimlar.length && adimlar.length ? "bg-ok text-ok-ink" : "bg-ink/10"}`}>
                      {biten === adimlar.length && adimlar.length ? <Check size={11} /> : (b.kod ?? b.no)}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{b.ad}</span>
                    <span className="shrink-0 text-[11px] tabular-nums text-muted">
                      {biten}/{adimlar.length}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="min-w-0 space-y-8">
      {anaBolumler.map(bolumGoster)}

      {ekBolumler.length ? (
        <section className="space-y-8 border-t border-ink/10 pt-8" aria-labelledby="ek-bolumler">
          <div className="space-y-1">
            <h2 id="ek-bolumler" className="text-2xl font-semibold">
              Ek bölümler
            </h2>
            <p className="max-w-3xl text-sm text-muted">
              Ana yolun dışında kalan, GuitarFlex&apos;e özgü bölümler. İstediğin zaman çalışabilirsin; ana yolun ilerlemesine sayılmaz, ayrı sayılır ({ekGecilen} / {ekAdimlar.length} adım).
            </p>
          </div>
          {ekBolumler.map(bolumGoster)}
        </section>
      ) : null}
        </div>
      </div>
    </div>
  );
}
