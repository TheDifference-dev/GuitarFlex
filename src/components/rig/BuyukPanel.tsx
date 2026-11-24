"use client";

// Sahne: seçili düğümün büyük görseli (sahne zemininde, tam ayrıntılı çizim ya da kullanıcının fotoğrafı) ve bilgisi.
// Düğmeler ayarlanmaz: çizimde sabit, modele göre doğal bir konumda durur. Kabinde hoparlör türü seçilir. Seçim yoksa
// rig'in genel bakışı.
import { ArrowLeft, ArrowRight, Camera, Image as ImageIcon, Pencil, Plus, Power, Repeat, Shapes, Sparkles, Trash2, X } from "lucide-react";
import EkipmanCizimi, { HoparlorCizimi, boyut } from "./Cizimler";
import EkipmanGorseli, { fotoTercihi } from "./Gorsel";
import RigAfis from "./RigAfis";
import s from "./Rig.module.css";
import {
  ANA, CIZIMLER, KATALOG, KATEGORILER, cizimEtiketi, duzListe, esinSatiri, eslesenKabin, kapA, kapAdi, kapB, kapDongu, konumBul, paralelBlok, secenekDegeri,
  type Cizim, type Dugum, type Ekipman, type Gorunum, type Kap, type Rig, type Secenek,
} from "@/lib/rig-cekirdek";

type Ozellik = {
  rig: Rig;
  dugum: Dugum | null;
  bul: (id: string) => Ekipman | null;
  onSecenek: (s: Secenek, sira: number) => void;
  onGecis: () => void;
  onKaydir: (yon: -1 | 1) => void;
  onSil: () => void;
  onDongu: () => void;
  onTasi: (kap: Kap) => void;
  onDuzenle: (e: Ekipman) => void;
  onGorsel: (e: Ekipman, g: "foto" | "cizim") => void;
  onKapat: () => void;
  /** Kitaplıktan bir modeli zincire ekler (amfinin eşleşen kabini için; seçili amfinin arkasına) */
  onEkle?: (e: Ekipman) => void;
  /** Boş rig'de "Örnek rig'i yükle" */
  onOrnek?: () => void;
};

const kucukDugme = "inline-flex h-8 items-center gap-1.5 rounded-full bg-ink/[0.06] px-3 text-[13px] transition hover:bg-ink/10 disabled:opacity-40";
const SAHNE_H = 470;
const SAHNE_W = 900;

/** Çizimin sahnedeki yaklaşık genişliği (px): ışık filtreleri buna göre ayarlanır */
function sahneGenisligi(c: Cizim, g?: Gorunum) {
  const [w, h] = boyut(c, g);
  return Math.min(SAHNE_W, (SAHNE_H * w) / (h + 8));
}

/** "Pedal · Overdrive · …"; tür adı kategoriyle başlıyorsa yinelenmez ("Kabin · 4x12 kapalı") */
function turSatiri(kategori: string, ad: string) {
  const tekil = KATEGORILER.find((k) => k.id === kategori)?.tekil ?? "";
  return ad.toLocaleLowerCase("tr").startsWith(tekil.toLocaleLowerCase("tr")) ? ad : `${tekil} · ${ad}`;
}

const vitrin = (c: Cizim) => KATALOG.find((e) => e.cizim === c)!;

export default function BuyukPanel(o: Ozellik) {
  const { rig, dugum, bul } = o;
  const e = dugum ? bul(dugum.ekipmanId) : null;

  if (!dugum) {
    const sayi = duzListe(rig).length;
    return (
      <div className={`${s.sahne} flex min-h-[460px] flex-col justify-center p-5 sm:p-7`}>
        <div className="relative">
          <p className="text-[13px] font-semibold text-muted">Genel bakış</p>
          <h2 className="mt-0.5 text-[28px] font-semibold leading-tight tracking-tight">{rig.ad}</h2>
          <p className="mt-1 text-sm text-muted">{sayi ? `${sayi} ekipman. Büyük görsel için zincirde bir öğeye tıkla.` : "Rig boş. Sağdaki kitaplıktan ekipmanı aşağıdaki zincire sürükle ya da tıkla."}</p>
          {sayi ? (
            <div className={`${s.buyukGiris} mt-6`}>
              <RigAfis rig={rig} bul={bul} baslikli={false} className="h-auto max-h-[360px] max-w-full rounded-[18px]" />
            </div>
          ) : (
            <div className="mt-8 flex flex-col items-center gap-6">
              <div className={`${s.buyukGiris} flex h-[210px] items-end justify-center gap-6`} aria-hidden>
                {(["gitar-tek-kesik", "overdrive", "delay", "amfi-kombo"] as Cizim[]).map((c, i) => (
                  <EkipmanCizimi key={c} cizim={c} renk={vitrin(c).renk} etiket={cizimEtiketi(vitrin(c))} ayrinti="tam" pikselGenislik={[70, 90, 90, 190][i]} className={["h-full", "h-[50%]", "h-[50%]", "h-[82%]"][i] + " w-auto"} />
                ))}
              </div>
              {o.onOrnek && (
                <button type="button" onClick={o.onOrnek} className="btn-primary px-5 py-2 text-[15px]">
                  <Sparkles size={15} aria-hidden /> Örnek rig&apos;i yükle
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  const cizim = e?.cizim ?? "boost";
  const tanim = CIZIMLER[cizim];
  const konum = konumBul(rig, dugum.id);
  const amfi = tanim.kategori === "amfi";
  const p = paralelBlok(rig);
  const adi = (d: Dugum) => bul(d.ekipmanId)?.ad ?? "Amfi";
  // Taşınabilecek kaplar: ana zincir, A/B yolları, (kendi değilse ve kendisinin döngüsü yoksa) açık FX loop'lar
  const kaplar: Kap[] = [ANA, ...(p ? [kapA(p.id), kapB(p.id)] : []), ...(dugum.dongu ? [] : duzListe(rig).filter((x) => x.dugum.dongu && x.dugum.id !== dugum.id).map((x) => kapDongu(x.dugum.id)))];
  const fotoVar = fotoTercihi(e);
  const kabin = eslesenKabin(e);
  const kabinZincirde = !!kabin && duzListe(rig).some((x) => x.dugum.ekipmanId === kabin.id);
  const bilgi = e ? [e.kanal ? `${e.kanal} kanal` : "", e.hoparlorDuzeni ? `Hoparlör: ${e.hoparlorDuzeni}` : "", e.anahtarlar?.length ? `Anahtar: ${e.anahtarlar.join(", ")}` : ""].filter(Boolean).join(" · ") : "";

  return (
    <div className={`${s.sahne} flex min-h-[460px] flex-col`}>
      {/* sahne: zemin, spot ışığı ve büyük görsel */}
      <div className={s.vitrin}>
        <div key={dugum.id + (fotoVar ? "f" : "c")} className={`${s.buyuk} ${s.buyukGiris}`}>
          <EkipmanGorseli e={e} dugum={dugum} ayrinti="tam" pikselGenislik={sahneGenisligi(cizim, e?.gorunum)} golge baslik={`${e?.ad ?? ""} ${fotoVar ? "fotoğrafı" : "çizimi"}`} className={dugum.kapali ? "opacity-60 grayscale-[0.5]" : ""} />
        </div>
        <button type="button" onClick={o.onKapat} aria-label="Seçimi kaldır (genel bakış)" title="Genel bakış" className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-black/25 text-white/85 backdrop-blur hover:bg-black/40">
          <X size={16} />
        </button>
        {e?.fotoId && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 rounded-full bg-black/35 p-0.5 text-[12px] text-white backdrop-blur" role="group" aria-label="Görsel">
            {[
              { f: true, ad: "Fotoğraf", simge: <ImageIcon size={13} aria-hidden /> },
              { f: false, ad: "Çizim", simge: <Shapes size={13} aria-hidden /> },
            ].map((x) => (
              <button key={x.ad} type="button" aria-pressed={fotoVar === x.f} onClick={() => o.onGorsel(e, x.f ? "foto" : "cizim")} className={`flex items-center gap-1 rounded-full px-3 py-1 ${fotoVar === x.f ? "bg-white font-semibold text-black" : "text-white/80"}`}>
                {x.simge} {x.ad}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-x-8 gap-y-4 p-5 sm:p-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-muted">{turSatiri(tanim.kategori, e?.turAd ?? tanim.ad)}</p>
          <h2 className="mt-0.5 break-words text-[28px] font-semibold leading-tight tracking-tight">{e?.ad ?? "Silinmiş ekipman"}</h2>
          {konum && <p className="mt-1 text-sm text-muted">{kapAdi(rig, konum.kap, adi)} · {konum.indeks + 1}. sıra</p>}
          {e?.esin && <p className="mt-3 text-[13.5px] font-semibold">{esinSatiri(e)}</p>}
          {e?.aciklama && <p className="mt-1.5 text-[13px] leading-5 text-muted">{e.aciklama}</p>}
          {bilgi && <p className="mt-1.5 text-[12px] text-muted">{bilgi}</p>}
        </div>

        <div className="min-w-0 space-y-3">
          {kabin && (
            <div className="flex items-center gap-3 rounded-xl bg-ink/[0.04] px-3 py-2 text-[12.5px]">
              <span className="min-w-0 flex-1">
                <span className="block text-muted">Eşleşen kabin</span>
                <span className="font-semibold">{kabin.ad}</span>
                {kabin.hoparlorDuzeni && <span className="text-muted"> · {kabin.hoparlorDuzeni}</span>}
              </span>
              {o.onEkle && (
                <button type="button" disabled={kabinZincirde} onClick={() => o.onEkle?.(kabin)} className="inline-flex h-7 shrink-0 items-center gap-1 rounded-full bg-accent px-3 text-[12px] font-semibold text-accent-ink disabled:bg-ink/[0.06] disabled:text-muted">
                  {kabinZincirde ? "Zincirde" : <><Plus size={13} aria-hidden /> Arkasına ekle</>}
                </button>
              )}
            </div>
          )}
          {tanim.secenekler?.map((sc) => {
            // kabinde hoparlör türü: ızgaranın ardındaki koniyi değiştirir (ayar düğmesi değil, donanım seçimi)
            const sec = secenekDegeri(dugum, sc);
            return (
              <div key={sc.ad} role="radiogroup" aria-label={sc.ad}>
                <p className="mb-1.5 text-[12px] font-semibold text-muted">{sc.ad}</p>
                <div className="flex flex-wrap gap-1.5">
                  {sc.degerler.map((d, i) => (
                    <button key={d} type="button" role="radio" aria-checked={sec === i} title={d} onClick={() => o.onSecenek(sc, i)} className={`flex items-center gap-1.5 rounded-full py-1 pl-1 pr-3 text-[12px] transition ${sec === i ? "bg-accent/12 font-semibold shadow-[inset_0_0_0_2px_var(--accent)]" : "bg-ink/[0.05] hover:bg-ink/10"}`}>
                      <HoparlorCizimi tur={i} pikselGenislik={24} className="size-6 shrink-0" />
                      {d.split(" · ")[0]}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" role="switch" aria-checked={!dugum.kapali} onClick={o.onGecis} className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold transition ${dugum.kapali ? "bg-ink/[0.06] text-muted" : "bg-ok text-ok-ink"}`}>
              <Power size={14} aria-hidden /> {dugum.kapali ? "Kapalı (bypass)" : "Açık"}
            </button>
            {amfi && (
              <button type="button" onClick={o.onDongu} aria-pressed={!!dugum.dongu} className={kucukDugme} disabled={!!konum && konum.kap.startsWith("dongu:")}>
                <Repeat size={14} aria-hidden /> {dugum.dongu ? "FX loop'u kapat" : "FX loop aç"}
              </button>
            )}
            {e?.ozel && (
              <button type="button" onClick={() => o.onDuzenle(e)} className={kucukDugme}>
                <Pencil size={13} aria-hidden /> Ekipmanı düzenle
              </button>
            )}
          </div>
          {e?.benim && !e.fotoId && (
            <p className="rounded-xl bg-ink/[0.04] px-3 py-2 text-[12.5px] leading-5 text-muted">
              Bu senin ekipmanın: ad senin etiketin, görsel türe uygun genel bir GuitarFlex çizimi.{" "}
              <button type="button" onClick={() => o.onDuzenle(e)} className="inline-flex items-center gap-1 font-semibold text-accent hover:underline">
                <Camera size={13} aria-hidden /> Kendi fotoğrafını ekle
              </button>
            </p>
          )}
        </div>
      </div>

      <div className="mx-5 mb-5 flex flex-wrap items-center gap-2 border-t border-line/70 pt-4 sm:mx-6">
        <button type="button" onClick={() => o.onKaydir(-1)} className={kucukDugme} aria-label="Sola taşı">
          <ArrowLeft size={14} aria-hidden /> Sola
        </button>
        <button type="button" onClick={() => o.onKaydir(1)} className={kucukDugme} aria-label="Sağa taşı">
          Sağa <ArrowRight size={14} aria-hidden />
        </button>
        {kaplar.length > 1 && konum && (
          <label className="inline-flex h-8 items-center gap-1.5 rounded-full bg-ink/[0.06] pl-3 pr-1 text-[13px]">
            Konum
            <select value={konum.kap} onChange={(ev) => o.onTasi(ev.target.value)} className="h-7 rounded-full bg-transparent pr-1 text-[13px] font-semibold">
              {kaplar.map((k) => (
                <option key={k} value={k}>
                  {kapAdi(rig, k, adi)}
                </option>
              ))}
            </select>
          </label>
        )}
        <button type="button" onClick={o.onSil} className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] text-bad hover:bg-bad/10">
          <Trash2 size={14} aria-hidden /> Zincirden kaldır
        </button>
      </div>
    </div>
  );
}
