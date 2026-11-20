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
  // Sade: seviye rengi yok, yalnız yazı; zorlaştıkça vurgu artar
  L1: "border-line text-muted",
  L2: "border-line text-muted",
  L3: "border-line text-text",
  L4: "border-accent/40 text-accent",
  L5: "border-accent/70 text-accent",
};
export function SeviyeEtiketi({ level }: { level: Level }) {
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tabular-nums ${LEVEL_STYLE[level]}`} title={`${level} · ${SEVIYE[level].ad}`}>
      {level} · {SEVIYE[level].ad}
    </span>
  );
}

