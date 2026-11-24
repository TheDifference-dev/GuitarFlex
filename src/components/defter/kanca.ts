"use client";

import { useCallback, useRef, useState } from "react";
import type { DevamKomutu, OynaticiDurumu } from "@/components/TabPlayer";
import { defterIsle, kayitGitari, olcumEkle, type Ek, type Kayit, type KayitBilgisi } from "@/lib/defter";

type Kisim = { name: string; bars: [number, number] };

/**
 * Oynatıcı ile Çalışma Defteri arasındaki bağ (kütüphane şarkıları, içe aktarılan dosyalar): oynatıcının son durumu
 * (ölçü, hız, aralık, kısım) ve "kaldığın yerden devam" komutu. Süre, sayfanın kendi çalma sayacından `yaz(sn)` ile
 * yazılır: ilerleme kaydına giden saniyelerin aynısı (çift sayma yok, bkz. lib/defter-cekirdek.ts). Yalnız kullanıcının
 * deftere aldığı kayda yazılır; çalmak tek başına deftere kayıt açmaz (olcumEkle).
 */
export function useDefterBagi(bilgi: KayitBilgisi | null, kisimlar?: Kisim[]) {
  const durumRef = useRef<OynaticiDurumu | null>(null);
  const [canliKisim, setCanliKisim] = useState<string | null>(null);
  const [devam, setDevam] = useState<DevamKomutu | undefined>(undefined);

  /** Seçili kısım, yoksa ölçünün düştüğü kısım */
  const kisimOf = useCallback((d: OynaticiDurumu) => d.kisim ?? kisimlar?.find((p) => d.olcu + 1 >= p.bars[0] && d.olcu + 1 <= p.bars[1])?.name ?? null, [kisimlar]);

  const onDurum = useCallback(
    (d: OynaticiDurumu) => {
      durumRef.current = d;
      const k = kisimOf(d);
      setCanliKisim((x) => (x === k ? x : k));
    },
    [kisimOf],
  );

  const ek = useCallback((): Ek => {
    const d = durumRef.current;
    return d ? { kisim: kisimOf(d), konum: d.olcu + 1, hiz: d.hiz, tempo: d.bpm, aralik: d.aralik } : {};
  }, [kisimOf]);

  /** Çalınan saniyeleri (0: yalnız son konum) deftere yaz: kayıt defterde yoksa hiçbir şey yazılmaz */
  const yaz = useCallback(
    (sn: number) => {
      if (!bilgi) return;
      const e = ek();
      defterIsle((v) => olcumEkle(v, bilgi, sn, { ...e, gitar: kayitGitari(v, v.kayitlar[bilgi.id]) }));
    },
    [bilgi, ek],
  );

  const devamEt = useCallback((k: Kayit) => {
    setDevam((x) => ({ n: (x?.n ?? 0) + 1, olcu: k.konum ? k.konum - 1 : undefined, aralik: k.aralik, hiz: k.hiz }));
    document.querySelector("[data-kontrol-cubugu]")?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, []);

  return { onDurum, canliKisim, devam, devamEt, yaz };
}
