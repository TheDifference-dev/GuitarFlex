"use client";

// Sahne: seçili düğümün büyük görseli ve sade "düğme" ayarları (yalnız görsel; ses işleme yok). Seçim yoksa
// rig'in genel bakışı (afiş) görünür.
import { useState } from "react";
import { ArrowLeft, ArrowRight, Image as ImageIcon, Pencil, Power, Repeat, Shapes, Sparkles, Trash2, X } from "lucide-react";
import EkipmanCizimi from "./Cizimler";
import Dugme from "./Dugme";
import RigAfis from "./RigAfis";
import s from "./Rig.module.css";
import { useFotoUrl } from "@/lib/rig";
import {
  ANA, CIZIMLER, KATEGORILER, dugmeDegeri, duzListe, kapA, kapAdi, kapB, kapDongu, konumBul, paralelBlok, type Dugum, type Ekipman, type Kap, type Rig,
} from "@/lib/rig-cekirdek";

type Ozellik = {
  rig: Rig;
  dugum: Dugum | null;
  bul: (id: string) => Ekipman | null;
  onAyar: (dugme: string, v: number) => void;
  onGecis: () => void;
  onKaydir: (yon: -1 | 1) => void;
  onSil: () => void;
  onDongu: () => void;
  onTasi: (kap: Kap) => void;
  onDuzenle: (e: Ekipman) => void;
  onKapat: () => void;
  /** Boş rig'de "Örnek rig'i yükle" */
  onOrnek?: () => void;
};

const kucukDugme = "inline-flex h-8 items-center gap-1.5 rounded-full bg-ink/[0.06] px-3 text-[13px] transition hover:bg-ink/10 disabled:opacity-40";

export default function BuyukPanel(o: Ozellik) {
  const { rig, dugum, bul } = o;
  const e = dugum ? bul(dugum.ekipmanId) : null;
  const fotoUrl = useFotoUrl(e?.fotoId);
  const [cizimGoster, setCizimGoster] = useState(false);

  if (!dugum) {
    const sayi = duzListe(rig).length;
    return (
      <div className={`${s.sahne} flex min-h-[420px] flex-col justify-center p-5 sm:p-7`}>
        <div className="relative">
          <p className="text-[13px] font-semibold text-muted">Genel bakış</p>
          <h2 className="mt-0.5 text-[28px] font-semibold leading-tight tracking-tight">{rig.ad}</h2>
          <p className="mt-1 text-sm text-muted">{sayi ? `${sayi} ekipman. Büyük görsel ve düğmeler için zincirde bir öğeye tıkla.` : "Rig boş. Sağdaki kitaplıktan ekipmanı aşağıdaki zincire sürükle ya da tıkla."}</p>
          {sayi ? (
            <div className={`${s.buyukGiris} mt-6`}>
              <RigAfis rig={rig} bul={bul} baslikli={false} className="h-auto max-h-[340px] max-w-full rounded-[18px]" />
            </div>
          ) : (
            <div className="mt-8 flex flex-col items-center gap-6">
              <div className={`${s.buyukGiris} flex h-[190px] items-end justify-center gap-6 opacity-80`} aria-hidden>
                <EkipmanCizimi cizim="gitar-tek-kesik" renk="#b5452a" className="h-full w-auto" />
                <EkipmanCizimi cizim="overdrive" renk="#2e9a57" className="h-[52%] w-auto" />
                <EkipmanCizimi cizim="delay" renk="#1f8fd6" className="h-[52%] w-auto" />
                <EkipmanCizimi cizim="amfi-kombo" renk="#2a2622" className="h-[78%] w-auto" />
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
  const fotoVar = !!fotoUrl && !cizimGoster;

  return (
    <div className={`${s.sahne} flex min-h-[420px] flex-col justify-center p-5 sm:p-7`}>
      <div className="relative grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="flex flex-col">
          <div key={dugum.id + (fotoVar ? "f" : "c")} className={`${s.buyuk} ${s.buyukGiris}`}>
            {fotoVar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={fotoUrl} alt={`${e?.ad ?? "Ekipman"} fotoğrafı`} />
            ) : (
              <EkipmanCizimi cizim={cizim} renk={e?.renk ?? "#555555"} degerler={tanim.dugmeler.map((a) => dugmeDegeri(dugum, a))} acik={!dugum.kapali} baslik={`${e?.ad ?? ""} çizimi`} className={dugum.kapali ? "opacity-60 grayscale-[0.5]" : ""} />
            )}
          </div>
          {fotoUrl && (
            <div className="mt-3 flex justify-center">
              <div className="inline-flex rounded-full bg-ink/[0.06] p-0.5 text-[12px]">
                {[
                  { f: true, ad: "Fotoğraf", simge: <ImageIcon size={13} aria-hidden /> },
                  { f: false, ad: "Çizim", simge: <Shapes size={13} aria-hidden /> },
                ].map((x) => (
                  <button key={x.ad} type="button" aria-pressed={fotoVar === x.f} onClick={() => setCizimGoster(!x.f)} className={`flex items-center gap-1 rounded-full px-3 py-1 ${fotoVar === x.f ? "bg-seg font-semibold shadow-[var(--shadow-seg)]" : "text-muted"}`}>
                    {x.simge} {x.ad}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-muted">
                {KATEGORILER.find((k) => k.id === tanim.kategori)?.tekil} · {tanim.ad}
              </p>
              <h2 className="mt-0.5 break-words text-[28px] font-semibold leading-tight tracking-tight">{e?.ad ?? "Silinmiş ekipman"}</h2>
              {konum && <p className="mt-1 text-sm text-muted">{kapAdi(rig, konum.kap, adi)} · {konum.indeks + 1}. sıra</p>}
            </div>
            <button type="button" onClick={o.onKapat} aria-label="Seçimi kaldır (genel bakış)" title="Genel bakış" className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted hover:bg-ink/10 hover:text-text">
              <X size={16} />
            </button>
          </div>

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

          {tanim.dugmeler.length ? (
            <div className="mt-5 flex flex-wrap gap-x-3 gap-y-3" role="group" aria-label="Düğmeler (yalnız görsel)">
              {tanim.dugmeler.map((a) => (
                <Dugme key={a} ad={a} deger={dugmeDegeri(dugum, a)} onDegis={(v) => o.onAyar(a, v)} />
              ))}
            </div>
          ) : (
            <p className="mt-5 text-sm text-muted">Bu ekipmanın ayarlanacak düğmesi yok.</p>
          )}
          <p className="mt-2 text-[12px] text-muted">Düğmeler yalnız görseldir; ses işlenmez. Sürükle ya da ok tuşlarını kullan; çift tıklama 5&apos;e döndürür.</p>

          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-line/70 pt-4">
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
      </div>
    </div>
  );
}
