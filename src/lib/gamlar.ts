// Sap Gezgini'nin gam/mod/akor kütüphanesi: formüller derece simgeleriyle yazılır, notalar kökten harf adımı
// korunarak hecelenir (Fa Lidyen'de Si, Si♭ majörde La♯ değil Si♭). Konumlar: pentatoniklerde 5 kutu (tel başına
// iki nota), yedi notalı gamlarda 7 adet 3 nota/tel kalıbı. Bu dosya saf TypeScript'tir (React yok):
// scripts/teori-dogrula.mjs formülleri, hecelemeyi ve kutuları kendi bağımsız hesabıyla denetler.

export type GamGrup = "major-modlar" | "pentatonik" | "minor-aileleri" | "simetrik" | "akorlar";

export type GamTanim = {
  id: string;
  ad: string;
  /** Kısa ikinci ad (İngilizce ya da yaygın ad) */
  diger?: string;
  grup: GamGrup;
  /** Derece simgeleri: "1 2 b3 4 5 6 b7" */
  formul: string;
  /** Bir ana gamın modu ise: ana gamın kimliği ve derecesi (1–7) */
  aile?: { ana: string; derece: number };
  /** Karakter notası (vurgulanır) ve kısa açıklama */
  karakter?: string[];
  not?: string;
  /** İlgili teori dersi (/teori/<ders>) */
  ders?: string;
  /** Konum düzeni: penta (5 kutu), 3nps (7 kalıp); blues kutuları pentatonik iskeletten */
  konum?: "penta" | "3nps";
  /** Kutuların kurulduğu beş notalı iskelet (blues gamlarında) */
  iskelet?: string;
};

export const GRUP_ADI: Record<GamGrup, string> = {
  "major-modlar": "Majör gamın modları",
  pentatonik: "Pentatonik ve blues",
  "minor-aileleri": "Armonik ve melodik minör",
  simetrik: "Simetrik gamlar",
  akorlar: "Akorlar (arpej)",
};

export const GAMLAR: GamTanim[] = [
  // Majör gamın yedi modu, parlaktan karanlığa değil derece sırasıyla
  { id: "major", ad: "İyonyen (majör)", diger: "Ionian", grup: "major-modlar", formul: "1 2 3 4 5 6 7", aile: { ana: "major", derece: 1 }, karakter: ["4", "7"], not: "Majör gamın kendisi: parlak, kararlı.", ders: "major-gam", konum: "3nps" },
  { id: "dorian", ad: "Doryen", diger: "Dorian", grup: "major-modlar", formul: "1 2 b3 4 5 6 b7", aile: { ana: "major", derece: 2 }, karakter: ["6"], not: "Minör + büyük 6: funk, soul ve rock'ın parlak minörü.", ders: "modlar", konum: "3nps" },
  { id: "phrygian", ad: "Frigyen", diger: "Phrygian", grup: "major-modlar", formul: "1 b2 b3 4 5 b6 b7", aile: { ana: "major", derece: 3 }, karakter: ["b2"], not: "Minör + küçük 2: metal ve flamenko rengi.", ders: "modlar", konum: "3nps" },
  { id: "lydian", ad: "Lidyen", diger: "Lydian", grup: "major-modlar", formul: "1 2 3 #4 5 6 7", aile: { ana: "major", derece: 4 }, karakter: ["#4"], not: "Majör + artık 4: en parlak mod, rüya gibi.", ders: "modlar", konum: "3nps" },
  { id: "mixolydian", ad: "Miksolidyen", diger: "Mixolydian", grup: "major-modlar", formul: "1 2 3 4 5 6 b7", aile: { ana: "major", derece: 5 }, karakter: ["b7"], not: "Majör + küçük 7: blues-rock, dominant 7 rengi.", ders: "modlar", konum: "3nps" },
  { id: "minor", ad: "Eolyen (doğal minör)", diger: "Aeolian", grup: "major-modlar", formul: "1 2 b3 4 5 b6 b7", aile: { ana: "major", derece: 6 }, karakter: ["b6"], not: "Doğal minör: hüzünlü, rock ve pop baladları.", ders: "minor-gam", konum: "3nps" },
  { id: "locrian", ad: "Lokriyen", diger: "Locrian", grup: "major-modlar", formul: "1 b2 b3 4 b5 b6 b7", aile: { ana: "major", derece: 7 }, karakter: ["b5"], not: "Küçük 2 ve eksik 5: en karanlık mod; m7♭5 akorunun gamı.", ders: "modlar", konum: "3nps" },
  // Pentatonik ve blues
  { id: "minor-penta", ad: "Minör pentatonik", diger: "Minor pentatonic", grup: "pentatonik", formul: "1 b3 4 5 b7", not: "Rock ve blues solosunun beş notası.", ders: "pentatonik-sekiller", konum: "penta" },
  { id: "major-penta", ad: "Majör pentatonik", diger: "Major pentatonic", grup: "pentatonik", formul: "1 2 3 5 6", not: "Country, pop ve majör blues; paralel minör pentatonikle aynı beş nota.", ders: "pentatonik-blues", konum: "penta" },
  { id: "blues", ad: "Blues gamı (minör)", diger: "Blues", grup: "pentatonik", formul: "1 b3 4 b5 5 b7", karakter: ["b5"], not: "Minör pentatonik + ♭5 (blue note).", ders: "pentatonik-blues", konum: "penta", iskelet: "1 b3 4 5 b7" },
  { id: "major-blues", ad: "Majör blues gamı", diger: "Major blues", grup: "pentatonik", formul: "1 2 b3 3 5 6", karakter: ["b3"], not: "Majör pentatonik + ♭3; ♭3 → 3 kayması.", ders: "pentatonik-blues", konum: "penta", iskelet: "1 2 3 5 6" },
  // Armonik ve melodik minör aileleri
  { id: "harmonic-minor", ad: "Armonik minör", diger: "Harmonic minor", grup: "minor-aileleri", formul: "1 2 b3 4 5 b6 7", aile: { ana: "harmonic-minor", derece: 1 }, karakter: ["7"], not: "Doğal minör + büyük 7: V7 → i çözülmesi, neoklasik dil.", ders: "minor-aileleri", konum: "3nps" },
  { id: "phrygian-dominant", ad: "Frigyen dominant", diger: "Phrygian dominant", grup: "minor-aileleri", formul: "1 b2 3 4 5 b6 b7", aile: { ana: "harmonic-minor", derece: 5 }, karakter: ["b2", "3"], not: "Armonik minörün 5. modu; minörde V7 akorunun gamı. Gitarda Hicaz rengine yakın.", ders: "minor-aileleri", konum: "3nps" },
  { id: "melodic-minor", ad: "Melodik minör (caz minör)", diger: "Melodic minor", grup: "minor-aileleri", formul: "1 2 b3 4 5 6 7", aile: { ana: "melodic-minor", derece: 1 }, karakter: ["6", "7"], not: "Majör gamın 3'lüsü küçültülmüş hâli; mMaj7 akorunun gamı.", ders: "minor-aileleri", konum: "3nps" },
  { id: "dorian-b2", ad: "Doryen ♭2", diger: "Dorian ♭2", grup: "minor-aileleri", formul: "1 b2 b3 4 5 6 b7", aile: { ana: "melodic-minor", derece: 2 }, karakter: ["b2", "6"], ders: "minor-aileleri", konum: "3nps" },
  { id: "lydian-augmented", ad: "Lidyen artık", diger: "Lydian ♯5", grup: "minor-aileleri", formul: "1 2 3 #4 #5 6 7", aile: { ana: "melodic-minor", derece: 3 }, karakter: ["#5"], ders: "minor-aileleri", konum: "3nps" },
  { id: "lydian-dominant", ad: "Lidyen dominant", diger: "Lydian ♭7", grup: "minor-aileleri", formul: "1 2 3 #4 5 6 b7", aile: { ana: "melodic-minor", derece: 4 }, karakter: ["#4", "b7"], not: "Melodik minörün 4. modu: 7(♯11) akorunun gamı.", ders: "minor-aileleri", konum: "3nps" },
  { id: "mixolydian-b6", ad: "Miksolidyen ♭13", diger: "Mixolydian ♭6", grup: "minor-aileleri", formul: "1 2 3 4 5 b6 b7", aile: { ana: "melodic-minor", derece: 5 }, karakter: ["b6"], ders: "minor-aileleri", konum: "3nps" },
  { id: "locrian-nat2", ad: "Lokriyen ♮2", diger: "Locrian ♮2", grup: "minor-aileleri", formul: "1 2 b3 4 b5 b6 b7", aile: { ana: "melodic-minor", derece: 6 }, karakter: ["2"], not: "m7♭5 akorunda 9'u da kullanmak için.", ders: "minor-aileleri", konum: "3nps" },
  { id: "altered", ad: "Alterli (süper Lokriyen)", diger: "Altered", grup: "minor-aileleri", formul: "1 b2 #2 3 b5 #5 b7", aile: { ana: "melodic-minor", derece: 7 }, karakter: ["b2", "#2", "b5", "#5"], not: "Melodik minörün 7. modu; alterli dominantın (7alt) gamı. Gerilim yazımıyla: 1 ♭9 ♯9 3 ♭5 ♯5 ♭7.", ders: "minor-aileleri", konum: "3nps" },
  // Simetrik gamlar
  { id: "whole-tone", ad: "Tam ton gamı", diger: "Whole tone", grup: "simetrik", formul: "1 2 3 #4 #5 b7", not: "Altı tam ses; 7(♯5) akorunun gamı. Her tam ses kaydırılınca aynı gam.", ders: "minor-aileleri" },
  { id: "dim-hw", ad: "Azaltılmış (yarım–tam)", diger: "Half-whole diminished", grup: "simetrik", formul: "1 b2 #2 3 #4 5 6 b7", not: "Dominant 7(♭9) akorunun gamı; üç perdede bir kendini tekrarlar.", ders: "minor-aileleri" },
  { id: "dim-wh", ad: "Azaltılmış (tam–yarım)", diger: "Whole-half diminished", grup: "simetrik", formul: "1 2 b3 4 b5 #5 6 7", not: "Eksik yedili (dim7) akorunun gamı.", ders: "minor-aileleri" },
  // Akorlar (arpej görünümü)
  { id: "maj", ad: "Majör", grup: "akorlar", formul: "1 3 5", ders: "akor-yapisi" },
  { id: "min", ad: "Minör", grup: "akorlar", formul: "1 b3 5", ders: "akor-yapisi" },
  { id: "5", ad: "Power (5)", grup: "akorlar", formul: "1 5", ders: "akor-yapisi" },
  { id: "dim", ad: "Eksik (dim)", grup: "akorlar", formul: "1 b3 b5", ders: "akor-yapisi" },
  { id: "aug", ad: "Artık (aug)", grup: "akorlar", formul: "1 3 #5", ders: "akor-yapisi" },
  { id: "sus2", ad: "Sus2", grup: "akorlar", formul: "1 2 5", ders: "akor-yapisi" },
  { id: "sus4", ad: "Sus4", grup: "akorlar", formul: "1 4 5", ders: "akor-yapisi" },
  { id: "7", ad: "Dominant 7", grup: "akorlar", formul: "1 3 5 b7", ders: "yedili-akorlar" },
  { id: "maj7", ad: "Majör 7", grup: "akorlar", formul: "1 3 5 7", ders: "yedili-akorlar" },
  { id: "m7", ad: "Minör 7", grup: "akorlar", formul: "1 b3 5 b7", ders: "yedili-akorlar" },
  { id: "m7b5", ad: "Yarım eksik (m7♭5)", grup: "akorlar", formul: "1 b3 b5 b7", ders: "yedili-akorlar" },
  { id: "dim7", ad: "Eksik 7 (dim7)", grup: "akorlar", formul: "1 b3 b5 bb7", ders: "yedili-akorlar" },
];

export const gamBul = (id: string) => GAMLAR.find((g) => g.id === id);

// ── Yazım ────────────────────────────────────────────────────────────────────
const HARF = ["C", "D", "E", "F", "G", "A", "B"];
const SOLFEJ = ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si"];
const DOGAL = [0, 2, 4, 5, 7, 9, 11];
const pc = (m: number) => ((m % 12) + 12) % 12;

/** Seçilebilir kökler (harf adlarıyla): enarmonik iki yazım ayrı seçenek */
export const KOKLER = ["C", "C#", "Db", "D", "D#", "Eb", "E", "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B"] as const;

const YARIM: Record<string, number> = { "1": 0, b2: 1, "2": 2, "#2": 3, b3: 3, "3": 4, "4": 5, "#4": 6, b5: 6, "5": 7, "#5": 8, b6: 8, "6": 9, bb7: 9, b7: 10, "7": 11 };
export const simgeYarim = (s: string) => {
  const v = YARIM[s];
  if (v === undefined) throw new Error(`simge: ${s}`);
  return v;
};
const simgeSayi = (s: string) => Number(s.replace(/[b#]/g, ""));

export type Nota = { h: number; a: number };
export function kokCoz(ad: string): Nota {
  const h = HARF.indexOf(ad[0]);
  const ek = ad.slice(1);
  return { h, a: ek === "#" ? 1 : ek === "b" ? -1 : ek === "##" ? 2 : ek === "bb" ? -2 : 0 };
}
export const notaSesi = (n: Nota) => pc(DOGAL[n.h] + n.a);

/** Kökten derece simgesiyle yazılmış nota (harf adımı korunur) */
export function hecele(kok: string, simge: string): Nota {
  const k = kokCoz(kok);
  const h = (k.h + simgeSayi(simge) - 1) % 7;
  let a = pc(notaSesi(k) + simgeYarim(simge)) - DOGAL[h];
  if (a > 6) a -= 12;
  if (a < -6) a += 12;
  return { h, a };
}
const ARIZA = (a: number) => (a === 1 ? "♯" : a === 2 ? "𝄪" : a === -1 ? "♭" : a === -2 ? "𝄫" : "");
export const harfAdi = (n: Nota) => HARF[n.h] + ARIZA(n.a);
export const solfejAdi = (n: Nota) => SOLFEJ[n.h] + ARIZA(n.a);
export const kokAdi = (ad: string) => harfAdi(kokCoz(ad));
export const simgeYaz = (s: string) => s.replace(/^bb/, "𝄫").replace(/^b/, "♭").replace(/^#/, "♯");

export const formulSimgeleri = (g: GamTanim) => g.formul.split(" ");
export const kalip = (g: GamTanim) => formulSimgeleri(g).map(simgeYarim);
export const gamNotalari = (g: GamTanim, kok: string) => formulSimgeleri(g).map((s) => hecele(kok, s));

/** Bir ses sınıfı için varsayılan kök yazımı: majör karakterli gamlarda bemol, minör karakterlilerde diyez ağırlıklı */
export function varsayilanKok(p: number, g?: GamTanim): string {
  const minor = g ? formulSimgeleri(g).includes("b3") || formulSimgeleri(g).includes("#2") : false;
  const MAJOR = ["C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
  const MINOR = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "G#", "A", "Bb", "B"];
  return (minor ? MINOR : MAJOR)[pc(p)];
}

/** Modun ana gamı: kökün altındaki derece kadar inilerek bulunan kök (ör. Re Doryen → Do majör) */
export function anaGam(g: GamTanim, kok: string): { ana: GamTanim; kok: string } | null {
  if (!g.aile || g.aile.derece === 1) return null;
  const ana = gamBul(g.aile.ana);
  if (!ana) return null;
  const simge = formulSimgeleri(ana)[g.aile.derece - 1];
  // kök = ana kökün `simge` derecesi → ana kök = kökten aşağı aynı aralık; harf adımı geri alınır
  const k = kokCoz(kok);
  const h = (k.h - (simgeSayi(simge) - 1) + 7) % 7;
  let a = pc(notaSesi(k) - simgeYarim(simge)) - DOGAL[h];
  if (a > 6) a -= 12;
  if (a < -6) a += 12;
  return { ana, kok: HARF[h] + (a === 1 ? "#" : a === -1 ? "b" : a === 2 ? "##" : a === -2 ? "bb" : "") };
}

// ── Sapta konumlar ───────────────────────────────────────────────────────────
/** Standart akort, tel 1 (ince Mi) … 6 (kalın Mi), MIDI */
export const ACIK_TEL = [0, 64, 59, 55, 50, 45, 40];
export const SAP_PERDE = 17;
export type Konum = { t: number; p: number };

/** Konum seçenekleri: pentatoniklerde 5 kutu, 7 notalı gamlarda 7 adet 3 nota/tel kalıbı */
export function konumSayisi(g: GamTanim): number {
  if (g.konum === "penta") return 5;
  if (g.konum === "3nps") return formulSimgeleri(g).length === 7 ? 7 : 0;
  return 0;
}

/**
 * n. konumun (1'den) notaları: 6. telde iskeletin n. notasından başlayarak sesler tiz yöne sırayla, tel başına
 * k nota (penta 2, 3nps 3) dağıtılır. Blues gamlarında iskelet kutusunun tel aralığındaki blue note'lar eklenir.
 */
export function konumNotalari(g: GamTanim, kok: string, n: number): Konum[] {
  const iskeletSimge = (g.iskelet ?? g.formul).split(" ");
  const iv = iskeletSimge.map(simgeYarim);
  const k = g.konum === "penta" ? 2 : 3;
  const kokPc = notaSesi(kokCoz(kok));
  // 6. telde kökün en pes perdesi (0–11)
  const r6 = pc(kokPc - ACIK_TEL[6]);
  const bas = r6 + iv[(n - 1) % iv.length];
  const kur = (b: number) => {
    const out: Konum[] = [];
    let i = (n - 1) % iv.length;
    let ses = ACIK_TEL[6] + b;
    for (let t = 6; t >= 1; t--)
      for (let j = 0; j < k; j++) {
        out.push({ t, p: ses - ACIK_TEL[t] });
        const sonraki = (i + 1) % iv.length;
        ses += pc(iv[sonraki] - iv[i]) || 12;
        i = sonraki;
      }
    return out;
  };
  // Sapın görünen bölümüne (0–17) sığmayan kutu bir oktav aşağıda gösterilir
  let kutu = kur(bas);
  if (kutu.some((x) => x.p > SAP_PERDE) && bas >= 12) kutu = kur(bas - 12);
  if (kutu.some((x) => x.p < 0)) kutu = kur(bas + 12);
  if (g.iskelet) {
    // Blues: iskelette olmayan derecelerin (♭5, ♭3) kutudaki tel aralığına düşen yerleri
    const ekler = g.formul.split(" ").filter((s) => !iskeletSimge.includes(s)).map((s) => pc(kokPc + simgeYarim(s)));
    for (let t = 1; t <= 6; t++) {
      const ps = kutu.filter((x) => x.t === t).map((x) => x.p);
      for (let p = Math.min(...ps); p <= Math.max(...ps); p++) if (ekler.includes(pc(ACIK_TEL[t] + p))) kutu.push({ t, p });
    }
  }
  return kutu;
}
