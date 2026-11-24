// Rig'im ekipman çizimleri: bütün görseller burada, özgün olarak SVG ile çizilir (hiçbir ürünün görseli, renderı ya da
// logosu kullanılmaz; gerçek ürünlerin tasarımını taklit etmez). Ortak dil: yukarıdan-soldan yumuşak ışık, gövdede
// üstten alta koyulaşan geçiş, ince parlak üst kenar, altta yumuşak gölge. Ana renk kullanıcının seçtiği renktir.
// Düğme göstergeleri ve LED, düğümün ayarlarını yansıtır (yalnız görsel). Renkler düz değerdir (CSS değişkeni yok):
// çizim PNG'ye aktarılırken de aynı görünür.
import { useId, type ReactNode } from "react";
import { CIZIMLER, type Cizim } from "@/lib/rig-cekirdek";

// ── Renk yardımcıları ──
function rgb(hex: string): [number, number, number] {
  const h = /^#?([0-9a-f]{6})$/i.exec(hex)?.[1] ?? "3a3c42";
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
const hex = (c: number[]) => `#${c.map((x) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, "0")).join("")}`;
export const karistir = (a: string, b: string, t: number) => {
  const x = rgb(a);
  const y = rgb(b);
  return hex(x.map((v, i) => v + (y[i] - v) * t));
};
export const acik = (r: string, t: number) => karistir(r, "#ffffff", t);
export const koyu = (r: string, t: number) => karistir(r, "#000000", t);
/** Göreli parlaklık (0–1) */
export const parlaklik = (r: string) => {
  const [a, b, c] = rgb(r).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * a + 0.7152 * b + 0.0722 * c;
};
/** Zemin rengi üstünde okunur çizgi rengi */
const ustRenk = (r: string) => (parlaklik(r) > 0.42 ? "#1d1d1f" : "#f5f5f7");

/** Çizimin doğal boyutu (viewBox) */
export const BOYUT: Record<Cizim, [number, number]> = {
  "gitar-tek-kesik": [120, 320],
  "gitar-cift-kesik": [120, 320],
  "gitar-akustik": [130, 320],
  tuner: [100, 150],
  wah: [100, 170],
  kompresor: [100, 150],
  "gurultu-kapisi": [100, 150],
  boost: [100, 150],
  overdrive: [100, 150],
  distortion: [100, 150],
  fuzz: [100, 150],
  eq: [100, 150],
  chorus: [100, 150],
  phaser: [100, 150],
  flanger: [100, 150],
  delay: [100, 150],
  reverb: [100, 150],
  looper: [130, 150],
  "amfi-kafa": [220, 118],
  "amfi-kombo": [220, 196],
  "amfi-kombo-kucuk": [170, 160],
  "kabin-4x12": [210, 212],
  "kabin-2x12": [224, 136],
  "kabin-1x12": [160, 172],
  mikrofon: [70, 170],
  "rack-kompresor": [260, 62],
  "rack-eq": [260, 62],
  "rack-delay": [260, 62],
  "rack-reverb": [260, 62],
  di: [90, 112],
  "ses-karti": [170, 92],
  yazilim: [190, 136],
};

type P = { u: string; r: string; v: number[]; on: boolean };

// ── Ortak parçalar ──
const aci = (v: number) => -135 + (Math.max(0, Math.min(10, v)) / 10) * 270;

function OrtakDefs({ u, r }: { u: string; r: string }) {
  return (
    <defs>
      <linearGradient id={`${u}g`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={acik(r, 0.22)} />
        <stop offset="0.55" stopColor={r} />
        <stop offset="1" stopColor={koyu(r, 0.32)} />
      </linearGradient>
      <linearGradient id={`${u}y`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={koyu(r, 0.25)} />
        <stop offset="0.18" stopColor={acik(r, 0.08)} />
        <stop offset="0.82" stopColor={r} />
        <stop offset="1" stopColor={koyu(r, 0.3)} />
      </linearGradient>
      <linearGradient id={`${u}k`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f4f5f7" />
        <stop offset="0.45" stopColor="#a9adb5" />
        <stop offset="0.55" stopColor="#d9dce1" />
        <stop offset="1" stopColor="#7d828b" />
      </linearGradient>
      <radialGradient id={`${u}d`} cx="0.38" cy="0.32" r="0.75">
        <stop offset="0" stopColor="#5a5d63" />
        <stop offset="0.6" stopColor="#25272b" />
        <stop offset="1" stopColor="#111214" />
      </radialGradient>
      <radialGradient id={`${u}dk`} cx="0.38" cy="0.32" r="0.8">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="0.5" stopColor="#d4d6da" />
        <stop offset="1" stopColor="#8a8e95" />
      </radialGradient>
      <radialGradient id={`${u}s`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#000" stopOpacity="0.38" />
        <stop offset="1" stopColor="#000" stopOpacity="0" />
      </radialGradient>
      <pattern id={`${u}w`} width="4" height="4" patternUnits="userSpaceOnUse">
        <rect width="4" height="4" fill="#1b1a19" />
        <path d="M0 4L4 0M-1 1L1 -1M3 5L5 3" stroke="#34312d" strokeWidth="0.9" />
      </pattern>
      <pattern id={`${u}m`} width="5" height="5" patternUnits="userSpaceOnUse">
        <rect width="5" height="5" fill="#2a2c30" />
        <circle cx="2.5" cy="2.5" r="1.25" fill="#0e0f11" />
      </pattern>
    </defs>
  );
}

/** Döner düğme: etek, kapak, gösterge çizgisi */
function Dugme({ u, x, y, r, v, acikKapak = false }: { u: string; x: number; y: number; r: number; v: number; acikKapak?: boolean }) {
  const a = aci(v);
  return (
    <g>
      <circle cx={x} cy={y + r * 0.18} r={r * 1.08} fill="#000" opacity={0.28} />
      <circle cx={x} cy={y} r={r} fill={acikKapak ? "#9a9ea6" : "#15161a"} />
      <circle cx={x} cy={y} r={r * 0.82} fill={`url(#${u}${acikKapak ? "dk" : "d"})`} />
      <line x1={x} y1={y} x2={x} y2={y - r * 0.78} stroke={acikKapak ? "#1d1d1f" : "#f2f2f2"} strokeWidth={Math.max(1, r * 0.16)} strokeLinecap="round" transform={`rotate(${a} ${x} ${y})`} />
    </g>
  );
}

function AyakAnahtari({ u, x, y, r = 8 }: { u: string; x: number; y: number; r?: number }) {
  const alti = Array.from({ length: 6 }, (_, i) => {
    const t = (Math.PI / 3) * i + Math.PI / 6;
    return `${x + Math.cos(t) * r * 1.25},${y + Math.sin(t) * r * 1.25}`;
  }).join(" ");
  return (
    <g>
      <circle cx={x} cy={y + 2} r={r * 1.35} fill="#000" opacity={0.25} />
      <polygon points={alti} fill={`url(#${u}k)`} stroke="#5d6169" strokeWidth={0.6} />
      <circle cx={x} cy={y} r={r * 0.85} fill={`url(#${u}dk)`} stroke="#6b6f77" strokeWidth={0.6} />
      <ellipse cx={x - r * 0.25} cy={y - r * 0.3} rx={r * 0.35} ry={r * 0.2} fill="#fff" opacity={0.7} />
    </g>
  );
}

function Led({ x, y, on, renk = "#ff3b30", r = 2.6 }: { x: number; y: number; on: boolean; renk?: string; r?: number }) {
  return (
    <g>
      {on && <circle cx={x} cy={y} r={r * 2.6} fill={renk} opacity={0.28} />}
      <circle cx={x} cy={y} r={r} fill={on ? renk : koyu(renk, 0.65)} stroke="#000" strokeOpacity={0.4} strokeWidth={0.5} />
      <circle cx={x - r * 0.3} cy={y - r * 0.35} r={r * 0.35} fill="#fff" opacity={on ? 0.85 : 0.25} />
    </g>
  );
}

function Vida({ x, y, r = 2 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#c6c9ce" stroke="#6d7178" strokeWidth={0.5} />
      <path d={`M${x - r * 0.6} ${y}H${x + r * 0.6}`} stroke="#555a61" strokeWidth={0.6} />
    </g>
  );
}

function Jak({ x, y, w = 5, h = 9 }: { x: number; y: number; w?: number; h?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={1.2} fill="#9da1a8" stroke="#5a5e65" strokeWidth={0.5} />
      <rect x={x + w * 0.25} y={y + h * 0.3} width={w * 0.5} height={h * 0.4} rx={0.6} fill="#2b2d31" />
    </g>
  );
}

/** Gövdenin üst kenarındaki ince parlaklık */
const Parilti = ({ d }: { d: string }) => <path d={d} fill="none" stroke="#fff" strokeOpacity={0.28} strokeWidth={1} />;

// ── Pedallar ──

/** Pedal yüzeyindeki özgün simge (her türün kendi küçük çizgisi) */
function Piktogram({ tur, x, y, renk }: { tur: Cizim; x: number; y: number; renk: string }) {
  const s = { fill: "none", stroke: renk, strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const t = `translate(${x - 16} ${y - 10})`;
  let ic: ReactNode = null;
  switch (tur) {
    case "overdrive":
      ic = <path {...s} d="M0 10 C4 10 4 2 8 2 L12 2 C15 2 15 18 19 18 L23 18 C27 18 27 10 32 10" />;
      break;
    case "distortion":
      ic = <path {...s} d="M0 10 L3 2 H12 L14 18 H22 L24 2 H29 L32 10" />;
      break;
    case "fuzz":
      ic = (
        <g>
          <path {...s} d="M0 16 V4 H8 V16 H16 V4 H24 V16 H32" />
          {[4, 12, 20, 28].map((px) => (
            <circle key={px} cx={px} cy={px % 8 ? 0 : 20} r={1.2} fill={renk} />
          ))}
        </g>
      );
      break;
    case "kompresor":
      ic = <path {...s} d="M0 10 H7 M3 6 L7 10 L3 14 M32 10 H25 M29 6 L25 10 L29 14 M12 4 V16 M20 4 V16 M12 10 H20" />;
      break;
    case "gurultu-kapisi":
      ic = <path {...s} d="M0 10 C2 2 4 18 6 10 C8 2 10 18 12 10 L14 10 M16 2 V18 M20 10 H32" />;
      break;
    case "chorus":
      ic = (
        <g>
          <path {...s} d="M0 8 C5 0 10 0 16 8 S27 16 32 8" />
          <path {...s} strokeOpacity={0.55} d="M0 13 C5 5 10 5 16 13 S27 21 32 13" />
        </g>
      );
      break;
    case "phaser":
      ic = <path {...s} d="M16 10 m-2 0 a2 2 0 1 1 4 0 a5 5 0 1 1 -10 0 a8 8 0 1 1 16 0 a11 11 0 0 1 -9 10.8" />;
      break;
    case "flanger":
      ic = <path {...s} d="M0 18 C8 18 10 2 16 2 S24 18 32 18 M4 14 V18 M10 7 V18 M16 4 V18 M22 7 V18 M28 14 V18" />;
      break;
    case "delay":
      ic = (
        <g>
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={i * 7} y={2 + i * 3} width={4} height={16 - i * 3} rx={1.5} fill={renk} opacity={1 - i * 0.18} />
          ))}
        </g>
      );
      break;
    case "reverb":
      ic = (
        <g>
          <circle cx={4} cy={10} r={2.2} fill={renk} />
          {[8, 14, 20, 26].map((rr, i) => (
            <path key={rr} {...s} strokeOpacity={1 - i * 0.2} d={`M${4 + rr * 0.6} ${10 - rr * 0.75} A${rr} ${rr} 0 0 1 ${4 + rr * 0.6} ${10 + rr * 0.75}`} />
          ))}
        </g>
      );
      break;
    case "boost":
      ic = <path {...s} d="M16 18 V3 M9 9 L16 2 L23 9 M6 20 H26" />;
      break;
    case "looper":
      ic = <path {...s} d="M26 6 A10 10 0 1 0 28 13 M26 6 V0 M26 6 H20" />;
      break;
  }
  return <g transform={t}>{ic}</g>;
}

const PEDAL_LED: Partial<Record<Cizim, string>> = { delay: "#34c3ff", reverb: "#7aa7ff", chorus: "#35e0d0", looper: "#ff3b30", tuner: "#30d158", kompresor: "#ffd60a" };

function KutuPedal({ u, r, v, on, tur }: P & { tur: Cizim }) {
  const yazi = ustRenk(r);
  const n = CIZIMLER[tur].dugmeler.length;
  const mini = tur === "boost" || tur === "phaser";
  const kemer = tur === "fuzz";
  const [x0, w] = mini ? [22, 56] : [10, 80];
  const govde = kemer
    ? `M${x0} 40 Q${x0} 8 50 8 Q${x0 + w} 8 ${x0 + w} 40 V134 Q${x0 + w} 142 ${x0 + w - 8} 142 H${x0 + 8} Q${x0} 142 ${x0} 134 Z`
    : `M${x0 + 8} 8 H${x0 + w - 8} Q${x0 + w} 8 ${x0 + w} 16 V134 Q${x0 + w} 142 ${x0 + w - 8} 142 H${x0 + 8} Q${x0} 142 ${x0} 134 V16 Q${x0} 8 ${x0 + 8} 8 Z`;
  const dugmeY = kemer ? 40 : 32;
  const xs = n === 1 ? [50] : n === 2 ? [35, 65] : mini ? [36, 50, 64] : [28, 50, 72];
  return (
    <g>
      <Jak x={x0 - 4} y={50} />
      <Jak x={x0 + w - 1} y={50} />
      <path d={govde} fill={`url(#${u}g)`} stroke={koyu(r, 0.5)} strokeWidth={0.8} />
      <path d={govde} fill={`url(#${u}y)`} opacity={0.35} />
      <Parilti d={kemer ? `M${x0 + 3} 38 Q${x0 + 3} 11 50 11 Q${x0 + w - 3} 11 ${x0 + w - 3} 38` : `M${x0 + 9} 10.5 H${x0 + w - 9}`} />
      {/* ayak basma bölgesi: hafif gömük alan */}
      <rect x={x0 + 6} y={96} width={w - 12} height={40} rx={6} fill={koyu(r, 0.18)} opacity={0.55} />
      {xs.map((x, i) => (
        <Dugme key={i} u={u} x={x} y={dugmeY} r={n === 1 ? 10 : mini ? 6.5 : 8} v={v[i] ?? 5} acikKapak={parlaklik(r) < 0.05} />
      ))}
      <Led x={50} y={kemer ? 18 : dugmeY + (n === 1 ? 19 : 16)} on={on} renk={PEDAL_LED[tur] ?? "#ff3b30"} />
      <Piktogram tur={tur} x={50} y={kemer ? 72 : 76} renk={yazi} />
      <AyakAnahtari u={u} x={50} y={118} />
      {[x0 + 5, x0 + w - 5].map((x) => [14, 136].map((y) => !kemer || y > 20 ? <Vida key={`${x}${y}`} x={x} y={y} r={1.4} /> : null))}
    </g>
  );
}

function Tuner({ u, r, on }: P) {
  return (
    <g>
      <Jak x={6} y={50} />
      <Jak x={89} y={50} />
      <rect x={10} y={8} width={80} height={134} rx={9} fill={`url(#${u}g)`} stroke={koyu(r, 0.5)} strokeWidth={0.8} />
      <Parilti d="M19 10.5 H81" />
      <rect x={18} y={18} width={64} height={52} rx={5} fill="#06090b" stroke="#000" />
      <rect x={20} y={20} width={60} height={48} rx={4} fill="#0b1a14" />
      {Array.from({ length: 11 }, (_, i) => (
        <rect key={i} x={24 + i * 5} y={28} width={3} height={i === 5 ? 14 : 8 + Math.abs(5 - i) * 0.4} rx={1} fill={i === 5 ? (on ? "#30d158" : "#1f4a31") : on ? (i < 5 ? "#ff9f0a" : "#ff453a") : "#2a3a32"} opacity={i === 5 ? 1 : 0.55} />
      ))}
      <text x={50} y={62} textAnchor="middle" fontSize={15} fontWeight={700} fill={on ? "#30d158" : "#1f4a31"} fontFamily="ui-monospace, Menlo, monospace">
        A
      </text>
      <rect x={16} y={96} width={68} height={40} rx={6} fill={koyu(r, 0.18)} opacity={0.55} />
      <Led x={50} y={82} on={on} renk="#30d158" />
      <AyakAnahtari u={u} x={50} y={118} />
    </g>
  );
}

function EqPedal({ u, r, v, on }: P) {
  const yazi = ustRenk(r);
  return (
    <g>
      <Jak x={6} y={50} />
      <Jak x={89} y={50} />
      <rect x={10} y={8} width={80} height={134} rx={9} fill={`url(#${u}g)`} stroke={koyu(r, 0.5)} strokeWidth={0.8} />
      <Parilti d="M19 10.5 H81" />
      <path d="M18 51 H82" stroke={yazi} strokeOpacity={0.35} strokeWidth={0.6} strokeDasharray="1.5 2" />
      {[0, 1, 2, 3, 4].map((i) => {
        const x = 22 + i * 14;
        const y = 78 - ((v[i] ?? 5) / 10) * 54;
        return (
          <g key={i}>
            <rect x={x - 1.6} y={22} width={3.2} height={58} rx={1.6} fill="#0d0e10" />
            <rect x={x - 6} y={y - 3.5} width={12} height={7} rx={1.5} fill={`url(#${u}k)`} stroke="#50545b" strokeWidth={0.5} />
            <line x1={x - 5} y1={y} x2={x + 5} y2={y} stroke="#222" strokeWidth={0.9} />
          </g>
        );
      })}
      <rect x={16} y={96} width={68} height={40} rx={6} fill={koyu(r, 0.18)} opacity={0.55} />
      <Led x={50} y={89} on={on} />
      <AyakAnahtari u={u} x={50} y={118} />
    </g>
  );
}

function Looper({ u, r, v, on }: P) {
  const yazi = ustRenk(r);
  return (
    <g>
      <Jak x={4} y={46} />
      <Jak x={121} y={46} />
      <rect x={8} y={8} width={114} height={134} rx={11} fill={`url(#${u}g)`} stroke={koyu(r, 0.5)} strokeWidth={0.8} />
      <Parilti d="M19 10.5 H111" />
      <Dugme u={u} x={34} y={34} r={9} v={v[0] ?? 5} />
      {/* kayıt / çalma halkası */}
      <circle cx={84} cy={38} r={20} fill="#101114" stroke="#000" />
      {Array.from({ length: 24 }, (_, i) => {
        const t = (i / 24) * Math.PI * 2 - Math.PI / 2;
        const yanik = on && i < 15;
        return <circle key={i} cx={84 + Math.cos(t) * 15} cy={38 + Math.sin(t) * 15} r={1.6} fill={yanik ? (i < 9 ? "#30d158" : "#ff453a") : "#2b2d31"} />;
      })}
      <circle cx={84} cy={38} r={7} fill={on ? "#ff453a" : "#4a1c1c"} />
      <Piktogram tur="looper" x={65} y={78} renk={yazi} />
      <rect x={18} y={96} width={94} height={40} rx={7} fill={koyu(r, 0.18)} opacity={0.55} />
      <AyakAnahtari u={u} x={65} y={118} r={10} />
    </g>
  );
}

function Wah({ u, r, v, on }: P) {
  const k = (v[0] ?? 5) / 10;
  const ustY = 30 - k * 10;
  return (
    <g>
      <Jak x={5} y={92} />
      <Jak x={90} y={92} />
      <path d="M14 22 Q14 12 26 12 H74 Q86 12 86 22 V154 Q86 162 76 162 H24 Q14 162 14 154 Z" fill={koyu(r, 0.25)} stroke="#000" strokeOpacity={0.5} />
      {/* basma yüzeyi: konuma göre öne / arkaya yatar (gölge değişir) */}
      <path d={`M18 ${ustY + 6} Q18 ${ustY} 26 ${ustY} H74 Q82 ${ustY} 82 ${ustY + 6} V148 Q82 154 74 154 H26 Q18 154 18 148 Z`} fill={`url(#${u}g)`} stroke={koyu(r, 0.55)} strokeWidth={0.8} />
      <rect x={24} y={ustY + 10} width={52} height={120 - (ustY - 20)} rx={5} fill="#17181b" />
      {Array.from({ length: 13 }, (_, i) => (
        <line key={i} x1={28} x2={72} y1={ustY + 16 + i * ((112 - (ustY - 20)) / 13)} y2={ustY + 16 + i * ((112 - (ustY - 20)) / 13)} stroke="#2e3035" strokeWidth={2.2} strokeLinecap="round" />
      ))}
      <rect x={18} y={146} width={64} height={10} rx={3} fill={koyu(r, 0.4)} opacity={0.6 + k * 0.3} />
      <Led x={50} y={159} on={on} r={2} />
    </g>
  );
}

// ── Amfiler ──

/** Kumaş ızgara (ince dokuma) ve kenar şeridi */
function Izgara({ u, x, y, w, h, rx = 4, hoparlor = [] as [number, number, number][] }: { u: string; x: number; y: number; w: number; h: number; rx?: number; hoparlor?: [number, number, number][] }) {
  return (
    <g>
      <rect x={x - 2} y={y - 2} width={w + 4} height={h + 4} rx={rx + 1.5} fill="none" stroke="#d9d4c6" strokeOpacity={0.75} strokeWidth={1.4} />
      <rect x={x} y={y} width={w} height={h} rx={rx} fill={`url(#${u}w)`} />
      {/* kumaşın arkasından seçilen hoparlörler */}
      {hoparlor.map(([cx, cy, rr], i) => (
        <g key={i} opacity={0.5}>
          <circle cx={cx} cy={cy} r={rr} fill="#000" opacity={0.35} />
          <circle cx={cx} cy={cy} r={rr * 0.36} fill="#000" opacity={0.3} />
          <circle cx={cx - rr * 0.2} cy={cy - rr * 0.25} r={rr * 0.85} fill="none" stroke="#fff" strokeOpacity={0.06} strokeWidth={rr * 0.15} />
        </g>
      ))}
      <rect x={x} y={y} width={w} height={h * 0.45} rx={rx} fill="#fff" opacity={0.04} />
    </g>
  );
}

function Kose({ x, y, d }: { x: number; y: number; d: "sol-ust" | "sag-ust" | "sol-alt" | "sag-alt" }) {
  const sx = d.includes("sol") ? 1 : -1;
  const sy = d.includes("ust") ? 1 : -1;
  return <path d={`M${x} ${y + sy * 12} V${y + sy * 3} Q${x} ${y} ${x + sx * 3} ${y} H${x + sx * 12} L${x} ${y + sy * 12} Z`} fill="#c8cbd0" stroke="#6c7077" strokeWidth={0.6} />;
}
const Koseler = ({ x, y, w, h }: { x: number; y: number; w: number; h: number }) => (
  <g>
    <Kose x={x} y={y} d="sol-ust" />
    <Kose x={x + w} y={y} d="sag-ust" />
    <Kose x={x} y={y + h} d="sol-alt" />
    <Kose x={x + w} y={y + h} d="sag-alt" />
  </g>
);

function Kulp({ x, y, w }: { x: number; y: number; w: number }) {
  return (
    <g>
      <rect x={x - 4} y={y + 1} width={8} height={6} rx={1.5} fill="#8d9198" />
      <rect x={x + w - 4} y={y + 1} width={8} height={6} rx={1.5} fill="#8d9198" />
      <path d={`M${x} ${y + 3} Q${x + w / 2} ${y - 9} ${x + w} ${y + 3}`} fill="none" stroke="#111" strokeWidth={5} strokeLinecap="round" />
      <path d={`M${x + 3} ${y + 1} Q${x + w / 2} ${y - 9.5} ${x + w - 3} ${y + 1}`} fill="none" stroke="#fff" strokeOpacity={0.15} strokeWidth={1} />
    </g>
  );
}

/** Amfi kontrol paneli: fırçalanmış metal şerit, düğmeler, güç anahtarı ve pilot lambası */
function AmfiPaneli({ u, x, y, w, h, v, on, n }: { u: string; x: number; y: number; w: number; h: number; v: number[]; on: boolean; n: number }) {
  const bas = x + 18;
  const adim = (w - 70) / Math.max(1, n - 1);
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={2.5} fill="#bdbab2" />
      <rect x={x} y={y} width={w} height={h} rx={2.5} fill={`url(#${u}k)`} opacity={0.55} />
      <line x1={x + 4} x2={x + w - 4} y1={y + 2} y2={y + 2} stroke="#fff" strokeOpacity={0.6} strokeWidth={0.8} />
      <Jak x={x + 5} y={y + h / 2 - 4.5} w={6} h={9} />
      {Array.from({ length: n }, (_, i) => (
        <Dugme key={i} u={u} x={bas + 6 + i * adim} y={y + h / 2} r={Math.min(6.2, h * 0.32)} v={v[i] ?? 5} />
      ))}
      {/* güç anahtarı ve pilot lambası */}
      <rect x={x + w - 36} y={y + h / 2 - 5} width={6} height={10} rx={1.2} fill="#1a1b1e" />
      <rect x={x + w - 35} y={y + h / 2 - (on ? 5 : 0)} width={4} height={5} rx={1} fill="#e5e5e5" />
      <Led x={x + w - 18} y={y + h / 2} on={on} renk="#ff3b1f" r={3.6} />
    </g>
  );
}

function AmfiKafa({ u, r, v, on }: P) {
  return (
    <g>
      <Kulp x={84} y={10} w={52} />
      <rect x={8} y={12} width={204} height={96} rx={7} fill={`url(#${u}g)`} stroke={koyu(r, 0.6)} />
      <Parilti d="M15 14.5 H205" />
      <Izgara u={u} x={18} y={22} w={184} h={38} rx={3} />
      <AmfiPaneli u={u} x={18} y={68} w={184} h={30} v={v} on={on} n={6} />
      <Koseler x={8} y={12} w={204} h={96} />
    </g>
  );
}

function AmfiKombo({ u, r, v, on }: P) {
  return (
    <g>
      <Kulp x={82} y={10} w={56} />
      <rect x={8} y={12} width={204} height={176} rx={8} fill={`url(#${u}g)`} stroke={koyu(r, 0.6)} />
      <Parilti d="M16 14.5 H204" />
      <AmfiPaneli u={u} x={18} y={22} w={184} h={30} v={v} on={on} n={6} />
      <Izgara u={u} x={18} y={62} w={184} h={114} rx={4} hoparlor={[[110, 119, 44]]} />
      <Koseler x={8} y={12} w={204} h={176} />
    </g>
  );
}

function AmfiKomboKucuk({ u, r, v, on }: P) {
  const tur = Math.round(((v[0] ?? 5) / 10) * 7);
  return (
    <g>
      <rect x={52} y={8} width={66} height={7} rx={3.5} fill="#151618" />
      <rect x={8} y={12} width={154} height={142} rx={10} fill={`url(#${u}g)`} stroke={koyu(r, 0.6)} />
      <Parilti d="M18 14.5 H152" />
      {/* ön panel: tür seçici halka, ekran, düğmeler */}
      <rect x={16} y={20} width={138} height={34} rx={5} fill="#1b1c1f" />
      <Dugme u={u} x={32} y={37} r={9} v={v[0] ?? 5} acikKapak />
      {Array.from({ length: 8 }, (_, i) => {
        const t = ((-135 + (i / 7) * 270) * Math.PI) / 180;
        return <circle key={i} cx={32 + Math.sin(t) * 13.5} cy={37 - Math.cos(t) * 13.5} r={1.1} fill={i === tur && on ? "#ff9f0a" : "#55585e"} />;
      })}
      {[1, 2, 3].map((i) => (
        <Dugme key={i} u={u} x={58 + (i - 1) * 22} y={37} r={7} v={v[i] ?? 5} />
      ))}
      <rect x={124} y={29} width={22} height={13} rx={2} fill={on ? "#0f2a3a" : "#121416"} stroke="#000" />
      <text x={135} y={39} textAnchor="middle" fontSize={9} fontWeight={700} fill={on ? "#5ac8fa" : "#2a3a45"} fontFamily="ui-monospace, Menlo, monospace">
        {tur + 1}
      </text>
      <Led x={135} y={49} on={on} renk="#30d158" r={1.8} />
      {/* delikli metal ızgara */}
      <rect x={16} y={62} width={138} height={84} rx={6} fill={`url(#${u}m)`} stroke="#0b0c0d" />
      <circle cx={85} cy={104} r={34} fill="#000" opacity={0.18} />
      <rect x={16} y={62} width={138} height={30} rx={6} fill="#fff" opacity={0.04} />
    </g>
  );
}

// ── Kabinler ──
function Kabin({ u, r, w, h, hoparlor }: P & { w: number; h: number; hoparlor: [number, number, number][] }) {
  return (
    <g>
      <rect x={8} y={12} width={w - 16} height={h - 20} rx={7} fill={`url(#${u}g)`} stroke={koyu(r, 0.6)} />
      <Parilti d={`M16 14.5 H${w - 16}`} />
      <Izgara u={u} x={18} y={22} w={w - 36} h={h - 40} rx={4} hoparlor={hoparlor} />
      <Koseler x={8} y={12} w={w - 16} h={h - 20} />
      <rect x={w / 2 - 14} y={h - 7} width={28} height={4} rx={2} fill="#111" opacity={0.6} />
    </g>
  );
}

// ── Rack modülleri ──
function RackCerceve({ u, r, children, on }: { u: string; r: string; children: ReactNode; on: boolean }) {
  return (
    <g>
      <rect x={2} y={6} width={256} height={50} rx={2.5} fill={`url(#${u}k)`} stroke="#5e626a" strokeWidth={0.6} />
      {[16, 46].map((y) => [10, 250].map((x) => <rect key={`${x}${y}`} x={x - 3.5} y={y - 2} width={7} height={4} rx={2} fill="#2a2c30" />))}
      <rect x={20} y={7} width={220} height={48} rx={2} fill={`url(#${u}g)`} stroke={koyu(r, 0.5)} strokeWidth={0.6} />
      <Parilti d="M22 8.5 H238" />
      {children}
      {/* güç */}
      <rect x={224} y={22} width={8} height={14} rx={1.5} fill="#121316" />
      <rect x={225} y={on ? 23 : 29} width={6} height={6} rx={1} fill={on ? "#e8e8e8" : "#8a8a8a"} />
      <Led x={228} y={44} on={on} renk="#ff3b30" r={1.8} />
    </g>
  );
}

function RackKompresor({ u, r, v, on }: P) {
  const yazi = ustRenk(r);
  const ibre = -50 + ((v[0] ?? 5) / 10) * 70 * (on ? 1 : 0.2);
  return (
    <RackCerceve u={u} r={r} on={on}>
      <rect x={28} y={13} width={46} height={36} rx={2.5} fill="#f1e6c5" stroke="#000" strokeOpacity={0.5} />
      <path d="M36 40 A20 20 0 0 1 66 40" fill="none" stroke="#6b5a35" strokeWidth={0.8} />
      <path d="M58 33 A20 20 0 0 1 66 40" fill="none" stroke="#c4402b" strokeWidth={1.6} />
      <line x1={51} y1={47} x2={51} y2={22} stroke="#1d1d1f" strokeWidth={1} transform={`rotate(${ibre} 51 47)`} />
      <rect x={28} y={13} width={46} height={10} rx={2.5} fill="#fff" opacity={0.25} />
      {[0, 1, 2, 3, 4].map((i) => (
        <Dugme key={i} u={u} x={92 + i * 25} y={31} r={8} v={v[i] ?? 5} acikKapak={parlaklik(r) < 0.05} />
      ))}
      <line x1={84} x2={208} y1={47} y2={47} stroke={yazi} strokeOpacity={0.25} strokeWidth={0.6} />
    </RackCerceve>
  );
}

function RackEq({ u, r, v, on }: P) {
  const bantlar = Array.from({ length: 15 }, (_, i) => {
    const t = (i / 14) * 4;
    const a = Math.floor(t);
    const b = Math.min(4, a + 1);
    return (v[a] ?? 5) + ((v[b] ?? 5) - (v[a] ?? 5)) * (t - a);
  });
  return (
    <RackCerceve u={u} r={r} on={on}>
      {bantlar.map((x, i) => {
        const cx = 32 + i * 11.4;
        const y = 48 - (x / 10) * 32;
        return (
          <g key={i}>
            <rect x={cx - 1} y={14} width={2} height={36} rx={1} fill="#141518" />
            <rect x={cx - 4} y={y - 2.5} width={8} height={5} rx={1} fill="#2a2c31" stroke="#000" strokeWidth={0.4} />
            <line x1={cx - 3} x2={cx + 3} y1={y} y2={y} stroke={on ? "#ffd60a" : "#777"} strokeWidth={0.9} />
          </g>
        );
      })}
      <Dugme u={u} x={207} y={31} r={8} v={v[4] ?? 5} />
    </RackCerceve>
  );
}

function RackEkran({ x, y, w, h, on, children }: { x: number; y: number; w: number; h: number; on: boolean; children: ReactNode }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={2.5} fill="#050607" stroke="#000" />
      <rect x={x + 2} y={y + 2} width={w - 4} height={h - 4} rx={1.8} fill={on ? "#0b1f2c" : "#0b0d0f"} />
      <g opacity={on ? 1 : 0.25}>{children}</g>
    </g>
  );
}

function RackDelay({ u, r, v, on }: P) {
  const ms = Math.round(40 + ((v[0] ?? 5) / 10) * 960);
  return (
    <RackCerceve u={u} r={r} on={on}>
      <RackEkran x={28} y={14} w={70} h={34} on={on}>
        <text x={63} y={37} textAnchor="middle" fontSize={15} fontWeight={700} fill="#5ac8fa" fontFamily="ui-monospace, Menlo, monospace">
          {ms}
        </text>
        <text x={90} y={44} textAnchor="end" fontSize={6} fill="#5ac8fa" fontFamily="ui-monospace, Menlo, monospace">
          ms
        </text>
      </RackEkran>
      {[0, 1, 2].map((i) => (
        <Dugme key={i} u={u} x={118 + i * 26} y={31} r={8.5} v={v[i] ?? 5} />
      ))}
      <rect x={190} y={23} width={20} height={16} rx={3} fill="#1a1b1f" stroke="#000" />
      <rect x={192} y={25} width={16} height={12} rx={2} fill={on ? "#3a3c42" : "#2a2b2f"} />
      <Led x={200} y={45} on={on} renk="#5ac8fa" r={1.6} />
    </RackCerceve>
  );
}

function RackReverb({ u, r, v, on }: P) {
  const sure = 8 + ((v[0] ?? 5) / 10) * 52;
  const egri = Array.from({ length: 30 }, (_, i) => {
    const x = 32 + i * 2.2;
    const y = 44 - 24 * Math.exp(-(i * 2.2) / (sure * 0.45)) * (0.75 + 0.25 * Math.cos(i * 1.7));
    return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
  return (
    <RackCerceve u={u} r={r} on={on}>
      <RackEkran x={28} y={14} w={74} h={34} on={on}>
        <path d={egri} fill="none" stroke="#bf9bff" strokeWidth={1.4} strokeLinejoin="round" />
        <line x1={32} x2={98} y1={44.5} y2={44.5} stroke="#bf9bff" strokeOpacity={0.35} strokeWidth={0.6} />
      </RackEkran>
      {[0, 1, 2].map((i) => (
        <Dugme key={i} u={u} x={122 + i * 28} y={31} r={9} v={v[i] ?? 5} acikKapak={parlaklik(r) < 0.04} />
      ))}
    </RackCerceve>
  );
}

// ── Stüdyo ──
function Mikrofon({ u, r }: P) {
  return (
    <g>
      {/* topuz ızgara */}
      <circle cx={35} cy={34} r={24} fill="#3a3c41" />
      <circle cx={35} cy={34} r={22.5} fill={`url(#${u}m)`} opacity={0.9} />
      <circle cx={35} cy={34} r={22.5} fill={`url(#${u}dk)`} opacity={0.45} />
      <path d="M13 34 H57 M35 12 V56 M17 22 Q35 30 53 22 M17 46 Q35 38 53 46" stroke="#8b8f96" strokeWidth={0.7} fill="none" opacity={0.6} />
      <rect x={16} y={52} width={38} height={8} rx={3} fill={`url(#${u}k)`} />
      {/* gövde */}
      <path d="M18 60 H52 L46 140 Q45 148 35 148 Q25 148 24 140 Z" fill={`url(#${u}y)`} stroke={koyu(r, 0.6)} strokeWidth={0.7} />
      <path d="M22 62 L27 140" stroke="#fff" strokeOpacity={0.2} strokeWidth={1.4} />
      <rect x={27} y={148} width={16} height={14} rx={2} fill="#8f939a" />
      {[31, 35, 39].map((x) => (
        <circle key={x} cx={x} cy={157} r={1.2} fill="#2b2d31" />
      ))}
    </g>
  );
}

function Di({ u, r, v, on }: P) {
  const yazi = ustRenk(r);
  return (
    <g>
      <Jak x={20} y={4} w={9} h={10} />
      <Jak x={61} y={4} w={9} h={10} />
      <rect x={8} y={12} width={74} height={90} rx={6} fill={`url(#${u}g)`} stroke={koyu(r, 0.5)} />
      <Parilti d="M14 14.5 H76" />
      <Dugme u={u} x={45} y={38} r={9} v={v[0] ?? 5} />
      {/* toprak ayırma ve zayıflatma anahtarları */}
      {[28, 62].map((x, i) => (
        <g key={x}>
          <rect x={x - 5} y={62} width={10} height={16} rx={2.5} fill="#16171a" />
          <rect x={x - 3.5} y={i === 0 && on ? 64 : 71} width={7} height={5} rx={1.2} fill="#d5d7db" />
        </g>
      ))}
      <path d="M38 88 H52 M41 92 H49 M44 96 H46 M45 82 V88" stroke={yazi} strokeWidth={1.4} strokeLinecap="round" />
      <rect x={34} y={98} width={22} height={10} rx={2} fill="#7f838a" />
      <circle cx={40} cy={103} r={1.5} fill="#222" />
      <circle cx={50} cy={103} r={1.5} fill="#222" />
    </g>
  );
}

function SesKarti({ u, r, v, on }: P) {
  const kazanc = v[0] ?? 5;
  const hale = !on ? "#3a3c40" : kazanc > 8 ? "#ff453a" : kazanc > 6 ? "#ffd60a" : "#30d158";
  return (
    <g>
      <rect x={8} y={14} width={154} height={68} rx={9} fill={`url(#${u}g)`} stroke={koyu(r, 0.6)} />
      <rect x={8} y={14} width={154} height={68} rx={9} fill={`url(#${u}y)`} opacity={0.3} />
      <Parilti d="M17 16.5 H153" />
      {/* birleşik giriş (XLR + jak) */}
      <circle cx={32} cy={48} r={14} fill="#1b1c1f" stroke="#000" />
      <circle cx={32} cy={48} r={11} fill="#2b2d31" />
      <circle cx={32} cy={48} r={4.2} fill="#0d0e10" stroke="#777" strokeWidth={0.6} />
      {[0, 1, 2].map((i) => {
        const t = (Math.PI * 2 * i) / 3 - Math.PI / 2;
        return <circle key={i} cx={32 + Math.cos(t) * 7.5} cy={48 + Math.sin(t) * 7.5} r={1.3} fill="#0d0e10" />;
      })}
      {/* kazanç düğmesi ve ışıklı hale */}
      <circle cx={66} cy={46} r={13} fill="none" stroke={hale} strokeWidth={2.4} opacity={on ? 1 : 0.6} />
      {on && <circle cx={66} cy={46} r={13} fill="none" stroke={hale} strokeWidth={6} opacity={0.2} />}
      <Dugme u={u} x={66} y={46} r={9.5} v={kazanc} />
      {/* iki küçük düğme */}
      {[94, 108].map((x, i) => (
        <g key={x}>
          <rect x={x - 5} y={40} width={10} height={10} rx={2} fill="#1a1b1e" stroke="#000" strokeWidth={0.5} />
          <circle cx={x} cy={56} r={1.3} fill={on && i === 1 ? "#30d158" : "#3a3c40"} />
        </g>
      ))}
      {/* büyük çıkış düğmesi */}
      <circle cx={137} cy={45} r={16} fill="#000" opacity={0.25} />
      <Dugme u={u} x={137} y={44} r={14} v={v[1] ?? 5} acikKapak />
      <circle cx={148} cy={72} r={3.6} fill="#121316" stroke="#7b7f86" strokeWidth={0.7} />
    </g>
  );
}

function Yazilim({ u, r, on }: P) {
  const renkler = ["#30d158", "#ff9f0a", "#5ac8fa", "#bf5af2"];
  return (
    <g>
      <rect x={22} y={8} width={146} height={98} rx={6} fill="#1c1d20" stroke="#000" />
      <rect x={27} y={13} width={136} height={86} rx={2.5} fill={on ? koyu(r, 0.35) : "#0b0c0e"} />
      <g opacity={on ? 1 : 0.3}>
        <rect x={27} y={13} width={136} height={12} fill="#000" opacity={0.35} />
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={34 + i * 6} cy={19} r={1.6} fill={["#ff5f57", "#febc2e", "#28c840"][i]} />
        ))}
        {/* sahne: üstte büyük amfi silüeti, altta zincir kutucukları */}
        <rect x={64} y={30} width={62} height={34} rx={3} fill="#2a2724" stroke="#000" strokeOpacity={0.6} />
        <rect x={68} y={33} width={54} height={8} rx={1.5} fill="#bdbab2" />
        {[0, 1, 2, 3, 4].map((i) => (
          <circle key={i} cx={74 + i * 10} cy={37} r={2.2} fill="#1a1a1a" />
        ))}
        <rect x={68} y={44} width={54} height={17} rx={1.5} fill={`url(#${u}w)`} />
        <line x1={32} x2={158} y1={82} y2={82} stroke="#8e8e93" strokeWidth={0.8} />
        {renkler.map((c, i) => (
          <rect key={c} x={40 + i * 30} y={74} width={18} height={16} rx={3} fill={c} opacity={0.9} />
        ))}
      </g>
      <path d="M8 108 H182 L174 120 Q172 124 166 124 H24 Q18 124 16 120 Z" fill={`url(#${u}k)`} stroke="#6a6e75" strokeWidth={0.6} />
      <rect x={80} y={108} width={30} height={4} rx={2} fill="#000" opacity={0.25} />
    </g>
  );
}

// ── Gitarlar ──

/** Sap ve kafa: genel 3+3 kafa, perde telleri, nokta işaretler */
function Sap({ u, x, ust, alt, genislik = 15, akustik = false }: { u: string; x: number; ust: number; alt: number; genislik?: number; akustik?: boolean }) {
  const kafaY = ust - 54;
  const perdeler = Array.from({ length: 15 }, (_, i) => ust + (alt - ust) * (1 - Math.pow(0.94, i + 1)) * 1.62);
  return (
    <g>
      <path d={`M${x - 13} ${kafaY + 6} Q${x - 15} ${kafaY - 4} ${x - 8} ${kafaY - 6} L${x} ${kafaY - 2} L${x + 8} ${kafaY - 6} Q${x + 15} ${kafaY - 4} ${x + 13} ${kafaY + 6} L${x + 9} ${ust + 2} H${x - 9} Z`} fill={akustik ? "#3a2618" : "#18171a"} stroke="#000" strokeOpacity={0.5} strokeWidth={0.6} />
      {[0, 1, 2].map((i) =>
        [-1, 1].map((s) => (
          <g key={`${i}${s}`}>
            <rect x={x + s * 13 - (s > 0 ? 0 : 7)} y={kafaY + 6 + i * 14} width={7} height={4} rx={2} fill={`url(#${u}k)`} />
            <circle cx={x + s * 7} cy={kafaY + 8 + i * 14} r={1.8} fill="#d6d8dc" />
          </g>
        )),
      )}
      <rect x={x - genislik / 2} y={ust} width={genislik} height={alt - ust} fill={akustik ? "#3d2a1c" : "#2a1d16"} />
      <rect x={x - genislik / 2 - 0.6} y={ust - 2} width={genislik + 1.2} height={2.4} fill="#efe8d8" />
      {perdeler.filter((y) => y < alt - 4).map((y, i) => (
        <g key={i}>
          <line x1={x - genislik / 2} x2={x + genislik / 2} y1={y} y2={y} stroke="#c9ccd1" strokeWidth={0.7} />
          {[2, 4, 6, 8, 14].includes(i) && <circle cx={x} cy={y - (y - (perdeler[i - 1] ?? ust)) / 2} r={1.5} fill="#e9e3d3" />}
          {i === 11 && [-3.5, 3.5].map((dx) => <circle key={dx} cx={x + dx} cy={y - (y - perdeler[i - 1]) / 2} r={1.3} fill="#e9e3d3" />)}
        </g>
      ))}
    </g>
  );
}

function Teller({ x, ust, alt, ara = 2.2 }: { x: number; ust: number; alt: number; ara?: number }) {
  return (
    <g>
      {[-2.5, -1.5, -0.5, 0.5, 1.5, 2.5].map((i, j) => (
        <line key={i} x1={x + i * (ara * 0.7)} x2={x + i * ara} y1={ust} y2={alt} stroke="#e8e8ea" strokeOpacity={0.75} strokeWidth={0.35 + j * 0.08} />
      ))}
    </g>
  );
}

function Humbucker({ u, x, y }: { u: string; x: number; y: number }) {
  return (
    <g>
      <rect x={x - 17} y={y - 8} width={34} height={16} rx={2.5} fill="#e9e2cf" opacity={0.9} />
      <rect x={x - 15} y={y - 6.5} width={30} height={13} rx={1.5} fill={`url(#${u}k)`} />
      {[-1, 1].map((s) => (
        <g key={s}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <circle key={i} cx={x - 11 + i * 4.4} cy={y + s * 3} r={1} fill="#6a6e75" />
          ))}
        </g>
      ))}
    </g>
  );
}

function TekKesik({ u, r, v }: P) {
  const govde = "M53 160 C42 151 22 155 20 177 C18 196 30 208 26 224 C16 242 10 258 12 278 C15 302 37 314 60 314 C84 314 106 302 108 278 C110 260 104 244 96 228 C90 214 98 202 98 188 C98 172 92 160 84 160 C77 160 75 168 72 175 C70 166 64 160 53 160 Z";
  return (
    <g>
      <Sap u={u} x={60} ust={62} alt={186} />
      <path d={govde} fill="#efe6cf" transform="translate(60 234) scale(1.035) translate(-60 -234)" />
      <path d={govde} fill={`url(#${u}g)`} stroke={koyu(r, 0.55)} strokeWidth={0.5} />
      {/* oyma üst kapak: yumuşak parıltı */}
      <ellipse cx={52} cy={232} rx={30} ry={60} fill="#fff" opacity={0.07} />
      <path d="M36 182 C34 200 40 210 36 224" stroke="#fff" strokeOpacity={0.18} strokeWidth={3} fill="none" strokeLinecap="round" />
      <Humbucker u={u} x={60} y={200} />
      <Humbucker u={u} x={60} y={240} />
      <rect x={45} y={259} width={30} height={5} rx={2} fill={`url(#${u}k)`} />
      <rect x={43} y={276} width={34} height={6} rx={2.5} fill={`url(#${u}k)`} />
      <Teller x={60} ust={10} alt={279} />
      {[
        [82, 262, 0],
        [92, 278, 1],
        [80, 286, 0],
        [90, 300, 1],
      ].map(([x, y, i], j) => (
        <circle key={j} cx={x} cy={y} r={4.6} fill="#d9b34f" stroke="#6d5420" strokeWidth={0.6} opacity={0.95}>
          <title>{["Ses", "Ton"][i]}</title>
        </circle>
      ))}
      {[0, 1, 2, 3].map((j) => {
        const [x, y] = [
          [82, 262],
          [92, 278],
          [80, 286],
          [90, 300],
        ][j];
        return <line key={j} x1={x} y1={y} x2={x} y2={y - 3.6} stroke="#3a2a10" strokeWidth={0.9} transform={`rotate(${aci(v[j % 2] ?? 5)} ${x} ${y})`} />;
      })}
      <circle cx={34} cy={186} r={3.4} fill={`url(#${u}k)`} />
      <line x1={34} y1={186} x2={31} y2={180} stroke="#e8e8e8" strokeWidth={1.6} strokeLinecap="round" />
      <circle cx={98} cy={292} r={2.6} fill="#1a1a1a" stroke="#888" strokeWidth={0.5} />
    </g>
  );
}

function CiftKesik({ u, r, v }: P) {
  const govde = "M60 172 C50 172 46 160 40 150 C36 144 26 146 26 158 C26 176 34 190 30 206 C26 222 14 236 16 262 C18 292 40 310 60 310 C82 310 104 292 104 262 C106 236 94 222 90 206 C86 190 96 168 92 150 C90 140 80 140 78 150 C74 162 70 172 60 172 Z";
  return (
    <g>
      <Sap u={u} x={60} ust={62} alt={186} />
      <path d={govde} fill={`url(#${u}g)`} stroke={koyu(r, 0.5)} strokeWidth={0.7} />
      <path d={govde} fill={`url(#${u}y)`} opacity={0.4} />
      {/* koruma plakası */}
      <path d="M44 184 C40 200 46 214 40 230 C34 250 40 270 56 274 C70 278 80 268 84 256 C88 244 82 234 80 222 L76 184 Z" fill="#f2f0ea" stroke="#c9c5bb" strokeWidth={0.6} />
      {[198, 222, 246].map((y, i) => (
        <g key={y} transform={`rotate(${i === 2 ? -8 : 0} 60 ${y})`}>
          <rect x={46} y={y - 4.5} width={28} height={9} rx={4.5} fill="#f8f7f3" stroke="#bfbab0" strokeWidth={0.6} />
          {[0, 1, 2, 3, 4, 5].map((j) => (
            <circle key={j} cx={49.5 + j * 4.2} cy={y} r={1} fill="#9aa0a8" />
          ))}
        </g>
      ))}
      <rect x={44} y={272} width={32} height={9} rx={2} fill={`url(#${u}k)`} />
      <Teller x={60} ust={10} alt={276} />
      {[
        [82, 262],
        [88, 280],
      ].map(([x, y], j) => (
        <g key={j}>
          <circle cx={x} cy={y} r={5} fill="#f4f2ec" stroke="#b9b4a9" strokeWidth={0.6} />
          <line x1={x} y1={y} x2={x} y2={y - 4} stroke="#3a3a3a" strokeWidth={1} transform={`rotate(${aci(v[j] ?? 5)} ${x} ${y})`} />
        </g>
      ))}
      <rect x={74} y={240} width={3} height={14} rx={1.5} fill="#2b2b2b" transform="rotate(-20 75 247)" />
    </g>
  );
}

function Akustik({ u, r, v }: P) {
  const govde = "M65 150 C46 150 34 156 34 176 C34 194 44 202 40 214 C34 230 18 240 18 268 C18 298 40 314 65 314 C90 314 112 298 112 268 C112 240 96 230 90 214 C86 202 96 194 96 176 C96 156 84 150 65 150 Z";
  return (
    <g>
      <Sap u={u} x={65} ust={62} alt={176} genislik={16} akustik />
      <path d={govde} fill="#f3ead6" transform="translate(65 232) scale(1.03) translate(-65 -232)" />
      <path d={govde} fill={`url(#${u}g)`} />
      <ellipse cx={58} cy={240} rx={34} ry={64} fill="#fff" opacity={0.08} />
      {/* ses deliği ve rozet */}
      <circle cx={65} cy={204} r={16} fill="none" stroke={koyu(r, 0.45)} strokeWidth={3} />
      <circle cx={65} cy={204} r={16} fill="none" stroke="#efe6cf" strokeWidth={1} strokeDasharray="2 1.4" />
      <circle cx={65} cy={204} r={12.5} fill="#120c08" />
      <path d="M80 214 C92 214 98 226 94 238 C90 246 80 244 78 236 Z" fill={koyu(r, 0.5)} opacity={0.65} />
      <rect x={46} y={266} width={38} height={9} rx={4.5} fill="#2a1a10" />
      <rect x={52} y={268} width={26} height={2} rx={1} fill="#efe6cf" />
      <Teller x={65} ust={10} alt={270} ara={2.4} />
      <circle cx={102} cy={296} r={3} fill="#1a1a1a" opacity={0.6 + (v[0] ?? 5) / 40} />
    </g>
  );
}

// ── Seçici ──

function Govde({ cizim, p }: { cizim: Cizim; p: P }) {
  const [w, h] = BOYUT[cizim];
  switch (cizim) {
    case "gitar-tek-kesik":
      return <TekKesik {...p} />;
    case "gitar-cift-kesik":
      return <CiftKesik {...p} />;
    case "gitar-akustik":
      return <Akustik {...p} />;
    case "tuner":
      return <Tuner {...p} />;
    case "eq":
      return <EqPedal {...p} />;
    case "looper":
      return <Looper {...p} />;
    case "wah":
      return <Wah {...p} />;
    case "amfi-kafa":
      return <AmfiKafa {...p} />;
    case "amfi-kombo":
      return <AmfiKombo {...p} />;
    case "amfi-kombo-kucuk":
      return <AmfiKomboKucuk {...p} />;
    case "kabin-4x12":
      return (
        <Kabin
          {...p}
          w={w}
          h={h}
          hoparlor={[
            [62, 64, 36],
            [148, 64, 36],
            [62, 148, 36],
            [148, 148, 36],
          ]}
        />
      );
    case "kabin-2x12":
      return (
        <Kabin
          {...p}
          w={w}
          h={h}
          hoparlor={[
            [64, 67, 40],
            [160, 67, 40],
          ]}
        />
      );
    case "kabin-1x12":
      return <Kabin {...p} w={w} h={h} hoparlor={[[80, 85, 52]]} />;
    case "rack-kompresor":
      return <RackKompresor {...p} />;
    case "rack-eq":
      return <RackEq {...p} />;
    case "rack-delay":
      return <RackDelay {...p} />;
    case "rack-reverb":
      return <RackReverb {...p} />;
    case "mikrofon":
      return <Mikrofon {...p} />;
    case "di":
      return <Di {...p} />;
    case "ses-karti":
      return <SesKarti {...p} />;
    case "yazilim":
      return <Yazilim {...p} />;
    default:
      return <KutuPedal {...p} tur={cizim} />;
  }
}

export type CizimOzellik = {
  cizim: Cizim;
  renk: string;
  /** Düğme değerleri, CIZIMLER[cizim].dugmeler sırasıyla (0–10) */
  degerler?: number[];
  /** Açık mı (LED / pilot lamba); devre dışı (bypass) düğümde false */
  acik?: boolean;
  /** Altta yumuşak gölge */
  golge?: boolean;
  className?: string;
  /** İç içe SVG için (PNG afişi) */
  x?: number;
  y?: number;
  width?: number | string;
  height?: number | string;
  baslik?: string;
  preserveAspectRatio?: string;
};

/** Bir ekipmanın özgün çizimi; her boyutta keskin (SVG) */
export default function EkipmanCizimi({ cizim, renk, degerler = [], acik: on = true, golge = true, className, x, y, width, height, baslik, preserveAspectRatio }: CizimOzellik) {
  const u = `c${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const [w, h] = BOYUT[cizim] ?? [100, 150];
  const p: P = { u, r: renk, v: degerler, on };
  return (
    <svg viewBox={`0 0 ${w} ${h + 8}`} x={x} y={y} width={width} height={height} className={className} preserveAspectRatio={preserveAspectRatio} role={baslik ? "img" : undefined} aria-label={baslik} aria-hidden={baslik ? undefined : true} overflow="visible">
      <OrtakDefs u={u} r={renk} />
      {golge && (
        <ellipse cx={w / 2} cy={h + 1} rx={w * 0.44} ry={5} fill={`url(#${u}s)`} />
      )}
      <Govde cizim={cizim} p={p} />
    </svg>
  );
}
