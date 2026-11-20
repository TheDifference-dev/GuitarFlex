// General MIDI programı (0–127) → Türkçe enstrüman adı, aile ve simge. Tek kaynak: mikser, track seçici, Şarkı Kütüphanesi
// filtreleri ve içe aktarılan dosyaların özeti buradan okur. Saf veri dosyasıdır (React yok); içerik üreticisi de kullanabilir.
// Simgelerin çizimi: src/components/oynatici/EnstrumanSimgesi.tsx.

/** Enstrüman ailesi (kütüphane filtresi ve mikser grupları) */
export type EnstrumanAilesi = "gitar" | "bas" | "davul" | "klavye" | "yayli" | "uflemeli" | "vokal" | "diger";

/** Simge türü (aile içinde ayrım: akustik/elektro gitar, piyano/org/synth, bakır/saksofon/flüt …) */
export type EnstrumanSimge =
  | "gitar-akustik" | "gitar-elektro" | "bas" | "davul" | "perkusyon" | "piyano" | "org" | "synth" | "yayli" | "bakir" | "saksofon" | "flut" | "vokal" | "diger";

export type Enstruman = {
  /** General MIDI programı (0–127); davul seti için −1 */
  program: number;
  ad: string;
  aile: EnstrumanAilesi;
  simge: EnstrumanSimge;
  /** Kısa tür etiketi (ör. "Temiz", "Overdrive", "Naylon"): gitar ve bas track'lerinde adın yanında gösterilir */
  tur?: string;
};

export const AILELER: { id: EnstrumanAilesi; ad: string; simge: EnstrumanSimge }[] = [
  { id: "gitar", ad: "Gitar", simge: "gitar-elektro" },
  { id: "bas", ad: "Bas", simge: "bas" },
  { id: "davul", ad: "Davul ve perküsyon", simge: "davul" },
  { id: "klavye", ad: "Klavye", simge: "piyano" },
  { id: "yayli", ad: "Yaylılar", simge: "yayli" },
  { id: "uflemeli", ad: "Üflemeliler", simge: "bakir" },
  { id: "vokal", ad: "Vokal ve melodi", simge: "vokal" },
  { id: "diger", ad: "Diğer", simge: "diger" },
];
export const AILE_ADI = Object.fromEntries(AILELER.map((a) => [a.id, a.ad])) as Record<EnstrumanAilesi, string>;

type Satir = [ad: string, aile: EnstrumanAilesi, simge: EnstrumanSimge, tur?: string];

// Sıra General MIDI Level 1 program sırasıdır (0'dan); adlar Türkçe.
const TABLO: Satir[] = [
  // 0–7 Piyanolar
  ["Akustik kuyruklu piyano", "klavye", "piyano"],
  ["Parlak akustik piyano", "klavye", "piyano"],
  ["Elektrikli kuyruklu piyano", "klavye", "piyano"],
  ["Honky-tonk piyano", "klavye", "piyano"],
  ["Elektro piyano 1 (Rhodes)", "klavye", "piyano"],
  ["Elektro piyano 2 (FM)", "klavye", "piyano"],
  ["Klavsen", "klavye", "piyano"],
  ["Klavinet", "klavye", "piyano"],
  // 8–15 Kromatik perküsyon
  ["Çelesta", "davul", "perkusyon"],
  ["Glockenspiel", "davul", "perkusyon"],
  ["Müzik kutusu", "davul", "perkusyon"],
  ["Vibrafon", "davul", "perkusyon"],
  ["Marimba", "davul", "perkusyon"],
  ["Ksilofon", "davul", "perkusyon"],
  ["Boru çanlar", "davul", "perkusyon"],
  ["Santur (dulcimer)", "diger", "diger"],
  // 16–23 Orglar
  ["Çekçubuklu org", "klavye", "org"],
  ["Perküsif org", "klavye", "org"],
  ["Rock org", "klavye", "org"],
  ["Kilise orgu", "klavye", "org"],
  ["Kamışlı org", "klavye", "org"],
  ["Akordeon", "klavye", "org"],
  ["Mızıka", "uflemeli", "flut"],
  ["Tango akordeonu (bandoneon)", "klavye", "org"],
  // 24–31 Gitarlar
  ["Naylon telli gitar", "gitar", "gitar-akustik", "Naylon"],
  ["Çelik telli akustik gitar", "gitar", "gitar-akustik", "Akustik"],
  ["Caz gitarı", "gitar", "gitar-elektro", "Caz"],
  ["Temiz elektro gitar", "gitar", "gitar-elektro", "Temiz"],
  ["Susturulmuş elektro gitar", "gitar", "gitar-elektro", "Susturulmuş"],
  ["Overdrive elektro gitar", "gitar", "gitar-elektro", "Overdrive"],
  ["Distorsiyonlu elektro gitar", "gitar", "gitar-elektro", "Distortion"],
  ["Gitar armonikleri", "gitar", "gitar-elektro", "Armonik"],
  // 32–39 Baslar
  ["Akustik bas (kontrbas)", "bas", "bas", "Akustik"],
  ["Elektro bas (parmak)", "bas", "bas", "Parmak"],
  ["Elektro bas (pena)", "bas", "bas", "Pena"],
  ["Perdesiz bas", "bas", "bas", "Perdesiz"],
  ["Slap bas 1", "bas", "bas", "Slap"],
  ["Slap bas 2", "bas", "bas", "Slap"],
  ["Synth bas 1", "bas", "bas", "Synth"],
  ["Synth bas 2", "bas", "bas", "Synth"],
  // 40–47 Yaylılar
  ["Keman", "yayli", "yayli"],
  ["Viyola", "yayli", "yayli"],
  ["Çello", "yayli", "yayli"],
  ["Kontrbas (yaylı)", "yayli", "yayli"],
  ["Tremolo yaylılar", "yayli", "yayli"],
  ["Pizzicato yaylılar", "yayli", "yayli"],
  ["Arp", "diger", "diger"],
  ["Timpani", "davul", "perkusyon"],
  // 48–55 Topluluklar
  ["Yaylı topluluğu 1", "yayli", "yayli"],
  ["Yaylı topluluğu 2", "yayli", "yayli"],
  ["Synth yaylılar 1", "yayli", "yayli"],
  ["Synth yaylılar 2", "yayli", "yayli"],
  ["Koro (aah)", "vokal", "vokal"],
  ["Vokal (ooh)", "vokal", "vokal"],
  ["Synth vokal", "vokal", "vokal"],
  ["Orkestra vuruşu", "diger", "diger"],
  // 56–63 Bakır üflemeliler
  ["Trompet", "uflemeli", "bakir"],
  ["Trombon", "uflemeli", "bakir"],
  ["Tuba", "uflemeli", "bakir"],
  ["Sürdinli trompet", "uflemeli", "bakir"],
  ["Korno", "uflemeli", "bakir"],
  ["Bakır üflemeli bölümü", "uflemeli", "bakir"],
  ["Synth bakır 1", "uflemeli", "bakir"],
  ["Synth bakır 2", "uflemeli", "bakir"],
  // 64–71 Kamışlılar
  ["Soprano saksofon", "uflemeli", "saksofon"],
  ["Alto saksofon", "uflemeli", "saksofon"],
  ["Tenor saksofon", "uflemeli", "saksofon"],
  ["Bariton saksofon", "uflemeli", "saksofon"],
  ["Obua", "uflemeli", "flut"],
  ["İngiliz kornosu", "uflemeli", "flut"],
  ["Fagot", "uflemeli", "flut"],
  ["Klarnet", "uflemeli", "flut"],
  // 72–79 Flütler
  ["Pikolo", "uflemeli", "flut"],
  ["Flüt", "uflemeli", "flut"],
  ["Blok flüt", "uflemeli", "flut"],
  ["Pan flüt", "uflemeli", "flut"],
  ["Şişe üfleme", "uflemeli", "flut"],
  ["Shakuhachi", "uflemeli", "flut"],
  ["Islık", "vokal", "vokal"],
  ["Okarina", "uflemeli", "flut"],
  // 80–87 Synth lead
  ["Synth lead 1 (kare dalga)", "klavye", "synth"],
  ["Synth lead 2 (testere dişi)", "klavye", "synth"],
  ["Synth lead 3 (kaliope)", "klavye", "synth"],
  ["Synth lead 4 (chiff)", "klavye", "synth"],
  ["Synth lead 5 (charang)", "klavye", "synth"],
  ["Synth lead 6 (ses)", "vokal", "vokal"],
  ["Synth lead 7 (beşliler)", "klavye", "synth"],
  ["Synth lead 8 (bas + lead)", "klavye", "synth"],
  // 88–95 Synth pad
  ["Synth pad 1 (new age)", "klavye", "synth"],
  ["Synth pad 2 (sıcak)", "klavye", "synth"],
  ["Synth pad 3 (polisynth)", "klavye", "synth"],
  ["Synth pad 4 (koro)", "klavye", "synth"],
  ["Synth pad 5 (yaylı cam)", "klavye", "synth"],
  ["Synth pad 6 (metalik)", "klavye", "synth"],
  ["Synth pad 7 (halo)", "klavye", "synth"],
  ["Synth pad 8 (süpürme)", "klavye", "synth"],
  // 96–103 Synth efektleri
  ["Synth efekt 1 (yağmur)", "klavye", "synth"],
  ["Synth efekt 2 (film müziği)", "klavye", "synth"],
  ["Synth efekt 3 (kristal)", "klavye", "synth"],
  ["Synth efekt 4 (atmosfer)", "klavye", "synth"],
  ["Synth efekt 5 (parlaklık)", "klavye", "synth"],
  ["Synth efekt 6 (goblinler)", "klavye", "synth"],
  ["Synth efekt 7 (yankılar)", "klavye", "synth"],
  ["Synth efekt 8 (bilim kurgu)", "klavye", "synth"],
  // 104–111 Etnik
  ["Sitar", "diger", "gitar-akustik"],
  ["Banjo", "diger", "gitar-akustik"],
  ["Shamisen", "diger", "gitar-akustik"],
  ["Koto", "diger", "diger"],
  ["Kalimba", "davul", "perkusyon"],
  ["Gayda", "uflemeli", "flut"],
  ["Halk kemanı (fiddle)", "yayli", "yayli"],
  ["Zurna (shehnai)", "uflemeli", "flut"],
  // 112–119 Perküsif
  ["Çıngırak", "davul", "perkusyon"],
  ["Agogo", "davul", "perkusyon"],
  ["Çelik davul", "davul", "perkusyon"],
  ["Tahta blok", "davul", "perkusyon"],
  ["Taiko davulu", "davul", "perkusyon"],
  ["Melodik tom", "davul", "perkusyon"],
  ["Synth davul", "davul", "perkusyon"],
  ["Ters zil", "davul", "perkusyon"],
  // 120–127 Ses efektleri
  ["Gitar perde sesi", "diger", "diger"],
  ["Nefes sesi", "diger", "diger"],
  ["Deniz kıyısı", "diger", "diger"],
  ["Kuş cıvıltısı", "diger", "diger"],
  ["Telefon zili", "diger", "diger"],
  ["Helikopter", "diger", "diger"],
  ["Alkış", "diger", "diger"],
  ["Silah sesi", "diger", "diger"],
];

/** 128 General MIDI programı (dizin = program numarası, 0'dan) */
export const GM: readonly Enstruman[] = TABLO.map(([ad, aile, simge, tur], program) => ({ program, ad, aile, simge, ...(tur ? { tur } : {}) }));

/** Perküsyon kanalındaki (MIDI kanal 10) track: davul seti ya da el perküsyonu */
export const DAVUL_SETI: Enstruman = { program: -1, ad: "Davul ve perküsyon", aile: "davul", simge: "davul" };
const BILINMEYEN: Enstruman = { program: -1, ad: "Enstrüman", aile: "diger", simge: "diger" };

const VOKAL_ADI = /\b(vokal|vocal|vocals|voice|vox|şarkı sözü|lyrics|lead vocal|melodi|melody|sing|singer|chant)\b/i;
const BAS_ADI = /^(kontra?)?bas\b|\bbass\b/i;

/**
 * Track'in enstrümanı. `ad` (track adı) verilirse iki ipucu uygulanır: dosyalarda vokal ezgisi çoğu kez başka bir programla
 * (flüt, synth lead, piyano) yazılır ve track adı "Vocals" / "Vokal" olur → aile vokal; adı "Bas" olan track bas ailesidir.
 */
export function enstruman(program: number | undefined | null, perkusyon = false, ad?: string): Enstruman {
  if (perkusyon) return DAVUL_SETI;
  const e = typeof program === "number" && Number.isInteger(program) && program >= 0 && program < GM.length ? GM[program] : BILINMEYEN;
  if (ad) {
    if (VOKAL_ADI.test(ad) && e.aile !== "vokal" && e.aile !== "gitar" && e.aile !== "bas") return { ...e, aile: "vokal", simge: "vokal" };
    if (BAS_ADI.test(ad.trim()) && e.aile !== "bas" && e.aile !== "yayli") return { ...e, aile: "bas", simge: "bas" };
  }
  return e;
}

/** Track listesindeki aileler, AILELER sırasıyla ve tekrarsız (liste satırındaki simgeler) */
export function aileler(izler: { program?: number | null; perkusyon?: boolean; ad?: string }[]): EnstrumanAilesi[] {
  const var_ = new Set(izler.map((t) => enstruman(t.program, !!t.perkusyon, t.ad).aile));
  return AILELER.map((a) => a.id).filter((a) => var_.has(a));
}
