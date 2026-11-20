/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { SITE } from "@/config/site";

export const metadata: Metadata = { title: "Marka" };

const PALETTE = [
  { group: "Lacivert", colors: ["#0A2A5E", "#1F3A93"] },
  { group: "Uzay grisi", colors: ["#1C1C1E", "#2C2C2E", "#3A3A3C", "#8E8E93"] },
  { group: "Beyaz", colors: ["#FFFFFF", "#F2F2F7"] },
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
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Marka</h1>
        <p className="mt-1 max-w-3xl text-muted">
          {SITE.name} simgesi: sade, geometrik çizgilerle özgün bir elektro gitarist ve tek kesikli bir gitar. Lacivert zemin, beyaz
          figür, uzay grisi gitar; gradyan yok denecek kadar hafif.
        </p>
      </header>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Kapak</h2>
        <img src="/marka/kapak.png" alt={`${SITE.name} — Gitar akademisi`} width={1600} height={900} className="h-auto w-full rounded-2xl border border-line" />
        <div className="mt-4 flex flex-wrap items-start gap-4">
          <img src="/marka/kapak-kare.png" alt={`${SITE.name} kare kapak`} width={240} height={240} className="rounded-xl border border-line" />
          <p className="max-w-md text-sm text-muted">
            Kare kapak (1080×1080) sosyal medya paylaşımları için. Kapakların SVG kaynağında yazı, sistem yazı tipiyle metin olarak durur.
          </p>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Uygulama simgesi</h2>
        <div className="card flex flex-wrap items-end gap-6 p-6">
          {ICON_SIZES.map((s) => (
            <figure key={`${s.file}-${s.size}`} className="flex flex-col items-center gap-2">
              <img src={`/marka/${s.file}.svg`} alt={s.size === 160 ? `${SITE.name} simgesi` : ""} width={s.size} height={s.size} />
              <figcaption className="font-mono text-xs text-muted">{s.size} px</figcaption>
            </figure>
          ))}
        </div>
        <ul className="mt-4 space-y-1 text-sm">
          {USES.map((u) => (
            <li key={u.what}>
              <b className="text-text">{u.what}:</b> <span className="text-muted">{u.where}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Renk paleti</h2>
        <div className="space-y-4">
          {PALETTE.map((p) => (
            <div key={p.group}>
              <h3 className="mb-2 text-sm font-semibold text-muted">{p.group}</h3>
              <div className="flex flex-wrap gap-3">
                {p.colors.map((c) => (
                  <div key={c} className="w-28 overflow-hidden rounded-xl border border-line">
                    <div className="h-14" style={{ background: c }} />
                    <p className="bg-panel px-2 py-1 font-mono text-xs">{c}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
