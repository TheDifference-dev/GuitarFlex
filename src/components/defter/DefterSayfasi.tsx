"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { ArrowDown, ArrowUp, ChevronDown, Download, ExternalLink, GripVertical, Plus, Search, Star, Trash2, Upload, X } from "lucide-react";
import UygulamaSimgesi from "@/components/site/UygulamaSimgesi";
import { kursSimgesi, yerSimgesi, type SimgeTanim } from "@/lib/simge";
import SongsterrBag from "@/components/SongsterrBag";
import { sarkiKutuphanesiAc } from "@/lib/songsterr";
import { today, useProgress } from "@/lib/progress";
import { gunler as ilerlemeGunleri } from "@/lib/oyun";
import { Onay } from "@/components/kutuphane/LibraryBrowser";
import {
  AY_ADLARI, GITAR_TURLERI, GITAR_TURU_ADI, GUN_ADLARI, TUR_ADI, birlestir, defterIsle, disKayit, disaAktar, elleEkle, filtreyeUyar, gitarBasina, gitarEkle, gitarGuncelle,
  gitarSil, gunEkle, gunToplami, gunTarihi, gunlukToplamlar, haftaBasi, haftaGunu, iceAktarMetin, kayitAc, kayitGitari, kayitGuncelle, kayitSil, kisimYaz, konumYaz, listeTasi,
  listele, sonCalisma, sureEkle, sureYaz, useDefter, varsayilanAyarla, yakinPlan, type DefterVeri, type Durum, type Filtre, type FiltreDurum, type GitarTuru, type Kayit, type Tur,
} from "@/lib/defter";
import { DurumDugmeleri, DurumIsareti, GitarSecici, KisimSecici, SureEkle, gitarAdi } from "./Parcalar";
import EylemDugmeleri from "./Eylemler";
import DefterTakvim from "./DefterTakvim";

type Gorunum = "liste" | "takvim";
const tarihYaz = (t: string) => {
  const d = gunTarihi(t);
  return `${d.getDate()} ${AY_ADLARI[d.getMonth()]}`;
};
const segment = (aktif: boolean) => `rounded-full px-3 py-1 text-sm transition ${aktif ? "bg-seg font-semibold text-text shadow-[var(--shadow-seg)]" : "text-muted hover:text-text"}`;
const secim = "h-9 rounded-full border border-ink/10 bg-ink/[0.05] px-3.5 text-sm";

const FILTRELER: [FiltreDurum, string, string][] = [
  ["devam", "Öğreniyorum", "bg-[#ff9f0a]"],
  ["ogrendim", "Öğrendim", "bg-[#30d158]"],
  ["liste", "Listem", "bg-[#d79bf7]"],
  ["takvim", "Takvimde", "bg-[#64b4ff]"],
  ["tumu", "Tümü", ""],
];

/**
 * Çalışma Defteri sayfası: özet, işaretlediğin egzersiz ve şarkıların TABLOSU (Öğreniyorum / Öğrendim / Listem /
 * Takvimde), takvim ve plan, gitarlar, yedek. Satıra tıklamak o egzersizi ya da şarkıyı açar. Defterde yalnız
 * kullanıcının işaretledikleri vardır (bkz. lib/defter-cekirdek.ts › isaretli).
 */
export default function DefterSayfasi({ gunlukHedefDk }: { gunlukHedefDk: number }) {
  const veri = useDefter();
  const p = useProgress();
  const [gorunum, setGorunum] = useState<Gorunum>("liste");
  const [filtre, setFiltre] = useState<Filtre>({ durum: "devam", tur: "", gitar: "", q: "", sira: "son" });
  const [vurgu, setVurgu] = useState<string | null>(null);
  const [notAc, setNotAc] = useState(false);
  const gitarRef = useRef<HTMLDetailsElement>(null);

  // Bağlantı ile açılış: #devam, #ogrendim, #liste, #takvimde, #tumu, #takvim, #plan, #gitarlar ya da bir kaydın kimliği
  useEffect(() => {
    const uygula = () => {
      const h = decodeURIComponent(window.location.hash.slice(1));
      if (!h) return;
      if (h === "devam" || h === "ogrendim" || h === "tumu" || h === "liste") {
        setGorunum("liste");
        setFiltre((f) => ({ ...f, durum: h }));
      } else if (h === "takvimde") {
        setGorunum("liste");
        setFiltre((f) => ({ ...f, durum: "takvim" }));
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
  const liste = useMemo(() => listele(veri, filtre, bugun), [veri, filtre, bugun]);
  const sayilar = useMemo(() => {
    const t = Object.values(veri.kayitlar);
    return Object.fromEntries(FILTRELER.map(([d]) => [d, t.filter((k) => filtreyeUyar(veri, k, d)).length])) as Record<FiltreDurum, number>;
  }, [veri]);

  return (
    <div className="space-y-8">
      <Ozet veri={veri} ilerleme={ilerleme} bugun={bugun} gunlukHedefDk={gunlukHedefDk} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-0.5 rounded-full border border-ink/[0.08] bg-ink/[0.05] p-0.5" role="group" aria-label="Görünüm">
          <button type="button" aria-pressed={gorunum === "liste"} onClick={() => setGorunum("liste")} className={segment(gorunum === "liste")}>
            Tablo
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
        <section aria-label="Defter tablosu" className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap gap-0.5 rounded-full border border-ink/[0.08] bg-ink/[0.05] p-0.5" role="group" aria-label="Filtre">
              {FILTRELER.map(([d, ad, renk]) => (
                <button key={d} type="button" aria-pressed={filtre.durum === d} onClick={() => setFiltre({ ...filtre, durum: d })} className={`${segment(filtre.durum === d)} flex items-center gap-1.5`} data-defter-filtre={d}>
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
              <input value={filtre.q} onChange={(e) => setFiltre({ ...filtre, q: e.target.value })} placeholder="Defterde ara (ad, sanatçı, kısım, not)" className="w-full bg-transparent text-sm outline-none" aria-label="Defterde ara" />
            </label>
            {filtre.durum !== "liste" && filtre.durum !== "takvim" && (
              <select value={filtre.sira} onChange={(e) => setFiltre({ ...filtre, sira: e.target.value as Filtre["sira"] })} className={secim} aria-label="Sıralama">
                <option value="son">Son çalışılan</option>
                <option value="cok">En çok çalışılan</option>
              </select>
            )}
          </div>

          {filtre.durum === "liste" && liste.length > 1 && <p className="text-sm text-muted">Çalışma listem: ileride çalışacakların. Sırayı satırları sürükleyerek ya da ↑ / ↓ ile değiştir.</p>}

          {liste.length ? (
            <DefterTablosu veri={veri} kayitlar={liste} siralanir={filtre.durum === "liste" && !filtre.q && !filtre.tur && !filtre.gitar} vurgu={vurgu} bugun={bugun} />
          ) : (
            <div className="card p-8 text-center text-sm text-muted" data-defter-bos>
              {sayilar.tumu ? (
                "Bu filtrede kayıt yok."
              ) : (
                <>
                  Defter boş. Bir egzersizin ya da şarkının yanındaki <b className="text-text">Öğrendim</b>, <b className="text-text">Öğreniyorum</b>, <b className="text-text">Takvime al</b> ya da{" "}
                  <b className="text-text">Listeye ekle</b> düğmesine bastığında buraya gelir. Yalnız işaretlediklerin defterde tutulur.{" "}
                  <Link href="/sarki-kutuphanesi/rehber" className="font-semibold text-[var(--link)]">
                    Rehber Şarkılar
                  </Link>{" "}
                  ·{" "}
                  <Link href="/elektro" className="font-semibold text-[var(--link)]">
                    Teknik Egzersizler
                  </Link>
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

/* ───────────── Tablo ───────────── */

/** Kaydın simgesi ve rengi (yeni renk dili): ders kursunun rengi, Songsterr şarkıları Şarkı Kütüphanesi, kütüphane
 * parçaları Tab Oynatıcı, serbest notlar defterin rengi */
function kayitSimgesi(k: Kayit): SimgeTanim {
  if (k.tur === "egzersiz") return kursSimgesi(k.id.slice("egzersiz:".length).split("/")[0]);
  if (disKayit(k.id)) return yerSimgesi("sarki-kutuphanesi");
  if (k.tur === "sarki") return yerSimgesi("kutuphane");
  return yerSimgesi("defter");
}

const TH = "px-3 py-2 text-left text-xs font-medium text-muted whitespace-nowrap";
const TD = "px-3 py-2.5 align-middle";

/**
 * Defter tablosu: tür, ad, kurs/sanatçı, kısım, durum, son çalışma, toplam süre, gitar, planlı tarih. Satıra
 * tıklamak (ya da Enter) kaydı açar: ders ve kütüphane sayfası uygulamada, Songsterr şarkısı Songsterr penceresinde.
 * Ayrıntı (eylemler, not, oturum geçmişi) satır sonundaki okla açılır. Listem filtresinde satırlar sürüklenir.
 */
function DefterTablosu({ veri, kayitlar, siralanir, vurgu, bugun }: { veri: DefterVeri; kayitlar: Kayit[]; siralanir: boolean; vurgu: string | null; bugun: string }) {
  const router = useRouter();
  const [acik, setAcik] = useState<string | null>(vurgu);
  const [surukle, setSurukle] = useState<string | null>(null);
  const [sil, setSil] = useState<Kayit | null>(null);
  const ac = (k: Kayit) => {
    if (!k.href) return setAcik((x) => (x === k.id ? null : k.id));
    if (disKayit(k.id) || k.href.startsWith("http")) {
      defterIsle((v) => kayitAc(v, k));
      if (!sarkiKutuphanesiAc(k.href)) window.open(k.href, "_blank", "noopener,noreferrer");
    } else router.push(k.href);
  };
  return (
    <div className="card overflow-x-auto !p-0">
      <table className="w-full min-w-[960px] border-collapse text-sm" data-defter-tablosu>
        <thead className="border-b border-line/70">
          <tr>
            {siralanir && <th className={TH}>Sıra</th>}
            <th className={TH}>Tür</th>
            <th className={TH}>Ad</th>
            <th className={TH}>Kurs / sanatçı</th>
            <th className={TH}>Kısım</th>
            <th className={TH}>Durum</th>
            <th className={TH}>Son çalışma</th>
            <th className={`${TH} text-right`}>Toplam süre</th>
            <th className={TH}>Gitar</th>
            <th className={TH}>Planlı tarih</th>
            <th className={TH}>
              <span className="sr-only">Ayrıntı</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line/60">
          {kayitlar.map((k, i) => {
            const son = sonCalisma(k);
            const plan = yakinPlan(k, bugun);
            const listede = veri.liste.includes(k.id);
            const dis = disKayit(k.id) || k.href.startsWith("http");
            const acikMi = acik === k.id;
            return (
              <Fragment key={k.id}>
                <tr
                  data-kayit={k.id}
                  tabIndex={0}
                  draggable={siralanir}
                  onDragStart={(e) => {
                    setSurukle(k.id);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragOver={(e) => siralanir && surukle && e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (surukle && surukle !== k.id) defterIsle((v) => listeTasi(v, surukle, v.liste.indexOf(k.id)));
                    setSurukle(null);
                  }}
                  onDragEnd={() => setSurukle(null)}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest("button, a, input, select, textarea")) return;
                    ac(k);
                  }}
                  onKeyDown={(e) => {
                    if (e.target !== e.currentTarget) return;
                    if (e.key === "Enter") ac(k);
                  }}
                  aria-label={`${k.baslik}: aç`}
                  className={`cursor-pointer transition hover:bg-ink/[0.04] focus-visible:bg-ink/[0.05] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--accent)] ${surukle === k.id ? "opacity-50" : ""} ${vurgu === k.id ? "bg-accent/[0.07]" : ""}`}
                >
                  {siralanir && (
                    <td className={`${TD} whitespace-nowrap`}>
                      <span className="flex items-center gap-0.5 text-muted">
                        <GripVertical size={14} aria-hidden className="cursor-grab" />
                        <span className="w-5 text-center text-xs font-semibold tabular-nums text-text">{i + 1}</span>
                        <button type="button" disabled={i === 0} onClick={() => defterIsle((v) => listeTasi(v, k.id, i - 1))} className="flex size-6 items-center justify-center rounded-full hover:bg-ink/[0.08] disabled:opacity-30" aria-label={`${k.baslik}: yukarı taşı`}>
                          <ArrowUp size={13} />
                        </button>
                        <button type="button" disabled={i === kayitlar.length - 1} onClick={() => defterIsle((v) => listeTasi(v, k.id, i + 1))} className="flex size-6 items-center justify-center rounded-full hover:bg-ink/[0.08] disabled:opacity-30" aria-label={`${k.baslik}: aşağı taşı`}>
                          <ArrowDown size={13} />
                        </button>
                      </span>
                    </td>
                  )}
                  <td className={`${TD} whitespace-nowrap`}>
                    <span className="flex items-center gap-2" data-renk={kayitSimgesi(k).renk}>
                      <UygulamaSimgesi simge={kayitSimgesi(k)} boyut={24} />
                      <span className="text-xs text-muted">{TUR_ADI[k.tur]}</span>
                    </span>
                  </td>
                  <td className={`${TD} max-w-[16rem]`}>
                    <span className="flex items-center gap-1.5 font-semibold">
                      <span className="truncate">{k.baslik}</span>
                      {dis && <ExternalLink size={12} className="shrink-0 text-muted" aria-label="Songsterr'de açılır" />}
                    </span>
                  </td>
                  <td className={`${TD} max-w-[12rem] truncate text-muted`}>{k.altBaslik || "—"}</td>
                  <td className={`${TD} whitespace-nowrap`}>{k.kisim ? kisimYaz(k.kisim) : "—"}</td>
                  <td className={TD}>
                    <span className="flex flex-wrap items-center gap-1">
                      {k.durum && <DurumIsareti durum={k.durum} />}
                      {listede && <ListeIsareti sira={veri.liste.indexOf(k.id) + 1} />}
                      {!k.durum && !listede && (k.planli.length ? <PlanIsareti /> : <span className="text-xs text-muted" title="İşareti kaldırıldı; notu ya da süresi olduğu için defterde duruyor">işaretsiz not</span>)}
                    </span>
                  </td>
                  <td className={`${TD} whitespace-nowrap tabular-nums`}>{son ? tarihYaz(son) : k.acildi ? "açıldı" : "—"}</td>
                  <td className={`${TD} whitespace-nowrap text-right font-semibold tabular-nums`}>{k.toplamSure ? sureYaz(k.toplamSure) : "—"}</td>
                  <td className={`${TD} max-w-[9rem] truncate`}>{gitarAdi(veri, kayitGitari(veri, k))}</td>
                  <td className={`${TD} whitespace-nowrap tabular-nums`}>
                    {plan ? (
                      <span className={plan < bugun ? "text-muted" : "font-semibold"}>
                        {tarihYaz(plan)}
                        {k.planli.length > 1 ? <span className="font-normal text-muted"> +{k.planli.length - 1}</span> : null}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className={`${TD} w-0`}>
                    <button
                      type="button"
                      onClick={() => setAcik(acikMi ? null : k.id)}
                      aria-expanded={acikMi}
                      aria-label={`${k.baslik}: ayrıntı`}
                      title="Ayrıntı: eylemler, kısım, gitar, not, oturumlar"
                      className="flex size-8 items-center justify-center rounded-full text-muted hover:bg-ink/[0.08] hover:text-text"
                    >
                      <ChevronDown size={16} className={`transition ${acikMi ? "rotate-180" : ""}`} />
                    </button>
                  </td>
                </tr>
                {acikMi && (
                  <tr className="bg-ink/[0.025]">
                    <td colSpan={siralanir ? 11 : 10} className="px-4 py-4">
                      <KayitAyrintisi veri={veri} kayit={k} onSil={() => setSil(k)} />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
      {sil && (
        <Onay
          baslik={`"${sil.baslik}" defterden silinsin mi?`}
          onIptal={() => setSil(null)}
          onEvet={() => {
            defterIsle((v) => kayitSil(v, sil.id));
            setSil(null);
          }}
        >
          Kaydın bütün işaretleri, notu ve {sil.oturumlar.length} oturumu silinir (birkaç saniye &quot;Geri al&quot; ile geri getirilebilir). Günlük görev ve ders süreleri (Profil) değişmez.
        </Onay>
      )}
    </div>
  );
}

function ListeIsareti({ sira }: { sira: number }) {
  return <span className="inline-flex items-center rounded-full bg-[#d79bf7] px-2 py-0.5 text-[11px] font-semibold text-[#1e0a29]">Listem #{sira}</span>;
}
function PlanIsareti() {
  return <span className="inline-flex items-center rounded-full bg-[#64b4ff] px-2 py-0.5 text-[11px] font-semibold text-[#04121f]">Planlı</span>;
}

/** Satırın ayrıntısı: dört eylem, kısım, gitar, (Songsterr ve serbest notta) elle süre, not, oturum geçmişi, sil */
function KayitAyrintisi({ veri, kayit: k, onSil }: { veri: DefterVeri; kayit: Kayit; onSil: () => void }) {
  const dis = disKayit(k.id) || k.href.startsWith("http");
  const bilgi = { id: k.id, tur: k.tur, baslik: k.baslik, altBaslik: k.altBaslik, href: k.href };
  const yer = konumYaz(k);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {k.tur === "serbest" ? (
          <DurumDugmeleri durum={k.durum} kisim={k.kisim} ad={k.baslik} onDurum={(d) => defterIsle((v) => kayitGuncelle(v, k.id, { durum: d }))} />
        ) : (
          <EylemDugmeleri bilgi={bilgi} kisim={k.kisim} />
        )}
        <KisimSecici deger={k.kisim} onDegis={(x) => defterIsle((v) => kayitGuncelle(v, k.id, { kisim: x }))} etiket={`${k.baslik}: kısım`} />
        <GitarSecici veri={veri} deger={k.gitar} onDegis={(g) => defterIsle((v) => kayitGuncelle(v, k.id, { gitar: g }))} />
        {(dis || k.tur === "serbest") && <SureEkle ad={k.baslik} onEkle={(sn) => defterIsle((v) => sureEkle(v, bilgi, sn, { elle: true, gitar: kayitGitari(v, v.kayitlar[k.id]) }))} />}
        <span className="ml-auto flex items-center gap-2">
          {k.href &&
            (dis ? (
              <SongsterrBag q={k.href} onAc={() => defterIsle((v) => kayitAc(v, bilgi))} className="btn-secondary px-3.5 py-1.5 text-sm">
                Songsterr&apos;de aç <ExternalLink size={14} aria-hidden />
              </SongsterrBag>
            ) : (
              <Link href={yer && k.tur === "egzersiz" ? `${k.href}#devam` : k.href} className="btn-primary px-3.5 py-1.5 text-sm">
                {yer ? "Kaldığın yerden devam et" : "Aç"}
              </Link>
            ))}
          <button type="button" onClick={onSil} className="flex size-8 items-center justify-center rounded-full text-muted hover:bg-ink/[0.08] hover:text-bad" aria-label={`${k.baslik} kaydını sil`} title="Kaydı sil">
            <Trash2 size={15} />
          </button>
        </span>
      </div>
      {yer && (
        <p className="text-sm">
          <span className="text-muted">Kaldığın yer: </span>
          <span className="font-semibold">{yer}</span>
        </p>
      )}
      <NotAlani kayit={k} />
      {k.oturumlar.length > 0 && (
        <details className="text-sm">
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
      className="w-full resize-y rounded-xl border border-ink/10 bg-[var(--bg)] px-3 py-2 text-sm placeholder:text-muted"
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
                  defterIsle(() => gelen, { sessiz: true });
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
