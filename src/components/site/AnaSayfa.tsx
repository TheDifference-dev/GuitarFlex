"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Check, Flame, Trophy } from "lucide-react";
import { dersAdresi, type KursAnahat, type KursKarti } from "@/lib/katalog";
import { anahatDersleri, dersBitti, kartIlerleme, siradakiDers, sonCalisilan } from "@/lib/katalog-ilerleme";
import { gorevler, gunler, seri, type OyunVeri } from "@/lib/oyun";
import { formatDuration, streak, today, totalSeconds, useProgress } from "@/lib/progress";
import type { Level } from "@/content/types";
import { seviyeSimgesi, turSimgesi, yolSimgesi, type SimgeTanim } from "@/lib/simge";
import KursKartiKucuk from "./KursKartiKucuk";
import SimgeIzgarasi, { type IzgaraOgesi } from "./SimgeIzgarasi";
import UygulamaSimgesi from "./UygulamaSimgesi";
import { Bant, BolumBasi, DosemeAna, HapBag, Kahraman, MetinBag } from "./Vitrin";

export type Doseme = {
  baslik: string;
  metin: string;
  not?: string;
  /** Görsel alanındaki uygulama simgesi */
  simge: SimgeTanim;
  /** Döşemenin zemini: siyah ya da açık gri */
  ton: "koyu" | "gri";
  /** İlki birincil, ikincisi ikincil hap düğme */
  baglar: { href: string; label: string }[];
  /** Görsel alanı: simge yerine teori yolları listesi ya da CAGED şekilleri */
  gorsel?: "yollar" | "caged";
};
export type OneCikanSarki = { slug: string; title: string; genre: string; bpm: number; key: string };
export type SeviyeBasamagi = { level: Level; ad: string; etut: string };
export type TeoriYolu = { slug: string; href: string; ad: string; etiket: string; not: string };

/** Seviye Yolu basamakları: açık uzay grisinden siyaha (beyaz yazı her basamakta AA) */
/** Seviye basamakları: uzay grisinden laciverde koyulaşır (beyaz yazı her basamakta ≥ 7:1) */
const BASAMAK = ["#636366", "#4a4d5c", "#323d5e", "#1d3266", "#0a2a6b"];

/**
 * Ana sayfa (apple.com ana sayfasının düzeniyle): üstte günlük görev şeridi, ilk kahraman bandının altında simge ızgarası
 * (kurslara hızlı erişim), ardından aralarında 12 px boşluk olan üç kahraman bandı — kaldığın yerden devam et / kapak (siyah), Seviye Yolu (açık gri), Şarkı Kütüphanesi (siyah) —
 * ve iki sütunlu döşemeler (teori yolları, elektro, akustik, stiller, müzisyenlik, doğaçlama, araçlar, CAGED).
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
  sifirdan,
  oyun,
  izgara,
}: {
  /** Simge ızgarası: kurslar, teori yolları ve araçlar */
  izgara: IzgaraOgesi[];
  kartlar: KursKarti[];
  anahatlar: KursAnahat[];
  dosemeler: Doseme[];
  /** Öne çıkan kursların slug'ları (sırayla) */
  oneCikan: string[];
  sarkilar: OneCikanSarki[];
  sarkiSayisi: number;
  seviyeler: SeviyeBasamagi[];
  yollar: TeoriYolu[];
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

      {/* (a) Kaldığın yerden devam et ya da GuitarFlex kapağı — siyah */}
      {devam ? (
        <Kahraman
          ton="koyu"
          baslikDuzey="h1"
          ust="Kaldığın yerden devam et"
          baslik={devam.bitti ? "Kursu bitirdin!" : devam.hedef!.title}
          alt={
            <>
              {devam.a.title}
              {devam.hedef && <span className="block text-[21px] leading-snug text-muted">{`Bölüm ${devam.hedef.bolum} · ${devam.hedef.alt} ${devam.hedef.altAdi}`}</span>}
            </>
          }
          eylemler={
            <>
              {devam.hedef ? <HapBag href={dersAdresi(devam.a.slug, devam.hedef.id)}>Derse Devam Edin</HapBag> : <HapBag href="/kurslar">Yeni Kurs Seçin</HapBag>}
              <HapBag href={`/calis/${devam.a.slug}`} ikincil>
                Kursa Gidin
              </HapBag>
            </>
          }
        >
          {devam.k && <IlerlemeCubugu {...kartIlerleme(p, devam.k)} />}
          <Kapak kucuk />
        </Kahraman>
      ) : (
        <Kahraman
          ton="koyu"
          baslikDuzey="h1"
          baslik="GuitarFlex"
          alt="Gitarı adım adım öğren. Hiçbir ders kilitli değil."
          eylemler={
            <>
              <HapBag href={sifirdan ? "/calis/sifirdan-baslangic-rehberi" : "/kurslar"}>Başlayın</HapBag>
              <HapBag href="/nasil-calismaliyim" ikincil>
                Seviyenizi Bulun
              </HapBag>
            </>
          }
        >
          <Kapak />
        </Kahraman>
      )}

      {/* Simge ızgarası: bütün kurslar, teori yolları ve araçlar (ana ekran gibi) */}
      {izgara.length > 0 && (
        <Bant ton="beyaz" className="!py-14">
          <SimgeIzgarasi ogeler={izgara} etiket="Kurslar ve araçlar" />
        </Bant>
      )}

      {/* (b) Seviye Yolu — açık gri */}
      <Kahraman
        className="!mt-0"
        ton="gri"
        baslik="Seviye Yolu"
        alt="Beş seviye, tek yol. Kilit yok."
        eylemler={
          <>
            <HapBag href="/seviye">Daha Fazla Bilgi</HapBag>
            <HapBag href="/nasil-calismaliyim" ikincil>
              Seviyenizi Bulun
            </HapBag>
          </>
        }
      >
        <ol className="mb-14 grid w-full max-w-[1024px] grid-cols-5 items-end gap-3">
          {seviyeler.map((s, i) => (
            <li key={s.level}>
              <Link
                href={`/seviye/${s.level}`}
                className="group flex flex-col justify-between rounded-[var(--radius-card)] p-5 text-left text-white shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)] transition hover:brightness-125"
                style={{ minHeight: `${11 + i * 2.75}rem`, background: BASAMAK[i] }}
              >
                <span className="flex items-center gap-2 text-[13px] font-semibold tabular-nums text-white/85">
                  <UygulamaSimgesi simge={seviyeSimgesi(s.level)} boyut={32} /> {s.level}
                </span>
                <span>
                  <span className="block font-[family-name:var(--font-display)] text-[21px] font-semibold leading-tight">{s.ad}</span>
                  <span className="mt-1 block text-xs text-white/85">{s.etut}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </Kahraman>

      {/* (c) Şarkı Kütüphanesi — siyah */}
      <Kahraman
        ton="koyu"
        baslik="Şarkı Kütüphanesi"
        alt={sarkiSayisi ? `${sarkiSayisi} çok track'li parça. Aç, kapa, yavaşlat.` : "Kurşun, ritim, bas ve davul; mikserle aç, kapa, yavaşlat."}
        eylemler={
          <>
            <HapBag href="/kutuphane">Kütüphaneyi Açın</HapBag>
            <HapBag href="/sarkilar" ikincil>
              Popüler Şarkılar
            </HapBag>
          </>
        }
      >
        {sarkilar.length > 0 && (
          <ul className="mb-14 grid w-full max-w-[1024px] grid-cols-4 gap-3 text-left">
            {sarkilar.map((s) => (
              <li key={s.slug}>
                <Link href={`/kutuphane/${s.slug}`} className="group flex h-full flex-col rounded-[var(--radius-card)] bg-panel p-5 transition hover:bg-panel-2">
                  <UygulamaSimgesi simge={turSimgesi(s.genre)} boyut={60} />
                  <span className="mt-6 text-xs font-semibold text-muted">{s.genre}</span>
                  <span className="mt-1 text-[19px] font-semibold leading-tight">{s.title}</span>
                  <span className="mt-1 text-sm text-muted">
                    {s.key} · {s.bpm} BPM
                  </span>
                  <span className="metin-bag mt-auto pt-4 text-[14px] group-hover:underline">
                    Çalın <span aria-hidden>›</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Kahraman>

      {/* İki sütunlu döşemeler: 12 px kenar ve ara boşluk */}
      <ul className="doseme-izgara">
        {dosemeler.map((d) => (
          <DosemeAna
            key={d.baslik}
            ton={d.ton}
            baslik={d.baslik}
            alt={d.metin}
            eylemler={d.baglar.map((b, i) => (
              <HapBag key={b.href + b.label} href={b.href} ikincil={i > 0}>
                {b.label}
              </HapBag>
            ))}
          >
            <DosemeGorseli d={d} yollar={yollar} />
          </DosemeAna>
        ))}
      </ul>

      {/* Devam edilen ya da öne çıkan kurslar */}
      {altKurslar.length > 0 && (
        <Bant ton="beyaz" className="!pt-14">
          <BolumBasi baslik={surenler.length ? "Devam ettiğin kurslar" : "Öne çıkan kurslar"}>
            <MetinBag href="/kurslar" buyuk>
              Tüm kursları görün
            </MetinBag>
          </BolumBasi>
          <div className="mx-auto grid max-w-[1024px] grid-cols-3 gap-3">
            {altKurslar.map((k) => (
              <KursKartiKucuk key={k.slug} k={k} p={p} />
            ))}
          </div>
        </Bant>
      )}
    </div>
  );
}

/**
 * Kapak görseli: çerçevesiz çizim (cizim-spot.png). Çizimin kâğıt zemini spot ışığı gibi merkezde açık gri, kenarlara doğru
 * şeffaflaşıp siyahtan laciverte geçen bandın zeminine karışır (kart, kare ya da keskin kenar yok). Alt kenar ayrıca
 * dikey maskeyle bandın dibine erir.
 */
function Kapak({ kucuk = false }: { kucuk?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/marka/cizim-spot.png"
      alt="GuitarFlex kapağı: gitar çalan bir figürün karakalem çizimi"
      width={1024}
      height={1024}
      className={`mt-6 block w-auto max-w-full [mask-image:linear-gradient(to_bottom,#000_70%,transparent)] ${kucuk ? "h-[360px]" : "h-[460px]"}`}
    />
  );
}

/** Döşemenin alt yarısındaki görsel: teori yolları, CAGED şekilleri ya da simge */
function DosemeGorseli({ d, yollar }: { d: Doseme; yollar: TeoriYolu[] }) {
  if (d.gorsel === "yollar" && yollar.length)
    return (
      <ul className="mb-12 grid w-full max-w-[560px] grid-cols-2 gap-2.5 text-left">
        {yollar.map((y) => (
          <li key={y.href} className={yollar.length % 2 && y === yollar[yollar.length - 1] ? "col-span-2" : ""}>
            <Link href={y.href} className="group flex h-full items-center justify-between gap-3 rounded-[var(--radius-card)] bg-panel px-4 py-3 transition hover:bg-panel-2">
              <UygulamaSimgesi simge={yolSimgesi(y.slug)} boyut={44} />
              <span className="min-w-0 flex-1">
                <span className="block text-[17px] font-semibold leading-tight">{y.ad}</span>
                <span className="block text-xs text-muted">{y.not}</span>
              </span>
              <span aria-hidden className="text-muted transition group-hover:translate-x-0.5 group-hover:text-text">
                ›
              </span>
            </Link>
          </li>
        ))}
      </ul>
    );
  if (d.gorsel === "caged")
    return (
      <div className="mb-12 flex flex-col items-center">
        <ol aria-label="CAGED şekilleri" className="flex gap-3">
          {["C", "A", "G", "E", "D"].map((h, i) => (
            <li
              key={h}
              className={`flex size-[88px] items-center justify-center rounded-full font-[family-name:var(--font-display)] text-[40px] font-semibold ${i % 2 ? "bg-[var(--nota-ikincil)] text-[var(--bg)]" : "bg-accent text-accent-ink"}`}
            >
              {h}
            </li>
          ))}
        </ol>
        {d.not && <p className="mt-6 text-sm text-muted">{d.not}</p>}
      </div>
    );
  return (
    <div className="mb-12 flex flex-col items-center">
      <UygulamaSimgesi simge={d.simge} boyut={152} />
      {d.not && <p className="mt-5 text-sm text-muted">{d.not}</p>}
    </div>
  );
}

function IlerlemeCubugu({ tamam, toplam, yuzde }: { tamam: number; toplam: number; yuzde: number }) {
  return (
    <div className="mx-auto mt-7 w-full max-w-sm">
      <div className="h-1 overflow-hidden rounded-full bg-ink/10" role="progressbar" aria-valuenow={yuzde} aria-valuemin={0} aria-valuemax={100} aria-label="Kurs ilerlemesi">
        <div className="bar-fill h-full rounded-full" style={{ width: `${yuzde}%` }} />
      </div>
      <p className="mt-2 text-xs tabular-nums text-muted">
        %{yuzde} · {tamam}/{toplam} ders · {toplam - tamam} kaldı
      </p>
    </div>
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
          <Link key={g.ad} href={g.href} className="flex items-center gap-2 rounded-full transition hover:underline hover:underline-offset-2">
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
