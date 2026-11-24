"use client";

import Link from "next/link";
import { useState } from "react";
import { Play } from "lucide-react";
import Fretboard, { type SapIsaret } from "@/components/Fretboard";
import { playMidi } from "@/lib/music";
import {
  GAMLAR, GRUP_ADI, KOKLER, SAP_PERDE, anaGam, formulSimgeleri, gamBul, gamNotalari, harfAdi, kalip, kokAdi, kokCoz, konumNotalari, konumSayisi, notaSesi, simgeYaz, solfejAdi,
  type GamGrup,
} from "@/lib/gamlar";

// Sap Gezgini: bütün modlar, pentatonik/blues kutuları, armonik ve melodik minör aileleri, simetrik gamlar ve akorlar,
// notalarıyla sapta. Etiket: nota adı, derece ya da Do-Re-Mi; konum: pentatoniklerde 5 kutu, yedi notalı gamlarda
// 7 adet 3 nota/tel kalıbı (seçilen konum dışındaki notalar soluk). Notaya tıklayınca sesi duyulur.

type Etiket = "nota" | "derece" | "solfej";
const pc = (m: number) => ((m % 12) + 12) % 12;

export default function SapGezgini({ gam: ilkGam = "minor-penta", kok: ilkKok = "A", kompakt = false }: { gam?: string; kok?: string; kompakt?: boolean }) {
  const [gamId, setGamId] = useState(gamBul(ilkGam) ? ilkGam : "minor-penta");
  const [kok, setKok] = useState<string>((KOKLER as readonly string[]).includes(ilkKok) ? ilkKok : "A");
  const [etiket, setEtiket] = useState<Etiket>("nota");
  const [konum, setKonum] = useState(0);
  const g = gamBul(gamId) ?? GAMLAR[0];
  const kokPc = notaSesi(kokCoz(kok));
  const simgeler = formulSimgeleri(g);
  const notalar = gamNotalari(g, kok);
  const iv = kalip(g);
  const nKonum = konumSayisi(g);
  const secili = konum > 0 && konum <= nKonum ? konum : 0;
  const kutu = secili ? new Set(konumNotalari(g, kok, secili).map((x) => `${x.t}:${x.p}`)) : null;
  const ana = anaGam(g, kok);

  const isaret = (t: number, p: number, midi: number): SapIsaret | null => {
    const i = iv.indexOf(pc(midi - kokPc));
    if (i < 0) return null;
    const e = etiket === "derece" ? simgeYaz(simgeler[i]) : etiket === "solfej" ? solfejAdi(notalar[i]) : harfAdi(notalar[i]);
    if (kutu && !kutu.has(`${t}:${p}`)) return { e, k: "soluk" };
    return { e, k: i === 0 ? "kok" : g.karakter?.includes(simgeler[i]) ? "vurgu" : "nota" };
  };

  const dinle = () => {
    const bas = 48 + kokPc;
    [...iv, 12].forEach((x, i) => setTimeout(() => playMidi(bas + x, 0.6), i * 260));
  };
  const gruplar = Object.keys(GRUP_ADI) as GamGrup[];
  const segme = "rounded-full px-3 py-1 transition";

  return (
    <div className="space-y-3" data-sap-gezgini={`${gamId}:${kok}`}>
      <div className="flex flex-wrap items-center gap-2.5 text-sm">
        <label className="flex items-center gap-1.5">
          <span className="text-muted">Kök</span>
          <select aria-label="Kök" value={kok} onChange={(e) => setKok(e.target.value)} className="rounded-lg border border-ink/10 bg-ink/[0.05] px-2.5 py-1.5">
            {KOKLER.map((k) => (
              <option key={k} value={k}>
                {kokAdi(k)} ({solfejAdi(kokCoz(k))})
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-1.5">
          <span className="text-muted">Gam</span>
          <select
            aria-label="Gam"
            value={gamId}
            onChange={(e) => {
              setGamId(e.target.value);
              setKonum(0);
            }}
            className="max-w-[16rem] rounded-lg border border-ink/10 bg-ink/[0.05] px-2.5 py-1.5"
          >
            {gruplar.map((gr) => (
              <optgroup key={gr} label={GRUP_ADI[gr]}>
                {GAMLAR.filter((x) => x.grup === gr).map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.ad}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <div className="flex gap-0.5 rounded-full border border-ink/[0.08] bg-ink/[0.05] p-0.5" role="group" aria-label="Etiket">
          {(
            [
              ["nota", "Nota"],
              ["derece", "Derece"],
              ["solfej", "Do-Re-Mi"],
            ] as const
          ).map(([k, ad]) => (
            <button key={k} type="button" aria-pressed={etiket === k} onClick={() => setEtiket(k)} className={`${segme} ${etiket === k ? "bg-seg text-text shadow-[var(--shadow-seg)]" : "text-muted hover:text-text"}`}>
              {ad}
            </button>
          ))}
        </div>
        <button type="button" onClick={dinle} className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 px-3 py-1 hover:bg-ink/[0.05]">
          <Play size={13} aria-hidden /> Gamı dinle
        </button>
      </div>
      {nKonum > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 text-sm" role="group" aria-label="Konum">
          <span className="mr-1 text-muted">{g.konum === "penta" ? "Kutu" : "3 nota/tel"}</span>
          {[0, ...Array.from({ length: nKonum }, (_, i) => i + 1)].map((n) => (
            <button
              key={n}
              type="button"
              aria-pressed={secili === n}
              onClick={() => setKonum(n)}
              className={`min-w-8 rounded-full border px-2.5 py-0.5 transition ${secili === n ? "border-transparent bg-accent text-accent-ink" : "border-ink/10 hover:bg-ink/[0.05]"}`}
            >
              {n === 0 ? "Tümü" : n}
            </button>
          ))}
        </div>
      )}
      <Fretboard frets={SAP_PERDE} isaret={isaret} />
      <div className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-[auto_1fr]">
        <p className="font-semibold text-[var(--text)]">
          {kokAdi(kok)} {g.ad}
          {g.diger ? <span className="font-normal text-muted"> · {g.diger}</span> : null}
        </p>
        <p className="text-muted">
          Formül: <span className="font-medium text-[var(--text)]">{simgeler.map(simgeYaz).join(" – ")}</span> · Notalar:{" "}
          <span className="font-medium text-[var(--text)]">{notalar.map(harfAdi).join(" ")}</span> ({notalar.map(solfejAdi).join(" ")})
        </p>
        {(ana || g.not) && (
          <p className="text-muted sm:col-span-2">
            {ana ? (
              <>
                {kokAdi(ana.kok)} {ana.ana.id === "major" ? "majörün" : `${ana.ana.ad.toLocaleLowerCase("tr")} gamının`} {g.aile?.derece}. modu (aynı notalar, merkez {kokAdi(kok)}).{" "}
              </>
            ) : null}
            {g.not}
            {g.karakter?.length ? <> Turuncu: karakter notası ({g.karakter.map(simgeYaz).join(", ")}).</> : null}
          </p>
        )}
        <p className="flex flex-wrap gap-x-4 sm:col-span-2">
          <span className="text-muted">Notaya tıkla, sesini duy. Kök mavi.</span>
          {g.ders ? (
            <Link href={`/teori/${g.ders}`} className="metin-bag">
              Dersi aç ›
            </Link>
          ) : null}
          {kompakt ? (
            <Link href={`/sap-gezgini?gam=${encodeURIComponent(gamId)}&kok=${encodeURIComponent(kok)}`} className="metin-bag">
              Sap Gezgini&apos;nde aç ›
            </Link>
          ) : null}
        </p>
      </div>
    </div>
  );
}
