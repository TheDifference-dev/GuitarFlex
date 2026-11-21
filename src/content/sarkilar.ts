// Popüler şarkı ve sololar. Tablar uygulamada değil, Songsterr'de açılır (telifli içerik burada tutulmaz).
// Kişisel liste için içerik paketine icerik/sarkilar.json eklenebilir.

export type SongLevel = 1 | 2 | 3;

export type PopularSong = {
  title: string;
  artist: string;
  /** 1 = kolay, 2 = orta, 3 = zor */
  level: SongLevel;
  kind: "şarkı" | "solo" | "riff";
  /** Şarkıda öne çıkan teknikler (serbest metin) */
  tags: string[];
  /** İlgili kurslar: "Bu şarkı için çalış" bağlantıları */
  courses?: string[];
  /** Doğrudan bağlantı; verilmezse Songsterr'de arama açılır */
  url?: string;
  /** Zorluk madalyası (Tüm Şarkılar filtreleri) */
  madalya?: Madalya;
  koken?: "Global" | "Türkçe";
  bpm?: number;
  /** Listeye yeni eklenen şarkı */
  yeni?: boolean;
  /** Şarkı Rehberi adımı: sıra, seviye kodu (ör. "1.10"), hazırlayan teknik bölümleri ve kilit eşiği */
  rehber?: { adim: number; seviye: string; bolumler: { kurs: string; bolum: number; ad: string }[]; puan: number };
};

export const MADALYALAR = ["Bronz", "Gümüş", "Altın", "Platin", "Elmas", "Usta"] as const;
export type Madalya = (typeof MADALYALAR)[number];

export const LEVEL_NAMES: Record<SongLevel, string> = { 1: "Kolay", 2: "Orta", 3: "Zor" };

export function songUrl(s: PopularSong): string {
  return s.url ?? `https://www.songsterr.com/?pattern=${encodeURIComponent(`${s.artist} ${s.title}`)}`;
}

const S = (title: string, artist: string, level: SongLevel, kind: PopularSong["kind"], tags: string[], courses: string[] = []): PopularSong => ({
  title, artist, level, kind, tags, courses,
});

export const POPULAR_SONGS: PopularSong[] = [
  // Kolay
  S("Knockin' on Heaven's Door", "Bob Dylan", 1, "şarkı", ["Açık akorlar", "Tarama"], ["akorlar", "ritim-tarama"]),
  S("Horse with No Name", "America", 1, "şarkı", ["İki akor", "Tarama"], ["akorlar", "ritim-tarama"]),
  S("Wonderwall", "Oasis", 1, "şarkı", ["Add9 akorlar", "On altılık tarama"], ["akorlar", "ritim-tarama"]),
  S("Zombie", "The Cranberries", 1, "şarkı", ["Dört akor", "Tarama"], ["akorlar", "ritim-tarama"]),
  S("Seven Nation Army", "The White Stripes", 1, "riff", ["Tek tel riff", "Slide"], ["slide"]),
  S("Smoke on the Water", "Deep Purple", 1, "riff", ["Dörtlü çift notalar", "Riff"], ["palm-mute"]),
  S("Come As You Are", "Nirvana", 1, "riff", ["Tek nota riff", "Pes teller"], ["alternatif-pena"]),
  S("Smells Like Teen Spirit", "Nirvana", 1, "şarkı", ["Power chord", "Susturulmuş vuruş"], ["palm-mute", "ritim-tarama"]),
  S("Back in Black", "AC/DC", 1, "riff", ["Power chord", "Riff"], ["palm-mute"]),
  S("Paranoid", "Black Sabbath", 1, "şarkı", ["Power chord", "Palm mute"], ["palm-mute"]),
  S("Iron Man", "Black Sabbath", 1, "riff", ["Power chord", "Slide"], ["palm-mute", "slide"]),
  S("Bu Akşam", "Duman", 1, "şarkı", ["Akorlar", "Tarama"], ["akorlar", "ritim-tarama"]),
  // Orta
  S("Nothing Else Matters", "Metallica", 2, "şarkı", ["Açık tel arpej", "Mi minör"], ["arpej"]),
  S("House of the Rising Sun", "The Animals", 2, "şarkı", ["6/8 arpej", "La minör"], ["arpej", "akorlar"]),
  S("Wish You Were Here", "Pink Floyd", 2, "şarkı", ["Akor süslemeleri", "Pentatonik intro"], ["akorlar", "bend-vibrato"]),
  S("Wonderful Tonight", "Eric Clapton", 2, "şarkı", ["Bas yürüyüşü", "Bend"], ["akorlar", "bend-vibrato"]),
  S("Dust in the Wind", "Kansas", 2, "şarkı", ["Parmak arpej", "Alternatif bas"], ["arpej"]),
  S("Blackbird", "The Beatles", 2, "şarkı", ["Parmak stili", "Çift notalar"], ["arpej"]),
  S("Sweet Home Alabama", "Lynyrd Skynyrd", 2, "riff", ["Akor arpejleri", "Hammer-on"], ["arpej", "legato"]),
  S("Sunshine of Your Love", "Cream", 2, "riff", ["Blues riff", "Bend"], ["bend-vibrato"]),
  S("Enter Sandman", "Metallica", 2, "riff", ["Palm mute", "Power chord"], ["palm-mute"]),
  S("Thunderstruck", "AC/DC", 2, "riff", ["Açık tele pull-off", "Legato"], ["legato"]),
  S("Under the Bridge", "Red Hot Chili Peppers", 2, "şarkı", ["Akor süslemeleri", "Çift notalar"], ["akorlar", "arpej"]),
  S("Plug In Baby", "Muse", 2, "riff", ["Alternate picking", "Pedal tonu"], ["alternatif-pena"]),
  S("Purple Haze", "Jimi Hendrix", 2, "şarkı", ["Riff", "Bend", "7♯9 akoru"], ["bend-vibrato"]),
  S("Johnny B. Goode", "Chuck Berry", 2, "solo", ["Çift nota bend", "Shuffle"], ["bend-vibrato", "ritim-tarama"]),
  S("Cambaz", "mor ve ötesi", 2, "şarkı", ["Riff", "Palm mute"], ["palm-mute"]),
  // Zor
  S("Stairway to Heaven", "Led Zeppelin", 3, "solo", ["Pentatonik", "Bend", "Arpej intro"], ["bend-vibrato", "arpej"]),
  S("Hotel California", "Eagles", 3, "solo", ["Armonize solo", "Bend"], ["bend-vibrato", "arpej"]),
  S("Comfortably Numb", "Pink Floyd", 3, "solo", ["Bend", "Vibrato", "Pentatonik"], ["bend-vibrato"]),
  S("Sweet Child O' Mine", "Guns N' Roses", 3, "solo", ["Alternate picking", "Tel atlama", "Bend"], ["alternatif-pena", "bend-vibrato"]),
  S("Sultans of Swing", "Dire Straits", 3, "solo", ["Parmakla çalım", "Arpej"], ["arpej"]),
  S("Little Wing", "Jimi Hendrix", 3, "şarkı", ["Akor süslemeleri", "Çift notalar"], ["akorlar"]),
  S("Pride and Joy", "Stevie Ray Vaughan", 3, "şarkı", ["Shuffle", "Blues solo"], ["ritim-tarama", "bend-vibrato"]),
  S("Master of Puppets", "Metallica", 3, "riff", ["Aşağı pena", "Palm mute", "Hız"], ["palm-mute"]),
  S("Crazy Train", "Ozzy Osbourne", 3, "solo", ["Alternate picking", "Tapping", "Armonik minör"], ["alternatif-pena", "tapping"]),
  S("Eruption", "Van Halen", 3, "solo", ["Tapping", "Legato"], ["tapping", "legato"]),
  S("Cliffs of Dover", "Eric Johnson", 3, "solo", ["Pentatonik", "Legato", "Economy picking"], ["legato", "economy-pena"]),
  S("Surfing with the Alien", "Joe Satriani", 3, "solo", ["Legato", "Tapping"], ["legato", "tapping"]),
  S("Tornado of Souls", "Megadeth", 3, "solo", ["Alternate picking", "Sweep"], ["alternatif-pena", "sweep"]),
  S("Far Beyond the Sun", "Yngwie Malmsteen", 3, "solo", ["Armonik minör", "Sweep", "Economy picking"], ["sweep", "economy-pena"]),
  S("Through the Fire and Flames", "DragonForce", 3, "solo", ["Tapping", "Sweep", "Hız"], ["tapping", "sweep"]),
  // Songsterr ana sayfasında en çok açılanlar (21.11.2026 listesi) — tablar Songsterr'de açılır
  S("Creep", "Radiohead", 1, "şarkı", ["Barre akorlar", "Arpej", "Dinamik"], ["akorlar", "arpej"]),
  S("Seven Nation Army", "The White Stripes", 1, "riff", ["Tek tel riff", "Slide"], ["slide"]),
  S("Highway to Hell", "AC/DC", 1, "riff", ["Power chord", "Açık akor"], ["akorlar", "ritim-tarama"]),
  S("Another One Bites the Dust", "Queen", 1, "riff", ["Bas riff", "Susmalar"], ["palm-mute"]),
  S("Where Is My Mind?", "Pixies", 1, "şarkı", ["Power chord", "Tek nota melodi"], ["akorlar"]),
  S("Heart-Shaped Box", "Nirvana", 1, "şarkı", ["Power chord", "Dinamik"], ["akorlar", "palm-mute"]),
  S("Feel Good Inc.", "Gorillaz", 1, "riff", ["Akustik ritim", "Susturma"], ["ritim-tarama"]),
  S("Money", "Pink Floyd", 2, "riff", ["7/4 riff", "Blues solo"], ["bend-vibrato"]),
  S("Californication", "Red Hot Chili Peppers", 2, "şarkı", ["Arpej", "Çift notalar"], ["arpej"]),
  S("Can't Stop", "Red Hot Chili Peppers", 2, "riff", ["Funk susturma", "On altılık"], ["ritim-tarama"]),
  S("Do I Wanna Know?", "Arctic Monkeys", 2, "riff", ["Slide", "Hammer-on"], ["slide", "hammer-on-pull-off"]),
  S("Everlong", "Foo Fighters", 2, "şarkı", ["Drop D", "Açık tel akorlar", "Hızlı tarama"], ["ritim-tarama", "akorlar"]),
  S("Killing in the Name", "Rage Against the Machine", 2, "riff", ["Drop D", "Palm mute", "Susturma"], ["palm-mute"]),
  S("War Pigs", "Black Sabbath", 2, "riff", ["Power chord", "Pentatonik riff"], ["palm-mute", "bend-vibrato"]),
  S("Aerials", "System of a Down", 2, "şarkı", ["Drop C", "Arpej", "Power chord"], ["arpej", "palm-mute"]),
  S("Toxicity", "System of a Down", 2, "riff", ["Drop C", "Tel atlama", "Palm mute"], ["palm-mute", "alternatif-pena"]),
  S("Chop Suey!", "System of a Down", 2, "riff", ["Drop C", "Hızlı tarama", "Palm mute"], ["palm-mute", "ritim-tarama"]),
  S("For Whom the Bell Tolls", "Metallica", 2, "riff", ["Kromatik riff", "Palm mute"], ["palm-mute"]),
  S("Seek & Destroy", "Metallica", 2, "riff", ["Palm mute", "Hammer-on"], ["palm-mute", "legato"]),
  S("Psychosocial", "Slipknot", 2, "riff", ["Drop B", "Palm mute", "Pedal"], ["palm-mute", "alternatif-pena"]),
  S("My Own Summer (Shove It)", "Deftones", 2, "riff", ["Düşük akort", "Palm mute", "Dinamik"], ["palm-mute"]),
  S("Fade to Black", "Metallica", 3, "solo", ["Arpej intro", "Bend", "Pentatonik"], ["arpej", "bend-vibrato"]),
  S("One", "Metallica", 3, "solo", ["Arpej", "Galop riff", "Tapping"], ["arpej", "palm-mute", "tapping"]),
  S("The Trooper", "Iron Maiden", 3, "riff", ["Galop", "Armonize melodi"], ["alternatif-pena", "palm-mute"]),
  S("Hysteria", "Muse", 3, "riff", ["Hızlı alternate picking", "On altılık"], ["alternatif-pena"]),
  S("Symphony of Destruction", "Megadeth", 2, "riff", ["Palm mute", "Power chord"], ["palm-mute"]),
  S("Beat It", "Michael Jackson", 3, "solo", ["Tapping", "Hızlı pentatonik"], ["tapping", "bend-vibrato"]),
  S("Bohemian Rhapsody", "Queen", 3, "solo", ["Melodik solo", "Bend", "Vibrato"], ["bend-vibrato"]),
];
