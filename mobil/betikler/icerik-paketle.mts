// GuitarFlex iOS — içerik paketleyici.
// Gizli içerik deposunu (../../GuitarFlex-icerik, masaüstüyle aynı yer) masaüstünün kendi okuyucularıyla okur ve
// mobil/icerik-paket/ altına uygulamanın gömeceği JSON'ları yazar. icerik-paket/ Git'e GÖNDERİLMEZ (.gitignore):
// GuitarBear kaynaklı içerik herkese açık depoya girmemeli.
//
// Çalıştırma: npm run icerik  (mobil/ içinde)
import { cpSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MOBIL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const KOK = path.resolve(MOBIL, "..");
const CIKTI = path.join(MOBIL, "icerik-paket");

// Masaüstü okuyucuları içerik kökünü process.cwd()'ye göre arar (bkz. src/lib/private-roots.ts)
process.chdir(KOK);

const { getCourses } = await import("../../src/lib/courses.ts");
const { getYol, YOLLAR } = await import("../../src/lib/yollar.ts");
const { getPopularSongs } = await import("../../src/lib/songs.ts");
const simge = await import("../../src/lib/simge.ts");
// Masaüstü bileşeniyle aynı React kopyası (kökteki node_modules) kullanılmalı
const kokRequire = createRequire(path.join(KOK, "package.json"));
const React = kokRequire("react");
const { renderToStaticMarkup } = kokRequire("react-dom/server");
const UygulamaSimgesi = (await import("../../src/components/site/UygulamaSimgesi.tsx")).default;

type Course = Awaited<ReturnType<typeof getCourses>>[number];

const icerikKok = path.join(KOK, "..", "GuitarFlex-icerik");
if (!existsSync(path.join(icerikKok, "icerik"))) {
  console.error(`İçerik deposu bulunamadı: ${icerikKok}\nGuitarFlex-icerik deposunu GuitarFlex'in yanına klonla.`);
  process.exit(1);
}

const kurslar = (await getCourses()).filter((c: Course) => c.status !== "yakinda");
const yollar: Record<string, unknown> = {};
for (const y of YOLLAR) {
  const v = await getYol(y.slug);
  if (v) yollar[y.slug] = v;
}
const sarkilar = await getPopularSongs();
const rehber = sarkilar
  .filter((s) => s.rehber)
  .sort((a, b) => a.rehber!.adim - b.rehber!.adim)
  .map((s) => ({
    adim: s.rehber!.adim,
    seviye: s.rehber!.seviye,
    bolumler: s.rehber!.bolumler,
    baslik: s.title,
    sanatci: s.artist,
    tur: s.kind,
    madalya: s.madalya,
    bpm: s.bpm,
    url: s.url ?? `https://www.songsterr.com/?pattern=${encodeURIComponent(`${s.artist} ${s.title}`)}`,
  }));

// Yol ekranı için hafif özet: ders gövdeleri (tex, body) olmadan
const ozet = kurslar.map((c: Course) => ({
  slug: c.slug,
  baslik: c.cardTitle ?? c.title,
  kisa: simge.kisaAd(c.slug, c.cardTitle ?? c.title),
  aciklama: c.description,
  tur: c.kind,
  simge: simge.kursSimgesi(c.slug),
  bolumler: c.sections.map((s) => ({
    no: s.number,
    baslik: s.title,
    seviye: s.level,
    alt: s.chapters.map((ch) => ({
      kod: ch.code,
      baslik: ch.title,
      dersler: ch.lessons.map((l) => ({
        id: l.id,
        baslik: l.title,
        tur: simge.dersTuru(l) ?? "drill",
        dk: l.minutes,
        bpm: l.bpm,
        pratik: l.practice,
        kisim: l.parts?.map((p) => p.name),
      })),
    })),
  })),
}));

// Glifler: masaüstünün simge bileşenini sunucuda çizip içindeki <svg>'yi alıyoruz (tek kaynak)
const glifAdlari = new Set<string>();
for (const c of ozet) glifAdlari.add(c.simge.glif);
for (const t of ["drill", "etut", "okuma", "quickstudy", "transkripsiyon", "kompozisyon", "resital", "egitim", "pratik", "ek"])
  glifAdlari.add(simge.dersSimgesi(t === "drill" ? undefined : (t as never)).glif);
for (const y of YOLLAR) glifAdlari.add(simge.yolSimgesi(y.slug).glif);
for (const g of ["nota", "alev", "hedef", "takvim", "kutuphane", "kisi", "onay", "oynat", "kitap", "liste", "kulaklik", "gitar", "metronom", "madalya", "yildiz"])
  glifAdlari.add(g);
const glifler: Record<string, string> = {};
for (const g of glifAdlari) {
  const html = renderToStaticMarkup(React.createElement(UygulamaSimgesi, { simge: { glif: g as never, renk: "teknik" }, boyut: 44 }));
  const m = html.match(/<svg[\s\S]*<\/svg>/);
  if (m) glifler[g] = m[0].replace(/ aria-hidden="true"/g, "");
}

let kaynak = "";
try {
  kaynak = execSync("git rev-parse --short HEAD", { cwd: icerikKok }).toString().trim();
} catch {
  // Git yoksa boş kalır
}

const dersSayisi = (c: Course) => c.sections.reduce((n, s) => n + s.chapters.reduce((m, ch) => m + ch.lessons.length, 0), 0);
const meta = {
  uretildi: new Date().toISOString(),
  icerikKaynak: kaynak,
  kurslar: Object.fromEntries(kurslar.map((c: Course) => [c.slug, dersSayisi(c)])),
  yollar: Object.fromEntries(
    Object.entries(yollar).map(([k, v]) => {
      const y = v as { bolumler: { no: number; ek?: boolean }[]; adimlar: { bolum: number }[] };
      const ek = new Set(y.bolumler.filter((b) => b.ek).map((b) => b.no));
      return [k, { ana: y.adimlar.filter((a) => !ek.has(a.bolum)).length, ek: y.adimlar.filter((a) => ek.has(a.bolum)).length }];
    }),
  ),
  yolAdlari: Object.fromEntries(YOLLAR.map((y) => [y.slug, y.ad])),
  yolSimgeleri: Object.fromEntries(YOLLAR.map((y) => [y.slug, simge.yolSimgesi(y.slug)])),
  rehber: rehber.length,
  /** Ders türü → glif (drill: kursun kendi glifi) */
  dersGlifleri: Object.fromEntries(
    ["etut", "okuma", "quickstudy", "transkripsiyon", "kompozisyon", "resital", "egitim", "pratik", "ek"].map((t) => [t, simge.dersSimgesi(t as never).glif]),
  ),
  dersTuruAdi: simge.DERS_TURU_ADI,
};

mkdirSync(CIKTI, { recursive: true });
const yaz = (ad: string, veri: unknown) => writeFileSync(path.join(CIKTI, ad), JSON.stringify(veri));
yaz("ozet.json", ozet);
yaz("kurslar.json", kurslar);
yaz("yollar.json", yollar);
yaz("sarki-rehberi.json", rehber);
yaz("glifler.json", glifler);
yaz("meta.json", meta);
// alphaTab dosyaları (script, Bravura fontu, ses bankaları): masaüstünün public/alphatab'ı → mobil/public/alphatab
const alphatab = path.join(KOK, "public", "alphatab");
if (existsSync(alphatab)) cpSync(alphatab, path.join(MOBIL, "public", "alphatab"), { recursive: true });
else console.warn("public/alphatab yok: kökte `npm run copy-alphatab` çalıştır (tab oynatıcı için)");

console.log(
  `İçerik paketi: ${kurslar.length} kurs, ${Object.keys(yollar).length} teori yolu, ${rehber.length} şarkı adımı, ${Object.keys(glifler).length} glif (içerik ${kaynak || "?"})`,
);
console.log(JSON.stringify(meta.yollar));
