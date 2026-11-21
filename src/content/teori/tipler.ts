// Müzik Teorisi dersleri: tek A4 sayfasına sığan ders kitabı düzeni.
// Yapı: tanım → kural/formül → gitarda → kulakla → hemen dene → sık hata/ipucu → sıradaki ders → kaynaklar.
// Şemaların notaları scripts/teori-dogrula.mjs ile bağımsız olarak hesaplanıp denetlenir.
import type { Porte, Sema } from "../../lib/alistirma/tipler.ts";

/** Sap kesitinde bir nokta: t tel (1 ince Mi … 6 kalın Mi), p perde (0 açık tel), e etiket */
export type Nokta = { t: number; p: number; e?: string; k?: "kok" | "vurgu" | "soluk" };

export type SapSemasi = {
  tur: "sap";
  baslik: string;
  /** Gösterilen perde aralığı (dahil); 0 ile başlarsa eşik ve açık teller çizilir */
  perde: [number, number];
  noktalar: Nokta[];
  /** Etiketlerin anlamı: nota adı, köke göre aralık ya da serbest (parmak no, kutu adı…) */
  etiket: "nota" | "aralik" | "serbest";
  /** Aralık etiketlerinin ve gam denetiminin kökü (nota adı) */
  kok?: string;
  /** Gam/akor kalıbı (yarım ton): verilirse noktaların hepsi kalıpta olmalı */
  kalip?: number[];
  /** true: aralıktaki (ve `teller`deki) kalıba uyan bütün perdeler gösterilmiş olmalı */
  tam?: boolean;
  teller?: number[];
  /** Gölgeli perde bölgeleri (kutu, CAGED biçimi) */
  bolgeler?: { bas: number; son: number; ad: string }[];
  /** İki nokta (indis) arasında çizgi: oktav, aralık şekli */
  baglar?: [number, number][];
  not?: string;
  genis?: boolean;
};

export type AkorSekliVeri = {
  ad: string;
  /** Kalın Mi → ince Mi, boşlukla ayrılmış: "x 3 2 0 1 0" */
  sekil: string;
  /** Parmak numaraları aynı sırada (0 = parmak yok) */
  parmak?: string;
  /** Kök ve formül: doğrulama ve kök vurgusu */
  kok: string;
  formul: string;
  /** Basta kök dışında bir nota varsa (çevrim, slash akor) */
  bas?: string;
  alt?: string;
};

export type AkorlarSemasi = { tur: "akorlar"; baslik: string; akorlar: AkorSekliVeri[]; not?: string; genis?: boolean };

/** Formül şeridi: notalar ve aralarındaki adımlar (T tam, Y yarım, A artık ikili = 1½) */
export type AdimSemasi = { tur: "adim"; baslik: string; notalar: string[]; adimlar: ("T" | "Y" | "A")[]; dereceler?: string[]; vurgu?: number[]; not?: string };

export type PiyanoSemasi = { tur: "piyano"; baslik: string; vurgu?: string[]; yarimlar?: [string, string][]; not?: string };

export type CemberSemasi = { tur: "cember"; baslik: string; vurgu?: string[]; not?: string };

export type PorteSemasi = {
  tur: "porte";
  baslik: string;
  porte: Porte;
  /** Notaların altına yazılan adlar (Türkçe ya da harf) */
  etiketler?: string[];
  /** Her notanın sapta çalındığı yer (gitar bir oktav pes duyulur) */
  konumlar?: ({ t: number; p: number } | null)[];
  not?: string;
  genis?: boolean;
};

export type RitimSemasi = { tur: "ritim"; baslik: string; desen: string[][]; olcu?: [number, number]; sayim?: string; not?: string; genis?: boolean };

export type AgacSemasi = { tur: "agac"; baslik: string; not?: string };

/** Tab kolonu: aynı anda çalınan notalar; d süre (vuruş), e altına yazılan etiket */
export type TabKolon = { n: { t: number; p: number }[]; d?: number; e?: string; teknik?: string };
export type TabSemasi = { tur: "tab"; baslik: string; kolonlar: TabKolon[]; olcu?: [number, number]; ritim?: boolean; etiket?: "nota" | "serbest"; not?: string; genis?: boolean };

export type AkorSemasiVeri = { tur: "sema"; baslik: string; sema: Sema; /** Çalınış sırası (ölçü numaraları) */ sira?: number[]; not?: string; genis?: boolean };

/** Vuruş gücü çizelgesi: ölçü başına vuruşların ağırlığı (3 güçlü … 1 zayıf) */
export type VurguSemasi = { tur: "vurgu"; baslik: string; satirlar: { ad: string; vuruslar: number[]; sayim?: string[] }[]; not?: string };

/** Zaman çizgisi: aynı sürede farklı tempoların vuruşları */
export type TempoSemasi = { tur: "tempo"; baslik: string; bpm: number[]; saniye: number; not?: string };

/** Basit akış: kutular ve oklar (çalışma döngüsü) */
export type AkisSemasi = { tur: "akis"; baslik: string; adimlar: string[]; dongu?: boolean; not?: string };

export type Gorsel =
  | SapSemasi
  | AkorlarSemasi
  | AdimSemasi
  | PiyanoSemasi
  | CemberSemasi
  | PorteSemasi
  | RitimSemasi
  | AgacSemasi
  | TabSemasi
  | AkorSemasiVeri
  | VurguSemasi
  | TempoSemasi
  | AkisSemasi;

/** Tablo; `dogrula` verilirse doğrulama betiği sütunları hesapla denetler */
export type Tablo = {
  baslik?: string;
  bas: string[];
  satirlar: string[][];
  not?: string;
  dogrula?:
    | { tur: "aralik"; yarim: number; simge: number; ornek?: number }
    | { tur: "gam"; kok: number | string; formul: number | string; notalar: number }
    | { tur: "komsu"; nota: number; uzaklik: number }
    | { tur: "kayma"; yarim: number; ayni: number; ust: number; si: number }
    | { tur: "frekans"; nota: number; hz: number }
    | { tur: "yuruyus"; romen: number; tonlar: Record<number, string> }
    | { tur: "akor"; ad: number; notalar: number; formul?: number }
    | { tur: "diyatonik"; tonlar: Record<number, string>; yedili?: Record<number, string> }
    | { tur: "paralel"; major: number; minor: number }
    | { tur: "bpm"; bpm: number; saniye: number }
    | { tur: "tel"; tel: number; nota: number; yazili?: number }
    | { tur: "sure"; ad: number; vurus: number };
};

/** Dinlenebilir örnek: notalar bilimsel adla (C4 = orta Do, MIDI 60), duyulan perdede */
export type DinleOrnek = {
  ad: string;
  notalar?: string[];
  tip: "dizi" | "akor" | "aralik" | "akorlar" | "ritim" | "metronom";
  /** tip "akorlar": sırayla çalınan akorlar (her biri nota listesi) */
  akorlar?: string[][];
  /** tip "ritim" / "metronom" */
  desen?: string[][];
  bpm?: number;
  olcu?: [number, number];
  /** Denetim: aralık (yarım ton), akor formülü ya da gam kalıbı */
  beklenen?: { aralik?: number; formul?: string; kalip?: number[]; ton?: string; romen?: string[] };
};

export type Blok =
  | { t: "p"; m: string }
  | { t: "gorsel"; g: Gorsel; ekran?: boolean }
  | { t: "tablo"; tablo: Tablo; genis?: boolean }
  | { t: "dinle"; ornekler: DinleOrnek[] }
  | { t: "ek"; ad: "caged-tablosu" };

export type Ders = {
  slug: string;
  baslik: string;
  seviye?: number;
  ozet: string;
  tanim: string[];
  kural: Blok[];
  gitarda: Blok[];
  kulakla: Blok[];
  dene: string[];
  ipucu: string[];
  sonraki: { metin: string; href?: string };
  kaynaklar: string[];
  /** Ekranda dersin altında sap gezgini (yazdırılmaz) */
  kesif?: { set: string; root: number };
};
