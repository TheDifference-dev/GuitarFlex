// Pedal çizimleri: döküm alüminyum kutu (üstten, ön duvarı görünen hafif perspektif), boyalı yüzey dokusu, düğmeler,
// LED, ayak anahtarı, yan jaklar. Türlerin klasik görünüşünden yola çıkan ÖZGÜN çizimlerdir; düğme dizilimi, renk ve
// yazı yerleşimi hiçbir ürünü birebir kopyalamaz. Kitaplık modelinde GuitarFlex adı, kullanıcı ekipmanında tür adı basılır.
import type { ReactNode } from "react";
import { CIZIMLER, type Cizim, type Gorunum, type PedalGovde } from "@/lib/rig-cekirdek";
import { AyakAnahtari, Anahtar, Dugme, Led, Tanimlar, Vida, YanJak, Yazi, Yipranma, acik, asinmaMaskesi, baskiRengi, etiketYaz, koyu, rastgele, yuvarla, yuzey, type Ctx, type DugmeTur, type Yuzey } from "./temel";

type Govde = PedalGovde;
type Duzen = "sira" | "ucgen" | "ts";

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
  /** Ayak anahtarı: yuvarlak basma düğmesi (varsayılan) ya da alt yarıyı kaplayan menteşeli basma plakası */
  ayak?: "dugme" | "plaka";
};

export const PEDAL_STIL: Partial<Record<Cizim, Stil>> = {
  overdrive: { govde: "kutu", yuzey: "metalik", dugme: "siyah", led: "#ff2a1f", tur: "OVERDRIVE", font: "sans", duzen: "ts", ayak: "plaka" },
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
const govdeBoyutu: Record<Govde, [number, number]> = { kutu: [100, 160], genis: [150, 152], mini: [72, 160], yuvarlak: [140, 146], cift: [122, 160], yatay: [186, 146], coklu: [224, 150] };
/** Modelin stili: çizim türününki, modelin görünüş sapmalarıyla */
const stilBul = (cizim: Cizim, g?: Gorunum): Stil | undefined => {
  const s = PEDAL_STIL[cizim];
  if (!s || !g) return s;
  const p = g.pedal ?? {};
  return {
    ...s,
    ...(g.govde ? { govde: g.govde } : {}),
    ...(p.dugme ? { dugme: p.dugme } : {}),
    ...(p.dugmeRenk ? { dugmeRenk: p.dugmeRenk } : {}),
    ...(p.yuzey ? { yuzey: p.yuzey } : {}),
    ...(p.bant !== undefined ? { bant: p.bant || undefined } : {}),
    ...(p.ayak ? { ayak: p.ayak } : {}),
    ...(p.ekran !== undefined ? { ekran: p.ekran } : {}),
    ...(p.duzen ? { duzen: p.duzen } : {}),
    ...(p.font ? { font: p.font } : {}),
    ...(p.italik !== undefined ? { italik: p.italik } : {}),
    ...(p.ledRenk ? { led: p.ledRenk } : {}),
    ...(p.vidali !== undefined ? { vidali: p.vidali } : {}),
  };
};
/** Ayak anahtarının yarıçapı (yıpranma izi için) */
const AYAK_R = 8.5;
export const pedalBoyutu = (cizim: Cizim, g?: Gorunum): [number, number] =>
  cizim === "eq" && g?.govde === "genis" ? govdeBoyutu.genis : cizim === "looper" && g?.govde === "coklu" ? govdeBoyutu.coklu : PEDAL_BOYUT[cizim] ?? govdeBoyutu[stilBul(cizim, g)?.govde ?? "kutu"];

type P = { c: Ctx; r: string; v: number[]; etiket?: string };
/** Modelin kontrol düzeni: düğme adları ve kollu anahtarlar */
type M = { adlar: string[]; anahtarlar: string[] };

// ── Ortak gövde ──

/** Kutu gövde: ön duvar, yan jaklar, DC girişi, boyalı üst yüz. Sonra `children` (üst yüz öğeleri). */
function Kutu({ c, r, x, y, w, h, rx = 7, yz, children, ayak, bant, jaklar = "yan", malzeme = "boya" }: { c: Ctx; r: string; x: number; y: number; w: number; h: number; rx?: number; yz: Yuzey; children?: ReactNode; ayak?: [number, number, number]; bant?: [number, number, number, number]; jaklar?: "yan" | "arka"; malzeme?: "boya" | "aluminyum" }) {
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
      {jaklar === "yan" ? (
        <>
          <YanJak c={c} x={x + w} y={y + h * 0.33} yon={1} />
          <YanJak c={c} x={x} y={y + h * 0.33} yon={-1} />
        </>
      ) : (
        // arka kenarda üç jak (giriş, iki çıkış): yalnız somunları görünür
        [0.2, 0.32, 0.44].map((q) => (
          <g key={q}>
            <rect x={x + w * q - 3.6} y={y - 3.4} width={7.2} height={4.4} rx={1} fill={`url(#${u}krom)`} stroke="#4a4e55" strokeWidth={0.3} />
            <rect x={x + w * q - 2.2} y={y - 4.6} width={4.4} height={1.6} fill="#2b2e33" />
          </g>
        ))
      )}
      {/* ön duvar */}
      <rect x={x} y={y + h - rx * 2} width={w} height={rx * 2 + duvar} rx={rx} fill={`url(#${id}d)`} />
      <path d={`M${x + rx} ${y + h + duvar - 0.6} H${x + w - rx}`} stroke="#000" strokeOpacity={0.5} strokeWidth={1.2} />
      {c.z !== undefined && <CirtIzi c={c} x={x} y={y + h + duvar - 3.4} w={w} />}
      {/* üst yüz */}
      <rect x={x} y={y} width={w} height={h} rx={rx} fill={`url(#${id})`} filter={yuzey(c, yz)} />
      {!c.t && <rect x={x + 0.6} y={y + 0.6} width={w - 1.2} height={h - 1.2} rx={rx - 0.5} fill="none" stroke="#fff" strokeOpacity={0.22} strokeWidth={1} />}
      {!c.t && <rect x={x} y={y} width={w} height={h} rx={rx} fill="none" stroke={koyu(r, 0.6)} strokeWidth={0.6} />}
      {malzeme === "boya" ? (
        <Yipranma c={c} x={x} y={y} w={w} h={h} rx={rx} tur="boya" renk={r} anahtar="ust" ayak={ayak} bant={bant} />
      ) : (
        // çıplak alüminyum: boya yok; matlaşma, oksit lekesi ve çizik
        <>
          <Yipranma c={c} x={x} y={y} w={w} h={h} rx={rx} tur="panel" renk={r} taban="#5c584e" anahtar="alu" />
          <Yipranma c={c} x={x} y={y} w={w} h={h} rx={rx} tur="boya" renk={r} taban="#e9ebee" anahtar="alu-kenar" siddet={0.5} bant={bant} />
        </>
      )}
      {children}
    </g>
  );
}

/** Gövdenin altından taşan eski cırt cırt (velcro) kalıntısı: ön duvarın dibinde kısa, tüylü koyu şerit */
function CirtIzi({ c, x, y, w }: { c: Ctx; x: number; y: number; w: number }) {
  const rs = rastgele((c.z ?? 0) ^ 0x7e1c);
  if (rs() > 0.8) return null;
  const x0 = yuvarla(x + w * (0.08 + rs() * 0.25));
  const gw = yuvarla(w * (0.3 + rs() * 0.35));
  return (
    <g>
      <rect x={x0} y={y} width={gw} height={2.6} rx={0.6} fill="#161616" opacity={0.92} />
      {c.t && Array.from({ length: Math.floor(gw / 1.3) }, (_, i) => <circle key={i} cx={yuvarla(x0 + 0.6 + i * 1.3)} cy={yuvarla(y + 0.5 + rs() * 1.6)} r={0.35} fill="#3a3a3a" />)}
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
    <g mask={asinmaMaskesi(c)}>
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
  // iki büyük düğme üst köşelerde, küçük ton düğmesi ortada biraz aşağıda
  if (n === 3 && duzen === "ts") return [[x0 + w * 0.23, y, w * 0.13], [orta, y + w * 0.11, w * 0.075], [x0 + w * 0.77, y, w * 0.13]];
  if (n === 3 && duzen === "ucgen") return [[x0 + w * 0.24, y - 2, w * 0.11], [x0 + w * 0.76, y - 2, w * 0.11], [orta, y + w * 0.2, w * 0.085]];
  if (n === 3) return [0.2, 0.5, 0.8].map((q) => [x0 + w * q, y, w * 0.1] as [number, number, number]);
  if (n === 4) return [0.16, 0.39, 0.61, 0.84].map((q) => [x0 + w * q, y, w * 0.08] as [number, number, number]);
  if (n === 6)
    return [
      ...[0.2, 0.5, 0.8].map((q) => [x0 + w * q, y - 3, w * 0.075] as [number, number, number]),
      ...[0.2, 0.5, 0.8].map((q) => [x0 + w * q, y + w * 0.2, w * 0.075] as [number, number, number]),
    ];
  return [
    ...[0.2, 0.5, 0.8].map((q) => [x0 + w * q, y - 3, w * 0.085] as [number, number, number]),
    ...[0.35, 0.65].map((q) => [x0 + w * q, y + w * 0.22, w * 0.075] as [number, number, number]),
  ];
}

// ── Genel kutu pedal ──

function KutuPedal({ c, r, v, etiket, s, adlar: dugmeler, anahtarlar, ledUst = false }: P & M & { s: Stil; ledUst?: boolean }) {
  const [W] = govdeBoyutu[s.govde];
  const baski = s.bant ? baskiRengi(s.bant) : baskiRengi(r);
  const { x, y, w, h } = s.govde === "genis" ? { x: 8, y: 8, w: W - 16, h: 128 } : s.govde === "mini" ? { x: 11, y: 8, w: W - 22, h: 138 } : s.govde === "cift" ? { x: 8, y: 8, w: W - 16, h: 138 } : { x: 10, y: 8, w: W - 20, h: 138 };
  const plaka = s.ayak === "plaka" && s.govde === "kutu";
  const knobY = s.govde === "genis" ? 34 : s.ekran ? 58 : plaka ? 30 : 32;
  const yerler = dugmeYerleri(dugmeler.length, x, w, knobY, s.duzen);
  const iki = s.govde === "cift";
  const ayakY = y + h - (s.govde === "genis" ? 24 : 22);
  // basma plakası: gövdenin alt yarısı (menteşe üst kenarında)
  const plakaY = y + h * 0.565;
  const logoY = plaka ? 72 : s.govde === "genis" ? (anahtarlar.length ? 79 : 74) : s.govde === "mini" ? 82 : iki ? 96 : dugmeler.length >= 5 ? 92 : 84;
  const ledY = ledUst ? knobY - 2 : plaka ? 55 : iki ? ayakY - 18 : s.govde === "mini" ? y + 58 : s.govde === "genis" ? ayakY - 17 : ayakY - 21;
  const ayak: [number, number, number] = plaka ? [x + w / 2, plakaY + (y + h - plakaY) * 0.55, 14] : [x + w / 2, ayakY, AYAK_R];
  return (
    <g style={{ color: baski }}>
      <Kutu c={c} r={r} x={x} y={y} w={w} h={h} rx={s.govde === "mini" ? 6 : 8} yz={s.yuzey} ayak={iki ? undefined : ayak} bant={plaka ? [x + w / 2, y + h - 30, w * 0.5, -4] : s.govde === "kutu" && !s.ekran ? [x + w / 2, knobY + (dugmeler.length >= 4 ? 30 : 22), w * 0.55, 3] : [x + w * 0.82, y + 9, w * 0.4, 38]}>
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
          <Dugme key={i} c={c} x={dx} y={dy} r={dr} v={v[i] ?? 5} tur={s.dugme} renk={s.dugmeRenk} isaret={etiketYaz(dugmeler[i])} isaretBoy={Math.min(dr * 0.42, 4.2, (w / Math.max(3, yerler.length)) * 1.45 / Math.max(5, dugmeler[i].length))} />
        ))}
        {anahtarlar.length
          ? anahtarlar.map((a, i) => {
              // modelin kollu anahtarları: düğmelerin altında eşit aralıkla, adları altında
              const ax = x + (w * (i + 1)) / (anahtarlar.length + 1);
              const ay = knobY + (dugmeler.length >= 5 ? 26 : 19);
              return (
                <g key={a}>
                  <Anahtar c={c} x={ax} y={ay} r={2.2} ust={i % 2 === 0} />
                  {c.t && (
                    <g mask={asinmaMaskesi(c)}>
                      <Yazi x={ax} y={ay + 9.5} boy={Math.min(3.4, (w / anahtarlar.length) * 1.5 / Math.max(6, a.length))} renk={baski} ara={0.3}>
                        {etiketYaz(a)}
                      </Yazi>
                    </g>
                  )}
                </g>
              );
            })
          : s.anahtar && <Anahtar c={c} x={x + w / 2} y={dugmeler.length >= 5 ? knobY + 12 : knobY + 20} r={2.4} ust={(v[0] ?? 5) >= 5} />}
        <Led c={c} x={x + w / 2} y={ledY} renk={s.led} r={s.govde === "mini" ? 2.2 : ledUst ? 2.2 : 2.5} />
        <Logo c={c} x={x + w / 2} y={logoY} w={w - 8} etiket={etiket} tur={s.tur} renk={baski} font={s.font} italik={s.italik} bant={s.bant} />
        {plaka ? (
          <BasmaPlakasi c={c} r={r} x={x + 3.5} y={plakaY} w={w - 7} h={y + h - plakaY - 4} />
        ) : iki ? (
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
          <AyakAnahtari c={c} x={x + w / 2} y={ayakY} r={s.govde === "mini" ? 7.5 : AYAK_R} />
        )}
      </Kutu>
    </g>
  );
}

/** Menteşeli basma plakası: gövde rengi, üst kenarda menteşe çizgisi, altta kauçuk tırtıklı şerit; basıldıkça ortası parlar */
function BasmaPlakasi({ c, r, x, y, w, h }: { c: Ctx; r: string; x: number; y: number; w: number; h: number }) {
  const { u } = c;
  return (
    <g>
      <defs>
        <linearGradient id={`${u}bp`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={acik(r, 0.1)} />
          <stop offset="0.6" stopColor={r} />
          <stop offset="1" stopColor={koyu(r, 0.18)} />
        </linearGradient>
      </defs>
      {/* plaka ile gövde arasındaki ince boşluk */}
      <rect x={x - 0.9} y={y - 0.9} width={w + 1.8} height={h + 1.8} rx={4.6} fill={koyu(r, 0.65)} />
      <rect x={x} y={y} width={w} height={h} rx={4} fill={`url(#${u}bp)`} filter={yuzey(c, "metalik")} />
      {/* menteşe: üst kenarda iki pim ve gölge */}
      <rect x={x + 2} y={y + 0.6} width={w - 4} height={1.2} fill="#000" opacity={0.22} />
      {[x + 5, x + w - 5].map((mx) => (
        <rect key={mx} x={mx - 2.2} y={y - 1.4} width={4.4} height={2.6} rx={1} fill={`url(#${u}krom)`} stroke="#4a4e55" strokeWidth={0.25} />
      ))}
      {/* kauçuk şerit */}
      <rect x={x + 4} y={y + h - 13} width={w - 8} height={9} rx={2} fill="#131416" />
      {c.t &&
        Array.from({ length: Math.floor((w - 10) / 2.2) }, (_, i) => <rect key={i} x={x + 5.2 + i * 2.2} y={y + h - 12} width={1.1} height={7} rx={0.5} fill="#2c2e33" />)}
      <rect x={x} y={y} width={w} height={h} rx={4} fill="none" stroke="#fff" strokeOpacity={0.18} strokeWidth={0.6} />
      <Yipranma c={c} x={x} y={y} w={w} h={h - 13} rx={4} tur="boya" renk={r} anahtar="plaka" siddet={0.6} ayak={[x + w / 2, y + h * 0.42, 12]} />
    </g>
  );
}

/**
 * Geniş, yatay, çıplak alüminyum gövdeli analog delay (büyük kutu dönemi): üst sırada dört düğme, altında küçük modülasyon
 * düğmesi, iki konumlu anahtar ve iki LED (aşırı yük, açık); ad bloğu solda, ayak anahtarı sağ altta; jaklar arka kenarda.
 * Baskı siyah, ince kırmızı çizgiler; marka yazısı ve grafiği yok.
 */
function YatayPedal({ c, r, v, etiket, adlar, anahtarlar, s }: P & M & { s: Stil }) {
  const [W] = govdeBoyutu.yatay;
  const x = 8;
  const y = 8;
  const w = W - 16;
  const h = 124;
  const baski = "#141414";
  const kirmizi = "#b3261e";
  const mask = asinmaMaskesi(c);
  const ust = adlar.slice(0, 4);
  const ayak: [number, number, number] = [x + w * 0.81, y + h - 25, 9];
  return (
    <g style={{ color: baski }}>
      <Kutu c={c} r={r} x={x} y={y} w={w} h={h} rx={5} yz="firca" jaklar="arka" malzeme="aluminyum" ayak={ayak} bant={[x + w * 0.9, y + 9, w * 0.26, 36]}>
        {/* köşe vidaları (alt kapak vidaları üstten de görünür) */}
        {[x + 4.5, x + w - 4.5].map((vx) => [y + 4.5, y + h - 4.5].map((vy) => <Vida key={`${vx}${vy}`} c={c} x={vx} y={vy} r={1.4} d={vx * 5 + vy} />))}
        {/* baskı çizgileri */}
        <g mask={mask}>
          <line x1={x + 9} x2={x + w - 9} y1={y + 50} y2={y + 50} stroke={kirmizi} strokeWidth={0.6} />
          <line x1={x + 9} x2={x + w * 0.64} y1={y + 82} y2={y + 82} stroke={kirmizi} strokeWidth={0.6} />
        </g>
        {ust.map((a, i) => (
          <Dugme key={a} c={c} x={x + w * (0.14 + i * 0.24)} y={y + 30} r={9.6} v={v[i] ?? 5} tur="siyah" isaret={etiketYaz(a)} isaretBoy={Math.min(4, (w * 0.24 * 1.35) / Math.max(5, a.length))} />
        ))}
        {adlar[4] && <Dugme c={c} x={x + w * 0.14} y={y + 66} r={7} v={v[4] ?? 5} tur="siyah" isaret={etiketYaz(adlar[4])} isaretBoy={3.3} />}
        {anahtarlar[0] && (
          <g>
            <Anahtar c={c} x={x + w * 0.36} y={y + 66} r={2.3} ust={(v[4] ?? 5) >= 5} />
            {c.t && (
              <g mask={mask}>
                <Yazi x={x + w * 0.36} y={y + 61.4 - 6} boy={2.9} renk={baski} ara={0.3}>
                  {etiketYaz(anahtarlar[0].split(" · ")[0])}
                </Yazi>
                <Yazi x={x + w * 0.36} y={y + 77} boy={2.9} renk={baski} ara={0.3}>
                  {etiketYaz(anahtarlar[0].split(" · ")[1] ?? "")}
                </Yazi>
              </g>
            )}
          </g>
        )}
        {/* LED'ler: aşırı yük (giriş seviyesi) ve açık */}
        <Led c={{ ...c, on: c.on && (v[0] ?? 5) > 7.5 }} x={x + w * 0.56} y={y + 66} renk="#ff9f0a" r={1.9} />
        <Led c={c} x={ayak[0]} y={y + 66} renk={s.led} r={2.3} />
        {c.t && (
          <g mask={mask}>
            <Yazi x={x + w * 0.56} y={y + 74} boy={2.6} renk={baski} ara={0.3}>
              AŞIRI YÜK
            </Yazi>
            <Yazi x={ayak[0]} y={y + 74} boy={2.6} renk={baski} ara={0.3}>
              AÇIK
            </Yazi>
          </g>
        )}
        {/* ad bloğu */}
        {c.t ? (
          <g mask={mask}>
            <Yazi x={x + 10} y={y + 100} boy={15} renk={baski} hiza="start" kalin={800} ara={-0.3}>
              {etiket ?? s.tur}
            </Yazi>
            <Yazi x={x + 10.5} y={y + 108.5} boy={3.4} renk={kirmizi} hiza="start" kalin={700} ara={0.9}>
              {etiket ? "GUITARFLEX · ANALOG DELAY" : "ANALOG DELAY"}
            </Yazi>
          </g>
        ) : (
          <rect x={x + 10} y={y + 90} width={w * 0.5} height={10} rx={1.5} fill={baski} opacity={0.75} />
        )}
        <AyakAnahtari c={c} x={ayak[0]} y={ayak[1]} r={ayak[2]} />
      </Kutu>
    </g>
  );
}

/**
 * Çok ayak anahtarlı geniş pedal (stüdyo delay / reverb, modelleme, çift loop): bir ya da iki sıra düğme, isteğe bağlı
 * ekran, altta 2–4 ayak anahtarı ve LED'leri; kollu anahtarlar düğmelerin altında.
 */
function CokluPedal({ c, r, v, etiket, s, adlar, anahtarlar, ayakSayisi }: P & M & { s: Stil; ayakSayisi: number }) {
  const [W] = govdeBoyutu.coklu;
  const x = 8;
  const y = 8;
  const w = W - 16;
  const h = 132;
  const baski = s.bant ? baskiRengi(s.bant) : baskiRengi(r);
  const mask = asinmaMaskesi(c);
  const ekranW = s.ekran ? 46 : 0;
  const n = adlar.length;
  const satir = n > 6 ? 2 : 1;
  const ilk = Math.ceil(n / satir);
  const alan = w - 12 - (ekranW ? ekranW + 6 : 0);
  const x0 = x + 6 + (ekranW ? ekranW + 6 : 0);
  const adim = alan / Math.max(ilk, 3);
  const dr = Math.min(8.2, adim * 0.3);
  const knob = (i: number): [number, number] => {
    const sira = i < ilk ? 0 : 1;
    const k = sira ? i - ilk : i;
    const adet = sira ? n - ilk : ilk;
    return [yuvarla(x0 + alan / 2 + (k - (adet - 1) / 2) * adim), y + 22 + sira * 27];
  };
  const ayakY = y + h - 20;
  const ayakN = Math.max(1, Math.min(4, ayakSayisi));
  const ayaklar = Array.from({ length: ayakN }, (_, i) => yuvarla(x + (w * (i + 0.5)) / ayakN));
  const logoY = y + (satir === 2 ? 80 : 62);
  return (
    <g style={{ color: baski }}>
      <Kutu c={c} r={r} x={x} y={y} w={w} h={h} rx={6} yz={s.yuzey} jaklar="arka" ayak={[ayaklar[0], ayakY, 8]}>
        {s.ekran && (
          <g>
            <rect x={x + 6} y={y + 9} width={ekranW} height={26} rx={2.5} fill="#050607" stroke={koyu(r, 0.6)} strokeWidth={0.8} />
            <rect x={x + 8} y={y + 11} width={ekranW - 4} height={22} rx={1.5} fill={c.on ? "#0b1d2c" : "#0b0d10"} />
            {c.on && (
              <Yazi x={x + 6 + ekranW / 2} y={y + 26} boy={9} renk="#7fd8ff" font="mono" kalin={700}>
                {String(100 + Math.round((v[0] ?? 5) * 61))}
              </Yazi>
            )}
            <rect x={x + 8} y={y + 11} width={ekranW - 4} height={22} rx={1.5} fill={`url(#${c.u}cam)`} />
          </g>
        )}
        {adlar.map((a, i) => {
          const [kx, ky] = knob(i);
          return <Dugme key={a + i} c={c} x={kx} y={ky} r={dr} v={v[i] ?? 5} tur={s.dugme} renk={s.dugmeRenk} isaret={etiketYaz(a)} isaretBoy={Math.min(3.2, (adim * 0.92) / (Math.max(4, a.length) * 0.74))} />;
        })}
        {anahtarlar.map((a, i) => {
          const ax = yuvarla(x + w * 0.56 + i * 16);
          const ay = logoY - 4;
          return (
            <g key={a + i}>
              <Anahtar c={c} x={ax} y={ay} r={1.9} ust={i % 2 === 0} />
              {c.t && (
                <g mask={mask}>
                  <Yazi x={ax} y={ay + 8} boy={2.6} renk={baski} ara={0.2}>
                    {etiketYaz(a)}
                  </Yazi>
                </g>
              )}
            </g>
          );
        })}
        <Logo c={c} x={x + w * 0.27} y={logoY} w={w * 0.46} etiket={etiket} tur={s.tur} renk={baski} font={s.font} italik={s.italik} bant={s.bant} />
        {ayaklar.map((ax, i) => (
          <g key={ax}>
            <Led c={{ ...c, on: c.on && i === 0 }} x={ax} y={ayakY - 14} renk={s.led} r={1.9} />
            <AyakAnahtari c={c} x={ax} y={ayakY} r={7.5} />
          </g>
        ))}
      </Kutu>
    </g>
  );
}

/** Yuvarlak gövde fuzz: krom çember içinde boyalı (çekiç) tepe, iki düğme üstte */
function Yuvarlak({ c, r, v, etiket, s, adlar: dugmeler }: P & M & { s: Stil }) {
  const { u } = c;
  const cx = 70;
  const cy = 66;
  const R = 58;
  const baski = baskiRengi(r);
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
        <Dugme key={i} c={c} x={x} y={y} r={10.5} v={v[i] ?? 5} tur={s.dugme} isaret={etiketYaz(dugmeler[i] ?? "")} />
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
function EqPedal({ c, r, v, etiket, adlar, genis }: P & { adlar: string[]; genis?: boolean }) {
  const baski = baskiRengi(r);
  // bant adları modelden ("Bas", "100"…): sürgünün altına kısaltılmış yazılır
  const bantlar = (adlar.length ? adlar : ["100", "300", "1K", "3K", "8K"]).map((a) => (a.length > 4 ? `${a.slice(0, 3)}.` : a));
  const W = genis ? 134 : 80;
  const adim = (W - 16) / bantlar.length;
  return (
    <g style={{ color: baski }}>
      <Kutu c={c} r={r} x={8} y={8} w={W} h={138} rx={8} yz="firca" ayak={[8 + W / 2, 135, 8]}>
        {c.t && <path d={`M14 51 H${W + 2}`} stroke={baski} strokeOpacity={0.4} strokeWidth={0.5} strokeDasharray="1.2 1.6" />}
        {bantlar.map((b, i) => {
          const x = 16 + adim * (i + 0.5);
          const y = 76 - (sinirV(v[i]) / 10) * 52;
          return (
            <g key={b}>
              <rect x={x - 1.8} y={20} width={3.6} height={60} rx={1.8} fill="#07080a" />
              <rect x={x - Math.min(6, adim * 0.42)} y={y - 4} width={Math.min(12, adim * 0.84)} height={8} rx={1.4} fill={`url(#${c.u}krom)`} stroke="#3d4147" strokeWidth={0.5} />
              <line x1={x - Math.min(5, adim * 0.35)} x2={x + Math.min(5, adim * 0.35)} y1={y} y2={y} stroke="#15171a" strokeWidth={1} />
              {c.t && (
                <Yazi x={x} y={88} boy={Math.min(3.6, adim * 0.36)} renk={baski}>
                  {b}
                </Yazi>
              )}
            </g>
          );
        })}
        <Led c={c} x={genis ? 18 : 8 + W / 2} y={genis ? 104 : 96} renk="#ff2a1f" r={2.2} />
        <Logo c={c} x={8 + W / 2} y={108} w={W - 10} etiket={etiket} tur="EQ" renk={baski} />
        <AyakAnahtari c={c} x={8 + W / 2} y={127} r={8} />
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
          return <circle key={i} cx={yuvarla(86 + Math.cos(t) * 16.5)} cy={yuvarla(40 + Math.sin(t) * 16.5)} r={1.7} fill={yanik ? (i < 11 ? "#38f07a" : "#ff453a") : "#202226"} />;
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

export function PedalCizimi({ cizim, c, r, v, etiket, adlar = CIZIMLER[cizim]?.dugmeler ?? [], anahtarlar = [], gorunum }: P & Partial<M> & { cizim: Cizim; gorunum?: Gorunum }) {
  const [w] = pedalBoyutu(cizim, gorunum);
  let ic: ReactNode;
  switch (cizim) {
    case "tuner":
      ic = <Tuner c={c} r={r} v={v} etiket={etiket} />;
      break;
    case "eq":
      ic = <EqPedal c={c} r={r} v={v} etiket={etiket} adlar={adlar} genis={gorunum?.govde === "genis"} />;
      break;
    case "looper":
      // çift izli, ekranlı looper: çok ayak anahtarlı geniş gövde
      ic =
        gorunum?.govde === "coklu" ? (
          <CokluPedal c={c} r={r} v={v} etiket={etiket} s={{ ...PEDAL_STIL["delay-dijital"]!, govde: "coklu", tur: "LOOPER", ekran: !!gorunum.pedal?.ekran, dugme: "siyah", yuzey: "metalik", led: "#ff3b30" }} adlar={adlar} anahtarlar={anahtarlar} ayakSayisi={gorunum.pedal?.ayakSayisi ?? 2} />
        ) : (
          <Looper c={c} r={r} v={v} etiket={etiket} />
        );
      break;
    case "wah":
    case "volum":
      ic = <Basma c={c} r={r} v={v} etiket={etiket} wah={cizim === "wah"} />;
      break;
    default: {
      const s = stilBul(cizim, gorunum) ?? PEDAL_STIL.overdrive!;
      ic =
        s.govde === "yuvarlak" ? (
          <Yuvarlak c={c} r={r} v={v} etiket={etiket} s={s} adlar={adlar} anahtarlar={anahtarlar} />
        ) : s.govde === "coklu" ? (
          <CokluPedal c={c} r={r} v={v} etiket={etiket} s={s} adlar={adlar} anahtarlar={anahtarlar} ayakSayisi={gorunum?.pedal?.ayakSayisi ?? 3} />
        ) : s.govde === "yatay" ? (
          <YatayPedal c={c} r={r} v={v} etiket={etiket} s={s} adlar={adlar} anahtarlar={anahtarlar} />
        ) : (
          <KutuPedal c={c} r={r} v={v} etiket={etiket} s={s} adlar={adlar} anahtarlar={anahtarlar} ledUst={gorunum?.led === "ust"} />
        );
    }
  }
  return (
    <>
      <Tanimlar c={c} o={w / 100} seed={cizim.length * 7} />
      {ic}
    </>
  );
}

