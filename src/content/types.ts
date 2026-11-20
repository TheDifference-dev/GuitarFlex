// ── Kurs yapısı: Kurs → Bölüm → Alt bölüm (1.0, 1.1 …) → Ders ─────────────────
// Yerleşik kurslar src/content/kurslar/ içinde; kişisel içerik paketleri
// ozel-kaynak/icerik/*.json dosyalarından aynı şekilde okunur (bkz. src/lib/courses.ts).

// ── Müfredat etiketleri (Müfredat Spec v2.2 §4) ───────────────────────────────
// Hepsi isteğe bağlıdır; etiketsiz içerik aynen çalışır. Etiketler kurs içindeki sırayı
// belirlemez, yalnızca Seviye Yolu için üstüne eklenen bir katmandır.

/** Seviye: L1 Başlangıç … L5 İleri */
export type Level = "L1" | "L2" | "L3" | "L4" | "L5";

/** Beceri ekseni: teknik, klavye (sap), ritim, teori/kulak */
export type Axis = "technique" | "fretboard" | "rhythm" | "theory_ear";

/** Alt bölüm ve derste ortak etiketler. Ders alanı varsa alt bölümünkünü ezer. */
export type Tags = {
  level?: Level;
  /** Eksenler; ilk eleman ana eksen */
  axes?: Axis[];
  /** Beceri etiketleri: beceri-sozlugu.json anahtarları (ör. "F.pent_5boxes") */
  skills?: string[];
};

/** Dersin türü: drill (varsayılan, kısa tek fikir) · etut (seviye sonu uzun parça) · okuma (tabsız adım)
 *  · quickstudy (okuma + doğaçlama) · transkripsiyon (gizli tab, kulaktan) · kompozisyon · resital */
export type LessonKind = "drill" | "etut" | "okuma" | "quickstudy" | "transkripsiyon" | "kompozisyon" | "resital";

/** Etüt formunun parçası */
export type FormPart = "intro" | "A" | "B" | "bridge" | "A2";

/** Çalışmanın kısmı (Egzersiz Yazım Standardı v2.3 §2, §5): A kalıp · A′ varyasyon · B uygulama · C birleştirme */
export type PartName = "A" | "A′" | "B" | "C";
/** Kısım: ad, ölçü aralığı (1'den başlar, kapsayıcı) ve kısmın işi (en çok 60 karakter) */
export type LessonPart = { name: PartName; bars: [number, number]; focus: string };

export type Lesson = Tags & {
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
  /** Dersin türü; verilmezse drill */
  kind?: LessonKind;
  /** Varyasyon: kaynak dersin id'si (ör. "Tersten" dersin asıl dersi) */
  variantOf?: string;
  /** Varyasyonun türü ("Tersten" dersler için reverse); verilirse `variantOf` zorunludur */
  variant?: "reverse" | "inversion" | "permutation";
  /** Rehberlerde kopya yerine kaynak ders: "<kurs-slug>#<ders-id>". Yüklenirken çözülür:
   *  dersin kendi tex/tabFile/body/theory alanı yoksa kaynak dersten alınır (bkz. src/lib/courses.ts). */
  ref?: string;
  /** Yalnız etüt: form parçaları ve ölçü sayıları (ör. [{ part: "A", bars: 8 }, …]) */
  form?: { part: FormPart; bars: number }[];
  /** Yalnız etüt: üç tempo turu (BPM, artan sırada) */
  tempoRounds?: [number, number, number];
  /** quickstudy: porteden okunacak ölçü aralığı [başlangıç, bitiş] */
  readBars?: [number, number];
  /** quickstudy: akor şemasıyla doğaçlanacak ölçü aralığı [başlangıç, bitiş] */
  improvBars?: [number, number];
  /** transkripsiyon: tab gösterilmez, yalnız ses olarak çalınır */
  hideTab?: boolean;
  /** quickstudy ve kompozisyon (v2.2 İP6d): ölçü başına akor adı, tabın ölçü sayısı kadar (ör. ["Am", "F", "C", "G G7"]).
   *  Bir ölçüde iki akor boşlukla ayrılır ve ölçüyü yarı yarıya paylaşır. Uygulama eşliği (bas, davul, akor) ve
   *  doğaçlama bölümünün akor şemasını buradan kurar; kompozisyonda güçlü vuruş geri bildirimi bu akorlara göredir. */
  chords?: string[];
  /** Tab oynatıcının görünümü (Spec v2.2 §4, İP6'da eklendi): "score" yalnız nota — porte okuma dersleri; tab gizlidir,
   *  görünüm düğmeleri kapanır · "tab" yalnız tab · "both" nota + tab (ör. ritim okuma). Verilmezse bugünkü varsayılan
   *  görünüm (tab; öğrenci düğmelerle değiştirebilir). */
  stave?: Stave;
  /** Çalışmanın kısımları (Egzersiz Yazım Standardı v2.3 §5): ardışık, boşluksuz, son kısım son ölçüde biter.
   *  Oynatıcı kısım kısım döngüye alabilir. Verilmezse çalışma tek parça gösterilir. */
  parts?: LessonPart[];
};

/** Tab oynatıcı görünümü: yalnız nota, yalnız tab ya da ikisi birlikte */
export type Stave = "score" | "tab" | "both";

/** Alt bölüm; etiketleri (Tags) bütün derslerine geçerlidir, ders kendi etiketiyle ezebilir. */
export type Chapter = Tags & {
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

// ── Şarkı Kütüphanesi (Egzersiz Yazım Standardı v2.3 K15, İP10b) ──────────────
// İçerik paketindeki icerik/kutuphane.json'dan okunur (bkz. src/lib/kutuphane.ts). Yalnız özgün parçalar ve kamu malı
// ezgilerin GuitarFlex düzenlemeleri bulunur; telifli şarkı tabı, notası ya da sözü yoktur.

export type LibraryGenre =
  | "Blues" | "Rock" | "Funk" | "Metal" | "Pop" | "Caz" | "Bossa Nova" | "Reggae" | "Country" | "Fingerstyle" | "Türk Halk Müziği" | "Klasik";

/** Kaynak: özgün parça ya da kamu malı ezginin düzenlemesi */
export type LibrarySource = "Özgün (GuitarFlex)" | "Geleneksel / kamu malı, düzenleme: GuitarFlex";

/** Track'in parçadaki işi: kurşun/solo gitar, ritim gitar, bas, davul, piyano, yaylılar, org */
export type LibraryTrackRole = "lead" | "rhythm" | "bass" | "drums" | "keys" | "strings" | "organ";

/** Track: tex'teki sırayla (0'dan); `instrument` görünen enstrüman adıdır */
export type LibraryTrack = { name: string; role: LibraryTrackRole; instrument: string };

/** Şarkının kısmı (giriş, kıta, nakarat, solo …): yazılı ölçü aralığı (1'den, kapsayıcı), tekrar sayısı ve akorları */
export type LibraryPart = { name: string; bars: [number, number]; repeat?: number; chords: string[]; focus?: string };

export type LibrarySong = {
  slug: string;
  title: string;
  genre: LibraryGenre;
  level: Level;
  /** Ton (ör. "La minör", "Sol majör") */
  key: string;
  bpm: number;
  /** Ölçü birimi (ör. "4/4", "9/8") */
  timeSignature: string;
  /** Ritim hissi (ör. "Shuffle", "Swing", "Aksak 2+2+2+3") */
  feel?: string;
  source: LibrarySource;
  /** Kamu malı ezgilerde ezginin kökeni (ör. "L. van Beethoven, 9. Senfoni (1824)") */
  origin?: string;
  description: string;
  tracks: LibraryTrack[];
  parts: LibraryPart[];
  /** Şarkıdaki akorlar, ilk geçtikleri sırayla */
  chords: string[];
  /** Çalışma ipuçları */
  tips: string[];
  /** Şarkıda kullanılan teknikler (ör. "bend", "palm mute") */
  techniques: string[];
  /** Yazılı ölçü sayısı (tab) */
  bars: number;
  /** Tekrarlarla çalınan ölçü sayısı */
  playedBars: number;
  /** Yaklaşık süre (saniye, tab temposunda) */
  durationSec: number;
  /** Çok track'li alphaTex */
  tex: string;
};

/** icerik/kutuphane.json */
export type Library = { version: 1; songs: LibrarySong[] };
