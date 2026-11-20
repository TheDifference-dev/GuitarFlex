"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, BookOpen, Check, Compass, Flame, Guitar, Library, Map as MapIcon, Music2, PlayCircle, Star, Trophy } from "lucide-react";
import { dersAdresi, type KursAnahat, type KursKarti } from "@/lib/katalog";
import { anahatDersleri, dersBitti, kartIlerleme, siradakiDers, sonCalisilan } from "@/lib/katalog-ilerleme";
import { gorevler, gunler, seri, type OyunVeri } from "@/lib/oyun";
import { formatDuration, streak, today, totalSeconds, useProgress } from "@/lib/progress";
import KursKartiKucuk from "./KursKartiKucuk";

export type Kategori = { href: string; ad: string; metin: string; sayi: string; ikon: "elektro" | "akustik" | "sarki" | "kutuphane" | "teori" | "seviye" };
export type OneCikanSarki = { slug: string; title: string; genre: string; bpm: number; key: string };

const IKON = { elektro: Guitar, akustik: Music2, sarki: Star, kutuphane: Library, teori: BookOpen, seviye: MapIcon } as const;

/**
 * Ana sayfa (GuitarBear'in giriş sonrası düzenine benzer): kaldığın yerden devam et, günlük görevler,
 * "Gitarda nasıl çalışmalıyım?" yönlendirmesi, kategori kartları, devam eden kurslar ve öne çıkanlar.
 */
export default function AnaSayfa({
  kartlar,
  anahatlar,
  kategoriler,
  oneCikan,
  sarkilar,
  oyun,
}: {
  kartlar: KursKarti[];
  anahatlar: KursAnahat[];
  kategoriler: Kategori[];
  /** Öne çıkan kursların slug'ları (sırayla) */
  oneCikan: string[];
  sarkilar: OneCikanSarki[];
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

  return (
    <div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Kaldığın yerden devam et */}
        <div className="card relative overflow-hidden p-6 sm:p-8">
          <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-[radial-gradient(circle,rgb(255_55_95/0.22),transparent_65%)]" />
          {devam ? (
            <>
              <p className="eyebrow">Kaldığın yerden devam et</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{devam.bitti ? "Kursu bitirdin!" : devam.hedef!.title}</h1>
              <p className="mt-2 text-muted">
                <Link href={`/calis/${devam.a.slug}`} className="font-semibold text-text hover:text-accent">
                  {devam.a.title}
                </Link>
                {devam.hedef && (
                  <>
                    {" "}
                    · Bölüm {devam.hedef.bolum} · {devam.hedef.alt} {devam.hedef.altAdi}
                  </>
                )}
              </p>
              {devam.k && <IlerlemeCubugu {...kartIlerleme(p, devam.k)} />}
              <div className="mt-6 flex flex-wrap gap-3">
                {devam.hedef ? (
                  <Link href={dersAdresi(devam.a.slug, devam.hedef.id)} className="btn-grad px-6 py-3 text-[15px]">
                    <PlayCircle size={17} /> Derse devam et
                  </Link>
                ) : (
                  <Link href="/kurslar" className="btn-grad px-6 py-3 text-[15px]">
                    Yeni bir kurs seç <ArrowRight size={16} />
                  </Link>
                )}
                <Link href={`/calis/${devam.a.slug}`} className="btn-soft px-5 py-3 text-[15px]">
                  Kursa git
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="eyebrow">Hoş geldin</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Bugün gitarla ne çalışalım?</h1>
              <p className="mt-2 max-w-xl text-muted">Seviyeni söyle, sana uygun yolu önerelim ya da bir başlangıç rehberiyle hemen başla. Hiçbir ders kilitli değil.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/nasil-calismaliyim" className="btn-grad px-6 py-3 text-[15px]">
                  <Compass size={17} /> Seviyemi seç
                </Link>
                <Link href={kart.has("sifirdan-baslangic-rehberi") ? "/calis/sifirdan-baslangic-rehberi" : "/kurslar"} className="btn-soft px-5 py-3 text-[15px]">
                  Sıfırdan başla
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Bugün: görevler ve seri */}
        <Bugun oyun={oyun} />
      </section>

      {/* Gitarda Nasıl Çalışmalıyım? */}
      <Link href="/nasil-calismaliyim" className="card group flex items-center gap-4 p-4 transition hover:border-white/15 sm:p-5">
        <span className="ring-grad flex size-11 shrink-0">
          <span className="flex size-full items-center justify-center rounded-full bg-panel">
            <Compass size={19} />
          </span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">Gitarda Nasıl Çalışmalıyım?</span>
          <span className="block text-sm text-muted">Seviyeni seç; elektro ya da akustikte sana uygun çalışma yolunu önerelim.</span>
        </span>
        <ArrowRight size={18} className="shrink-0 text-accent transition group-hover:translate-x-0.5" />
      </Link>

      {/* Kategoriler */}
      <section className="space-y-4">
        <BolumBasligi baslik="Ne çalışmak istersin?" href="/kurslar" bag="Tüm kurslar" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {kategoriler.map((c) => {
            const Ikon = IKON[c.ikon];
            return (
              <Link key={c.href} href={c.href} className="card group flex gap-4 p-5 transition duration-300 hover:-translate-y-0.5 hover:border-white/15">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[image:var(--grad)] text-white shadow-[0_8px_20px_-8px_rgb(255_55_95/0.6)]">
                  <Ikon size={22} />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1 text-lg font-semibold">
                    {c.ad} <ArrowRight size={16} className="opacity-0 transition group-hover:opacity-100" />
                  </span>
                  <span className="mt-0.5 block text-sm text-muted">{c.metin}</span>
                  <span className="mt-2 block text-xs font-semibold text-accent">{c.sayi}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Devam eden kurslar */}
      {surenler.length > 0 && (
        <section className="space-y-4">
          <BolumBasligi baslik="Devam ettiğin kurslar" href="/kurslar" bag="Hepsi" />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {surenler.slice(0, 6).map((k) => (
              <KursKartiKucuk key={k.slug} k={k} p={p} />
            ))}
          </div>
        </section>
      )}

      {/* Öne çıkanlar */}
      {oneCikanKartlar.length > 0 && (
        <section className="space-y-4">
          <BolumBasligi baslik="Öne çıkanlar" href="/kurslar" bag="Katalog" />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {oneCikanKartlar.map((k) => (
              <KursKartiKucuk key={k.slug} k={k} p={p} />
            ))}
          </div>
        </section>
      )}

      {sarkilar.length > 0 && (
        <section className="space-y-4">
          <BolumBasligi baslik="Şarkı Kütüphanesinden" href="/kutuphane" bag="Kütüphane" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {sarkilar.map((s) => (
              <Link key={s.slug} href={`/kutuphane/${s.slug}`} className="card group p-4 transition hover:-translate-y-0.5 hover:border-white/15">
                <span className="eyebrow">{s.genre}</span>
                <span className="mt-1 block font-semibold leading-tight">{s.title}</span>
                <span className="mt-1 block text-xs text-muted">
                  {s.key} · {s.bpm} BPM
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function BolumBasligi({ baslik, href, bag }: { baslik: string; href: string; bag: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h2 className="text-2xl font-bold tracking-tight">{baslik}</h2>
      <Link href={href} className="flex shrink-0 items-center gap-1 text-sm font-semibold text-accent hover:underline">
        {bag} <ArrowRight size={14} />
      </Link>
    </div>
  );
}

function IlerlemeCubugu({ tamam, toplam, yuzde }: { tamam: number; toplam: number; yuzde: number }) {
  return (
    <div className="mt-5 max-w-md">
      <div className="flex justify-between text-xs font-medium text-muted">
        <span>
          İlerleme <span className="font-semibold text-text">%{yuzde}</span>
        </span>
        <span className="tabular-nums">
          {tamam}/{toplam} · {toplam - tamam} kaldı
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="bar-grad h-full rounded-full" style={{ width: `${yuzde}%` }} />
      </div>
    </div>
  );
}

/** Bugünkü görevler (içerik paketinde oyun kuralları varsa) ya da çalışma özeti */
function Bugun({ oyun }: { oyun?: OyunVeri }) {
  const p = useProgress();
  if (!oyun)
    return (
      <div className="card grid content-start gap-4 p-6 sm:p-7">
        <p className="eyebrow">Çalışma özeti</p>
        <div className="grid grid-cols-2 gap-3">
          <Sayac etiket="Seri" deger={`${streak(p.sessions)} gün`} />
          <Sayac etiket="Toplam" deger={formatDuration(totalSeconds(p.sessions))} />
        </div>
        <Link href="/profil" className="btn-soft justify-self-start px-4 py-2 text-sm">
          Profilini gör
        </Link>
      </div>
    );
  const gv = gorevler(gunler(p).get(today()), oyun.gorevler);
  const s = seri(p, oyun.gorevler);
  const tamam = gv.filter((g) => g.tamam).length;
  return (
    <div className="card flex flex-col p-6 sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow">Günlük görevler</p>
        <span className="rounded-full bg-white/[0.07] px-2.5 py-0.5 text-xs font-semibold tabular-nums">
          {tamam}/{gv.length}
        </span>
      </div>
      <ul className="mt-3 space-y-2.5">
        {gv.map((g) => (
          <li key={g.ad}>
            <Link href={g.href} className="group block rounded-xl px-1 py-0.5 transition hover:bg-white/[0.04]">
              <span className="flex items-center justify-between gap-2 text-sm font-semibold">
                <span className="flex items-center gap-2">
                  <span className={`flex size-5 items-center justify-center rounded-full ${g.tamam ? "bg-emerald-500 text-black" : "bg-white/10"}`}>{g.tamam && <Check size={12} />}</span>
                  {g.ad}
                </span>
                <span className="text-xs font-medium tabular-nums text-muted">
                  {Math.min(g.deger, g.hedef)}/{g.hedef} {g.birim}
                </span>
              </span>
              <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-white/10">
                <span className={`block h-full rounded-full ${g.tamam ? "bg-emerald-500" : "bar-grad"}`} style={{ width: `${Math.min(100, (g.deger / g.hedef) * 100)}%` }} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-5 text-sm">
        <span className="flex items-center gap-1.5 font-semibold">
          <Flame size={16} className="text-accent" /> {s.seri} gün seri
        </span>
        <span className="flex items-center gap-1.5 text-muted">
          <Trophy size={15} /> Rekor {s.rekor}
        </span>
        <Link href="/profil" className="ml-auto text-xs font-semibold text-accent hover:underline">
          Profil
        </Link>
      </div>
      {!s.bugunTamam && <p className="mt-2 text-xs text-muted">Serini korumak için bugün en az 1 görevi tamamla.</p>}
    </div>
  );
}

function Sayac({ etiket, deger }: { etiket: string; deger: string }) {
  return (
    <div className="rounded-2xl bg-white/[0.04] p-3">
      <p className="text-xs font-medium text-muted">{etiket}</p>
      <p className="mt-0.5 text-lg font-semibold">{deger}</p>
    </div>
  );
}

