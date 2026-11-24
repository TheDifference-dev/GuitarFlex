// Rig'im çizimlerinin ortak dili. Bütün görseller özgündür ve burada SVG ile çizilir: hiçbir ürünün görseli, renderı,
// fotoğrafı ya da logosu kullanılmaz, izlenmez. Işık hep yukarıdan-soldan gelir (azimut 225°); gövdelerde kabartma,
// tolex, döküm alüminyum, çekiç boya ve fırçalanmış metal dokuları SVG filtreleriyle (feTurbulence + feDiffuseLighting /
// feSpecularLighting) üretilir. İki ayrıntı düzeyi vardır:
//   tam  (büyük panel, form): filtreler, dokular, küçük yazılar
//   ikon (zincir, kitaplık, afiş): yalnız degradeler; küçük boyutta keskin ve hafif
// Renkler düz değerdir (CSS değişkeni yok): afiş PNG'ye aktarılırken de aynı görünür.
import type { ReactNode } from "react";

// ── Renk yardımcıları ──
export function rgb(hex: string): [number, number, number] {
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
/** Zemin rengi üstünde okunur baskı (serigrafi) rengi */
export const baskiRengi = (r: string) => (parlaklik(r) > 0.36 ? "#17181a" : "#f4f1e8");

export const FONT = {
  sans: '"Inter Variable", "Helvetica Neue", Helvetica, Arial, sans-serif',
  serif: 'Georgia, "Times New Roman", Times, serif',
  retro: '"Futura", "Century Gothic", "Avenir Next", "Trebuchet MS", "Inter Variable", sans-serif',
  mono: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
};

/** Çizim bağlamı: kimlik öneki (gradyan / filtre kimlikleri), tam ayrıntı mı, cihaz açık mı, ekran ölçeği */
export type Ctx = {
  u: string;
  t: boolean;
  on: boolean;
  /** Bir çizim biriminin yaklaşık piksel karşılığı (ışık filtrelerinin eğimi buna göre ayarlanır) */
  k: number;
  /** Yıpranma tohumu (modelin kimliğinden): varsa çizim "kullanılmış" görünür; hasarın yeri bu tohumdan türer */
  z?: number;
};

export const sinir = (v: number) => Math.max(0, Math.min(10, Number.isFinite(v) ? v : 5));
/** Düğme açısı: 0 → -135°, 10 → +135° (saat yönü, tepe 0°) */
export const aci = (v: number) => -135 + (sinir(v) / 10) * 270;
const rad = (d: number) => ((d - 90) * Math.PI) / 180;
/** Trigonometri sonucu binde bire yuvarlanır: sunucu (Node) ile tarayıcı son basamakta ayrışıp hidrasyon uyuşmazlığı vermesin */
export const yuvarla = (v: number) => Math.round(v * 1000) / 1000;
export const kutup = (x: number, y: number, r: number, d: number): [number, number] => [yuvarla(x + Math.cos(rad(d)) * r), yuvarla(y + Math.sin(rad(d)) * r)];

// ── Ortak tanımlar ──

/** Yüzey dokuları: gövde filtrelerinin adları */
export type Yuzey = "metalik" | "mat" | "parlak" | "cekic" | "firca" | "tolex" | "kumas" | "plastik";

/**
 * Kabartma (eğik kenar) + yüzey dokusu filtresi. Kenar: kaynağın saydamlığı bulanıklaştırılıp üstten-soldan aydınlatılır
 * (yuvarlatılmış döküm kenarı). Doku: önce kaynak rengi değiştirilir (sonuç "renk").
 */
function GovdeFiltresi({ id, b, s, isik = 0.55, us = 20, doku }: { id: string; b: number; s: number; isik?: number; us?: number; doku?: ReactNode }) {
  return (
    <filter id={id} x="-4%" y="-4%" width="108%" height="108%" colorInterpolationFilters="sRGB">
      {doku ?? <feOffset in="SourceGraphic" dx={0} dy={0} result="renk" />}
      <feGaussianBlur in="SourceAlpha" stdDeviation={b} result="kb" />
      <feDiffuseLighting in="kb" surfaceScale={s} diffuseConstant={1} lightingColor="#ffffff" result="kd">
        <feDistantLight azimuth={225} elevation={48} />
      </feDiffuseLighting>
      <feComposite in="renk" in2="kd" operator="arithmetic" k1={1.33} k2={0} k3={0} k4={0} result="kg" />
      <feSpecularLighting in="kb" surfaceScale={s} specularConstant={isik} specularExponent={us} lightingColor="#ffffff" result="ks">
        <feDistantLight azimuth={225} elevation={40} />
      </feSpecularLighting>
      <feComposite in="ks" in2="SourceAlpha" operator="in" result="ksi" />
      <feComposite in="kg" in2="ksi" operator="arithmetic" k1={0} k2={1} k3={1} k4={0} result="kt" />
      <feComposite in="kt" in2="SourceAlpha" operator="in" />
    </filter>
  );
}

/** Doku ilkelleri (sonuç "renk") */
const dokular = {
  metalik: (f: number, seed: number) => (
    <>
      <feTurbulence type="fractalNoise" baseFrequency={f} numOctaves={1} seed={seed} result="fn" />
      <feColorMatrix in="fn" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 18 -10.6" result="fa" />
      <feColorMatrix in="fn" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -3 1.32" result="fk" />
      <feComposite in="fa" in2="SourceGraphic" operator="arithmetic" k1={0} k2={0.13} k3={1} k4={0} result="r1" />
      <feComposite in="fk" in2="r1" operator="over" result="r2" />
      <feComposite in="r2" in2="SourceAlpha" operator="in" result="renk" />
    </>
  ),
  mat: (f: number, seed: number) => (
    <>
      <feTurbulence type="fractalNoise" baseFrequency={f} numOctaves={2} seed={seed} result="mn" />
      <feColorMatrix in="mn" type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1" result="mg" />
      <feComposite in="SourceGraphic" in2="mg" operator="arithmetic" k1={0.34} k2={0.83} k3={0} k4={0} result="renk" />
    </>
  ),
  cekic: (f: number, seed: number) => (
    <>
      <feTurbulence type="fractalNoise" baseFrequency={f} numOctaves={2} seed={seed} result="cn" />
      <feDiffuseLighting in="cn" surfaceScale={0.75} diffuseConstant={1} lightingColor="#ffffff" result="cd">
        <feDistantLight azimuth={225} elevation={52} />
      </feDiffuseLighting>
      <feComposite in="SourceGraphic" in2="cd" operator="arithmetic" k1={1.22} k2={0} k3={0} k4={0} result="c1" />
      <feSpecularLighting in="cn" surfaceScale={0.75} specularConstant={0.5} specularExponent={14} lightingColor="#ffffff" result="cs">
        <feDistantLight azimuth={225} elevation={52} />
      </feSpecularLighting>
      <feComposite in="c1" in2="cs" operator="arithmetic" k1={0} k2={1} k3={0.42} k4={0} result="renk" />
    </>
  ),
  firca: (f: number, seed: number) => (
    <>
      <feTurbulence type="fractalNoise" baseFrequency={`${(f * 0.006).toFixed(4)} ${f}`} numOctaves={2} seed={seed} result="bn" />
      <feColorMatrix in="bn" type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1" result="bg" />
      <feComposite in="SourceGraphic" in2="bg" operator="arithmetic" k1={0.36} k2={0.82} k3={0} k4={0} result="renk" />
    </>
  ),
  tolex: (f: number, seed: number) => (
    <>
      <feTurbulence type="fractalNoise" baseFrequency={f} numOctaves={2} seed={seed} result="tn" />
      <feDiffuseLighting in="tn" surfaceScale={0.95} diffuseConstant={1} lightingColor="#ffffff" result="td">
        <feDistantLight azimuth={225} elevation={58} />
      </feDiffuseLighting>
      <feComposite in="SourceGraphic" in2="td" operator="arithmetic" k1={1.16} k2={0} k3={0} k4={0} result="t1" />
      <feSpecularLighting in="tn" surfaceScale={0.95} specularConstant={0.5} specularExponent={11} lightingColor="#ffffff" result="ts">
        <feDistantLight azimuth={225} elevation={58} />
      </feSpecularLighting>
      <feComposite in="t1" in2="ts" operator="arithmetic" k1={0} k2={1} k3={0.16} k4={0} result="renk" />
    </>
  ),
  kumas: (f: number, seed: number) => (
    <>
      <feTurbulence type="fractalNoise" baseFrequency={`${f} ${f * 0.6}`} numOctaves={2} seed={seed} result="kn" />
      <feColorMatrix in="kn" type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1" result="kg" />
      <feComposite in="SourceGraphic" in2="kg" operator="arithmetic" k1={0.7} k2={0.66} k3={0} k4={0} result="renk" />
    </>
  ),
};

/**
 * Bir çizimin tanımları: krom / altın / siyah plastik degradeleri, gölge; tam ayrıntıda gövde filtreleri.
 * `o`: çizimin ölçeği (1 ≈ pedal; amfi ve rack için kenar yarıçapı ve doku sıklığı buna göre).
 */
export function Tanimlar({ c, o = 1, seed = 3, children }: { c: Ctx; o?: number; seed?: number; children?: ReactNode }) {
  const { u, t, k } = c;
  // Işık eğimi piksel başına hesaplanır: büyük gösterimde kenar daha çok piksele yayılır, yüzey ölçeği büyür
  const s = Math.max(1.5, Math.min(14, 2.2 * k));
  return (
    <defs>
      <linearGradient id={`${u}krom`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fdfdfe" />
        <stop offset="0.28" stopColor="#d2d5da" />
        <stop offset="0.5" stopColor="#8a9098" />
        <stop offset="0.56" stopColor="#b9bdc4" />
        <stop offset="0.8" stopColor="#eef0f2" />
        <stop offset="1" stopColor="#727780" />
      </linearGradient>
      <linearGradient id={`${u}kromY`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#6f747c" />
        <stop offset="0.18" stopColor="#f2f3f5" />
        <stop offset="0.42" stopColor="#a3a8b0" />
        <stop offset="0.7" stopColor="#e6e8eb" />
        <stop offset="1" stopColor="#5f646c" />
      </linearGradient>
      <radialGradient id={`${u}kromR`} cx="0.36" cy="0.3" r="0.85">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="0.35" stopColor="#dfe2e6" />
        <stop offset="0.75" stopColor="#959aa2" />
        <stop offset="1" stopColor="#5d626a" />
      </radialGradient>
      <linearGradient id={`${u}altin`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f7e3a1" />
        <stop offset="0.3" stopColor="#d6b058" />
        <stop offset="0.52" stopColor="#a9802f" />
        <stop offset="0.62" stopColor="#cfa64d" />
        <stop offset="1" stopColor="#8a6624" />
      </linearGradient>
      <radialGradient id={`${u}altinR`} cx="0.36" cy="0.3" r="0.85">
        <stop offset="0" stopColor="#fff4c8" />
        <stop offset="0.4" stopColor="#e0bb62" />
        <stop offset="0.8" stopColor="#a17a2c" />
        <stop offset="1" stopColor="#6e5119" />
      </radialGradient>
      <radialGradient id={`${u}siyahR`} cx="0.38" cy="0.3" r="0.8">
        <stop offset="0" stopColor="#55585e" />
        <stop offset="0.45" stopColor="#24262a" />
        <stop offset="1" stopColor="#0a0b0c" />
      </radialGradient>
      <linearGradient id={`${u}siyahY`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3b3e43" />
        <stop offset="1" stopColor="#0d0e10" />
      </linearGradient>
      <radialGradient id={`${u}kremR`} cx="0.38" cy="0.3" r="0.82">
        <stop offset="0" stopColor="#fffdf6" />
        <stop offset="0.55" stopColor="#e9dfc6" />
        <stop offset="1" stopColor="#b5a582" />
      </radialGradient>
      <radialGradient id={`${u}golge`} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#000" stopOpacity="0.55" />
        <stop offset="0.6" stopColor="#000" stopOpacity="0.22" />
        <stop offset="1" stopColor="#000" stopOpacity="0" />
      </radialGradient>
      <linearGradient id={`${u}cam`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#ffffff" stopOpacity="0.42" />
        <stop offset="0.38" stopColor="#ffffff" stopOpacity="0.08" />
        <stop offset="0.39" stopColor="#ffffff" stopOpacity="0" />
        <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
      {/* yüzün üstten-soldan aydınlanması: kaplamaya bindirilir */}
      <linearGradient id={`${u}isik`} x1="0" y1="0" x2="0.35" y2="1">
        <stop offset="0" stopColor="#ffffff" stopOpacity="0.16" />
        <stop offset="0.45" stopColor="#ffffff" stopOpacity="0" />
        <stop offset="1" stopColor="#000000" stopOpacity="0.26" />
      </linearGradient>
      {t && c.z !== undefined && <AsinmaMaskesi c={c} />}
      {t && (
        <>
          <GovdeFiltresi id={`${u}f-parlak`} b={1.7 * o} s={s} isik={1.05} us={26} />
          <GovdeFiltresi id={`${u}f-plastik`} b={1.4 * o} s={s * 0.8} isik={0.45} us={16} />
          <GovdeFiltresi id={`${u}f-metalik`} b={1.8 * o} s={s} isik={0.85} doku={dokular.metalik(4.2 / o, seed)} />
          <GovdeFiltresi id={`${u}f-mat`} b={1.8 * o} s={s} isik={0.32} us={12} doku={dokular.mat(1.9 / o, seed)} />
          <GovdeFiltresi id={`${u}f-cekic`} b={1.8 * o} s={s} isik={0.6} doku={dokular.cekic(0.17 / o, seed)} />
          <GovdeFiltresi id={`${u}f-firca`} b={0.9 * o} s={s * 0.7} isik={0.75} us={24} doku={dokular.firca(1.8 / o, seed)} />
          <GovdeFiltresi id={`${u}f-tolex`} b={2.6 * o} s={s * 1.15} isik={0.4} us={10} doku={dokular.tolex(1.6 / o, seed)} />
          <filter id={`${u}f-kumas`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
            {dokular.kumas(0.9 / o, seed + 4)}
            <feComposite in="renk" in2="SourceAlpha" operator="in" />
          </filter>
          <filter id={`${u}f-golge`} x="-30%" y="-30%" width="160%" height="170%" colorInterpolationFilters="sRGB">
            <feDropShadow dx={0.45 * o} dy={1.1 * o} stdDeviation={0.85 * o} floodColor="#000" floodOpacity={0.6} />
          </filter>
          <filter id={`${u}f-bulanik`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={1.6 * o} />
          </filter>
        </>
      )}
      {children}
    </defs>
  );
}

/** Yüzey filtresi (yalnız tam ayrıntıda) */
export const yuzey = (c: Ctx, y: Yuzey) => (c.t ? `url(#${c.u}f-${y})` : undefined);
export const golgeF = (c: Ctx) => (c.t ? `url(#${c.u}f-golge)` : undefined);

// ── Düğmeler ──

export type DugmeTur = "siyah" | "krom" | "altin" | "numarali" | "tavuk" | "krem" | "renkli" | "sapka";

/** Döner düğme: gölge, etek (tırtıklı), kapak, gösterge. Değer 0–10. */
export function Dugme({ c, x, y, r, v, tur = "siyah", renk = "#c0392b", isaret, isaretBoy }: { c: Ctx; x: number; y: number; r: number; v: number; tur?: DugmeTur; renk?: string; isaret?: string; isaretBoy?: number }) {
  const { u, t } = c;
  const a = aci(v);
  const tirtik = (r0: number, r1: number, n: number, acikR: string, koyuR: string) =>
    t
      ? Array.from({ length: n }, (_, i) => {
          const d = (360 / n) * i;
          const [x0, y0] = kutup(x, y, r0, d);
          const [x1, y1] = kutup(x, y, r1, d);
          // Işık yukarıdan-soldan: o yöne bakan tırtıklar parlak
          const yon = yuvarla(Math.cos(((d + 45) * Math.PI) / 180));
          return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={yon < 0 ? acikR : koyuR} strokeOpacity={0.25 + Math.abs(yon) * 0.5} strokeWidth={Math.max(0.25, (r * 0.9) / n)} />;
        })
      : null;
  const golge = t ? null : <ellipse cx={x + r * 0.12} cy={y + r * 0.22} rx={r * 1.06} ry={r * 1.04} fill="#000" opacity={0.32} />;
  const parlama = (rr: number, op = 0.5) => <ellipse cx={x - rr * 0.32} cy={y - rr * 0.4} rx={rr * 0.42} ry={rr * 0.24} fill="#fff" opacity={op} transform={`rotate(-30 ${x - rr * 0.32} ${y - rr * 0.4})`} />;
  const cizgi = (r0: number, r1: number, renkC: string, w: number) => <line x1={x} y1={y - r0} x2={x} y2={y - r1} stroke={renkC} strokeWidth={w} strokeLinecap="round" transform={`rotate(${a} ${x} ${y})`} mask={asinmaMaskesi(c)} />;

  let govde: ReactNode;
  switch (tur) {
    case "krom":
      govde = (
        <>
          <circle cx={x} cy={y} r={r} fill={`url(#${u}krom)`} stroke="#4c5158" strokeWidth={r * 0.04} />
          {tirtik(r * 0.86, r, 44, "#ffffff", "#3d4148")}
          <circle cx={x} cy={y} r={r * 0.8} fill={`url(#${u}kromR)`} />
          {/* talaşlı işleme halkaları ve konik yansıma */}
          {t && [0.3, 0.46, 0.62, 0.74].map((q) => <circle key={q} cx={x} cy={y} r={r * q} fill="none" stroke={q > 0.5 ? "#000" : "#fff"} strokeOpacity={0.12} strokeWidth={r * 0.02} />)}
          <path d={`M${x} ${y} L${kutup(x, y, r * 0.8, -62).join(" ")} A${r * 0.8} ${r * 0.8} 0 0 1 ${kutup(x, y, r * 0.8, -28).join(" ")} Z`} fill="#fff" opacity={0.5} />
          <path d={`M${x} ${y} L${kutup(x, y, r * 0.8, 118).join(" ")} A${r * 0.8} ${r * 0.8} 0 0 1 ${kutup(x, y, r * 0.8, 152).join(" ")} Z`} fill="#fff" opacity={0.28} />
          {cizgi(r * 0.2, r * 0.74, "#16171a", r * 0.09)}
        </>
      );
      break;
    case "altin":
      govde = (
        <>
          <circle cx={x} cy={y} r={r} fill={`url(#${u}siyahR)`} />
          {tirtik(r * 0.7, r, 40, "#8a8f97", "#000000")}
          <circle cx={x} cy={y} r={r * 0.66} fill={`url(#${u}altinR)`} stroke="#5a4313" strokeWidth={r * 0.03} />
          {t && [0.25, 0.42, 0.56].map((q) => <circle key={q} cx={x} cy={y} r={r * q} fill="none" stroke="#fff6d8" strokeOpacity={0.22} strokeWidth={r * 0.02} />)}
          {parlama(r * 0.66, 0.45)}
          {cizgi(r * 0.68, r * 0.97, "#f4f1e8", r * 0.1)}
          {cizgi(r * 0.12, r * 0.6, "#241a06", r * 0.07)}
        </>
      );
      break;
    case "numarali":
      govde = (
        <>
          {/* geniş etek: numaralı halka; ortada yükseltilmiş kapak */}
          <circle cx={x} cy={y} r={r} fill={`url(#${u}siyahR)`} stroke="#000" strokeWidth={r * 0.03} />
          <circle cx={x} cy={y} r={r * 0.96} fill="none" stroke="#c9ccd1" strokeOpacity={0.55} strokeWidth={r * 0.05} />
          {t &&
            Array.from({ length: 10 }, (_, i) => {
              const d = -135 + (i / 9) * 270 + a + 135;
              const [nx, ny] = kutup(x, y, r * 0.78, d);
              return (
                <text key={i} x={nx} y={ny + r * 0.07} textAnchor="middle" fontSize={r * 0.21} fontWeight={700} fill="#e9e9e9" fontFamily={FONT.sans} transform={`rotate(${d} ${nx} ${ny})`}>
                  {i + 1}
                </text>
              );
            })}
          <circle cx={x} cy={y} r={r * 0.5} fill={`url(#${u}siyahR)`} stroke="#000" strokeWidth={r * 0.03} />
          {tirtik(r * 0.36, r * 0.5, 24, "#8a8f97", "#000")}
          <circle cx={x} cy={y} r={r * 0.36} fill={`url(#${u}kromR)`} opacity={0.9} />
          {parlama(r * 0.5, 0.35)}
          {cizgi(r * 0.55, r * 0.62, "#ffffff", r * 0.1)}
        </>
      );
      break;
    case "tavuk": {
      // tavuk başı: sivri gösterge (bakalit), alt diski ile
      const [px, py] = kutup(x, y, r * 1.05, a);
      const [bx1, by1] = kutup(x, y, r * 0.55, a + 90);
      const [bx2, by2] = kutup(x, y, r * 0.55, a - 90);
      const [kx, ky] = kutup(x, y, r * 0.75, a + 180);
      govde = (
        <>
          <circle cx={x} cy={y} r={r * 0.62} fill={`url(#${u}siyahR)`} />
          <path d={`M${px} ${py} Q${bx1} ${by1} ${kx} ${ky} Q${bx2} ${by2} ${px} ${py} Z`} fill={renk === "krem" ? `url(#${u}kremR)` : `url(#${u}siyahR)`} stroke="#000" strokeOpacity={0.6} strokeWidth={r * 0.04} />
          <path d={`M${x} ${y} L${px} ${py}`} stroke={renk === "krem" ? "#3a2c18" : "#f1efe9"} strokeWidth={r * 0.08} strokeLinecap="round" />
          <circle cx={x} cy={y} r={r * 0.3} fill={`url(#${u}kromR)`} />
          {parlama(r * 0.55, 0.3)}
        </>
      );
      break;
    }
    case "krem":
      govde = (
        <>
          <circle cx={x} cy={y} r={r} fill={`url(#${u}kremR)`} stroke="#7d6e4e" strokeWidth={r * 0.05} />
          {tirtik(r * 0.82, r, 30, "#ffffff", "#7d6e4e")}
          <circle cx={x} cy={y} r={r * 0.78} fill={`url(#${u}kremR)`} />
          {parlama(r * 0.8, 0.55)}
          {cizgi(r * 0.18, r * 0.76, "#2b2214", r * 0.1)}
        </>
      );
      break;
    case "renkli":
      govde = (
        <>
          <circle cx={x} cy={y} r={r} fill={koyu(renk, 0.35)} />
          {tirtik(r * 0.82, r, 32, acik(renk, 0.5), koyu(renk, 0.7))}
          <circle cx={x} cy={y} r={r * 0.8} fill={renk} />
          <circle cx={x} cy={y} r={r * 0.8} fill={`url(#${u}isik)`} />
          {parlama(r * 0.8, 0.5)}
          {cizgi(r * 0.18, r * 0.76, baskiRengi(renk), r * 0.1)}
        </>
      );
      break;
    case "sapka":
      // "cadı şapkası": geniş etek + konik tepe (yandan ışık)
      govde = (
        <>
          <circle cx={x} cy={y} r={r} fill={`url(#${u}siyahR)`} />
          <circle cx={x} cy={y} r={r * 0.98} fill="none" stroke="#6b6f76" strokeOpacity={0.5} strokeWidth={r * 0.04} />
          <circle cx={x} cy={y} r={r * 0.55} fill="#111214" />
          <path d={`M${x} ${y} L${kutup(x, y, r * 0.55, -80).join(" ")} A${r * 0.55} ${r * 0.55} 0 0 1 ${kutup(x, y, r * 0.55, 10).join(" ")} Z`} fill="#fff" opacity={0.16} />
          <circle cx={x} cy={y} r={r * 0.18} fill="#2b2d31" />
          {cizgi(r * 0.62, r * 0.95, "#f4f1e8", r * 0.1)}
        </>
      );
      break;
    default:
      govde = (
        <>
          <circle cx={x} cy={y} r={r} fill={`url(#${u}siyahR)`} stroke="#000" strokeWidth={r * 0.03} />
          {tirtik(r * 0.8, r, 36, "#9aa0a8", "#000")}
          <circle cx={x} cy={y} r={r * 0.78} fill={`url(#${u}siyahY)`} />
          {t && <circle cx={x} cy={y} r={r * 0.62} fill="none" stroke="#fff" strokeOpacity={0.07} strokeWidth={r * 0.04} />}
          {parlama(r * 0.78, 0.22)}
          {cizgi(r * 0.16, r * 0.74, "#f6f6f2", r * 0.1)}
        </>
      );
  }
  return (
    <g>
      {golge}
      <g filter={golgeF(c)}>{govde}</g>
      {isaret && c.t && (
        <text x={x} y={y - r - r * 0.32} textAnchor="middle" fontSize={isaretBoy ?? Math.max(2.4, r * 0.42)} fontWeight={700} letterSpacing={0.2} fill="currentColor" fontFamily={FONT.sans} mask={asinmaMaskesi(c)}>
          {isaret}
        </text>
      )}
    </g>
  );
}

/** Düğme adlarını panel yazısına çevirir: "Ana ses" → "ANA SES" */
export const etiketYaz = (a: string) => a.toLocaleUpperCase("tr");

// ── Işıklar ──

/** LED: krom yuva, kubbe mercek; açıkken parlama */
export function Led({ c, x, y, renk = "#ff3b30", r = 2.4 }: { c: Ctx; x: number; y: number; renk?: string; r?: number }) {
  const { on } = c;
  const id = `${c.u}led${renk.slice(1)}`;
  return (
    <g>
      <defs>
        <radialGradient id={id} cx="0.42" cy="0.38" r="0.7">
          <stop offset="0" stopColor={on ? "#ffffff" : acik(koyu(renk, 0.55), 0.25)} />
          <stop offset="0.35" stopColor={on ? acik(renk, 0.35) : koyu(renk, 0.55)} />
          <stop offset="1" stopColor={on ? renk : koyu(renk, 0.78)} />
        </radialGradient>
        <radialGradient id={`${id}h`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={renk} stopOpacity={0.7} />
          <stop offset="0.35" stopColor={renk} stopOpacity={0.25} />
          <stop offset="1" stopColor={renk} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={x} cy={y} r={r * 1.45} fill={`url(#${c.u}krom)`} />
      <circle cx={x} cy={y} r={r * 1.12} fill="#141518" />
      <circle cx={x} cy={y} r={r} fill={`url(#${id})`} />
      {on && <circle cx={x} cy={y} r={r * 4.4} fill={`url(#${id}h)`} style={{ mixBlendMode: "screen" }} />}
      <ellipse cx={x - r * 0.32} cy={y - r * 0.38} rx={r * 0.36} ry={r * 0.24} fill="#fff" opacity={on ? 0.9 : 0.4} />
    </g>
  );
}

/** Amfi pilot lambası: krom tırtıklı yuva, yontulmuş (fasetalı) mücevher mercek */
export function Lamba({ c, x, y, r = 4.5, renk = "#e0281c" }: { c: Ctx; x: number; y: number; r?: number; renk?: string }) {
  const { u, on, t } = c;
  const id = `${u}lamba`;
  const n = 8;
  return (
    <g>
      <defs>
        <radialGradient id={id} cx="0.45" cy="0.42" r="0.65">
          <stop offset="0" stopColor={on ? "#fff4e0" : koyu(renk, 0.3)} />
          <stop offset="0.4" stopColor={on ? acik(renk, 0.2) : koyu(renk, 0.55)} />
          <stop offset="1" stopColor={koyu(renk, on ? 0.2 : 0.75)} />
        </radialGradient>
        <radialGradient id={`${id}h`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={acik(renk, 0.2)} stopOpacity={0.75} />
          <stop offset="0.4" stopColor={renk} stopOpacity={0.22} />
          <stop offset="1" stopColor={renk} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={x + r * 0.1} cy={y + r * 0.2} r={r * 1.5} fill="#000" opacity={0.35} />
      <circle cx={x} cy={y} r={r * 1.42} fill={`url(#${u}krom)`} stroke="#3e4248" strokeWidth={r * 0.05} />
      {t &&
        Array.from({ length: 28 }, (_, i) => {
          const [a1, b1] = kutup(x, y, r * 1.18, i * (360 / 28));
          const [a2, b2] = kutup(x, y, r * 1.42, i * (360 / 28));
          return <line key={i} x1={a1} y1={b1} x2={a2} y2={b2} stroke="#3a3e44" strokeOpacity={0.45} strokeWidth={r * 0.06} />;
        })}
      <circle cx={x} cy={y} r={r * 1.05} fill="#1a0806" />
      <circle cx={x} cy={y} r={r} fill={`url(#${id})`} />
      {/* fasetalar */}
      {Array.from({ length: n }, (_, i) => {
        const [x1, y1] = kutup(x, y, r * 0.98, (360 / n) * i);
        const [x2, y2] = kutup(x, y, r * 0.98, (360 / n) * (i + 1));
        const [x3, y3] = kutup(x, y, r * 0.42, (360 / n) * (i + 0.5));
        return <path key={i} d={`M${x1} ${y1} L${x2} ${y2} L${x3} ${y3} Z`} fill={i % 2 ? "#fff" : "#000"} opacity={i % 2 ? (on ? 0.22 : 0.1) : 0.16} />;
      })}
      <circle cx={x} cy={y} r={r * 0.42} fill={on ? "#fff8ea" : koyu(renk, 0.4)} opacity={on ? 0.85 : 0.5} />
      {on && <circle cx={x} cy={y} r={r * 5.5} fill={`url(#${id}h)`} style={{ mixBlendMode: "screen" }} />}
      <ellipse cx={x - r * 0.4} cy={y - r * 0.45} rx={r * 0.3} ry={r * 0.18} fill="#fff" opacity={0.85} />
    </g>
  );
}

// ── Donanım ──

/** Yıldız başlı vida (krom); `d` vida yuvasının açısı */
export function Vida({ c, x, y, r = 1.6, d = 20, pas = c.z === undefined ? 0 : ((c.z ^ Math.round(x * 31 + y * 17)) % 97) / 97 }: { c: Ctx; x: number; y: number; r?: number; d?: number; pas?: number }) {
  // pas: 0–1 (yıpranmış çizimde vidanın konumundan türer); yuva ve kenarda kahverengi leke
  const p = pas > 0.35 ? (pas - 0.35) / 0.65 : 0;
  return (
    <g>
      <circle cx={x + r * 0.15} cy={y + r * 0.3} r={r * 1.1} fill="#000" opacity={0.3} />
      {p > 0 && <circle cx={x + r * 0.2} cy={y + r * 0.35} r={r * (1.25 + p * 0.35)} fill="#6b3512" opacity={0.18 + p * 0.3} />}
      <circle cx={x} cy={y} r={r} fill={`url(#${c.u}kromR)`} stroke="#53575e" strokeWidth={r * 0.12} />
      {p > 0 && <circle cx={x} cy={y} r={r * 0.92} fill="none" stroke="#8a4a1c" strokeOpacity={0.35 + p * 0.4} strokeWidth={r * 0.28} strokeDasharray={`${r * 0.9} ${r * 0.5}`} transform={`rotate(${d * 3} ${x} ${y})`} />}
      {p > 0.4 && <circle cx={x + r * 0.3} cy={y + r * 0.25} r={r * 0.35} fill="#7a3d14" opacity={0.5} />}
      <g transform={`rotate(${d} ${x} ${y})`} stroke="#3a3d42" strokeWidth={r * 0.26} strokeLinecap="round">
        <line x1={x - r * 0.55} y1={y} x2={x + r * 0.55} y2={y} />
        <line x1={x} y1={y - r * 0.55} x2={x} y2={y + r * 0.55} />
      </g>
    </g>
  );
}

/** Ayak anahtarı (üstten): altıgen somun, pul, kubbe başlık */
export function AyakAnahtari({ c, x, y, r = 8 }: { c: Ctx; x: number; y: number; r?: number }) {
  const { u, t } = c;
  const alti = (rr: number, don = 0) =>
    Array.from({ length: 6 }, (_, i) => kutup(x, y, rr, i * 60 + 30 + don).join(",")).join(" ");
  return (
    <g>
      <ellipse cx={x + r * 0.25} cy={y + r * 0.45} rx={r * 1.55} ry={r * 1.45} fill="#000" opacity={0.3} />
      <polygon points={alti(r * 1.48, 8)} fill={`url(#${u}krom)`} stroke="#4a4e55" strokeWidth={r * 0.05} />
      <circle cx={x} cy={y} r={r * 1.22} fill="#5d626a" />
      <circle cx={x} cy={y} r={r * 1.14} fill={`url(#${u}kromY)`} opacity={0.85} />
      <circle cx={x} cy={y} r={r * 0.98} fill="#2e3136" />
      <circle cx={x} cy={y} r={r * 0.92} fill={`url(#${u}kromR)`} />
      {t &&
        Array.from({ length: 40 }, (_, i) => {
          const [a1, b1] = kutup(x, y, r * 0.78, i * 9);
          const [a2, b2] = kutup(x, y, r * 0.92, i * 9);
          return <line key={i} x1={a1} y1={b1} x2={a2} y2={b2} stroke="#40444a" strokeOpacity={0.4} strokeWidth={r * 0.035} />;
        })}
      <circle cx={x} cy={y} r={r * 0.7} fill={`url(#${u}kromR)`} />
      <ellipse cx={x - r * 0.24} cy={y - r * 0.3} rx={r * 0.34} ry={r * 0.2} fill="#fff" opacity={0.85} transform={`rotate(-35 ${x - r * 0.24} ${y - r * 0.3})`} />
      <circle cx={x} cy={y} r={r * 0.7} fill="none" stroke="#000" strokeOpacity={0.18} strokeWidth={r * 0.04} />
    </g>
  );
}

/** Kenardan taşan jak (üstten görünüş): somun ve gövde; `yon` -1 sol kenar, 1 sağ kenar */
export function YanJak({ c, x, y, yon, r = 3.6 }: { c: Ctx; x: number; y: number; yon: -1 | 1; r?: number }) {
  return (
    <g>
      <rect x={yon < 0 ? x - r * 1.5 : x} y={y - r} width={r * 1.5} height={r * 2} rx={r * 0.25} fill={`url(#${c.u}krom)`} stroke="#4a4e55" strokeWidth={0.3} />
      <rect x={yon < 0 ? x - r * 2.1 : x + r * 1.5} y={y - r * 0.62} width={r * 0.6} height={r * 1.24} fill="#2b2e33" />
    </g>
  );
}

/** Ön panel jakı (önden): somun, delik */
export function Jak({ c, x, y, r = 3 }: { c: Ctx; x: number; y: number; r?: number }) {
  return (
    <g>
      <circle cx={x + r * 0.1} cy={y + r * 0.2} r={r * 1.18} fill="#000" opacity={0.3} />
      <polygon points={Array.from({ length: 6 }, (_, i) => kutup(x, y, r * 1.1, i * 60).join(",")).join(" ")} fill={`url(#${c.u}krom)`} stroke="#4a4e55" strokeWidth={r * 0.06} />
      <circle cx={x} cy={y} r={r * 0.78} fill={`url(#${c.u}kromR)`} />
      <circle cx={x} cy={y} r={r * 0.42} fill="#07080a" />
    </g>
  );
}

/** Kollu anahtar (toggle): somun ve kol; `ust` true ise yukarı */
export function Anahtar({ c, x, y, r = 3, ust = true }: { c: Ctx; x: number; y: number; r?: number; ust?: boolean }) {
  const s = ust ? -1 : 1;
  return (
    <g>
      <circle cx={x} cy={y} r={r * 1.15} fill={`url(#${c.u}krom)`} stroke="#4a4e55" strokeWidth={r * 0.06} />
      <circle cx={x} cy={y} r={r * 0.6} fill="#2a2d32" />
      <path d={`M${x - r * 0.32} ${y} L${x - r * 0.42} ${y + s * r * 2.3} H${x + r * 0.42} L${x + r * 0.32} ${y} Z`} fill={`url(#${c.u}kromY)`} stroke="#50545b" strokeWidth={r * 0.05} />
      <ellipse cx={x} cy={y + s * r * 2.35} rx={r * 0.55} ry={r * 0.42} fill={`url(#${c.u}kromR)`} />
    </g>
  );
}

/** Bas düğme (rack / pedal): kare, yuvarlatılmış; ışıklı olabilir */
export function BasDugme({ c, x, y, w = 6, h = 4.5, renk = "#2a2c30", isik }: { c: Ctx; x: number; y: number; w?: number; h?: number; renk?: string; isik?: string }) {
  return (
    <g>
      <rect x={x - w / 2 - 0.5} y={y - h / 2 - 0.5} width={w + 1} height={h + 1} rx={1.2} fill="#08090a" />
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={1} fill={renk} />
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={1} fill={`url(#${c.u}isik)`} />
      {isik && <rect x={x - w * 0.3} y={y - h * 0.12} width={w * 0.6} height={h * 0.24} rx={0.5} fill={c.on ? isik : koyu(isik, 0.6)} />}
    </g>
  );
}

/** Yazı (serigrafi baskı) */
export function Yazi({ x, y, boy, renk, font = "sans", kalin = 700, hiza = "middle", ara = 0, italik = false, children, opaklik = 1 }: { x: number; y: number; boy: number; renk: string; font?: keyof typeof FONT; kalin?: number; hiza?: "start" | "middle" | "end"; ara?: number; italik?: boolean; children: ReactNode; opaklik?: number }) {
  return (
    <text x={x} y={y} textAnchor={hiza} fontSize={boy} fontWeight={kalin} letterSpacing={ara} fontStyle={italik ? "italic" : undefined} fill={renk} fillOpacity={opaklik} fontFamily={FONT[font]}>
      {children}
    </text>
  );
}

/** Kasa (amfi / kabin): önden görünüş + üst ve sağ yan yüz (hafif perspektif). Ön yüz children ile çizilir. */
export function Kasa({ c, x, y, w, h, d, renk, rx = 5, doku = "tolex", children, ust }: { c: Ctx; x: number; y: number; w: number; h: number; d: [number, number]; renk: string; rx?: number; doku?: Yuzey; children?: ReactNode; ust?: ReactNode }) {
  const [dx, dy] = d;
  const ustYuz = `M${x + rx} ${y} L${x + rx + dx} ${y + dy} H${x + w + dx - rx * 0.6} Q${x + w + dx} ${y + dy} ${x + w + dx} ${y + dy + rx * 0.6} L${x + w} ${y + rx} V${y} Z`;
  const yanYuz = `M${x + w} ${y + rx * 0.4} L${x + w + dx} ${y + dy + rx * 0.6} V${y + h + dy - rx * 0.6} L${x + w} ${y + h - rx * 0.4} Z`;
  return (
    <g>
      <path d={yanYuz} fill={koyu(renk, 0.42)} filter={yuzey(c, doku)} />
      <path d={yanYuz} fill="#000" opacity={0.18} />
      <path d={ustYuz} fill={acik(renk, 0.1)} filter={yuzey(c, doku)} />
      {ust}
      <rect x={x} y={y} width={w} height={h} rx={rx} fill={renk} filter={yuzey(c, doku)} />
      <rect x={x} y={y} width={w} height={h} rx={rx} fill={`url(#${c.u}isik)`} />
      {/* kenar ışığı: üst ve sol kenar parlak */}
      <path d={`M${x + 1} ${y + h - rx} V${y + rx} Q${x + 1} ${y + 1} ${x + rx} ${y + 1} H${x + w - rx}`} fill="none" stroke="#fff" strokeOpacity={0.16} strokeWidth={0.9} />
      <Yipranma c={c} x={x} y={y} w={w} h={h} rx={rx} tur={doku === "tolex" || doku === "mat" || doku === "kumas" ? "tolex" : "boya"} renk={renk} anahtar="kasa" />
      {children}
    </g>
  );
}

/** Metal köşe koruyucu (önden, köşede) */
export function Kose({ c, x, y, sx, sy, r = 11 }: { c: Ctx; x: number; y: number; sx: 1 | -1; sy: 1 | -1; r?: number }) {
  const p = `M${x} ${y + sy * r} V${y + sy * r * 0.25} Q${x} ${y} ${x + sx * r * 0.25} ${y} H${x + sx * r} Q${x + sx * r * 0.62} ${y + sy * r * 0.3} ${x + sx * r * 0.42} ${y + sy * r * 0.42} Q${x + sx * r * 0.3} ${y + sy * r * 0.62} ${x} ${y + sy * r} Z`;
  return (
    <g>
      <path d={p} fill="#000" opacity={0.35} transform={`translate(${0.6} ${1})`} />
      <path d={p} fill={`url(#${c.u}kromR)`} stroke="#4f535a" strokeWidth={0.4} />
      <Vida c={c} x={x + sx * r * 0.3} y={y + sy * r * 0.3} r={r * 0.11} />
    </g>
  );
}

export function Koseler({ c, x, y, w, h, r = 11 }: { c: Ctx; x: number; y: number; w: number; h: number; r?: number }) {
  const rs = c.z === undefined ? null : rastgele(c.z ^ 0x51ed);
  const koseler: [number, number, 1 | -1, 1 | -1][] = [
    [x, y, 1, 1],
    [x + w, y, -1, 1],
    [x, y + h, 1, -1],
    [x + w, y + h, -1, -1],
  ];
  return (
    <g>
      {koseler.map(([kx, ky, sx, sy], i) => (
        <g key={i}>
          <Kose c={c} x={kx} y={ky} sx={sx} sy={sy} r={r} />
          {rs && <KoseYipranma c={c} x={kx} y={ky} sx={sx} sy={sy} r={r} rs={rs} alt={sy < 0} />}
        </g>
      ))}
    </g>
  );
}

/** Köşe koruyucunun yıpranması: matlaşma (parlaklık kaybı), göçük (koyu hilal + ışık), çizik */
function KoseYipranma({ c, x, y, sx, sy, r, rs, alt }: { c: Ctx; x: number; y: number; sx: 1 | -1; sy: 1 | -1; r: number; rs: () => number; alt: boolean }) {
  const mat = 0.25 + rs() * 0.25;
  // alt köşeler (yere değen) daha çok göçer
  const gocuk = rs() < (alt ? 0.75 : 0.35);
  const gx = yuvarla(x + sx * r * (0.12 + rs() * 0.3));
  const gy = yuvarla(y + sy * r * (0.1 + rs() * 0.18));
  const p = `M${x} ${y + sy * r} V${y + sy * r * 0.25} Q${x} ${y} ${x + sx * r * 0.25} ${y} H${x + sx * r} Q${x + sx * r * 0.62} ${y + sy * r * 0.3} ${x + sx * r * 0.42} ${y + sy * r * 0.42} Q${x + sx * r * 0.3} ${y + sy * r * 0.62} ${x} ${y + sy * r} Z`;
  return (
    <g>
      <path d={p} fill="#6d6a64" opacity={mat} style={{ mixBlendMode: "multiply" }} />
      {gocuk && (
        <g>
          <ellipse cx={gx} cy={gy} rx={r * 0.13} ry={r * 0.08} fill="#1d1f22" opacity={0.55} transform={`rotate(${yuvarla(rs() * 180)} ${gx} ${gy})`} />
          <ellipse cx={gx - sx * r * 0.04} cy={gy - sy * r * 0.04} rx={r * 0.08} ry={r * 0.04} fill="#fff" opacity={0.45} />
        </g>
      )}
      {c.t && <line x1={x + sx * r * 0.2} y1={y + sy * r * 0.55} x2={x + sx * r * (0.45 + rs() * 0.3)} y2={y + sy * r * 0.18} stroke="#fff" strokeOpacity={0.35} strokeWidth={0.18} />}
    </g>
  );
}

/** Biyik (piping): ızgaranın çevresinde yuvarlak kordon */
export function Biyik({ x, y, w, h, rx = 3, renk = "#e9e2cf" }: { x: number; y: number; w: number; h: number; rx?: number; renk?: string }) {
  return (
    <g fill="none">
      <rect x={x + 0.25} y={y + 0.45} width={w} height={h} rx={rx} stroke="#000" strokeOpacity={0.45} strokeWidth={1.7} />
      <rect x={x} y={y} width={w} height={h} rx={rx} stroke={renk} strokeWidth={1.4} />
      <rect x={x - 0.25} y={y - 0.3} width={w} height={h} rx={rx} stroke="#fff" strokeOpacity={0.55} strokeWidth={0.4} />
    </g>
  );
}

// ── Yıpranma (vintage / relic) ──
// "Yıllarca sahnede kullanılmış ama bakımlı": boya çentikleri ve kenarlardan çıkan çıplak metal, çizikler, soluk yazılar,
// vidada pas, ayak anahtarı çevresinde parlama, tolex sıyrıkları, köşe koruyucuda göçük, panelde kararma, ızgarada leke.
// Hasarın yeri modelin kimliğinden türeyen tohumla belirlenir (her modelde farklı, her açılışta aynı). Sunucu ile tarayıcı
// aynı sonucu versin diye trigonometri yok; koordinatlar yuvarlanır. İkonda yalnız birkaç belirgin iz, büyük panelde tam ayrıntı.

/** Metinden 32 bit tohum (FNV-1a) */
export function tohumla(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Tohumlu sözde rastgele sayı üreteci (mulberry32): 0–1 */
export function rastgele(tohum: number): () => number {
  let a = tohum >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = a;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/** Aşınmış yazı ve düğme işareti maskesi (yalnız tam ayrıntı ve yıpranmış çizimde) */
export const asinmaMaskesi = (c: Ctx) => (c.t && c.z !== undefined ? `url(#${c.u}asinma)` : undefined);

/** Yazı aşınması: ince kumlu gürültü yazının küçük parçalarını siler, bazı yerlerde soldurur */
function AsinmaMaskesi({ c }: { c: Ctx }) {
  const { u, z = 0 } = c;
  return (
    <>
      <filter id={`${u}f-asinma`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="1.1 1.5" numOctaves={2} seed={z % 997} result="n" />
        <feColorMatrix in="n" type="matrix" values="5 0 0 0 -1.28  5 0 0 0 -1.28  5 0 0 0 -1.28  0 0 0 0 1" result="m" />
        <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves={1} seed={(z >>> 8) % 997} result="g" />
        <feColorMatrix in="g" type="matrix" values="1 0 0 0 0.42  1 0 0 0 0.42  1 0 0 0 0.42  0 0 0 0 1" result="gg" />
        <feComposite in="m" in2="gg" operator="arithmetic" k1={1} k2={0} k3={0} k4={0} />
      </filter>
      <mask id={`${u}asinma`} maskUnits="userSpaceOnUse" x={-20} y={-20} width={700} height={500}>
        <rect x={-20} y={-20} width={700} height={500} fill="#fff" filter={`url(#${u}f-asinma)`} />
      </mask>
    </>
  );
}

export type Malzeme = "boya" | "tolex" | "panel" | "kumas";

type Nokta = [number, number];
/** Kenar şeridinde (köşelere yakın daha sık) ya da içeride rastgele nokta */
function kenarNoktasi(rs: () => number, x: number, y: number, w: number, h: number, serit: number, icOran: number): Nokta {
  if (rs() < icOran) return [x + serit + rs() * (w - serit * 2), y + serit + rs() * (h - serit * 2)];
  const kenar = rs();
  // köşe eğilimi: konumun uçlara itilmesi
  const t0 = rs();
  const t = t0 < 0.5 ? 0.5 * (2 * t0) ** 1.8 : 1 - 0.5 * (2 - 2 * t0) ** 1.8;
  const d = rs() * serit;
  if (kenar < 0.28) return [x + t * w, y + d];
  if (kenar < 0.56) return [x + t * w, y + h - d];
  if (kenar < 0.78) return [x + d, y + t * h];
  return [x + w - d, y + t * h];
}

/** Düzensiz çokgen (çentik / sıyrık): yuvarlanmış koordinatlar, trigonometrisiz (önceden hesaplı yön tablosu) */
const YON: Nokta[] = [
  [1, 0], [0.71, 0.71], [0, 1], [-0.71, 0.71], [-1, 0], [-0.71, -0.71], [0, -1], [0.71, -0.71],
];
function cokgen(rs: () => number, cx: number, cy: number, r: number, uzama = 1, aci = 0): string {
  const ca = aci === 0 ? 1 : 0.71;
  const sa = aci === 0 ? 0 : 0.71 * (aci > 0 ? 1 : -1);
  return (
    YON.map(([dx, dy], i) => {
      const k = r * (0.45 + rs() * 0.75) * (i % 2 ? 0.85 : 1);
      const px = dx * k * uzama;
      const py = dy * k;
      return `${i ? "L" : "M"}${yuvarla(cx + px * ca - py * sa)} ${yuvarla(cy + px * sa + py * ca)}`;
    }).join(" ") + " Z"
  );
}

/**
 * Yüzey yıpranması ("sahnede kullanılmış ama bakımlı"). `x, y, w, h, rx`: yüzeyin dikdörtgeni (iz dışarı taşmaz). `renk`:
 * yüzeyin rengi. `taban`: kazınınca görünen malzeme (boyada çıplak alüminyum, tolexte ahşap / bez astar, panelde kararma).
 * `anahtar`: aynı çizimdeki farklı yüzeyler farklı iz alsın. `ayak`: ayak anahtarının merkezi ve yarıçapı (çevresinde
 * basılmaktan boya kalkar). `bant`: eski bant izinin yeri [x, y, genişlik, açı] (yazıların ve düğmelerin dışında).
 */
export function Yipranma({ c, x, y, w, h, rx = 4, tur, renk, taban, anahtar = "", siddet = 1, ayak, bant }: { c: Ctx; x: number; y: number; w: number; h: number; rx?: number; tur: Malzeme; renk: string; taban?: string; anahtar?: string; siddet?: number; ayak?: [number, number, number]; bant?: [number, number, number, number] }) {
  if (c.z === undefined) return null;
  const { u, t } = c;
  const rs = rastgele(c.z ^ tohumla(`${tur}:${anahtar}`));
  const id = `${u}yp${tur}${anahtar.replace(/[^a-zA-Z0-9]/g, "")}`;
  const olcek = Math.max(0.6, Math.min(w, h) / 60);
  const y2 = (v: number) => yuvarla(v);
  const bulanik = t ? `url(#${u}f-bulanik)` : undefined;
  const ogeler: ReactNode[] = [];
  /** Kenar boyunca kesik kesik aşınma (parlamış / incelmiş kenar) */
  const kenar = (renkK: string, op: number, gen: number) => {
    const dizi = Array.from({ length: 12 }, (_, i) => y2(i % 2 ? 5 + rs() * 18 : 3 + rs() * 12)).join(" ");
    return <rect x={x + 0.9} y={y + 0.9} width={w - 1.8} height={h - 1.8} rx={rx} fill="none" stroke={renkK} strokeOpacity={op} strokeWidth={gen} strokeDasharray={dizi} strokeDashoffset={y2(rs() * 40)} filter={bulanik} />;
  };
  /** Düzensiz parça (çentik, sıyrık): gölgeli kenar + açığa çıkan malzeme */
  const parca = (k: string, cx: number, cy: number, r: number, uzama: number, dolgu: string, op = 1, golge = true) => {
    const d = cokgen(rs, cx, cy, r, uzama, rs() < 0.5 ? 0 : rs() < 0.5 ? 1 : -1);
    return (
      <g key={k}>
        {golge && <path d={d} fill={koyu(renk, 0.55)} opacity={0.5 * op} transform="translate(0.15 0.2)" />}
        <path d={d} fill={dolgu} opacity={op} />
        {t && golge && <path d={d} fill="none" stroke="#fff" strokeOpacity={0.3} strokeWidth={0.12} />}
      </g>
    );
  };

  if (tur === "boya") {
    const metal = taban ?? "#b4b8bd";
    if (ayak) {
      // ayak anahtarı çevresi: basılmaktan boya kalkmış, alttaki metal parlamış; çevresinde küçük çentikler
      const [ax, ay, ar] = ayak;
      if (t)
        ogeler.push(
          <g key="ayak" filter={bulanik}>
            <ellipse cx={ax} cy={y2(ay + ar * 0.2)} rx={y2(ar * 2.2)} ry={y2(ar * 1.8)} fill={metal} opacity={0.26} />
            <ellipse cx={y2(ax - ar * 0.4)} cy={y2(ay + ar * 0.9)} rx={y2(ar * 1.3)} ry={y2(ar * 0.65)} fill="#fff" opacity={0.16} />
          </g>,
        );
      const n = t ? 7 : 2;
      for (let i = 0; i < n; i++) {
        const yon = YON[Math.floor(rs() * 8)];
        const uz = ar * (1.25 + rs() * 0.9);
        ogeler.push(parca(`a${i}`, y2(ax + yon[0] * uz), y2(ay + yon[1] * uz * 0.9), (0.35 + rs() * 0.7) * olcek * (t ? 1 : 1.6), 1 + rs() * 0.7, metal, 0.95));
      }
    }
    // kenar: boya incelmiş, yer yer metal görünüyor
    ogeler.push(<g key="kenar">{t ? kenar(metal, 0.36, 2.8) : kenar(metal, 0.4, 1.4)}</g>);
    // çentikler (köşelere ve kenarlara yakın daha sık)
    const n = Math.round((t ? 17 : 5) * siddet);
    for (let i = 0; i < n; i++) {
      const [cx, cy] = kenarNoktasi(rs, x, y, w, h, 2.6, 0.12);
      ogeler.push(parca(`c${i}`, cx, cy, (0.3 + rs() * 0.95) * olcek * (t ? 1 : 1.6), 1 + rs() * 0.7, metal, 0.94));
    }
    // eski bant izi: soluk yapışkan kalıntısı ve çevresinde toz çizgisi
    if (bant && rs() < 0.85) {
      const [bx, by, bw, ba] = bant;
      const bh = Math.max(3.5, bw * 0.16);
      ogeler.push(
        <g key="bant" transform={`rotate(${y2(ba + (rs() - 0.5) * 8)} ${bx} ${by})`}>
          {/* yapışkan kalıntısı: uçları yırtık, ortası daha koyu (toz tutmuş) */}
          <path d={`M${y2(bx - bw / 2)} ${y2(by - bh / 2)} H${y2(bx + bw / 2)} l-0.8 ${y2(bh * 0.3)} l1 ${y2(bh * 0.25)} l-0.9 ${y2(bh * 0.45)} H${y2(bx - bw / 2)} l0.7 ${y2(-bh * 0.35)} l-1 ${y2(-bh * 0.3)} Z`} fill="#e9dcb4" opacity={t ? 0.14 : 0.18} />
          {t && <path d={`M${y2(bx - bw / 2)} ${y2(by - bh / 2)} H${y2(bx + bw / 2)} M${y2(bx - bw / 2)} ${y2(by + bh / 2)} H${y2(bx + bw / 2)}`} stroke="#3e3220" strokeOpacity={0.3} strokeWidth={0.45} strokeDasharray={`${y2(bw * 0.22)} 0.8 ${y2(bw * 0.09)} 1.4`} filter={bulanik} />}
        </g>,
      );
    }
  }

  if (tur === "tolex") {
    // astar: kazınan yerde açılan bez / ahşap
    const astar = taban ?? karistir(renk, "#8a7a62", 0.6);
    const n = Math.round((t ? 24 : 7) * siddet);
    for (let i = 0; i < n; i++) {
      const [cx, cy] = kenarNoktasi(rs, x, y, w, h, 3, 0.14);
      ogeler.push(parca(`s${i}`, cx, cy, (0.45 + rs() * 1.2) * olcek * (t ? 1 : 1.5), 1.2 + rs() * 1.4, astar, t ? 0.3 + rs() * 0.28 : 0.5, false));
    }
    // yırtık köşeler: iki köşede tolex kalkmış, altında ahşap
    const ahsap = "#8c6a43";
    ([[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]] as [number, number, number, number][]).forEach(([kx, ky, sx, sy], i) => {
      if (rs() > 0.55) return;
      const L = olcek * (7 + rs() * 7);
      const d = 2 + rs() * 2;
      const p = `M${kx} ${y2(ky + sy * 2)} L${y2(kx + sx * L * 0.35)} ${y2(ky + sy * d * 0.6)} L${y2(kx + sx * L * 0.6)} ${y2(ky + sy * d)} L${y2(kx + sx * L)} ${ky} L${kx} ${ky} Z`;
      const p2 = `M${y2(kx + sx * 2)} ${ky} L${y2(kx + sx * d * 0.7)} ${y2(ky + sy * L * 0.5)} L${y2(kx + sx * d)} ${y2(ky + sy * L * 0.8)} L${kx} ${y2(ky + sy * L)} L${kx} ${ky} Z`;
      ogeler.push(
        <g key={`y${i}`}>
          <path d={p} fill={ahsap} opacity={0.9} />
          <path d={p2} fill={ahsap} opacity={0.85} />
          <path d={p} fill="none" stroke={acik(renk, 0.35)} strokeOpacity={0.5} strokeWidth={0.3} />
        </g>,
      );
    });
    // aşınıp parlamış kenar
    ogeler.push(<g key="kenar">{kenar(acik(renk, 0.45), t ? 0.32 : 0.25, t ? 2.4 : 1.6)}</g>);
    if (t)
      [[x, y], [x + w, y], [x, y + h], [x + w, y + h]].forEach(([kx, ky], i) =>
        ogeler.push(<circle key={`k${i}`} cx={kx} cy={ky} r={y2(olcek * (5 + rs() * 6))} fill={acik(renk, 0.35)} opacity={0.14 + rs() * 0.12} filter={bulanik} />),
      );
  }

  if (tur === "panel") {
    // kararma (oksitlenme): yumuşak koyu lekeler, kenarlarda daha çok
    const kir = taban ?? "#3a2a0e";
    const n = t ? 13 : 3;
    for (let i = 0; i < n; i++) {
      const [cx, cy] = kenarNoktasi(rs, x, y, w, h, Math.min(h * 0.4, 8), 0.45);
      ogeler.push(<ellipse key={`l${i}`} cx={y2(cx)} cy={y2(cy)} rx={y2((3 + rs() * 10) * olcek)} ry={y2((1.5 + rs() * 4) * olcek)} fill={kir} opacity={t ? 0.14 + rs() * 0.18 : 0.16} filter={bulanik} />);
    }
    // parmak izi matlığı: düğmelerin çevresinde soluk, yuvarlak izler (ince halkalarla)
    if (t)
      for (let i = 0; i < 4; i++) {
        const fx = y2(x + w * (0.15 + rs() * 0.7));
        const fy = y2(y + h * (0.3 + rs() * 0.5));
        const fr = Math.min(h * 0.22, 3.2);
        ogeler.push(
          <g key={`p${i}`} transform={`rotate(${y2(rs() * 90 - 45)} ${fx} ${fy})`}>
            <ellipse cx={fx} cy={fy} rx={fr} ry={fr * 1.3} fill="#9a958a" opacity={0.12} filter={bulanik} />
            {[0.35, 0.55, 0.75, 0.95].map((q) => (
              <ellipse key={q} cx={fx} cy={fy} rx={y2(fr * q)} ry={y2(fr * q * 1.3)} fill="none" stroke="#fff" strokeOpacity={0.07} strokeWidth={0.12} />
            ))}
          </g>,
        );
      }
  }

  if (tur === "kumas") {
    // ızgarada güneşten / ışıktan solmuş bölge ve hafif lekeler
    const [cx, cy] = [x + w * (0.15 + rs() * 0.7), y + h * (0.25 + rs() * 0.5)];
    ogeler.push(
      <g key="leke" filter={bulanik}>
        <ellipse cx={y2(cx)} cy={y2(cy)} rx={y2(w * (0.14 + rs() * 0.1))} ry={y2(h * (0.22 + rs() * 0.12))} fill={taban ?? "#d9c9a0"} opacity={t ? 0.13 : 0.12} />
        <ellipse cx={y2(x + w * (0.1 + rs() * 0.8))} cy={y2(y + h * (0.6 + rs() * 0.3))} rx={y2(w * 0.05)} ry={y2(h * 0.07)} fill="#140d05" opacity={t ? 0.22 : 0.14} />
        <ellipse cx={y2(x + w * (0.1 + rs() * 0.8))} cy={y2(y + h * (0.2 + rs() * 0.5))} rx={y2(w * 0.025)} ry={y2(h * 0.04)} fill="#140d05" opacity={t ? 0.16 : 0.1} />
      </g>,
    );
  }

  // çizikler (yalnız tam ayrıntı): ince açık çizgi ve altında koyu gölge
  if (t && tur !== "kumas") {
    const n = Math.round((tur === "panel" ? 7 : 13) * siddet);
    for (let i = 0; i < n; i++) {
      const x0 = x + 3 + rs() * (w - 6);
      const y0 = y + 3 + rs() * (h - 6);
      const l = (tur === "panel" ? 1.5 + rs() * 5 : 3 + rs() * 10) * olcek;
      const ex = x0 + (rs() - 0.5) * l * 2;
      const ey = y0 + (rs() - 0.5) * l * 0.8;
      const d = `M${y2(x0)} ${y2(y0)} Q${y2((x0 + ex) / 2 + (rs() - 0.5) * 3)} ${y2((y0 + ey) / 2 + (rs() - 0.5) * 3)} ${y2(ex)} ${y2(ey)}`;
      ogeler.push(
        <g key={`z${i}`} fill="none" strokeLinecap="round">
          <path d={d} stroke="#000" strokeOpacity={0.18} strokeWidth={0.32} transform="translate(0.12 0.16)" />
          <path d={d} stroke={tur === "tolex" ? acik(renk, 0.45) : "#ffffff"} strokeOpacity={0.16 + rs() * 0.2} strokeWidth={0.22 + rs() * 0.14} />
        </g>,
      );
    }
  }

  return (
    <g pointerEvents="none">
      <defs>
        <clipPath id={id}>
          <rect x={x} y={y} width={w} height={h} rx={rx} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>{ogeler}</g>
    </g>
  );
}
