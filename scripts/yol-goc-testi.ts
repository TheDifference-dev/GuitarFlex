// Teori yolu ilerleme göçünün testi (K18 = sürüm 1, Nota Okuma = sürüm 2): node --experimental-strip-types scripts/yol-goc-testi.ts
//  1) yolKoduGoc: eski anahtarlar yeni koda taşınır, öbürlerine dokunulmaz, çakışmada kayıtlar birleşir
//  2) Göç tablosu içerik paketiyle tutarlı: her hedef kod pakette var ve Ek bölümde; hiçbir kaynak kod pakette yok
//  3) İçerik deposunda K18 öncesi sürüm (git, --eski <ref>, varsayılan cfbc0c2) okunabiliyorsa: eski koddaki adımın adı
//     yeni koddaki adımın adıyla aynı ve eski pakette tabloda olmayan her kod yeni pakette aynen duruyor
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { OKUMA_KOD_GOC, YOL_GOC_SURUM, YOL_KOD_GOC, yolKoduGoc } from "../src/lib/yol-goc.ts";

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
bekle(sonra["ritim/1.1"] === once["ritim/1.1"], "tablo dışı anahtar değişmiş");
bekle(JSON.stringify(sonra["okuma/13.8"]) === JSON.stringify(once["okuma/7.8"]) && !("okuma/7.8" in sonra), "okuma/7.8 → 13.8 taşınmadı (sürüm 2)");
// Sürüm kapısı: v2'ye geçmiş kayıtta hiçbir şey değişmez (okumanın yeni 1.1'i eski 1.1 sanılmaz)
bekle(JSON.stringify(yolKoduGoc(sonra, YOL_GOC_SURUM)) === JSON.stringify(sonra), "güncel sürümdeki kayıt değişiyor");
// v1'de kalmış kayıt: yalnız okuma tablosu uygulanır; kodları çakışan zincir (1.1 → 3.1, 3.1 → 11.1) tek adımda
const v1 = { "okuma/1.1": k(80, true), "okuma/3.1": k(60, false), "klavye/E1.1": k(90, true), "okuma/5.5": k(70, true) };
const v1s = yolKoduGoc(v1, 1);
bekle(v1s["okuma/3.1"]?.best === 80 && v1s["okuma/11.1"]?.best === 60 && v1s["okuma/8.1"]?.best === 70 && !("okuma/1.1" in v1s) && !("okuma/5.5" in v1s), "sürüm 2 zincir eşlemesi yanlış");
bekle(JSON.stringify(v1s["klavye/E1.1"]) === JSON.stringify(v1["klavye/E1.1"]), "v1 kaydında klavye yeniden taşınmış");
// Okuma tablosu birebir: 40 kaynak, 40 farklı hedef
bekle(Object.keys(OKUMA_KOD_GOC).length === 40 && new Set(Object.values(OKUMA_KOD_GOC)).size === 40, "okuma tablosu 40 → 40 değil");

// 2) Tablo ↔ içerik paketi
const oku = (slug: string): Yol => JSON.parse(readFileSync(path.join(ICERIK, "icerik", "yollar", `${slug}.json`), "utf8"));
const yollar = Object.fromEntries(["ritim", "klavye", "kulak", "armoni", "okuma"].map((s) => [s, oku(s)])) as Record<string, Yol>;
for (const yeni of Object.values(OKUMA_KOD_GOC)) {
  const a = yollar.okuma.adimlar.find((x) => `okuma/${x.kod}` === yeni);
  bekle(!!a, `${yeni}: pakette yok`);
}
// Sürüm 2: Okuma yolunun önceki sürümü (git, --eski-okuma <ref>, varsayılan 589e49d) ile ad karşılaştırması
const ESKI_OKUMA = process.argv.includes("--eski-okuma") ? process.argv[process.argv.indexOf("--eski-okuma") + 1] : "589e49d";
let okumaKarsilastirildi = false;
try {
  const eski: Yol = JSON.parse(execFileSync("git", ["-C", ICERIK, "show", `${ESKI_OKUMA}:icerik/yollar/okuma.json`], { encoding: "utf8", maxBuffer: 1 << 27, stdio: ["ignore", "pipe", "ignore"] }));
  okumaKarsilastirildi = true;
  bekle(eski.adimlar.length === Object.keys(OKUMA_KOD_GOC).length, `okuma: eski ${eski.adimlar.length} adımın hepsi tabloda değil`);
  for (const a of eski.adimlar) {
    const hedef = OKUMA_KOD_GOC[`okuma/${a.kod}`]?.split("/")[1];
    const b = yollar.okuma.adimlar.find((x) => x.kod === hedef);
    bekle(b?.ad === a.ad, `okuma/${a.kod} → ${hedef}: ad farklı (${a.ad} / ${b?.ad})`);
  }
} catch {
  // eski sürüm okunamadı
}
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
// Armoni E4–E7 (Nota Okuma/Armoni kitapları) yeni ek bölümlerdir: eski kodları yok
const k18Ek = ekAdim.filter((x) => !/^armoni\/E[4-7]\./.test(x));
bekle(k18Ek.length === 36, `K18 ek adım sayısı ${k18Ek.length}`);
bekle(k18Ek.every((x) => hedefler.has(x)), `tabloda olmayan ek adım: ${k18Ek.filter((x) => !hedefler.has(x)).join(", ")}`);

// 3) K18 öncesi paketle karşılaştırma (git)
let eskiOkundu = 0;
for (const [s, y] of Object.entries(yollar)) {
  // Okuma sürüm 2'de yeniden düzenlendi (yukarıda ayrıca karşılaştırılır); armoni sürüm 2'de yalnız ek bölüm aldı
  if (s === "okuma") continue;
  let eski: Yol;
  try {
    eski = JSON.parse(execFileSync("git", ["-C", ICERIK, "show", `${ESKI}:icerik/yollar/${s}.json`], { encoding: "utf8", maxBuffer: 1 << 27, stdio: ["ignore", "pipe", "ignore"] }));
  } catch {
    continue;
  }
  eskiOkundu++;
  bekle(s === "armoni" ? y.adimlar.length >= eski.adimlar.length : eski.adimlar.length === y.adimlar.length, `${s}: adım sayısı değişmiş (${eski.adimlar.length} → ${y.adimlar.length})`);
  for (const a of eski.adimlar) {
    const anahtar = `${s}/${a.kod}`;
    const hedef = (YOL_KOD_GOC[anahtar] ?? anahtar).split("/")[1];
    const b = y.adimlar.find((x) => x.kod === hedef);
    bekle(b?.ad === a.ad, `${anahtar} → ${s}/${hedef}: ad farklı (${a.ad} / ${b?.ad})`);
  }
}

console.log(`Yol göçü testi: sürüm ${YOL_GOC_SURUM} · v1 ${Object.keys(YOL_KOD_GOC).length} + v2 ${Object.keys(OKUMA_KOD_GOC).length} eşleme · okuma önceki sürümle ${okumaKarsilastirildi ? "karşılaştırıldı" : "karşılaştırılamadı"}, ${ekAdim.length} ek adım, K18 öncesi paket (${ESKI}) ${eskiOkundu ? `${eskiOkundu} yol karşılaştırıldı` : "okunamadı, atlandı"}`);
if (hatalar.length) {
  for (const h of hatalar) console.log("  ✗ " + h);
  process.exit(1);
}
console.log("0 hata");
