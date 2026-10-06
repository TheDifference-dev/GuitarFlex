"use client";

import { useEffect, useRef, useState } from "react";

const LOOKAHEAD_MS = 25;
const SCHEDULE_AHEAD_S = 0.1;

/** Web Audio ile zamanlanan, kaymayan metronom. */
export default function Metronome() {
  const [bpm, setBpm] = useState(80);
  const [beats, setBeats] = useState(4);
  const [running, setRunning] = useState(false);
  const [current, setCurrent] = useState(-1);
  const ctxRef = useRef<AudioContext | null>(null);
  const settings = useRef({ bpm, beats });
  useEffect(() => {
    settings.current = { bpm, beats };
  }, [bpm, beats]);

  useEffect(() => {
    if (!running) return;
    const ctx = (ctxRef.current ??= new AudioContext());
    void ctx.resume();
    let nextTime = ctx.currentTime + 0.05;
    let beat = 0;
    const timeouts: number[] = [];

    const click = (time: number, accent: boolean) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = accent ? 1500 : 1000;
      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.exponentialRampToValueAtTime(0.6, time + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);
      osc.connect(gain).connect(ctx.destination);
      osc.start(time);
      osc.stop(time + 0.06);
    };

    const id = window.setInterval(() => {
      while (nextTime < ctx.currentTime + SCHEDULE_AHEAD_S) {
        const b = beat;
        click(nextTime, b === 0);
        timeouts.push(window.setTimeout(() => setCurrent(b), Math.max(0, (nextTime - ctx.currentTime) * 1000)));
        nextTime += 60 / settings.current.bpm;
        beat = (beat + 1) % settings.current.beats;
      }
    }, LOOKAHEAD_MS);

    return () => {
      window.clearInterval(id);
      timeouts.forEach(window.clearTimeout);
      setCurrent(-1);
    };
  }, [running]);

  return (
    <div className="space-y-5 card p-6">
      <div className="flex items-end gap-4">
        <p className="text-6xl font-semibold tabular-nums">{bpm}</p>
        <p className="pb-2 text-muted">BPM</p>
      </div>
      <input
        type="range"
        min={30}
        max={250}
        value={bpm}
        onChange={(e) => setBpm(Number(e.target.value))}
        className="w-full accent-[var(--accent)]"
        aria-label="Tempo"
      />
      <div className="flex flex-wrap items-center gap-2">
        {[-5, -1, 1, 5].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setBpm((b) => Math.min(250, Math.max(30, b + d)))}
            className="rounded-md border border-line px-3 py-1.5 tabular-nums"
          >
            {d > 0 ? `+${d}` : d}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-2 text-sm">
          Ölçü
          <select value={beats} onChange={(e) => setBeats(Number(e.target.value))} className="rounded-lg border border-white/10 bg-white/[0.05] px-2.5 py-1.5">
            {[2, 3, 4, 5, 6, 7].map((n) => (
              <option key={n} value={n}>
                {n}/4
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex gap-2">
        {Array.from({ length: beats }, (_, i) => (
          <span key={i} className={`h-3 flex-1 rounded-full ${current === i ? "bg-accent" : "bg-line"}`} />
        ))}
      </div>
      <button
        type="button"
        onClick={() => setRunning((r) => !r)}
        className="btn-grad w-full py-3 text-lg"
      >
        {running ? "Durdur" : "Başlat"}
      </button>
    </div>
  );
}
