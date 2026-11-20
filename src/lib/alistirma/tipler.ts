// Teori yolları (Ritim, Klavye Görselleştirme, Kulak Eğitimi, Armoni, Okuma): kişisel içerik paketindeki
// icerik/yollar/<slug>.json dosyalarının biçimi. İskelet adımlarının soruları uygulamada her seferinde yeniden
// üretilir; İP6b'de eklenen adımlar hazır bir soru bankası ("banka") taşır, her denemede bankadan seçilir.

export type Alistirma =
  // Klavye
  | { tur: "tel"; teller: number[] }
  | { tur: "nota"; teller: number[]; perde: [number, number]; sesler: "dogal" | "arizali" | "hepsi"; yazim?: "diyez" | "bemol"; mod: "adlandir" | "bul" | "karisik" }
  | { tur: "akor"; akorlar: string[] }
  | { tur: "oktav"; atlama: number | null }
  | { tur: "pentatonik"; sekil: number | null; gorev: "kok" | "kokler" }
  | { tur: "caged"; form: "C" | "A" | "G" | "E" | "D" | null; gorev: "kokler" | "tamamla" }
  | { tur: "3nps"; mod: string | null }
  | { tur: "derece" }
  // Kulak
  | { tur: "ses"; gorev: "ayni-farkli" | "tiz-pes" | "oktav"; aralik: [number, number] }
  | { tur: "referans"; teller: number[]; yon: "pes" | "tiz" | "iki"; maks: number }
  | { tur: "aralik"; araliklar: number[] }
  | { tur: "akorTuru"; turler: string[] }
  | { tur: "gam"; gamlar: string[] }
  | { tur: "progresyon"; secenekler: string[][] }
  // Armoni (Müzik Teorisi Dersleri pratikleri)
  | { tur: "teori"; konu: "giris" | "gam" | "besli" | "uclu" | "mod" | "modFormul" | "modAnla" | "diyatonik" | "yuruyus" | "dortlu" | "yedili" }
  // Ritim
  | { tur: "ritim"; olcu: [number, number]; hucreler: string[]; olcuSayisi: number; bpm: [number, number]; sus?: number }
  | { tur: "karma"; parcalar: Alistirma[] }
  // Hazır soru bankası (içerik üreticisinde teori kurallarından hesaplanır)
  | { tur: "banka"; sorular: BankaSoru[] };

/** Porte notası: h harf (0 Do … 6 Si), o yazılı oktav (gitar bir oktav pes duyulur), a portede yazılı arıza
 *  (-1 bemol, 0 natürel, 1 diyez; yoksa donanım ve ölçü kuralı), d süre (vuruş; verilmezse 1) */
export type PorteNota = { h: number; o: number; a?: number; d?: number };
/** Sol anahtarı (8 aşağı). donanim: diyez (+) ya da bemol (−) sayısı */
export type Porte = { donanim: number; notalar: PorteNota[]; olcu?: [number, number]; isaret?: number };
export type SemaOlcu = {
  akorlar: { ad: string; vurus: number }[];
  bas?: boolean;
  son?: boolean;
  volta?: number;
  segno?: boolean;
  coda?: boolean;
  fine?: boolean;
  yon?: "D.S. al Fine" | "D.S. al Coda" | "To Coda";
};
/** Akor şeması: slash notasyonu, tekrar, volta, segno/coda, Fine */
export type Sema = { olcu: [number, number]; olculer: SemaOlcu[] };
export type SesVeri =
  | { tur: "melodi"; notalar: { m: number; d: number }[]; bpm: number }
  | { tur: "akorlar"; akorlar: number[][]; sure: number };
export type BankaNokta = { s: number; f: number; tur: "kok" | "nota" | "soru" | "referans"; etiket?: string };
type BankaOrtak = {
  id: string;
  metin: string;
  porte?: Porte;
  ritim?: { olcu: [number, number]; desen: string[][] };
  sema?: Sema;
  sap?: { perde: [number, number]; noktalar: BankaNokta[]; tel?: number };
  ses?: SesVeri;
  aciklama: string;
};
export type BankaSoru = BankaOrtak &
  (
    | { tip: "secim"; secenekler: { id: string; ad: string; ritim?: string[][] }[]; dogru: string }
    | { tip: "sap"; hedef: string[]; coklu: boolean }
    /** Sırayla dokunma: sesler MIDI; esit "ses" aynı perde yüksekliği, "pc" aynı nota adı (oktav serbest) */
    | { tip: "sirali"; sesler: number[]; esit: "ses" | "pc"; konumlar: string[] }
  );

export type YolAdim = {
  kod: string;
  ad: string;
  bolum: number;
  /** İskelette "temel", "orta" …; İP6b adımlarında L1–L5 */
  seviye: string;
  /** Beceri sözlüğü anahtarı (İP6b adımları) */
  beceri?: string;
  soru: number;
  /** Geçme koşulu: doğruluk %, ritim geri vurma puanı, seçim doğruluğu % */
  gecme: { dogruluk: number; vurus?: number; secim: number };
  /** Bölümün son (kontrol) adımı */
  kontrol: boolean;
  alistirma: Alistirma;
};

export type YolBolum = {
  no: number;
  ad: string;
  beceri: string;
  seviye: string;
  /** Seviye Yolu için seviye ve beceri (iskelet bölümleri; yeni bölümlerde seviye zaten L1–L5) */
  level?: string;
  skill?: string;
  /** Bölümün ilk adımı önceki bölümü beklemeden açılır (iskelet dışı ek bölümler) */
  serbest?: boolean;
};

export type Yol = {
  slug: string;
  ad: string;
  ozet: string;
  bolumler: YolBolum[];
  adimlar: YolAdim[];
  modul: { ad: string; sekmeler: string[] };
  /** Yol bir kursun pratik kartlarıysa (ör. Armoni) o kursun adı; geri dönüş bağlantıları kursa gider */
  kurs?: string;
};
