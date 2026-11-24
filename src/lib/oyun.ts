// Oyun öğeleri: ders kademeleri (madalyalar), başarımlar, günlük görevler, seri ve seri kalkanı.
// Hepsi tarayıcıdaki ilerleme kaydından (progress.ts) hesaplanır; başarım adları ve eşikleri içerik paketinden gelir.

import type { Progress } from "./progress";
import { today } from "./progress";
import { RUTIN_KURSU, gununRutini, teknik, type TeknikId } from "../content/rutin";

export type Basarim = { ikon?: string; ad: string; kategori: string; aciklama: string; nadirlik: string; xp: number; olcu: string; esik: number };
/**
 * Günlük görev kuralları (içerik paketi icerik/oyun.json › gorevler). Günlük hedef (W5, Arda'nın tarifi):
 * ısınma `isinmaDk` (10–15 dk, Kromatik Isınma / Günlük Rutin) + `calismaDk` (20 dk) çalışma: günün üç tekniğinden en az
 * `teknikHedef`'i (her biri ≥ `teknikDk` dk) ve kalan sürede `sarkiHedef` şarkı (≥ `sarkiDk` dk). Eski alanlar
 * (serbestDk, teoriAdim) artık görev değildir; egzersizDk günlük toplam hedeftir (Çalışma Defteri planı).
 */
export type GorevKurali = {
  egzersizDk: number;
  isinmaDk?: number;
  calismaDk?: number;
  teknikDk?: number;
  teknikHedef?: number;
  sarkiDk?: number;
  sarkiHedef?: number;
  serbestDk?: number;
  teoriAdim?: number;
  kalkanGun: number;
  kalkanMaks: number;
  oyMaks: number;
};
export type OyunVeri = { basarimlar: Basarim[]; gorevler: GorevKurali };
/** Kural alanları verilmezse (eski içerik paketi) kullanılan değerler */
export const kurallar = (k: GorevKurali) => ({
  isinmaDk: k.isinmaDk ?? 10,
  calismaDk: k.calismaDk ?? 20,
  teknikDk: k.teknikDk ?? 5,
  teknikHedef: k.teknikHedef ?? 2,
  sarkiDk: k.sarkiDk ?? 5,
  sarkiHedef: k.sarkiHedef ?? 1,
});

/** Serbest çalışma kayıtlarının (doğaçlama, oynatıcı) anahtar öneki */
export const SERBEST = "serbest:";

/* ───────────── Kademeler ───────────── */

const METALLER = ["Bronz", "Gümüş", "Altın", "Platin", "Elmas"] as const;
/** 0 Eğitilmedi, 1–20 Bronz I … Elmas IV, 21 Usta */
export const KADEMELER = ["Eğitilmedi", ...METALLER.flatMap((m) => ["I", "II", "III", "IV"].map((r) => `${m} ${r}`)), "Usta"];

/**
 * Bir dersin kademesi: hedef süre her dolduğunda bir kademe (1× hedef = Bronz I … 20× = Elmas IV).
 * Usta kademesi sınavla kazanılır.
 */
export const dersKademesi = (saniye: number, hedef: number) => (hedef > 0 ? Math.min(20, Math.floor(saniye / hedef)) : 0);
export const kademeMetali = (k: number) => (k >= 21 ? "Usta" : k >= 1 ? METALLER[Math.floor((k - 1) / 4)] : null);

/* ───────────── Günler, görevler, seri ───────────── */

/**
 * Günün ölçümleri. Kaynaklar (çift sayma yok):
 *  • ilerleme kaydı (progress.ts): `kromatik-isinma/…` oturumları ısınma, diğer kurs dersleri teknik (kurs slug'ına göre),
 *    `serbest:kutuphane/…` oturumları şarkı (Şarkı Kütüphanesi ve kendi dosyaların, uygulamada ölçülen süre);
 *  • Çalışma Defteri (verilirse): şarkı kayıtlarının oturumları. Uygulamada ölçülen defter süresi ilerleme kaydının bir
 *    alt kümesidir: aynı şarkı için ikisinin büyüğü alınır; elle girilen süre (Songsterr'de çalınan şarkı) eklenir.
 */
export type Gun = {
  egzersiz: number;
  serbest: number;
  teori: number;
  /** Isınma saniyesi (Kromatik Isınma dersleri; Günlük Rutin de bu derslere yazar) */
  isinma: number;
  /** Kurs slug'ı → saniye (ısınma hariç) */
  kurs: Record<string, number>;
  /** Şarkı kimliği ("kutuphane/<slug>", "dosya/<id>", "songsterr/…") → saniye */
  sarki: Record<string, number>;
};
export type Gorev = {
  ad: string;
  deger: number;
  hedef: number;
  birim: string;
  tamam: boolean;
  href: string;
  /** Teknik görevinin üç tekniği: her birinin dakikası */
  alt?: { ad: string; dk: number; hedefDk: number; tamam: boolean; href: string }[];
};

const gunAnahtari = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const bosGun = (): Gun => ({ egzersiz: 0, serbest: 0, teori: 0, isinma: 0, kurs: {}, sarki: {} });

/** Defterin şarkı oturumları (yalnız bu işlevin ihtiyacı kadar: defter-cekirdek'e bağımlılık yok) */
export type DefterSarkilari = { kayitlar: Record<string, { tur: string; oturumlar: { tarih: string; sure: number; elle?: boolean }[] }> };

export function gunler(p: Progress, defter?: DefterSarkilari): Map<string, Gun> {
  const m = new Map<string, Gun>();
  const al = (d: string) => m.get(d) ?? (m.set(d, bosGun()), m.get(d)!);
  const olculen = new Map<string, Record<string, number>>();
  for (const s of p.sessions) {
    const g = al(s.date);
    if (s.exerciseId.startsWith(SERBEST)) {
      g.serbest += s.seconds;
      const k = s.exerciseId.slice(SERBEST.length);
      if (k.startsWith("kutuphane/")) {
        const id = k === "kutuphane/dosya" ? "dosya" : k;
        const o = olculen.get(s.date) ?? (olculen.set(s.date, {}), olculen.get(s.date)!);
        o[id] = (o[id] ?? 0) + s.seconds;
      }
    } else {
      g.egzersiz += s.seconds;
      const slug = s.exerciseId.split("/")[0];
      if (slug === RUTIN_KURSU) g.isinma += s.seconds;
      else g.kurs[slug] = (g.kurs[slug] ?? 0) + s.seconds;
    }
  }
  for (const [d, n] of Object.entries(p.teori ?? {})) al(d).teori += n;
  // Şarkılar: ilerleme kaydının ölçtüğü ile defterin ölçtüğünün büyüğü + defterin elle süresi
  const defterOlculen = new Map<string, Record<string, number>>();
  const elle = new Map<string, Record<string, number>>();
  for (const [kid, k] of Object.entries(defter?.kayitlar ?? {})) {
    if (k.tur !== "sarki" || !kid.startsWith("sarki:")) continue;
    const id = kid.slice("sarki:".length);
    for (const o of k.oturumlar) {
      const hedef = o.elle ? elle : defterOlculen;
      const r = hedef.get(o.tarih) ?? (hedef.set(o.tarih, {}), hedef.get(o.tarih)!);
      r[id] = (r[id] ?? 0) + o.sure;
    }
  }
  for (const d of new Set([...olculen.keys(), ...defterOlculen.keys(), ...elle.keys()])) {
    const g = al(d);
    const a = { ...(olculen.get(d) ?? {}) };
    const b = defterOlculen.get(d) ?? {};
    // Kendi dosyaların ilerleme kaydında tek anahtarda ("dosya"); defter dosya başına tutar: defter varsa o geçerli
    if (a.dosya && Object.keys(b).some((x) => x.startsWith("dosya/"))) delete a.dosya;
    const e = elle.get(d) ?? {};
    for (const id of new Set([...Object.keys(a), ...Object.keys(b), ...Object.keys(e)])) g.sarki[id] = Math.max(a[id] ?? 0, b[id] ?? 0) + (e[id] ?? 0);
  }
  return m;
}

/** Günün görevleri: Isınma, Teknik (üç teknikten `teknikHedef`'i), Şarkı */
export function gorevler(g: Gun | undefined, kural: GorevKurali, teknikler: TeknikId[]): Gorev[] {
  const x = g ?? bosGun();
  const k = kurallar(kural);
  const alt = teknikler.map((id) => {
    const t = teknik(id);
    const sn = (t?.kurslar ?? []).reduce((n, c) => n + (x.kurs[c] ?? 0), 0);
    return { ad: t?.ad ?? id, dk: Math.floor(sn / 60), hedefDk: k.teknikDk, tamam: sn >= k.teknikDk * 60, href: t?.kurslar[0] ? `/calis/${t.kurslar[0]}` : "/kurslar" };
  });
  const teknikSayi = alt.filter((a) => a.tamam).length;
  const sarkiSayi = Object.values(x.sarki).filter((sn) => sn >= k.sarkiDk * 60).length;
  return [
    { ad: "Isınma", deger: Math.floor(x.isinma / 60), hedef: k.isinmaDk, birim: "dk", tamam: x.isinma >= k.isinmaDk * 60, href: "/rutin" },
    { ad: `Teknik (${teknikler.length}'ten ${k.teknikHedef})`, deger: teknikSayi, hedef: k.teknikHedef, birim: "", tamam: teknikSayi >= k.teknikHedef, href: "/rutin#gunun-teknikleri", alt },
    { ad: "Şarkı", deger: sarkiSayi, hedef: k.sarkiHedef, birim: "", tamam: sarkiSayi >= k.sarkiHedef, href: "/sarki-kutuphanesi/rehber" },
  ];
}

export type Seri = { seri: number; rekor: number; kalkan: number; kullanilan: number; bugunTamam: boolean };

/**
 * Seri: en az bir günlük görevin (Isınma, Teknik, Şarkı) tamamlandığı art arda günler. Seri sürerken görevlerin üçü birden
 * `kalkanGun` farklı günde tamamlanınca bir Seri Kalkanı kazanılır (en çok `kalkanMaks`); görevsiz geçen
 * bir gün kalkan varsa onu harcar ve seri donar (artmaz ama bozulmaz). Bugün henüz görev yoksa seri bozulmaz.
 */
export function seri(p: Progress, kural: GorevKurali, defter?: DefterSarkilari, teknikler: (tarih: string) => TeknikId[] = (t) => [...gununRutini(t).teknikler]): Seri {
  const g = gunler(p, defter);
  const bugun = today();
  const ilk = [...g.keys()].sort()[0];
  const out: Seri = { seri: 0, rekor: 0, kalkan: 0, kullanilan: 0, bugunTamam: false };
  if (!ilk) return out;
  let tamGun = 0;
  const d = new Date(`${ilk}T12:00:00`);
  for (;;) {
    const k = gunAnahtari(d);
    const gv = gorevler(g.get(k), kural, teknikler(k));
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

export function olculer(p: Progress, kurslar: KursYapisi[], kural: GorevKurali, defter?: DefterSarkilari, gununTeknikleri?: (tarih: string) => TeknikId[]): Record<string, number> {
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
  const s = seri(p, kural, defter, gununTeknikleri);
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
