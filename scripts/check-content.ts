// Tüm egzersiz tablarını alphaTab ile ayrıştırır; sözdizimi hatalarını ve 4/4'e uymayan ölçüleri raporlar.
// Çalıştırma: npm run check-content
import * as alphaTab from "@coderline/alphatab";
import { ALL_EXERCISES } from "../src/content/techniques.ts";

let failures = 0;
const ids = new Set<string>();

for (const ex of ALL_EXERCISES) {
  const problems: string[] = [];
  if (ids.has(ex.id)) problems.push("tekrarlanan id");
  ids.add(ex.id);

  try {
    const importer = new alphaTab.importer.AlphaTexImporter();
    importer.initFromString(ex.tex, new alphaTab.Settings());
    const score = importer.readScore();
    const bars = score.tracks[0].staves[0].bars;
    bars.forEach((bar, i) => {
      const length = bar.voices[0].beats.reduce((sum, beat) => {
        const base = 1 / beat.duration;
        const tuplet = beat.hasTuplet ? beat.tupletDenominator / beat.tupletNumerator : 1;
        return sum + base * tuplet;
      }, 0);
      if (Math.abs(length - 1) > 1e-6) problems.push(`ölçü ${i + 1} uzunluğu ${length.toFixed(4)} (1 olmalı)`);
    });
  } catch (e) {
    problems.push(`ayrıştırma hatası: ${(e as Error).message}`);
  }

  if (problems.length) {
    failures++;
    console.log(`✗ ${ex.id} — ${ex.title}\n  ${problems.join("\n  ")}`);
  }
}

console.log(`${ALL_EXERCISES.length} egzersiz kontrol edildi, ${failures} hatalı.`);
process.exit(failures ? 1 : 0);
