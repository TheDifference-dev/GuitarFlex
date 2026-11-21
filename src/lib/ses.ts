"use client";

// Kulak eğitimi ve ritim alıştırmaları için ses: Karplus–Strong telli çalgı sentezi (gitar teline yakın tını),
// akor tarama ve metronom tıkı. Ses dosyası gerekmez; her şey Web Audio ile üretilir.

let ctx: AudioContext | null = null;
const cache = new Map<string, AudioBuffer>();

export function audio(): AudioContext | null {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** Karplus–Strong: gürültüyle başlayan, gecikme hattında süzülerek sönen tel sesi */
function pluck(c: AudioContext, midi: number, seconds: number): AudioBuffer {
  const key = `${midi}:${seconds}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const rate = c.sampleRate;
  const freq = 440 * 2 ** ((midi - 69) / 12);
  const period = Math.max(2, Math.round(rate / freq));
  const len = Math.floor(rate * seconds);
  const buf = c.createBuffer(1, len, rate);
  const out = buf.getChannelData(0);
  const line = new Float32Array(period);
  // Pena vuruşu: kısa, biraz yumuşatılmış gürültü
  let prev = 0;
  for (let i = 0; i < period; i++) {
    const n = Math.random() * 2 - 1;
    prev = prev * 0.5 + n * 0.5;
    line[i] = prev;
  }
  // Pes notalar daha uzun, tiz notalar daha kısa çınlar
  const decay = 0.996 - Math.max(0, midi - 52) * 0.00012;
  let idx = 0;
  for (let i = 0; i < len; i++) {
    const a = line[idx];
    const b = line[(idx + 1) % period];
    const v = decay * 0.5 * (a + b);
    line[idx] = v;
    out[i] = a;
    idx = (idx + 1) % period;
  }
  // Başta tıkırtıyı önlemek için çok kısa giriş
  for (let i = 0; i < Math.min(64, len); i++) out[i] *= i / 64;
  cache.set(key, buf);
  return buf;
}

/** Tek nota; `at` saniye cinsinden (AudioContext zamanı), verilmezse hemen */
export function nota(midi: number, at?: number, seconds = 1.6, gain = 0.6) {
  const c = audio();
  if (!c) return;
  const src = c.createBufferSource();
  src.buffer = pluck(c, midi, seconds);
  const g = c.createGain();
  g.gain.value = gain;
  const tone = c.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.value = 4200;
  src.connect(tone).connect(g).connect(c.destination);
  src.start(at ?? c.currentTime);
}

/** Akor: notalar kalından inceye kısa aralıklarla (tarama); `arpej` true ise notalar tek tek */
export function akor(midis: number[], at?: number, opts: { arpej?: boolean; seconds?: number } = {}) {
  const c = audio();
  if (!c) return;
  const t0 = at ?? c.currentTime;
  const gap = opts.arpej ? 0.32 : 0.025;
  [...midis].sort((a, b) => a - b).forEach((m, i) => nota(m, t0 + i * gap, opts.seconds ?? 2, 0.45));
}

/** Notaları sırayla çalar (gam, ezgi); `step` notalar arası saniye */
export function dizi(midis: number[], at?: number, step = 0.36) {
  const c = audio();
  if (!c) return;
  const t0 = at ?? c.currentTime;
  midis.forEach((m, i) => nota(m, t0 + i * step, 0.9, 0.55));
}

/** Metronom tıkı; `vurgu` ölçü başı */
export function tik(at?: number, vurgu = false) {
  const c = audio();
  if (!c) return;
  const t = at ?? c.currentTime;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.frequency.value = vurgu ? 1600 : 1100;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.4, t + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
  osc.connect(g).connect(c.destination);
  osc.start(t);
  osc.stop(t + 0.08);
}

/** Ritim notası: kısa, perküsif bir ses (alkış yerine tahta vuruş) */
export function vurus(at?: number) {
  const c = audio();
  if (!c) return;
  const t = at ?? c.currentTime;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(520, t);
  osc.frequency.exponentialRampToValueAtTime(260, t + 0.08);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.6, t + 0.003);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
  osc.connect(g).connect(c.destination);
  osc.start(t);
  osc.stop(t + 0.16);
}

export const simdi = () => audio()?.currentTime ?? 0;
