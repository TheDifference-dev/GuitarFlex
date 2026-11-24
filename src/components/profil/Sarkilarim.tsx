"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, CircleCheck, ExternalLink, ListPlus, Play, Plus, Repeat, X } from "lucide-react";
import SongsterrBag from "@/components/SongsterrBag";
import SarkiKapagi from "@/components/SarkiKapagi";
import { songsterrAdresi } from "@/lib/songsterr";
import {
  SARKI_KISIMLARI, bilinenKisim, defterIsle, disKayit, durumAyarla, kayitAc, listedenCikar, listeTasi, listeyeEkle, songsterrKaydi, sureYaz, useDefter,
  type DefterVeri, type Durum, type Kayit, type KayitBilgisi,
} from "@/lib/defter";

/** Şarkı önerisi (Şarkı Kütüphanesi'ndeki popüler şarkılar): ekleme formunda ad tamamlama */
export type SarkiOnerisi = { title: string; artist: string; url: string };

const bilgiOf = (k: Kayit): KayitBilgisi => ({ id: k.id, tur: k.tur, baslik: k.baslik, altBaslik: k.altBaslik, href: k.href });
type Hedef = "ogrendim" | "devam" | "liste";
const HEDEF_ADI: Record<Hedef, string> = { ogrendim: "Bildiğim şarkılar", devam: "Çalıştığım şarkılar", liste: "Çalışma listem" };

/**
 * Profil › Şarkılarım: "Bildiğim şarkılar" (Öğrendim; bildiği kısımlar işaretlenir), "Çalıştığım şarkılar"
 * (Öğreniyorum) ve "Çalışma listem" (ileride çalışılacaklar). Veri Çalışma Defteri'nin kendisidir (gf-defter, çift kayıt
 * yok): Şarkı Kütüphanesi kartlarındaki ve Songsterr şarkılarındaki düğmeler aynı kayıtları işaretler.
 */
export default function Sarkilarim({ oneriler }: { oneriler: SarkiOnerisi[] }) {
  const veri = useDefter();
  const sarkilar = useMemo(() => Object.values(veri.kayitlar).filter((k) => k.tur === "sarki"), [veri]);
  const bildigim = sarkilar.filter((k) => k.durum === "ogrendim").sort((a, b) => a.baslik.localeCompare(b.baslik, "tr"));
  const calistigim = sarkilar.filter((k) => k.durum === "devam").sort((a, b) => b.guncellendi.localeCompare(a.guncellendi));
  const liste = veri.liste.map((id) => veri.kayitlar[id]).filter((k): k is Kayit => !!k && k.tur === "sarki");

  return (
    <div className="space-y-6" data-sarkilarim>
      <SarkiEkle oneriler={oneriler} />

      <section className="card p-5" aria-labelledby="bildigim-baslik" data-bildigim>
        <Baslik id="bildigim-baslik" renk="#30d158" simge={<CircleCheck size={15} aria-hidden />} baslik="Bildiğim şarkılar" sayi={bildigim.length}>
          Çalabildiğin kısımları işaretle: Intro, Riff, Kıta, Nakarat, 1. Solo, 2. Solo, Outro ya da kendi kısmın.
        </Baslik>
        {bildigim.length ? (
          <ul className="mt-4 grid gap-3 lg:grid-cols-2">
            {bildigim.map((k) => (
              <li key={k.id}>
                <BildigimSarki kayit={k} />
              </li>
            ))}
          </ul>
        ) : (
          <Bos>Bir şarkıda yeşil &quot;Öğrendim&quot;e bastığında burada görünür.</Bos>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5" aria-labelledby="calistigim-baslik" data-calistigim>
          <Baslik id="calistigim-baslik" renk="#ff9f0a" simge={<Repeat size={15} aria-hidden />} baslik="Çalıştığım şarkılar" sayi={calistigim.length}>
            Şu an öğrendiklerin (turuncu &quot;Öğreniyorum&quot;).
          </Baslik>
          {calistigim.length ? (
            <ul className="mt-3 divide-y divide-line/60">
              {calistigim.map((k) => (
                <li key={k.id} className="py-2.5">
                  <SarkiSatiri kayit={k}>
                    <KucukDugme etiket={`${k.baslik}: öğrendim`} onClick={() => defterIsle((v) => durumAyarla(v, bilgiOf(k), "ogrendim"))} title="Öğrendim: Bildiğim şarkılar'a taşı">
                      <CircleCheck size={14} className="text-[#248a3d]" aria-hidden /> Öğrendim
                    </KucukDugme>
                    <Kaldir etiket={`${k.baslik}: Çalıştığım şarkılar'dan çıkar`} onClick={() => defterIsle((v) => durumAyarla(v, bilgiOf(k), null))} />
                  </SarkiSatiri>
                </li>
              ))}
            </ul>
          ) : (
            <Bos>Bir şarkıda turuncu &quot;Öğreniyorum&quot;a bastığında burada görünür.</Bos>
          )}
        </section>

        <section className="card p-5" aria-labelledby="listem-baslik" data-listem>
          <Baslik id="listem-baslik" renk="#bf5af2" simge={<ListPlus size={15} aria-hidden />} baslik="Çalışma listem" sayi={liste.length}>
            İleride çalışacakların, sırayla. ↑ / ↓ ile sırala; Çalışma Defteri&apos;nde sürükleyerek de sıralanır.
          </Baslik>
          {liste.length ? (
            <ol className="mt-3 divide-y divide-line/60">
              {liste.map((k, i) => (
                <li key={k.id} className="flex items-center gap-2 py-2.5">
                  <span className="w-5 shrink-0 text-center text-xs font-semibold tabular-nums text-muted">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <SarkiSatiri kayit={k}>
                      <button type="button" disabled={i === 0} onClick={() => defterIsle((v) => listeTasi(v, k.id, veri.liste.indexOf(liste[i - 1].id)))} className="flex size-7 items-center justify-center rounded-full hover:bg-ink/[0.08] disabled:opacity-30" aria-label={`${k.baslik}: yukarı taşı`}>
                        <ArrowUp size={14} />
                      </button>
                      <button type="button" disabled={i === liste.length - 1} onClick={() => defterIsle((v) => listeTasi(v, k.id, veri.liste.indexOf(liste[i + 1].id)))} className="flex size-7 items-center justify-center rounded-full hover:bg-ink/[0.08] disabled:opacity-30" aria-label={`${k.baslik}: aşağı taşı`}>
                        <ArrowDown size={14} />
                      </button>
                      {k.durum !== "devam" && (
                        <KucukDugme etiket={`${k.baslik}: çalışmaya başla`} onClick={() => defterIsle((v) => listedenCikar(durumAyarla(v, bilgiOf(k), "devam"), k.id))} title="Çalışmaya başla: Çalıştığım şarkılar'a taşı">
                          <Play size={13} className="text-[#b25000]" aria-hidden /> Başla
                        </KucukDugme>
                      )}
                      <Kaldir etiket={`${k.baslik}: listeden çıkar`} onClick={() => defterIsle((v) => listedenCikar(v, k.id))} />
                    </SarkiSatiri>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <Bos>Bir şarkıda &quot;Listeye ekle&quot;ye bastığında ya da yukarıdan eklediğinde burada sıralanır.</Bos>
          )}
        </section>
      </div>
    </div>
  );
}

function Baslik({ id, renk, simge, baslik, sayi, children }: { id: string; renk: string; simge: React.ReactNode; baslik: string; sayi: number; children: React.ReactNode }) {
  return (
    <div>
      <h3 id={id} className="flex items-center gap-2 text-[19px] font-semibold">
        <span className="flex size-7 items-center justify-center rounded-full text-[#1d1d1f]" style={{ background: renk }}>
          {simge}
        </span>
        {baslik} <span className="text-sm font-normal tabular-nums text-muted">({sayi})</span>
      </h3>
      <p className="mt-1 text-sm text-muted">{children}</p>
    </div>
  );
}

const Bos = ({ children }: { children: React.ReactNode }) => <p className="mt-4 rounded-xl border border-dashed border-ink/15 p-4 text-sm text-muted">{children}</p>;

function KucukDugme({ etiket, title, onClick, children }: { etiket: string; title?: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-label={etiket} title={title ?? etiket} className="inline-flex h-7 items-center gap-1 rounded-full border border-ink/10 bg-ink/[0.04] px-2.5 text-xs font-semibold hover:bg-ink/10">
      {children}
    </button>
  );
}
function Kaldir({ etiket, onClick }: { etiket: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label={etiket} title={etiket} className="flex size-7 items-center justify-center rounded-full text-muted hover:bg-ink/[0.08] hover:text-bad">
      <X size={14} />
    </button>
  );
}

/** Şarkının bağlantısı: Songsterr şarkısı Songsterr penceresinde, kütüphane parçası uygulamada açılır */
function SarkiAdi({ kayit: k }: { kayit: Kayit }) {
  const dis = disKayit(k.id) || k.href.startsWith("http");
  if (!k.href) return <span className="truncate font-semibold">{k.baslik}</span>;
  return dis ? (
    <SongsterrBag q={k.href} onAc={() => defterIsle((v) => kayitAc(v, bilgiOf(k)))} className="inline-flex min-w-0 items-center gap-1 font-semibold hover:text-[var(--link)]">
      <span className="truncate">{k.baslik}</span> <ExternalLink size={12} className="shrink-0 text-muted" aria-hidden />
    </SongsterrBag>
  ) : (
    <Link href={k.href} className="truncate font-semibold hover:text-[var(--link)]">
      {k.baslik}
    </Link>
  );
}

function SarkiSatiri({ kayit: k, children }: { kayit: Kayit; children?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <SarkiKapagi sanatci={k.altBaslik || k.baslik} baslik={k.baslik} boyut={44} koseYaricap={28} className="shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="flex min-w-0 text-[15px]">
          <SarkiAdi kayit={k} />
        </p>
        <p className="truncate text-xs text-muted">
          {k.altBaslik}
          {k.kisim ? ` · ${k.kisim}` : ""}
          {k.toplamSure ? ` · ${sureYaz(k.toplamSure)}` : ""}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">{children}</div>
    </div>
  );
}

/** Bildiğim şarkı: kısım rozetleri (aç/kapa) ve serbest kısım ekleme */
function BildigimSarki({ kayit: k }: { kayit: Kayit }) {
  const [yeni, setYeni] = useState("");
  const kisimlar = [...SARKI_KISIMLARI, ...k.kisimlar.filter((x) => !SARKI_KISIMLARI.includes(x))];
  const ekle = () => {
    if (!yeni.trim()) return;
    defterIsle((v) => bilinenKisim(v, k.id, yeni, true));
    setYeni("");
  };
  return (
    <div className="rounded-2xl border border-ink/[0.07] bg-ink/[0.02] p-3">
      <SarkiSatiri kayit={k}>
        <KucukDugme etiket={`${k.baslik}: tekrar çalışıyorum`} onClick={() => defterIsle((v) => durumAyarla(v, bilgiOf(k), "devam"))} title="Tekrar çalışıyorum: Çalıştığım şarkılar'a taşı">
          <Repeat size={13} className="text-[#b25000]" aria-hidden /> Çalışıyorum
        </KucukDugme>
        <Kaldir etiket={`${k.baslik}: Bildiğim şarkılar'dan çıkar`} onClick={() => defterIsle((v) => durumAyarla(v, bilgiOf(k), null))} />
      </SarkiSatiri>
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5" role="group" aria-label={`${k.baslik}: bildiğim kısımlar`}>
        {kisimlar.map((x) => {
          const acik = k.kisimlar.includes(x);
          return (
            <button
              key={x}
              type="button"
              aria-pressed={acik}
              onClick={() => defterIsle((v) => bilinenKisim(v, k.id, x, !acik))}
              className={`inline-flex h-7 items-center gap-1 rounded-full border px-2.5 text-xs font-semibold transition ${acik ? "border-[#30d158] bg-[#30d158] text-[#04230c]" : "border-ink/10 bg-ink/[0.04] text-text/80 hover:bg-ink/10"}`}
              title={acik ? `${x}: biliyorum (tıkla: kaldır)` : `${x}: biliyorum olarak işaretle`}
            >
              {acik && <CircleCheck size={12} aria-hidden />}
              {x}
            </button>
          );
        })}
        <form
          className="flex items-center gap-1"
          onSubmit={(e) => {
            e.preventDefault();
            ekle();
          }}
        >
          <input
            value={yeni}
            onChange={(e) => setYeni(e.target.value)}
            maxLength={40}
            placeholder="Kısım ekle (ör. Köprü)"
            aria-label={`${k.baslik}: serbest kısım ekle`}
            className="h-7 w-36 rounded-full border border-ink/10 bg-[var(--bg)] px-2.5 text-xs placeholder:text-muted"
          />
          <button type="submit" disabled={!yeni.trim()} className="flex size-7 items-center justify-center rounded-full text-[var(--link)] hover:bg-ink/[0.06] disabled:opacity-40" aria-label="Kısmı ekle">
            <Plus size={14} />
          </button>
        </form>
      </div>
    </div>
  );
}

/** Şarkı ekle: Şarkı Kütüphanesi'ndeki popüler şarkılardan ya da Songsterr'deki herhangi bir şarkıdan (ad + sanatçı) */
function SarkiEkle({ oneriler }: { oneriler: SarkiOnerisi[] }) {
  const [ad, setAd] = useState("");
  const [sanatci, setSanatci] = useState("");
  const [hedef, setHedef] = useState<Hedef>("liste");
  const [son, setSon] = useState<string | null>(null);
  const eslesen = oneriler.find((o) => o.title.toLocaleLowerCase("tr") === ad.trim().toLocaleLowerCase("tr") && (!sanatci.trim() || o.artist.toLocaleLowerCase("tr") === sanatci.trim().toLocaleLowerCase("tr")));
  const kaydet = () => {
    const baslik = ad.trim();
    const kim = (eslesen?.artist ?? sanatci).trim();
    if (!baslik || !kim) return;
    const b = songsterrKaydi(eslesen?.title ?? baslik, kim, eslesen?.url ?? songsterrAdresi(`${kim} ${baslik}`));
    defterIsle((v: DefterVeri) => (hedef === "liste" ? listeyeEkle(v, b) : durumAyarla(v, b, hedef as Durum)));
    setSon(`${b.baslik} → ${HEDEF_ADI[hedef]}`);
    setAd("");
    setSanatci("");
  };
  const alan = "h-9 rounded-full border border-ink/10 bg-[var(--bg)] px-3.5 text-sm placeholder:text-muted";
  return (
    <form
      className="card flex flex-wrap items-center gap-2 p-4"
      aria-label="Şarkı ekle"
      onSubmit={(e) => {
        e.preventDefault();
        kaydet();
      }}
    >
      <span className="mr-1 text-sm font-semibold">Şarkı ekle</span>
      <input
        value={ad}
        onChange={(e) => {
          setAd(e.target.value);
          const o = oneriler.find((x) => x.title === e.target.value);
          if (o && !sanatci) setSanatci(o.artist);
        }}
        list="sarkilarim-oneri"
        placeholder="Şarkı adı (Songsterr'deki herhangi bir şarkı)"
        aria-label="Şarkı adı"
        className={`${alan} min-w-56 flex-[2]`}
      />
      <datalist id="sarkilarim-oneri">
        {oneriler.map((o) => (
          <option key={`${o.artist}|${o.title}`} value={o.title}>
            {o.artist}
          </option>
        ))}
      </datalist>
      <input value={sanatci} onChange={(e) => setSanatci(e.target.value)} placeholder="Sanatçı" aria-label="Sanatçı" className={`${alan} min-w-40 flex-1`} />
      <select value={hedef} onChange={(e) => setHedef(e.target.value as Hedef)} aria-label="Nereye eklensin" className={alan}>
        <option value="ogrendim">Bildiğim şarkılar</option>
        <option value="devam">Çalıştığım şarkılar</option>
        <option value="liste">Çalışma listem</option>
      </select>
      <button type="submit" disabled={!ad.trim() || !(eslesen?.artist ?? sanatci).trim()} className="btn-primary px-4 py-1.5 text-sm">
        <Plus size={15} aria-hidden /> Ekle
      </button>
      <p className="w-full text-xs text-muted" role="status">
        {son ? `Eklendi: ${son}. ` : ""}Şarkı Kütüphanesi kartlarındaki ve Songsterr şarkılarındaki Öğrendim / Öğreniyorum / Listeye ekle düğmeleri de buraya ekler.
      </p>
    </form>
  );
}
