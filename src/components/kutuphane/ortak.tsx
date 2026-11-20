// Şarkı Kütüphanesi: sunucu ve tarayıcıda ortak küçük parçalar (rol adları, süre biçimi, seviye etiketi)
import type { Level, LibraryTrackRole } from "@/content/types";
import { SEVIYE } from "@/content/seviyeler";

export const ROL_ADI: Record<LibraryTrackRole, string> = {
  lead: "Kurşun gitar",
  rhythm: "Ritim gitar",
  bass: "Bas",
  drums: "Davul",
  keys: "Piyano",
  strings: "Yaylılar",
  organ: "Org",
};
export const sure = (sn: number) => `${Math.floor(sn / 60)}:${String(sn % 60).padStart(2, "0")}`;

const LEVEL_STYLE: Record<Level, string> = {
  L1: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  L2: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  L3: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  L4: "border-orange-400/30 bg-orange-400/10 text-orange-300",
  L5: "border-rose-400/30 bg-rose-400/10 text-rose-300",
};
export function SeviyeEtiketi({ level }: { level: Level }) {
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tabular-nums ${LEVEL_STYLE[level]}`} title={`${level} · ${SEVIYE[level].ad}`}>
      {level} · {SEVIYE[level].ad}
    </span>
  );
}

