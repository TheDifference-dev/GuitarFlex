// Oyun öğeleri: ders kademeleri (madalyalar), başarımlar, günlük görevler, seri ve seri kalkanı.
// Hepsi tarayıcıdaki ilerleme kaydından (progress.ts) hesaplanır; başarım adları ve eşikleri içerik paketinden gelir.

import type { Progress } from "./progress";
import { today } from "./progress";

export type Basarim = { ikon: string; ad: string; kategori: string; aciklama: string; nadirlik: string; xp: number; olcu: string; esik: number };
export type OyunVeri = {
  basarimlar: Basarim[];
  gorevler: { egzersizDk: number; serbestDk: number; teoriAdim: number; kalkanGun: number; kalkanMaks: number; oyMaks: number };
};

/** Serbest çalışma kayıtlarının (doğaçlama, oynatıcı) anahtar öneki */
export const SERBEST = "serbest:";

/* ───────────── Kademeler ───────────── */

const METALLER = ["Bronz", "Gümüş", "Altın", "Platin", "Elmas"] as const;
/** 0 Eğitilmedi, 1–20 Bronz I … Elmas IV, 21 Usta */
export const KADEMELER = ["Eğitilmedi", ...METALLER.flatMap((m) => ["I", "II", "III", "IV"].map((r) => `${m} ${r}`)), "Usta"];
export const METAL_IKON: Record<string, string> = { Bronz: "🥉", Gümüş: "🥈", Altın: "🥇", Platin: "⚪", Elmas: "💎", Usta: "👑" };

/**
 * Bir dersin kademesi: hedef süre her dolduğunda bir kademe (1× hedef = Bronz I … 20× = Elmas IV).
 * Usta kademesi sınavla kazanılır.
 */
export const dersKademesi = (saniye: number, hedef: number) => (hedef > 0 ? Math.min(20, Math.floor(saniye / hedef)) : 0);
export const kademeMetali = (k: number) => (k >= 21 ? "Usta" : k >= 1 ? METALLER[Math.floor((k - 1) / 4)] : null);

/* ───────────── Günler, görevler, seri ───────────── */

export type Gun = { egzersiz: number; serbest: number; teori: number };
export type Gorev = { ad: string; deger: number; hedef: number; birim: string; tamam: boolean; href: string };

const gunAnahtari = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function gunler(p: Progress): Map<string, Gun> {
  const m = new Map<string, Gun>();
  const al = (d: string) => m.get(d) ?? (m.set(d, { egzersiz: 0, serbest: 0, teori: 0 }), m.get(d)!);
  for (const s of p.sessions) {
    const g = al(s.date);
    if (s.exerciseId.startsWith(SERBEST)) g.serbest += s.seconds;
    else g.egzersiz += s.seconds;
  }
  for (const [d, n] of Object.entries(p.teori ?? {})) al(d).teori += n;
  return m;
}

export function gorevler(g: Gun | undefined, kural: OyunVeri["gorevler"]): Gorev[] {
  const x = g ?? { egzersiz: 0, serbest: 0, teori: 0 };
  return [
    { ad: "Egzersiz", deger: Math.floor(x.egzersiz / 60), hedef: kural.egzersizDk, birim: "dk", tamam: x.egzersiz >= kural.egzersizDk * 60, href: "/" },
    { ad: "Teori", deger: x.teori, hedef: kural.teoriAdim, birim: "adım", tamam: x.teori >= kural.teoriAdim, href: "/teori" },
    { ad: "Serbest Çalışma", deger: Math.floor(x.serbest / 60), hedef: kural.serbestDk, birim: "dk", tamam: x.serbest >= kural.serbestDk * 60, href: "/sarkilar/dogaclama" },
  ];
}

export type Seri = { seri: number; rekor: number; kalkan: number; kullanilan: number; bugunTamam: boolean };

/**
 * Seri: en az bir günlük görevin tamamlandığı art arda günler. Seri sürerken görevlerin üçü birden
 * `kalkanGun` farklı günde tamamlanınca bir Seri Kalkanı kazanılır (en çok `kalkanMaks`); görevsiz geçen
 * bir gün kalkan varsa onu harcar ve seri donar (artmaz ama bozulmaz). Bugün henüz görev yoksa seri bozulmaz.
 */
export function seri(p: Progress, kural: OyunVeri["gorevler"]): Seri {
  const g = gunler(p);
  const bugun = today();
  const ilk = [...g.keys()].sort()[0];
  const out: Seri = { seri: 0, rekor: 0, kalkan: 0, kullanilan: 0, bugunTamam: false };
  if (!ilk) return out;
  let tamGun = 0;
  const d = new Date(`${ilk}T12:00:00`);
  for (;;) {
    const k = gunAnahtari(d);
    const gv = gorevler(g.get(k), kural);
    const n = gv.filter((x) => x.tamam).length;
    if (n > 0) {
      out.seri++;
      if (n === gv.length && ++tamGun % kural.kalkanGun === 0 && out.kalkan < kural.kalkanMaks) out.kalkan++;
      if (k === bugun) out.bugunTamam = true;
    } else if (k !== bugun) {
      if (out.seri > 0 && out.kalkan > 0) {
        out.kalkan--;
        out.kullanilan++;
      } else {
        out.seri = 0;
        tamGun = 0;
      }
    }
    out.rekor = Math.max(out.rekor, out.seri);
    if (k >= bugun) break;
    d.setDate(d.getDate() + 1);
  }
  return out;
}

/* ───────────── Başarım ölçüleri ───────────── */

/** Profil sayfasının sunucudan verdiği kurs yapısı */
export type KursYapisi = {
  slug: string;
  /** Akustik ya da elektro teknik kursu mu (rehber ve teori dersleri hariç) */
  teknik: boolean;
  /** Bölüm → ders anahtarları */
  bolumler: string[][];
  /** Ders anahtarı → hedef süre (sn) */
  hedef: Record<string, number>;
};

export function olculer(p: Progress, kurslar: KursYapisi[], kural: OyunVeri["gorevler"]): Record<string, number> {
  const tamam = (k: string) => Boolean(p.exercises[k]?.completed);
  const teknikler = kurslar.filter((c) => c.teknik);
  const bolumBitti = (b: string[]) => b.length > 0 && b.every(tamam);
  const kademeler: number[] = [];
  for (const c of kurslar) for (const [k, h] of Object.entries(c.hedef)) kademeler.push(dersKademesi(p.exercises[k]?.totalSeconds ?? 0, h));
  const metal = (alt: number) => kademeler.filter((k) => k >= alt).length;
  const g = gunler(p);
  const gunlukDk = Math.max(0, ...[...g.values()].map((x) => Math.floor((x.egzersiz + x.serbest) / 60)));
  const tarihler = [...p.sessions.map((s) => s.date), ...Object.keys(p.teori ?? {})].sort();
  const yas = tarihler.length ? Math.floor((Date.now() - new Date(`${tarihler[0]}T00:00:00`).getTime()) / 86400000) : 0;
  const s = seri(p, kural);
  return {
    streak_days: Math.max(s.seri, s.rekor),
    night_practice: p.sessions.filter((x) => x.saat !== undefined && x.saat < 4).length,
    morning_practice: p.sessions.filter((x) => x.saat !== undefined && x.saat >= 5 && x.saat < 7).length,
    daily_practice_minutes: gunlukDk,
    first_lesson: Object.keys(p.exercises).filter((k) => !k.startsWith(SERBEST) && tamam(k)).length,
    pathways_with_lessons: teknikler.filter((c) => c.bolumler.flat().some(tamam)).length,
    completed_sections: teknikler.reduce((n, c) => n + c.bolumler.filter(bolumBitti).length, 0),
    techniques_with_completed_section: teknikler.filter((c) => c.bolumler.some(bolumBitti)).length,
    pathways_completed: teknikler.filter((c) => c.bolumler.length > 0 && c.bolumler.every(bolumBitti)).length,
    bronze_count: metal(1),
    silver_count: metal(5),
    gold_count: metal(9),
    platinum_count: metal(13),
    diamond_count: metal(17),
    master_count: metal(21),
    account_exists: 1,
    account_age_days: yas,
    distinct_saved_tabs: Object.entries(p.exercises).filter(([k, e]) => !k.startsWith(SERBEST) && e.totalSeconds >= 30).length,
  };
}
