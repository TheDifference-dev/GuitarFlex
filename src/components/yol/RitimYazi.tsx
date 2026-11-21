import { HUCRE, type Desen, type Olay } from "@/lib/alistirma/ritim";

// Tek çizgili (vurmalı) dizek üzerinde ritim yazımı. Nota başları, susler ve bayraklar
// SMuFL standardındaki Bravura yazı tipinden; saplar ve kirişler çizgi olarak çizilir.

const SP = 8; // dizek aralığı (px)
const FONT = SP * 4;
const BAS_GEN = 1.18 * SP; // nota başı genişliği
const SAP = 3.4 * SP;
const KIRIS = 0.5 * SP;
const G = {
  siyah: "",
  beyaz: "",
  bayrak8: "",
  bayrak16: "",
  sus4: "",
  sus8: "",
  sus16: "",
  olcu: (n: number) => String.fromCharCode(0xe080 + n),
  uc: "",
};

type Nota = Olay & { x: number };

export default function RitimYazi({ desen, olcu = [4, 4], vurgu }: { desen: Desen; olcu?: [number, number]; vurgu?: boolean }) {
  const BW = 60;
  const BASLIK = 34;
  const OLCU_W = olcu[0] * BW + 16;
  const W = BASLIK + desen.length * OLCU_W + 6;
  const Y = 58;
  const H = 86;
  const parcalar: React.ReactNode[] = [];
  let k = 0;
  const yazi = (x: number, y: number, ch: string, boy = FONT) => (
    <text key={k++} x={x} y={y} fontFamily="GFBravura" fontSize={boy} className="fill-current">
      {ch}
    </text>
  );
  const cizgi = (x1: number, y1: number, x2: number, y2: number, kalin = 1.2) => (
    <line key={k++} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth={kalin} />
  );
  const kiris = (x1: number, x2: number, y: number) => <rect key={k++} x={x1} y={y} width={Math.max(2, x2 - x1)} height={KIRIS} fill="currentColor" />;
  const sapX = (n: Nota) => n.x + BAS_GEN - 0.6;
  const ust = Y - SAP;

  // Ölçü işareti
  parcalar.push(yazi(8, Y - SP, G.olcu(olcu[0])), yazi(8, Y + SP, G.olcu(olcu[1])));

  desen.forEach((hucreler, oi) => {
    const ox = BASLIK + oi * OLCU_W + 8;
    let b = 0;
    for (const ad of hucreler) {
      const h = HUCRE[ad];
      const bx = ox + b * BW;
      const olaylar: Nota[] = h.olaylar.map((o) => ({ ...o, x: bx + o.t * BW + 4 }));
      const notalar = olaylar.filter((o) => !o.sus);
      // Susler
      for (const o of olaylar.filter((o) => o.sus)) {
        const ch = o.d >= 1 ? G.sus4 : o.d >= 0.3 ? G.sus8 : G.sus16;
        parcalar.push(yazi(o.x, Y, ch));
      }
      // Nota başları, saplar, noktalar
      for (const n of notalar) {
        parcalar.push(yazi(n.x, Y, n.d >= 2 ? G.beyaz : G.siyah));
        parcalar.push(cizgi(sapX(n), Y - 0.17 * SP, sapX(n), ust));
        if (n.nokta) parcalar.push(<circle key={k++} cx={n.x + BAS_GEN + SP * 0.55} cy={Y - SP * 0.45} r={SP * 0.2} fill="currentColor" />);
      }
      // Kirişler: bir vuruş içindeki kısa notalar birbirine bağlanır (t-q ve senkop hariç)
      // Bayrak/kiriş alan notalar: düz bölümde dörtlükten kısa, üçlemede sekizlik üçleme (1/3)
      const kisa = notalar.filter((n) => (h.uclu ? n.d < 0.5 : n.d < 1));
      const kirisli = h.vurus === 1 && ad !== "t-q" && kisa.length >= 2;
      if (kirisli) {
        parcalar.push(kiris(sapX(kisa[0]), sapX(kisa.at(-1)!) + 1, ust));
        kisa.forEach((n, i) => {
          if (n.d !== 0.25) return;
          const sonraki = kisa[i + 1];
          const onceki = kisa[i - 1];
          if (sonraki?.d === 0.25 && Math.abs(sonraki.t - n.t - 0.25) < 1e-6) parcalar.push(kiris(sapX(n), sapX(sonraki) + 1, ust + KIRIS * 1.6));
          else if (!(onceki?.d === 0.25 && Math.abs(n.t - onceki.t - 0.25) < 1e-6)) {
            // Tek onaltılık: komşusuna doğru kısa kiriş
            const sola = i === kisa.length - 1;
            parcalar.push(sola ? kiris(sapX(n) - SP * 1.1, sapX(n) + 1, ust + KIRIS * 1.6) : kiris(sapX(n), sapX(n) + SP * 1.1, ust + KIRIS * 1.6));
          }
        });
      } else {
        for (const n of kisa) parcalar.push(yazi(sapX(n) - 0.6, ust, n.d <= 0.25 ? G.bayrak16 : G.bayrak8));
      }
      // Üçleme işareti
      if (h.uclu) {
        const x1 = bx + 4;
        const x2 = bx + BW - 10;
        parcalar.push(yazi((x1 + x2) / 2 - SP * 0.6, ust - SP * 0.9, G.uc, FONT * 0.9));
        if (!kirisli) {
          parcalar.push(cizgi(x1, ust - SP * 1.4, x1, ust - SP * 0.8, 1), cizgi(x1, ust - SP * 1.4, (x1 + x2) / 2 - SP, ust - SP * 1.4, 1));
          parcalar.push(cizgi((x1 + x2) / 2 + SP * 1.2, ust - SP * 1.4, x2, ust - SP * 1.4, 1), cizgi(x2, ust - SP * 1.4, x2, ust - SP * 0.8, 1));
        }
      }
      b += h.vurus;
    }
    // Vuruş noktaları (1 2 3 4) ve ölçü çizgisi
    for (let i = 0; i < olcu[0]; i++)
      parcalar.push(
        <text key={k++} x={ox + i * BW + 8} y={H - 2} textAnchor="middle" className="fill-[var(--muted)] text-[10px]">
          {i + 1}
        </text>,
      );
    parcalar.push(cizgi(ox + olcu[0] * BW + 2, Y - 2 * SP, ox + olcu[0] * BW + 2, Y + 2 * SP, oi === desen.length - 1 ? 2.4 : 1.2));
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={`w-full ${vurgu ? "text-[var(--accent)]" : "text-[var(--text)]"}`} style={{ maxWidth: W * 1.4 }} role="img" aria-label="Ritim yazımı">
      <line x1={4} x2={W - 4} y1={Y} y2={Y} className="stroke-[var(--muted)]" strokeWidth={1} />
      {parcalar}
    </svg>
  );
}
