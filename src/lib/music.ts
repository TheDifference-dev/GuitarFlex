export const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;
export const SOLFEGE = ["Do", "Do#", "Re", "Re#", "Mi", "Fa", "Fa#", "Sol", "Sol#", "La", "La#", "Si"] as const;
export const INTERVALS = ["1", "b2", "2", "b3", "3", "4", "b5", "5", "b6", "6", "b7", "7"] as const;

/** Standart akort, tel 1 (ince Mi) → tel 6 (kalın Mi), MIDI numarası. */
export const STANDARD_TUNING = [64, 59, 55, 50, 45, 40];

export type PitchSet = { id: string; name: string; intervals: number[]; kind: "scale" | "chord" };

export const SCALES: PitchSet[] = [
  { id: "major", name: "Majör (İyonyen)", intervals: [0, 2, 4, 5, 7, 9, 11], kind: "scale" },
  { id: "minor", name: "Doğal Minör (Eolyen)", intervals: [0, 2, 3, 5, 7, 8, 10], kind: "scale" },
  { id: "minor-penta", name: "Minör Pentatonik", intervals: [0, 3, 5, 7, 10], kind: "scale" },
  { id: "major-penta", name: "Majör Pentatonik", intervals: [0, 2, 4, 7, 9], kind: "scale" },
  { id: "blues", name: "Blues", intervals: [0, 3, 5, 6, 7, 10], kind: "scale" },
  { id: "dorian", name: "Dorian", intervals: [0, 2, 3, 5, 7, 9, 10], kind: "scale" },
  { id: "phrygian", name: "Frigyen", intervals: [0, 1, 3, 5, 7, 8, 10], kind: "scale" },
  { id: "mixolydian", name: "Miksolidyen", intervals: [0, 2, 4, 5, 7, 9, 10], kind: "scale" },
  { id: "harmonic-minor", name: "Armonik Minör", intervals: [0, 2, 3, 5, 7, 8, 11], kind: "scale" },
];

export const CHORD_TYPES: PitchSet[] = [
  { id: "maj", name: "Majör", intervals: [0, 4, 7], kind: "chord" },
  { id: "min", name: "Minör", intervals: [0, 3, 7], kind: "chord" },
  { id: "5", name: "Power (5)", intervals: [0, 7], kind: "chord" },
  { id: "7", name: "Dominant 7", intervals: [0, 4, 7, 10], kind: "chord" },
  { id: "maj7", name: "Majör 7", intervals: [0, 4, 7, 11], kind: "chord" },
  { id: "m7", name: "Minör 7", intervals: [0, 3, 7, 10], kind: "chord" },
  { id: "sus2", name: "Sus2", intervals: [0, 2, 7], kind: "chord" },
  { id: "sus4", name: "Sus4", intervals: [0, 5, 7], kind: "chord" },
  { id: "dim", name: "Eksik (dim)", intervals: [0, 3, 6], kind: "chord" },
];

export const ALL_SETS = [...SCALES, ...CHORD_TYPES];

export function pitchAt(string: number, fret: number, tuning = STANDARD_TUNING): number {
  return tuning[string - 1] + fret;
}

export function noteName(midi: number, solfege = false): string {
  const pc = ((midi % 12) + 12) % 12;
  return solfege ? SOLFEGE[pc] : NOTES[pc];
}

/** Bir notanın verilen köke göre aralığı (0-11), sette yoksa null. */
export function degreeIn(midi: number, root: number, set: PitchSet): number | null {
  const iv = (((midi - root) % 12) + 12) % 12;
  return set.intervals.includes(iv) ? iv : null;
}

let ctx: AudioContext | null = null;

/** Basit bir telli çalgı sesiyle tek nota çalar (kulak eğitimi ve sap gezgini için). */
export function playMidi(midi: number, duration = 1.2) {
  try {
    ctx ??= new AudioContext();
    const now = ctx.currentTime;
    const freq = 440 * 2 ** ((midi - 69) / 12);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.35, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(freq * 6, now);
    filter.frequency.exponentialRampToValueAtTime(freq * 1.5, now + duration);
    for (const [type, mult, level] of [["sawtooth", 1, 0.5], ["triangle", 2, 0.3]] as const) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq * mult;
      g.gain.value = level;
      osc.connect(g).connect(filter);
      osc.start(now);
      osc.stop(now + duration);
    }
    filter.connect(gain).connect(ctx.destination);
  } catch {
    // Ses desteklenmiyorsa sessizce geç.
  }
}
