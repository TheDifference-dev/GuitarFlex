"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { Blok, Ders, Tablo } from "@/content/teori/tipler";
import CagedTablosu from "@/components/yol/CagedTablosu";
import GorselCiz from "./sema/GorselCiz";
import Dinle from "./Dinle";
import A4Yaprak from "./A4Yaprak";
import A4Stili from "./A4Stili";
import { akorAdi } from "./sema/ortak";

// Ders kitabı sayfası: tanım → kural → gitarda → kulakla → hemen dene → sık hata/ipucu → sıradaki ders → kaynaklar.
// Ekranda tek sütun; yazdırınca (YazdirmaStili) tek A4 sayfasında iki sütun.

// Veride ASCII yazım (Bb, F#, b3); ekranda müzik işaretleri (B♭, F♯, ♭3)
const AKOR = /(?<![\p{L}\d])([A-G](?:#|b)?(?:maj7|m7b5|m6|m7|m|7|6|°|dim|aug|sus2|sus4|5)?(?:\/[A-G](?:#|b)?)?)(?![\p{L}\d#])/gu;
const ARALIK = /(?<![\p{L}\d])([b#])(\d{1,2})(?![\p{L}\d])/gu;
export const bicim = (s: string) => s.replace(AKOR, (x) => akorAdi(x)).replace(ARALIK, (_, a: string, n: string) => (a === "b" ? "♭" : "♯") + n);

/** **kalın** işaretli metin */
function Metin({ m }: { m: string }) {
  const parca = m.split(/(\*\*[^*]+\*\*)/g);
  return <>{parca.map((p, i) => (p.startsWith("**") ? <strong key={i}>{bicim(p.slice(2, -2))}</strong> : bicim(p)))}</>;
}

function TabloCiz({ t, no, genis }: { t: Tablo; no: number; genis?: boolean }) {
  return (
    <div className={`ders-tablo-kap overflow-x-auto rounded-2xl border border-[var(--line)] ${genis ? "ders-genis" : ""}`}>
      <table className="ders-tablo w-full text-left text-[15px]">
        <caption className="px-4 pb-1 pt-3 text-left text-[14px] text-muted">
          <span className="font-semibold text-[var(--text)]">Tablo {no}.</span> {t.baslik}
          {t.not ? <> — {t.not}</> : null}
        </caption>
        <thead className="border-b border-[var(--line)] text-[13px] text-muted">
          <tr>
            {t.bas.map((h) => (
              <th key={h} className="px-4 py-1.5 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {t.satirlar.map((r, ri) => (
            <tr key={ri} className="border-b border-[var(--line)] last:border-0">
              {r.map((c, i) => (
                <td key={i} className={`px-4 py-1.5 ${i === 0 ? "font-semibold" : ""}`}>
                  <Metin m={c} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Şekil ve tablo numaraları: bölümler boyunca sırayla (render dışında, saf hesap) */
function numarala(bolumler: Blok[][]): Map<Blok, number> {
  const no = new Map<Blok, number>();
  let sekil = 0;
  let tablo = 0;
  for (const b of bolumler.flat()) {
    if (b.t === "gorsel" && !b.ekran) no.set(b, ++sekil);
    if (b.t === "tablo") no.set(b, ++tablo);
  }
  return no;
}

function Bloklar({ bloklar, no }: { bloklar: Blok[]; no: Map<Blok, number> }) {
  return (
    <>
      {bloklar.map((b, i) => {
        switch (b.t) {
          case "p":
            return (
              <p key={i}>
                <Metin m={b.m} />
              </p>
            );
          case "gorsel":
            return <GorselCiz key={i} g={b.g} no={no.get(b) ?? 0} ekran={b.ekran} />;
          case "tablo":
            return <TabloCiz key={i} t={b.tablo} no={no.get(b) ?? 0} genis={b.genis} />;
          case "dinle":
            return <Dinle key={i} ornekler={b.ornekler} />;
          case "ek":
            // Etkileşimli/uzun ekler yaprağın dışında, altında gösterilir
            return null;
        }
      })}
    </>
  );
}

function Bolum({ baslik, children }: { baslik: string; children: ReactNode }) {
  return (
    <section className="ders-bolum">
      <h3>{baslik}</h3>
      {children}
    </section>
  );
}

export default function DersGovdesi({ ders, ust }: { ders: Ders; ust: string }) {
  const no = numarala([ders.kural, ders.gitarda, ders.kulakla]);
  return (
    <>
      <A4Yaprak etiket={ust}>
        <div className="ders-yazdir a4-yaprak" data-ders={ders.slug}>
          <A4Stili />
          <header className="ders-baski-basi">
            <p className="ust">GuitarFlex · {ust}</p>
            <h2 className="a4-baslik">{ders.baslik}</h2>
            <p className="ozet">{ders.ozet}</p>
          </header>
          <div className="ders-govde">
            <Bolum baslik="Tanım">
              {ders.tanim.map((p) => (
                <p key={p}>
                  <Metin m={p} />
                </p>
              ))}
            </Bolum>
            <Bolum baslik="Kural ve formül">
              <Bloklar bloklar={ders.kural} no={no} />
            </Bolum>
            <Bolum baslik="Gitarda">
              <Bloklar bloklar={ders.gitarda} no={no} />
            </Bolum>
            <Bolum baslik="Kulakla">
              <Bloklar bloklar={ders.kulakla} no={no} />
            </Bolum>
            <Bolum baslik="Hemen dene">
              <ol>
                {ders.dene.map((d) => (
                  <li key={d}>
                    <Metin m={d} />
                  </li>
                ))}
              </ol>
            </Bolum>
            <Bolum baslik="Sık hata ve ipucu">
              <ul>
                {ders.ipucu.map((d) => (
                  <li key={d}>
                    <Metin m={d} />
                  </li>
                ))}
              </ul>
            </Bolum>
            <Bolum baslik="Sıradaki ders">
              <p>
                {ders.sonraki.href ? (
                  <Link href={ders.sonraki.href}>
                    <Metin m={ders.sonraki.metin} /> <span aria-hidden>›</span>
                  </Link>
                ) : (
                  <Metin m={ders.sonraki.metin} />
                )}
              </p>
              <p className="ders-kaynak">
                <span className="font-semibold">Kaynaklar:</span> {ders.kaynaklar.join(" · ")}
              </p>
            </Bolum>
          </div>
        </div>
      </A4Yaprak>
      <DersEkleri ders={ders} />
    </>
  );
}

/** Yaprağın altında gösterilen ekler (yazdırılmaz) */
export function DersEkleri({ ders }: { ders: Ders }) {
  const ekler = [...ders.kural, ...ders.gitarda, ...ders.kulakla].filter((b) => b.t === "ek");
  if (!ekler.length) return null;
  return (
    <section className="ders-ekran space-y-3 pt-8 print:hidden">
      <h3 className="text-[21px] font-semibold">Ek: CAGED şekilleri tablosu</h3>
      <CagedTablosu />
    </section>
  );
}
