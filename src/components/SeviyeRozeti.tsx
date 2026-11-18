import Link from "next/link";
import type { Level } from "@/content/types";
import { SEVIYE } from "@/content/seviyeler";

/** Küçük seviye rozeti (L1…L5); tıklanınca o seviyenin Seviye Yolu sayfası açılır */
export default function SeviyeRozeti({ level }: { level: Level }) {
  return (
    <Link
      href={`/seviye/${level}`}
      title={`Seviye Yolu: ${level} ${SEVIYE[level].ad}`}
      className="rounded-full border border-white/10 bg-white/[0.06] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-text/90 transition hover:bg-white/[0.12] hover:text-text"
    >
      {level}
    </Link>
  );
}
