import Link from "next/link";
import { ArrowRight } from "lucide-react";
import UygulamaSimgesi from "./site/UygulamaSimgesi";
import { seviyeSimgesi } from "@/lib/simge";

export type LevelOption = { title: string; text: string; href: string; /** Seviye simgesi (1–5) */ seviye: number };

/** "Gitarda Nasıl Çalışmalıyım?" seçicisi: orta ve ileri elektro gitar seviyeleri */
export default function LevelPicker({ options }: { options: LevelOption[] }) {
  return (
    <div className="space-y-3">
      {options.map((o) => (
        <Link key={o.title} href={o.href} className="group flex items-center gap-4 card p-5 transition hover:border-ink/20">
          <UygulamaSimgesi simge={seviyeSimgesi(o.seviye)} boyut={44} />
          <span className="flex-1">
            <span className="block font-semibold">{o.title}</span>
            <span className="mt-0.5 block text-sm text-muted">{o.text}</span>
          </span>
          <ArrowRight size={18} className="text-accent transition group-hover:translate-x-0.5" />
        </Link>
      ))}
    </div>
  );
}
