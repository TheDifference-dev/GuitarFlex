// Sadece sunucu tarafında kullanılır (node:fs).
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Axis, Course, Lesson, Level } from "@/content/types";
import { lessonKey } from "@/content/courses";
import {
  EK_KURS,
  ETUTLER,
  KADEMELER,
  LEVELS,
  STIL_KURSU,
  guideCopyTest,
  isAcoustic,
  kademeOf,
  lessonTags,
  type Kademe,
  type SeviyeSatiri,
  type SeviyeVerisi,
  isLevel,
} from "@/content/seviyeler";
import { getCourses } from "./courses";
import { getYol, YOLLAR } from "./yollar";
import type { Yol, YolAdim } from "./alistirma/tipler";
import { PRIVATE_ROOTS } from "./private-roots";

// Seviye Yolu verisi (Müfredat Spec v2.2 §10), dört kademede (Başlangıç, Orta, Orta-Üst, Üst Düzey). Sıra:
//  1. içerik seviyesi (Üst Düzey'de L4, L5'ten önce),
//  2. kaynak (kurs, teori yolu, Ek kurs, Stil kursu, etüt),
//  3. alt bölümün becerilerinin sözlükteki en derin önkoşul derinliği (küçük olan önce),
//  4. kurs sırası (site.json/courseOrder, getCourses() sırası),
//  5. alt bölüm kodu.
// Rehberlerdeki kopya dersler (ölçüt: guideCopyTest, src/content/seviyeler.ts) hiç sayılmaz.

type Sozluk = Record<string, { level?: string; axis?: Axis; prereq?: string[] }>;

/** Beceri sözlüğü: kişisel içerik köklerinde belgeler/mufredat/beceri-sozlugu.json (ilk bulunan). Yoksa boş. */
async function readSozluk(): Promise<Sozluk> {
  for (const root of PRIVATE_ROOTS) {
    try {
      return JSON.parse(await readFile(path.join(root, "belgeler", "mufredat", "beceri-sozlugu.json"), "utf8")) as Sozluk;
    } catch {
      // Bu kökte yoksa sıradakine bak.
    }
  }
  return {};
}

/** Becerinin önkoşul derinliği: önkoşulsuz 0, değilse 1 + en derin önkoşul. Bilinmeyen beceri 0. */
function depthFn(sozluk: Sozluk) {
  const memo = new Map<string, number>();
  const depth = (skill: string, seen: Set<string>): number => {
    const hit = memo.get(skill);
    if (hit !== undefined) return hit;
    if (seen.has(skill)) return 0; // Döngü olmamalı (sözlük denetlendi); yine de sonsuz döngüye girme.
    seen.add(skill);
    const pre = sozluk[skill]?.prereq ?? [];
    const d = pre.length ? 1 + Math.max(...pre.map((p) => depth(p, seen))) : 0;
    seen.delete(skill);
    memo.set(skill, d);
    return d;
  };
  return (skills: Iterable<string>) => {
    let max = 0;
    for (const s of skills) max = Math.max(max, depth(s, new Set()));
    return max;
  };
}

const compareCode = (a: string, b: string) => {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? -1) - (pb[i] ?? -1);
    if (d) return Number.isNaN(d) ? a.localeCompare(b) : d;
  }
  return 0;
};

type Aday = SeviyeSatiri & { depth: number; courseIndex: number };

/** Kursun etiketli alt bölümlerini seviyeye göre satırlara böler.
 *  Bir alt bölümde farklı seviyede dersler varsa her parça kendi satırında sayılır. */
function rowsOf(
  course: Course,
  courseIndex: number,
  depthOf: (s: Iterable<string>) => number,
  sozluk: Sozluk,
  isCopy: (c: Course, l: Lesson) => boolean,
  kaynak: SeviyeSatiri["kaynak"],
): Aday[] {
  const out: Aday[] = [];
  for (const s of course.sections)
    for (const ch of s.chapters) {
      // Alt bölüm × seviye bir satır (sade liste); satırın ekseni derslerinde en sık geçen ana eksen
      const parts = new Map<string, Aday & { skills: Set<string>; eksenSay: Map<Axis, number> }>();
      for (const l of ch.lessons) {
        const t = lessonTags(ch, l);
        if (!t.level || isCopy(course, l)) continue;
        // Ana eksen: axes[0]; eksen yazılmamışsa ilk becerinin sözlükteki ekseni, o da yoksa teknik.
        const axis: Axis = t.axes?.[0] ?? (t.skills?.[0] ? sozluk[t.skills[0]]?.axis : undefined) ?? "technique";
        const id = t.level;
        let row = parts.get(id);
        if (!row) {
          row = {
            course: course.slug,
            courseTitle: course.cardTitle ?? course.title,
            code: ch.code,
            title: ch.title,
            href: `/calis/${course.slug}#bolum-${ch.code}`,
            lessons: [],
            level: t.level,
            axis,
            kaynak,
            depth: 0,
            courseIndex,
            skills: new Set(),
            eksenSay: new Map(),
          };
          parts.set(id, row);
        }
        for (const sk of t.skills ?? []) row.skills.add(sk);
        row.eksenSay.set(axis, (row.eksenSay.get(axis) ?? 0) + 1);
        row.lessons.push({
          key: lessonKey(course.slug, l.id),
          step: l.practice ? `${l.practice.yol}/${l.practice.kod}` : undefined,
          // Bitirme koşulu tablı drill'leri sayar (§3): tab var ve tür drill (varsayılan)
          tab: Boolean(l.tex || l.tabFile) && (l.kind ?? "drill") === "drill",
          href: l.practice ? `/teori/yol/${l.practice.yol}/${encodeURIComponent(l.practice.kod)}` : `/calis/${course.slug}/${encodeURIComponent(l.id)}`,
          ad: l.title,
        });
      }
      for (const { skills, eksenSay, ...row } of parts.values()) {
        const axis = [...eksenSay].sort((a, b) => b[1] - a[1])[0]?.[0] ?? row.axis;
        out.push({ ...row, axis, depth: depthOf(skills) });
      }
    }
  return out;
}

const KAYNAK_SIRA: Record<SeviyeSatiri["kaynak"], number> = { kurs: 0, yol: 1, ek: 2, stil: 3, etut: 4 };

const sortRows = (rows: Aday[]) =>
  rows.sort(
    (a, b) =>
      LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level) ||
      KAYNAK_SIRA[a.kaynak] - KAYNAK_SIRA[b.kaynak] ||
      a.depth - b.depth ||
      a.courseIndex - b.courseIndex ||
      compareCode(a.code, b.code) ||
      a.title.localeCompare(b.title, "tr"),
  );

const strip = (a: Aday): SeviyeSatiri => {
  const row: Partial<Aday> = { ...a };
  delete row.depth;
  delete row.courseIndex;
  return row as SeviyeSatiri;
};

/** Yol adımının seviyesi: adımın kendi seviyesi L1–L5 ise o (İP6b adımları), değilse bölümün `level` etiketi */
function adimSeviyesi(y: Yol, a: YolAdim): Level | undefined {
  if (isLevel(a.seviye)) return a.seviye;
  const b = y.bolumler.find((x) => x.no === a.bolum);
  if (b?.level && isLevel(b.level)) return b.level;
  return b && isLevel(b.seviye) ? b.seviye : undefined;
}

/** Teori yolunun ekseni (öneride eksen dengesi için) */
const YOL_EKSENI: Record<string, Axis> = { ritim: "rhythm", klavye: "fretboard", kulak: "theory_ear", okuma: "theory_ear" };

/** Teori yollarının seviyeli adımları: her yol bölümü × seviye bir satır. Kursa bağlı yollar (Armoni: adımları
 *  kursun pratik kartlarında) burada tekrar sayılmaz. Paket yoksa boş. */
async function yolSatirlari(): Promise<Aday[]> {
  const yollar = (await Promise.all(YOLLAR.map((t) => getYol(t.slug)))).filter((y): y is Yol => Boolean(y) && !y!.kurs);
  const out: Aday[] = [];
  yollar.forEach((y, yi) => {
    const ad = YOLLAR.find((t) => t.slug === y.slug)?.ad ?? y.ad;
    for (const b of y.bolumler) {
      const parca = new Map<Level, YolAdim[]>();
      for (const a of y.adimlar.filter((x) => x.bolum === b.no)) {
        const lv = adimSeviyesi(y, a);
        if (lv) parca.set(lv, [...(parca.get(lv) ?? []), a]);
      }
      for (const [level, adimlar] of parca)
        out.push({
          course: `yol:${y.slug}`,
          courseTitle: ad,
          code: b.kod ?? String(b.no),
          title: b.ad,
          href: `/teori/yol/${y.slug}`,
          axis: YOL_EKSENI[y.slug] ?? "theory_ear",
          level,
          kaynak: "yol",
          lessons: adimlar.map((a) => ({
            key: `${y.slug}/${a.kod}`,
            step: `${y.slug}/${a.kod}`,
            tab: false,
            href: `/teori/yol/${y.slug}/${encodeURIComponent(a.kod)}`,
            ad: `${a.kod} · ${a.ad}`,
          })),
          depth: 0,
          courseIndex: yi + (b.ek ? 100 : 0),
        });
    }
  });
  return out;
}

/** Dört kademenin Seviye Yolu verisi. Akustik kurslar (K7) dahil edilmez. */
export async function getSeviyeYolu(): Promise<Record<Kademe, SeviyeVerisi>> {
  const [courses, sozluk, yolRows] = await Promise.all([getCourses(), readSozluk(), yolSatirlari()]);
  const depthOf = depthFn(sozluk);
  const isCopy = guideCopyTest(courses);
  const elektro = courses.filter((c) => !isAcoustic(c));
  const kaynakOf = (slug: string): SeviyeSatiri["kaynak"] => (slug === EK_KURS ? "ek" : slug === STIL_KURSU ? "stil" : slug === ETUTLER ? "etut" : "kurs");

  const rows: Aday[] = [...yolRows];
  elektro.forEach((c, i) => {
    const r = rowsOf(c, i, depthOf, sozluk, isCopy, kaynakOf(c.slug));
    // Etiketsiz etüt paketi: bölüm numarası = seviye (§6.3, "5 bölüm = 5 seviye")
    if (c.slug === ETUTLER && !r.length)
      for (const sec of c.sections) {
        const level = LEVELS[sec.number - 1];
        if (!level) continue;
        for (const ch of sec.chapters)
          r.push({
            course: c.slug,
            courseTitle: c.cardTitle ?? c.title,
            code: ch.code,
            title: ch.title,
            href: `/calis/${c.slug}#bolum-${ch.code}`,
            axis: "technique",
            level,
            kaynak: "etut",
            lessons: ch.lessons.map((l) => ({ key: lessonKey(c.slug, l.id), tab: false, href: `/calis/${c.slug}/${encodeURIComponent(l.id)}`, ad: l.title })),
            depth: 0,
            courseIndex: i,
          });
      }
    rows.push(...r);
  });

  const result = {} as Record<Kademe, SeviyeVerisi>;
  for (const kademe of KADEMELER) result[kademe] = { kademe, rows: sortRows(rows.filter((r) => kademeOf(r.level) === kademe)).map(strip) };
  return result;
}
