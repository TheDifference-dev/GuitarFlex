"use client";

import { useEffect, useRef, useState } from "react";

// alphaTab tarayıcıya klasik bir <script> olarak yüklenir (public/alphatab, bkz. scripts/copy-alphatab.mjs).
// Böylece web worker ve font dosyalarını kendi yolundan bulur; bundler ayarı gerekmez.

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    alphaTab?: any;
  }
}

const SCRIPT = "/alphatab/alphaTab.min.js";
let loader: Promise<any> | null = null;

function loadAlphaTab(): Promise<any> {
  if (window.alphaTab) return Promise.resolve(window.alphaTab);
  loader ??= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT;
    s.async = true;
    s.onload = () => resolve(window.alphaTab);
    s.onerror = () => {
      loader = null;
      reject(new Error("alphaTab yüklenemedi"));
    };
    document.head.appendChild(s);
  });
  return loader;
}

type Props = {
  tex: string;
  baseBpm: number;
  onBpmChange?: (bpm: number) => void;
  onPlayingChange?: (playing: boolean) => void;
};

export default function TabPlayer({ tex, baseBpm, onBpmChange, onPlayingChange }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [playerReady, setPlayerReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(100);
  const [metronome, setMetronome] = useState(true);
  const [loop, setLoop] = useState(true);
  const [countIn, setCountIn] = useState(true);
  const [showScore, setShowScore] = useState(false);

  // Callback'leri ref'te tut: değişmeleri player'ı yeniden kurmasın.
  const callbacks = useRef({ onBpmChange, onPlayingChange });
  useEffect(() => {
    callbacks.current = { onBpmChange, onPlayingChange };
  });

  useEffect(() => {
    let disposed = false;
    loadAlphaTab()
      .then((at) => {
        if (disposed || !hostRef.current) return;
        // Worker'lar blob üzerinden açıldığı için yollar tam URL olmalı.
        const abs = (path: string) => new URL(path, window.location.href).href;
        const api = new at.AlphaTabApi(hostRef.current, {
          core: { fontDirectory: abs("/alphatab/font/"), scriptFile: abs(SCRIPT) },
          display: { staveProfile: showScore ? at.StaveProfile.ScoreTab : at.StaveProfile.Tab, scale: 1.0 },
          player: {
            playerMode: at.PlayerMode.EnabledSynthesizer,
            soundFont: abs("/alphatab/soundfont/sonivox.sf2"),
            scrollElement: viewportRef.current,
          },
        });
        apiRef.current = api;
        api.renderFinished.on(() => !disposed && setStatus("ready"));
        api.error.on(() => !disposed && setStatus("error"));
        api.playerReady.on(() => !disposed && setPlayerReady(true));
        api.playerStateChanged.on((e: { state: number }) => {
          if (disposed) return;
          const isPlaying = e.state === 1;
          setPlaying(isPlaying);
          callbacks.current.onPlayingChange?.(isPlaying);
        });
        api.tex(tex);
      })
      .catch(() => !disposed && setStatus("error"));

    return () => {
      disposed = true;
      apiRef.current?.destroy();
      apiRef.current = null;
      setPlayerReady(false);
      setPlaying(false);
    };
  }, [tex, showScore]);

  useEffect(() => {
    const api = apiRef.current;
    if (!api) return;
    api.playbackSpeed = speed / 100;
    api.metronomeVolume = metronome ? 1 : 0;
    api.isLooping = loop;
    api.countInVolume = countIn ? 1 : 0;
  }, [speed, metronome, loop, countIn, playerReady]);

  useEffect(() => {
    callbacks.current.onBpmChange?.(Math.round((baseBpm * speed) / 100));
  }, [baseBpm, speed]);

  const bpm = Math.round((baseBpm * speed) / 100);

  return (
    <div className="rounded-xl border border-line bg-panel">
      <div className="flex flex-wrap items-center gap-3 border-b border-line p-3">
        <button
          type="button"
          onClick={() => apiRef.current?.playPause()}
          disabled={!playerReady}
          className="rounded-lg bg-accent px-4 py-2 font-semibold text-accent-ink disabled:opacity-40"
        >
          {playing ? "❚❚ Duraklat" : "▶ Çal"}
        </button>
        <button
          type="button"
          onClick={() => apiRef.current?.stop()}
          disabled={!playerReady}
          className="rounded-lg border border-line px-3 py-2 disabled:opacity-40"
        >
          ■ Durdur
        </button>

        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted">Tempo</span>
          <input
            type="range"
            min={25}
            max={200}
            step={5}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-32 accent-[var(--accent)]"
          />
          <span className="w-24 tabular-nums">
            {bpm} BPM <span className="text-muted">({speed}%)</span>
          </span>
        </label>

        <div className="flex flex-wrap gap-3 text-sm">
          <Toggle label="Metronom" checked={metronome} onChange={setMetronome} />
          <Toggle label="Döngü" checked={loop} onChange={setLoop} />
          <Toggle label="Sayım" checked={countIn} onChange={setCountIn} />
          <Toggle label="Nota" checked={showScore} onChange={setShowScore} />
        </div>
      </div>

      <div ref={viewportRef} className="relative max-h-[60vh] overflow-auto rounded-b-xl bg-white p-2 text-black">
        {status === "loading" && <p className="p-6 text-center text-sm text-neutral-500">Tab yükleniyor…</p>}
        {status === "error" && <p className="p-6 text-center text-sm text-red-600">Tab gösterilemedi.</p>}
        <div ref={hostRef} />
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-1.5 select-none">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-[var(--accent)]" />
      {label}
    </label>
  );
}
