// Şarkı kapağı: albüm kapakları telifli olduğu için uygulamaya gömülmez, indirilmez. Her şarkıya sanatçı ve şarkı
// adından türetilen ÖZGÜN bir kapak çizilir (SVG): iki tonlu degrade, desen (plak oyukları, çapraz şeritler, ışık
// lekeleri ya da dalgalar), tür simgesi (riff: şimşek, solo: pena, şarkı: nota, akustik: ses deliği) ve sanatçının
// baş harfleri. Aynı şarkı her yerde aynı kapağı alır (belirlenimci), sunucuda da çizilir (kanca yok).

export type KapakTuru = "riff" | "solo" | "şarkı" | "akustik";

/** FNV-1a (32 bit): adın kararlı özeti */
function ozet(s: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** Sanatçının baş harfleri: "Black Sabbath" → BS, "AC/DC" → AC, "Duman" → DU */
export function basHarfler(sanatci: string) {
  const temiz = sanatci.replace(/^(the|a)\s+/i, "").trim();
  const kelimeler = temiz.split(/[\s/&+\-.]+/).filter((k) => /\p{L}|\d/u.test(k));
  if (kelimeler.length >= 2) return (kelimeler[0][0] + kelimeler[1][0]).toUpperCase();
  const k = kelimeler[0] ?? "?";
  return k.slice(0, 2).toUpperCase();
}

/** Kapak renkleri ve deseni (testler ve kart arka planları için de kullanılır) */
export function kapakTanimi(sanatci: string, baslik: string) {
  const h = ozet(`${sanatci}|${baslik}`);
  const ton1 = h % 360;
  const ton2 = (ton1 + 35 + ((h >>> 9) % 70)) % 360;
  const doy = 62 + ((h >>> 5) % 18);
  const desen = (h >>> 17) % 4;
  const aci = 20 + ((h >>> 21) % 50);
  return { h, ton1, ton2, doy, desen, aci, r1: `hsl(${ton1} ${doy}% 52%)`, r2: `hsl(${ton2} ${doy + 8}% 30%)` };
}

const SIMGE: Record<KapakTuru, string> = {
  // Şimşek (riff)
  riff: "M13 2 4 14h6l-1 8 9-12h-6l1-8Z",
  // Pena (solo)
  solo: "M12 2c4.6 0 8 1.6 8 4.6 0 4.5-4.6 11-7 14.4a1.2 1.2 0 0 1-2 0C8.6 17.6 4 11.1 4 6.6 4 3.6 7.4 2 12 2Z",
  // Çift nota (şarkı)
  şarkı: "M9 18.5a3 3 0 1 1-2-2.83V5.2l12-2.7v13a3 3 0 1 1-2-2.83V7.1L9 8.9v9.6Z",
  // Ses deliği ve teller (akustik)
  akustik: "M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm0 3.2a4.8 4.8 0 1 1 0 9.6 4.8 4.8 0 0 1 0-9.6Z",
};
const TUR_ADI: Record<KapakTuru, string> = { riff: "Riff", solo: "Solo", şarkı: "Şarkı", akustik: "Akustik" };

/**
 * Özgün şarkı kapağı (kare SVG). `boyut` verilmezse kabını doldurur (genişlik %100). Ekran okuyucuya kapak değil,
 * yanındaki başlık okunur (aria-hidden); `etiketli` ile "Enter Sandman kapağı" adı verilir.
 */
export default function SarkiKapagi({
  sanatci,
  baslik,
  tur = "şarkı",
  boyut,
  className = "",
  etiketli = false,
  koseYaricap = 0,
  oran = "kare",
}: {
  sanatci: string;
  baslik: string;
  tur?: KapakTuru;
  boyut?: number;
  className?: string;
  etiketli?: boolean;
  /** viewBox biriminde (kısa kenar 200 / 180 üzerinden) köşe yuvarlaklığı */
  koseYaricap?: number;
  /** kare (200×200) ya da geniş kart başı (320×180, 16:9) */
  oran?: "kare" | "genis";
}) {
  const k = kapakTanimi(sanatci, baslik);
  const W = oran === "genis" ? 320 : 200;
  const H = oran === "genis" ? 180 : 200;
  const id = `gfk${k.h.toString(36)}${oran === "genis" ? "g" : ""}`;
  const harf = basHarfler(sanatci);
  const acik = `hsl(${k.ton1} ${k.doy}% 78% / 0.55)`;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={boyut}
      height={boyut}
      className={`block ${boyut ? "" : "h-auto w-full"} ${className}`}
      role={etiketli ? "img" : undefined}
      aria-label={etiketli ? `${baslik} (${sanatci}) için özgün kapak` : undefined}
      aria-hidden={etiketli ? undefined : true}
      data-sarki-kapagi
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`${id}d`} x1="0" y1="0" x2="1" y2="1" gradientTransform={`rotate(${k.aci - 45} .5 .5)`}>
          <stop offset="0" stopColor={k.r1} />
          <stop offset="1" stopColor={k.r2} />
        </linearGradient>
        <radialGradient id={`${id}p`} cx=".28" cy=".22" r=".9">
          <stop offset="0" stopColor="#fff" stopOpacity=".28" />
          <stop offset=".55" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${id}k`}>
          <rect width={W} height={H} rx={koseYaricap} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}k)`}>
        <rect width={W} height={H} fill={`url(#${id}d)`} />
        {k.desen === 0 && (
          // Plak oyukları
          <g fill="none" stroke="#000" strokeOpacity=".14">
            {Array.from({ length: 9 }, (_, i) => (
              <circle key={i} cx={W - 50} cy={H - 50} r={24 + i * 14} strokeWidth={i % 3 === 0 ? 3 : 1.4} />
            ))}
            <circle cx={W - 50} cy={H - 50} r="14" fill={acik} stroke="none" />
          </g>
        )}
        {k.desen === 1 && (
          // Çapraz şeritler
          <g transform={`rotate(${k.aci} ${W / 2} ${H / 2})`} fill="#fff" fillOpacity=".1">
            {Array.from({ length: 9 }, (_, i) => (
              <rect key={i} x="-120" y={-120 + i * 52} width={W + 240} height={10 + ((k.h >>> i) % 18)} />
            ))}
          </g>
        )}
        {k.desen === 2 && (
          // Işık lekeleri
          <g fill={acik}>
            <circle cx={40 + (k.h % 60)} cy={H - 50 - ((k.h >>> 3) % 50)} r="46" opacity=".55" />
            <circle cx={W - 50 - ((k.h >>> 6) % 40)} cy={50 + ((k.h >>> 8) % 40)} r="30" opacity=".45" />
            <circle cx={W - 30} cy={H - 30} r="64" opacity=".25" />
          </g>
        )}
        {k.desen === 3 && (
          // Ses dalgaları
          <g fill="none" stroke="#fff" strokeOpacity=".16" strokeWidth="3">
            {Array.from({ length: 6 }, (_, i) => (
              <path key={i} d={`M-10 ${H * 0.35 + i * 22} q 35 -${18 + i * 3} 70 0 t 70 0 t 70 0 t 70 0 t 70 0`} />
            ))}
          </g>
        )}
        <rect width={W} height={H} fill={`url(#${id}p)`} />
        <text
          x="18"
          y={H - 22}
          fill="#fff"
          fontSize={oran === "genis" ? 64 : harf.length > 1 ? 74 : 92}
          fontWeight="700"
          letterSpacing="-4"
          fontFamily="var(--font-display), system-ui, sans-serif"
          style={{ paintOrder: "stroke" }}
          stroke="#000"
          strokeOpacity=".08"
          strokeWidth="2"
        >
          {harf}
        </text>
        <g transform={`translate(${W - 50} 18)`}>
          <circle cx="16" cy="16" r="18" fill="#000" fillOpacity=".22" />
          <g transform="translate(4 4)" fill="#fff">
            <path d={SIMGE[tur]} fillRule="evenodd" />
          </g>
        </g>
        <text x="18" y="34" fill="#fff" fillOpacity=".85" fontSize="15" fontWeight="600" letterSpacing="1.5" fontFamily="var(--font-sans), system-ui, sans-serif">
          {TUR_ADI[tur].toLocaleUpperCase("tr")}
        </text>
      </g>
    </svg>
  );
}

/** Popüler şarkının kapak türü: Akustik etiketliler akustik, yoksa riff / solo / şarkı */
export const kapakTuru = (s: { kind: string; tags?: string[] }): KapakTuru => (s.tags?.includes("Akustik") ? "akustik" : s.kind === "riff" ? "riff" : s.kind === "solo" ? "solo" : "şarkı");
