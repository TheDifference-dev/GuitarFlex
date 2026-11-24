"use client";

import Link from "next/link";
import { useState } from "react";
import { defterIsle, kayitGitari, kayitGuncelle, sureEkle, sureYaz, useDefter, type KayitBilgisi } from "@/lib/defter";
import { KisimSecici, SureEkle } from "./Parcalar";
import EylemDugmeleri from "./Eylemler";

/**
 * Şarkı kartındaki defter kutusu (Rehber / Tüm Şarkılar, Songsterr): kısım, dört eylem (Öğrendim, Öğreniyorum,
 * Takvime al, Listeye ekle) ve (defterdeyse) elle süre. Songsterr'de çalınan süre uygulamada ölçülemez;
 * "+5 / +10 / +15 dk" ya da dakika alanıyla girilir.
 */
export default function SarkiDefterKutusu({ bilgi, kompakt = true, sureli = true }: { bilgi: KayitBilgisi; kompakt?: boolean; sureli?: boolean }) {
  const veri = useDefter();
  const kayit = veri.kayitlar[bilgi.id];
  const [secim, setSecim] = useState<string | null | undefined>(undefined);
  const kisim = secim !== undefined ? secim : (kayit?.kisim ?? null);
  return (
    <div className="space-y-2" data-defter-kutusu>
      <div className="flex flex-wrap items-center gap-1.5">
        <KisimSecici
          deger={kisim}
          kompakt={kompakt}
          etiket={`${bilgi.baslik}: kısım`}
          onDegis={(k) => {
            setSecim(k);
            if (kayit) defterIsle((v) => kayitGuncelle(v, bilgi.id, { kisim: k }));
          }}
        />
        <EylemDugmeleri bilgi={bilgi} kisim={kisim} kompakt={kompakt} />
      </div>
      {kayit && sureli && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          <Link href={`/defter#${encodeURIComponent(bilgi.id)}`} className="font-semibold text-[var(--link)] hover:underline">
            Defterde
          </Link>
          <span className="tabular-nums text-muted">{kayit.toplamSure ? sureYaz(kayit.toplamSure) : kayit.acildi ? "açıldı, süre girilmedi" : "süre yok"}</span>
          <SureEkle kompakt ad={bilgi.baslik} onEkle={(sn) => defterIsle((v) => sureEkle(v, bilgi, sn, { elle: true, kisim, gitar: kayitGitari(v, v.kayitlar[bilgi.id]) }))} />
        </div>
      )}
    </div>
  );
}
