// ── Kurs yapısı: Kurs → Bölüm → Alt bölüm (1.0, 1.1 …) → Ders ─────────────────
// Yerleşik kurslar src/content/kurslar/ içinde; kişisel içerik paketleri
// ozel-kaynak/icerik/*.json dosyalarından aynı şekilde okunur (bkz. src/lib/courses.ts).

export type Lesson = {
  id: string;
  title: string;
  bpm: number;
  /** Önerilen tempo aralığı (ör. [40, 150]); verilirse "40–150 BPM" olarak gösterilir */
  bpmRange?: [number, number];
  /** Dersin hedef çalışma süresi (dakika; 0.75 = 45 sn). Bu süreye ulaşınca ders tamamlanır. */
  minutes: number;
  /** Rehberlerde adımın hedef kademesi (ör. "Gümüş I") */
  target?: string;
  description?: string;
  tips?: string[];
  /** "Müzik Bilgisi" kutusu: dersin arkasındaki teori (gam, aralık, akor, ritim) */
  theory?: string[];
  /** alphaTex formatında tab */
  tex?: string;
  /** Tabsız okuma adımı (rehberlerde "Nasıl çalınır?" gibi): paragraflar, "## " ile başlayan satır başlıktır */
  body?: string[];
  /** ozel-kaynak klasörüne göre tab dosyası yolu (.gp, .gpx, .xml …) */
  tabFile?: string;
  /** Teori derslerinde kartın türü: Eğitim (okuma), Pratik (soru), Ek İnceleme (çalınacak örnek) */
  card?: "egitim" | "pratik" | "ek";
  /** Pratik kartı: soruların bulunduğu teori yolu adımı (ör. { yol: "armoni", kod: "1.1" }) */
  practice?: { yol: string; kod: string };
};

export type Chapter = {
  /** "1.0", "1.1" … */
  code: string;
  title: string;
  /** Alt bölümdeki tüm derslerde gösterilen "Müzik Bilgisi" */
  theory?: string[];
  lessons: Lesson[];
};

export type Section = {
  number: number;
  title: string;
  /** Bölümdeki derslerin seviye adı, bölüm adından farklıysa (ör. "Level 3" → "İleri Arpej") */
  level?: string;
  chapters: Chapter[];
  /** Bölüm sonunda sınav satırı gösterilsin mi */
  exam?: boolean;
  /** Sınavın adı (ör. "Bölüm 1, 2 Geçiş Sınavı", "Bölüm 1, 2, 3 Tamamlama Sınavı") */
  examName?: string;
  /** Sınav kademelerinin BPM eşikleri (kolaydan zora) */
  examTiers?: number[];
  /** Kademe adları, `examTiers` ile aynı sırada (ör. "Altın I", "Platin I", "Elmas I", "Usta") */
  examTierNames?: string[];
};

/** technique: elektro teknik kursu · guide: rehber · acoustic: akustik gitar kursu · theory: müzik teorisi dersleri */
export type CourseKind = "technique" | "guide" | "acoustic" | "theory";

export type Course = {
  slug: string;
  title: string;
  /** Kurs kartındaki ad, başlıktan farklıysa (ör. "Bend - Vibrato" → "Bend & Vibrato") */
  cardTitle?: string;
  description: string;
  kind: CourseKind;
  /** Kart ve ders kartlarının arka plan görseli: /marka/... ya da ozel-kaynak'a göre yol */
  image?: string;
  icon?: string;
  status?: "yakinda";
  videos?: { title: string; channel?: string; url?: string }[];
  /** "Rehber" sekmesindeki metin (paragraflar; "## " ile başlayan satır başlıktır) */
  guide?: string[];
  sections: Section[];
};

export type SiteTexts = {
  navSubtitle: string;
  hero: {
    eyebrow: string;
    title: string;
    text: string;
    guides: { slug: string; title: string; text: string; button: string }[];
  };
  chordCard: { eyebrow: string; title: string; text: string; button: string; slug: string };
  /** Kursların sırası (slug listesi). Listede olmayanlar yerleşik sırayla sona eklenir. */
  courseOrder?: string[];
};
