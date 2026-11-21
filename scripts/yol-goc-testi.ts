// Teori yolu ilerleme göçünün testi (K18): node --experimental-strip-types scripts/yol-goc-testi.ts
//  1) yolKoduGoc: eski anahtarlar yeni koda taşınır, öbürlerine dokunulmaz, çakışmada kayıtlar birleşir
//  2) Göç tablosu içerik paketiyle tutarlı: her hedef kod pakette var ve Ek bölümde; hiçbir kaynak kod pakette yok
//  3) İçerik deposunda K18 öncesi sürüm (git, --eski <ref>, varsayılan cfbc0c2) okunabiliyorsa: eski koddaki adımın adı
//     yeni koddaki adımın adıyla aynı ve eski pakette tabloda olmayan her kod yeni pakette aynen duruyor
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { YOL_KOD_GOC, yolKoduGoc } from "../src/lib/yol-goc.ts";

type Adim = { kod: string; ad: string; bolum: number };
type Yol = { adimlar: Adim[]; bolumler: { no: number; ek?: boolean }[] };
const ICERIK = path.join(process.cwd(), "..", "GuitarFlex-icerik");
const ESKI = process.argv.includes("--eski") ? process.argv[process.argv.indexOf("--eski") + 1] : "cfbc0c2";
const hatalar: string[] = [];
const bekle = (kosul: boolean, m: string) => {
  if (!kosul) hatalar.push(m);
};

// 1) Saf işlev
const k = (best: number, passed: boolean, attempts = 1, at = "2026-11-01T00:00:00.000Z") => ({ best, passed, attempts, at });
const once = {
  "klavye/12.1": k(90, true),
  "klavye/10.1": k(70, false), // ana adım (3NPS), değişmez
  "kulak/11.6": k(88, true, 2),
  "kulak/E2.6": k(60, false, 1, "2026-11-20T00:00:00.000Z"), // çakışma: birleşir
  "armoni/8.4": k(100, true),
  "ritim/1.1": k(80, true),
  "okuma/7.8": k(50, false),
};
const sonra = yolKoduGoc(once);
bekle(JSON.stringify(sonra["klavye/E1.1"]) === JSON.stringify(once["klavye/12.1"]), "klavye/12.1 → E1.1 taşınmadı");
bekle(!("klavye/12.1" in sonra), "eski anahtar kalmış: klavye/12.1");
bekle(JSON.stringify(sonra["klavye/10.1"]) === JSON.stringify(once["klavye/10.1"]), "ana adım klavye/10.1 değişmiş");
bekle(sonra["kulak/E2.6"]?.passed === true && sonra["kulak/E2.6"].best === 88 && sonra["kulak/E2.6"].attempts === 3 && sonra["kulak/E2.6"].at === "2026-11-20T00:00:00.000Z", "çakışan kayıtlar birleşmedi");
bekle(sonra["armoni/E3.4"]?.passed === true, "armoni/8.4 → E3.4 taşınmadı");
bekle(sonra["ritim/1.1"] === once["ritim/1.1"] && sonra["okuma/7.8"] === once["okuma/7.8"], "tablo dışı anahtar değişmiş");
bekle(JSON.stringify(yolKoduGoc(sonra)) === JSON.stringify(sonra), "göç iki kez çalışınca sonuç değişiyor");

// 2) Tablo ↔ içerik paketi
const oku = (slug: string): Yol => JSON.parse(readFileSync(path.join(ICERIK, "icerik", "yollar", `${slug}.json`), "utf8"));
const yollar = Object.fromEntries(["ritim", "klavye", "kulak", "armoni", "okuma"].map((s) => [s, oku(s)])) as Record<string, Yol>;
for (const [eski, yeni] of Object.entries(YOL_KOD_GOC)) {
  const [ys, ek] = eski.split("/");
  const [yy, yk] = yeni.split("/");
  bekle(ys === yy, `${eski}: yol değişmiş (${yeni})`);
  const y = yollar[ys];
  const a = y.adimlar.find((x) => x.kod === yk);
  bekle(!!a, `${yeni}: pakette yok`);
  if (a) bekle(!!y.bolumler.find((b) => b.no === a.bolum)?.ek, `${yeni}: Ek bölümde değil`);
  bekle(!y.adimlar.some((x) => x.kod === ek), `${eski}: eski kod pakette hâlâ var`);
}
const ekAdim = Object.entries(yollar).flatMap(([s, y]) => y.adimlar.filter((a) => y.bolumler.find((b) => b.no === a.bolum)?.ek).map((a) => `${s}/${a.kod}`));
const hedefler = new Set(Object.values(YOL_KOD_GOC));
bekle(ekAdim.every((x) => hedefler.has(x)), `tabloda olmayan ek adım: ${ekAdim.filter((x) => !hedefler.has(x)).join(", ")}`);

// 3) K18 öncesi paketle karşılaştırma (git)
let eskiOkundu = 0;
for (const [s, y] of Object.entries(yollar)) {
  let eski: Yol;
  try {
    eski = JSON.parse(execFileSync("git", ["-C", ICERIK, "show", `${ESKI}:icerik/yollar/${s}.json`], { encoding: "utf8", maxBuffer: 1 << 27, stdio: ["ignore", "pipe", "ignore"] }));
  } catch {
    continue;
  }
  eskiOkundu++;
  bekle(eski.adimlar.length === y.adimlar.length, `${s}: adım sayısı değişmiş (${eski.adimlar.length} → ${y.adimlar.length})`);
  for (const a of eski.adimlar) {
    const anahtar = `${s}/${a.kod}`;
    const hedef = (YOL_KOD_GOC[anahtar] ?? anahtar).split("/")[1];
    const b = y.adimlar.find((x) => x.kod === hedef);
    bekle(b?.ad === a.ad, `${anahtar} → ${s}/${hedef}: ad farklı (${a.ad} / ${b?.ad})`);
  }
}

console.log(`Yol göçü testi: ${Object.keys(YOL_KOD_GOC).length} eşleme, ${ekAdim.length} ek adım, K18 öncesi paket (${ESKI}) ${eskiOkundu ? `${eskiOkundu} yol karşılaştırıldı` : "okunamadı, atlandı"}`);
if (hatalar.length) {
  for (const h of hatalar) console.log("  ✗ " + h);
  process.exit(1);
}
console.log("0 hata");
