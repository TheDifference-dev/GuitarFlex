"use client";

import { useSyncExternalStore } from "react";

// Şimdilik ilerleme tarayıcıda (localStorage) tutulur. Üyelik sistemi eklendiğinde
// aynı şekil Supabase tablosuna taşınacak.

export type ExerciseProgress = {
  completed: boolean;
  bestBpm: number;
  totalSeconds: number;
  lastPracticedAt: string;
};

export type Session = {
  /** YYYY-MM-DD (yerel saat) */
  date: string;
  exerciseId: string;
  seconds: number;
  bpm: number;
};

export type Progress = {
  exercises: Record<string, ExerciseProgress>;
  sessions: Session[];
  quizBest: Record<string, number>;
};

const KEY = "muzik.progress.v1";
const EMPTY: Progress = { exercises: {}, sessions: [], quizBest: {} };

let cache: Progress | null = null;
const listeners = new Set<() => void>();

function read(): Progress {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? { ...EMPTY, ...(JSON.parse(raw) as Progress) } : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function write(next: Progress) {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Gizli sekme vb. durumlarda kayıt yapılamaz; oturum boyunca bellekte kalır.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function logPractice(exerciseId: string, seconds: number, bpm: number, completed: boolean) {
  const p = read();
  const prev = p.exercises[exerciseId];
  const entry: ExerciseProgress = {
    completed: completed || prev?.completed || false,
    bestBpm: Math.max(prev?.bestBpm ?? 0, bpm),
    totalSeconds: (prev?.totalSeconds ?? 0) + seconds,
    lastPracticedAt: new Date().toISOString(),
  };
  write({
    ...p,
    exercises: { ...p.exercises, [exerciseId]: entry },
    sessions: [...p.sessions, { date: today(), exerciseId, seconds, bpm }],
  });
}

export function setCompleted(exerciseId: string, completed: boolean) {
  const p = read();
  const prev = p.exercises[exerciseId] ?? { completed: false, bestBpm: 0, totalSeconds: 0, lastPracticedAt: new Date().toISOString() };
  write({ ...p, exercises: { ...p.exercises, [exerciseId]: { ...prev, completed } } });
}

export function saveQuizScore(quiz: string, score: number) {
  const p = read();
  if ((p.quizBest[quiz] ?? 0) >= score) return;
  write({ ...p, quizBest: { ...p.quizBest, [quiz]: score } });
}

export function resetProgress() {
  write(EMPTY);
}

/** Bugün ya da dün biten, art arda çalışılan gün sayısı. */
export function streak(sessions: Session[]): number {
  const days = new Set(sessions.map((s) => s.date));
  const d = new Date();
  const key = () => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  if (!days.has(key())) d.setDate(d.getDate() - 1);
  let count = 0;
  while (days.has(key())) {
    count++;
    d.setDate(d.getDate() - 1);
  }
  return count;
}

export function totalSeconds(sessions: Session[]): number {
  return sessions.reduce((sum, s) => sum + s.seconds, 0);
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h) return `${h} sa ${m} dk`;
  if (m) return `${m} dk`;
  return `${seconds} sn`;
}
