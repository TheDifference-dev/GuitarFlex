import type { ComponentType } from "react";
import {
  Activity, Award, FolderOpen, Search, BookOpen, BookOpenText, CalendarDays, Check, Clock, Crown, Dumbbell, FileMusic, Fingerprint, Flame, Footprints,
  Gauge, Gem, GraduationCap, Guitar, Headphones, Landmark, LayoutGrid, LibraryBig, Lightbulb, ListChecks, Medal, Metronome, MicVocal,
  Moon, Mountain, Music, Music3, Piano, PenLine, CirclePlay, Shapes, Shield, Shuffle, Skull, Sparkles, Star, Sun, Sunrise, Target,
  Timer, TreePalm, Trophy, User, Wheat, Zap,
} from "lucide-react";
import type { GlifAdi, SimgeTanim } from "@/lib/simge";
import { OZGUN_GLIFLER, type GlifOzellik } from "./glifler/Glifler";

/**
 * Uygulamanın tek simge türü (iPhone uygulama simgesi gibi): yuvarlatılmış kare (köşe %22,5; destekleyen tarayıcıda
 * süper elips), üstten alta hafifçe koyulaşan tek renk zemin, ortada beyaz, tek kalınlıkta çizgi glif.
 * Renkler globals.css › --simge-<renk> değişkenlerinden gelir ([data-renk] → --r1/--r2). Hangi kurs / ders türü / araç
 * hangi renk ve glifi alır: src/lib/simge.ts (kurslar için tek tablo: KURS_SIMGELERI). Glifler: ./glifler/Glifler.tsx
 * (özgün) ve lucide (aynı ızgara, aynı çizgi). Sunucu ve istemci bileşenlerinde kullanılabilir.
 */
export type SimgeBoyutu = 24 | 32 | 44 | 60 | 96 | 152;

/** Beş basamaktan n tanesi dolu (seviye) */
const seviye = (n: number) =>
  function Seviye({ size = 24, strokeWidth = 1.75 }: GlifOzellik) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M${4 + i * 4} 20V${17 - i * 3.25}`} opacity={i < n ? 1 : 0.4} />
        ))}
      </svg>
    );
  };

const GLIF: Record<GlifAdi, ComponentType<GlifOzellik>> = {
  ...OZGUN_GLIFLER,
  "seviye-1": seviye(1),
  "seviye-2": seviye(2),
  "seviye-3": seviye(3),
  "seviye-4": seviye(4),
  "seviye-5": seviye(5),
  nota: Music,
  "nota-uclu": Music3,
  kitap: BookOpen,
  "kitap-yazi": BookOpenText,
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
  alev: Flame,
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
  ara: Search,
  klasor: FolderOpen,
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
  // Glif simgenin %56'sı; çizgi 24'lük ızgarada 1,75. 32 px ve altında bir tık kalınlaşır (ekranda ~1,3 px'in altına inmesin).
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
      <Glif size={g} strokeWidth={boyut <= 24 ? 2.25 : boyut <= 32 ? 2 : 1.75} />
    </span>
  );
}
