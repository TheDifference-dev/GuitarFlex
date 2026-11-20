// CAGED sistemi: beş açık akor şekli (C, A, G, E, D) ve minör karşılıkları; her şekil 2 perde (tam ses)
// yukarı taşınınca yeni bir akor olur. Teller kalın Mi'den ince Mi'ye: "x" çalınmaz, 0 açık tel.
// Parmaklar: 1 işaret, 2 orta, 3 yüzük, 4 serçe; 0 = parmak yok (açık tel ya da çalınmayan tel).

export type CagedSekil = {
  ad: string; // akor sembolü
  okunus: string; // Türkçe adı
  perde: string; // "x32010"
  parmak: string; // "032010"
  barre?: { perde: number; ilk: number; son: number; parmak: number }; // tel indeksleri 0 = kalın Mi
};

export type CagedSatir = { sekil: "C" | "A" | "G" | "E" | "D"; acik: CagedSekil; tasinan: CagedSekil };

export const CAGED_MAJOR: CagedSatir[] = [
  {
    sekil: "C",
    acik: { ad: "C", okunus: "Do majör", perde: "x32010", parmak: "032010" },
    tasinan: { ad: "D", okunus: "Re majör", perde: "x54232", parmak: "043121" },
  },
  {
    sekil: "A",
    acik: { ad: "A", okunus: "La majör", perde: "x02220", parmak: "001230" },
    tasinan: { ad: "B", okunus: "Si majör", perde: "x24442", parmak: "012341", barre: { perde: 2, ilk: 1, son: 5, parmak: 1 } },
  },
  {
    sekil: "G",
    acik: { ad: "G", okunus: "Sol majör", perde: "320003", parmak: "320004" },
    tasinan: { ad: "A", okunus: "La majör", perde: "542225", parmak: "321114", barre: { perde: 2, ilk: 2, son: 4, parmak: 1 } },
  },
  {
    sekil: "E",
    acik: { ad: "E", okunus: "Mi majör", perde: "022100", parmak: "023100" },
    tasinan: { ad: "G", okunus: "Sol majör", perde: "355433", parmak: "134211", barre: { perde: 3, ilk: 0, son: 5, parmak: 1 } },
  },
  {
    sekil: "D",
    acik: { ad: "D", okunus: "Re majör", perde: "xx0232", parmak: "000132" },
    tasinan: { ad: "E", okunus: "Mi majör", perde: "xx2454", parmak: "001243" },
  },
];

export const CAGED_MINOR: CagedSatir[] = [
  {
    sekil: "C",
    acik: { ad: "Cm", okunus: "Do minör", perde: "x3101x", parmak: "041020" },
    tasinan: { ad: "Dm", okunus: "Re minör", perde: "x5323x", parmak: "042130" },
  },
  {
    sekil: "A",
    acik: { ad: "Am", okunus: "La minör", perde: "x02210", parmak: "002310" },
    tasinan: { ad: "Bm", okunus: "Si minör", perde: "x24432", parmak: "013421", barre: { perde: 2, ilk: 1, son: 5, parmak: 1 } },
  },
  {
    sekil: "G",
    acik: { ad: "Gm", okunus: "Sol minör", perde: "3x0333", parmak: "200333", barre: { perde: 3, ilk: 3, son: 5, parmak: 3 } },
    tasinan: { ad: "Am", okunus: "La minör", perde: "5x2555", parmak: "301444", barre: { perde: 5, ilk: 3, son: 5, parmak: 4 } },
  },
  {
    sekil: "E",
    acik: { ad: "Em", okunus: "Mi minör", perde: "022000", parmak: "023000" },
    tasinan: { ad: "Gm", okunus: "Sol minör", perde: "355333", parmak: "134111", barre: { perde: 3, ilk: 0, son: 5, parmak: 1 } },
  },
  {
    sekil: "D",
    acik: { ad: "Dm", okunus: "Re minör", perde: "xx0231", parmak: "000231" },
    tasinan: { ad: "Em", okunus: "Mi minör", perde: "xx2453", parmak: "001342" },
  },
];

const AC = [40, 45, 50, 55, 59, 64]; // açık tellerin MIDI numaraları, kalın Mi → ince Mi
const KOK: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

/** Kök notanın çalındığı tel indeksleri (0 = kalın Mi) */
export function kokTelleri(s: CagedSekil): number[] {
  const kok = KOK[s.ad[0]];
  return [...s.perde].flatMap((c, i) => (c !== "x" && (AC[i] + Number(c)) % 12 === kok ? [i] : []));
}

/** "5. ve 2. tel" biçiminde (tel numarası: 1 = ince Mi, 6 = kalın Mi) */
export function kokTelYazisi(s: CagedSekil): string {
  const n = kokTelleri(s).map((i) => `${6 - i}.`);
  return n.length > 1 ? `${n.slice(0, -1).join(", ")} ve ${n.at(-1)} tel` : `${n[0]} tel`;
}
