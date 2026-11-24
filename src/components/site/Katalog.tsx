"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { GRUP_ADI, type KursAilesi, type KursGrubu, type KursKarti } from "@/lib/katalog";
import { kartIlerleme } from "@/lib/katalog-ilerleme";
import { useProgress } from "@/lib/progress";
import { yolSimgesi } from "@/lib/simge";
import KursKartiKucuk from "./KursKartiKucuk";
import UygulamaSimgesi from "./UygulamaSimgesi";

export type YolKarti = { slug: string; href: string; etiket: string; ad: string; not: string };

const AILELER: [KursAilesi | "", string][] = [
  ["", "Tümü"],
  ["elektro", "Elektro Gitar"],
  ["teori", "Müzik Teorisi"],
];
type Durum = "" | "devam" | "yeni" | "bitti";
const DURUMLAR: [Durum, string][] = [
  ["", "Hepsi"],
  ["devam", "Devam eden"],
  ["yeni", "Başlanmamış"],
  ["bitti", "Tamamlanan"],
];
const SIRA: KursGrubu[] = ["isinma", "rehber", "akor", "elektro", "ileri", "ek", "teori"];
/** Grup başlığının yanındaki kısa açıklama */
const GRUP_NOTU: Partial<Record<KursGrubu, string>> = { ileri: "orta-ileri seviye ek kurslar" };

const kucult = (s: string) => s.toLocaleLowerCase("tr");
const chip = (on: boolean) =>
  `rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${on ? "border-accent bg-accent text-accent-ink" : "border-ink/10 bg-ink/[0.05] hover:bg-ink/10"}`;

/** Kurs kataloğu: bütün kurslar gruplarıyla, bölüme, duruma ve ada göre süzülür */
export default function Katalog({ kartlar, yollar }: { kartlar: KursKarti[]; yollar: YolKarti[] }) {
  const p = useProgress();
  const [aile, setAile] = useState<KursAilesi | "">("");
  const [durum, setDurum] = useState<Durum>("");
  const [ara, setAra] = useState("");

  const gruplar = useMemo(() => {
    const q = kucult(ara.trim());
    const uygun = kartlar.filter((k) => {
      if (aile && k.aile !== aile) return false;
      if (q && !kucult(`${k.title} ${k.description}`).includes(q)) return false;
      if (durum) {
        const { tamam, toplam } = kartIlerleme(p, k);
        if (durum === "yeni" && tamam > 0) return false;
        if (durum === "devam" && (tamam === 0 || tamam >= toplam)) return false;
        if (durum === "bitti" && (toplam === 0 || tamam < toplam)) return false;
      }
      return true;
    });
    return SIRA.map((g) => ({ g, liste: uygun.filter((k) => k.grup === g) })).filter((x) => x.liste.length);
  }, [kartlar, aile, durum, ara, p]);

  const yolGoster = !durum && !ara.trim() && (aile === "" || aile === "teori");

  return (
    <div className="space-y-8">
      <div className="card flex flex-col gap-3 p-3 sm:p-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Bölüm">
          {AILELER.map(([id, ad]) => (
            <button key={id || "tum"} type="button" className={chip(aile === id)} onClick={() => setAile(id)} aria-pressed={aile === id}>
              {ad}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-ink/10 bg-ink/[0.04] px-3.5 py-2 text-sm sm:max-w-sm">
            <Search size={15} className="shrink-0 text-muted" />
            <input value={ara} onChange={(e) => setAra(e.target.value)} placeholder="Kurs ara…" className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted" aria-label="Kurs ara" />
          </label>
          <div className="flex flex-wrap gap-1" role="group" aria-label="Durum">
            {DURUMLAR.map(([id, ad]) => (
              <button
                key={id || "hepsi"}
                type="button"
                onClick={() => setDurum(id)}
                aria-pressed={durum === id}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${durum === id ? "bg-seg text-text shadow-[var(--shadow-seg)]" : "text-muted hover:text-text"}`}
              >
                {ad}
              </button>
            ))}
          </div>
        </div>
      </div>

      {gruplar.map(({ g, liste }) => (
        <section key={g} id={`grup-${g}`} className="scroll-mt-24 space-y-3">
          <h2 className="flex items-baseline gap-2 text-xl font-semibold">
            {GRUP_ADI[g]} <span className="text-sm font-medium text-muted">{GRUP_NOTU[g] ? `${GRUP_NOTU[g]} · ` : ""}{liste.length} kurs</span>
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {liste.map((k) => (
              <KursKartiKucuk key={k.slug} k={k} p={p} />
            ))}
          </div>
        </section>
      ))}

      {yolGoster && yollar.length > 0 && (
        <section id="grup-yollar" className="scroll-mt-24 space-y-3">
          <h2 className="flex items-baseline gap-2 text-xl font-semibold">
            Pratik Yolları <span className="text-sm font-medium text-muted">adım adım alıştırmalar</span>
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {yollar.map((y) => (
              <Link key={y.href} href={y.href} data-renk={yolSimgesi(y.slug).renk} className="card renkli-kart yukselen group flex items-center gap-3 p-4 pt-5 hover:border-ink/15">
                <UygulamaSimgesi simge={yolSimgesi(y.slug)} boyut={44} />
                <span className="min-w-0 flex-1">
                  <span className="eyebrow">{y.etiket}</span>
                  <span className="block font-semibold">{y.ad}</span>
                  <span className="block text-xs text-muted">{y.not}</span>
                </span>
                <ArrowRight size={16} className="shrink-0 text-accent opacity-0 transition group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {!gruplar.length && !yolGoster && <p className="rounded-2xl border border-dashed border-line p-6 text-sm text-muted">Bu süzgeçle eşleşen kurs yok.</p>}
    </div>
  );
}
