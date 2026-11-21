// GuitarFlex iOS — ilerleme deposu.
// Masaüstünün src/lib/progress.ts API'siyle ve kayıt biçimiyle aynı (anahtarlar: "<kurs>/<ders-id>", "<yol>/<kod>").
// Metro, masaüstü bileşenlerinin "@/lib/progress" içe aktarmasını bu dosyaya yönlendirir (metro.config.js); böylece
// AdimCalis, LessonPractice gibi paylaşılan bileşenler mobil depoya yazar.
//
// İki çalışma biçimi:
//  · Ana uygulama (iOS yerel ya da web): kayıt AsyncStorage'da (web'de localStorage üzerinden).
//  · DOM bileşeni iOS WebView'inde: ayrı bir JS bağlamıdır, AsyncStorage'a erişemez. Sarmalayıcı (kopru/*.tsx)
//    kopruKur() ile ilk kaydı verir; her yazım yerel uygulamaya gönderilir, orada kalıcı olur.
import { useSyncExternalStore } from "react";

export type ExerciseProgress = { completed: boolean; bestBpm: number; totalSeconds: number; lastPracticedAt: string };
export type Session = { date: string; exerciseId: string; seconds: number; bpm: number; saat?: number };
export type StepProgress = { best: number; passed: boolean; attempts: number; at: string };
/** Çalışma Defteri: sarı "çalışmaya devam" · yeşil "öğrendim"; hangi gitarla, not */
export type DefterKaydi = { durum: "devam" | "ogrendim"; gitar?: string; not?: string; at: string };
export type Ayarlar = { gunlukHedefDk: number; gitarlar: string[] };

export type Progress = {
  exercises: Record<string, ExerciseProgress>;
  sessions: Session[];
  quizBest: Record<string, number>;
  steps: Record<string, StepProgress>;
  teori: Record<string, number>;
  yolGoc?: number;
  /** Yalnız mobil (masaüstünde Çalışma Defteri gelince aynı alan adıyla birleştirilecek) */
  defter?: Record<string, DefterKaydi>;
  ayarlar?: Ayarlar;
};

export const KEY = "muzik.progress.v1";
export const VARSAYILAN_AYAR: Ayarlar = { gunlukHedefDk: 15, gitarlar: ["Epiphone Les Paul Custom"] };
const EMPTY: Progress = { exercises: {}, sessions: [], quizBest: {}, steps: {}, teori: {}, yolGoc: 1, defter: {}, ayarlar: VARSAYILAN_AYAR };

let cache: Progress = EMPTY;
let yuklendi = false;
const listeners = new Set<() => void>();
/** Kalıcı yazıcı: ana uygulamada AsyncStorage, WebView'de yerel uygulamaya köprü */
let kalici: ((p: Progress) => void) | null = null;

/** Ana uygulama açılışında bir kez: kaydı okur. */
export async function yukle(): Promise<Progress> {
  if (yuklendi) return cache;
  const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
  const once = cache;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    // Yükleme sürerken bir kayıt yazıldıysa (cache değiştiyse) onu ezme
    if (raw && cache === once) cache = { ...EMPTY, ...(JSON.parse(raw) as Progress) };
  } catch {
    // Bozuk kayıt: boş başla
  }
  kalici = (p) => {
    AsyncStorage.setItem(KEY, JSON.stringify(p)).catch(() => {});
  };
  if (cache !== once) kalici(cache);
  yuklendi = true;
  listeners.forEach((l) => l());
  return cache;
}

/** DOM bileşeni (WebView) içinde: ilk kayıt ve yerel uygulamaya yazıcı */
export function kopruKur(ilk: Progress, yaz: (p: Progress) => void) {
  cache = { ...EMPTY, ...ilk };
  kalici = yaz;
  yuklendi = true;
  listeners.forEach((l) => l());
}

/** WebView tarafı: yerel uygulamadaki güncel kaydı alır (geri göndermez; döngü olmaz) */
export function kopruGuncelle(p: Progress) {
  cache = { ...EMPTY, ...p };
  listeners.forEach((l) => l());
}

/** Yerel uygulama tarafı: WebView'den gelen kaydı benimser */
export function disaridanYaz(p: Progress) {
  write({ ...EMPTY, ...p });
}

function read(): Progress {
  return cache;
}

function write(next: Progress) {
  cache = next;
  kalici?.(next);
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, read, read);
}

export function useYuklendi(): boolean {
  return useSyncExternalStore(subscribe, () => yuklendi, () => yuklendi);
}

export function today(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function logPractice(exerciseId: string, seconds: number, bpm: number, completed: boolean) {
  const p = read();
  const prev = p.exercises[exerciseId];
  write({
    ...p,
    exercises: {
      ...p.exercises,
      [exerciseId]: {
        completed: completed || prev?.completed || false,
        bestBpm: Math.max(prev?.bestBpm ?? 0, bpm),
        totalSeconds: (prev?.totalSeconds ?? 0) + seconds,
        lastPracticedAt: new Date().toISOString(),
      },
    },
    sessions: [...p.sessions, { date: today(), exerciseId, seconds, bpm, saat: new Date().getHours() }],
  });
}

/** Masaüstüyle aynı: süre hedefe ulaşınca ders tamamlanır; aynı gün aynı ders tek oturum satırında birleşir */
export function addPracticeTime(key: string, seconds: number, bpm: number, targetSeconds: number) {
  if (seconds <= 0) return;
  const p = read();
  const prev = p.exercises[key];
  const total = (prev?.totalSeconds ?? 0) + seconds;
  const entry: ExerciseProgress = {
    completed: (prev?.completed ?? false) || total >= targetSeconds,
    bestBpm: Math.max(prev?.bestBpm ?? 0, bpm),
    totalSeconds: total,
    lastPracticedAt: new Date().toISOString(),
  };
  const date = today();
  const sessions = [...p.sessions];
  const last = sessions[sessions.length - 1];
  if (last && last.date === date && last.exerciseId === key) sessions[sessions.length - 1] = { ...last, seconds: last.seconds + seconds, bpm: Math.max(last.bpm, bpm) };
  else sessions.push({ date, exerciseId: key, seconds, bpm, saat: new Date().getHours() });
  write({ ...p, exercises: { ...p.exercises, [key]: entry }, sessions });
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

export function saveStep(key: string, score: number, passed: boolean) {
  const p = read();
  const prev = p.steps[key];
  const gun = today();
  write({
    ...p,
    steps: { ...p.steps, [key]: { best: Math.max(prev?.best ?? 0, score), passed: passed || !!prev?.passed, attempts: (prev?.attempts ?? 0) + 1, at: new Date().toISOString() } },
    teori: passed ? { ...p.teori, [gun]: (p.teori[gun] ?? 0) + 1 } : p.teori,
  });
}

/** Çalışma Defteri kaydı (null: kaydı sil) */
export function defterYaz(key: string, kayit: Omit<DefterKaydi, "at"> | null) {
  const p = read();
  const defter = { ...(p.defter ?? {}) };
  if (kayit) defter[key] = { ...defter[key], ...kayit, at: new Date().toISOString() };
  else delete defter[key];
  write({ ...p, defter });
}

/** Elle süre ekleme (defterden): hangi ders, kaç dakika, hangi gitar */
export function sureEkle(key: string, dakika: number, gitar?: string) {
  const p = read();
  write({ ...p, sessions: [...p.sessions, { date: today(), exerciseId: key, seconds: Math.round(dakika * 60), bpm: 0, saat: new Date().getHours() }] });
  if (gitar) defterYaz(key, { durum: p.defter?.[key]?.durum ?? "devam", gitar, not: p.defter?.[key]?.not });
}

export function ayarYaz(a: Partial<Ayarlar>) {
  const p = read();
  write({ ...p, ayarlar: { ...VARSAYILAN_AYAR, ...p.ayarlar, ...a } });
}

export function resetProgress() {
  write(EMPTY);
}

/** Gün → o gün çalışılan saniye + geçilen teori adımı; seri her ikisini de sayar */
export function gunEtkinligi(p: Progress): Map<string, { sn: number; teori: number }> {
  const m = new Map<string, { sn: number; teori: number }>();
  for (const s of p.sessions) {
    const g = m.get(s.date) ?? { sn: 0, teori: 0 };
    g.sn += s.seconds;
    m.set(s.date, g);
  }
  for (const [d, n] of Object.entries(p.teori)) {
    const g = m.get(d) ?? { sn: 0, teori: 0 };
    g.teori += n;
    m.set(d, g);
  }
  return m;
}

/** Bugün ya da dün biten, art arda etkin gün sayısı (çalma süresi ya da geçilen teori adımı) */
export function seri(p: Progress): number {
  const gunler = gunEtkinligi(p);
  const d = new Date();
  if (!gunler.has(today(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (gunler.has(today(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

/** Masaüstü API'si: yalnız oturumlara göre seri */
export function streak(sessions: Session[]): number {
  return seri({ ...EMPTY, sessions });
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
