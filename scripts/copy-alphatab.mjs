// alphaTab'in tarayıcıda ihtiyaç duyduğu dosyaları (script, font, soundfont) public/ altına kopyalar.
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const modules = join(process.cwd(), "node_modules");
const dist = join(modules, "@coderline", "alphatab", "dist");
const out = join(process.cwd(), "public", "alphatab");

mkdirSync(join(out, "soundfont"), { recursive: true });
cpSync(join(dist, "alphaTab.min.js"), join(out, "alphaTab.min.js"));
// Uygulamanın yüklediği dosya: alphaTab + çizim düzeltmesi (scripts/alphatab-ek.js)
writeFileSync(
  join(out, "alphaTab.gf.js"),
  readFileSync(join(dist, "alphaTab.min.js"), "utf8") + "\n;\n" + readFileSync(join(process.cwd(), "scripts", "alphatab-ek.js"), "utf8"),
);
cpSync(join(dist, "..", "LICENSE"), join(out, "LICENSE-alphaTab.txt"));
cpSync(join(dist, "font"), join(out, "font"), { recursive: true });
// Hafif yedek ses bankası (alphaTab ile gelir, 1,3 MB)
cpSync(join(dist, "soundfont", "sonivox.sf2"), join(out, "soundfont", "sonivox.sf2"));
cpSync(join(dist, "soundfont", "LICENSE"), join(out, "soundfont", "sonivox-LICENSE.txt"));

// Varsayılan ses bankası: GeneralUser GS 1.471 (S. Christian Collins; npm paketi `generaluser`, ~30 MB).
// Lisans: GeneralUser GS License v2.0 — kişisel ve ticari kullanım serbest, dağıtılabilir (LICENSE.txt).
// Paket yoksa oynatıcı sonivox'a döner.
const gu = join(modules, "generaluser");
if (existsSync(join(gu, "GeneralUser.sf2"))) {
  cpSync(join(gu, "GeneralUser.sf2"), join(out, "soundfont", "GeneralUser.sf2"));
  cpSync(join(gu, "LICENSE.txt"), join(out, "soundfont", "GeneralUser-LICENSE.txt"));
} else {
  console.warn("generaluser paketi bulunamadı; yalnız sonivox ses bankası kopyalandı (npm install ile kurulur)");
}
console.log("alphaTab dosyaları public/alphatab altına kopyalandı");
