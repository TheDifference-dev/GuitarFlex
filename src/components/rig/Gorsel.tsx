"use client";

// Ekipmanın görseli: kullanıcının fotoğrafı (seçiliyse) ya da özgün çizim. Zincir, kitaplık ve büyük panel bunu kullanır.
import EkipmanCizimi from "./Cizimler";
import s from "./Rig.module.css";
import { useFotoUrl } from "@/lib/rig";
import { CIZIMLER, cizimEtiketi, dugmeDegeri, secenekDegeri, type Dugum, type Ekipman } from "@/lib/rig-cekirdek";

export type GorselOzellik = {
  e: Ekipman | null;
  /** Düğümün ayarları (düğmeler, hoparlör seçimi, açık/kapalı); yoksa varsayılan */
  dugum?: Dugum | null;
  ayrinti?: "tam" | "ikon";
  pikselGenislik?: number;
  golge?: boolean;
  /** Fotoğraf varsa ve tercih fotoğrafsa onu göster (varsayılan: evet) */
  foto?: boolean;
  className?: string;
  baslik?: string;
};

/** Fotoğraf gösterilecek mi (ekipmanın tercihi; varsayılan fotoğraf) */
export const fotoTercihi = (e: Ekipman | null | undefined) => !!e?.fotoId && e.gorsel !== "cizim";

export default function EkipmanGorseli({ e, dugum, ayrinti = "ikon", pikselGenislik, golge = false, foto = true, className, baslik }: GorselOzellik) {
  const fotoUrl = useFotoUrl(foto && fotoTercihi(e) ? e?.fotoId : undefined);
  const cizim = e?.cizim ?? "boost";
  const tanim = CIZIMLER[cizim];
  if (fotoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={fotoUrl} alt={baslik ?? `${e?.ad ?? "Ekipman"} fotoğrafı`} className={`${s.kesik} ${className ?? ""}`} draggable={false} />;
  }
  return (
    <EkipmanCizimi
      cizim={cizim}
      renk={e?.renk ?? "#555555"}
      etiket={cizimEtiketi(e)}
      degerler={dugum ? tanim.dugmeler.map((a) => dugmeDegeri(dugum, a)) : []}
      secimler={(tanim.secenekler ?? []).map((x) => (dugum ? secenekDegeri(dugum, x) : 0))}
      acik={!dugum?.kapali}
      ayrinti={ayrinti}
      pikselGenislik={pikselGenislik}
      golge={golge}
      className={className}
      baslik={baslik}
    />
  );
}
