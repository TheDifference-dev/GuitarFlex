import Link from "next/link";
import type { SimgeTanim } from "@/lib/simge";
import UygulamaSimgesi from "./UygulamaSimgesi";

export type IzgaraOgesi = { href: string; ad: string; simge: SimgeTanim };

/** Simge ızgarası: telefonun ana ekranı gibi 8 sütun, simgenin altında kısa ad. Kurslara ve araçlara hızlı erişim. */
export default function SimgeIzgarasi({ ogeler, etiket = "Hızlı erişim" }: { ogeler: IzgaraOgesi[]; etiket?: string }) {
  return (
    <nav aria-label={etiket}>
      <ul className="simge-izgara mx-auto max-w-[900px]">
        {ogeler.map((o) => (
          <li key={o.href}>
            <Link href={o.href}>
              <UygulamaSimgesi simge={o.simge} boyut={60} />
              <span className="line-clamp-2 max-w-[6.5rem]">{o.ad}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
