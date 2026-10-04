// Teori yolları (Ritim, Klavye Görselleştirme, Kulak Eğitimi): kişisel içerik paketindeki
// icerik/yollar/<slug>.json dosyalarının biçimi. Sorular uygulamada her seferinde yeniden üretilir.

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
  // Ritim
  | { tur: "ritim"; olcu: [number, number]; hucreler: string[]; olcuSayisi: number; bpm: [number, number]; sus?: number }
  | { tur: "karma"; parcalar: Alistirma[] };

export type YolAdim = {
  kod: string;
  ad: string;
  bolum: number;
  seviye: string;
  soru: number;
  /** Geçme koşulu: doğruluk %, ritim geri vurma puanı, seçim doğruluğu % */
  gecme: { dogruluk: number; vurus?: number; secim: number };
  /** Bölümün son (kontrol) adımı */
  kontrol: boolean;
  alistirma: Alistirma;
};

export type YolBolum = { no: number; ad: string; beceri: string; seviye: string };

export type Yol = {
  slug: string;
  ad: string;
  ozet: string;
  bolumler: YolBolum[];
  adimlar: YolAdim[];
  modul: { ad: string; sekmeler: string[] };
};
