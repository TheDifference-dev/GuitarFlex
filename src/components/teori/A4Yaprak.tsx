"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Maximize2, MoveHorizontal } from "lucide-react";
import YazdirDugmesi from "./YazdirDugmesi";

// Ekranda dersin A4 yaprağı: yaprak gerçek ölçüsünde (210 × 297 mm) dizilir, sonra pencereye göre bütünüyle
// ölçeklenir (transform). Düzen ölçekten bağımsız olduğu için ekranda görünen satır kırılımları yazdırılan
// sayfanın aynısıdır. "Genişlik": yaprak en çok 900 px; "Sayfaya sığdır": yaprağın tamamı pencerede.

const YAPRAK_W = (210 / 25.4) * 96;
const YAPRAK_H = (297 / 25.4) * 96;
const EN_GENIS = 900;

type Mod = "genislik" | "sigdir";

export default function A4Yaprak({ etiket, children }: { etiket: string; children: ReactNode }) {
  const kap = useRef<HTMLDivElement>(null);
  const arac = useRef<HTMLDivElement>(null);
  const [mod, setMod] = useState<Mod>("genislik");
  const [olcek, setOlcek] = useState(1);

  useLayoutEffect(() => {
    const hesapla = () => {
      const w = kap.current?.clientWidth ?? YAPRAK_W;
      const genislik = Math.min(w, EN_GENIS) / YAPRAK_W;
      if (mod === "genislik") return setOlcek(genislik);
      const ust = (arac.current?.getBoundingClientRect().height ?? 48) + 48 + 40;
      setOlcek(Math.min(w / YAPRAK_W, (window.innerHeight - ust) / YAPRAK_H));
    };
    hesapla();
    const ro = new ResizeObserver(hesapla);
    if (kap.current) ro.observe(kap.current);
    window.addEventListener("resize", hesapla);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", hesapla);
    };
  }, [mod]);

  const sec = (m: Mod) => {
    setMod(m);
    if (m === "sigdir") requestAnimationFrame(() => arac.current?.scrollIntoView({ block: "start", behavior: "smooth" }));
  };

  return (
    <div className="a4-kap">
      <div ref={arac} className="a4-arac mb-3 flex scroll-mt-14 flex-wrap items-center justify-between gap-3 print:hidden">
        <p className="text-[14px] text-muted">{etiket} · A4 sayfası</p>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-0.5 rounded-full border border-ink/[0.08] bg-ink/[0.05] p-0.5 text-[14px]" role="group" aria-label="Yakınlaştırma">
            {(
              [
                ["genislik", "Genişlik", MoveHorizontal],
                ["sigdir", "Sayfaya sığdır", Maximize2],
              ] as const
            ).map(([m, ad, Simge]) => (
              <button
                key={m}
                type="button"
                aria-pressed={mod === m}
                onClick={() => sec(m)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 transition ${mod === m ? "bg-seg text-text shadow-[var(--shadow-seg)]" : "text-muted hover:text-text"}`}
              >
                <Simge size={14} aria-hidden /> {ad}
              </button>
            ))}
          </div>
          <YazdirDugmesi />
        </div>
      </div>
      <div ref={kap} className="a4-olcum w-full overflow-hidden">
        <div className="a4-olcek-dis mx-auto" style={{ width: YAPRAK_W * olcek, height: YAPRAK_H * olcek }}>
          <div className="a4-olcek" style={{ width: YAPRAK_W, transform: `scale(${olcek})`, transformOrigin: "top left" }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
