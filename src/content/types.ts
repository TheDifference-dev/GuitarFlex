export type Exercise = {
  /** Benzersiz kimlik: `<teknik>-<seviye>-<sıra>` */
  id: string;
  title: string;
  description: string;
  tips: string[];
  /** alphaTex formatında tab (bkz. https://alphatab.net/docs/alphatex/introduction) */
  tex: string;
  startBpm: number;
  targetBpm: number;
};

export type Level = {
  level: number;
  title: string;
  goal: string;
  exercises: Exercise[];
};

export type Technique = {
  slug: string;
  name: string;
  icon: string;
  summary: string;
  levels: Level[];
};

// ── Kurs yapısı: Kurs → Bölüm → Alt bölüm (1.0, 1.1 …) → Ders ─────────────────
// Yerleşik kurslar src/content/courses.ts içinde; kişisel içerik paketleri
// ozel-kaynak/icerik/*.json dosyalarından aynı şekilde okunur (bkz. src/lib/courses.ts).

export type Lesson = {
  id: string;
  title: string;
  bpm: number;
  /** Dersin hedef çalışma süresi (dakika). Bu süreye ulaşınca ders tamamlanır. */
  minutes: number;
  description?: string;
  tips?: string[];
  /** alphaTex formatında tab */
  tex?: string;
  /** ozel-kaynak klasörüne göre tab dosyası yolu (.gp, .gpx, .xml …) */
  tabFile?: string;
};

export type Chapter = {
  /** "1.0", "1.1" … */
  code: string;
  title: string;
  lessons: Lesson[];
};

export type Section = {
  number: number;
  title: string;
  chapters: Chapter[];
  /** Bölüm sonunda sınav satırı gösterilsin mi */
  exam?: boolean;
};

export type Course = {
  slug: string;
  title: string;
  description: string;
  kind: "technique" | "guide";
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
};
