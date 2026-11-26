"use client";

import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import { Check, ExternalLink, Flame, Trophy } from "lucide-react";
import { dersAdresi, type KursAnahat, type KursKarti } from "@/lib/katalog";
import { anahatDersleri, dersBitti, kartIlerleme, siradakiDers, sonCalisilan } from "@/lib/katalog-ilerleme";
import { gorevler, gunler, seri, type OyunVeri } from "@/lib/oyun";
import { formatDuration, streak, today, totalSeconds, useProgress } from "@/lib/progress";
import { kademeSimgesi, kursSimgesi, yerSimgesi, yolSimgesi, type SimgeRengi } from "@/lib/simge";
import type { Kademe } from "@/content/seviyeler";
import SongsterrBag from "@/components/SongsterrBag";
import { defterIsle, kayitAc, songsterrKaydi, useDefter } from "@/lib/defter";
import { gununTeknikleri, useTeknikSecimi } from "@/lib/gunun-teknikleri";
import { gununRutini } from "@/content/rutin";
import SimgeIzgarasi, { type IzgaraOgesi } from "./SimgeIzgarasi";
import UygulamaSimgesi from "./UygulamaSimgesi";
import IlerlemeHalkasi from "./IlerlemeHalkasi";
import { Eylemler, HapBag, MetinBag } from "./Vitrin";

export type SeviyeBasamagi = { kademe: Kademe; ad: string; etut: string };
export type TeoriYolu = { slug: string; href: string; ad: string; etiket: string; not: string };
export type RehberSarki = { adim: number; title: string; artist: string; kind: string; madalya?: string; url: string; renk: SimgeRengi };
type Sayilar = { elektroKurs: number; elektroDers: number; akustikKurs: number; akustikDers: number; eslik: number };

/** Ana sayfa bandının zemini: açık bantlar her temada açık kalır, koyu bantlar her temada koyu (sıra korunur) */
type BantTonu = "beyaz" | "gri" | "uzay" | "siyah";
const TON: Record<BantTonu, string> = {
  beyaz: "acik-kapsam bg-white",
  gri: "acik-kapsam bg-[#f5f5f7]",
  uzay: "bant-uzaygri",
  siyah: "bant-koyu",
};

/** apple.com bandı: tam genişlik, ortalı kısa büyük başlık, tek cümle, 1–2 bağlantı; altında görsel */
function AnaBant({
  ton,
  baslik,
  alt,
  eylemler,
  children,
  h1 = false,
  className = "",
  id,
}: {
  ton: BantTonu;
  baslik: ReactNode;
  alt?: ReactNode;
  eylemler?: ReactNode;
  children?: ReactNode;
  h1?: boolean;
  className?: string;
  id?: string;
}) {
  const B = h1 ? "h1" : "h2";
  return (
    <section id={id} className={`ana-bant ${TON[ton]} ${className}`}>
      <div className="mx-auto max-w-[980px]">
        <B className="baslik-kahraman text-balance">{baslik}</B>
        {alt && <p className="alt-baslik mx-auto mt-2 max-w-[760px] text-pretty text-muted">{alt}</p>}
        {eylemler && <Eylemler className="mt-6">{eylemler}</Eylemler>}
      </div>
      {children}
    </section>
  );
}

/**
 * Ana sayfa (apple.com düzeni, sade): ince günlük görev şeridi, sonra tam genişlik bantlar sırayla —
 * kapak (siyah) · [kaldığın yerden devam et] · kurslar (beyaz, her kurs kendi renginde) · Seviye Yolu (uzay grisi) ·
 * Şarkılar (açık gri: Rehber Şarkılar ve Tüm Kütüphane) · Teori (siyah) · Elektro / Günlük Rutin (akustik arşivde değilse Akustik) /
 * Doğaçlama / Araçlar döşemeleri (beyaz).
 */
export default function AnaSayfa({
  kartlar,
  anahatlar,
  seviyeler,
  yollar,
  rehber,
  rehberSayisi,
  sayilar,
  sifirdan,
  oyun,
  izgara,
}: {
  izgara: IzgaraOgesi[];
  kartlar: KursKarti[];
  anahatlar: KursAnahat[];
  seviyeler: SeviyeBasamagi[];
  yollar: TeoriYolu[];
  /** Şarkı Rehberi'nin ilk adımları (önizleme) */
  rehber: RehberSarki[];
  rehberSayisi: number;
  sayilar: Sayilar;
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
    return { a, hedef, k: kart.get(a.slug) };
  }, [p, anahat, kart]);

  return (
    <div className="ana-sayfa">
      {/* Günlük görevler ve seri: apple.com'un üstteki ince duyuru şeridi gibi */}
      <GorevSeridi oyun={oyun} />

      {/* Kapak: uzay grisinden beyaza yumuşak geçen bant, kullanıcının kendi çizimi */}
      <AnaBant
        ton="siyah"
        h1
        className="bant-kapak !pb-0"
        baslik="GuitarFlex"
        alt="Gitarı adım adım öğren."
        eylemler={
          <>
            <HapBag href={sifirdan ? "/calis/sifirdan-baslangic-rehberi" : "/rutin"}>{sifirdan ? "Başlayın" : "Günlük Rutin"}</HapBag>
            <HapBag href="/nasil-calismaliyim" ikincil>
              Seviyenizi Bulun
            </HapBag>
          </>
        }
      >
        <Kapak />
      </AnaBant>

      {/* Kaldığın yerden devam et: yalnız ilerleme varsa, küçük kart */}
      {devam?.hedef && (
        <section className="ana-bant acik-kapsam bg-[#f5f5f7] !py-6" aria-label="Kaldığın yerden devam et">
          <Link
            href={dersAdresi(devam.a.slug, devam.hedef.id)}
            data-renk={kursSimgesi(devam.a.slug).renk}
            className="renkli-kart yukselen card mx-auto flex max-w-[720px] items-center gap-4 px-5 py-4 text-left"
          >
            <UygulamaSimgesi simge={kursSimgesi(devam.a.slug)} boyut={60} />
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-semibold text-muted">Kaldığın yerden devam et</span>
              <span className="block truncate text-[19px] font-semibold leading-tight">{devam.hedef.title}</span>
              <span className="block truncate text-sm text-muted">
                {devam.a.title} · Bölüm {devam.hedef.bolum}
              </span>
            </span>
            {devam.k && <IlerlemeHalkasi yuzde={kartIlerleme(p, devam.k).yuzde} boyut={52} />}
            <span className="metin-bag shrink-0 text-[17px]">
              Devam et <span aria-hidden>›</span>
            </span>
          </Link>
        </section>
      )}

      {/* Kurslar: her teknik kendi renginde */}
      <AnaBant
        ton="beyaz"
        baslik="İstediğin teknikten başla."
        alt="Günlük rutin, akorlar, elektro teknikler ve teori yolları."
        eylemler={
          <>
            <MetinBag href="/kurslar" buyuk>
              Tüm kursları görün
            </MetinBag>
            <MetinBag href="/seviye" buyuk>
              Seviye Yolu
            </MetinBag>
          </>
        }
      >
        {izgara.length > 0 && (
          <div className="mx-auto mt-12 max-w-[960px]">
            <SimgeIzgarasi ogeler={izgara} etiket="Kurslar" />
          </div>
        )}
      </AnaBant>

      {/* Seviye Yolu: uzay grisi, basamaklar yeşilden mora */}
      <AnaBant
        ton="uzay"
        baslik="Seviye Yolu"
        alt="Dört seviye, tek yol. Bilgi düzeyine göre öneri, kilit yok."
        eylemler={
          <>
            <HapBag href="/seviye">Daha Fazla Bilgi</HapBag>
            <HapBag href="/nasil-calismaliyim" ikincil>
              Seviyenizi Bulun
            </HapBag>
          </>
        }
      >
        <ol className="mx-auto mt-12 grid w-full max-w-[1024px] grid-cols-4 items-end gap-3">
          {seviyeler.map((s, i) => {
            const simge = kademeSimgesi(s.kademe);
            return (
              <li key={s.kademe}>
                <Link
                  href={`/seviye/${s.kademe}`}
                  data-renk={simge.renk}
                  className="yukselen flex flex-col justify-between rounded-[var(--radius-card)] p-5 text-left text-white"
                  style={{ minHeight: `${10 + i * 3}rem`, background: "linear-gradient(180deg, var(--r1) 0%, var(--r2) 60%)" }}
                >
                  <span className="flex items-center gap-2">
                    <UygulamaSimgesi simge={simge} boyut={32} />
                    <span className="rounded-full bg-black/25 px-2 py-0.5 text-[13px] font-semibold tabular-nums">{i + 1}</span>
                  </span>
                  <span>
                    <span className="block font-[family-name:var(--font-display)] text-[21px] font-semibold leading-tight">{s.ad}</span>
                    <span className="mt-1 block text-[13px] text-white/90">{s.etut}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </AnaBant>

      {/* Şarkılar: Rehber Şarkılar (GuitarBear Şarkı Rehberi sırası) ve Tüm Kütüphane (Songsterr) */}
      <AnaBant
        ton="gri"
        id="sarkilar"
        baslik="Şarkılarla öğren."
        alt={
          <>
            {rehberSayisi ? `${rehberSayisi} adımlık şarkı rehberi` : "Şarkı rehberi"} ve Songsterr&apos;in bütün kütüphanesi. Tablar Songsterr&apos;de açılır.
          </>
        }
        eylemler={
          <>
            <Link href="/sarki-kutuphanesi/rehber" className="btn-primary px-6 py-3 text-[17px]" data-rehber-sarkilar>
              Rehber Şarkılar
            </Link>
            <Link href="/sarki-kutuphanesi" className="btn-secondary px-6 py-3 text-[17px]" data-tum-kutuphane>
              Tüm Kütüphane
            </Link>
          </>
        }
      >
        {rehber.length > 0 && (
          <ol className="mx-auto mt-12 grid max-w-[1024px] grid-cols-4 gap-3 text-left" aria-label="Şarkı Rehberi'nin ilk adımları">
            {rehber.map((s) => (
              <li key={`${s.adim}-${s.title}`}>
                <SongsterrBag q={s.url} onAc={() => defterIsle((v) => kayitAc(v, songsterrKaydi(s.title, s.artist, s.url)))} data-renk={s.renk} className="renkli-kart yukselen card flex h-full flex-col p-5">
                  <span className="flex items-center justify-between">
                    <span className="flex size-9 items-center justify-center rounded-full text-[15px] font-semibold text-white" style={{ background: "var(--r2)" }}>
                      {s.adim}
                    </span>
                    {s.madalya && <span className="rounded-full border border-line px-2.5 py-0.5 text-xs font-semibold text-muted">{s.madalya}</span>}
                  </span>
                  <span className="mt-5 text-[19px] font-semibold leading-tight">{s.title}</span>
                  <span className="mt-1 text-sm text-muted">
                    {s.artist} · {s.kind}
                  </span>
                  <span className="metin-bag mt-auto pt-4 text-[14px]">
                    Songsterr&apos;de aç <ExternalLink size={13} aria-hidden className="self-center" />
                  </span>
                </SongsterrBag>
              </li>
            ))}
          </ol>
        )}
      </AnaBant>

      {/* Teori: siyah */}
      <AnaBant
        ton="siyah"
        baslik="Teoriyi sapta gör."
        alt="Ritim, klavye, kulak, okuma ve armoni: kısa adımlarla pratik yolları."
        eylemler={
          <>
            <HapBag href="/teori">Daha Fazla Bilgi</HapBag>
            <HapBag href="/teori/armoni" ikincil>
              Armoni Dersleri
            </HapBag>
          </>
        }
      >
        {yollar.length > 0 && (
          <ul className="mx-auto mt-12 grid max-w-[1024px] grid-cols-5 gap-3 text-left">
            {yollar.map((y) => (
              <li key={y.href}>
                <Link href={y.href} data-renk={yolSimgesi(y.slug).renk} className="renkli-kart yukselen card flex h-full flex-col gap-4 p-5">
                  <UygulamaSimgesi simge={yolSimgesi(y.slug)} boyut={60} />
                  <span>
                    <span className="block text-[17px] font-semibold leading-tight">{y.ad}</span>
                    <span className="mt-1 block text-[13px] text-muted">{y.not}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </AnaBant>

      {/* Döşemeler: açık gri kareler beyaz zeminde (apple.com'un iki sütunlu ızgarası) */}
      <section className="acik-kapsam ana-doseme bg-white" aria-label="Bölümler">
        <ul className="mx-auto grid max-w-[1440px] grid-cols-2 gap-3 p-3">
          <Doseme
            simge={yerSimgesi("elektro")}
            baslik="Elektro Gitar"
            alt="Akorlar, günlük ısınma ve orta–ileri teknik kursları."
            not={`${sayilar.elektroKurs} kurs · ${sayilar.elektroDers} ders`}
            baglar={[
              { href: "/elektro", label: "Başlayın" },
              { href: "/seviye", label: "Seviye Yolu" },
            ]}
          />
          {sayilar.akustikKurs > 0 ? (
            <Doseme
              simge={yerSimgesi("akustik")}
              baslik="Akustik Gitar"
              alt="Duruş, ilk akorlar, geçişler ve akustik teknikler."
              not={`${sayilar.akustikKurs} kurs · ${sayilar.akustikDers} ders`}
              baglar={[
                { href: "/akustik", label: "Başlayın" },
                { href: "/akustik/sarkilar", label: "Şarkılar" },
              ]}
            />
          ) : (
            <Doseme
              simge={yerSimgesi("rutin")}
              baslik="Günlük Rutin"
              alt="10–15 dakika ısınma, 20 dakika teknik ve bir şarkı. Üç rutin sırayla döner, hepsi metronomla."
              not="Rutin A · B · C"
              baglar={[
                { href: "/rutin", label: "Başlayın" },
                { href: "/calis/kromatik-isinma", label: "Kromatik Isınma" },
              ]}
            />
          )}
          <Doseme
            simge={yerSimgesi("dogaclama")}
            baslik="Doğaçlama"
            alt="Davul, bas ve ritim gitarı eşliğinde önerilen gamlarla solo çal."
            not={`${sayilar.eslik} eşlik kaydı`}
            baglar={[
              { href: "/sarkilar/dogaclama", label: "Çalın" },
              { href: "/oynatici", label: "Tabla Keşfedin" },
            ]}
          />
          <Doseme
            simge={yerSimgesi("metronom")}
            baslik="Araçlar"
            alt="Metronom, nota testi, tab oynatıcı ve kendi dosyaların."
            baglar={[
              { href: "/araclar", label: "Araçlar" },
              { href: "/kutuphane", label: "Tab Oynatıcı" },
            ]}
          />
        </ul>
      </section>
    </div>
  );
}

function Doseme({
  simge,
  baslik,
  alt,
  not,
  baglar,
}: {
  simge: ReturnType<typeof yerSimgesi>;
  baslik: string;
  alt: string;
  not?: string;
  baglar: { href: string; label: string }[];
}) {
  return (
    <li className="flex flex-col items-center rounded-[var(--radius-tile)] bg-[#f5f5f7] px-8 pb-12 pt-14 text-center" data-renk={simge.renk}>
      <h2 className="baslik-orta text-balance">{baslik}</h2>
      <p className="alt-baslik-kucuk mx-auto mt-2 max-w-[30rem] text-pretty text-muted">{alt}</p>
      <Eylemler className="mt-5">
        {baglar.map((b, i) => (
          <HapBag key={b.href + b.label} href={b.href} ikincil={i > 0}>
            {b.label}
          </HapBag>
        ))}
      </Eylemler>
      <span className="mt-10 transition-transform duration-200 hover:scale-105 motion-reduce:transition-none motion-reduce:hover:scale-100">
        <UygulamaSimgesi simge={simge} boyut={152} />
      </span>
      {not && <p className="mt-5 text-sm text-muted">{not}</p>}
    </li>
  );
}

/**
 * Kapak görseli: kullanıcının kendi karakalem çizimi (cizim-spot.png). Çizimin gri zemini kenarlara doğru şeffaflaşıp
 * siyah bandın zeminine karışır; alt kenar dikey maskeyle bandın dibine erir.
 */
function Kapak() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/marka/cizim-spot.png"
      alt="GuitarFlex kapağı: gitar çalan bir figürün karakalem çizimi"
      width={1100}
      height={1100}
      className="mx-auto mt-8 block h-[520px] w-auto max-w-full [mask-image:linear-gradient(to_bottom,#000_72%,transparent)]"
    />
  );
}

/** Bugünkü görevler (içerik paketinde oyun kuralları varsa): Isınma 10 dk · Teknik (3'ten 2) · Şarkı 1; yoksa çalışma özeti.
 *  Tek satırlık şerit, renkli seri / rekor rozetleri. */
function GorevSeridi({ oyun }: { oyun?: OyunVeri }) {
  const p = useProgress();
  const defter = useDefter();
  const secim = useTeknikSecimi();
  const ic = "mx-auto flex max-w-[1100px] flex-wrap items-center justify-center gap-x-6 gap-y-1.5 py-2.5 text-sm";
  const rozet = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[13px] font-semibold text-white";
  // Rozet zemini rengin koyu tonu: beyaz yazı her renkte ≥ 4,5:1
  const zemin = { background: "var(--r2)" };
  if (!oyun)
    return (
      <div className="serit acik-kapsam bant-bas">
        <div className={ic}>
          <span className={rozet} data-renk="turuncu" style={zemin}>
            <Flame size={14} aria-hidden /> {streak(p.sessions)} gün seri
          </span>
          <span className="text-muted">Toplam {formatDuration(totalSeconds(p.sessions))}</span>
          <MetinBag href="/profil" className="!text-sm">
            Profil
          </MetinBag>
        </div>
      </div>
    );
  const bugun = today();
  const gv = gorevler(gunler(p, defter).get(bugun), oyun.gorevler, gununTeknikleri(secim, bugun));
  const s = seri(p, oyun.gorevler, defter, (t) => gununTeknikleri(secim, t));
  return (
    <div className="serit acik-kapsam bant-bas" role="region" aria-label="Günlük görevler">
      <div className={ic}>
        <span className="font-semibold">Bugün</span>
        <Link href="/rutin" className="rounded-full border border-ink/15 px-2.5 py-0.5 text-[13px] font-semibold transition hover:border-ink/30" data-gunun-rutini>
          Rutin {gununRutini(bugun).gun}
        </Link>
        {gv.map((g) => (
          <Link key={g.ad} href={g.href} className="flex items-center gap-2 rounded-full transition hover:underline hover:underline-offset-2">
            <span className={`flex size-4 items-center justify-center rounded-full ${g.tamam ? "bg-ok text-ok-ink" : "border border-ink/25"}`} aria-hidden>
              {g.tamam && <Check size={10} strokeWidth={3} />}
            </span>
            {g.ad}
            <span className="tabular-nums text-muted">
              {Math.min(g.deger, g.hedef)}/{g.hedef}{g.birim ? ` ${g.birim}` : ""}
            </span>
            <span className="sr-only">{g.tamam ? "(tamamlandı)" : ""}</span>
          </Link>
        ))}
        <span className={rozet} data-renk="turuncu" style={zemin}>
          <Flame size={14} aria-hidden /> {s.seri} gün seri
        </span>
        <span className={rozet} data-renk="sari" style={zemin}>
          <Trophy size={13} aria-hidden /> Rekor {s.rekor}
        </span>
        <MetinBag href="/profil" className="!text-sm">
          Profil
        </MetinBag>
      </div>
    </div>
  );
}
