"use client";

// Sahne: seçili düğümün büyük görseli (sahne zemininde, tam ayrıntılı çizim ya da kullanıcının fotoğrafı), sade "düğme"
// ayarları ve seçmeli ayarlar (kabinde hoparlör türü). Yalnız görsel; ses işleme yok. Seçim yoksa rig'in genel bakışı.
import { ArrowLeft, ArrowRight, Camera, Image as ImageIcon, Pencil, Power, Repeat, Shapes, Sparkles, Trash2, X } from "lucide-react";
import EkipmanCizimi, { HoparlorCizimi, boyut } from "./Cizimler";
import Dugme from "./Dugme";
import EkipmanGorseli, { fotoTercihi } from "./Gorsel";
import RigAfis from "./RigAfis";
import s from "./Rig.module.css";
import {
  ANA, CIZIMLER, KATALOG, KATEGORILER, cizimEtiketi, dugmeDegeri, duzListe, kapA, kapAdi, kapB, kapDongu, konumBul, paralelBlok, secenekDegeri,
  type Cizim, type Dugum, type Ekipman, type Kap, type Rig, type Secenek,
} from "@/lib/rig-cekirdek";

type Ozellik = {
  rig: Rig;
  dugum: Dugum | null;
  bul: (id: string) => Ekipman | null;
  onAyar: (dugme: string, v: number) => void;
  onSecenek: (s: Secenek, sira: number) => void;
  onGecis: () => void;
  onKaydir: (yon: -1 | 1) => void;
  onSil: () => void;
  onDongu: () => void;
  onTasi: (kap: Kap) => void;
  onDuzenle: (e: Ekipman) => void;
  onGorsel: (e: Ekipman, g: "foto" | "cizim") => void;
  onKapat: () => void;
  /** Boş rig'de "Örnek rig'i yükle" */
  onOrnek?: () => void;
};

const kucukDugme = "inline-flex h-8 items-center gap-1.5 rounded-full bg-ink/[0.06] px-3 text-[13px] transition hover:bg-ink/10 disabled:opacity-40";
const SAHNE_H = 400;
const SAHNE_W = 820;

/** Çizimin sahnedeki yaklaşık genişliği (px): ışık filtreleri buna göre ayarlanır */
function sahneGenisligi(c: Cizim) {
  const [w, h] = boyut(c);
  return Math.min(SAHNE_W, (SAHNE_H * w) / (h + 8));
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
          <p className="mt-1 text-sm text-muted">{sayi ? `${sayi} ekipman. Büyük görsel ve düğmeler için zincirde bir öğeye tıkla.` : "Rig boş. Sağdaki kitaplıktan ekipmanı aşağıdaki zincire sürükle ya da tıkla."}</p>
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

  return (
    <div className={`${s.sahne} flex min-h-[460px] flex-col`}>
      {/* sahne: zemin, spot ışığı ve büyük görsel */}
      <div className={s.vitrin}>
        <div key={dugum.id + (fotoVar ? "f" : "c")} className={`${s.buyuk} ${s.buyukGiris}`}>
          <EkipmanGorseli e={e} dugum={dugum} ayrinti="tam" pikselGenislik={sahneGenisligi(cizim)} golge baslik={`${e?.ad ?? ""} ${fotoVar ? "fotoğrafı" : "çizimi"}`} className={dugum.kapali ? "opacity-60 grayscale-[0.5]" : ""} />
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

      <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-muted">
            {KATEGORILER.find((k) => k.id === tanim.kategori)?.tekil} · {tanim.ad}
          </p>
          <h2 className="mt-0.5 break-words text-[28px] font-semibold leading-tight tracking-tight">{e?.ad ?? "Silinmiş ekipman"}</h2>
          {konum && <p className="mt-1 text-sm text-muted">{kapAdi(rig, konum.kap, adi)} · {konum.indeks + 1}. sıra</p>}
          <div className="mt-4 flex flex-wrap items-center gap-2">
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
            <p className="mt-4 rounded-xl bg-ink/[0.04] px-3 py-2 text-[12.5px] leading-5 text-muted">
              Bu senin ekipmanın: ad senin etiketin, görsel türe uygun genel bir GuitarFlex çizimi.{" "}
              <button type="button" onClick={() => o.onDuzenle(e)} className="inline-flex items-center gap-1 font-semibold text-accent hover:underline">
                <Camera size={13} aria-hidden /> Kendi fotoğrafını ekle
              </button>
            </p>
          )}
        </div>

        <div className="min-w-0">
          {tanim.secenekler?.map((sc) => {
            const sec = secenekDegeri(dugum, sc);
            return (
              <div key={sc.ad} role="radiogroup" aria-label={sc.ad} className="mb-4">
                <p className="mb-2 text-[12px] font-semibold text-muted">{sc.ad}</p>
                <div className="flex flex-wrap gap-2">
                  {sc.degerler.map((d, i) => {
                    const [ad, aciklama] = d.split(" · ");
                    return (
                      <button key={d} type="button" role="radio" aria-checked={sec === i} onClick={() => o.onSecenek(sc, i)} className={`flex items-center gap-2 rounded-2xl py-1.5 pl-1.5 pr-3 text-left text-[12px] transition ${sec === i ? "bg-accent/12 shadow-[inset_0_0_0_2px_var(--accent)]" : "bg-ink/[0.05] hover:bg-ink/10"}`}>
                        <HoparlorCizimi tur={i} pikselGenislik={44} className="size-11 shrink-0" />
                        <span>
                          <span className="block font-semibold">{ad}</span>
                          <span className="block text-muted">{aciklama}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {tanim.dugmeler.length ? (
            <>
              <div className="flex flex-wrap gap-x-3 gap-y-3" role="group" aria-label="Düğmeler (yalnız görsel)">
                {tanim.dugmeler.map((a) => (
                  <Dugme key={a} ad={a} deger={dugmeDegeri(dugum, a)} onDegis={(v) => o.onAyar(a, v)} />
                ))}
              </div>
              <p className="mt-2 text-[12px] text-muted">Düğmeler yalnız görseldir; ses işlenmez. Sürükle ya da ok tuşlarını kullan; çift tıklama 5&apos;e döndürür.</p>
            </>
          ) : (
            !tanim.secenekler && <p className="text-sm text-muted">Bu ekipmanın ayarlanacak düğmesi yok.</p>
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
