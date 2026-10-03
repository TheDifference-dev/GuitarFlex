// Popüler şarkı ve sololar. Tablar uygulamada değil, Songsterr'de açılır (telifli içerik burada tutulmaz).
// Kişisel liste için içerik paketine icerik/sarkilar.json eklenebilir (bkz. docs/ICERIK-PAKETI.md).

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
};

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
  S("Haydi Gel İçelim", "Duman", 1, "şarkı", ["Açık akorlar", "Tarama"], ["akorlar", "ritim-tarama"]),
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
];
