import type { Progress } from "./progress";
import { streak, totalSeconds } from "./progress";
import { ALL_EXERCISES, TECHNIQUES } from "@/content/techniques";

export const RANKS = [
  { name: "Çaylak", min: 0 },
  { name: "Amatör", min: 5 },
  { name: "Sahne", min: 15 },
  { name: "Turne", min: 30 },
  { name: "Usta", min: 45 },
  { name: "Efsane", min: ALL_EXERCISES.length },
];

export function completedCount(p: Progress): number {
  return ALL_EXERCISES.filter((e) => p.exercises[e.id]?.completed).length;
}

export function rankFor(completed: number) {
  const index = RANKS.findLastIndex((r) => completed >= r.min);
  return { current: RANKS[index], next: RANKS[index + 1] };
}

export function techniqueProgress(p: Progress, slug: string) {
  const t = TECHNIQUES.find((x) => x.slug === slug);
  const ids = t?.levels.flatMap((l) => l.exercises.map((e) => e.id)) ?? [];
  const done = ids.filter((id) => p.exercises[id]?.completed).length;
  return { done, total: ids.length };
}

export type Badge = { id: string; icon: string; title: string; description: string; earned: boolean };

export function badges(p: Progress): Badge[] {
  const done = completedCount(p);
  const secs = totalSeconds(p.sessions);
  const best = Math.max(0, ...Object.values(p.exercises).map((e) => e.bestBpm));
  const fullTechniques = TECHNIQUES.filter((t) => {
    const { done: d, total } = techniqueProgress(p, t.slug);
    return total > 0 && d === total;
  }).length;
  const s = streak(p.sessions);
  const longest = longestStreak(p);

  return [
    { id: "ilk-adim", icon: "🎸", title: "İlk Adım", description: "İlk çalışmanı kaydet.", earned: p.sessions.length > 0 },
    { id: "uc-gun", icon: "🔥", title: "Isınıyor", description: "3 gün üst üste çalış.", earned: Math.max(s, longest) >= 3 },
    { id: "yedi-gun", icon: "📅", title: "Haftalık Seri", description: "7 gün üst üste çalış.", earned: Math.max(s, longest) >= 7 },
    { id: "bir-saat", icon: "⏱", title: "Bir Saat", description: "Toplam 60 dakika çalış.", earned: secs >= 3600 },
    { id: "on-saat", icon: "🏋", title: "On Saat", description: "Toplam 10 saat çalış.", earned: secs >= 36000 },
    { id: "on-egzersiz", icon: "✅", title: "Onluk", description: "10 egzersizi tamamla.", earned: done >= 10 },
    { id: "teknik-ustasi", icon: "🏅", title: "Teknik Ustası", description: "Bir tekniğin tüm egzersizlerini bitir.", earned: fullTechniques >= 1 },
    { id: "hizli", icon: "⚡", title: "Hız Treni", description: "Herhangi bir egzersizde 140 BPM'e ulaş.", earned: best >= 140 },
    { id: "kulak", icon: "🎯", title: "Sap Hakimi", description: "Nota bulma testinde 20 doğru yap.", earned: (p.quizBest["nota-bulma"] ?? 0) >= 20 },
  ];
}

function longestStreak(p: Progress): number {
  const days = [...new Set(p.sessions.map((s) => s.date))].sort();
  let best = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const d of days) {
    const cur = new Date(`${d}T00:00:00`);
    run = prev && Math.round((cur.getTime() - prev.getTime()) / 86400000) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = cur;
  }
  return best;
}
