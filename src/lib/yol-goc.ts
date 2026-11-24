// Teori yolu ilerleme göçü. Sürüm 1 (K18, GuitarBear yapısıyla eşitleme): Klavye, Kulak ve Armoni yollarında GuitarBear'de
// olmayan bölümler "Ek bölümler" alanına taşındı ve kodları değişti (ör. klavye 12.1 → E1.1). progress.steps
// anahtarları "<yol>/<kod>" olduğundan eski kayıtlar açılışta bir kez yeni koda taşınır (progress.ts → read).
// Ana (GuitarBear) adımların kodları değişmedi. Tablo içerik deposundaki belgeyle aynı:
// GuitarFlex-icerik/belgeler/mufredat/TEORI-YOLLARI-ESLEME.md ("Eski → yeni kod").
// Sürüm 2 (Nota Okuma kütüphanesi): Okuma yolunun 40 adımı konu sırasına (nota adları → … → ileri okuma) göre yeni
// bölümlere taşındı ve kodları değişti (ör. okuma/1.1 → okuma/3.1); 23 yeni adım eklendi. Eşleme: aynı belgede §11.
// Her sürümün tablosu ayrı uygulanır (v1 yalnız yolGoc < 1 ise, v2 yalnız yolGoc < 2 ise); okumanın eski kodları
// yeni kodlarla çakıştığı için iki tablo birleştirilmez.
import type { StepProgress } from "./progress";

/** Göç sürümü: progress.yolGoc bu değerden küçükse göç çalışır */
export const YOL_GOC_SURUM = 2;

/** Sürüm 1 (K18): eski adım anahtarı → yeni adım anahtarı */
export const YOL_KOD_GOC: Record<string, string> = {
  "klavye/12.1": "klavye/E1.1",
  "klavye/12.2": "klavye/E1.2",
  "klavye/12.3": "klavye/E1.3",
  "klavye/12.4": "klavye/E1.4",
  "klavye/12.5": "klavye/E1.5",
  "klavye/12.6": "klavye/E1.6",
  "klavye/13.1": "klavye/E2.1",
  "klavye/13.2": "klavye/E2.2",
  "klavye/13.3": "klavye/E2.3",
  "klavye/13.4": "klavye/E2.4",
  "kulak/10.1": "kulak/E1.1",
  "kulak/10.2": "kulak/E1.2",
  "kulak/10.3": "kulak/E1.3",
  "kulak/10.4": "kulak/E1.4",
  "kulak/10.5": "kulak/E1.5",
  "kulak/10.6": "kulak/E1.6",
  "kulak/10.7": "kulak/E1.7",
  "kulak/10.8": "kulak/E1.8",
  "kulak/11.1": "kulak/E2.1",
  "kulak/11.2": "kulak/E2.2",
  "kulak/11.3": "kulak/E2.3",
  "kulak/11.4": "kulak/E2.4",
  "kulak/11.5": "kulak/E2.5",
  "kulak/11.6": "kulak/E2.6",
  "armoni/6.1": "armoni/E1.1",
  "armoni/6.2": "armoni/E1.2",
  "armoni/6.3": "armoni/E1.3",
  "armoni/6.4": "armoni/E1.4",
  "armoni/7.1": "armoni/E2.1",
  "armoni/7.2": "armoni/E2.2",
  "armoni/7.3": "armoni/E2.3",
  "armoni/7.4": "armoni/E2.4",
  "armoni/8.1": "armoni/E3.1",
  "armoni/8.2": "armoni/E3.2",
  "armoni/8.3": "armoni/E3.3",
  "armoni/8.4": "armoni/E3.4",
};

/** Sürüm 2 (Nota Okuma): Okuma yolunun eski kodu → yeni kodu (adım adları ve soru bankaları aynı) */
export const OKUMA_KOD_GOC: Record<string, string> = {
  "okuma/1.1": "okuma/3.1", "okuma/1.2": "okuma/3.2", "okuma/1.3": "okuma/3.3", "okuma/1.4": "okuma/3.4",
  "okuma/2.1": "okuma/4.1", "okuma/2.2": "okuma/4.2", "okuma/2.3": "okuma/4.3", "okuma/2.4": "okuma/4.4",
  "okuma/3.1": "okuma/11.1", "okuma/3.2": "okuma/11.2", "okuma/3.3": "okuma/11.3", "okuma/3.4": "okuma/11.4",
  "okuma/4.1": "okuma/12.1", "okuma/4.2": "okuma/12.2", "okuma/4.3": "okuma/12.3", "okuma/4.4": "okuma/12.4",
  "okuma/5.1": "okuma/2.1", "okuma/5.2": "okuma/2.2", "okuma/5.3": "okuma/2.3", "okuma/5.4": "okuma/9.1",
  "okuma/5.5": "okuma/8.1", "okuma/5.6": "okuma/8.2", "okuma/5.7": "okuma/9.2", "okuma/5.8": "okuma/9.3",
  "okuma/6.1": "okuma/10.1", "okuma/6.2": "okuma/10.2", "okuma/6.3": "okuma/10.3", "okuma/6.4": "okuma/10.4",
  "okuma/6.5": "okuma/10.5", "okuma/6.6": "okuma/10.6", "okuma/6.7": "okuma/10.7", "okuma/6.8": "okuma/10.8",
  "okuma/7.1": "okuma/13.1", "okuma/7.2": "okuma/13.2", "okuma/7.3": "okuma/13.3", "okuma/7.4": "okuma/13.4",
  "okuma/7.5": "okuma/13.5", "okuma/7.6": "okuma/13.6", "okuma/7.7": "okuma/13.7", "okuma/7.8": "okuma/13.8",
};

/** Sürümlerin tabloları, sırayla */
export const YOL_GOC_TABLOLARI: { surum: number; tablo: Record<string, string> }[] = [
  { surum: 1, tablo: YOL_KOD_GOC },
  { surum: 2, tablo: OKUMA_KOD_GOC },
];

/** İki kaydı birleştirir: geçilmişse geçilmiş kalır, en iyi yüzde ve deneme sayıları toplanır */
function birlestir(a: StepProgress, b: StepProgress): StepProgress {
  return { best: Math.max(a.best, b.best), passed: a.passed || b.passed, attempts: a.attempts + b.attempts, at: a.at > b.at ? a.at : b.at };
}

function tabloUygula(steps: Record<string, StepProgress>, tablo: Record<string, string>): Record<string, StepProgress> {
  const out: Record<string, StepProgress> = {};
  for (const [k, v] of Object.entries(steps)) {
    const yeni = tablo[k] ?? k;
    out[yeni] = out[yeni] ? birlestir(out[yeni], v) : v;
  }
  return out;
}

/** Eski kodlu adım kayıtlarını yeni kodlara taşır: `surum` (kayıttaki yolGoc) sonrası tabloları sırayla, her anahtarı
 *  tablo başına bir kez; tabloda olmayan anahtarlara dokunmaz. Saf işlev (test: scripts/yol-goc-testi.ts) */
export function yolKoduGoc(steps: Record<string, StepProgress>, surum = 0): Record<string, StepProgress> {
  return YOL_GOC_TABLOLARI.filter((t) => t.surum > surum).reduce((s, t) => tabloUygula(s, t.tablo), steps);
}
