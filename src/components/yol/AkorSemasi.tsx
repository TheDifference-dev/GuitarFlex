import type { Sema } from "@/lib/alistirma/tipler";

// Akor şeması (lead sheet / chord chart): her vuruş bir eğik çizgi (slash), akor adı başladığı vuruşun üstünde.
// Tekrar işaretleri, 1./2. son (volta), segno, coda, Fine ve D.S. yazıları. Semboller Bravura (SMuFL) yazı tipinden.

const SP = 8; // dizek aralığı
const FONT = SP * 4;
const OLCU_W = 168;
const SATIR_H = 118;
const UST = 44; // satırda dizeğin üst çizgisine kadar boşluk (akor adları, volta)
const G = {
  slash: "", // noteheadSlashHorizontalEnds
  tekrarBas: "",
  tekrarSon: "",
  segno: "",
  coda: "",
  olcu: (n: number) => String.fromCharCode(0xe080 + n),
};

/** `ilk`: ilk ölçünün numarası (verilmezse 1; Quick Study doğaçlama bölümü 7'den başlar) */
export default function AkorSemasi({ sema, ilk: ilkNo = 1 }: { sema: Sema; ilk?: number }) {
  const [vurus, birim] = sema.olcu;
  // Satırlar: 4 ölçü; Coda her zaman yeni satırda başlar
  const satirlar: number[][] = [];
  sema.olculer.forEach((o, i) => {
    const son = satirlar.at(-1);
    if (!son || son.length === 4 || o.coda) satirlar.push([i]);
    else son.push(i);
  });
  const BASLIK = 34;
  const W = BASLIK + 4 * OLCU_W + 8;
  const H = satirlar.length * SATIR_H + 6;
  const parca: React.ReactNode[] = [];
  let k = 0;
  const yazi = (x: number, y: number, ch: string, boy = FONT, sinif = "fill-current") => (
    <text key={k++} x={x} y={y} fontFamily="GFBravura" fontSize={boy} className={sinif}>
      {ch}
    </text>
  );
  const metin = (x: number, y: number, s: string, sinif: string, anchor: "start" | "middle" | "end" = "start") => (
    <text key={k++} x={x} y={y} textAnchor={anchor} className={sinif}>
      {s}
    </text>
  );
  const cizgi = (x1: number, y1: number, x2: number, y2: number, kalin = 1.2) => <line key={k++} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth={kalin} />;

  satirlar.forEach((satir, si) => {
    const ust = si * SATIR_H + UST;
    const alt = ust + 4 * SP;
    const orta = ust + 2 * SP;
    const x0 = BASLIK;
    const xSon = x0 + satir.length * OLCU_W;
    for (let l = 0; l < 5; l++) parca.push(<line key={k++} x1={4} x2={xSon} y1={ust + l * SP} y2={ust + l * SP} className="stroke-[var(--muted)]" strokeWidth={0.9} />);
    parca.push(cizgi(4, ust, 4, alt));
    if (si === 0) parca.push(yazi(12, orta - SP, G.olcu(vurus)), yazi(12, orta + SP, G.olcu(birim)));
    satir.forEach((oi, j) => {
      const o = sema.olculer[oi];
      const ox = x0 + j * OLCU_W;
      const bw = (OLCU_W - 28) / vurus;
      const bx = (v: number) => ox + 18 + v * bw;
      // Ölçü numarası
      parca.push(metin(ox + 4, ust - 4, String(oi + ilkNo), "fill-[var(--muted)] text-[10px] font-semibold"));
      // Tekrar başı / sonu ve ölçü çizgisi
      if (o.bas) parca.push(yazi(ox + 1, alt, G.tekrarBas));
      const sonOlcu = j === satir.length - 1;
      if (o.son) parca.push(yazi(ox + OLCU_W - 15, alt, G.tekrarSon));
      else if (sonOlcu && (oi === sema.olculer.length - 1 || sema.olculer[oi + 1]?.coda)) parca.push(cizgi(ox + OLCU_W - 5, ust, ox + OLCU_W - 5, alt, 1.2), cizgi(ox + OLCU_W - 1, ust, ox + OLCU_W - 1, alt, 3.2));
      else parca.push(cizgi(ox + OLCU_W, ust, ox + OLCU_W, alt));
      // Slash'lar ve akor adları
      let v = 0;
      // Segno ya da coda işareti varsa ilk akor adı işaretin sağına kayar
      const isaretli = o.segno || o.coda;
      for (const a of o.akorlar) {
        parca.push(metin(bx(v) - 2 + (v === 0 && isaretli ? 20 : 0), ust - 14, a.ad, "fill-[var(--text)] text-[15px] font-bold"));
        for (let i = 0; i < a.vurus; i++) parca.push(yazi(bx(v + i), orta, G.slash));
        v += a.vurus;
      }
      // Segno, coda (ölçünün başında, üstte)
      if (o.segno) parca.push(yazi(ox + 6, ust - 14, G.segno, FONT * 0.7, "fill-[var(--accent)]"));
      if (o.coda) {
        parca.push(yazi(ox + 6, ust - 14, G.coda, FONT * 0.7, "fill-[var(--accent)]"));
        parca.push(metin(ox - 2, ust - 14, "Coda", "fill-[var(--accent)] text-[11px] font-semibold", "end"));
      }
      // Volta: aynı numaralı ardışık ölçülerin üstünde köşeli çizgi
      if (o.volta) {
        const onceki = j > 0 ? sema.olculer[satir[j - 1]] : undefined;
        const sonraki = j < satir.length - 1 ? sema.olculer[satir[j + 1]] : undefined;
        const yv = ust - 34;
        const ilk = onceki?.volta !== o.volta;
        const bitis = sonraki?.volta !== o.volta;
        parca.push(cizgi(ox + (ilk ? 3 : 0), yv, ox + OLCU_W - (bitis ? 6 : 0), yv, 1.1));
        if (ilk) {
          parca.push(cizgi(ox + 3, yv, ox + 3, yv + 12, 1.1));
          parca.push(metin(ox + 7, yv + 11, `${o.volta}.`, "fill-[var(--text)] text-[11px] font-semibold"));
        }
        if (bitis && o.volta === 1) parca.push(cizgi(ox + OLCU_W - 6, yv, ox + OLCU_W - 6, yv + 12, 1.1));
      }
      // Fine ve yön yazıları (ölçünün altında, sağda)
      const alttaki = [o.fine ? "Fine" : "", o.yon ?? ""].filter(Boolean).join(" · ");
      if (alttaki) parca.push(metin(ox + OLCU_W - 6, alt + 18, alttaki, "fill-[var(--accent)] text-[12px] font-semibold italic", "end"));
    });
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full text-[var(--text)]" style={{ maxWidth: W * 1.15 }} role="img" aria-label="Akor şeması">
      {parca}
    </svg>
  );
}
