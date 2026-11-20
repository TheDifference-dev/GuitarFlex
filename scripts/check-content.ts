// Tüm egzersiz ve şarkı tablarını alphaTab ile ayrıştırır; sözdizimi hatalarını,
// ölçü sayısına uymayan ölçüleri ve track'ler arası ölçü sayısı farkını raporlar.
// Çalıştırma: npm run check-content
import * as alphaTab from "@coderline/alphatab";
import { SONGS } from "../src/content/songs.ts";
import { BUILTIN_COURSES, flatLessons } from "../src/content/courses.ts";
import { BACKINGS } from "../src/content/dogaclama.ts";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { PRIVATE_ROOTS } from "../src/lib/private-roots.ts";
import type { Chapter, Course, Lesson } from "../src/content/types.ts";

function check(tex: string): string[] {
  const problems: string[] = [];
  try {
    const importer = new alphaTab.importer.AlphaTexImporter();
    importer.initFromString(tex, new alphaTab.Settings());
    const score = importer.readScore();
    const barCounts = new Set(score.tracks.map((t) => t.staves[0].bars.length));
    if (barCounts.size > 1) problems.push(`track'lerin ölçü sayıları farklı: ${[...barCounts].join(", ")}`);
    for (const track of score.tracks) {
      track.staves[0].bars.forEach((bar, i) => {
        const mb = bar.masterBar;
        const expected = mb.timeSignatureNumerator / mb.timeSignatureDenominator;
        const length = bar.voices[0].beats.reduce((sum, beat) => {
          const base = 1 / beat.duration;
          const dots = beat.dots === 2 ? 1.75 : beat.dots === 1 ? 1.5 : 1;
          const tuplet = beat.hasTuplet ? beat.tupletDenominator / beat.tupletNumerator : 1;
          return sum + base * dots * tuplet;
        }, 0);
        // Hammer-on / pull-off / slide: bir sonraki nota aynı telde ve farklı perdede olmalı
        bar.voices[0].beats.forEach((beat) => {
          for (const note of beat.notes) {
            // 1 = shift slide, 2 = legato slide; dışarı kaymalar (3-6) devam gerektirmez
            const linked = note.isHammerPullOrigin || note.slideOutType === 1 || note.slideOutType === 2;
            if (!linked) continue;
            const next = beat.nextBeat?.notes.find((n) => n.string === note.string);
            if (!next) problems.push(`${track.name} ölçü ${i + 1}: ${note.fret}. perdedeki bağ/slide aynı telde devam etmiyor`);
            else if (next.fret === note.fret) problems.push(`${track.name} ölçü ${i + 1}: ${note.fret}. perdeden aynı perdeye bağ`);
          }
        });
        if (Math.abs(length - expected) > 1e-6) {
          problems.push(`${track.name} ölçü ${i + 1}: uzunluk ${length.toFixed(4)}, olması gereken ${expected.toFixed(4)}`);
        }
      });
    }
  } catch (e) {
    problems.push(`ayrıştırma hatası: ${(e as Error).message}`);
  }
  return problems;
}

let failures = 0;
const ids = new Set<string>();
const items = [
  ...SONGS.map((s) => ({ id: `sarki:${s.slug}`, title: s.title, tex: s.tex })),
  ...BACKINGS.map((b) => ({ id: `eslik:${b.slug}`, title: b.title, tex: b.tex })),
];
// Kurslardaki dersler (rehberler aynı dersleri kullandığı için aynı tab bir kez denetlenir)
const seenTex = new Set(items.map((i) => i.tex));
let courseLessons = 0;
for (const c of BUILTIN_COURSES) {
  for (const l of flatLessons(c)) {
    if (!l.tex || seenTex.has(l.tex)) continue;
    seenTex.add(l.tex);
    courseLessons++;
    items.push({ id: `${c.slug}/${l.id}`, title: l.title, tex: l.tex });
  }
}

// Kişisel içerik paketindeki kurslar (varsa)
let packLessons = 0;
const packCourses: Course[] = [];
for (const root of PRIVATE_ROOTS) {
  let files: string[] = [];
  try {
    files = readdirSync(path.join(root, "icerik")).filter((f) => f.endsWith(".json") && f !== "site.json" && f !== "sarkilar.json");
  } catch {
    continue;
  }
  for (const f of files) {
    const c = JSON.parse(readFileSync(path.join(root, "icerik", f), "utf8")) as Course;
    packCourses.push(c);
    for (const s of c.sections ?? []) for (const ch of s.chapters ?? []) for (const l of ch.lessons ?? []) {
      if (!l.tex) continue;
      packLessons++;
      items.push({ id: `paket:${c.slug}/${l.id ?? l.title}`, title: l.title, tex: l.tex });
    }
  }
}

for (const item of items) {
  const problems = check(item.tex);
  if (ids.has(item.id)) problems.push("tekrarlanan id");
  ids.add(item.id);
  if (problems.length) {
    failures++;
    console.log(`✗ ${item.id} — ${item.title}\n  ${problems.join("\n  ")}`);
  }
}

// ── Müfredat alanları (Spec v2.2 §4): level, axes, skills, kind, variant, ref, form, tempoRounds,
// readBars, improvBars, hideTab, stave, chords. Etiketsiz içerikte hiçbir şey yazdırmaz.
const LEVELS = new Set(["L1", "L2", "L3", "L4", "L5"]);
const AXES = new Set(["technique", "fretboard", "rhythm", "theory_ear"]);
const KINDS = new Set(["drill", "etut", "okuma", "quickstudy", "transkripsiyon", "kompozisyon", "resital"]);
const VARIANTS = new Set(["reverse", "inversion", "permutation"]);
const FORM_PARTS = new Set(["intro", "A", "B", "bridge", "A2"]);
const STAVES = new Set(["score", "tab", "both"]);
const LESSON_FIELDS = ["kind", "variantOf", "variant", "ref", "form", "tempoRounds", "readBars", "improvBars", "hideTab", "stave", "chords"] as const;

// Beceri sözlüğü: kişisel içerik köklerinde belgeler/mufredat/beceri-sozlugu.json (ilk bulunan)
let skillKeys: Set<string> | null = null;
for (const root of PRIVATE_ROOTS) {
  const file = path.join(root, "belgeler", "mufredat", "beceri-sozlugu.json");
  if (!existsSync(file)) continue;
  try {
    skillKeys = new Set(Object.keys(JSON.parse(readFileSync(file, "utf8")) as Record<string, unknown>));
  } catch (e) {
    console.log(`⚠ ${file} okunamadı (${(e as Error).message}); beceri kontrolü atlandı.`);
  }
  break;
}

// Uygulamanın gördüğü kurs kümesi (src/lib/courses.ts ile aynı): paket aynı slug'lı yerleşik kursun
// yerine geçer, aynı slug iki kökte varsa ilk kökteki geçerlidir. Ders id'leri normalize() gibi tamamlanır.
const effective = new Map<string, Course>(BUILTIN_COURSES.map((c) => [c.slug, c]));
const packSeen = new Set<string>();
for (const c of packCourses) {
  if (!c?.slug || !c.title || !Array.isArray(c.sections) || packSeen.has(c.slug)) continue;
  packSeen.add(c.slug);
  effective.set(c.slug, c);
}
type Row = { slug: string; ch: Chapter; code: string; lesson: Lesson; id: string };
const rows: Row[] = [];
for (const c of effective.values())
  c.sections.forEach((s, si) =>
    (s.chapters ?? []).forEach((ch, ci) => {
      const code = ch.code ?? `${s.number ?? si + 1}.${ci}`;
      (ch.lessons ?? []).forEach((l, li) =>
        rows.push({ slug: c.slug, ch, code, lesson: l, id: l.id ?? `${ch.code ?? `${si + 1}.${ci}`}-${li + 1}` }),
      );
    }),
  );
const lessonIndex = new Map<string, Lesson>();
for (const r of rows) if (!lessonIndex.has(`${r.slug}#${r.id}`)) lessonIndex.set(`${r.slug}#${r.id}`, r.lesson);

const isInt = (n: unknown): n is number => typeof n === "number" && Number.isInteger(n);
const isRange = (v: unknown) => Array.isArray(v) && v.length === 2 && v.every((n) => isInt(n) && n >= 1);

function tagProblems(t: { level?: unknown; axes?: unknown; skills?: unknown }): string[] {
  const p: string[] = [];
  if (t.level !== undefined && !LEVELS.has(t.level as string)) p.push(`level geçersiz: ${JSON.stringify(t.level)} (L1–L5 olmalı)`);
  if (t.axes !== undefined) {
    if (!Array.isArray(t.axes) || !t.axes.length) p.push("axes boş olmayan bir dizi olmalı");
    else for (const a of t.axes) if (!AXES.has(a)) p.push(`geçersiz eksen: ${JSON.stringify(a)}`);
  }
  if (t.skills !== undefined) {
    if (!Array.isArray(t.skills)) p.push("skills bir dizi olmalı");
    else
      for (const k of t.skills) {
        if (typeof k !== "string") p.push(`skills elemanı metin olmalı: ${JSON.stringify(k)}`);
        else if (skillKeys && !skillKeys.has(k)) p.push(`beceri sözlükte yok: ${k}`);
      }
  }
  return p;
}

function lessonProblems(r: Row): { problems: string[]; warnings: string[] } {
  const l = r.lesson as Lesson & Record<string, unknown>;
  const p = tagProblems(l);
  const w: string[] = [];
  if (l.kind !== undefined && !KINDS.has(l.kind)) p.push(`kind geçersiz: ${JSON.stringify(l.kind)}`);
  if (l.variant !== undefined) {
    if (!VARIANTS.has(l.variant)) p.push(`variant geçersiz: ${JSON.stringify(l.variant)}`);
    if (!l.variantOf) p.push("variant verilmiş ama variantOf yok");
  }
  if (l.variantOf !== undefined && (typeof l.variantOf !== "string" || !l.variantOf)) p.push("variantOf boş olmayan bir metin olmalı");
  if (l.ref !== undefined) {
    if (typeof l.ref !== "string" || !/^[^#\s]+#[^#\s]+$/.test(l.ref)) p.push(`ref biçimi "<kurs-slug>#<ders-id>" olmalı: ${JSON.stringify(l.ref)}`);
    else if (l.ref === `${r.slug}#${r.id}`) p.push("ref dersin kendisini gösteriyor");
    else {
      const target = lessonIndex.get(l.ref);
      if (!target) p.push(`ref hedefi bulunamadı: ${l.ref}`);
      else if (target.ref) w.push(`ref hedefi de ref taşıyor (${l.ref} → ${target.ref}); yalnız tek seviye çözülür`);
    }
  }
  if (l.form !== undefined) {
    if (!Array.isArray(l.form) || !l.form.length) p.push("form boş olmayan bir dizi olmalı");
    else
      l.form.forEach((f, i) => {
        if (!f || !FORM_PARTS.has(f.part)) p.push(`form[${i}] parçası geçersiz: ${JSON.stringify(f?.part)}`);
        if (!isInt(f?.bars) || f.bars <= 0) p.push(`form[${i}] bars pozitif tam sayı olmalı: ${JSON.stringify(f?.bars)}`);
      });
  }
  if (l.tempoRounds !== undefined) {
    const t = l.tempoRounds as unknown;
    if (!Array.isArray(t) || t.length !== 3 || !t.every((n) => typeof n === "number" && n > 0)) p.push(`tempoRounds 3 pozitif sayı olmalı: ${JSON.stringify(t)}`);
    else if (!(t[0] < t[1] && t[1] < t[2])) p.push(`tempoRounds artan olmalı: ${JSON.stringify(t)}`);
  }
  for (const k of ["readBars", "improvBars"] as const) {
    const v = l[k] as unknown;
    if (v === undefined) continue;
    if (!isRange(v)) p.push(`${k} [başlangıç, bitiş] biçiminde iki pozitif tam sayı olmalı: ${JSON.stringify(v)}`);
    else if ((v as number[])[0] > (v as number[])[1]) p.push(`${k} başlangıcı bitişten büyük: ${JSON.stringify(v)}`);
  }
  if (l.hideTab !== undefined && typeof l.hideTab !== "boolean") p.push(`hideTab true/false olmalı: ${JSON.stringify(l.hideTab)}`);
  // chords (İP6d): ölçü başına akor; quickstudy ve kompozisyon eşlik ve geri bildirimi bundan kurar
  if (l.chords !== undefined) {
    const ch = l.chords as unknown;
    if (!Array.isArray(ch) || !ch.length || !ch.every((x) => typeof x === "string" && x.trim())) p.push(`chords boş olmayan metinlerden oluşan bir dizi olmalı: ${JSON.stringify(ch)}`);
    else {
      if (l.kind !== "quickstudy" && l.kind !== "kompozisyon") w.push(`chords yalnız quickstudy ve kompozisyon derslerinde kullanılır (kind ${JSON.stringify(l.kind)})`);
      const bars = l.tex ? l.tex.replace(/^\\tempo \d+ \. /, "").split("|").length : 0;
      if (bars && ch.length !== bars) p.push(`chords ${ch.length} akor, tab ${bars} ölçü`);
    }
  }
  if ((l.kind === "quickstudy" || l.kind === "kompozisyon") && !l.chords) p.push(`${l.kind} dersinde chords (ölçü başına akor) yok`);
  // stave (İP6): oynatıcı görünümü. Tabsız derste anlamsız; hideTab (yalnız ses) ile birlikte görünüm verilmez
  if (l.stave !== undefined) {
    if (!STAVES.has(l.stave as string)) p.push(`stave geçersiz: ${JSON.stringify(l.stave)} ("score", "tab" ya da "both" olmalı)`);
    else {
      if (!l.tex && !l.tabFile && !l.ref) w.push("stave verilmiş ama dersin tabı yok");
      if (l.hideTab) w.push(`hideTab ile stave "${l.stave}" birlikte verilmemeli (transkripsiyon dersi yalnız ses olarak çalınır)`);
    }
  }
  return { problems: p, warnings: w };
}

let taggedChapters = 0;
let taggedLessons = 0;
const curriculumStart = failures;
const seenChapters = new Set<Chapter>();
for (const r of rows) {
  if (!seenChapters.has(r.ch)) {
    seenChapters.add(r.ch);
    const ch = r.ch as Chapter & Record<string, unknown>;
    if (ch.level !== undefined || ch.axes !== undefined || ch.skills !== undefined) {
      taggedChapters++;
      const p = tagProblems(ch);
      if (p.length) {
        failures++;
        console.log(`✗ müfredat:${r.slug}/${r.code} — ${ch.title}\n  ${p.join("\n  ")}`);
      }
    }
  }
  const l = r.lesson as Lesson & Record<string, unknown>;
  if (![...LESSON_FIELDS, "level", "axes", "skills"].some((k) => l[k] !== undefined)) continue;
  taggedLessons++;
  const { problems, warnings } = lessonProblems(r);
  for (const w of warnings) console.log(`⚠ müfredat:${r.slug}/${r.id} — ${w}`);
  if (problems.length) {
    failures++;
    console.log(`✗ müfredat:${r.slug}/${r.id} — ${l.title}\n  ${problems.join("\n  ")}`);
  }
}
if (taggedChapters || taggedLessons) {
  if (!skillKeys) console.log("⚠ beceri-sozlugu.json bulunamadı (belgeler/mufredat/); beceri (skills) kontrolü atlandı.");
  console.log(`Müfredat alanları: ${taggedChapters} alt bölüm ve ${taggedLessons} derste kontrol edildi, ${failures - curriculumStart} hatalı.`);
}

console.log(`${courseLessons} ders, ${packLessons} paket dersi, ${SONGS.length} şarkı ve ${BACKINGS.length} eşlik kaydı kontrol edildi, ${failures} hatalı.`);
process.exit(failures ? 1 : 0);
