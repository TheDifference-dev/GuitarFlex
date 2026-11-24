"use client";

import Link from "next/link";
import { useState } from "react";
import { defterIsle, durumAyarla, kayitGitari, kayitGuncelle, sureEkle, sureYaz, useDefter, type KayitBilgisi } from "@/lib/defter";
import { DurumDugmeleri, KisimSecici, SureEkle } from "./Parcalar";

/**
 * Şarkı kartındaki defter kutusu (Popüler Şarkılar, Songsterr): kısım, iki durum düğmesi ve (defterdeyse) elle süre.
 * Songsterr'de çalınan süre uygulamada ölçülemez; "+5 / +10 / +15 dk" ya da dakika alanıyla girilir.
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
        <DurumDugmeleri durum={kayit?.durum} kisim={kisim} kompakt={kompakt} ad={bilgi.baslik} onDurum={(d) => defterIsle((v) => durumAyarla(v, bilgi, d, kisim))} />
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
