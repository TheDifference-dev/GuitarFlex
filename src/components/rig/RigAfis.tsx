"use client";

// Rig afişi: zincirin tamamı tek bir SVG'de (giriş → … → mikser → çıkış; paralel yol iki satır, FX loop amfinin altında).
// Hem "genel bakış" olarak sahnede gösterilir hem de PNG'ye aktarılır; bu yüzden renkler düz değerdir (CSS değişkeni
// yok) ve afiş her temada aynı koyu sahne görünümündedir.
import { forwardRef, useId, type ReactNode } from "react";
import EkipmanCizimi from "./Cizimler";
import { CIZIMLER, cizimEtiketi, duzListe, paralelMi, secenekDegeri, type Dugum, type Ekipman, type Rig } from "@/lib/rig-cekirdek";

const RENK = { zemin1: "#2a2a2e", zemin2: "#0c0c0e", yazi: "#f5f5f7", soluk: "#a1a1a6", kablo: "#6e6e73", vurgu: "#2997ff", kutu: "rgba(255,255,255,0.05)", kenar: "rgba(255,255,255,0.16)" };
const FONT = '-apple-system, BlinkMacSystemFont, "Inter Variable", "Segoe UI", Helvetica, Arial, sans-serif';

const W = 128; // ana hücre
const KW = 96; // döngü hücresi
const SATIR = 156; // ana satır yüksekliği
const DONGU_Y = 150; // döngü kutusunun satır üstünden uzaklığı
const DONGU_H = 128;
const UST = 92; // başlık alanı
const KABLO = 58; // satır üstünden kablo yüksekliği

const kisalt = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

type Bul = (id: string) => Ekipman | null;

function Hucre({ d, e, x, y, kucuk = false }: { d: Dugum; e: Ekipman | null; x: number; y: number; kucuk?: boolean }) {
  const w = kucuk ? KW : W;
  const kutuW = kucuk ? 72 : 100;
  const kutuH = kucuk ? 70 : 96;
  const cizim = e?.cizim ?? "boost";
  const degerler = CIZIMLER[cizim].dugmeler.map((a) => d.ayar[a] ?? 5);
  const secimler = (CIZIMLER[cizim].secenekler ?? []).map((s) => secenekDegeri(d, s));
  return (
    <g opacity={d.kapali ? 0.45 : 1}>
      <EkipmanCizimi cizim={cizim} renk={e?.renk ?? "#555555"} etiket={cizimEtiketi(e)} degerler={degerler} secimler={secimler} acik={!d.kapali} x={x + (w - kutuW) / 2} y={y + 6} width={kutuW} height={kutuH} preserveAspectRatio="xMidYMax meet" />
      <text x={x + w / 2} y={y + kutuH + 24} textAnchor="middle" fontSize={kucuk ? 10.5 : 12} fontWeight={600} fill={RENK.yazi} fontFamily={FONT}>
        {kisalt(e?.ad ?? "Silinmiş ekipman", kucuk ? 15 : 19)}
      </text>
      {d.kapali && (
        <text x={x + w / 2} y={y + kutuH + 38} textAnchor="middle" fontSize={10} fill={RENK.soluk} fontFamily={FONT}>
          kapalı
        </text>
      )}
    </g>
  );
}

/** Bir düğüm (varsa döngüsüyle) için genişlik */
const dugumGenisligi = (d: Dugum) => (d.dongu ? Math.max(W, d.dongu.length * KW + 32) : W);
const satirYuksekligi = (l: Dugum[]) => SATIR + (l.some((d) => d.dongu) ? DONGU_H + 10 : 0);

/** Bir düğüm listesini (x, y) satırına çizer; dönüş: çizimler ve bitiş x'i */
function satirCiz(l: Dugum[], x0: number, y: number, bul: Bul, anahtar: string): { ogeler: ReactNode[]; x: number } {
  const ogeler: ReactNode[] = [];
  let x = x0;
  l.forEach((d) => {
    const gw = dugumGenisligi(d);
    const hx = x + (gw - W) / 2;
    ogeler.push(<Hucre key={`${anahtar}${d.id}`} d={d} e={bul(d.ekipmanId)} x={hx} y={y} />);
    if (d.dongu) {
      const kx = x + 6;
      const ky = y + DONGU_Y;
      const kw = gw - 12;
      ogeler.push(
        <g key={`${anahtar}${d.id}dongu`}>
          <path d={`M${hx + W / 2 - 14} ${y + 134} V${ky}`} stroke={RENK.kablo} strokeWidth={2} strokeDasharray="4 3" />
          <path d={`M${hx + W / 2 + 14} ${ky} V${y + 134}`} stroke={RENK.kablo} strokeWidth={2} strokeDasharray="4 3" />
          <rect x={kx} y={ky} width={kw} height={DONGU_H - 8} rx={14} fill={RENK.kutu} stroke={RENK.kenar} strokeDasharray="5 4" />
          <text x={kx + 12} y={ky + 15} fontSize={9.5} fontWeight={700} letterSpacing={0.6} fill={RENK.soluk} fontFamily={FONT}>
            FX LOOP · GÖNDER → DÖNÜŞ
          </text>
          <line x1={kx + 10} x2={kx + kw - 10} y1={ky + 54} y2={ky + 54} stroke={RENK.kablo} strokeWidth={2} />
          {d.dongu.length === 0 && (
            <text x={kx + kw / 2} y={ky + 64} textAnchor="middle" fontSize={11} fill={RENK.soluk} fontFamily={FONT}>
              boş
            </text>
          )}
          {d.dongu.map((x2, j) => (
            <Hucre key={x2.id} d={x2} e={bul(x2.ekipmanId)} x={kx + (kw - d.dongu!.length * KW) / 2 + j * KW} y={ky + 14} kucuk />
          ))}
        </g>,
      );
    }
    x += gw;
  });
  // Satırın kablosu: bütün hücrelerin arkasından tek çizgi
  if (l.length > 1) ogeler.unshift(<line key={`${anahtar}kablo`} x1={x0 + W / 2} x2={x - W / 2} y1={y + KABLO} y2={y + KABLO} stroke={RENK.kablo} strokeWidth={2} />);
  return { ogeler, x };
}

function Uc({ x, y, ad }: { x: number; y: number; ad: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={15} fill="#2c2c2e" stroke={RENK.kenar} />
      <circle cx={x} cy={y} r={5} fill={RENK.vurgu} />
      <text x={x} y={y + 34} textAnchor="middle" fontSize={11} fontWeight={600} fill={RENK.soluk} fontFamily={FONT}>
        {ad}
      </text>
    </g>
  );
}

function Mikser({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x - 26} y={y - 24} width={52} height={48} rx={8} fill="#2c2c2e" stroke={RENK.kenar} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <line x1={x - 13 + i * 13} x2={x - 13 + i * 13} y1={y - 14} y2={y + 14} stroke="#0c0c0e" strokeWidth={3} strokeLinecap="round" />
          <rect x={x - 18 + i * 13} y={y - 4 + [6, -8, 2][i]} width={10} height={6} rx={1.5} fill="#d4d6da" />
        </g>
      ))}
      <text x={x} y={y + 43} textAnchor="middle" fontSize={11} fontWeight={600} fill={RENK.soluk} fontFamily={FONT}>
        Mikser
      </text>
    </g>
  );
}

type Ozellik = { rig: Rig; bul: Bul; className?: string; baslikli?: boolean };

/** Afişin SVG'si (genişlik ve yükseklik içeriğe göre) */
const RigAfis = forwardRef<SVGSVGElement, Ozellik>(function RigAfis({ rig, bul, className, baslikli = true }, ref) {
  const zid = `afis${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const ust = baslikli ? UST : 24;
  const ogeler: ReactNode[] = [];
  let x = 40;
  const y = ust;
  const ky = y + KABLO;
  let yukseklik = satirYuksekligi(rig.zincir.filter((o): o is Dugum => !paralelMi(o)));
  ogeler.push(<Uc key="giris" x={x + 15} y={ky} ad="Giriş" />);
  x += 30;
  rig.zincir.forEach((o, i) => {
    if (paralelMi(o)) {
      const ha = satirYuksekligi(o.a);
      const hb = satirYuksekligi(o.b);
      yukseklik = Math.max(yukseklik, ha + hb);
      const yB = y + ha;
      const genA = o.a.reduce((t, d) => t + dugumGenisligi(d), 0);
      const genB = o.b.reduce((t, d) => t + dugumGenisligi(d), 0);
      const gen = Math.max(genA, genB, W);
      const sx = x + 14;
      const bx = sx + 34 + gen + 20;
      ogeler.push(
        <g key={o.id}>
          <line x1={x} x2={sx} y1={ky} y2={ky} stroke={RENK.kablo} strokeWidth={2} />
          <path d={`M${sx} ${ky} H${sx + 30} M${sx + 10} ${ky} V${yB + KABLO} H${sx + 30}`} fill="none" stroke={RENK.kablo} strokeWidth={2} strokeLinejoin="round" />
          <text x={sx + 18} y={ky - 8} fontSize={10} fontWeight={700} fill={RENK.vurgu} fontFamily={FONT}>
            A
          </text>
          <text x={sx + 18} y={yB + KABLO - 8} fontSize={10} fontWeight={700} fill={RENK.vurgu} fontFamily={FONT}>
            B
          </text>
          <path d={`M${bx - 30} ${ky} H${bx + 14} M${bx - 30} ${yB + KABLO} H${bx - 10} V${ky}`} fill="none" stroke={RENK.kablo} strokeWidth={2} strokeLinejoin="round" />
          <rect x={x + 4} y={y - 10} width={bx - x + 6} height={ha + hb - 8} rx={18} fill="none" stroke={RENK.kenar} strokeDasharray="2 5" />
        </g>,
      );
      const a = satirCiz(o.a, sx + 34 + (gen - genA) / 2, y, bul, "a");
      const b = satirCiz(o.b, sx + 34 + (gen - genB) / 2, yB, bul, "b");
      if (!o.a.length) ogeler.push(<line key="ab" x1={sx + 30} x2={bx - 30} y1={ky} y2={ky} stroke={RENK.kablo} strokeWidth={2} />);
      if (!o.b.length) ogeler.push(<line key="bb" x1={sx + 30} x2={bx - 30} y1={yB + KABLO} y2={yB + KABLO} stroke={RENK.kablo} strokeWidth={2} />);
      else {
        ogeler.push(<line key="bg" x1={sx + 30} x2={sx + 34 + (gen - genB) / 2 + 14} y1={yB + KABLO} y2={yB + KABLO} stroke={RENK.kablo} strokeWidth={2} />);
        ogeler.push(<line key="bc" x1={b.x - 14} x2={bx - 30} y1={yB + KABLO} y2={yB + KABLO} stroke={RENK.kablo} strokeWidth={2} />);
      }
      if (o.a.length) {
        ogeler.push(<line key="ag" x1={sx + 30} x2={sx + 34 + (gen - genA) / 2 + 14} y1={ky} y2={ky} stroke={RENK.kablo} strokeWidth={2} />);
        ogeler.push(<line key="ac" x1={a.x - 14} x2={bx - 30} y1={ky} y2={ky} stroke={RENK.kablo} strokeWidth={2} />);
      }
      ogeler.push(...a.ogeler, ...b.ogeler);
      x = bx + 14;
    } else {
      const s = satirCiz([o], x, y, bul, `m${i}`);
      ogeler.push(...s.ogeler);
      x = s.x - 14;
    }
  });
  x += 40;
  // Ana kablo: girişten miksere, bütün hücrelerin arkasından (paralel blokta A yolu bu hizada sürer)
  ogeler.unshift(<line key="ana-kablo" x1={55} x2={x} y1={ky} y2={ky} stroke={RENK.kablo} strokeWidth={2} />);
  ogeler.push(<Mikser key="mikser" x={x + 26} y={ky} />);
  ogeler.push(<line key="cik" x1={x + 52} x2={x + 86} y1={ky} y2={ky} stroke={RENK.kablo} strokeWidth={2} />);
  ogeler.push(<Uc key="cikis" x={x + 101} y={ky} ad="Çıkış" />);
  const genislik = Math.max(x + 146, baslikli ? 520 : 0);
  const boy = ust + yukseklik + (baslikli ? 30 : 4);
  const sayi = duzListe(rig).length;
  return (
    <svg ref={ref} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${genislik} ${boy}`} width={genislik} height={boy} className={className} role="img" aria-label={`${rig.ad}: ${sayi} ekipmanlı sinyal zinciri`}>
      <defs>
        <radialGradient id={zid} cx="0.5" cy="0" r="1.1">
          <stop offset="0" stopColor={RENK.zemin1} />
          <stop offset="1" stopColor={RENK.zemin2} />
        </radialGradient>
      </defs>
      <rect width={genislik} height={boy} rx={baslikli ? 0 : 18} fill={`url(#${zid})`} />
      {baslikli && (
        <g>
          <text x={40} y={46} fontSize={26} fontWeight={700} fill={RENK.yazi} fontFamily={FONT} letterSpacing={-0.3}>
            {rig.ad}
          </text>
          <text x={40} y={68} fontSize={12.5} fill={RENK.soluk} fontFamily={FONT}>
            {`GuitarFlex · Rig'im · ${sayi} ekipman`}
          </text>
        </g>
      )}
      {ogeler}
    </svg>
  );
});
export default RigAfis;

/** Afişi 2x çözünürlükte PNG olarak indirir */
export async function pngIndir(svg: SVGSVGElement, dosyaAdi: string) {
  const metin = new XMLSerializer().serializeToString(svg);
  const url = URL.createObjectURL(new Blob([metin], { type: "image/svg+xml;charset=utf-8" }));
  try {
    const img = new Image();
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej(new Error("Görsel hazırlanamadı"));
      img.src = url;
    });
    const olcek = 2;
    const w = svg.viewBox.baseVal.width;
    const h = svg.viewBox.baseVal.height;
    const tuval = document.createElement("canvas");
    tuval.width = Math.round(w * olcek);
    tuval.height = Math.round(h * olcek);
    const c = tuval.getContext("2d")!;
    c.drawImage(img, 0, 0, tuval.width, tuval.height);
    const blob = await new Promise<Blob>((res, rej) => tuval.toBlob((b) => (b ? res(b) : rej(new Error("PNG oluşturulamadı"))), "image/png"));
    indir(blob, dosyaAdi);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function indir(blob: Blob, dosyaAdi: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = dosyaAdi;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
