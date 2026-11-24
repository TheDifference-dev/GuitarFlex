// Pedal çizimleri: döküm alüminyum kutu (üstten, ön duvarı görünen hafif perspektif), boyalı yüzey dokusu, düğmeler,
// LED, ayak anahtarı, yan jaklar. Türlerin klasik görünüşünden yola çıkan ÖZGÜN çizimlerdir; düğme dizilimi, renk ve
// yazı yerleşimi hiçbir ürünü birebir kopyalamaz. Kitaplık modelinde GuitarFlex adı, kullanıcı ekipmanında tür adı basılır.
import type { ReactNode } from "react";
import { CIZIMLER, type Cizim } from "@/lib/rig-cekirdek";
import { AyakAnahtari, Anahtar, Dugme, Led, Tanimlar, Vida, YanJak, Yazi, acik, baskiRengi, etiketYaz, koyu, yuzey, type Ctx, type DugmeTur, type Yuzey } from "./temel";

type Govde = "kutu" | "genis" | "mini" | "yuvarlak" | "cift";
type Duzen = "sira" | "ucgen";

type Stil = {
  govde: Govde;
  yuzey: Yuzey;
  dugme: DugmeTur;
  dugmeRenk?: string;
  led: string;
  /** Kullanıcı ekipmanında basılan genel tür adı */
  tur: string;
  font?: "sans" | "serif" | "retro";
  italik?: boolean;
  duzen?: Duzen;
  /** Yazının arkasında renkli şerit */
  bant?: string;
  /** Kollu anahtar */
  anahtar?: boolean;
  /** Küçük ekran (dijital) */
  ekran?: boolean;
  /** Üstte dört köşe vidası */
  vidali?: boolean;
};

export const PEDAL_STIL: Partial<Record<Cizim, Stil>> = {
  overdrive: { govde: "kutu", yuzey: "metalik", dugme: "siyah", led: "#ff2a1f", tur: "OVERDRIVE", font: "sans" },
  "overdrive-seffaf": { govde: "kutu", yuzey: "parlak", dugme: "krom", led: "#ff3b30", tur: "OVERDRIVE", font: "serif", italik: true },
  "overdrive-krem": { govde: "kutu", yuzey: "mat", dugme: "renkli", dugmeRenk: "#5b3a22", led: "#ff3b30", tur: "OVERDRIVE", font: "retro", duzen: "ucgen", vidali: true },
  distortion: { govde: "kutu", yuzey: "mat", dugme: "siyah", led: "#ff2a1f", tur: "DISTORSİYON", font: "sans", bant: "#141416" },
  "distortion-modern": { govde: "kutu", yuzey: "mat", dugme: "renkli", dugmeRenk: "#b81d1d", led: "#ff2a1f", tur: "DISTORSİYON", font: "sans", anahtar: true },
  fuzz: { govde: "genis", yuzey: "metalik", dugme: "siyah", led: "#ff2a1f", tur: "FUZZ", font: "retro" },
  "fuzz-yuvarlak": { govde: "yuvarlak", yuzey: "cekic", dugme: "siyah", led: "#ff2a1f", tur: "FUZZ", font: "serif", italik: true },
  boost: { govde: "mini", yuzey: "parlak", dugme: "krom", led: "#2f8bff", tur: "BOOST", font: "sans" },
  kompresor: { govde: "kutu", yuzey: "parlak", dugme: "siyah", led: "#2fd158", tur: "KOMPRESÖR", font: "sans" },
  "gurultu-kapisi": { govde: "kutu", yuzey: "firca", dugme: "krom", led: "#2fd158", tur: "GATE", font: "sans", vidali: true },
  "zarf-filtresi": { govde: "kutu", yuzey: "metalik", dugme: "krem", led: "#ff3b30", tur: "ZARF FİLTRESİ", font: "retro", anahtar: true },
  chorus: { govde: "kutu", yuzey: "metalik", dugme: "siyah", led: "#2f9bff", tur: "CHORUS", font: "sans" },
  phaser: { govde: "mini", yuzey: "parlak", dugme: "siyah", led: "#ff2a1f", tur: "PHASER", font: "retro" },
  flanger: { govde: "kutu", yuzey: "metalik", dugme: "krom", led: "#ff2a1f", tur: "FLANGER", font: "sans", italik: true },
  tremolo: { govde: "kutu", yuzey: "cekic", dugme: "krem", led: "#ffa21a", tur: "TREMOLO", font: "serif" },
  vibe: { govde: "genis", yuzey: "cekic", dugme: "tavuk", led: "#ff8a00", tur: "VIBE", font: "serif", italik: true },
  delay: { govde: "kutu", yuzey: "mat", dugme: "siyah", led: "#ff2a1f", tur: "DELAY", font: "retro" },
  "delay-dijital": { govde: "cift", yuzey: "firca", dugme: "krom", led: "#2f9bff", tur: "DİJİTAL DELAY", font: "sans", ekran: true },
  "reverb-yay": { govde: "kutu", yuzey: "parlak", dugme: "krem", led: "#2fd158", tur: "YAY REVERB", font: "retro", bant: "#efe6cf" },
  reverb: { govde: "kutu", yuzey: "metalik", dugme: "krom", led: "#7aa7ff", tur: "REVERB", font: "sans" },
  oktav: { govde: "kutu", yuzey: "parlak", dugme: "siyah", led: "#ff3ba0", tur: "OKTAV", font: "sans", anahtar: true },
};

export const PEDAL_BOYUT: Partial<Record<Cizim, [number, number]>> = {
  tuner: [100, 160],
  eq: [100, 160],
  looper: [130, 160],
  wah: [104, 196],
  volum: [104, 196],
};
const govdeBoyutu: Record<Govde, [number, number]> = { kutu: [100, 160], genis: [150, 152], mini: [72, 160], yuvarlak: [140, 146], cift: [122, 160] };
export const pedalBoyutu = (cizim: Cizim): [number, number] => PEDAL_BOYUT[cizim] ?? govdeBoyutu[PEDAL_STIL[cizim]?.govde ?? "kutu"];

type P = { c: Ctx; r: string; v: number[]; etiket?: string };

// ── Ortak gövde ──

/** Kutu gövde: ön duvar, yan jaklar, DC girişi, boyalı üst yüz. Sonra `children` (üst yüz öğeleri). */
function Kutu({ c, r, x, y, w, h, rx = 7, yz, children }: { c: Ctx; r: string; x: number; y: number; w: number; h: number; rx?: number; yz: Yuzey; children?: ReactNode }) {
  const { u } = c;
  const duvar = 8;
  const id = `${u}pg`;
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0.25" y2="1">
          <stop offset="0" stopColor={acik(r, 0.16)} />
          <stop offset="0.5" stopColor={r} />
          <stop offset="1" stopColor={koyu(r, 0.22)} />
        </linearGradient>
        <linearGradient id={`${id}d`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={koyu(r, 0.38)} />
          <stop offset="0.6" stopColor={koyu(r, 0.55)} />
          <stop offset="1" stopColor={koyu(r, 0.75)} />
        </linearGradient>
      </defs>
      {/* temas gölgesi */}
      <rect x={x + 2} y={y + h - 10} width={w - 2} height={duvar + 12} rx={rx} fill="#000" opacity={0.35} filter={c.t ? `url(#${u}f-bulanik)` : undefined} />
      {/* DC girişi (arka kenar) ve yan jaklar */}
      <rect x={x + w / 2 - 4} y={y - 3.2} width={8} height={5} rx={1} fill="#1a1b1e" />
      <rect x={x + w / 2 - 2.2} y={y - 2.4} width={4.4} height={2.6} rx={0.6} fill="#3d4046" />
      <YanJak c={c} x={x + w} y={y + h * 0.33} yon={1} />
      <YanJak c={c} x={x} y={y + h * 0.33} yon={-1} />
      {/* ön duvar */}
      <rect x={x} y={y + h - rx * 2} width={w} height={rx * 2 + duvar} rx={rx} fill={`url(#${id}d)`} />
      <path d={`M${x + rx} ${y + h + duvar - 0.6} H${x + w - rx}`} stroke="#000" strokeOpacity={0.5} strokeWidth={1.2} />
      {/* üst yüz */}
      <rect x={x} y={y} width={w} height={h} rx={rx} fill={`url(#${id})`} filter={yuzey(c, yz)} />
      {!c.t && <rect x={x + 0.6} y={y + 0.6} width={w - 1.2} height={h - 1.2} rx={rx - 0.5} fill="none" stroke="#fff" strokeOpacity={0.22} strokeWidth={1} />}
      {!c.t && <rect x={x} y={y} width={w} height={h} rx={rx} fill="none" stroke={koyu(r, 0.6)} strokeWidth={0.6} />}
      {children}
    </g>
  );
}

/** Model adı (iki satıra bölünebilir) ve küçük "GuitarFlex" yazısı; kullanıcı ekipmanında tür adı */
function Logo({ c, x, y, w, etiket, tur, renk, font = "sans", italik = false, bant }: { c: Ctx; x: number; y: number; w: number; etiket?: string; tur: string; renk: string; font?: "sans" | "serif" | "retro"; italik?: boolean; bant?: string }) {
  if (!c.t) {
    return bant ? <rect x={x - w / 2} y={y - 9} width={w} height={16} fill={bant} opacity={0.95} /> : null;
  }
  const metin = etiket ?? tur;
  const satirlar = metin.length > 11 && metin.includes(" ") ? [metin.slice(0, metin.lastIndexOf(" ")), metin.slice(metin.lastIndexOf(" ") + 1)] : [metin];
  const enUzun = Math.max(...satirlar.map((s) => s.length));
  const boy = Math.min(etiket ? 12.5 : 9, (w * 1.55) / Math.max(4, enUzun));
  const yaziRenk = bant ? baskiRengi(bant) : renk;
  const ust = y - ((satirlar.length - 1) * boy * 1.05) / 2;
  return (
    <g>
      {bant && <rect x={x - w / 2} y={ust - boy - 4} width={w} height={satirlar.length * boy * 1.05 + 8 + (etiket ? 6 : 0)} fill={bant} opacity={0.96} />}
      {satirlar.map((s, i) => (
        <Yazi key={i} x={x} y={ust + i * boy * 1.05} boy={boy} renk={yaziRenk} font={font} kalin={font === "serif" ? 700 : 800} italik={italik} ara={font === "retro" ? 0.6 : -0.2}>
          {s}
        </Yazi>
      ))}
      {etiket && (
        <Yazi x={x} y={ust + (satirlar.length - 1) * boy * 1.05 + 7} boy={3.6} renk={yaziRenk} kalin={600} ara={1.1} opaklik={0.78}>
          GUITARFLEX
        </Yazi>
      )}
    </g>
  );
}

/** Düğme yerleşimi: [x, y, r] */
function dugmeYerleri(n: number, x0: number, w: number, y: number, duzen: Duzen = "sira"): [number, number, number][] {
  const orta = x0 + w / 2;
  if (n === 0) return [];
  if (n === 1) return [[orta, y + 2, w * 0.15]];
  if (n === 2) return [[x0 + w * 0.3, y, w * 0.12], [x0 + w * 0.7, y, w * 0.12]];
  if (n === 3 && duzen === "ucgen") return [[x0 + w * 0.24, y - 2, w * 0.11], [x0 + w * 0.76, y - 2, w * 0.11], [orta, y + w * 0.2, w * 0.085]];
  if (n === 3) return [0.2, 0.5, 0.8].map((q) => [x0 + w * q, y, w * 0.1] as [number, number, number]);
  if (n === 4) return [0.16, 0.39, 0.61, 0.84].map((q) => [x0 + w * q, y, w * 0.08] as [number, number, number]);
  return [
    ...[0.2, 0.5, 0.8].map((q) => [x0 + w * q, y - 3, w * 0.085] as [number, number, number]),
    ...[0.35, 0.65].map((q) => [x0 + w * q, y + w * 0.22, w * 0.075] as [number, number, number]),
  ];
}

// ── Genel kutu pedal ──

function KutuPedal({ c, r, v, etiket, cizim, s }: P & { cizim: Cizim; s: Stil }) {
  const [W] = govdeBoyutu[s.govde];
  const baski = s.bant ? baskiRengi(s.bant) : baskiRengi(r);
  const dugmeler = CIZIMLER[cizim].dugmeler;
  const { x, y, w, h } = s.govde === "genis" ? { x: 8, y: 8, w: W - 16, h: 128 } : s.govde === "mini" ? { x: 11, y: 8, w: W - 22, h: 138 } : s.govde === "cift" ? { x: 8, y: 8, w: W - 16, h: 138 } : { x: 10, y: 8, w: W - 20, h: 138 };
  const knobY = s.govde === "genis" ? 34 : s.ekran ? 58 : 32;
  const yerler = dugmeYerleri(dugmeler.length, x, w, knobY, s.duzen);
  const iki = s.govde === "cift";
  const ayakY = y + h - (s.govde === "genis" ? 24 : 22);
  const logoY = s.govde === "genis" ? 74 : s.govde === "mini" ? 82 : iki ? 96 : dugmeler.length >= 5 ? 92 : 84;
  return (
    <g style={{ color: baski }}>
      <Kutu c={c} r={r} x={x} y={y} w={w} h={h} rx={s.govde === "mini" ? 6 : 8} yz={s.yuzey}>
        {s.vidali && [x + 5, x + w - 5].map((vx) => [y + 5, y + h - 5].map((vy) => <Vida key={`${vx}${vy}`} c={c} x={vx} y={vy} r={1.5} d={vx * 7 + vy} />))}
        {s.ekran && (
          <g>
            <rect x={x + 12} y={y + 9} width={w - 24} height={22} rx={2.5} fill="#050607" stroke={koyu(r, 0.6)} strokeWidth={0.8} />
            <rect x={x + 14} y={y + 11} width={w - 28} height={18} rx={1.5} fill={c.on ? "#0a2236" : "#0b0d10"} />
            {c.on && (
              <Yazi x={x + w / 2} y={y + 25} boy={11} renk="#6fd3ff" font="mono" kalin={700}>
                {Math.round(40 + ((v[0] ?? 5) / 10) * 1160)}
              </Yazi>
            )}
            {c.on && c.t && (
              <Yazi x={x + w - 17} y={y + 27} boy={3.6} renk="#6fd3ff" font="mono" hiza="end">
                ms
              </Yazi>
            )}
            <rect x={x + 14} y={y + 11} width={w - 28} height={18} rx={1.5} fill={`url(#${c.u}cam)`} />
          </g>
        )}
        {yerler.map(([dx, dy, dr], i) => (
          <Dugme key={i} c={c} x={dx} y={dy} r={dr} v={v[i] ?? 5} tur={s.dugme} renk={s.dugmeRenk} isaret={etiketYaz(dugmeler[i])} isaretBoy={Math.min(dr * 0.42, (w / Math.max(3, yerler.length)) * 1.45 / Math.max(5, dugmeler[i].length))} />
        ))}
        {s.anahtar && <Anahtar c={c} x={x + w / 2} y={dugmeler.length >= 5 ? knobY + 12 : knobY + 20} r={2.4} ust={(v[0] ?? 5) >= 5} />}
        <Led c={c} x={x + w / 2} y={iki ? ayakY - 18 : s.govde === "mini" ? y + 58 : s.govde === "genis" ? ayakY - 17 : ayakY - 21} renk={s.led} r={s.govde === "mini" ? 2.2 : 2.5} />
        <Logo c={c} x={x + w / 2} y={logoY} w={w - 8} etiket={etiket} tur={s.tur} renk={baski} font={s.font} italik={s.italik} bant={s.bant} />
        {iki ? (
          <>
            <AyakAnahtari c={c} x={x + w * 0.27} y={ayakY} r={8} />
            <AyakAnahtari c={c} x={x + w * 0.73} y={ayakY} r={8} />
            {c.t && (
              <>
                <Yazi x={x + w * 0.27} y={ayakY + 17} boy={3.4} renk={baski} ara={0.8}>
                  AÇ / KAPA
                </Yazi>
                <Yazi x={x + w * 0.73} y={ayakY + 17} boy={3.4} renk={baski} ara={0.8}>
                  TEMPO
                </Yazi>
              </>
            )}
          </>
        ) : (
          <AyakAnahtari c={c} x={x + w / 2} y={ayakY} r={s.govde === "mini" ? 7.5 : 8.5} />
        )}
      </Kutu>
    </g>
  );
}

/** Yuvarlak gövde fuzz: krom çember içinde boyalı (çekiç) tepe, iki düğme üstte */
function Yuvarlak({ c, r, v, etiket, s }: P & { s: Stil }) {
  const { u } = c;
  const cx = 70;
  const cy = 66;
  const R = 58;
  const baski = baskiRengi(r);
  const dugmeler = CIZIMLER["fuzz-yuvarlak"].dugmeler;
  return (
    <g style={{ color: baski }}>
      <defs>
        <radialGradient id={`${u}yt`} cx="0.38" cy="0.32" r="0.8">
          <stop offset="0" stopColor={acik(r, 0.2)} />
          <stop offset="0.6" stopColor={r} />
          <stop offset="1" stopColor={koyu(r, 0.3)} />
        </radialGradient>
      </defs>
      <ellipse cx={cx + 3} cy={cy + 14} rx={R + 2} ry={R} fill="#000" opacity={0.35} filter={c.t ? `url(#${u}f-bulanik)` : undefined} />
      <YanJak c={c} x={cx + R} y={cy - 6} yon={1} />
      <YanJak c={c} x={cx - R} y={cy - 6} yon={-1} />
      {/* yan duvar (krom bant) ve tepe */}
      <ellipse cx={cx} cy={cy + 8} rx={R} ry={R} fill={`url(#${u}krom)`} />
      <ellipse cx={cx} cy={cy + 8} rx={R} ry={R} fill="#000" opacity={0.25} />
      <circle cx={cx} cy={cy} r={R} fill={`url(#${u}kromR)`} />
      <circle cx={cx} cy={cy} r={R - 4} fill={`url(#${u}yt)`} filter={yuzey(c, s.yuzey)} />
      {!c.t && <circle cx={cx} cy={cy} r={R - 4} fill="none" stroke="#fff" strokeOpacity={0.25} />}
      {[
        [cx - 22, cy - 30],
        [cx + 22, cy - 30],
      ].map(([x, y], i) => (
        <Dugme key={i} c={c} x={x} y={y} r={10.5} v={v[i] ?? 5} tur={s.dugme} isaret={etiketYaz(dugmeler[i])} />
      ))}
      <Led c={c} x={cx} y={cy - 36} renk={s.led} r={2.2} />
      <Logo c={c} x={cx} y={cy + 4} w={80} etiket={etiket} tur={s.tur} renk={baski} font={s.font} italik={s.italik} />
      <AyakAnahtari c={c} x={cx} y={cy + 32} r={9} />
    </g>
  );
}

/** Akort pedalı: büyük ışıklı ibre ekranı */
function Tuner({ c, r, etiket }: P) {
  const baski = baskiRengi(r);
  const sapma = 0;
  return (
    <g style={{ color: baski }}>
      <Kutu c={c} r={r} x={10} y={8} w={80} h={138} rx={8} yz="mat">
        <rect x={17} y={16} width={66} height={56} rx={5} fill="#030405" stroke="#000" />
        <rect x={19} y={18} width={62} height={52} rx={4} fill={c.on ? "#061410" : "#08090a"} />
        {Array.from({ length: 13 }, (_, i) => {
          const orta = i === 6;
          const yan = Math.abs(6 - i);
          const yanik = c.on && (orta || yan > 3 - sapma);
          return <rect key={i} x={23.5 + i * 4.3} y={orta ? 24 : 26 + yan * 0.5} width={2.8} height={orta ? 18 : 14 - yan * 0.6} rx={0.9} fill={orta ? (c.on ? "#38f07a" : "#163a24") : yanik ? (i < 6 ? "#ff9f0a" : "#ff453a") : "#1b2621"} opacity={orta || !c.on ? 1 : 0.35} />;
        })}
        <Yazi x={50} y={63} boy={15} renk={c.on ? "#38f07a" : "#163a24"} font="mono" kalin={700}>
          A
        </Yazi>
        <rect x={19} y={18} width={62} height={52} rx={4} fill={`url(#${c.u}cam)`} />
        <Led c={c} x={50} y={84} renk="#2fd158" r={2.4} />
        <Logo c={c} x={50} y={100} w={70} etiket={etiket} tur="TUNER" renk={baski} />
        <AyakAnahtari c={c} x={50} y={124} r={8.5} />
      </Kutu>
    </g>
  );
}

/** 5 bant EQ: kaydırıcılar */
function EqPedal({ c, r, v, etiket }: P) {
  const baski = baskiRengi(r);
  const bantlar = ["100", "300", "1K", "3K", "8K"];
  return (
    <g style={{ color: baski }}>
      <Kutu c={c} r={r} x={10} y={8} w={80} h={138} rx={8} yz="firca">
        {c.t && <path d="M18 51 H82" stroke={baski} strokeOpacity={0.4} strokeWidth={0.5} strokeDasharray="1.2 1.6" />}
        {bantlar.map((b, i) => {
          const x = 22 + i * 14;
          const y = 76 - (sinirV(v[i]) / 10) * 52;
          return (
            <g key={b}>
              <rect x={x - 1.8} y={20} width={3.6} height={60} rx={1.8} fill="#07080a" />
              <rect x={x - 6} y={y - 4} width={12} height={8} rx={1.4} fill={`url(#${c.u}krom)`} stroke="#3d4147" strokeWidth={0.5} />
              <line x1={x - 5} x2={x + 5} y1={y} y2={y} stroke="#15171a" strokeWidth={1} />
              {c.t && (
                <Yazi x={x} y={88} boy={3.6} renk={baski}>
                  {b}
                </Yazi>
              )}
            </g>
          );
        })}
        <Led c={c} x={50} y={96} renk="#ff2a1f" r={2.2} />
        <Logo c={c} x={50} y={108} w={70} etiket={etiket} tur="EQ" renk={baski} />
        <AyakAnahtari c={c} x={50} y={127} r={8} />
      </Kutu>
    </g>
  );
}
const sinirV = (x: number | undefined) => Math.max(0, Math.min(10, x ?? 5));

/** Looper: kayıt halkası ve büyük anahtar */
function Looper({ c, r, v, etiket }: P) {
  const baski = baskiRengi(r);
  return (
    <g style={{ color: baski }}>
      <Kutu c={c} r={r} x={8} y={8} w={114} h={138} rx={10} yz="metalik">
        <Dugme c={c} x={32} y={36} r={10} v={v[0] ?? 5} tur="krom" isaret="SEVİYE" />
        <circle cx={86} cy={40} r={22} fill="#060708" stroke="#000" />
        {Array.from({ length: 28 }, (_, i) => {
          const t = (i / 28) * Math.PI * 2 - Math.PI / 2;
          const yanik = c.on && i < 18;
          return <circle key={i} cx={86 + Math.cos(t) * 16.5} cy={40 + Math.sin(t) * 16.5} r={1.7} fill={yanik ? (i < 11 ? "#38f07a" : "#ff453a") : "#202226"} />;
        })}
        <circle cx={86} cy={40} r={8} fill={c.on ? "#ff453a" : "#3a1515"} />
        {c.on && <circle cx={86} cy={40} r={14} fill="#ff453a" opacity={0.18} />}
        <circle cx={86} cy={40} r={22} fill={`url(#${c.u}cam)`} />
        <Logo c={c} x={65} y={84} w={100} etiket={etiket} tur="LOOPER" renk={baski} font="retro" />
        <AyakAnahtari c={c} x={65} y={122} r={10} />
      </Kutu>
    </g>
  );
}

/** Basma pedallı (wah, volüm): döküm gövde, kauçuk basma yüzeyi; konuma göre yüzey öne/arkaya yatar */
function Basma({ c, r, v, etiket, wah }: P & { wah: boolean }) {
  const { u } = c;
  const k = sinirV(v[0]) / 10;
  const ustY = 26 - k * 12;
  const baski = baskiRengi(r);
  return (
    <g style={{ color: baski }}>
      <defs>
        <linearGradient id={`${u}bg`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={koyu(r, 0.4)} />
          <stop offset="0.2" stopColor={acik(r, 0.12)} />
          <stop offset="0.8" stopColor={r} />
          <stop offset="1" stopColor={koyu(r, 0.45)} />
        </linearGradient>
        <pattern id={`${u}kauc`} width={6} height={4} patternUnits="userSpaceOnUse">
          <rect width={6} height={4} fill="#141518" />
          <rect y={0.6} width={6} height={1.7} rx={0.85} fill="#2b2d32" />
          <rect y={0.6} width={6} height={0.5} fill="#3d4046" />
        </pattern>
      </defs>
      <rect x={14} y={176} width={78} height={14} rx={6} fill="#000" opacity={0.35} filter={c.t ? `url(#${u}f-bulanik)` : undefined} />
      <YanJak c={c} x={88} y={110} yon={1} />
      <YanJak c={c} x={16} y={110} yon={-1} />
      {/* taban gövde */}
      <path d="M16 20 Q16 10 28 10 H76 Q88 10 88 20 V178 Q88 188 76 188 H28 Q16 188 16 178 Z" fill={`url(#${u}bg)`} filter={yuzey(c, "cekic")} />
      <path d="M16 170 V178 Q16 188 28 188 H76 Q88 188 88 178 V170 Z" fill="#000" opacity={0.3} />
      {/* basma yüzeyi */}
      <path d={`M20 ${ustY + 6} Q20 ${ustY} 28 ${ustY} H76 Q84 ${ustY} 84 ${ustY + 6} V168 Q84 174 76 174 H28 Q20 174 20 168 Z`} fill={`url(#${u}bg)`} filter={yuzey(c, "cekic")} />
      <rect x={26} y={ustY + 10} width={52} height={150 - ustY} rx={5} fill={`url(#${u}kauc)`} stroke="#000" strokeOpacity={0.6} />
      <rect x={26} y={ustY + 10} width={52} height={(150 - ustY) * 0.4} rx={5} fill="#fff" opacity={0.05 + (1 - k) * 0.05} />
      <rect x={20} y={164} width={64} height={10} rx={3} fill="#000" opacity={0.18 + k * 0.25} />
      {/* yan menteşe */}
      {[18, 86].map((x) => (
        <circle key={x} cx={x} cy={150} r={3.4} fill={`url(#${u}kromR)`} stroke="#3d4147" strokeWidth={0.4} />
      ))}
      {c.t && (
        <g>
          <rect x={34} y={177} width={36} height={9} rx={1.5} fill={koyu(r, 0.35)} />
          <Yazi x={52} y={184} boy={5.6} renk={baskiRengi(koyu(r, 0.35))} font="retro" kalin={800} ara={0.8}>
            {(etiket ?? (wah ? "WAH" : "VOLÜM")).toLocaleUpperCase("tr")}
          </Yazi>
        </g>
      )}
      <Led c={c} x={52} y={wah ? ustY + 4 : 16} renk={wah ? "#ff2a1f" : "#2fd158"} r={1.8} />
    </g>
  );
}

export function PedalCizimi({ cizim, c, r, v, etiket }: P & { cizim: Cizim }) {
  const [w] = pedalBoyutu(cizim);
  let ic: ReactNode;
  switch (cizim) {
    case "tuner":
      ic = <Tuner c={c} r={r} v={v} etiket={etiket} />;
      break;
    case "eq":
      ic = <EqPedal c={c} r={r} v={v} etiket={etiket} />;
      break;
    case "looper":
      ic = <Looper c={c} r={r} v={v} etiket={etiket} />;
      break;
    case "wah":
    case "volum":
      ic = <Basma c={c} r={r} v={v} etiket={etiket} wah={cizim === "wah"} />;
      break;
    default: {
      const s = PEDAL_STIL[cizim] ?? PEDAL_STIL.overdrive!;
      ic = s.govde === "yuvarlak" ? <Yuvarlak c={c} r={r} v={v} etiket={etiket} s={s} /> : <KutuPedal c={c} r={r} v={v} etiket={etiket} cizim={cizim} s={s} />;
    }
  }
  return (
    <>
      <Tanimlar c={c} o={w / 100} seed={cizim.length * 7} />
      {ic}
    </>
  );
}

