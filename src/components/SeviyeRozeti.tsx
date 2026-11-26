import Link from "next/link";
import type { Level } from "@/content/types";
import { KADEME, kademeOf } from "@/content/seviyeler";

/** Küçük seviye rozeti (Başlangıç … Üst Düzey); tıklanınca o seviyenin Seviye Yolu sayfası açılır */
export default function SeviyeRozeti({ level }: { level: Level }) {
  const k = kademeOf(level);
  return (
    <Link
      href={`/seviye/${k}`}
      title={`Seviye Yolu: ${KADEME[k].ad}`}
      className="rounded-full border border-ink/10 bg-ink/[0.06] px-2 py-0.5 text-[11px] font-semibold text-text/90 transition hover:bg-ink/[0.12] hover:text-text"
    >
      {KADEME[k].ad}
    </Link>
  );
}
