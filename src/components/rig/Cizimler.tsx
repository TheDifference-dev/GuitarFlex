// Rig'im ekipman çizimleri: giriş noktası. Bütün görseller özgündür ve SVG ile çizilir (hiçbir ürünün görseli, renderı,
// fotoğrafı ya da logosu kullanılmaz; gerçek ürünlerin tasarımını birebir taklit etmez). Parçalar ./cizim/ altında:
//   temel.tsx  ortak dil (ışık, filtreler, düğme, LED, lamba, vida, ayak anahtarı, kasa)
//   pedal.tsx  pedallar · amfi.tsx amfi, kabin ve hoparlör · rack.tsx rack · studyo.tsx mikrofon, DI, ses kartı, yazılım
//   gitar.tsx  gitarlar
// İki ayrıntı düzeyi: "tam" (büyük panel; dokular, filtreler, küçük yazılar) ve "ikon" (zincir, kitaplık, afiş; yalnız
// degradeler, küçük boyutta keskin ve hafif).
import { useId } from "react";
import { CIZIMLER, type Cizim, type Gorunum } from "@/lib/rig-cekirdek";
import { AMFI_BOYUT, AmfiCizimi, Hoparlor as HoparlorIc, KABIN_BOYUT, KabinCizimi, kabinBoyutu } from "./cizim/amfi";
import { GITAR_BOYUT, GitarCizimi } from "./cizim/gitar";
import { KafaCizimi, kafaBoyutu, kafaTuru } from "./cizim/kafa";
import { PedalCizimi, pedalBoyutu } from "./cizim/pedal";
import { RACK_BOYUT, RackCizimi } from "./cizim/rack";
import { STUDYO_BOYUT, StudyoCizimi } from "./cizim/studyo";
import { Tanimlar, tohumla, type Ctx } from "./cizim/temel";

export { acik, karistir, koyu, parlaklik } from "./cizim/temel";

/** Çizimin doğal boyutu (viewBox) */
export function boyut(cizim: Cizim, gorunum?: Gorunum): [number, number] {
  const kat = CIZIMLER[cizim]?.kategori;
  if (kat === "pedal") return pedalBoyutu(cizim, gorunum);
  const kafa = kat === "amfi" ? kafaTuru(cizim, gorunum) : undefined;
  if (kafa) return kafaBoyutu(kafa);
  if (kat === "kabin") return kabinBoyutu(cizim, gorunum);
  return (AMFI_BOYUT[cizim] ?? KABIN_BOYUT[cizim] ?? RACK_BOYUT[cizim] ?? STUDYO_BOYUT[cizim] ?? GITAR_BOYUT[cizim] ?? [100, 150]) as [number, number];
}

export type CizimOzellik = {
  cizim: Cizim;
  renk: string;
  /** Düğme değerleri, `dugmeler` sırasıyla (0–10) */
  degerler?: number[];
  /** Modelin kendi düğme adları (yoksa CIZIMLER[cizim].dugmeler) */
  dugmeler?: string[];
  /** Modelin kollu anahtarlarının adları */
  anahtarlar?: string[];
  /** Modelin görünüş sapmaları (ör. geniş gövde) */
  gorunum?: Gorunum;
  /** Yıpranma tohumu (kitaplık modelinin kimliği): verilirse çizim kullanılmış, vintage görünür */
  tohum?: string;
  /** Seçmeli ayarların sırası, CIZIMLER[cizim].secenekler sırasıyla (ör. kabinde hoparlör türü) */
  secimler?: number[];
  /** Açık mı (LED / pilot lamba); devre dışı (bypass) düğümde false */
  acik?: boolean;
  /** Altta yumuşak gölge */
  golge?: boolean;
  /** Kitaplık modelinin adı (ör. "Verde OD"); yoksa genel tür yazılır ya da yazı boş kalır */
  etiket?: string;
  /** "tam": dokular ve küçük yazılar (büyük panel); "ikon": sade ve keskin (zincir, kitaplık) */
  ayrinti?: "tam" | "ikon";
  /** Tam ayrıntıda yaklaşık gösterim genişliği (px): ışık filtrelerinin eğimi buna göre ayarlanır */
  pikselGenislik?: number;
  className?: string;
  /** İç içe SVG için (PNG afişi) */
  x?: number;
  y?: number;
  width?: number | string;
  height?: number | string;
  baslik?: string;
  preserveAspectRatio?: string;
};

/** Bir ekipmanın özgün çizimi; her boyutta keskin (SVG) */
export default function EkipmanCizimi({ cizim, renk, degerler = [], dugmeler, anahtarlar, gorunum, tohum, secimler = [], acik: on = true, golge = true, etiket, ayrinti = "ikon", pikselGenislik = 600, className, x, y, width, height, baslik, preserveAspectRatio = "xMidYMax meet" }: CizimOzellik) {
  const u = `c${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const [w, h] = boyut(cizim, gorunum);
  const c: Ctx = { u, t: ayrinti === "tam", on, k: pikselGenislik / w, ...(tohum ? { z: tohumla(tohum) } : {}) };
  const kat = CIZIMLER[cizim]?.kategori;
  const p = { c, r: renk, v: degerler, etiket };
  const model = { adlar: dugmeler ?? CIZIMLER[cizim]?.dugmeler ?? [], anahtarlar: anahtarlar ?? [] };
  return (
    <svg viewBox={`0 0 ${w} ${h + 8}`} x={x} y={y} width={width} height={height} className={className} preserveAspectRatio={preserveAspectRatio} role={baslik ? "img" : undefined} aria-label={baslik} aria-hidden={baslik ? undefined : true} overflow="visible">
      {golge && (
        <g>
          <defs>
            <radialGradient id={`${u}zg`} cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#000" stopOpacity="0.42" />
              <stop offset="0.55" stopColor="#000" stopOpacity="0.16" />
              <stop offset="1" stopColor="#000" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx={w / 2 + w * 0.02} cy={h + 1} rx={w * 0.54} ry={Math.max(4, h * 0.035)} fill={`url(#${u}zg)`} />
        </g>
      )}
      {kat === "pedal" ? (
        <PedalCizimi cizim={cizim} {...p} {...model} gorunum={gorunum} />
      ) : kat === "amfi" && kafaTuru(cizim, gorunum) ? (
        <KafaCizimi tur={kafaTuru(cizim, gorunum)!} {...p} adlar={model.adlar} />
      ) : kat === "amfi" ? (
        <AmfiCizimi cizim={cizim} {...p} {...model} />
      ) : kat === "kabin" ? (
        <KabinCizimi cizim={cizim} {...p} hoparlor={secimler[0] ?? 0} gorunum={gorunum} />
      ) : kat === "rack" ? (
        <RackCizimi cizim={cizim} {...p} />
      ) : kat === "gitar" ? (
        <GitarCizimi cizim={cizim} {...p} />
      ) : kat === "studyo" ? (
        <StudyoCizimi cizim={cizim} {...p} />
      ) : (
        <Tanimlar c={c} />
      )}
    </svg>
  );
}

/** Hoparlör konisinin yakın çizimi (kabinin hoparlör seçeneği için) */
export function HoparlorCizimi({ tur, ayrinti = "tam", pikselGenislik = 160, className, baslik }: { tur: number; ayrinti?: "tam" | "ikon"; pikselGenislik?: number; className?: string; baslik?: string }) {
  const u = `h${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const c: Ctx = { u, t: ayrinti === "tam", on: true, k: pikselGenislik / 100 };
  return (
    <svg viewBox="0 0 100 100" className={className} role={baslik ? "img" : undefined} aria-label={baslik} aria-hidden={baslik ? undefined : true}>
      <Tanimlar c={c} />
      <HoparlorIc c={c} x={50} y={50} r={48} tur={tur} cerceve />
    </svg>
  );
}
