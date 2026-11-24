"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { Blok, Ders, DersBag, Tablo } from "@/content/teori/tipler";
import CagedTablosu from "@/components/yol/CagedTablosu";
import GorselCiz from "./sema/GorselCiz";
import Dinle from "./Dinle";
import A4Yaprak from "./A4Yaprak";
import A4Stili from "./A4Stili";
import { akorAdi } from "./sema/ortak";

// Ders kitabı sayfası: tanım → kural → gitarda → kulakla → hemen dene → sık hata/ipucu → sıradaki ders → kaynaklar.
// Ekranda tek sütun; yazdırınca (YazdirmaStili) tek A4 sayfasında iki sütun.

// Veride ASCII yazım (Bb, F#, b3); ekranda müzik işaretleri (B♭, F♯, ♭3)
const AKOR = /(?<![\p{L}\d])([A-G](?:#|b)?(?:maj9|maj7|mMaj7|m7b5|m11|m9|m6|m7|7b9|7#9|7#11|13|9|dim7|m|7|6|°|dim|aug|sus2|sus4|5)?(?:\/[A-G](?:#|b)?)?)(?![\p{L}\d#])/gu;
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

/** Şekil ve tablo numaraları: bütün yapraklar boyunca sırayla (render dışında, saf hesap) */
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
          case "liste":
            return (
              <ul key={i}>
                {b.m.map((x) => (
                  <li key={x}>
                    <Metin m={x} />
                  </li>
                ))}
              </ul>
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

/** Dersin bütün blokları (numaralama ve ekler için) */
export const dersBloklari = (d: Ders): Blok[][] => [d.kural, d.gitarda, d.kulakla, ...(d.ekYapraklar ?? []).flatMap((y) => y.kisimlar.map((k) => k.bloklar))];

/**
 * Ders kitabı yaprakları: 1. yaprak tanım → kural → gitarda → kulakla; varsa ek yapraklar (başlıklı kısımlar);
 * "Hemen dene", sık hata, önce/sonra ve kaynaklar son yaprakta. Her yaprak tek A4 (ekranda "Sayfa 1/2").
 */
export default function DersGovdesi({ ders, ust, bag }: { ders: Ders; ust: string; bag?: DersBag }) {
  const no = numarala(dersBloklari(ders));
  const ekler = ders.ekYapraklar ?? [];
  const toplam = 1 + ekler.length;
  const sayfa = (i: number) => (toplam > 1 ? ` · Sayfa ${i}/${toplam}` : "");
  const son = (
    <>
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
      <Bolum baslik={bag ? "Önce ve sonra" : "Sıradaki ders"}>
        {bag ? (
          <p>
            <span className="ders-bag-etiket">Önce:</span> {bag.once ? <Link href={bag.once.href}>{bag.once.baslik}</Link> : "başlangıç dersi"}
            {" · "}
            <span className="ders-bag-etiket">Sonra:</span> {bag.sonra ? <Link href={bag.sonra.href}>{bag.sonra.baslik} ›</Link> : "sıralı derslerin sonu; Sap Gezgini'nde serbest çalış"}
          </p>
        ) : (
          <p>
            {ders.sonraki.href ? (
              <Link href={ders.sonraki.href}>
                <Metin m={ders.sonraki.metin} /> <span aria-hidden>›</span>
              </Link>
            ) : (
              <Metin m={ders.sonraki.metin} />
            )}
          </p>
        )}
        <p className="ders-kaynak">
          <span className="font-semibold">Kaynaklar:</span> {ders.kaynaklar.join(" · ")}
        </p>
      </Bolum>
    </>
  );
  const bas = (i: number) => (
    <header className="ders-baski-basi">
      <p className="ust">
        GuitarFlex · {ust}
        {sayfa(i)}
      </p>
      <h2 className="a4-baslik">
        {ders.baslik}
        {i > 1 ? <span className="a4-devam"> (devam)</span> : null}
      </h2>
      {i === 1 ? <p className="ozet">{ders.ozet}</p> : null}
    </header>
  );
  return (
    <>
      <div className="space-y-10">
        <A4Yaprak etiket={`${ust}${sayfa(1)}`}>
          <div className="ders-yazdir a4-yaprak" data-ders={ders.slug} data-yaprak={1}>
            <A4Stili />
            {bas(1)}
            <div className="ders-govde">
              <Bolum baslik="Tanım">
                {ders.tanim.map((p) => (
                  <p key={p}>
                    <Metin m={p} />
                  </p>
                ))}
              </Bolum>
              {ders.kural.length ? (
                <Bolum baslik="Kural ve formül">
                  <Bloklar bloklar={ders.kural} no={no} />
                </Bolum>
              ) : null}
              {ders.gitarda.length ? (
                <Bolum baslik="Gitarda">
                  <Bloklar bloklar={ders.gitarda} no={no} />
                </Bolum>
              ) : null}
              {ders.kulakla.length ? (
                <Bolum baslik="Kulakla">
                  <Bloklar bloklar={ders.kulakla} no={no} />
                </Bolum>
              ) : null}
              {toplam === 1 ? son : null}
            </div>
          </div>
        </A4Yaprak>
        {ekler.map((y, yi) => (
          <A4Yaprak key={yi} etiket={`${ust}${sayfa(yi + 2)}`}>
            <div className="ders-yazdir a4-yaprak" data-ders={ders.slug} data-yaprak={yi + 2}>
              {bas(yi + 2)}
              <div className="ders-govde">
                {y.kisimlar.map((k) => (
                  <Bolum key={k.baslik} baslik={k.baslik}>
                    <Bloklar bloklar={k.bloklar} no={no} />
                  </Bolum>
                ))}
                {yi === ekler.length - 1 ? son : null}
              </div>
            </div>
          </A4Yaprak>
        ))}
      </div>
      <DersEkleri ders={ders} />
    </>
  );
}

/** Yaprağın altında gösterilen ekler (yazdırılmaz) */
export function DersEkleri({ ders }: { ders: Ders }) {
  const ekler = dersBloklari(ders)
    .flat()
    .filter((b) => b.t === "ek");
  if (!ekler.length) return null;
  return (
    <section className="ders-ekran space-y-3 pt-8 print:hidden">
      <h3 className="text-[21px] font-semibold">Ek: CAGED şekilleri tablosu</h3>
      <CagedTablosu />
    </section>
  );
}
