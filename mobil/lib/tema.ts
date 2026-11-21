// Açık tema (Fender Play ferahlığı + masaüstünün apple.com renkleri): beyaz / açık gri zemin, uzay grisi yazı,
// siyah başlık; her kursun kendi canlı rengi. Masaüstü değerleri: src/app/globals.css :root.
export const R = {
  zemin: "#FFFFFF",
  panel: "#F5F5F7",
  panel2: "#E8E8ED",
  cizgi: "#D2D2D7",
  yazi: "#1D1D1F",
  soluk: "#6E6E73",
  uzay: "#2C2C2E",
  siyah: "#000000",
  mavi: "#0071E3",
  lacivert: "#0A2A6B",
  ok: "#1E7A37",
  sari: "#F2A900",
  yesil: "#34C759",
  kirmizi: "#C4001A",
  bos: "#E5E5EA",
};

/** Her kurs / yolun kendi rengi: tam renk yelpazesi, beyaz glifle okunur koyulukta */
const RENK: Record<string, string> = {
  "sifirdan-baslangic-rehberi": "#7048E8",
  "baslangic-orta-rehberi": "#F76707",
  "akor-yolu": "#C2255C",
  "alternatif-pena": "#E5322D",
  "economy-pena": "#F07B00",
  "hybrid-picking": "#C99200",
  sweep: "#2EA44F",
  arpej: "#00A39A",
  "hammer-on-pull-off": "#0A9CC7",
  legato: "#0071E3",
  tapping: "#4F46E5",
  slide: "#8E44D9",
  "bend-vibrato": "#E0245E",
  "palm-mute": "#8D6E4F",
  "ritim-tarama": "#D9480F",
  "gf-ekler": "#0A2A6B",
  "gf-stiller": "#B5179E",
  armoni: "#2B8A3E",
  "akustik-baslangic-rehberi": "#7C5C3B",
  "akustik-alternatif-pena": "#B7472A",
  "akustik-arpej": "#1F8A70",
  "akustik-bend-vibrato": "#A61E4D",
  "akustik-hopo": "#1C7ED6",
  "akustik-slide": "#9C36B5",
  // Teori yolları
  "yol:ritim": "#F07B00",
  "yol:klavye": "#0A9CC7",
  "yol:kulak": "#8E44D9",
  "yol:okuma": "#0071E3",
  "yol:armoni": "#2B8A3E",
  sarkilar: "#E0245E",
};
export const renk = (anahtar: string) => RENK[anahtar] ?? R.mavi;

/** Rengi karartır / açar (0–1): düğümün alt gölgesi, açık zemin tonu */
export function ton(hex: string, oran: number): string {
  const n = parseInt(hex.slice(1), 16);
  const k = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) =>
    Math.round(oran < 0 ? c * (1 + oran) : c + (255 - c) * oran),
  );
  return `#${k.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

export const YAZI = {
  baslik: { fontSize: 28, fontWeight: "700" as const, letterSpacing: -0.5, color: R.yazi },
  alt: { fontSize: 15, color: R.soluk },
};
