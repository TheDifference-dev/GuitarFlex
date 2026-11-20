import AkorKutusu from "@/components/yol/AkorKutusu";
import AkorSemasi from "@/components/yol/AkorSemasi";
import { sekil } from "@/content/dogaclama";
import type { Sema } from "@/lib/alistirma/tipler";
import { olcuAkorlari, type OlcuBirimi } from "@/lib/eslik";

// Quick Study doğaçlama bölümü ve kompozisyon yürüyüşü: akor şeması (slash) ve akor diyagramları.

/** Ölçü başına akorlardan Okuma yolundaki akor şeması */
export function semaKur(chords: string[], ob: OlcuBirimi): Sema {
  return {
    olcu: ob,
    olculer: chords.map((c) => {
      const ad = c.trim().split(/\s+/);
      const vurus = ob[0];
      const ilk = ad.length > 1 ? Math.ceil(vurus / 2) : vurus;
      return { akorlar: ad.map((a, i) => ({ ad: a, vurus: i === 0 ? ilk : vurus - ilk })) };
    }),
  };
}

/** Akor diyagramı biçimi (kalın Mi → ince Mi, "x 0 2 2 1 0"); şekli bilinmeyen akorda null */
function diyagram(ad: string): string | null {
  try {
    const perde = new Map(sekil(ad).split(" ").map((n) => [Number(n.split(".")[1]), n.split(".")[0]]));
    return [6, 5, 4, 3, 2, 1].map((s) => perde.get(s) ?? "x").join(" ");
  } catch {
    return null;
  }
}

export default function AkorSerisi({ chords, ob, ilkOlcu = 1, aktif }: { chords: string[]; ob: OlcuBirimi; ilkOlcu?: number; aktif?: number | null }) {
  const sema = semaKur(chords, ob);
  const adlar = [...new Set(chords.flatMap((c) => c.trim().split(/\s+/)))].filter((a) => olcuAkorlari(a)[0]);
  const diyagramlar = adlar.map((a) => ({ a, d: diyagram(a) })).filter((x): x is { a: string; d: string } => !!x.d);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5" aria-label="Ölçüler">
        {chords.map((c, i) => (
          <span
            key={i}
            className={`rounded-lg border px-2.5 py-1 text-sm font-semibold tabular-nums transition ${aktif === i ? "border-accent bg-accent/15 text-accent" : "border-white/10 bg-white/[0.04]"}`}
          >
            <span className="mr-1.5 text-xs text-muted">{ilkOlcu + i}</span>
            {c}
          </span>
        ))}
      </div>
      <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3">
        <AkorSemasi sema={sema} ilk={ilkOlcu} />
      </div>
      {diyagramlar.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {diyagramlar.map(({ a, d }) => (
            <figure key={a} className="text-center">
              <AkorKutusu sekil={d} boyut={72} />
              <figcaption className="text-xs font-semibold">{a}</figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
