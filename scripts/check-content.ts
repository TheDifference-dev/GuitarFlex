// Tüm egzersiz ve şarkı tablarını alphaTab ile ayrıştırır; sözdizimi hatalarını,
// ölçü sayısına uymayan ölçüleri ve track'ler arası ölçü sayısı farkını raporlar.
// Çalıştırma: npm run check-content
import * as alphaTab from "@coderline/alphatab";
import { ALL_EXERCISES } from "../src/content/techniques.ts";
import { SONGS } from "../src/content/songs.ts";

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
  ...ALL_EXERCISES.map((e) => ({ id: e.id, title: e.title, tex: e.tex })),
  ...SONGS.map((s) => ({ id: `sarki:${s.slug}`, title: s.title, tex: s.tex })),
];

for (const item of items) {
  const problems = check(item.tex);
  if (ids.has(item.id)) problems.push("tekrarlanan id");
  ids.add(item.id);
  if (problems.length) {
    failures++;
    console.log(`✗ ${item.id} — ${item.title}\n  ${problems.join("\n  ")}`);
  }
}

console.log(`${ALL_EXERCISES.length} egzersiz ve ${SONGS.length} şarkı kontrol edildi, ${failures} hatalı.`);
process.exit(failures ? 1 : 0);
