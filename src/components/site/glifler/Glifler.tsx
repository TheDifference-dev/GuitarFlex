import type { ComponentType, ReactNode } from "react";

/**
 * GuitarFlex'in özgün glifleri: tekniğin kendisini gösteren sade müzik / tab işaretleri.
 * Kurallar (SF Symbols ruhu, ama kopya değil): 24×24 ızgara, 1,75 birim çizgi, yuvarlak uç ve köşe, dolgusuz çizgi;
 * dolu öğeler yalnız nota başı ve perde noktası (aynı optik ağırlık için yarıçap ~2). İkincil çizgiler (teller,
 * perdeler, porte) %50 örtücülükte: ana işaret öne çıkar, 32 px'de de okunur.
 * Uygulama simgesi (UygulamaSimgesi.tsx) bunları beyaz olarak, simgenin %56'sı boyutunda çizer.
 */
export type GlifOzellik = { size?: number | string; strokeWidth?: number | string };

const IKINCIL = 0.5;

const glif = (ic: ReactNode) =>
  function Glif({ size = 24, strokeWidth = 1.75 }: GlifOzellik) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {ic}
      </svg>
    );
  };

/** Perde noktası / parmak (dolu daire) */
const nokta = (cx: number, cy: number, r = 2) => <circle cx={cx} cy={cy} r={r} fill="currentColor" stroke="none" />;
/** Nota başı: hafif eğik dolu elips */
const bas = (cx: number, cy: number) => <ellipse cx={cx} cy={cy} rx={2.3} ry={1.7} transform={`rotate(-20 ${cx} ${cy})`} fill="currentColor" stroke="none" />;
/** Saplı nota: baş + sağdan yukarı sap */
const nota = (cx: number, cy: number, sap = 8) => (
  <>
    {bas(cx, cy)}
    <path d={`M${cx + 2} ${cy - 0.6}V${cy - sap}`} />
  </>
);
/** Ok: gövde + uçta iki kanat (yön gövdeden hesaplanır) */
function ok(x1: number, y1: number, x2: number, y2: number, kanat = 3.6) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const k = (d: number) => `${(x2 - kanat * Math.cos(a + d)).toFixed(2)} ${(y2 - kanat * Math.sin(a + d)).toFixed(2)}`;
  return (
    <>
      <path d={`M${x1} ${y1}L${x2} ${y2}`} />
      <path d={`M${k(0.7)}L${x2} ${y2}L${k(-0.7)}`} />
    </>
  );
}
/** İkincil (yarı örtücü) çizgiler: teller, perdeler, porte */
const ikincil = (d: string) => <path d={d} opacity={IKINCIL} />;

// ── Teknikler ────────────────────────────────────────────────────────────────

/** Slide: iki perde noktası arasında eğik kayma çizgisi */
const Slide = glif(
  <>
    {nokta(5, 17.5, 2.25)}
    {nokta(19, 6.5, 2.25)}
    <path d="M7.6 15.4 16.4 8.6" />
  </>,
);

/** Bend: nota başından yukarı kıvrılan ok, ucunda kısa yay (çekme miktarı) */
const Bend = glif(
  <>
    {bas(5.5, 19)}
    <path d="M8 18.6c5.5 0 8.5-3.2 8.5-11" />
    <path d="m13.2 10.6 3.3-3.6 3.3 3.6" />
    <path d="M12.8 3.6c2.4-1.3 5-1.3 7.4 0" />
  </>,
);

/** Vibrato: dalgalı çizgi */
const Vibrato = glif(
  <>
    {bas(4.5, 17)}
    <path d="M3 11.5c1.5-3 3-3 4.5 0s3 3 4.5 0 3-3 4.5 0 3 3 4.5 0" />
  </>,
);

/** Bend ve vibrato: nota başından dalgalanıp yukarı kıvrılan ok */
const BendVibrato = glif(
  <>
    {bas(4.5, 19)}
    <path d="M7 19c.9-1.8 1.8-1.8 2.7 0s1.8 1.8 2.7 0" />
    <path d="M12.4 19c4 0 6.1-3.4 6.1-10.5" />
    <path d="m15.2 11.6 3.3-3.6 3.3 3.6" />
    <path d="M14.8 4.6c2.4-1.3 5-1.3 7.4 0" />
  </>,
);

/** Hammer-on: bağ yayı ve altında yükselen iki nota */
const HammerOn = glif(
  <>
    {bas(6, 18)}
    {bas(18, 11)}
    <path d="M4.5 13.5C6 7.5 12 4.5 19 6.5" />
  </>,
);

/** Pull-off: bağ yayı ve altında alçalan iki nota */
const PullOff = glif(
  <>
    {bas(6, 11)}
    {bas(18, 18)}
    <path d="M5 6.5c7-2 13 1 14.5 7" />
  </>,
);

/** Legato: uzun bağ yayının altında üç nota */
const Legato = glif(
  <>
    {bas(4.8, 17.5)}
    {bas(12, 17.5)}
    {bas(19.2, 17.5)}
    <path d="M3 12.5C6.5 5 17.5 5 21 12.5" />
  </>,
);

/** Palm mute: kesik çizgi (P.M.), teller, köprü ve tellere yaslanan el kenarı */
const PalmMute = glif(
  <>
    <path d="M3 4h2.5M9.5 4H12M16 4h2.5" />
    {ikincil("M3 15h16M3 19h16")}
    <path d="M19.5 11v10" />
    <path d="M6 21c0-5.5 4-9.5 11.5-9.5" />
  </>,
);

/** Arpej: basamaklı yükselen üç nota */
const Arpej = glif(
  <>
    {nota(5, 20, 7.5)}
    {nota(11.5, 15.5, 7.5)}
    {nota(18, 11, 7.5)}
  </>,
);

/** Strumming: tellerin üzerinden aşağı ve yukarı oklar */
const Strumming = glif(
  <>
    {ikincil("M3 9.5h18M3 14.5h18")}
    {ok(8, 3.5, 8, 20.5)}
    {ok(16, 20.5, 16, 3.5)}
  </>,
);

/** Alternate: aşağı (⊓) ve yukarı (∨) pena işaretleri */
const Alternate = glif(
  <>
    <path d="M3.5 18V7.5h7.5V18" />
    <path d="m14 7.5 3.25 10.5 3.25-10.5" />
  </>,
);

/** Economy: tek yönde iki teli birden geçen süpürme oku */
const Economy = glif(
  <>
    {ikincil("M3 8.5h18M3 15.5h18")}
    {ok(7.5, 3.5, 15.5, 20.5)}
  </>,
);

/** Sweep: beş telin üzerinden geçen uzun eğik ok */
const Sweep = glif(
  <>
    {ikincil("M3 4.5h18M3 8.25h18M3 12h18M3 15.75h18M3 19.5h18")}
    {ok(6, 2.5, 18, 21.5, 4)}
  </>,
);

/** Hybrid picking: pena (yuvarlak üçgen) + parmak (nokta), altta tel */
const Hybrid = glif(
  <>
    <path d="M3.5 6.6c0-1.6 1.2-2.1 5-2.1s5 .5 5 2.1c0 2.9-3.2 7.4-5 7.4s-5-4.5-5-7.4Z" />
    {nokta(18, 13.5, 2.4)}
    {ikincil("M3 19.5h18")}
  </>,
);

/** Tapping: sapa dokunan parmak ucu ve dokunma noktası */
const Tapping = glif(
  <>
    <path d="M9 2.5v8a3 3 0 0 0 6 0v-8" />
    {ikincil("M3 16h18M3 21h18M7 16v5M17 16v5")}
    {nokta(12, 16, 2.1)}
  </>,
);

/** Kromatik ısınma: bir telde dört ardışık perde noktası */
const Kromatik = glif(
  <>
    {ikincil("M2.5 12h19M7 7.5v9M12 7.5v9M17 7.5v9")}
    {nokta(4.5, 12)}
    {nokta(9.5, 12)}
    {nokta(14.5, 12)}
    {nokta(19.5, 12)}
  </>,
);

/** Akor: akor diyagramı ızgarası (eşik, teller, perdeler, basılan noktalar) */
const Akor = glif(
  <>
    <path d="M4.5 4h15" strokeWidth={2.75} />
    {ikincil("M4.5 4v16.5M9.5 4v16.5M14.5 4v16.5M19.5 4v16.5M4.5 9.5h15M4.5 15h15M4.5 20.5h15")}
    {nokta(9.5, 6.75)}
    {nokta(14.5, 12.25)}
    {nokta(19.5, 12.25)}
  </>,
);

/** Rehber (başlangıç): noktalı patika, dolu başlangıç ve açık hedef */
const RehberBaslangic = glif(
  <>
    {nokta(5.5, 19, 2.25)}
    <path d="M8 18.5c6 0 9-1.5 9-5.5s-10-2.5-10-6.5c0-2 2-3 5-3" strokeDasharray="0.1 3.2" />
    <circle cx="17.5" cy="3.75" r="2.25" />
  </>,
);

/** Rehber (sonraki adım): noktalı patika ve bayrak */
const Rehber = glif(
  <>
    <circle cx="5.5" cy="19" r="2.25" />
    <path d="M8 18.5c6 0 9-1.5 9-5.5s-10-2.5-10-6.5c0-1.4.9-2.3 2.3-2.8" strokeDasharray="0.1 3.2" />
    <path d="M14 10V2.5l5.5 2.5-5.5 2.5" />
  </>,
);

/** Müzisyenlik: ışınla bağlı iki sekizlik nota */
const NotaCift = glif(
  <>
    {bas(6.5, 18.5)}
    {bas(16.5, 16.5)}
    <path d="M8.5 17.9V6.5M18.5 15.9V4.5" />
    <path d="m8.5 6.5 10-2" strokeWidth={2.75} />
  </>,
);

/** Stiller: üç farklı dalga biçimi (yumuşak, köşeli, testere) */
const Stiller = glif(
  <>
    <path d="M3 6c1.5-2.7 3-2.7 4.5 0s3 2.7 4.5 0 3-2.7 4.5 0 3 2.7 4.5 0" />
    <path d="M3 13.5h3v-3h4.5v3H15v-3h4.5v3H21" />
    <path d="m3 20.5 6-4v4l6-4v4l6-4" />
  </>,
);

// ── Teori yolları ────────────────────────────────────────────────────────────

/** Ritim: ışınla bağlı nota çubukları (on altılık) */
const Ritim = glif(
  <>
    {bas(4.5, 19)}
    {bas(11.5, 19)}
    {bas(18.5, 19)}
    <path d="M6.5 18.4V5M13.5 18.4V5M20.5 18.4V5" />
    <path d="M6.5 5h14" strokeWidth={2.5} />
    <path d="M6.5 8.75h14" />
  </>,
);

/** Klavye: sap ızgarası (teller, perdeler, işaret noktası) */
const Klavye = glif(
  <>
    <rect x="2.5" y="5.5" width="19" height="13" rx="2" />
    {ikincil("M2.5 9.83h19M2.5 14.17h19M8.83 5.5v13M15.17 5.5v13")}
    {nokta(12, 12, 2)}
  </>,
);

/** Kulak: kulak kepçesi ve iç kıvrım */
const Kulak = glif(
  <>
    <path d="M6.5 9.5a6 6 0 1 1 12 0c0 3.2-2.4 4.2-3.3 6.3-.7 1.7-1.4 5.2-4.7 5.2-1.6 0-2.8-.9-3.4-2.1" />
    <path d="M9.5 9.8a3 3 0 0 1 6 0c0 1.7-1.6 2.2-2.6 3.2" />
  </>,
);

/** Okuma: porte ve üzerinde bir nota */
const Okuma = glif(
  <>
    {ikincil("M2.5 6h19M2.5 9.5h19M2.5 13h19M2.5 16.5h19M2.5 20h19")}
    {bas(11, 14.75)}
    <path d="M13 14.15V3" />
  </>,
);

/** Armoni: aynı sapta istif üç nota (akor) */
const Armoni = glif(
  <>
    {ikincil("M3 8h18M3 13h18M3 18h18")}
    {bas(11, 20.5)}
    {bas(11, 15.5)}
    {bas(11, 10.5)}
    <path d="M13 19.9V3" />
  </>,
);

export const OZGUN_GLIFLER = {
  slide: Slide,
  bend: Bend,
  vibrato: Vibrato,
  "bend-vibrato": BendVibrato,
  "hammer-on": HammerOn,
  "pull-off": PullOff,
  legato: Legato,
  "palm-mute": PalmMute,
  arpej: Arpej,
  strumming: Strumming,
  alternate: Alternate,
  economy: Economy,
  sweep: Sweep,
  hybrid: Hybrid,
  tapping: Tapping,
  kromatik: Kromatik,
  akor: Akor,
  "rehber-baslangic": RehberBaslangic,
  rehber: Rehber,
  "nota-cift": NotaCift,
  stiller: Stiller,
  ritim: Ritim,
  klavye: Klavye,
  kulak: Kulak,
  okuma: Okuma,
  armoni: Armoni,
} satisfies Record<string, ComponentType<GlifOzellik>>;

export type OzgunGlif = keyof typeof OZGUN_GLIFLER;

/** Marka sayfasındaki glif kataloğu için Türkçe adlar */
export const OZGUN_GLIF_ADI: Record<OzgunGlif, string> = {
  slide: "Slide",
  bend: "Bend",
  vibrato: "Vibrato",
  "bend-vibrato": "Bend + vibrato",
  "hammer-on": "Hammer-on",
  "pull-off": "Pull-off",
  legato: "Legato",
  "palm-mute": "Palm mute",
  arpej: "Arpej",
  strumming: "Strumming",
  alternate: "Alternate",
  economy: "Economy",
  sweep: "Sweep",
  hybrid: "Hybrid",
  tapping: "Tapping",
  kromatik: "Kromatik",
  akor: "Akor",
  "rehber-baslangic": "Rehber (başlangıç)",
  rehber: "Rehber",
  "nota-cift": "Müzisyenlik",
  stiller: "Stiller",
  ritim: "Ritim",
  klavye: "Klavye",
  kulak: "Kulak",
  okuma: "Okuma",
  armoni: "Armoni",
};
