"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Check, Flame, Guitar, Mic2, Music2, Music4, Palette, Timer, Trophy } from "lucide-react";
import { dersAdresi, type KursAnahat, type KursKarti } from "@/lib/katalog";
import { anahatDersleri, dersBitti, kartIlerleme, siradakiDers, sonCalisilan } from "@/lib/katalog-ilerleme";
import { gorevler, gunler, seri, type OyunVeri } from "@/lib/oyun";
import { formatDuration, streak, today, totalSeconds, useProgress } from "@/lib/progress";
import type { Level } from "@/content/types";
import KursKartiKucuk from "./KursKartiKucuk";
import { Bant, BolumBasi, Eylemler, HapBag, MetinBag } from "./Vitrin";

export type Doseme = {
  baslik: string;
  metin: string;
  not?: string;
  ikon: "elektro" | "akustik" | "stil" | "muzisyen" | "dogaclama" | "araclar";
  baglar: { href: string; label: string }[];
};
export type OneCikanSarki = { slug: string; title: string; genre: string; bpm: number; key: string };
export type SeviyeBasamagi = { level: Level; ad: string; etut: string };
export type TeoriYolu = { href: string; ad: string; etiket: string; not: string };

const IKON = { elektro: Guitar, akustik: Music2, stil: Palette, muzisyen: Music4, dogaclama: Mic2, araclar: Timer } as const;

/**
 * Ana sayfa (apple.com ana sayfasından ilhamla): üstte günlük görev şeridi, ardından üst üste büyük bantlar —
 * kaldığın yerden devam et (kapak), Seviye Yolu, Şarkı Kütüphanesi, teori yolları — ve iki sütunlu döşemeler.
 */
export default function AnaSayfa({
  kartlar,
  anahatlar,
  dosemeler,
  oneCikan,
  sarkilar,
  sarkiSayisi,
  seviyeler,
  yollar,
  armoni,
  sifirdan,
  oyun,
}: {
  kartlar: KursKarti[];
  anahatlar: KursAnahat[];
  dosemeler: Doseme[];
  /** Öne çıkan kursların slug'ları (sırayla) */
  oneCikan: string[];
  sarkilar: OneCikanSarki[];
  sarkiSayisi: number;
  seviyeler: SeviyeBasamagi[];
  yollar: TeoriYolu[];
  /** Armoni kursu pakette var mı */
  armoni: boolean;
  /** Sıfırdan başlangıç rehberi pakette var mı */
  sifirdan: boolean;
  oyun?: OyunVeri;
}) {
  const p = useProgress();
  const anahat = useMemo(() => new Map(anahatlar.map((a) => [a.slug, a])), [anahatlar]);
  const kart = useMemo(() => new Map(kartlar.map((k) => [k.slug, k])), [kartlar]);

  // Kaldığın yer: son çalışılan ders; bitmişse kursta sıradaki ders
  const devam = useMemo(() => {
    const son = sonCalisilan(p, (slug) => anahat.has(slug));
    if (!son) return null;
    const a = anahat.get(son.slug)!;
    const liste = anahatDersleri(a);
    const simdiki = liste.find((d) => d.id === son.id);
    const hedef = simdiki && !dersBitti(p, a.slug, simdiki) ? simdiki : siradakiDers(p, a, son.id);
    return { a, hedef, bitti: !hedef, k: kart.get(a.slug) };
  }, [p, anahat, kart]);

  const surenler = kartlar.filter((k) => {
    const { tamam, toplam } = kartIlerleme(p, k);
    return tamam > 0 && tamam < toplam && k.slug !== devam?.a.slug;
  });
  const oneCikanKartlar = oneCikan.map((s) => kart.get(s)).filter((k): k is KursKarti => !!k);
  const altKurslar = surenler.length ? surenler.slice(0, 6) : oneCikanKartlar;

  return (
    <div>
      {/* Günlük görevler ve seri: apple.com'un üstteki ince duyuru şeridi gibi */}
      <GorevSeridi oyun={oyun} />

      {/* (a) Kapak + kaldığın yerden devam et */}
      <Bant ton="uzay" className="pb-0 pt-14 sm:pt-16">
        <div className="mx-auto max-w-[980px] text-center">
          {devam ? (
            <>
              <p className="text-[19px] font-semibold text-accent">Kaldığın yerden devam et</p>
              <h1 className="baslik-dev mt-2 text-balance">{devam.bitti ? "Kursu bitirdin!" : devam.hedef!.title}</h1>
              <p className="alt-baslik mx-auto mt-4 max-w-[760px] text-pretty text-muted">
                {devam.a.title}
                {devam.hedef && ` · Bölüm ${devam.hedef.bolum} · ${devam.hedef.alt} ${devam.hedef.altAdi}`}
              </p>
              <Eylemler>
                {devam.hedef ? <HapBag href={dersAdresi(devam.a.slug, devam.hedef.id)}>Derse devam et</HapBag> : <HapBag href="/kurslar">Yeni bir kurs seç</HapBag>}
                <MetinBag href={`/calis/${devam.a.slug}`} buyuk>
                  Kursa git
                </MetinBag>
              </Eylemler>
              {devam.k && <IlerlemeCubugu {...kartIlerleme(p, devam.k)} />}
            </>
          ) : (
            <>
              <p className="text-[19px] font-semibold text-accent">GuitarFlex</p>
              <h1 className="baslik-dev mt-2 text-balance">Gitarı adım adım öğren.</h1>
              <p className="alt-baslik mx-auto mt-4 max-w-[760px] text-pretty text-muted">
                Kolaydan zora teknikler, tab oynatıcı, teori ve çalışma takibi. Hiçbir ders kilitli değil.
              </p>
              <Eylemler>
                <HapBag href="/nasil-calismaliyim">Seviyemi seç</HapBag>
                <MetinBag href={sifirdan ? "/calis/sifirdan-baslangic-rehberi" : "/kurslar"} buyuk>
                  Sıfırdan başla
                </MetinBag>
              </Eylemler>
            </>
          )}
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/marka/kapak.png"
          alt="GuitarFlex kapağı: spot ışığı altında elektro gitar çalan bir figür"
          width={1600}
          height={900}
          className="mx-auto mt-12 block h-auto w-full max-w-[1100px] rounded-t-[var(--radius-tile)] object-cover sm:mt-14"
        />
      </Bant>

      {/* (b) Seviye Yolu */}
      <Bant ton="gri">
        <BolumBasi baslik="Seviye Yolu" alt="Beş seviye, tek yol. Teknik, klavye, ritim ve teoriyi birlikte çalış; kilit yok.">
          <HapBag href="/seviye">Seviye Yolu&apos;na git</HapBag>
          <MetinBag href="/nasil-calismaliyim" buyuk>
            Seviyeni bul
          </MetinBag>
        </BolumBasi>
        <ol className="mx-auto grid max-w-[1100px] grid-cols-5 items-end gap-3">
          {seviyeler.map((s, i) => (
            <li key={s.level}>
              <Link
                href={`/seviye/${s.level}`}
                className="group flex flex-col justify-between rounded-[var(--radius-card)] p-4 text-left text-white transition hover:brightness-110 sm:p-5"
                style={{
                  minHeight: `${8.5 + i * 2.25}rem`,
                  background: `linear-gradient(170deg, color-mix(in srgb, #2a4fbf ${100 - i * 15}%, #0b1f4f), #0b1f4f)`,
                }}
              >
                <span className="text-[13px] font-semibold tabular-nums text-white/80">{s.level}</span>
                <span>
                  <span className="block text-[19px] font-semibold leading-tight tracking-tight sm:text-[21px]">{s.ad}</span>
                  <span className="mt-1 block text-xs text-white/80">{s.etut}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </Bant>

      {/* (c) Şarkı Kütüphanesi: lacivert vitrin bandı */}
      <Bant ton="koyu">
        <BolumBasi baslik="Şarkı Kütüphanesi" alt={`${sarkiSayisi ? `${sarkiSayisi} çok track'li parça. ` : ""}Kurşun, ritim, bas ve davul; mikserle aç, kapa, yavaşlat.`}>
          <HapBag href="/kutuphane">Kütüphaneyi aç</HapBag>
          <MetinBag href="/sarkilar" buyuk>
            Popüler şarkılar
          </MetinBag>
        </BolumBasi>
        {sarkilar.length > 0 && (
          <ul className="mx-auto grid max-w-[1100px] grid-cols-2 gap-3 lg:grid-cols-4">
            {sarkilar.map((s, i) => (
              <li key={s.slug}>
                <Link href={`/kutuphane/${s.slug}`} className="group flex h-full flex-col rounded-[var(--radius-card)] bg-panel p-5 transition hover:bg-panel-2">
                  <Dalga tohum={i} />
                  <span className="mt-6 text-xs font-semibold text-muted">{s.genre}</span>
                  <span className="mt-1 text-[19px] font-semibold leading-tight tracking-tight">{s.title}</span>
                  <span className="mt-1 text-sm text-muted">
                    {s.key} · {s.bpm} BPM
                  </span>
                  <span className="metin-bag mt-auto pt-4 text-[15px] group-hover:underline">
                    Çal <span aria-hidden>›</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Bant>

      {/* (d) Teori yolları */}
      <Bant ton="gri">
        <BolumBasi baslik="Teoriyi sapta gör." alt="Ritim, klavye, kulak ve okuma: kısa adımlarla ilerleyen pratik yolları.">
          <HapBag href="/teori">Teoriye başla</HapBag>
          {armoni && (
            <MetinBag href="/calis/armoni" buyuk>
              Armoni dersleri
            </MetinBag>
          )}
        </BolumBasi>
        {yollar.length > 0 && (
          <ul className={`mx-auto grid max-w-[1100px] gap-3 sm:grid-cols-2 ${yollar.length >= 5 ? "lg:grid-cols-5" : "lg:grid-cols-4"}`}>
            {yollar.map((y) => (
              <li key={y.href}>
                <Link href={y.href} className="group flex h-full flex-col rounded-[var(--radius-card)] bg-panel p-5 transition hover:shadow-[var(--shadow-pop)]">
                  <span className="text-xs font-semibold text-muted">{y.etiket}</span>
                  <span className="mt-1 text-[19px] font-semibold leading-tight tracking-tight">{y.ad}</span>
                  <span className="mt-1 text-sm text-muted">{y.not}</span>
                  <span className="metin-bag mt-auto pt-4 text-[15px] group-hover:underline">
                    Başla <span aria-hidden>›</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Bant>

      {/* İki sütunlu döşemeler */}
      <Bant ton="beyaz" className="!py-3">
        <ul className="grid gap-3 md:grid-cols-2">
          {dosemeler.map((d) => {
            const Ikon = IKON[d.ikon];
            return (
              <li key={d.baslik} className="doseme min-h-[30rem] px-8 pb-12 pt-14">
                <h2 className="baslik-orta">{d.baslik}</h2>
                <p className="mt-3 max-w-md text-pretty text-[19px] leading-snug text-muted">{d.metin}</p>
                <Eylemler className="mt-4">
                  {d.baglar.map((b) => (
                    <MetinBag key={b.href} href={b.href} buyuk>
                      {b.label}
                    </MetinBag>
                  ))}
                </Eylemler>
                <span className="simge-kutu mt-auto size-28 rounded-[1.75rem]">
                  <Ikon size={52} strokeWidth={1.6} aria-hidden />
                </span>
                {d.not && <p className="mt-4 text-sm text-muted">{d.not}</p>}
              </li>
            );
          })}
        </ul>
      </Bant>

      {/* Devam edilen ya da öne çıkan kurslar */}
      {altKurslar.length > 0 && (
        <Bant ton="gri" className="mt-12">
          <BolumBasi baslik={surenler.length ? "Devam ettiğin kurslar" : "Öne çıkan kurslar"}>
            <MetinBag href="/kurslar" buyuk>
              Tüm kurslar
            </MetinBag>
          </BolumBasi>
          <div className="mx-auto grid max-w-[1100px] gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {altKurslar.map((k) => (
              <KursKartiKucuk key={k.slug} k={k} p={p} />
            ))}
          </div>
        </Bant>
      )}
    </div>
  );
}

function IlerlemeCubugu({ tamam, toplam, yuzde }: { tamam: number; toplam: number; yuzde: number }) {
  return (
    <div className="mx-auto mt-8 max-w-sm">
      <div className="h-1 overflow-hidden rounded-full bg-ink/10" role="progressbar" aria-valuenow={yuzde} aria-valuemin={0} aria-valuemax={100} aria-label="Kurs ilerlemesi">
        <div className="bar-fill h-full rounded-full" style={{ width: `${yuzde}%` }} />
      </div>
      <p className="mt-2 text-xs tabular-nums text-muted">
        %{yuzde} · {tamam}/{toplam} ders · {toplam - tamam} kaldı
      </p>
    </div>
  );
}

/** Şarkı döşemesindeki küçük ses dalgası (süs) */
function Dalga({ tohum }: { tohum: number }) {
  const boylar = Array.from({ length: 18 }, (_, i) => 0.25 + 0.75 * Math.abs(Math.sin((i + 1) * (1.7 + tohum * 0.6))));
  return (
    <span aria-hidden className="flex h-10 items-end gap-[3px]">
      {boylar.map((b, i) => (
        <span key={i} className="w-[3px] rounded-full bg-accent/80" style={{ height: `${Math.round(b * 100)}%` }} />
      ))}
    </span>
  );
}

/** Bugünkü görevler (içerik paketinde oyun kuralları varsa) ya da çalışma özeti: tek satırlık şerit */
function GorevSeridi({ oyun }: { oyun?: OyunVeri }) {
  const p = useProgress();
  const ic = "mx-auto flex max-w-[1100px] flex-wrap items-center justify-center gap-x-6 gap-y-1.5 py-3 text-sm";
  if (!oyun)
    return (
      <div className="serit bant-bas">
        <div className={ic}>
          <span className="flex items-center gap-1.5">
            <Flame size={15} className="text-accent" aria-hidden /> {streak(p.sessions)} gün seri
          </span>
          <span className="text-muted">Toplam {formatDuration(totalSeconds(p.sessions))}</span>
          <MetinBag href="/profil" className="!text-sm">
            Profil
          </MetinBag>
        </div>
      </div>
    );
  const gv = gorevler(gunler(p).get(today()), oyun.gorevler);
  const s = seri(p, oyun.gorevler);
  return (
    <div className="serit bant-bas" role="region" aria-label="Günlük görevler">
      <div className={ic}>
        <span className="font-semibold">Bugün</span>
        {gv.map((g) => (
          <Link key={g.ad} href={g.href} className="flex items-center gap-2 rounded-full transition hover:text-accent">
            <span className={`flex size-4 items-center justify-center rounded-full ${g.tamam ? "bg-ok text-ok-ink" : "border border-ink/25"}`} aria-hidden>
              {g.tamam && <Check size={10} strokeWidth={3} />}
            </span>
            {g.ad}
            <span className="tabular-nums text-muted">
              {Math.min(g.deger, g.hedef)}/{g.hedef} {g.birim}
            </span>
            <span className="sr-only">{g.tamam ? "(tamamlandı)" : ""}</span>
          </Link>
        ))}
        <span className="flex items-center gap-1.5 font-semibold">
          <Flame size={15} className="text-accent" aria-hidden /> {s.seri} gün seri
        </span>
        <span className="flex items-center gap-1.5 text-muted">
          <Trophy size={14} aria-hidden /> Rekor {s.rekor}
        </span>
        <MetinBag href="/profil" className="!text-sm">
          Profil
        </MetinBag>
      </div>
    </div>
  );
}
