"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight, StepForward } from "lucide-react";
import UygulamaSimgesi from "@/components/site/UygulamaSimgesi";
import { yerSimgesi } from "@/lib/simge";
import { defterIsle, kayitGuncelle, konumYaz, sureYaz, useDefter, type Kayit, type KayitBilgisi } from "@/lib/defter";
import { GitarSecici, KisimSecici } from "./Parcalar";
import EylemDugmeleri from "./Eylemler";

/**
 * Ders ve kütüphane sayfalarındaki Çalışma Defteri şeridi: kısım, dört eylem (Öğrendim, Öğreniyorum, Takvime al,
 * Listeye ekle), gitar ve "kaldığın yer" (son kısım, ölçü, hız) ile "Oradan devam et". Defterde yalnız işaretlenenler
 * vardır: işaretlenmişse çalma süresi sayfanın kendi sayacından deftere de yazılır (ilerleme kaydına her zaman).
 */
export default function DefterSeridi({
  bilgi,
  kisimlar,
  canliKisim,
  onKisimSec,
  onDevam,
}: {
  bilgi: KayitBilgisi;
  /** Ders kısımları (A / A′ / B / C): açılır liste; verilmezse serbest metin */
  kisimlar?: string[];
  /** Oynatıcıda o an seçili / çalınan kısım */
  canliKisim?: string | null;
  /** Ders kısmı seçilince (oynatıcıda o kısım döngüye girer) */
  onKisimSec?: (k: string | null) => void;
  onDevam?: (k: Kayit) => void;
}) {
  const veri = useDefter();
  const kayit = veri.kayitlar[bilgi.id] as Kayit | undefined;
  const [secim, setSecim] = useState<string | null | undefined>(undefined);
  const kisim = onKisimSec ? (canliKisim ?? kayit?.kisim ?? null) : secim !== undefined ? secim : (kayit?.kisim ?? canliKisim ?? null);

  const kisimDegis = (k: string | null) => {
    if (onKisimSec) onKisimSec(k);
    else setSecim(k);
    if (kayit) defterIsle((v) => kayitGuncelle(v, bilgi.id, { kisim: k }));
  };
  const yer = kayit ? konumYaz(kayit) : "";

  return (
    <section aria-label="Çalışma Defteri" data-defter-seridi className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-ink/[0.06] bg-[var(--panel)] px-3 py-2">
      <Link href={`/defter#${encodeURIComponent(bilgi.id)}`} className="flex shrink-0 items-center gap-2 rounded-lg text-[13px] font-semibold hover:text-[var(--link)]" title="Çalışma Defteri'nde aç">
        <UygulamaSimgesi simge={yerSimgesi("defter")} boyut={24} />
        Defter
      </Link>
      <KisimSecici deger={kisim} onDegis={kisimDegis} secenekler={kisimlar} kompakt />
      <EylemDugmeleri bilgi={bilgi} kisim={kisim} kompakt />
      {kayit && <GitarSecici veri={veri} deger={kayit.gitar} kompakt onDegis={(g) => defterIsle((v) => kayitGuncelle(v, bilgi.id, { gitar: g }))} />}
      <div className="ml-auto flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        {kayit && kayit.toplamSure > 0 && <span className="tabular-nums text-muted">Toplam {sureYaz(kayit.toplamSure)}</span>}
        {yer ? (
          <>
            <span className="min-w-0" data-kaldigin-yer>
              <span className="text-muted">Kaldığın yer: </span>
              <span className="font-semibold">{yer}</span>
            </span>
            {onDevam && kayit && (
              <button
                type="button"
                onClick={() => onDevam(kayit)}
                className="inline-flex h-7 items-center gap-1 rounded-full bg-ink/[0.06] px-2.5 font-semibold text-[var(--link)] hover:bg-ink/10 focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                title="Döngüyü ve konumu kaldığın ölçüye, hızı son çaldığın hıza taşır"
              >
                <StepForward size={13} aria-hidden /> Oradan devam et
              </button>
            )}
          </>
        ) : (
          <span className="text-muted">{kayit ? "Çaldığında süre, ölçü ve hız deftere yazılır." : "İşaretlersen deftere eklenir; süre ve kaldığın yer orada tutulur."}</span>
        )}
        <Link href="/defter" className="inline-flex items-center text-[var(--link)] hover:underline" aria-label="Çalışma Defteri'ne git">
          Deftere git <ChevronRight size={12} aria-hidden />
        </Link>
      </div>
    </section>
  );
}
