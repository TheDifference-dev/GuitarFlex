"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { ArrowDown, ArrowUp, Download, ExternalLink, Plus, Search, Star, StepForward, Trash2, Upload, X } from "lucide-react";
import UygulamaSimgesi from "@/components/site/UygulamaSimgesi";
import { kursSimgesi, yerSimgesi, type SimgeTanim } from "@/lib/simge";
import SongsterrBag from "@/components/SongsterrBag";
import { today, useProgress } from "@/lib/progress";
import { gunler as ilerlemeGunleri } from "@/lib/oyun";
import { Onay } from "@/components/kutuphane/LibraryBrowser";
import {
  AY_ADLARI, GITAR_TURLERI, GITAR_TURU_ADI, GUN_ADLARI, TUR_ADI, birlestir, defterIsle, disKayit, disaAktar, elleEkle, gitarBasina, gitarEkle, gitarGuncelle, gitarSil,
  gunEkle, gunToplami, gunTarihi, gunlukToplamlar, haftaBasi, haftaGunu, iceAktarMetin, kayitAc, kayitGitari, kayitGuncelle, kayitSil, kisimYaz, konumYaz, listele, listeyeUyar,
  ogrenecekTasi, planlananlar, sureEkle, sureYaz, useDefter, varsayilanAyarla, type DefterVeri, type Durum, type Filtre, type GitarTuru, type Kayit, type ListeTuru, type Tur,
} from "@/lib/defter";
import { DurumDugmeleri, GitarSecici, KisimSecici, SureEkle, gitarAdi } from "./Parcalar";
import DefterDugmeleri from "./DefterDugmeleri";
import DefterTakvim from "./DefterTakvim";

type Gorunum = "liste" | "takvim";
const tarihYaz = (t: string) => {
  const d = gunTarihi(t);
  return `${d.getDate()} ${AY_ADLARI[d.getMonth()]}`;
};
const anYaz = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : `${d.getDate()} ${AY_ADLARI[d.getMonth()]} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};
const segment = (aktif: boolean) => `rounded-full px-3 py-1 text-sm transition ${aktif ? "bg-seg font-semibold text-text shadow-[var(--shadow-seg)]" : "text-muted hover:text-text"}`;
const secim = "h-9 rounded-full border border-ink/10 bg-ink/[0.05] px-3.5 text-sm";

/** Defter listeleri (sekme sırası): renk noktası düğmelerin rengiyle aynı */
const LISTELER: [ListeTuru, string, string][] = [
  ["devam", "Öğreniyorum", "bg-[#ff9f0a]"],
  ["ogrendim", "Öğrendiklerim", "bg-[#30d158]"],
  ["ogrenecek", "Öğreneceklerim", "bg-[#8944ab]"],
  ["takvim", "Takvimde", "bg-[#0071e3]"],
  ["tumu", "Tümü", ""],
];
const LISTE_ADRESI: Record<string, ListeTuru> = { devam: "devam", ogreniyorum: "devam", ogrendim: "ogrendim", ogrenecek: "ogrenecek", ogrenecekler: "ogrenecek", kutuphane: "ogrenecek", planli: "takvim", tumu: "tumu" };

/**
 * Çalışma Defteri sayfası: özet, kayıtlar (Öğreniyorum, Öğrendiklerim, Öğreneceklerim sıralı listesi, Takvimde, Tümü;
 * filtre, arama, sıralama), takvim ve plan, gitarlar, yedek. Kayıtlar yalnız kullanıcının düğmeleriyle eklenir.
 */
export default function DefterSayfasi({ gunlukHedefDk }: { gunlukHedefDk: number }) {
  const veri = useDefter();
  const p = useProgress();
  const [gorunum, setGorunum] = useState<Gorunum>("liste");
  const [filtre, setFiltre] = useState<Filtre>({ durum: "devam", tur: "", gitar: "", q: "", sira: "son" });
  const [vurgu, setVurgu] = useState<string | null>(null);
  const [notAc, setNotAc] = useState(false);
  const gitarRef = useRef<HTMLDetailsElement>(null);

  // Bağlantı ile açılış: #devam, #ogrendim, #ogrenecekler, #planli, #tumu, #takvim, #plan, #gitarlar ya da bir kaydın kimliği
  useEffect(() => {
    const uygula = () => {
      const h = decodeURIComponent(window.location.hash.slice(1));
      if (!h) return;
      if (LISTE_ADRESI[h]) {
        setGorunum("liste");
        setFiltre((f) => ({ ...f, durum: LISTE_ADRESI[h] }));
      } else if (h === "takvim" || h === "plan") {
        setGorunum("takvim");
        requestAnimationFrame(() => document.getElementById(h)?.scrollIntoView({ block: "start" }));
      } else if (h === "gitarlar") {
        if (gitarRef.current) gitarRef.current.open = true;
        requestAnimationFrame(() => gitarRef.current?.scrollIntoView({ block: "start" }));
      } else if (h.includes(":")) {
        setGorunum("liste");
        setFiltre((f) => ({ ...f, durum: "tumu", q: "" }));
        setVurgu(h);
        requestAnimationFrame(() => document.querySelector(`[data-kayit="${CSS.escape(h)}"]`)?.scrollIntoView({ block: "center" }));
      }
    };
    uygula();
    window.addEventListener("hashchange", uygula);
    return () => window.removeEventListener("hashchange", uygula);
  }, []);

  const bugun = today();
  const ilerleme = useMemo(() => {
    const m = new Map<string, number>();
    for (const [t, g] of ilerlemeGunleri(p)) m.set(t, g.egzersiz + g.serbest);
    return m;
  }, [p]);
  const liste = useMemo(() => listele(veri, filtre), [veri, filtre]);
  const sayilar = useMemo(() => {
    const t = Object.values(veri.kayitlar);
    return Object.fromEntries(LISTELER.map(([l]) => [l, t.filter((k) => listeyeUyar(veri, k, l)).length])) as Record<ListeTuru, number>;
  }, [veri]);
  const sirali = filtre.durum === "ogrenecek" || filtre.durum === "takvim";

  return (
    <div className="space-y-8">
      <Ozet veri={veri} ilerleme={ilerleme} bugun={bugun} gunlukHedefDk={gunlukHedefDk} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-0.5 rounded-full border border-ink/[0.08] bg-ink/[0.05] p-0.5" role="group" aria-label="Görünüm">
          <button type="button" aria-pressed={gorunum === "liste"} onClick={() => setGorunum("liste")} className={segment(gorunum === "liste")}>
            Kayıtlar
          </button>
          <button type="button" aria-pressed={gorunum === "takvim"} onClick={() => setGorunum("takvim")} className={segment(gorunum === "takvim")}>
            Takvim ve plan
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setNotAc(true)} className="btn-primary px-4 py-1.5 text-sm" aria-expanded={notAc}>
            <Plus size={15} aria-hidden /> Not ekle
          </button>
          <Yedek veri={veri} />
        </div>
      </div>

      {notAc && <NotEkle veri={veri} onKapat={() => setNotAc(false)} />}

      {gorunum === "takvim" ? (
        <DefterTakvim veri={veri} ilerleme={ilerleme} varsayilanDk={gunlukHedefDk} bugun={bugun} />
      ) : (
        <section aria-label="Kayıtlar" className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-0.5 rounded-full border border-ink/[0.08] bg-ink/[0.05] p-0.5" role="group" aria-label="Durum">
              {LISTELER.map(([d, ad, renk]) => (
                <button key={d} type="button" aria-pressed={filtre.durum === d} onClick={() => setFiltre({ ...filtre, durum: d })} className={`${segment(filtre.durum === d)} flex items-center gap-1.5`}>
                  {renk && <span className={`size-2.5 rounded-full ${renk}`} aria-hidden />}
                  {ad} <span className="tabular-nums text-muted">{sayilar[d]}</span>
                </button>
              ))}
            </div>
            <select value={filtre.tur} onChange={(e) => setFiltre({ ...filtre, tur: e.target.value as Tur | "" })} className={secim} aria-label="Tür">
              <option value="">Tür: Tümü</option>
              <option value="egzersiz">Egzersizler</option>
              <option value="sarki">Şarkılar</option>
              <option value="serbest">Serbest notlar</option>
            </select>
            <select value={filtre.gitar} onChange={(e) => setFiltre({ ...filtre, gitar: e.target.value })} className={secim} aria-label="Gitar">
              <option value="">Gitar: Tümü</option>
              {veri.gitarlar.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.ad}
                </option>
              ))}
              <option value="-">Gitarsız</option>
            </select>
            <label className="flex h-9 min-w-56 flex-1 items-center gap-2 rounded-full border border-ink/10 bg-ink/[0.05] px-3.5">
              <Search size={16} className="text-muted" aria-hidden />
              <input value={filtre.q} onChange={(e) => setFiltre({ ...filtre, q: e.target.value })} placeholder="Defterde ara (başlık, sanatçı, kısım, not)" className="w-full bg-transparent text-sm outline-none" aria-label="Defterde ara" />
            </label>
            {sirali ? (
              <span className="text-sm text-muted">{filtre.durum === "ogrenecek" ? "Senin sıran: oklarla taşı" : "En yakın plan önce"}</span>
            ) : (
              <select value={filtre.sira} onChange={(e) => setFiltre({ ...filtre, sira: e.target.value as Filtre["sira"] })} className={secim} aria-label="Sıralama">
                <option value="son">Son çalışılan</option>
                <option value="cok">En çok çalışılan</option>
              </select>
            )}
          </div>

          {liste.length ? (
            <ul className="space-y-3">
              {liste.map((k) => (
                <li key={k.id}>
                  <KayitSatiri veri={veri} kayit={k} vurgu={vurgu === k.id} bugun={bugun} sirala={filtre.durum === "ogrenecek" && !filtre.q && !filtre.tur && !filtre.gitar} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="card p-8 text-center text-sm text-muted">
              {sayilar.tumu ? (
                "Bu filtrelerle kayıt yok."
              ) : (
                <>
                  Defter boş. Deftere yalnız sen eklersin: her egzersizin, dersin ve şarkının yanındaki &quot;Öğrendim&quot;, &quot;Öğreniyorum&quot;, &quot;Takvime al&quot; ya
                  da &quot;Kütüphaneye ekle&quot; düğmeleriyle. Eklediğin derste çaldığın süre, ölçü ve hız buraya yazılır. <Link href="/sarkilar" className="font-semibold text-[var(--link)]">Rehber Şarkılar</Link> ·{" "}
                  <Link href="/elektro" className="font-semibold text-[var(--link)]">Teknik Egzersizler</Link>
                </>
              )}
            </div>
          )}
        </section>
      )}

      <Gitarlarim veri={veri} detayRef={gitarRef} />
    </div>
  );
}

/* ───────────── Özet ───────────── */

function Ozet({ veri, ilerleme, bugun, gunlukHedefDk }: { veri: DefterVeri; ilerleme: Map<string, number>; bugun: string; gunlukHedefDk: number }) {
  const defter = gunlukToplamlar(veri);
  const bugunD = defter.get(bugun);
  const bugunSn = gunToplami(bugunD, ilerleme.get(bugun) ?? 0);
  const bas = haftaBasi(gunTarihi(bugun));
  let haftaSn = 0;
  let haftaElle = 0;
  for (let i = 0; i < 7; i++) {
    const g = gunEkle(bas, i);
    haftaSn += gunToplami(defter.get(g), ilerleme.get(g) ?? 0);
    haftaElle += defter.get(g)?.elle ?? 0;
  }
  const gitarlar = [...gitarBasina(veri, bas, bugun)].sort((a, b) => b[1] - a[1]);
  const enCok = Math.max(1, ...gitarlar.map(([, s]) => s));
  const planNotu = veri.plan.notlar[haftaGunu(gunTarihi(bugun))];
  const hedef = (veri.plan.hedefDk[haftaGunu(gunTarihi(bugun))] ?? gunlukHedefDk) * 60;
  const bugunPlan = planlananlar(veri, bugun);

  return (
    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.4fr)]">
      <Kutu etiket="Bugün" deger={sureYaz(bugunSn)}>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/10" role="progressbar" aria-label="Bugünkü hedef" aria-valuemin={0} aria-valuemax={100} aria-valuenow={hedef ? Math.min(100, Math.round((bugunSn / hedef) * 100)) : 0}>
          <div className={`h-full rounded-full ${hedef && bugunSn >= hedef ? "bg-ok" : "bar-fill"}`} style={{ width: `${hedef ? Math.min(100, (bugunSn / hedef) * 100) : 0}%` }} />
        </div>
        <p className="mt-1.5 text-xs text-muted">
          Hedef {Math.round(hedef / 60)} dk{bugunD?.elle ? ` · ${sureYaz(bugunD.elle)} elle` : ""}
          {planNotu ? ` · Plan: ${planNotu}` : ""}
        </p>
        {bugunPlan.length > 0 && (
          <p className="mt-1 truncate text-xs">
            <span className="font-semibold">Bugün takvimde: </span>
            {bugunPlan.map((k) => k.baslik).join(", ")}
          </p>
        )}
      </Kutu>
      <Kutu etiket="Bu hafta" deger={sureYaz(haftaSn)}>
        <p className="mt-1.5 text-xs text-muted">
          Pazartesiden beri{haftaElle ? ` · ${sureYaz(haftaElle)} elle girildi` : ""}. Günlük görevler (Profil) yalnız uygulamada ölçülen süreyi sayar.
        </p>
      </Kutu>
      <section className="card p-4" aria-label="Bu hafta gitar başına süre">
        <p className="text-xs font-medium text-muted">Gitar başına (bu hafta)</p>
        {gitarlar.length ? (
          <ul className="mt-2 space-y-1.5">
            {gitarlar.map(([g, sn]) => (
              <li key={g ?? "-"} className="grid grid-cols-[7.5rem_minmax(0,1fr)_3.75rem] items-center gap-2 text-sm">
                <span className="truncate font-semibold">{gitarAdi(veri, g)}</span>
                <span className="h-2 overflow-hidden rounded-full bg-ink/10" aria-hidden>
                  <span className="bar-fill block h-full rounded-full" style={{ width: `${(sn / enCok) * 100}%` }} />
                </span>
                <span className="text-right text-xs tabular-nums text-muted">{sureYaz(sn)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted">Bu hafta defterde oturum yok.</p>
        )}
      </section>
    </div>
  );
}

function Kutu({ etiket, deger, children }: { etiket: string; deger: string; children?: ReactNode }) {
  return (
    <section className="card p-4" aria-label={etiket}>
      <p className="text-xs font-medium text-muted">{etiket}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{deger}</p>
      {children}
    </section>
  );
}

/* ───────────── Kayıt satırı ───────────── */

/** Kaydın simgesi ve rengi (yeni renk dili): ders kursunun rengi, Songsterr şarkıları Şarkı Kütüphanesi, kütüphane
 * parçaları Tab Oynatıcı, serbest notlar defterin rengi */
function kayitSimgesi(k: Kayit): SimgeTanim {
  if (k.tur === "egzersiz") return kursSimgesi(k.id.slice("egzersiz:".length).split("/")[0]);
  if (disKayit(k.id)) return yerSimgesi("sarki-kutuphanesi");
  if (k.tur === "sarki") return yerSimgesi("kutuphane");
  return yerSimgesi("defter");
}

function KayitSatiri({ veri, kayit: k, vurgu, bugun, sirala }: { veri: DefterVeri; kayit: Kayit; vurgu: boolean; bugun: string; sirala: boolean }) {
  const sira = veri.ogrenecekler.indexOf(k.id);
  const gelecek = k.takvim.filter((t) => t >= bugun);
  const [sor, setSor] = useState(false);
  const dis = disKayit(k.id) || k.href.startsWith("http");
  const bilgi = { id: k.id, tur: k.tur, baslik: k.baslik, altBaslik: k.altBaslik, href: k.href };
  const yer = konumYaz(k);
  const son = k.oturumlar[k.oturumlar.length - 1];
  const simge = kayitSimgesi(k);
  return (
    <article data-kayit={k.id} data-renk={simge.renk} className={`renkli-kart card p-4 pt-5 sm:p-5 sm:pt-6 ${vurgu ? "outline-2 outline-offset-2 outline-[var(--accent)]" : ""}`} aria-labelledby={`b-${k.id}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {sirala && sira >= 0 && (
            <div className="flex shrink-0 flex-col items-center gap-0.5" role="group" aria-label={`${k.baslik}: Öğreneceklerim sırası`}>
              <button
                type="button"
                onClick={() => defterIsle((v) => ogrenecekTasi(v, k.id, -1))}
                disabled={sira === 0}
                className="flex size-7 items-center justify-center rounded-full hover:bg-ink/[0.08] disabled:opacity-30"
                aria-label={`${k.baslik}: yukarı taşı`}
                title="Yukarı taşı"
              >
                <ArrowUp size={15} />
              </button>
              <span className="text-xs font-semibold tabular-nums text-muted" aria-label={`${sira + 1}. sırada`}>
                {sira + 1}
              </span>
              <button
                type="button"
                onClick={() => defterIsle((v) => ogrenecekTasi(v, k.id, 1))}
                disabled={sira === veri.ogrenecekler.length - 1}
                className="flex size-7 items-center justify-center rounded-full hover:bg-ink/[0.08] disabled:opacity-30"
                aria-label={`${k.baslik}: aşağı taşı`}
                title="Aşağı taşı"
              >
                <ArrowDown size={15} />
              </button>
            </div>
          )}
          <UygulamaSimgesi simge={simge} boyut={44} />
          <div className="min-w-0">
            <h3 id={`b-${k.id}`} className="text-[17px] font-semibold leading-tight">
              {k.href && !dis ? (
                <Link href={k.href} className="hover:text-[var(--link)]">
                  {k.baslik}
                </Link>
              ) : (
                k.baslik
              )}
            </h3>
            <p className="mt-0.5 text-sm text-muted">
              {TUR_ADI[k.tur]}
              {k.altBaslik ? ` · ${k.altBaslik}` : ""}
              {dis ? " · Songsterr" : ""}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {k.href &&
            (dis ? (
              <SongsterrBag q={k.href} onAc={() => defterIsle((v) => kayitAc(v, bilgi))} className="btn-secondary px-3.5 py-1.5 text-sm">
                Songsterr&apos;de aç <ExternalLink size={14} aria-hidden />
              </SongsterrBag>
            ) : (
              <Link href={yer && k.tur === "egzersiz" ? `${k.href}#devam` : k.href} className="btn-primary px-3.5 py-1.5 text-sm">
                {yer ? (
                  <>
                    <StepForward size={14} aria-hidden /> Devam et
                  </>
                ) : (
                  "Aç"
                )}
              </Link>
            ))}
          <button type="button" onClick={() => setSor(true)} className="flex size-8 items-center justify-center rounded-full text-muted hover:bg-ink/[0.08] hover:text-bad" aria-label={`${k.baslik} kaydını sil`} title="Kaydı sil">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
        <Bilgi ad="Kısım">{k.kisim ? kisimYaz(k.kisim) : "—"}</Bilgi>
        <Bilgi ad="Son konum">{k.konum || k.hiz || k.tempo ? yer.replace(k.kisim ? `${kisimYaz(k.kisim)}, ` : "", "") || "—" : "—"}</Bilgi>
        <Bilgi ad="Toplam">{k.toplamSure ? sureYaz(k.toplamSure) : k.acildi ? "açıldı, süre girilmedi" : "—"}</Bilgi>
        <Bilgi ad="Gitar">{gitarAdi(veri, kayitGitari(veri, k))}</Bilgi>
        <Bilgi ad="Son">{son ? tarihYaz(son.tarih) : anYaz(k.guncellendi)}</Bilgi>
        {k.takvim.length > 0 && <Bilgi ad="Takvimde">{(gelecek.length ? gelecek : k.takvim.slice(-1)).map(tarihYaz).join(", ")}</Bilgi>}
      </dl>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <KisimSecici deger={k.kisim} onDegis={(x) => defterIsle((v) => kayitGuncelle(v, k.id, { kisim: x }))} etiket={`${k.baslik}: kısım`} />
        <DefterDugmeleri bilgi={bilgi} kisim={k.kisim} />
        <GitarSecici veri={veri} deger={k.gitar} onDegis={(g) => defterIsle((v) => kayitGuncelle(v, k.id, { gitar: g }))} />
        {(dis || k.tur === "serbest") && (
          <SureEkle ad={k.baslik} onEkle={(sn) => defterIsle((v) => sureEkle(v, bilgi, sn, { elle: true, gitar: kayitGitari(v, v.kayitlar[k.id]) }))} />
        )}
      </div>

      <NotAlani kayit={k} />

      {k.oturumlar.length > 0 && (
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer text-muted hover:text-text">Oturum geçmişi ({k.oturumlar.length})</summary>
          <table className="mt-2 w-full text-left text-xs tabular-nums">
            <thead className="text-muted">
              <tr>
                <th className="py-1 font-medium">Tarih</th>
                <th className="py-1 font-medium">Süre</th>
                <th className="py-1 font-medium">Gitar</th>
                <th className="py-1 font-medium">Kısım</th>
                <th className="py-1 font-medium">Tempo</th>
                <th className="py-1 font-medium">Kaynak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {[...k.oturumlar].reverse().map((o, i) => (
                <tr key={`${o.tarih}-${o.son ?? i}`}>
                  <td className="py-1">
                    {tarihYaz(o.tarih)} {GUN_ADLARI[haftaGunu(gunTarihi(o.tarih))].slice(0, 3)}
                    {o.saat !== undefined ? ` ${String(o.saat).padStart(2, "0")}:00` : ""}
                  </td>
                  <td className="py-1 font-semibold">{sureYaz(o.sure)}</td>
                  <td className="py-1">{gitarAdi(veri, o.gitar)}</td>
                  <td className="py-1">{o.kisim ?? "—"}</td>
                  <td className="py-1">{o.tempo ? `${o.tempo} BPM` : "—"}</td>
                  <td className="py-1">{o.elle ? "elle" : "ölçüldü"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      )}

      {sor && (
        <Onay
          baslik={`"${k.baslik}" defterden silinsin mi?`}
          onIptal={() => setSor(false)}
          onEvet={() => {
            setSor(false);
            defterIsle((v) => kayitSil(v, k.id));
          }}
        >
          Kaydın notu ve {k.oturumlar.length} oturumu silinir. Günlük görev ve ders süreleri (Profil) değişmez.
        </Onay>
      )}
    </article>
  );
}

function Bilgi({ ad, children }: { ad: string; children: ReactNode }) {
  return (
    <div className="flex gap-1.5">
      <dt className="text-muted">{ad}:</dt>
      <dd className="font-semibold">{children}</dd>
    </div>
  );
}

function NotAlani({ kayit }: { kayit: Kayit }) {
  const [yazilan, setYazilan] = useState<string | null>(null);
  return (
    <textarea
      value={yazilan ?? kayit.not}
      onChange={(e) => setYazilan(e.target.value)}
      onBlur={() => {
        if (yazilan !== null && yazilan !== kayit.not) defterIsle((v) => kayitGuncelle(v, kayit.id, { not: yazilan }));
        setYazilan(null);
      }}
      rows={kayit.not ? 2 : 1}
      placeholder="Not (ör. 16'lıklarda sağ el kayıyor, 90 BPM'de temiz)"
      aria-label={`${kayit.baslik}: not`}
      className="mt-3 w-full resize-y rounded-xl border border-ink/10 bg-[var(--bg)] px-3 py-2 text-sm placeholder:text-muted"
    />
  );
}

/* ───────────── + Not ekle ───────────── */

function NotEkle({ veri, onKapat }: { veri: DefterVeri; onKapat: () => void }) {
  const [baslik, setBaslik] = useState("");
  const [kisim, setKisim] = useState<string | null>(null);
  const [gitar, setGitar] = useState<string | null>(null);
  const [dk, setDk] = useState("");
  const [durum, setDurum] = useState<Durum | null>("devam");
  const [not, setNot] = useState("");
  const kaydet = () => {
    if (!baslik.trim()) return;
    const sn = Math.round(Math.min(600, Math.max(0, Number(dk.replace(",", ".")) || 0)) * 60);
    defterIsle((v) => elleEkle(v, { baslik, kisim, gitar: gitar ?? v.varsayilanGitar, sure: sn, durum, not }).veri);
    onKapat();
  };
  const alan = "h-9 rounded-full border border-ink/10 bg-[var(--bg)] px-3.5 text-sm";
  return (
    <form
      className="card space-y-3 p-5"
      aria-label="Not ekle"
      onSubmit={(e) => {
        e.preventDefault();
        kaydet();
      }}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Not ekle</h2>
        <button type="button" onClick={onKapat} className="flex size-8 items-center justify-center rounded-full hover:bg-ink/[0.08]" aria-label="Kapat">
          <X size={16} />
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <input value={baslik} onChange={(e) => setBaslik(e.target.value)} placeholder="Ne çalıştın? (ör. Metallica – Enter Sandman riff)" aria-label="Başlık" className={`${alan} min-w-64 flex-1`} required autoFocus />
        <KisimSecici deger={kisim} onDegis={setKisim} />
        <GitarSecici veri={veri} deger={gitar} onDegis={setGitar} />
        <label className="flex items-center gap-1.5 text-sm text-muted">
          Süre
          <input inputMode="decimal" value={dk} onChange={(e) => setDk(e.target.value.replace(/[^\d.,]/g, ""))} placeholder="0" className={`${alan} w-16 text-center tabular-nums`} aria-label="Süre (dakika)" />
          dk
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <DurumDugmeleri durum={durum} kisim={kisim} onDurum={setDurum} />
      </div>
      <textarea value={not} onChange={(e) => setNot(e.target.value)} rows={2} placeholder="Not" aria-label="Not" className="w-full rounded-xl border border-ink/10 bg-[var(--bg)] px-3 py-2 text-sm placeholder:text-muted" />
      <p className="text-xs text-muted">Elle girilen süre yalnız defterde ve takvimde sayılır; günlük görevlere yazılmaz.</p>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onKapat} className="btn-secondary px-4 py-2 text-sm">
          Vazgeç
        </button>
        <button type="submit" disabled={!baslik.trim()} className="btn-primary px-4 py-2 text-sm">
          Deftere ekle
        </button>
      </div>
    </form>
  );
}

/* ───────────── Gitarlar ───────────── */

function Gitarlarim({ veri, detayRef }: { veri: DefterVeri; detayRef: RefObject<HTMLDetailsElement | null> }) {
  const [ad, setAd] = useState("");
  const [tur, setTur] = useState<GitarTuru | "">("");
  const [sil, setSil] = useState<string | null>(null);
  const silinecek = veri.gitarlar.find((g) => g.id === sil);
  return (
    <details ref={detayRef} id="gitarlar" className="card p-5" open={!veri.gitarlar.length || undefined}>
      <summary className="flex cursor-pointer items-center gap-2.5 text-lg font-semibold">
        <UygulamaSimgesi simge={yerSimgesi("akustik")} boyut={32} /> Gitarlarım <span className="text-sm font-normal text-muted">({veri.gitarlar.length})</span>
      </summary>
      <p className="mt-2 text-sm text-muted">Oturumlar hangi gitarla çalıştığını da kaydeder. Varsayılan gitar (yıldız) yeni oturumlarda seçili gelir; kayıt başına değiştirebilirsin.</p>
      {veri.gitarlar.length > 0 && (
        <ul className="mt-3 divide-y divide-line/60">
          {veri.gitarlar.map((g) => (
            <li key={g.id} className="flex flex-wrap items-center gap-2 py-2">
              <button
                type="button"
                onClick={() => defterIsle((v) => varsayilanAyarla(v, veri.varsayilanGitar === g.id ? null : g.id))}
                aria-pressed={veri.varsayilanGitar === g.id}
                aria-label={`${g.ad}: varsayılan gitar`}
                title="Varsayılan gitar"
                className="flex size-8 items-center justify-center rounded-full hover:bg-ink/[0.08]"
              >
                <Star size={16} className={veri.varsayilanGitar === g.id ? "fill-current text-accent" : "text-muted"} />
              </button>
              <GitarAdi ad={g.ad} onKaydet={(x) => defterIsle((v) => gitarGuncelle(v, g.id, { ad: x }))} />
              <select value={g.tur ?? ""} onChange={(e) => defterIsle((v) => gitarGuncelle(v, g.id, { tur: (e.target.value || undefined) as GitarTuru | undefined }))} className={secim} aria-label={`${g.ad}: tür`}>
                <option value="">Tür yok</option>
                {GITAR_TURLERI.map((t) => (
                  <option key={t} value={t}>
                    {GITAR_TURU_ADI[t]}
                  </option>
                ))}
              </select>
              <button type="button" onClick={() => setSil(g.id)} className="ml-auto flex size-8 items-center justify-center rounded-full text-muted hover:bg-ink/[0.08] hover:text-bad" aria-label={`${g.ad} gitarını sil`}>
                <Trash2 size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <form
        className="mt-3 flex flex-wrap items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!ad.trim()) return;
          defterIsle((v) => gitarEkle(v, ad, tur || undefined).veri);
          setAd("");
          setTur("");
        }}
      >
        <input value={ad} onChange={(e) => setAd(e.target.value)} placeholder="Gitar adı (ör. Les Paul)" aria-label="Yeni gitar adı" className="h-9 min-w-56 flex-1 rounded-full border border-ink/10 bg-[var(--bg)] px-3.5 text-sm" />
        <select value={tur} onChange={(e) => setTur(e.target.value as GitarTuru | "")} className={secim} aria-label="Yeni gitarın türü">
          <option value="">Tür (isteğe bağlı)</option>
          {GITAR_TURLERI.map((t) => (
            <option key={t} value={t}>
              {GITAR_TURU_ADI[t]}
            </option>
          ))}
        </select>
        <button type="submit" disabled={!ad.trim()} className="btn-primary px-4 py-1.5 text-sm">
          <Plus size={15} aria-hidden /> Gitar ekle
        </button>
      </form>
      {silinecek && (
        <Onay
          baslik={`"${silinecek.ad}" silinsin mi?`}
          onIptal={() => setSil(null)}
          onEvet={() => {
            defterIsle((v) => gitarSil(v, silinecek.id));
            setSil(null);
          }}
        >
          Kayıtlardaki gitar seçimi kalkar; geçmiş oturumlarda &quot;Silinmiş gitar&quot; olarak görünür.
        </Onay>
      )}
    </details>
  );
}

function GitarAdi({ ad, onKaydet }: { ad: string; onKaydet: (ad: string) => void }) {
  const [yazilan, setYazilan] = useState<string | null>(null);
  return (
    <input
      value={yazilan ?? ad}
      onChange={(e) => setYazilan(e.target.value)}
      onBlur={() => {
        if (yazilan !== null && yazilan.trim() && yazilan !== ad) onKaydet(yazilan);
        setYazilan(null);
      }}
      aria-label="Gitar adı"
      className="h-9 min-w-40 flex-1 rounded-full border border-transparent bg-transparent px-2 text-sm font-semibold hover:border-ink/10 focus:border-ink/15"
    />
  );
}

/* ───────────── Dışa / içe aktar ───────────── */

function Yedek({ veri }: { veri: DefterVeri }) {
  const dosya = useRef<HTMLInputElement>(null);
  const [gelen, setGelen] = useState<DefterVeri | null>(null);
  const [hata, setHata] = useState<string | null>(null);
  const indir = () => {
    const url = URL.createObjectURL(new Blob([disaAktar(veri)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `guitarflex-defter-${today()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const oku = async (f: File) => {
    setHata(null);
    try {
      setGelen(iceAktarMetin(await f.text()));
    } catch (e) {
      setHata((e as Error).message);
    }
  };
  return (
    <>
      <button type="button" onClick={indir} className="btn-secondary px-3.5 py-1.5 text-sm" title="Defteri JSON dosyası olarak indir (yedek)">
        <Download size={15} aria-hidden /> Dışa aktar
      </button>
      <button type="button" onClick={() => dosya.current?.click()} className="btn-secondary px-3.5 py-1.5 text-sm" title="JSON yedeğinden geri yükle">
        <Upload size={15} aria-hidden /> İçe aktar
      </button>
      <input
        ref={dosya}
        type="file"
        accept="application/json,.json"
        className="hidden"
        aria-hidden
        tabIndex={-1}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) oku(f);
          e.target.value = "";
        }}
      />
      {hata && (
        <p role="alert" className="w-full text-sm text-bad">
          İçe aktarılamadı: {hata}
        </p>
      )}
      {gelen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label="Defteri içe aktar" onKeyDown={(e) => e.key === "Escape" && setGelen(null)}>
          <div className="bg-elevated w-full max-w-md rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-pop)]">
            <h2 className="text-[19px] font-semibold">Defteri içe aktar</h2>
            <p className="mt-2 text-sm text-muted">
              Yedekte {Object.keys(gelen.kayitlar).length} kayıt ve {gelen.gitarlar.length} gitar var. Birleştir: aynı kayıtta son güncellenen kalır. Değiştir: bu bilgisayardaki defter yedekle değişir.
            </p>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button type="button" onClick={() => setGelen(null)} className="btn-secondary px-4 py-2 text-sm" autoFocus>
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => {
                  defterIsle(() => gelen);
                  setGelen(null);
                }}
                className="rounded-full bg-bad px-4 py-2 text-sm font-semibold text-bad-ink hover:opacity-90"
              >
                Değiştir
              </button>
              <button
                type="button"
                onClick={() => {
                  defterIsle((v) => birlestir(v, gelen));
                  setGelen(null);
                }}
                className="btn-primary px-4 py-2 text-sm"
              >
                Birleştir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
