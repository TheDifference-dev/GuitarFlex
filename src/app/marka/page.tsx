/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { SITE } from "@/config/site";

export const metadata: Metadata = { title: "Marka" };

const LOGOS = [
  { file: "rozet", title: "Rozet", text: "Lacivert yuvarlak rozet, siyah silüet." },
  { file: "pena", title: "Pena", text: "Gitar penası şeklinde rozet." },
  { file: "sahne", title: "Sahne ışığı", text: "Siyah zemin, arkadan lacivert sahne ışığı." },
  { file: "rock", title: "Rock pozu", text: "Geriye yaslanmış, sap havada, daha açık duruş." },
  { file: "siluet", title: "Yalın silüet", text: "Zeminsiz; açık renkli yüzeylerde kullanmak için." },
];

const SWATCHES = ["--bg", "--panel", "--line", "--muted", "--text", "--accent", "--sheet"];

export default function BrandPage() {
  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Marka</h1>
        <p className="mt-1 text-muted">
          {SITE.name} logo adayları. Şu an kullanılan: <b className="text-text">{SITE.logo.split("/").pop()}</b>. Değiştirmek için{" "}
          <code className="rounded bg-line px-1">src/config/site.ts</code> içindeki <code className="rounded bg-line px-1">logo</code> satırını düzenle.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LOGOS.map((l, i) => (
          <div key={l.file} className={`rounded-xl border bg-panel p-5 ${SITE.logo.endsWith(`${l.file}.svg`) ? "border-accent" : "border-line"}`}>
            <div className="flex items-end gap-4">
              <img src={`/marka/${l.file}.svg`} alt={l.title} width={140} height={140} className={l.file === "siluet" ? "rounded-lg bg-[#e9edf5] p-2" : ""} />
              <img src={`/marka/${l.file}.svg`} alt="" width={48} height={48} className={l.file === "siluet" ? "rounded bg-[#e9edf5]" : ""} />
              <img src={`/marka/${l.file}.svg`} alt="" width={24} height={24} className={l.file === "siluet" ? "rounded bg-[#e9edf5]" : ""} />
            </div>
            <h2 className="mt-4 font-semibold">
              {i + 1}. {l.title} <span className="text-xs font-normal text-muted">({l.file})</span>
            </h2>
            <p className="text-sm text-muted">{l.text}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Renk paleti</h2>
        <div className="flex flex-wrap gap-3">
          {SWATCHES.map((v) => (
            <div key={v} className="w-28 overflow-hidden rounded-lg border border-line">
              <div className="h-14" style={{ background: `var(${v})` }} />
              <p className="bg-panel px-2 py-1 font-mono text-xs">{v}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
