// Amfi, kabin ve hoparlör çizimleri: tolex kaplı ahşap kasa (önden + üst ve yan yüz), hasır ızgara kumaşı, biyik,
// metal köşeler, kontrol paneli (fırçalanmış altın / siyah / krom / bakır), pilot lambası; kabinlerde kumaşın ardından
// seçilen hoparlörler, metal ızgaralı bas kabininde koniler açıkça görünür. Türlerin klasik görünüşünden yola çıkan
// özgün çizimlerdir: logo yalnız "GuitarFlex" (kitaplık modellerinde), kullanıcı ekipmanında boş kalır.
import type { ReactNode } from "react";
import { CIZIMLER, type Cizim } from "@/lib/rig-cekirdek";
import { Anahtar, Biyik, Dugme, Jak, Kasa, Koseler, Lamba, Led, Tanimlar, Vida, Yazi, acik, etiketYaz, karistir, koyu, kutup, yuzey, type Ctx, type DugmeTur, type Yuzey } from "./temel";

type P = { c: Ctx; r: string; v: number[]; etiket?: string };

// ── Kumaşlar ve ızgaralar ──

export type Kumas = "tuzbiber" | "hasir" | "gumus" | "siyah" | "kahve" | "metal" | "orgu";

const KUMAS_RENK: Record<Exclude<Kumas, "metal" | "orgu">, [string, string, string]> = {
  // zemin, açık iplik, koyu iplik
  tuzbiber: ["#1b1b1b", "#8f8b82", "#0b0b0b"],
  hasir: ["#a88a52", "#dcc48e", "#7a5f31"],
  gumus: ["#7f8186", "#c9cbce", "#34363a"],
  siyah: ["#151515", "#2e2e2e", "#060606"],
  kahve: ["#3e281a", "#6f4c32", "#22150d"],
};
export const kumasOrta = (k: Kumas) => (k === "metal" ? "#1d1e20" : k === "orgu" ? "#141415" : karistir(KUMAS_RENK[k][0], KUMAS_RENK[k][1], 0.35));

/** Kumaş deseni (sepet örgüsü) ya da metal ızgara desenleri */
function KumasDesen({ id, kumas, s }: { id: string; kumas: Kumas; s: number }) {
  if (kumas === "orgu") {
    // genişletilmiş metal (elmas ağ)
    const w = s * 2.2;
    const h = s * 1.3;
    return (
      <pattern id={id} width={w} height={h} patternUnits="userSpaceOnUse">
        <rect width={w} height={h} fill="#050506" />
        <path d={`M0 ${h / 2} L${w / 2} 0 L${w} ${h / 2} L${w / 2} ${h} Z`} fill="none" stroke="#3a3c40" strokeWidth={s * 0.32} />
        <path d={`M0 ${h / 2} L${w / 2} 0 L${w} ${h / 2}`} fill="none" stroke="#6b6e74" strokeWidth={s * 0.1} />
      </pattern>
    );
  }
  if (kumas === "metal") {
    return (
      <pattern id={id} width={s} height={s * 0.866} patternUnits="userSpaceOnUse">
        <rect width={s} height={s * 0.866} fill="#fff" />
        <circle cx={s * 0.25} cy={s * 0.216} r={s * 0.17} fill="#000" />
        <circle cx={s * 0.75} cy={s * 0.65} r={s * 0.17} fill="#000" />
      </pattern>
    );
  }
  const [zemin, ip1, ip2] = KUMAS_RENK[kumas];
  const h = s / 2;
  const ip = h / 3;
  const yatay = (ox: number, oy: number) =>
    [0, 1, 2].map((i) => (
      <g key={`y${ox}${oy}${i}`}>
        <rect x={ox} y={oy + i * ip + ip * 0.12} width={h} height={ip * 0.76} rx={ip * 0.38} fill={i === 1 ? ip2 : ip1} />
        <rect x={ox} y={oy + i * ip + ip * 0.12} width={h} height={ip * 0.25} rx={ip * 0.12} fill="#fff" opacity={0.18} />
      </g>
    ));
  const dikey = (ox: number, oy: number) =>
    [0, 1, 2].map((i) => (
      <g key={`d${ox}${oy}${i}`}>
        <rect x={ox + i * ip + ip * 0.12} y={oy} width={ip * 0.76} height={h} rx={ip * 0.38} fill={i === 1 ? ip1 : ip2} />
        <rect x={ox + i * ip + ip * 0.12} y={oy} width={ip * 0.25} height={h} rx={ip * 0.12} fill="#fff" opacity={0.12} />
      </g>
    ));
  return (
    <pattern id={id} width={s} height={s} patternUnits="userSpaceOnUse">
      <rect width={s} height={s} fill={zemin} />
      {yatay(0, 0)}
      {dikey(h, 0)}
      {dikey(0, h)}
      {yatay(h, h)}
    </pattern>
  );
}

/** Izgara alanı: kumaş (hoparlör gölgeleriyle) ya da metal; `hoparlorler` [cx, cy, r] */
function Izgara({ c, id, x, y, w, h, kumas, rx = 3, hoparlorler = [], hoparlorTur = 0, s = 3.2 }: { c: Ctx; id: string; x: number; y: number; w: number; h: number; kumas: Kumas; rx?: number; hoparlorler?: [number, number, number][]; hoparlorTur?: number; s?: number }) {
  const { u, t } = c;
  const desen = `${u}${id}`;
  if (kumas === "metal") {
    return (
      <g>
        <defs>
          {t && <KumasDesen id={desen} kumas="metal" s={s * 1.15} />}
          {t && (
            <mask id={`${desen}m`} maskUnits="userSpaceOnUse" x={x} y={y} width={w} height={h}>
              <rect x={x} y={y} width={w} height={h} fill={`url(#${desen})`} />
            </mask>
          )}
        </defs>
        <rect x={x} y={y} width={w} height={h} rx={rx} fill="#0b0b0c" />
        {hoparlorler.map(([hx, hy, hr], i) => (
          <Hoparlor key={i} c={c} x={hx} y={hy} r={hr} tur={hoparlorTur} cerceve />
        ))}
        <rect x={x} y={y} width={w} height={h} rx={rx} fill="#232427" mask={t ? `url(#${desen}m)` : undefined} opacity={t ? 1 : 0.55} />
        <rect x={x} y={y} width={w} height={h} rx={rx} fill={`url(#${u}isik)`} mask={t ? `url(#${desen}m)` : undefined} />
        <rect x={x} y={y} width={w} height={h} rx={rx} fill="none" stroke="#000" strokeWidth={1.2} />
      </g>
    );
  }
  return (
    <g>
      <defs>{t && <KumasDesen id={desen} kumas={kumas} s={s} />}</defs>
      <rect x={x} y={y} width={w} height={h} rx={rx} fill={t ? `url(#${desen})` : kumasOrta(kumas)} filter={t && kumas !== "orgu" ? `url(#${u}f-kumas)` : undefined} />
      {/* kumaşın ardından seçilen hoparlörler: koyu daireler ve halka */}
      {hoparlorler.map(([hx, hy, hr], i) => (
        <g key={i}>
          <circle cx={hx} cy={hy} r={hr * 0.98} fill={`url(#${u}golge)`} opacity={kumas === "orgu" ? 0.55 : 0.62} />
          <circle cx={hx} cy={hy} r={hr * 0.3} fill="#000" opacity={0.18} />
          <circle cx={hx} cy={hy} r={hr * 0.9} fill="none" stroke="#000" strokeOpacity={0.16} strokeWidth={hr * 0.06} />
        </g>
      ))}
      {/* kumaşın gerginliği: kenara doğru hafif gölge, üstte ışık */}
      <rect x={x} y={y} width={w} height={h} rx={rx} fill={`url(#${u}isik)`} />
      <rect x={x} y={y} width={w} height={h} rx={rx} fill="none" stroke="#000" strokeOpacity={0.55} strokeWidth={1.4} />
    </g>
  );
}

// ── Hoparlör ──

const HOPARLOR_RENK: [string, string, string][] = [
  // koni, toz kapağı, kapak türü (keçe / parlak / alüminyum)
  ["#2c2520", "#1d1915", "kece"],
  ["#1b1c1e", "#0e0f10", "parlak"],
  ["#8d9096", "#c7cace", "aluminyum"],
];

/** Hoparlör konisi: şase, conta, kenar (surround), kaburgalı koni, toz kapağı. tur: 0 Kor, 1 Kılıç, 2 Kristal */
export function Hoparlor({ c, x, y, r, tur = 0, cerceve = false }: { c: Ctx; x: number; y: number; r: number; tur?: number; cerceve?: boolean }) {
  const { u, t } = c;
  const [koni, kapak, kapakTur] = HOPARLOR_RENK[Math.max(0, Math.min(2, tur))];
  const id = `${u}hp${tur}`;
  return (
    <g>
      <defs>
        <radialGradient id={`${id}k`} cx="0.5" cy="0.5" r="0.5" fx="0.62" fy="0.66">
          <stop offset="0" stopColor={koyu(koni, 0.35)} />
          <stop offset="0.45" stopColor={acik(koni, 0.14)} />
          <stop offset="0.8" stopColor={koni} />
          <stop offset="1" stopColor={koyu(koni, 0.45)} />
        </radialGradient>
        <radialGradient id={`${id}s`} cx="0.5" cy="0.5" r="0.5" fx="0.34" fy="0.3">
          <stop offset="0.82" stopColor={koyu(koni, 0.5)} />
          <stop offset="0.9" stopColor={acik(koni, 0.22)} />
          <stop offset="1" stopColor={koyu(koni, 0.6)} />
        </radialGradient>
        <radialGradient id={`${id}t`} cx="0.36" cy="0.32" r="0.75">
          <stop offset="0" stopColor={kapakTur === "kece" ? acik(kapak, 0.12) : kapakTur === "aluminyum" ? "#ffffff" : "#6a6d72"} />
          <stop offset="0.5" stopColor={kapak} />
          <stop offset="1" stopColor={koyu(kapak, 0.6)} />
        </radialGradient>
        <radialGradient id={`${id}c`} cx="0.36" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#6b7077" />
          <stop offset="0.6" stopColor="#2c2f33" />
          <stop offset="1" stopColor="#141518" />
        </radialGradient>
      </defs>
      {cerceve && (
        <>
          <circle cx={x} cy={y} r={r} fill={`url(#${id}c)`} />
          {Array.from({ length: 8 }, (_, i) => {
            const [bx, by] = kutup(x, y, r * 0.94, i * 45 + 22.5);
            return <Vida key={i} c={c} x={bx} y={by} r={r * 0.035} d={i * 30} />;
          })}
          <circle cx={x} cy={y} r={r * 0.89} fill="#0b0b0c" />
        </>
      )}
      <circle cx={x} cy={y} r={r * 0.86} fill={`url(#${id}s)`} />
      <circle cx={x} cy={y} r={r * 0.775} fill={`url(#${id}k)`} filter={t ? `url(#${u}f-mat)` : undefined} />
      {/* koni kaburgaları: her biri açık + koyu çift çizgi */}
      {[0.69, 0.6, 0.52, 0.45].map((q) => (
        <g key={q} fill="none">
          <circle cx={x} cy={y} r={r * q} stroke="#fff" strokeOpacity={tur === 2 ? 0.2 : 0.07} strokeWidth={r * 0.012} />
          <circle cx={x + r * 0.006} cy={y + r * 0.008} r={r * q - r * 0.012} stroke="#000" strokeOpacity={0.3} strokeWidth={r * 0.012} />
        </g>
      ))}
      <circle cx={x} cy={y} r={r * 0.33} fill="#000" opacity={0.35} />
      <circle cx={x} cy={y} r={r * 0.29} fill={`url(#${id}t)`} />
      {kapakTur !== "kece" && <ellipse cx={x - r * 0.1} cy={y - r * 0.12} rx={r * 0.1} ry={r * 0.06} fill="#fff" opacity={kapakTur === "aluminyum" ? 0.9 : 0.4} transform={`rotate(-35 ${x - r * 0.1} ${y - r * 0.12})`} />}
      {cerceve && <circle cx={x} cy={y} r={r * 0.89} fill="none" stroke="#000" strokeOpacity={0.5} strokeWidth={r * 0.02} />}
    </g>
  );
}

// ── Kasa ayrıntıları ──

function Kayis({ c, x, y, w }: { c: Ctx; x: number; y: number; w: number }) {
  // deri kayış kulp: üst yüzde, iki krom bağlantı
  return (
    <g>
      {[x, x + w].map((bx, i) => (
        <g key={i}>
          <rect x={bx - 5} y={y - 2.4} width={10} height={5} rx={1.6} fill={`url(#${c.u}krom)`} stroke="#3f4349" strokeWidth={0.3} />
          <Vida c={c} x={bx - 2.6} y={y} r={0.9} />
          <Vida c={c} x={bx + 2.6} y={y} r={0.9} />
        </g>
      ))}
      <path d={`M${x + 2} ${y} C${x + w * 0.2} ${y - 11} ${x + w * 0.8} ${y - 11} ${x + w - 2} ${y}`} fill="none" stroke="#050505" strokeWidth={6} strokeLinecap="round" />
      <path d={`M${x + 2} ${y} C${x + w * 0.2} ${y - 11} ${x + w * 0.8} ${y - 11} ${x + w - 2} ${y}`} fill="none" stroke="#2b2622" strokeWidth={4.6} strokeLinecap="round" />
      <path d={`M${x + 5} ${y - 2.6} C${x + w * 0.25} ${y - 11.6} ${x + w * 0.75} ${y - 11.6} ${x + w - 5} ${y - 2.6}`} fill="none" stroke="#fff" strokeOpacity={0.18} strokeWidth={0.8} />
      {c.t && <path d={`M${x + 3} ${y - 0.8} C${x + w * 0.2} ${y - 10.2} ${x + w * 0.8} ${y - 10.2} ${x + w - 3} ${y - 0.8}`} fill="none" stroke="#9b8f80" strokeOpacity={0.45} strokeWidth={0.35} strokeDasharray="1.2 1" />}
    </g>
  );
}

function MetalKulp({ c, x, y, w }: { c: Ctx; x: number; y: number; w: number }) {
  return (
    <g>
      <path d={`M${x} ${y} V${y - 8} Q${x} ${y - 11} ${x + 3} ${y - 11} H${x + w - 3} Q${x + w} ${y - 11} ${x + w} ${y - 8} V${y}`} fill="none" stroke="#000" strokeOpacity={0.4} strokeWidth={4.6} transform="translate(0.8 1)" />
      <path d={`M${x} ${y} V${y - 8} Q${x} ${y - 11} ${x + 3} ${y - 11} H${x + w - 3} Q${x + w} ${y - 11} ${x + w} ${y - 8} V${y}`} fill="none" stroke={`url(#${c.u}krom)`} strokeWidth={3.8} strokeLinecap="round" />
      <path d={`M${x + 3} ${y - 10.4} H${x + w - 3}`} stroke="#fff" strokeOpacity={0.7} strokeWidth={0.7} />
      {[x, x + w].map((bx) => (
        <rect key={bx} x={bx - 4} y={y - 1.5} width={8} height={3.5} rx={1} fill={`url(#${c.u}krom)`} />
      ))}
    </g>
  );
}

type Panel = "altin" | "siyah" | "krom" | "bakir" | "krem" | "gumus" | "koyu";
const PANEL: Record<Panel, { dolgu: (u: string) => string; baski: string; doku: Yuzey }> = {
  altin: { dolgu: (u) => `url(#${u}altin)`, baski: "#1b1408", doku: "firca" },
  siyah: { dolgu: () => "#1d1e21", baski: "#efe9d8", doku: "firca" },
  krom: { dolgu: (u) => `url(#${u}krom)`, baski: "#141518", doku: "firca" },
  bakir: { dolgu: (u) => `url(#${u}bakir)`, baski: "#1b0f06", doku: "firca" },
  krem: { dolgu: () => "#e7dcc0", baski: "#2a2116", doku: "mat" },
  gumus: { dolgu: (u) => `url(#${u}gumus)`, baski: "#121316", doku: "firca" },
  koyu: { dolgu: () => "#2b2d31", baski: "#f2f2f2", doku: "firca" },
};

/** Kontrol paneli: plaka, giriş jakları, düğmeler (adlarıyla), anahtarlar ve pilot lambası */
function KontrolPaneli({ c, x, y, w, h, v, adlar, panel, dugme, lamba, model, ekran }: { c: Ctx; x: number; y: number; w: number; h: number; v: number[]; adlar: string[]; panel: Panel; dugme: DugmeTur; lamba: string; model?: string; ekran?: ReactNode }) {
  const p = PANEL[panel];
  const solBos = 34;
  const sagBos = 46;
  const n = adlar.length;
  const dr = Math.min(h * 0.27, ((w - solBos - sagBos) / Math.max(1, n)) * 0.3);
  const adim = (w - solBos - sagBos) / Math.max(1, n);
  return (
    <g style={{ color: p.baski }}>
      <rect x={x - 0.6} y={y - 0.6} width={w + 1.2} height={h + 1.2} rx={2.2} fill="#000" opacity={0.55} />
      <rect x={x} y={y} width={w} height={h} rx={1.8} fill={p.dolgu(c.u)} filter={yuzey(c, p.doku)} />
      <line x1={x + 2} x2={x + w - 2} y1={y + 0.8} y2={y + 0.8} stroke="#fff" strokeOpacity={0.5} strokeWidth={0.6} />
      {[x + 3.5, x + w - 3.5].map((vx) => (
        <Vida key={vx} c={c} x={vx} y={y + h / 2} r={1.2} d={vx} />
      ))}
      {/* girişler */}
      <Jak c={c} x={x + 13} y={y + h * 0.42} r={Math.min(3.4, h * 0.13)} />
      <Jak c={c} x={x + 24} y={y + h * 0.42} r={Math.min(3.4, h * 0.13)} />
      {c.t && (
        <Yazi x={x + 18.5} y={y + h * 0.42 + 8.5} boy={2.7} renk={p.baski} ara={0.5}>
          GİRİŞ
        </Yazi>
      )}
      {ekran}
      {adlar.map((a, i) => (
        <Dugme key={a} c={c} x={x + solBos + adim * (i + 0.5)} y={y + h * 0.56} r={dr} v={v[i] ?? 5} tur={dugme} isaret={etiketYaz(a)} />
      ))}
      {/* bekleme ve güç anahtarları, pilot lambası */}
      <Anahtar c={c} x={x + w - 38} y={y + h * 0.5} r={2.3} ust={c.on} />
      <Anahtar c={c} x={x + w - 27} y={y + h * 0.5} r={2.3} ust={c.on} />
      <Lamba c={c} x={x + w - 13} y={y + h * 0.5} r={Math.min(4.2, h * 0.15)} renk={lamba} />
      {c.t && (
        <>
          <Yazi x={x + w - 32.5} y={y + h * 0.5 + 10} boy={2.5} renk={p.baski} ara={0.4}>
            BEKLE · GÜÇ
          </Yazi>
          {model && (
            <Yazi x={x + solBos - 2} y={y + h - 3} boy={3} renk={p.baski} hiza="start" ara={0.8} kalin={600} opaklik={0.8}>
              {model.toLocaleUpperCase("tr")}
            </Yazi>
          )}
        </>
      )}
    </g>
  );
}

/** GuitarFlex logosu: el yazısına yakın italik (altın / krem / krom) ya da plaka */
function Logo({ c, x, y, boy, tur }: { c: Ctx; x: number; y: number; boy: number; tur: "altin" | "krem" | "krom" | "plaka" | "beyaz" }) {
  const { u } = c;
  if (!c.t) {
    // ikon: yazı yerine küçük parlak işaret
    return <rect x={x - boy * 1.6} y={y - boy * 0.55} width={boy * 3.2} height={boy * 0.5} rx={boy * 0.2} fill={tur === "altin" ? "#d8b45c" : tur === "krom" || tur === "plaka" ? "#c9ccd1" : "#ece5d2"} opacity={0.85} />;
  }
  if (tur === "plaka") {
    return (
      <g>
        <rect x={x - boy * 4.2 + 0.6} y={y - boy * 1.05 + 0.9} width={boy * 8.4} height={boy * 1.5} rx={boy * 0.3} fill="#000" opacity={0.45} />
        <rect x={x - boy * 4.2} y={y - boy * 1.05} width={boy * 8.4} height={boy * 1.5} rx={boy * 0.3} fill={`url(#${u}krom)`} stroke="#3d4147" strokeWidth={0.4} />
        <Yazi x={x} y={y + boy * 0.02} boy={boy * 0.9} renk="#17181b" font="sans" kalin={800} ara={boy * 0.06}>
          GUITARFLEX
        </Yazi>
      </g>
    );
  }
  const dolgu = tur === "altin" ? `url(#${u}altin)` : tur === "krom" ? `url(#${u}krom)` : tur === "beyaz" ? "#f4f4f2" : "#efe6cf";
  return (
    <g>
      <text x={x + boy * 0.06} y={y + boy * 0.1} textAnchor="middle" fontSize={boy * 1.5} fontWeight={700} fontStyle="italic" fill="#000" fillOpacity={0.55} fontFamily={tur === "beyaz" ? '"Inter Variable", Helvetica, Arial, sans-serif' : 'Georgia, "Times New Roman", serif'} letterSpacing={-boy * 0.04}>
        GuitarFlex
      </text>
      <text x={x} y={y} textAnchor="middle" fontSize={boy * 1.5} fontWeight={700} fontStyle="italic" fill={dolgu} stroke={tur === "altin" ? "#5a4313" : "none"} strokeWidth={boy * 0.03} fontFamily={tur === "beyaz" ? '"Inter Variable", Helvetica, Arial, sans-serif' : 'Georgia, "Times New Roman", serif'} letterSpacing={-boy * 0.04}>
        GuitarFlex
      </text>
    </g>
  );
}

// ── Amfiler ──

type AmfiStil = {
  kafa: boolean;
  w: number;
  h: number;
  doku: Yuzey | "tvid";
  kumas: Kumas;
  /** Izgaranın ön yüzdeki yeri (oran): x, y, w, h */
  izgara: [number, number, number, number];
  /** Panel yeri (oran): y, h */
  panelYer: [number, number];
  panel: Panel;
  dugme: DugmeTur;
  lamba: string;
  hoparlor: [number, number, number][];
  biyik?: string;
  kose?: boolean;
  kulp: "kayis" | "metal" | "yok";
  logo: "altin" | "krem" | "krom" | "plaka" | "beyaz";
  /** Logo yeri (oran) */
  logoYer: [number, number];
  ekstra?: "ekran" | "vu" | "kanal" | "havalandirma";
};

const AMFI: Partial<Record<Cizim, AmfiStil>> = {
  "amfi-kafa": { kafa: true, w: 230, h: 102, doku: "tolex", kumas: "siyah", izgara: [0.05, 0.08, 0.9, 0.5], panelYer: [0.64, 0.28], panel: "altin", dugme: "altin", lamba: "#e3261b", hoparlor: [], biyik: "#e6dcc2", kose: true, kulp: "kayis", logo: "altin", logoYer: [0.5, 0.36] },
  "amfi-modern": { kafa: true, w: 240, h: 106, doku: "tolex", kumas: "orgu", izgara: [0.05, 0.08, 0.9, 0.48], panelYer: [0.62, 0.3], panel: "koyu", dugme: "krom", lamba: "#2f7dff", hoparlor: [], kose: true, kulp: "metal", logo: "plaka", logoYer: [0.5, 0.33], ekstra: "kanal" },
  "amfi-butik": { kafa: true, w: 230, h: 98, doku: "tolex", kumas: "kahve", izgara: [0.05, 0.09, 0.9, 0.48], panelYer: [0.63, 0.29], panel: "siyah", dugme: "sapka", lamba: "#2fbf5a", hoparlor: [], biyik: "#c9a65a", kulp: "kayis", logo: "krem", logoYer: [0.5, 0.35] },
  "amfi-mini": { kafa: true, w: 160, h: 78, doku: "metalik", kumas: "metal", izgara: [0.06, 0.1, 0.88, 0.22], panelYer: [0.42, 0.5], panel: "krom", dugme: "krom", lamba: "#ff9b1a", hoparlor: [], kulp: "metal", logo: "beyaz", logoYer: [0.5, 0.25], ekstra: "havalandirma" },
  "amfi-bas": { kafa: true, w: 240, h: 104, doku: "tolex", kumas: "metal", izgara: [0.05, 0.08, 0.9, 0.44], panelYer: [0.58, 0.34], panel: "gumus", dugme: "siyah", lamba: "#2f7dff", hoparlor: [], kose: true, kulp: "metal", logo: "beyaz", logoYer: [0.5, 0.31], ekstra: "vu" },
  "amfi-kombo": { kafa: false, w: 222, h: 206, doku: "tolex", kumas: "tuzbiber", izgara: [0.055, 0.25, 0.89, 0.69], panelYer: [0.05, 0.16], panel: "siyah", dugme: "altin", lamba: "#e3261b", hoparlor: [[0.5, 0.6, 0.27]], biyik: "#e6dcc2", kose: true, kulp: "kayis", logo: "altin", logoYer: [0.3, 0.35] },
  "amfi-amerikan": { kafa: false, w: 292, h: 200, doku: "tolex", kumas: "gumus", izgara: [0.04, 0.24, 0.92, 0.71], panelYer: [0.045, 0.15], panel: "siyah", dugme: "numarali", lamba: "#e3261b", hoparlor: [[0.29, 0.6, 0.2], [0.71, 0.6, 0.2]], kulp: "kayis", logo: "krom", logoYer: [0.2, 0.34] },
  "amfi-cinlayan": { kafa: false, w: 292, h: 204, doku: "tolex", kumas: "hasir", izgara: [0.05, 0.25, 0.9, 0.69], panelYer: [0.05, 0.15], panel: "bakir", dugme: "tavuk", lamba: "#e3261b", hoparlor: [[0.3, 0.6, 0.2], [0.7, 0.6, 0.2]], biyik: "#efe6cf", kulp: "kayis", logo: "plaka", logoYer: [0.5, 0.33] },
  "amfi-vintage": { kafa: false, w: 176, h: 166, doku: "tvid", kumas: "kahve", izgara: [0.07, 0.27, 0.86, 0.65], panelYer: [0.055, 0.17], panel: "krom", dugme: "tavuk", lamba: "#e3261b", hoparlor: [[0.5, 0.6, 0.28]], kulp: "kayis", logo: "krem", logoYer: [0.33, 0.36] },
  "amfi-kombo-kucuk": { kafa: false, w: 184, h: 172, doku: "plastik", kumas: "metal", izgara: [0.06, 0.29, 0.88, 0.65], panelYer: [0.05, 0.2], panel: "koyu", dugme: "siyah", lamba: "#30d158", hoparlor: [[0.5, 0.615, 0.27]], kulp: "yok", logo: "beyaz", logoYer: [0.5, 0.36], ekstra: "ekran" },
};

const derinlik = (s: AmfiStil): [number, number] => [Math.round(s.w * 0.045), -Math.round(s.w * 0.032)];
const ustPay = (s: AmfiStil) => 6 + -derinlik(s)[1] + (s.kulp === "kayis" ? 10 : s.kulp === "metal" ? 11 : 2);
const amfiBoyut = (s: AmfiStil): [number, number] => [s.w + derinlik(s)[0] + 12, ustPay(s) + s.h + 4];
export const AMFI_BOYUT: Partial<Record<Cizim, [number, number]>> = Object.fromEntries(Object.entries(AMFI).map(([k, s]) => [k, amfiBoyut(s!)]));

function TvidDesen({ id, renk }: { id: string; renk: string }) {
  // diyagonal dokuma (twill) ve vernik
  return (
    <pattern id={id} width={2.4} height={2.4} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width={2.4} height={2.4} fill={renk} />
      <rect width={2.4} height={0.9} fill={koyu(renk, 0.42)} opacity={0.85} />
      <rect y={1.2} width={2.4} height={0.45} fill={acik(renk, 0.25)} opacity={0.6} />
    </pattern>
  );
}

export function AmfiCizimi({ cizim, c, r, v, etiket }: P & { cizim: Cizim }) {
  const s = AMFI[cizim] ?? AMFI["amfi-kafa"]!;
  const { u } = c;
  const [dx, dy] = derinlik(s);
  const X = 6;
  const Y = ustPay(s);
  const { w, h } = s;
  const adlar = CIZIMLER[cizim].dugmeler;
  const tvid = s.doku === "tvid";
  const kaplama = tvid ? (c.t ? `url(#${u}tvid)` : r) : r;
  const [ix, iy, iw, ih] = [X + s.izgara[0] * w, Y + s.izgara[1] * h, s.izgara[2] * w, s.izgara[3] * h];
  const [py, ph] = [Y + s.panelYer[0] * h, s.panelYer[1] * h];
  const hop = s.hoparlor.map(([a, b, rr]) => [X + a * w, Y + b * h, rr * w] as [number, number, number]);
  const panelX = X + w * 0.05;
  const panelW = w * 0.9;

  let ekran: ReactNode = null;
  if (s.ekstra === "ekran") {
    // modelleme kombosu: tür seçici halkası ve küçük ekran (düğmelerin solunda yer açılır)
    const tur = Math.round(((v[0] ?? 5) / 10) * 7);
    ekran = (
      <g>
        <rect x={panelX + panelW - 82} y={py + ph * 0.22} width={30} height={ph * 0.5} rx={2} fill="#050607" stroke="#000" />
        <rect x={panelX + panelW - 81} y={py + ph * 0.22 + 1} width={28} height={ph * 0.5 - 2} rx={1.5} fill={c.on ? "#0c2a3d" : "#0a0c0e"} />
        {c.on && (
          <Yazi x={panelX + panelW - 67} y={py + ph * 0.6} boy={ph * 0.34} renk="#6fd3ff" font="mono">
            {`0${tur + 1}`}
          </Yazi>
        )}
        <rect x={panelX + panelW - 81} y={py + ph * 0.22 + 1} width={28} height={ph * 0.5 - 2} rx={1.5} fill={`url(#${u}cam)`} />
      </g>
    );
  }
  if (s.ekstra === "vu") {
    ekran = <VuGostergesi c={c} x={X + w * 0.1} y={Y + h * 0.13} w={w * 0.2} h={h * 0.34} deger={(v[5] ?? 5) / 10} />;
  }

  return (
    <g>
      <Tanimlar c={c} o={w / 150} seed={cizim.length * 13}>
        {tvid && <TvidDesen id={`${u}tvid`} renk={r} />}
        <linearGradient id={`${u}bakir`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f0b58a" />
          <stop offset="0.45" stopColor="#b36a3c" />
          <stop offset="0.6" stopColor="#d08a58" />
          <stop offset="1" stopColor="#7c4220" />
        </linearGradient>
        <linearGradient id={`${u}gumus`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#eef0f2" />
          <stop offset="0.5" stopColor="#b9bdc3" />
          <stop offset="1" stopColor="#8d9299" />
        </linearGradient>
      </Tanimlar>
      <Kasa
        c={c}
        x={X}
        y={Y}
        w={w}
        h={h}
        d={[dx, dy]}
        renk={tvid ? r : r}
        rx={s.doku === "metalik" ? 4 : 6}
        doku={tvid ? "mat" : s.doku === "tvid" ? "tolex" : (s.doku as Yuzey)}
        ust={
          <>
            {s.ekstra === "havalandirma" &&
              Array.from({ length: 9 }, (_, i) => <rect key={i} x={X + w * 0.22 + i * w * 0.065 + dx * 0.45} y={Y + dy * 0.5 - 1} width={w * 0.04} height={2.2} rx={1.1} fill="#000" opacity={0.6} />)}
            {s.kulp === "kayis" && <Kayis c={c} x={X + w * 0.36 + dx / 2} y={Y + dy / 2} w={w * 0.28} />}
            {s.kulp === "metal" && <MetalKulp c={c} x={X + w * 0.3 + dx / 2} y={Y + dy / 2 + 1} w={w * 0.4} />}
          </>
        }
      >
        {tvid && <rect x={X} y={Y} width={w} height={h} rx={6} fill={kaplama} filter={yuzey(c, "kumas")} />}
        {tvid && <rect x={X} y={Y} width={w} height={h} rx={6} fill={`url(#${u}isik)`} />}
        {/* tvid verniği: kenarlar koyu */}
        {tvid && <rect x={X} y={Y} width={w} height={h} rx={6} fill="none" stroke={koyu(r, 0.45)} strokeOpacity={0.6} strokeWidth={5} />}
        <Izgara c={c} id="iz" x={ix} y={iy} w={iw} h={ih} kumas={s.kumas} hoparlorler={hop} s={w / 70} />
        {s.biyik && <Biyik x={ix - 1.6} y={iy - 1.6} w={iw + 3.2} h={ih + 3.2} rx={3.5} renk={s.biyik} />}
        {etiket && <Logo c={c} x={X + s.logoYer[0] * w} y={Y + s.logoYer[1] * h} boy={s.kafa ? h * 0.1 : h * 0.05} tur={s.logo} />}
        {s.ekstra === "kanal" && (
          <g>
            {["TEMİZ", "CRUNCH", "LEAD"].map((k, i) => (
              <g key={k}>
                <Led c={{ ...c, on: c.on && i === 2 }} x={X + w * 0.8 + i * 9} y={Y + h * 0.17} renk={["#2fd158", "#ffb020", "#ff2a1f"][i]} r={1.5} />
                {c.t && (
                  <Yazi x={X + w * 0.8 + i * 9} y={Y + h * 0.17 + 6} boy={2} renk="#d9d9d9" ara={0.2}>
                    {k}
                  </Yazi>
                )}
              </g>
            ))}
          </g>
        )}
        <KontrolPaneli c={c} x={panelX} y={py} w={panelW} h={ph} v={v} adlar={s.ekstra === "ekran" ? adlar.slice(1) : adlar} panel={s.panel} dugme={s.dugme} lamba={s.lamba} model={etiket} ekran={ekran} />
        {s.ekstra === "ekran" && (
          <g>
            <Dugme c={c} x={panelX + panelW - 100} y={py + ph * 0.5} r={ph * 0.28} v={v[0] ?? 5} tur="krom" isaret="TÜR" />
            {Array.from({ length: 8 }, (_, i) => {
              const [lx, ly] = kutup(panelX + panelW - 100, py + ph * 0.5, ph * 0.4, -135 + (i / 7) * 270);
              const sec = Math.round(((v[0] ?? 5) / 10) * 7) === i;
              return <circle key={i} cx={lx} cy={ly} r={0.9} fill={sec && c.on ? "#ff9f0a" : "#55585e"} />;
            })}
          </g>
        )}
        {s.kose && <Koseler c={c} x={X} y={Y} w={w} h={h} r={s.kafa ? 12 : 14} />}
        {/* ayaklar */}
        {[X + 14, X + w - 22].map((fx) => (
          <rect key={fx} x={fx} y={Y + h - 1} width={10} height={3.5} rx={1.4} fill="#0b0b0c" />
        ))}
      </Kasa>
    </g>
  );
}

/** VU göstergesi: krem kadran, ölçek, ibre, cam yansıması; açıkken sıcak arka ışık */
export function VuGostergesi({ c, x, y, w, h, deger }: { c: Ctx; x: number; y: number; w: number; h: number; deger: number }) {
  const { u, on, t } = c;
  const cx = x + w / 2;
  const cy = y + h * 1.02;
  const R = h * 0.84;
  const aci = -50 + Math.max(0, Math.min(1, deger)) * 100 * (on ? 1 : 0);
  const id = `${u}vu`;
  return (
    <g>
      <defs>
        <radialGradient id={id} cx="0.5" cy="0.9" r="0.95">
          <stop offset="0" stopColor={on ? "#fff3cf" : "#e9dfc2"} />
          <stop offset="0.7" stopColor={on ? "#f1d998" : "#d8cca9"} />
          <stop offset="1" stopColor={on ? "#c9a24e" : "#a99b78"} />
        </radialGradient>
        <clipPath id={`${id}k`}>
          <rect x={x} y={y} width={w} height={h} rx={2} />
        </clipPath>
      </defs>
      <rect x={x - 2} y={y - 2} width={w + 4} height={h + 4} rx={3} fill="#0a0a0b" />
      <rect x={x - 1.2} y={y - 1.2} width={w + 2.4} height={h + 2.4} rx={2.6} fill="none" stroke={`url(#${u}krom)`} strokeWidth={0.9} />
      <g clipPath={`url(#${id}k)`}>
        <rect x={x} y={y} width={w} height={h} fill={`url(#${id})`} />
        <path d={`M${kutup(cx, cy, R, -50).join(" ")} A${R} ${R} 0 0 1 ${kutup(cx, cy, R, 50).join(" ")}`} fill="none" stroke="#2a2216" strokeWidth={h * 0.02} />
        <path d={`M${kutup(cx, cy, R, 22).join(" ")} A${R} ${R} 0 0 1 ${kutup(cx, cy, R, 50).join(" ")}`} fill="none" stroke="#c0281c" strokeWidth={h * 0.07} />
        {Array.from({ length: 11 }, (_, i) => {
          const d = -50 + i * 10;
          const [a, b] = kutup(cx, cy, R, d);
          const [e, f] = kutup(cx, cy, R * (i % 2 ? 0.93 : 0.88), d);
          return <line key={i} x1={a} y1={b} x2={e} y2={f} stroke={d > 22 ? "#c0281c" : "#2a2216"} strokeWidth={h * 0.02} />;
        })}
        {t &&
          ["-20", "-7", "-3", "0", "+3"].map((n, i) => {
            const d = [-46, -16, 4, 22, 44][i];
            const [a, b] = kutup(cx, cy, R * 0.74, d);
            return (
              <text key={n} x={a} y={b} textAnchor="middle" fontSize={h * 0.12} fill={d > 20 ? "#c0281c" : "#2a2216"} fontFamily='Georgia, "Times New Roman", serif' fontWeight={700}>
                {n}
              </text>
            );
          })}
        {t && (
          <text x={cx} y={y + h * 0.72} textAnchor="middle" fontSize={h * 0.16} fill="#2a2216" fontFamily='Georgia, "Times New Roman", serif' fontWeight={700} letterSpacing={h * 0.02}>
            VU
          </text>
        )}
        <line x1={cx} y1={cy} x2={kutup(cx, cy, R * 1.02, aci)[0]} y2={kutup(cx, cy, R * 1.02, aci)[1]} stroke="#141414" strokeWidth={h * 0.025} />
        <rect x={x} y={y + h * 0.8} width={w} height={h * 0.25} fill="#1a1712" />
        <rect x={x} y={y} width={w} height={h} fill={`url(#${u}cam)`} />
      </g>
    </g>
  );
}

// ── Kabinler ──

type KabinStil = {
  w: number;
  h: number;
  kumas: Kumas;
  hoparlor: [number, number, number][];
  biyik?: string;
  kose?: boolean;
  logo: "altin" | "krem" | "krom" | "plaka" | "beyaz";
  logoYer: [number, number];
  /** Eğik üst (oran): ön yüzün üst kısmı geriye yatık */
  egik?: number;
  acikArka?: boolean;
  /** Yan tutamaklar */
  tutamak?: boolean;
  izgaraPay?: number;
};

const KABIN: Partial<Record<Cizim, KabinStil>> = {
  "kabin-4x12": { w: 212, h: 212, kumas: "tuzbiber", hoparlor: [[0.29, 0.3, 0.19], [0.71, 0.3, 0.19], [0.29, 0.72, 0.19], [0.71, 0.72, 0.19]], biyik: "#e6dcc2", kose: true, logo: "altin", logoYer: [0.24, 0.12], tutamak: true },
  "kabin-4x12-modern": { w: 214, h: 222, kumas: "orgu", hoparlor: [[0.29, 0.31, 0.19], [0.71, 0.31, 0.19], [0.29, 0.73, 0.19], [0.71, 0.73, 0.19]], kose: true, logo: "plaka", logoYer: [0.5, 0.1], egik: 0.44, tutamak: true },
  "kabin-2x12": { w: 252, h: 150, kumas: "siyah", hoparlor: [[0.28, 0.53, 0.19], [0.72, 0.53, 0.19]], kose: true, logo: "plaka", logoYer: [0.5, 0.13], tutamak: true },
  "kabin-2x12-acik": { w: 252, h: 150, kumas: "hasir", hoparlor: [[0.28, 0.53, 0.19], [0.72, 0.53, 0.19]], biyik: "#efe6cf", logo: "krem", logoYer: [0.24, 0.17], acikArka: true },
  "kabin-1x12": { w: 172, h: 164, kumas: "gumus", hoparlor: [[0.5, 0.55, 0.3]], kose: true, logo: "krom", logoYer: [0.27, 0.15] },
  "kabin-4x10-bas": { w: 200, h: 226, kumas: "metal", hoparlor: [[0.29, 0.31, 0.175], [0.71, 0.31, 0.175], [0.29, 0.71, 0.175], [0.71, 0.71, 0.175]], kose: true, logo: "beyaz", logoYer: [0.5, 0.94], tutamak: true, izgaraPay: 0.06 },
};

const kabinDerinlik = (s: KabinStil): [number, number] => [Math.round(s.w * 0.06), -Math.round(s.w * 0.04)];
const kabinBoyut = (s: KabinStil): [number, number] => [s.w + kabinDerinlik(s)[0] + 12, 8 - kabinDerinlik(s)[1] + s.h + 4];
export const KABIN_BOYUT: Partial<Record<Cizim, [number, number]>> = Object.fromEntries(Object.entries(KABIN).map(([k, s]) => [k, kabinBoyut(s!)]));

export function KabinCizimi({ cizim, c, r, etiket, hoparlor }: P & { cizim: Cizim; hoparlor: number }) {
  const s = KABIN[cizim] ?? KABIN["kabin-4x12"]!;
  const { u } = c;
  const [dx, dy] = kabinDerinlik(s);
  const X = 6;
  const Y = 8 - dy;
  const { w, h } = s;
  const pay = (s.izgaraPay ?? 0.055) * w;
  const ix = X + pay;
  const iy = Y + pay;
  const iw = w - pay * 2;
  const ih = h - pay * 2 - (s.logo === "beyaz" && s.logoYer[1] > 0.9 ? h * 0.06 : 0);
  const hop = s.hoparlor.map(([a, b, rr]) => [X + a * w, Y + b * h, rr * w] as [number, number, number]);
  const egikY = s.egik ? Y + s.egik * h : 0;
  return (
    <g>
      <Tanimlar c={c} o={w / 150} seed={cizim.length * 11} />
      <Kasa
        c={c}
        x={X}
        y={Y}
        w={w}
        h={h}
        d={[dx, dy]}
        renk={r}
        rx={7}
        doku="tolex"
        ust={
          s.acikArka ? (
            // açık arka: üst yüzün arkasında boşluk, içerisi karanlık
            <path d={`M${X + w * 0.12 + dx * 0.7} ${Y + dy * 0.7} H${X + w * 0.88 + dx * 0.7} L${X + w * 0.88 + dx} ${Y + dy} H${X + w * 0.12 + dx} Z`} fill="#050505" opacity={0.75} />
          ) : null
        }
      >
        <Izgara c={c} id="kz" x={ix} y={iy} w={iw} h={ih} kumas={s.kumas} hoparlorler={hop} hoparlorTur={hoparlor} rx={4} s={w / 66} />
        {s.egik && (
          <g>
            {/* eğik üst: yukarıya bakan yüz daha aydınlık; kırılma çizgisi */}
            <rect x={ix} y={iy} width={iw} height={egikY - iy} fill="#fff" opacity={0.06} />
            <line x1={X} x2={X + w} y1={egikY} y2={egikY} stroke="#000" strokeOpacity={0.55} strokeWidth={1.4} />
            <line x1={X} x2={X + w} y1={egikY + 1} y2={egikY + 1} stroke="#fff" strokeOpacity={0.1} strokeWidth={0.6} />
          </g>
        )}
        {s.biyik && <Biyik x={ix - 1.6} y={iy - 1.6} w={iw + 3.2} h={ih + 3.2} rx={4.5} renk={s.biyik} />}
        {etiket && <Logo c={c} x={X + s.logoYer[0] * w} y={Y + s.logoYer[1] * h} boy={w * 0.034} tur={s.logo} />}
        {s.kose && <Koseler c={c} x={X} y={Y} w={w} h={h} r={15} />}
        {[X + 14, X + w - 26].map((fx) => (
          <rect key={fx} x={fx} y={Y + h - 1} width={12} height={4} rx={1.6} fill="#0b0b0c" />
        ))}
      </Kasa>
      {s.tutamak && (
        // yan yüzde gömme tutamak
        <g>
          <path d={`M${X + w + dx * 0.25} ${Y + h * 0.4 + dy * 0.25} L${X + w + dx * 0.75} ${Y + h * 0.4 + dy * 0.75} V${Y + h * 0.55 + dy * 0.75} L${X + w + dx * 0.25} ${Y + h * 0.55 + dy * 0.25} Z`} fill={`url(#${u}krom)`} opacity={0.85} />
          <path d={`M${X + w + dx * 0.35} ${Y + h * 0.43 + dy * 0.35} L${X + w + dx * 0.65} ${Y + h * 0.43 + dy * 0.65} V${Y + h * 0.52 + dy * 0.65} L${X + w + dx * 0.35} ${Y + h * 0.52 + dy * 0.35} Z`} fill="#0a0a0a" />
        </g>
      )}
    </g>
  );
}

