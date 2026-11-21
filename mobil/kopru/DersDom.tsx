"use dom";
// Teknik ders: masaüstünün LessonPractice + TabPlayer'ı (alphaTab) aynen, WebView içinde (web'de doğrudan).
import "./dom.css";
import "./alphatab-yama";
import { useEffect, useState } from "react";
import LessonPractice from "@/components/LessonPractice";
import type { LessonKind, LessonPart, Stave } from "@/content/types";
import { kopruGuncelle, kopruKur, type Progress } from "~/lib/ilerleme";
import { gitKur } from "./git";

export type DersVeri = {
  progressKey: string;
  title: string;
  bpm: number;
  minutes: number;
  tex?: string;
  stave?: Stave;
  kind?: LessonKind;
  readBars?: [number, number];
  improvBars?: [number, number];
  chords?: string[];
  parts?: LessonPart[];
  guitarProgram?: number;
  govde?: string[];
};

export default function DersDom({ ders, ilerleme, kopru, kaydet, git }: { ders: DersVeri; ilerleme: Progress; kopru?: boolean; kaydet: (p: Progress) => Promise<void>; git: (yol: string) => Promise<void>; dom?: import("expo/dom").DOMProps }) {
  const [hazir, setHazir] = useState(false);
  useEffect(() => {
    document.documentElement.dataset.mod = "acik";
    // kopru: iOS'ta WebView ayrı JS bağlamıdır → kayıt yerel uygulamaya gider. Web'de aynı modül kullanılır.
    if (kopru) kopruKur(ilerleme, (p) => void kaydet(p));
    gitKur((y) => void git(y));
    setHazir(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Yerel taraftaki değişiklikler (defter, öteki ekranlar) WebView'deki kopyaya
  useEffect(() => {
    if (kopru && hazir) kopruGuncelle(ilerleme);
  }, [kopru, hazir, ilerleme]);
  if (!hazir) return null;
  return (
    <div className="px-3 pb-6 pt-2 text-text">
      <LessonPractice
        key={ders.progressKey}
        reading={!!ders.govde?.length}
        progressKey={ders.progressKey}
        bpm={ders.bpm}
        minutes={ders.minutes}
        tex={ders.tex}
        stave={ders.stave}
        kind={ders.kind}
        readBars={ders.readBars}
        improvBars={ders.improvBars}
        chords={ders.chords}
        title={ders.title}
        parts={ders.parts}
        guitarProgram={ders.guitarProgram}
      >
        {!!ders.govde?.length && (
          <article className="card space-y-3 p-5 leading-relaxed">
            {ders.govde.map((p, i) =>
              p.startsWith("## ") ? (
                <h2 key={i} className="pt-2 text-xl font-semibold first:pt-0">
                  {p.slice(3)}
                </h2>
              ) : (
                <p key={i} className="text-muted">
                  {p}
                </p>
              ),
            )}
          </article>
        )}
      </LessonPractice>
    </div>
  );
}
