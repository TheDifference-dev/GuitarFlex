import type { ComponentType, ReactNode } from "react";
import {
  Activity, ArrowUpDown, AudioLines, Award, BookOpen, BookOpenText, CalendarDays, Check, ChevronsDown, CirclePlay, Clock, Crown, Drum,
  Dumbbell, Ear, FileMusic, Fingerprint, Flame, Footprints, Gauge, Gem, GraduationCap, Grid3x3, Guitar, Hand, Headphones, Landmark,
  LayoutGrid, Layers, LibraryBig, Lightbulb, ListChecks, Medal, Metronome, MicVocal, Moon, Mountain, Music, Music3, Music4, Palette,
  PenLine, Piano, Pointer, Route, Shapes, Shield, Shuffle, Signpost, Skull, Sparkles, Sprout, Star, Sun, Sunrise, Target, Timer, TreePalm,
  Trophy, User, Wheat, Zap,
} from "lucide-react";
import type { GlifAdi, SimgeTanim } from "@/lib/simge";

/**
 * Uygulamanın tek simge türü: yuvarlatılmış kare (köşe %22,5; destekleyen tarayıcıda süper elips), dolu renk zemin
 * (üstten alta çok hafif ton geçişi), ortada beyaz, tek ağırlıkta çizgi glif. Gölge yok; zeminden ince bir iç çizgiyle ayrılır.
 * Renkler globals.css › --simge-* değişkenlerinden gelir (.uyg-simge). Hangi kurs / ders türü / araç hangi simgeyi
 * alır: src/lib/simge.ts. Sunucu ve istemci bileşenlerinde kullanılabilir.
 */
export type SimgeBoyutu = 24 | 32 | 44 | 60 | 96 | 152;

type Cizgi = { size?: number | string; strokeWidth?: number | string };

/** Özgün glifler: lucide ile aynı ızgara (24 birim), aynı çizgi (yuvarlak uç, dolgu yok) */
const cizim = (ic: ReactNode) =>
  function Glif({ size = 24, strokeWidth = 2 }: Cizgi) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {ic}
      </svg>
    );
  };
const nokta = (cx: number, cy: number, r = 1.6) => <circle cx={cx} cy={cy} r={r} fill="currentColor" />;

/** Beş basamaktan n tanesi dolu (seviye) */
const seviye = (n: number) =>
  cizim(
    <>
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={`M${4 + i * 4} 20V${17 - i * 3.25}`} opacity={i < n ? 1 : 0.4} />
      ))}
    </>,
  );

const GLIF: Record<GlifAdi, ComponentType<Cizgi>> = {
  // Slide: iki perde arasında kayma çizgisi
  slide: cizim(
    <>
      <circle cx="5.5" cy="17.5" r="2.5" />
      <circle cx="18.5" cy="6.5" r="2.5" />
      <path d="m8 15.4 8-6.8" />
    </>,
  ),
  // Bend: yukarı kıvrılan ok
  bend: cizim(
    <>
      <path d="M4 19h3c5.5 0 9-4 9-13" />
      <path d="m12 9.5 4-4.5 4 4.5" />
    </>,
  ),
  // Hammer-on / pull-off: iki notayı birleştiren bağ
  bag: cizim(
    <>
      <path d="M5 11.5c3.5-6 10.5-6 14 0" />
      {nokta(5, 17, 2)}
      {nokta(19, 17, 2)}
    </>,
  ),
  // Legato: art arda bağlı notalar
  legato: cizim(
    <>
      <path d="M4 12c2-4.5 6-4.5 8 0" />
      <path d="M12 12c2-4.5 6-4.5 8 0" />
      {nokta(4, 17.5)}
      {nokta(12, 17.5)}
      {nokta(20, 17.5)}
    </>,
  ),
  // Arpej: kırık akor yazımı (dalgalı çizgi ve üst üste akor sesleri)
  arpej: cizim(
    <>
      <path d="M7.5 3c-2.4 1.5-2.4 3 0 4.5s2.4 3 0 4.5-2.4 3 0 4.5 2.4 3 0 4.5" />
      {nokta(16, 5.5, 2.2)}
      {nokta(16, 12, 2.2)}
      {nokta(16, 18.5, 2.2)}
    </>,
  ),
  // Sweep: tellerin üzerinden tek hareketle geçen pena
  sweep: cizim(
    <>
      <path d="M3 6h9M3 12h9M3 18h9" />
      <path d="M18 4v15" />
      <path d="m14.5 15.5 3.5 3.5 3.5-3.5" />
    </>,
  ),
  // Palm mute: sönümlenen titreşim
  sonum: cizim(<path d="M2.5 12c1.2-7 2.6-7 3.8 0s2.6 6 3.8 0 2.3-4 3.3 0 1.9 2.5 2.7 0 1.5-1.2 2.1 0h3.3" />),
  // Akor kutusu: teller, perdeler, basılan iki nokta
  akor: cizim(
    <>
      <path d="M5 5h14" strokeWidth={3} />
      <path d="M5 5v15M12 5v15M19 5v15M5 12.5h14M5 20h14" opacity="0.6" />
      {nokta(12, 8.75, 2.2)}
      {nokta(5, 16.25, 2.2)}
    </>,
  ),
  "seviye-1": seviye(1),
  "seviye-2": seviye(2),
  "seviye-3": seviye(3),
  "seviye-4": seviye(4),
  "seviye-5": seviye(5),
  "asagi-yukari": ArrowUpDown,
  "cift-asagi": ChevronsDown,
  el: Hand,
  dokunus: Pointer,
  "ses-cizgileri": AudioLines,
  alev: Flame,
  nota: Music,
  "nota-cift": Music4,
  "nota-uclu": Music3,
  palet: Palette,
  filiz: Sprout,
  rota: Route,
  tabela: Signpost,
  kitap: BookOpen,
  "kitap-yazi": BookOpenText,
  katman: Layers,
  davul: Drum,
  izgara: Grid3x3,
  kulak: Ear,
  "nota-kagidi": FileMusic,
  mezuniyet: GraduationCap,
  simsek: Zap,
  kulaklik: Headphones,
  kalem: PenLine,
  mikrofon: MicVocal,
  liste: ListChecks,
  gitar: Guitar,
  metronom: Metronome,
  gosterge: Gauge,
  hedef: Target,
  oynat: CirclePlay,
  kutuphane: LibraryBig,
  yildiz: Star,
  kisi: User,
  sekiller: Shapes,
  doseme: LayoutGrid,
  madalya: Medal,
  odul: Award,
  elmas: Gem,
  tac: Crown,
  kupa: Trophy,
  "ayak-izi": Footprints,
  takvim: CalendarDays,
  saat: Clock,
  halter: Dumbbell,
  ay: Moon,
  "gun-dogumu": Sunrise,
  kronometre: Timer,
  karistir: Shuffle,
  isilti: Sparkles,
  kalkan: Shield,
  ampul: Lightbulb,
  onay: Check,
  piyano: Piano,
  gunes: Sun,
  basak: Wheat,
  "parmak-izi": Fingerprint,
  nabiz: Activity,
  palmiye: TreePalm,
  dag: Mountain,
  kurukafa: Skull,
  anit: Landmark,
};

export default function UygulamaSimgesi({
  simge,
  boyut = 44,
  etiket,
  className = "",
}: {
  simge: SimgeTanim;
  boyut?: SimgeBoyutu;
  /** Simge tek başına anlam taşıyorsa erişilebilir adı; verilmezse süs sayılır (yanında yazı vardır) */
  etiket?: string;
  className?: string;
}) {
  const Glif = GLIF[simge.glif];
  // Glif simgenin %56'sı; küçük boyutlarda çizgi bir tık kalınlaşır (ekranda ~1,3 px'in altına inmesin)
  const g = Math.round(boyut * 0.56);
  return (
    <span
      className={`uyg-simge ${className}`}
      data-renk={simge.renk}
      style={{ width: boyut, height: boyut }}
      role={etiket ? "img" : undefined}
      aria-label={etiket}
      aria-hidden={etiket ? undefined : true}
    >
      <Glif size={g} strokeWidth={boyut <= 24 ? 2.4 : boyut <= 32 ? 2.2 : 2} />
    </span>
  );
}
