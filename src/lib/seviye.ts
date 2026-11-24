// Sadece sunucu tarafında kullanılır (node:fs).
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Axis, Course, Lesson, Level } from "@/content/types";
import { lessonKey } from "@/content/courses";
import {
  AXES,
  EK_KURS,
  ETUTLER,
  KOSUL_YOLLARI,
  LEVELS,
  STIL_KURSU,
  guideCopyTest,
  lessonTags,
  type SeviyeGrubu,
  type SeviyeSatiri,
  type SeviyeVerisi,
  type SeviyeYolu,
  isLevel,
} from "@/content/seviyeler";
import { getCourses } from "./courses";
import { getYol, YOLLAR } from "./yollar";
import type { Yol, YolAdim } from "./alistirma/tipler";
import { PRIVATE_ROOTS } from "./private-roots";

// Seviye Yolu verisi (Müfredat Spec v2.2 §10). Sıra:
//  1. alt bölümün becerilerinin sözlükteki en derin önkoşul derinliği (küçük olan önce),
//  2. kurs sırası (site.json/courseOrder, getCourses() sırası),
//  3. alt bölüm kodu.
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

type Aday = SeviyeSatiri & { level: Level; axis: Axis; depth: number; courseIndex: number };

/** Kursun etiketli alt bölümlerini seviye ve ana eksene göre satırlara böler.
 *  Bir alt bölümde farklı seviyede (ya da ana eksende) dersler varsa her parça kendi satırında sayılır. */
function rowsOf(
  course: Course,
  courseIndex: number,
  depthOf: (s: Iterable<string>) => number,
  sozluk: Sozluk,
  isCopy: (c: Course, l: Lesson) => boolean,
): Aday[] {
  const out: Aday[] = [];
  for (const s of course.sections)
    for (const ch of s.chapters) {
      const parts = new Map<string, Aday & { skills: Set<string> }>();
      for (const l of ch.lessons) {
        const t = lessonTags(ch, l);
        if (!t.level || isCopy(course, l)) continue;
        // Ana eksen: axes[0]; eksen yazılmamışsa ilk becerinin sözlükteki ekseni, o da yoksa teknik.
        const axis: Axis = t.axes?.[0] ?? (t.skills?.[0] ? sozluk[t.skills[0]]?.axis : undefined) ?? "technique";
        const id = `${t.level}|${axis}`;
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
            depth: 0,
            courseIndex,
            skills: new Set(),
          };
          parts.set(id, row);
        }
        for (const sk of t.skills ?? []) row.skills.add(sk);
        row.lessons.push({
          key: lessonKey(course.slug, l.id),
          step: l.practice ? `${l.practice.yol}/${l.practice.kod}` : undefined,
          // Bitirme koşulu tablı drill'leri sayar (§3): tab var ve tür drill (varsayılan)
          tab: Boolean(l.tex || l.tabFile) && (l.kind ?? "drill") === "drill",
        });
      }
      for (const { skills, ...row } of parts.values()) out.push({ ...row, depth: depthOf(skills) });
    }
  return out;
}

const sortRows = (rows: Aday[]) =>
  rows.sort((a, b) => a.depth - b.depth || a.courseIndex - b.courseIndex || compareCode(a.code, b.code) || a.title.localeCompare(b.title, "tr"));

const strip = ({ course, courseTitle, code, title, href, lessons }: Aday): SeviyeSatiri => ({ course, courseTitle, code, title, href, lessons });

function group(rows: Aday[]): SeviyeGrubu[] {
  return AXES.map((axis) => ({ axis, rows: sortRows(rows.filter((r) => r.axis === axis)).map(strip) }));
}

/** Yol adımının seviyesi: adımın kendi seviyesi L1–L5 ise o (İP6b adımları), değilse bölümün `level` etiketi */
function adimSeviyesi(y: Yol, a: YolAdim): Level | undefined {
  if (isLevel(a.seviye)) return a.seviye;
  const b = y.bolumler.find((x) => x.no === a.bolum);
  if (b?.level && isLevel(b.level)) return b.level;
  return b && isLevel(b.seviye) ? b.seviye : undefined;
}

/** Bitirme koşulundaki yolların (Okuma, Kulak, Ritim) adımlarını seviyelere dağıtır; paket yoksa boş */
async function yolAdimlari(): Promise<Record<Level, SeviyeYolu[]>> {
  const yollar = (await Promise.all(KOSUL_YOLLARI.map((slug) => getYol(slug)))).filter((y): y is Yol => Boolean(y));
  const out = Object.fromEntries(LEVELS.map((lv) => [lv, [] as SeviyeYolu[]])) as Record<Level, SeviyeYolu[]>;
  for (const level of LEVELS)
    for (const y of yollar) {
      const adimlar = y.adimlar
        .filter((a) => adimSeviyesi(y, a) === level)
        .map((a) => ({ kod: a.kod, ad: a.ad, bolum: y.bolumler.find((b) => b.no === a.bolum)?.ad ?? "", step: `${y.slug}/${a.kod}` }));
      if (adimlar.length) out[level].push({ slug: y.slug, ad: YOLLAR.find((t) => t.slug === y.slug)?.ad ?? y.ad, adimlar });
    }
  return out;
}

/** Beş seviyenin Seviye Yolu verisi. */
export async function getSeviyeYolu(): Promise<Record<Level, SeviyeVerisi>> {
  const [courses, sozluk, yollar] = await Promise.all([getCourses(), readSozluk(), yolAdimlari()]);
  const depthOf = depthFn(sozluk);
  const isCopy = guideCopyTest(courses);
  const elektro = courses;

  const all = new Map<string, Aday[]>();
  elektro.forEach((c, i) => all.set(c.slug, rowsOf(c, i, depthOf, sozluk, isCopy)));
  const special = new Set([EK_KURS, STIL_KURSU, ETUTLER]);
  const main = elektro.filter((c) => !special.has(c.slug)).flatMap((c) => all.get(c.slug)!);
  const etutCourse = elektro.find((c) => c.slug === ETUTLER);

  const result = {} as Record<Level, SeviyeVerisi>;
  LEVELS.forEach((level, li) => {
    const at = (rows: Aday[]) => rows.filter((r) => r.level === level);
    const ek = all.get(EK_KURS);
    const stil = all.get(STIL_KURSU);
    let etut: SeviyeSatiri[] | null = null;
    if (etutCourse) {
      const tagged = at(all.get(ETUTLER)!);
      // Etiketsiz etüt paketi: bölüm numarası = seviye (§6.3, "5 bölüm = 5 seviye")
      const fallback = tagged.length
        ? tagged
        : etutCourse.sections
            .filter((s) => s.number === li + 1)
            .flatMap((s) =>
              s.chapters.map<Aday>((ch) => ({
                course: etutCourse.slug,
                courseTitle: etutCourse.cardTitle ?? etutCourse.title,
                code: ch.code,
                title: ch.title,
                href: `/calis/${etutCourse.slug}#bolum-${ch.code}`,
                lessons: ch.lessons.map((l) => ({ key: lessonKey(etutCourse.slug, l.id), tab: false })),
                level,
                axis: "technique",
                depth: 0,
                courseIndex: 0,
              })),
            );
      etut = sortRows(fallback).map(strip);
    }
    result[level] = {
      level,
      yollar: yollar[level],
      groups: group(at(main)),
      ekler: ek ? group(at(ek)) : null,
      stiller: stil ? group(at(stil)) : null,
      etut,
    };
  });
  return result;
}
