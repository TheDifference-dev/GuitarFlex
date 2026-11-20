import type { Porte as PorteVeri, PorteNota } from "@/lib/alistirma/tipler";

// Gitar portesi: sol anahtarı (altında 8: gitar bir oktav pes duyulur), donanım, notalar, ek çizgiler ve ölçü çizgileri.
// Anahtar, nota başları ve arızalar SMuFL standardındaki Bravura yazı tipinden (RitimYazi ile aynı); çizgiler SVG.

const SP = 10; // dizek aralığı (px)
const FONT = SP * 4;
const BAS_GEN = 1.18 * SP;
const G = {
  anahtar8: "", // gClef8vb
  siyah: "",
  beyaz: "",
  birlik: "",
  diyez: "",
  bemol: "",
  naturel: "",
  olcu: (n: number) => String.fromCharCode(0xe080 + n),
};
const ARIZA: Record<number, string> = { [-1]: G.bemol, 0: G.naturel, 1: G.diyez };
// Donanım işaretlerinin dizekteki yeri (Mi4 alt çizgi = 0, her basamak yarım aralık)
const DIYEZ_YER = [8, 5, 9, 6, 3, 7, 4];
const BEMOL_YER = [4, 7, 3, 6, 2, 5, 1];

/** Yazılı notanın dizekteki basamağı: Mi4 (alt çizgi) = 0 */
const basamak = (n: PorteNota) => n.o * 7 + n.h - (4 * 7 + 2);

export default function Porte({ porte, kucuk }: { porte: PorteVeri; kucuk?: boolean }) {
  const olcuV = porte.olcu?.[0] ?? 4;
  const tek = porte.notalar.length === 1;
  const basamaklar = porte.notalar.map(basamak);
  const ust = Math.max(10, ...basamaklar.map((b) => b + (b < 4 ? 7 : 0)));
  const alt = Math.min(-5, ...basamaklar.map((b) => b - (b >= 4 ? 7 : 0)));
  const Y0 = 14 + ((ust - 0) * SP) / 2; // alt çizginin y'si
  const y = (b: number) => Y0 - (b * SP) / 2;
  const H = Y0 + ((0 - alt) * SP) / 2 + 14;

  const parcalar: React.ReactNode[] = [];
  let k = 0;
  const yazi = (x: number, yy: number, ch: string, boy = FONT) => (
    <text key={k++} x={x} y={yy} fontFamily="GFBravura" fontSize={boy} className="fill-current">
      {ch}
    </text>
  );
  const cizgi = (x1: number, y1: number, x2: number, y2: number, kalin = 1.2) => (
    <line key={k++} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth={kalin} />
  );

  // Anahtar ve donanım
  let x = 6;
  parcalar.push(yazi(x, y(2), G.anahtar8));
  x += 3.4 * SP;
  const d = porte.donanim;
  for (let i = 0; i < Math.abs(d); i++) {
    parcalar.push(yazi(x, y((d > 0 ? DIYEZ_YER : BEMOL_YER)[i]), d > 0 ? G.diyez : G.bemol));
    x += 1.1 * SP;
  }
  x += 0.8 * SP;
  // Ölçü işareti: birden çok notalı ezgilerde
  if (!tek) {
    parcalar.push(yazi(x, y(6), G.olcu(olcuV)), yazi(x, y(2), G.olcu(porte.olcu?.[1] ?? 4)));
    x += 2.6 * SP;
  }
  x += SP;

  let t = 0;
  porte.notalar.forEach((n, i) => {
    const b = basamaklar[i];
    const sure = n.d ?? 1;
    if (n.a !== undefined) {
      parcalar.push(yazi(x, y(b), ARIZA[n.a]));
      x += 1.3 * SP;
    }
    const hx = x;
    const genislik = sure >= 4 ? 1.69 * SP : BAS_GEN; // birlik notanın başı daha geniş
    // Ek çizgiler
    for (let e = -2; e >= b; e -= 2) parcalar.push(cizgi(hx - 0.45 * SP, y(e), hx + genislik + 0.45 * SP, y(e), 1.3));
    for (let e = 10; e <= b; e += 2) parcalar.push(cizgi(hx - 0.45 * SP, y(e), hx + genislik + 0.45 * SP, y(e), 1.3));
    parcalar.push(yazi(hx, y(b), sure >= 4 ? G.birlik : sure >= 2 ? G.beyaz : G.siyah));
    // Sap: orta çizginin (Si4) altındakiler yukarı, üstündekiler aşağı; ek çizgilerdekiler orta çizgiye kadar
    if (sure < 4) {
      if (b < 4) {
        const sx = hx + BAS_GEN - 0.6;
        parcalar.push(cizgi(sx, y(b) - 0.17 * SP, sx, Math.min(y(b) - 3.5 * SP, y(4))));
      } else {
        const sx = hx + 0.6;
        parcalar.push(cizgi(sx, y(b) + 0.17 * SP, sx, Math.max(y(b) + 3.5 * SP, y(4))));
      }
    }
    x += tek ? 4 * SP : 2.4 * SP + sure * 1.6 * SP;
    t += sure;
    // Ölçü çizgisi
    const son = i === porte.notalar.length - 1;
    if (!tek && Math.abs(t % olcuV) < 1e-9 && !son) {
      parcalar.push(cizgi(x - 0.8 * SP, y(8), x - 0.8 * SP, y(0)));
      x += 0.6 * SP;
    }
  });
  const W = x + (tek ? 0 : 0.6 * SP);
  // Bitiş çizgisi (ezgide çift çizgi)
  if (!tek) parcalar.push(cizgi(W - 4, y(8), W - 4, y(0), 1.2), cizgi(W - 0.5, y(8), W - 0.5, y(0), 3));

  return (
    <svg
      viewBox={`0 0 ${W + 2} ${H}`}
      className="text-[var(--text)]"
      style={{ width: "100%", maxWidth: (W + 2) * (kucuk ? 0.9 : 1.5), height: "auto" }}
      role="img"
      aria-label="Porte (sol anahtarı, gitar)"
    >
      {[0, 2, 4, 6, 8].map((b) => (
        <line key={`d${b}`} x1={2} x2={W} y1={y(b)} y2={y(b)} className="stroke-[var(--muted)]" strokeWidth={1} />
      ))}
      {parcalar}
    </svg>
  );
}
