"use client";

import { useEffect, useState } from "react";
import Fretboard from "./Fretboard";
import { NOTES, SOLFEGE, pitchAt, playMidi } from "@/lib/music";
import { saveQuizScore, useProgress } from "@/lib/progress";

const ROUND_SECONDS = 60;
const MAX_FRET = 12;

function randomSpot(prev?: { string: number; fret: number }) {
  let spot;
  do {
    spot = { string: 1 + Math.floor(Math.random() * 6), fret: Math.floor(Math.random() * (MAX_FRET + 1)) };
  } while (prev && spot.string === prev.string && spot.fret === prev.fret);
  return spot;
}

export default function NoteQuiz() {
  const best = useProgress().quizBest["nota-bulma"] ?? 0;
  const [spot, setSpot] = useState<{ string: number; fret: number } | null>(null);
  const [left, setLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [flash, setFlash] = useState<"ok" | "bad" | null>(null);
  const [bestAtStart, setBestAtStart] = useState(0);
  const running = left > 0;

  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => window.clearTimeout(id);
  }, [running, left]);

  useEffect(() => {
    if (left === 0 && spot) saveQuizScore("nota-bulma", score);
  }, [left, spot, score]);

  const start = () => {
    setBestAtStart(best);
    setScore(0);
    setWrong(0);
    setSpot(randomSpot());
    setLeft(ROUND_SECONDS);
  };

  const answer = (pc: number) => {
    if (!running || !spot) return;
    const midi = pitchAt(spot.string, spot.fret);
    const ok = midi % 12 === pc;
    playMidi(midi, 0.6);
    setFlash(ok ? "ok" : "bad");
    window.setTimeout(() => setFlash(null), 250);
    if (ok) {
      setScore((s) => s + 1);
      setSpot((s) => randomSpot(s ?? undefined));
    } else {
      setWrong((w) => w + 1);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <button type="button" onClick={start} className="rounded-lg bg-accent px-4 py-2 font-semibold text-accent-ink">
          {spot ? "Yeniden başla" : "Başla"}
        </button>
        <Stat label="Süre" value={`${left} sn`} />
        <Stat label="Doğru" value={score} />
        <Stat label="Yanlış" value={wrong} />
        <Stat label="Rekor" value={best} />
      </div>

      <div className={`rounded-xl transition ${flash === "ok" ? "ring-4 ring-green-500/60" : flash === "bad" ? "ring-4 ring-red-500/60" : ""}`}>
        <Fretboard highlight={running ? spot : null} hideLabels />
      </div>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-12">
        {NOTES.map((n, i) => (
          <button
            key={n}
            type="button"
            disabled={!running}
            onClick={() => answer(i)}
            className="rounded-lg border border-line bg-panel py-3 font-semibold disabled:opacity-40"
          >
            {n}
            <span className="block text-xs font-normal text-muted">{SOLFEGE[i]}</span>
          </button>
        ))}
      </div>

      {!running && spot && (
        <p className="text-sm">
          Süre doldu: <b>{score}</b> doğru, {wrong} yanlış. {score > bestAtStart ? "Yeni rekor!" : ""}
        </p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="text-xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
