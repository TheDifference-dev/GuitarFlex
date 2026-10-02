// alphaTab'in tarayıcıda ihtiyaç duyduğu dosyaları (script, font, soundfont) public/ altına kopyalar.
import { cpSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const dist = join(process.cwd(), "node_modules", "@coderline", "alphatab", "dist");
const out = join(process.cwd(), "public", "alphatab");

mkdirSync(join(out, "soundfont"), { recursive: true });
cpSync(join(dist, "alphaTab.min.js"), join(out, "alphaTab.min.js"));
cpSync(join(dist, "font"), join(out, "font"), { recursive: true });
cpSync(join(dist, "soundfont", "sonivox.sf2"), join(out, "soundfont", "sonivox.sf2"));
console.log("alphaTab dosyaları public/alphatab altına kopyalandı");
