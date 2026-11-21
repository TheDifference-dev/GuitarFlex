// Teori yolu ilerleme göçü (K18, GuitarBear yapısıyla eşitleme). Klavye, Kulak ve Armoni yollarında GuitarBear'de
// olmayan bölümler "Ek bölümler" alanına taşındı ve kodları değişti (ör. klavye 12.1 → E1.1). progress.steps
// anahtarları "<yol>/<kod>" olduğundan eski kayıtlar açılışta bir kez yeni koda taşınır (progress.ts → read).
// Ana (GuitarBear) adımların kodları değişmedi. Tablo içerik deposundaki belgeyle aynı:
// GuitarFlex-icerik/belgeler/mufredat/TEORI-YOLLARI-ESLEME.md ("Eski → yeni kod").
import type { StepProgress } from "./progress";

/** Göç sürümü: progress.yolGoc bu değerden küçükse göç çalışır */
export const YOL_GOC_SURUM = 1;

/** Eski adım anahtarı → yeni adım anahtarı */
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

/** İki kaydı birleştirir: geçilmişse geçilmiş kalır, en iyi yüzde ve deneme sayıları toplanır */
function birlestir(a: StepProgress, b: StepProgress): StepProgress {
  return { best: Math.max(a.best, b.best), passed: a.passed || b.passed, attempts: a.attempts + b.attempts, at: a.at > b.at ? a.at : b.at };
}

/** Eski kodlu adım kayıtlarını yeni kodlara taşır; tabloda olmayan anahtarlara dokunmaz. Saf işlev (test: scripts/yol-goc-testi.ts) */
export function yolKoduGoc(steps: Record<string, StepProgress>): Record<string, StepProgress> {
  const out: Record<string, StepProgress> = {};
  for (const [k, v] of Object.entries(steps)) {
    const yeni = YOL_KOD_GOC[k] ?? k;
    out[yeni] = out[yeni] ? birlestir(out[yeni], v) : v;
  }
  return out;
}
