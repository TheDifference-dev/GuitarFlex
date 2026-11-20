/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { SITE } from "@/config/site";
import { Bant, SayfaBasi } from "@/components/site/Vitrin";

export const metadata: Metadata = { title: "Marka" };

/** Renk paleti: yalnız beyaz, uzay grisi ve siyah (globals.css değişkenleriyle aynı değerler) */
const PALETTE = [
  { group: "Beyaz", colors: [{ c: "#FFFFFF", ad: "Zemin" }, { c: "#F5F5F7", ad: "Açık gri" }, { c: "#D2D2D7", ad: "Çizgi" }] },
  { group: "Uzay grisi", colors: [{ c: "#48484A", ad: "Uzay grisi 3" }, { c: "#3A3A3C", ad: "Uzay grisi 2" }, { c: "#2C2C2E", ad: "Uzay grisi 1" }, { c: "#8E8E93", ad: "Gitar" }] },
  { group: "Siyah", colors: [{ c: "#000000", ad: "Siyah" }, { c: "#1D1D1F", ad: "Metin" }, { c: "#6E6E73", ad: "İkincil metin" }] },
];

const ICON_SIZES = [
  { file: "simge", size: 160 },
  { file: "simge", size: 96 },
  { file: "simge-kucuk", size: 48 },
  { file: "simge-kucuk", size: 32 },
  { file: "simge-kucuk", size: 16 },
];

const USES = [
  { what: "Uygulama simgesi", where: "/marka/simge.svg · simge-512.png" },
  { what: "Küçük boyutlar (16–48 px)", where: "/marka/simge-kucuk.svg · üst çubuk logosu ve sekme simgesi" },
  { what: "Masaüstü uygulaması", where: "desktop/icon.png (512) · desktop/icon.ico (16–256)" },
  { what: "Kapak", where: "/marka/kapak.svg · kapak.png (1600×900) · kapak-kare.png (1080×1080)" },
];

export default function BrandPage() {
  return (
    <div>
      <SayfaBasi
        kirinti={[{ label: "Marka" }]}
        baslik="Marka"
        alt="Yüzsüz, dolu beyaz bir siluet: çizgi film oranlarında, öne eğilip geniş duruşla solo atan özgün bir gitarist ve tek kesikli bir elektro gitar. Siyahtan uzay grisine zemin, beyaz figür, orta gri gitar."
        ek={
          <img src="/marka/kapak.png" alt={`${SITE.name} — Gitar akademisi`} width={1600} height={900} className="mx-auto mt-12 block h-auto w-full max-w-[1100px] rounded-[var(--radius-tile)]" />
        }
      />

      <Bant ton="gri">
        <h2 className="baslik-orta mb-8 text-center">Uygulama simgesi</h2>
        <div className="mx-auto grid max-w-[1100px] gap-3 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div className="doseme flex-row flex-wrap items-end justify-center gap-8 p-10">
            {ICON_SIZES.map((s) => (
              <figure key={`${s.file}-${s.size}`} className="flex flex-col items-center gap-2">
                <img src={`/marka/${s.file}.svg`} alt={s.size === 160 ? `${SITE.name} simgesi` : ""} width={s.size} height={s.size} />
                <figcaption className="font-mono text-xs text-muted">{s.size} px</figcaption>
              </figure>
            ))}
          </div>
          <div className="doseme items-start p-8 text-left">
            <p className="text-xs font-semibold text-muted">Kare kapak · 1080×1080</p>
            <img src="/marka/kapak-kare.png" alt={`${SITE.name} kare kapak`} width={200} height={200} className="mt-3 rounded-xl" />
            <p className="mt-3 text-sm text-muted">Sosyal medya paylaşımları için. Kapakların SVG kaynağında yazı, sistem yazı tipiyle metin olarak durur.</p>
          </div>
        </div>
        <ul className="mx-auto mt-8 max-w-[760px] space-y-1.5 text-sm">
          {USES.map((u) => (
            <li key={u.what}>
              <b className="font-semibold text-heading">{u.what}:</b> <span className="text-muted">{u.where}</span>
            </li>
          ))}
        </ul>
      </Bant>

      <Bant ton="beyaz">
        <h2 className="baslik-orta mb-8 text-center">Renk paleti</h2>
        <div className="mx-auto grid max-w-[1100px] gap-10 md:grid-cols-3">
          {PALETTE.map((p) => (
            <div key={p.group}>
              <h3 className="mb-3 text-center text-[21px] font-semibold">{p.group}</h3>
              <div className="flex flex-wrap justify-center gap-3">
                {p.colors.map(({ c, ad }) => (
                  <div key={c} className="w-28 overflow-hidden rounded-xl border border-line">
                    <div className="h-14" style={{ background: c }} />
                    <p className="bg-panel px-2 pt-1 text-xs font-semibold">{ad}</p>
                    <p className="bg-panel px-2 pb-1 font-mono text-xs text-muted">{c}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Bant>
    </div>
  );
}
