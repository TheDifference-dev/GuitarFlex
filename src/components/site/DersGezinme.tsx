"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, ListTree, PlayCircle } from "lucide-react";
import { AILE_ADI, AILE_ADRESI, dersAdresi, type KursAnahat } from "@/lib/katalog";
import { anahatDersleri, dersBitti } from "@/lib/katalog-ilerleme";
import { useProgress } from "@/lib/progress";
import Cekmece from "./Cekmece";
import Kirinti from "./Kirinti";
import UygulamaSimgesi from "./UygulamaSimgesi";
import { dersSimgesi, kursSimgesi } from "@/lib/simge";

type Komsu = { id: string; title: string; adim?: string } | undefined;

/** Pratik kartı teori yolu adımında çözülür; diğer dersler kendi sayfasında */
const adres = (slug: string, d: { id: string; adim?: string }) => {
  if (!d.adim) return dersAdresi(slug, d.id);
  const i = d.adim.indexOf("/");
  return `/teori/yol/${d.adim.slice(0, i)}/${encodeURIComponent(d.adim.slice(i + 1))}`;
};

/**
 * Ders sayfasının üst gezinmesi (GuitarBear'deki ders ekranı gibi): kırıntı, kursta kaçıncı ders olduğu,
 * önceki/sonraki ders ve kursun bütün derslerini gösteren çekmece.
 */
export function DersUstGezinme({ anahat, dersId }: { anahat: KursAnahat; dersId: string }) {
  const p = useProgress();
  const router = useRouter();
  const [acik, setAcik] = useState(false);
  const kapat = useCallback(() => setAcik(false), []);
  const liste = anahatDersleri(anahat);
  const i = liste.findIndex((d) => d.id === dersId);
  const ders = liste[i];
  const onceki: Komsu = liste[i - 1];
  const sonraki: Komsu = liste[i + 1];
  const tamam = liste.filter((d) => dersBitti(p, anahat.slug, d)).length;

  // ← / → kısayolları yalnız Alt ile (oynatıcının ok tuşlarıyla çakışmasın)
  useEffect(() => {
    const tus = (e: KeyboardEvent) => {
      if (!e.altKey || e.ctrlKey || e.metaKey) return;
      const hedef = e.key === "ArrowLeft" ? onceki : e.key === "ArrowRight" ? sonraki : undefined;
      if (hedef) {
        e.preventDefault();
        router.push(adres(anahat.slug, hedef));
      }
    };
    window.addEventListener("keydown", tus);
    return () => window.removeEventListener("keydown", tus);
  }, [onceki, sonraki, anahat.slug, router]);

  if (!ders) return null;
  const okBtn = "flex size-9 shrink-0 items-center justify-center rounded-full border border-ink/10 bg-ink/[0.05] transition hover:bg-ink/10";
  return (
    <>
      <Kirinti
        halkalar={[
          { href: AILE_ADRESI[anahat.aile], label: AILE_ADI[anahat.aile] },
          { href: `/calis/${anahat.slug}`, label: anahat.title },
          { href: `/calis/${anahat.slug}#bolum-${encodeURIComponent(ders.alt)}`, label: `Bölüm ${ders.bolum} · ${ders.alt} ${ders.altAdi}` },
        ]}
      />
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => setAcik(true)} className="flex min-w-0 items-center gap-2 rounded-full border border-ink/10 bg-ink/[0.05] px-3.5 py-2 text-sm font-semibold transition hover:bg-ink/10" aria-haspopup="dialog">
          <ListTree size={16} className="shrink-0 text-accent" />
          <span className="truncate">Ders listesi</span>
          <span className="shrink-0 text-xs font-medium tabular-nums text-muted">
            {i + 1}/{liste.length}
          </span>
        </button>
        <span className="hidden text-xs font-medium tabular-nums text-muted sm:inline">
          Kurs ilerlemesi {tamam}/{liste.length}
        </span>
        <span className="flex-1" />
        {onceki ? (
          <Link href={adres(anahat.slug, onceki)} className={okBtn} title={`Önceki ders: ${onceki.title} (Alt + ←)`} aria-label="Önceki ders">
            <ChevronLeft size={18} />
          </Link>
        ) : (
          <span className={`${okBtn} opacity-40`} aria-hidden>
            <ChevronLeft size={18} />
          </span>
        )}
        {sonraki ? (
          <Link href={adres(anahat.slug, sonraki)} className={okBtn} title={`Sonraki ders: ${sonraki.title} (Alt + →)`} aria-label="Sonraki ders">
            <ChevronRight size={18} />
          </Link>
        ) : (
          <span className={`${okBtn} opacity-40`} aria-hidden>
            <ChevronRight size={18} />
          </span>
        )}
      </div>
      <Cekmece
        acik={acik}
        kapat={kapat}
        baslik={
          <Link href={`/calis/${anahat.slug}`} className="flex items-center gap-2.5 hover:text-accent">
            <UygulamaSimgesi simge={kursSimgesi(anahat.slug)} boyut={32} /> {anahat.title}
          </Link>
        }
      >
        <DersListesi anahat={anahat} dersId={dersId} kapat={kapat} />
      </Cekmece>
    </>
  );
}

/** Çekmecedeki kurs ana hatları: bölümler, alt bölümler ve dersler; bulunulan ders işaretli ve görünür */
function DersListesi({ anahat, dersId, kapat }: { anahat: KursAnahat; dersId: string; kapat: () => void }) {
  const p = useProgress();
  const simdiki = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    simdiki.current?.scrollIntoView({ block: "center" });
  }, []);
  return (
    <div className="space-y-4">
      {anahat.bolumler.map((b) => {
        const dersler = b.altlar.flatMap((a) => a.dersler);
        const biten = dersler.filter((d) => dersBitti(p, anahat.slug, d)).length;
        return (
          <section key={b.number}>
            <p className="flex items-baseline justify-between gap-2 px-1 text-sm font-semibold">
              <span className="min-w-0 truncate">
                Bölüm {b.number} – {b.title}
              </span>
              <span className="shrink-0 text-[11px] font-medium tabular-nums text-muted">
                {biten}/{dersler.length}
              </span>
            </p>
            {b.altlar.map((a) => (
              <div key={a.code} className="mt-1.5">
                <p className="px-1 text-[11px] font-semibold text-muted">
                  {a.code} {a.title}
                </p>
                <ul className="mt-0.5">
                  {a.dersler.map((d) => {
                    const bu = d.id === dersId;
                    const bitti = dersBitti(p, anahat.slug, d);
                    return (
                      <li key={d.id}>
                        <Link
                          ref={bu ? simdiki : undefined}
                          href={adres(anahat.slug, d)}
                          onClick={kapat}
                          aria-current={bu ? "page" : undefined}
                          className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition ${bu ? "bg-accent/15 font-semibold text-accent" : "hover:bg-ink/[0.06]"}`}
                        >
                          <UygulamaSimgesi simge={dersSimgesi(d.tur, anahat.slug)} boyut={24} />
                          <span className="min-w-0 flex-1 truncate">{d.title}</span>
                          {d.adim && <span className="shrink-0 text-[10px] font-semibold text-accent">Pratik</span>}
                          {bitti ? (
                            <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-ok text-ok-ink">
                              <Check size={10} aria-label="Tamamlandı" />
                            </span>
                          ) : bu ? (
                            <PlayCircle size={16} className="shrink-0" aria-hidden />
                          ) : null}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </section>
        );
      })}
    </div>
  );
}

/** Ders sonundaki büyük önceki / sonraki kartları; son derste kursa dönüş */
export function DersAltGezinme({ anahat, dersId }: { anahat: KursAnahat; dersId: string }) {
  const liste = anahatDersleri(anahat);
  const i = liste.findIndex((d) => d.id === dersId);
  const onceki = liste[i - 1];
  const sonraki = liste[i + 1];
  const kart = "card flex min-w-0 flex-1 items-center gap-3 p-4 transition hover:-translate-y-0.5 hover:border-ink/20";
  return (
    <nav className="flex flex-col gap-3 sm:flex-row" aria-label="Dersler arası">
      {onceki ? (
        <Link href={adres(anahat.slug, onceki)} className={kart}>
          <ChevronLeft size={20} className="shrink-0 text-muted" />
          <span className="min-w-0">
            <span className="block text-xs font-medium text-muted">Önceki ders</span>
            <span className="block truncate font-semibold">{onceki.title}</span>
          </span>
        </Link>
      ) : (
        <span className="hidden flex-1 sm:block" />
      )}
      {sonraki ? (
        <Link href={adres(anahat.slug, sonraki)} className={`${kart} justify-end text-right`}>
          <span className="min-w-0">
            <span className="block text-xs font-medium text-muted">Sonraki ders</span>
            <span className="block truncate font-semibold">{sonraki.title}</span>
          </span>
          <ChevronRight size={20} className="shrink-0 text-accent" />
        </Link>
      ) : (
        <Link href={`/calis/${anahat.slug}`} className={`${kart} justify-end text-right`}>
          <span className="min-w-0">
            <span className="block text-xs font-medium text-muted">Kursun son dersi</span>
            <span className="block truncate font-semibold">Kurs sayfasına dön</span>
          </span>
          <ChevronRight size={20} className="shrink-0 text-accent" />
        </Link>
      )}
    </nav>
  );
}
