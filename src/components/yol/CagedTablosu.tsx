import { ArrowRight } from "lucide-react";
import { CAGED_MAJOR, CAGED_MINOR, kokTelleri, kokTelYazisi, type CagedSatir, type CagedSekil } from "@/content/caged";

// CAGED sistemi tablosu: her açık akor şekli ve 2 perde (tam ses) yukarı taşınmış hâli, parmak numaralarıyla.
// Kök notalar vurgu renginde; barre, işaret ya da yüzük parmağıyla basılan ortak perde çizgisidir.

const W = 136;
const H = 168;
const SOL = 22;
const UST = 30;
const TEL = (W - SOL - 14) / 5;
const PERDE = 24;
const SATIR = 5;

function CagedKutusu({ s }: { s: CagedSekil }) {
  const perdeler = [...s.perde].map((c) => (c === "x" ? null : Number(c)));
  const parmak = [...s.parmak].map(Number);
  const kok = new Set(kokTelleri(s));
  const tx = (i: number) => SOL + i * TEL;
  const py = (f: number) => UST + (f - 0.5) * PERDE;
  const barreTel = (i: number) => s.barre && perdeler[i] === s.barre.perde && i >= s.barre.ilk && i <= s.barre.son;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label={`${s.ad} (${s.okunus}) akor diyagramı: ${[...s.perde].join(" ")}`} className="shrink-0">
      <rect x={tx(0)} y={UST - 4} width={tx(5) - tx(0)} height={4} className="fill-[var(--text)]" />
      {Array.from({ length: SATIR + 1 }, (_, r) => (
        <line key={`p${r}`} x1={tx(0)} x2={tx(5)} y1={UST + r * PERDE} y2={UST + r * PERDE} className="stroke-[var(--muted)]" strokeWidth={1} />
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <line key={`t${i}`} x1={tx(i)} x2={tx(i)} y1={UST} y2={UST + SATIR * PERDE} className="stroke-[var(--text)]" strokeOpacity={0.75} strokeWidth={1} />
      ))}
      {[3, 5].map((f) => (
        <text key={`n${f}`} x={4} y={py(f) + 4} className="fill-[var(--muted)] text-[10px]">
          {f}
        </text>
      ))}
      {s.barre ? (
        <g>
          <rect
            x={tx(s.barre.ilk) - 8}
            y={py(s.barre.perde) - 8}
            width={tx(s.barre.son) - tx(s.barre.ilk) + 16}
            height={16}
            rx={8}
            className="fill-[var(--text)]"
          />
          <text x={tx(s.barre.son) + 10} y={py(s.barre.perde) + 4} className="fill-[var(--text)] text-[10px] font-semibold">
            {s.barre.parmak}
          </text>
        </g>
      ) : null}
      {perdeler.map((f, i) => {
        if (f === null)
          return (
            <text key={i} x={tx(i)} y={UST - 10} textAnchor="middle" className="fill-[var(--muted)] text-[11px]">
              ✕
            </text>
          );
        if (f === 0)
          return (
            <circle key={i} cx={tx(i)} cy={UST - 14} r={4.5} fill="none" strokeWidth={1.4} className={kok.has(i) ? "stroke-[var(--accent)]" : "stroke-[var(--text)]"} />
          );
        if (barreTel(i) && !kok.has(i)) return null;
        return (
          <g key={i}>
            <circle cx={tx(i)} cy={py(f)} r={8} className={kok.has(i) ? "fill-[var(--accent)]" : "fill-[var(--text)]"} />
            {parmak[i] ? (
              <text x={tx(i)} y={py(f) + 3.5} textAnchor="middle" className="fill-[var(--bg)] text-[10px] font-semibold">
                {parmak[i]}
              </text>
            ) : null}
          </g>
        );
      })}
      <text x={(tx(0) + tx(5)) / 2} y={H - 4} textAnchor="middle" className="fill-[var(--muted)] font-mono text-[10px]">
        {[...s.perde].join(" ")}
      </text>
    </svg>
  );
}

function Akor({ s }: { s: CagedSekil }) {
  return (
    <figure className="flex flex-col items-center gap-1">
      <figcaption className="text-center leading-tight">
        <span className="text-lg font-semibold">{s.ad}</span>
        <span className="block text-xs text-muted">{s.okunus}</span>
      </figcaption>
      <CagedKutusu s={s} />
    </figure>
  );
}

function Grup({ baslik, satirlar }: { baslik: string; satirlar: CagedSatir[] }) {
  return (
    <section className="space-y-3">
      <h3 className="text-lg font-semibold">{baslik}</h3>
      <div className="grid gap-3 lg:grid-cols-2">
        {satirlar.map((r) => (
          <div key={r.acik.ad + r.sekil} className="flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4">
            <Akor s={r.acik} />
            <div className="flex flex-col items-center text-muted" aria-hidden>
              <ArrowRight size={28} />
              <span className="text-[11px]">+2 perde</span>
            </div>
            <Akor s={r.tasinan} />
            <div className="min-w-[10rem] flex-1 space-y-1 text-sm">
              <p className="font-semibold">{r.sekil} şekli</p>
              <p className="text-muted">
                Açık {r.acik.ad} şeklini tam ses yukarı taşı: {r.tasinan.ad} olur.
              </p>
              <p className="text-muted">Kök: {kokTelYazisi(r.tasinan)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Tablo() {
  const satirlar = [...CAGED_MAJOR, ...CAGED_MINOR];
  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--line)]">
      <table className="w-full min-w-[40rem] text-left text-sm">
        <caption className="sr-only">CAGED şekilleri özet tablosu</caption>
        <thead className="bg-[var(--panel)] text-xs text-muted">
          <tr>
            <th className="px-3 py-2 font-medium">Şekil</th>
            <th className="px-3 py-2 font-medium">Açık akor</th>
            <th className="px-3 py-2 font-medium">Perdeler</th>
            <th className="px-3 py-2 font-medium">Parmaklar</th>
            <th className="px-3 py-2 font-medium">Taşınmış akor</th>
            <th className="px-3 py-2 font-medium">Perdeler</th>
            <th className="px-3 py-2 font-medium">Parmaklar</th>
            <th className="px-3 py-2 font-medium">Kök telleri</th>
          </tr>
        </thead>
        <tbody>
          {satirlar.map((r) => (
            <tr key={r.acik.ad + r.tasinan.ad} className="border-t border-[var(--line)]">
              <td className="px-3 py-2 font-semibold">{r.sekil}</td>
              <td className="px-3 py-2">{r.acik.ad}</td>
              <td className="px-3 py-2 font-mono">{[...r.acik.perde].join(" ")}</td>
              <td className="px-3 py-2 font-mono text-muted">{[...r.acik.parmak].map((p) => (p === "0" ? "–" : p)).join(" ")}</td>
              <td className="px-3 py-2 font-semibold text-accent">{r.tasinan.ad}</td>
              <td className="px-3 py-2 font-mono">{[...r.tasinan.perde].join(" ")}</td>
              <td className="px-3 py-2 font-mono text-muted">{[...r.tasinan.parmak].map((p) => (p === "0" ? "–" : p)).join(" ")}</td>
              <td className="px-3 py-2 text-muted">{kokTelYazisi(r.tasinan)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CagedTablosu() {
  return (
    <div className="space-y-6 pt-2">
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-3 rounded-full bg-[var(--accent)]" /> kök nota
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-3 rounded-full bg-[var(--text)]" /> diğer akor sesleri
        </span>
        <span>Daire içindeki sayı parmak: 1 işaret, 2 orta, 3 yüzük, 4 serçe · ○ açık tel · ✕ çalınmaz · perdeler kalın Mi → ince Mi</span>
      </div>
      <Grup baslik="Majör şekiller" satirlar={CAGED_MAJOR} />
      <Grup baslik="Minör şekiller" satirlar={CAGED_MINOR} />
      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Özet tablo</h3>
        <Tablo />
      </section>
    </div>
  );
}
