// Günlük Rutin (W5, 24.11.2026): üç farklı ≤ 15 dakikalık ısınma (Gün A / B / C). Her blok Kromatik Isınma kursunun bir
// dersini önerilen süre ve tempoyla çalar; üç rutin birlikte bütün teknik egzersiz türlerini kapsar. Sıra yerel tarihe
// göre dönüşümlüdür (A → B → C → A …). Günlük hedef (Profil › "Bugün", src/lib/oyun.ts): ısınma 10–15 dk (bu rutin ya
// da Kromatik Isınma dersleri) + 20 dk çalışma: günün üç tekniğinden en az ikisi ve kalan sürede bir şarkı.
//
// Rutinlerin dayandığı ilkeler (kaynaklar: Guitar World "Three steps to shred" ve "Gus G warm-ups", Guitar Player
// "Warm-Up Time", JustinGuitar parmak egzersizleri, Troy Grady / Cracking the Code, Music Theory for Guitar): yavaş ve
// gevşek başla; sol el, sağ el, iki elin eşzamanlılığı sırayla; zayıf grubu bul; son bloklar müzikal (gam, arpej, akor).
// Hepsi metronomla; süre dolunca sıradaki blok açılır.

export const RUTIN_KURSU = "kromatik-isinma";

/** Günün tekniği: 20 dakikalık çalışmanın konusu ve süresinin sayıldığı kurslar (progress.ts oturum anahtarının öneki) */
export type TeknikId = "alternate" | "economy" | "sweep" | "legato" | "tapping" | "bend" | "slide" | "palm" | "hybrid" | "arpej" | "ritim" | "akor" | "stil";
export type Teknik = { id: TeknikId; ad: string; kurslar: string[] };
export const TEKNIKLER: Teknik[] = [
  { id: "alternate", ad: "Alternate Picking", kurslar: ["alternatif-pena"] },
  { id: "economy", ad: "Economy Picking", kurslar: ["economy-pena"] },
  { id: "sweep", ad: "Sweep Picking", kurslar: ["sweep"] },
  { id: "legato", ad: "Legato / Hammer-On", kurslar: ["legato", "hammer-on-pull-off"] },
  { id: "tapping", ad: "Tapping", kurslar: ["tapping"] },
  { id: "bend", ad: "Bend & Vibrato", kurslar: ["bend-vibrato"] },
  { id: "slide", ad: "Slide", kurslar: ["slide"] },
  { id: "palm", ad: "Palm Mute", kurslar: ["palm-mute"] },
  { id: "hybrid", ad: "Hybrid Picking", kurslar: ["hybrid-picking"] },
  { id: "arpej", ad: "Arpejler", kurslar: ["arpej"] },
  { id: "ritim", ad: "Ritim (Strumming)", kurslar: ["ritim-tarama"] },
  { id: "akor", ad: "Akorlar", kurslar: ["akorlar"] },
  { id: "stil", ad: "Stiller", kurslar: ["gf-stiller"] },
];
export const teknik = (id: string) => TEKNIKLER.find((t) => t.id === id);

export type RutinBlok = {
  /** Kromatik Isınma dersinin kimliği */
  ders: string;
  /** Egzersiz türü (kapsam tablosu ve blok etiketi) */
  tur: string;
  /** Blok süresi (dakika) */
  dakika: number;
  /** Önerilen başlangıç temposu ve aralığı (metronom) */
  bpm: number;
  bpmAralik: [number, number];
  /** Bu bloğun odağı (tek cümle) */
  odak: string;
};

export type GunKodu = "A" | "B" | "C";
export type Rutin = { gun: GunKodu; ad: string; aciklama: string; bloklar: RutinBlok[]; teknikler: [TeknikId, TeknikId, TeknikId] };

const b = (ders: string, tur: string, dakika: number, bpm: number, bpmAralik: [number, number], odak: string): RutinBlok => ({ ders: `kr2-${ders}`, tur, dakika, bpm, bpmAralik, odak });

export const RUTINLER: Rutin[] = [
  {
    gun: "A",
    ad: "Sol El ve İfade",
    aciklama: "Permütasyon ve örümcekle sol eli aç, tel atlama ve hız merdiveniyle sağ eli bağla; legato, bend ve vibrato; gam sekansı ve CAGED akor geçişiyle bitir.",
    teknikler: ["alternate", "legato", "bend"],
    bloklar: [
      b("1-0-1", "Kromatik permütasyon", 2, 70, [60, 110], "Zayıf permütasyonu bul, onu iki tur fazla çal."),
      b("1-1-1", "Örümcek", 2, 70, [60, 110], "Basılı parmaklar kalkmasın; el her turda bir perde kayar."),
      b("2-1-1", "Tel atlama", 1, 70, [60, 110], "Atlanan tel susturulmuş; pena kısa ve düz."),
      b("2-0-1", "Alternate pena", 1.5, 70, [60, 110], "Sekizlik → triole → on altılık → altılık: tempo sabit."),
      b("3-0-1", "Legato", 2, 80, [60, 120], "Pull-off teli yana çeker; ses ölçü boyunca düşmez."),
      b("3-1-1", "Bend ve vibrato", 2, 70, [60, 100], "Önce hedef nota, sonra bend: tepesi aynı perdede."),
      b("4-0-1", "Gam sekansı", 2, 80, [60, 130], "Grup başları vuruşta."),
      b("4-2-1", "Akor geçişi", 2, 80, [60, 120], "Beş şekil, kök notayı her şekilde bul."),
    ],
  },
  {
    gun: "B",
    ad: "Sağ El ve Hız",
    aciklama: "Diyagonal kromatik ve ritim kaydırmayla ısın; iç/dış pena, economy ve sweep; tapping; ii – V – I arpejleriyle bitir.",
    teknikler: ["economy", "sweep", "tapping"],
    bloklar: [
      b("1-2-1", "Diyagonal kromatik", 2, 70, [60, 110], "Kaymayı işaret parmağı yönetir."),
      b("1-1-2", "Örümcek", 1, 70, [60, 110], "Çapraz dizilim: 1-3 alt telde, 2-4 üst telde."),
      b("1-0-3", "Ritim kaydırma", 1.5, 90, [70, 140], "Dört nota, üç vuruş: vurgu kayar, tempo kaymaz."),
      b("2-0-2", "İç ve dış pena", 2, 70, [60, 120], "Zor olan geçişi (iç ya da dış) döngüye al."),
      b("2-2-1", "Economy pena", 2, 80, [60, 130], "Süpürme tek hareket: pena ikinci telde durur."),
      b("2-2-2", "Sweep", 2, 70, [60, 110], "Notalar ayrı çınlar; parmak yuvarlanır."),
      b("3-0-3", "Tapping", 2, 80, [60, 120], "Tap parmağı teli yana çekerek kalkar."),
      b("4-1-1", "Arpej", 2, 80, [60, 120], "Ortak notaları dinle: el pozisyonda kalır."),
    ],
  },
  {
    gun: "C",
    ad: "Koordinasyon ve Ritim",
    aciklama: "Esneme ve çift geri dönüşle sol eli aç; arpej tel atlama ve hybrid picking; tel başına üç nota legato, vibrato ve slide; palm mute ve funk taramayla ritim; pentatonik üçlülerle bitir.",
    teknikler: ["hybrid", "slide", "akor"],
    bloklar: [
      b("1-3-1", "Esneme", 1.5, 70, [50, 100], "Yüksek pozisyondan başla; ağrıda dur."),
      b("1-0-2", "Çift geri dönüş", 1.5, 60, [50, 96], "Altılıkta vurgu her telin ilk notasında."),
      b("2-1-2", "Arpej tel atlama", 2, 80, [60, 120], "Aşağı – yukarı – aşağı – yukarı, iki tel atlaması."),
      b("2-3-1", "Hybrid picking", 2, 80, [60, 120], "Parmaklar avuca kıvrılır; ses pena kadar güçlü."),
      b("3-0-2", "Legato (3 nota/tel)", 1.5, 70, [60, 110], "Hammer-on isabetli, dinamik eşit."),
      b("3-1-2", "Vibrato ve slide", 1.5, 70, [60, 100], "Vibrato hızı metronomla: dörtlükte iki dalga."),
      b("2-3-2", "Palm mute", 1.5, 90, [70, 140], "Aksanda avuç kalkar, hemen iner."),
      b("4-2-2", "Funk tarama", 1.5, 85, [70, 110], "El hiç durmaz; akor yalnız aksanlarda."),
      b("4-0-2", "Pentatonik sekans", 1, 90, [70, 140], "Aralık atlamaları: aynı perdede parmak yuvarlanır."),
    ],
  },
];

export const rutinSuresi = (r: Rutin) => r.bloklar.reduce((n, x) => n + x.dakika, 0);
export const rutin = (gun: string) => RUTINLER.find((r) => r.gun === gun);

/** Yerel gün anahtarından (YYYY-AA-GG) rutin sırası: günler art arda A → B → C → A … (yaz saatinden etkilenmez) */
export function gununRutini(tarih: string): Rutin {
  const [y, a, g] = tarih.split("-").map(Number);
  const gunNo = Math.floor(Date.UTC(y, a - 1, g) / 86400000);
  return RUTINLER[((gunNo % 3) + 3) % 3];
}
