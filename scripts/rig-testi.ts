// Rig'im zincir işlemlerinin sınaması: ekle, taşı, kaydır (klavye), sil, paralel yol, FX loop, depo, içe/dışa aktarma.
// Çalıştırma: npm run test:rig
import assert from "node:assert/strict";
import {
  ANA, CIZIMLER, KATALOG, ONAYAR_EKIPMAN, ayarla, baslangicDeposu, bosRig, disaAktar, donguAc, donguKapat, duzListe, ekipmanBul, ekipmanKaydet, ekipmanSil, ekle,
  gecis, goc, iceAktar, kapA, kapB, kapDongu, kaydir, konumBul, oneriIndeksi, ornekZincir, paralelBlok, paralelEkle, paralelKaldir, paralelMi, paralelSar,
  rigAdlandir, rigEkle, rigKopyala, rigSil, seciliRig, sil, tasi, type Dugum, type Rig,
} from "../src/lib/rig-cekirdek.ts";

const testler: [string, () => void][] = [];
const test = (ad: string, f: () => void) => testler.push([ad, f]);

/** Rig'i ekipman kimliklerinden okunur bir dizgeye çevirir: "a b [A: x | B: y] amfi{d r}" */
function yaz(r: Rig): string {
  const d = (x: Dugum) => x.ekipmanId + (x.dongu ? `{${x.dongu.map((y) => y.ekipmanId).join(" ")}}` : "");
  return r.zincir.map((o) => (paralelMi(o) ? `[A: ${o.a.map(d).join(" ")} | B: ${o.b.map(d).join(" ")}]` : d(o))).join(" ");
}
/** Sırayla ekleyip kimlikleri döndürür */
function kur(...ekipman: string[]): { rig: Rig; id: Record<string, string> } {
  let rig = bosRig("Sınama");
  const id: Record<string, string> = {};
  for (const e of ekipman) {
    const r = ekle(rig, e);
    rig = r.rig;
    id[e] = r.id!;
  }
  return { rig, id };
}

test("ekle: sona, belli sıraya ve sınır dışı sırayla", () => {
  let { rig } = kur("gitar", "amfi");
  rig = ekle(rig, "od", ANA, 1).rig;
  assert.equal(yaz(rig), "gitar od amfi");
  rig = ekle(rig, "kabin", ANA, 99).rig;
  rig = ekle(rig, "tuner", ANA, -3).rig;
  assert.equal(yaz(rig), "tuner gitar od amfi kabin");
  assert.equal(ekle(rig, "x", "a:yok").id, null, "olmayan kaba eklenmez");
});

test("tasi: aynı kapta ileri/geri (bırakma yeri öğe çıkmadan önceki sıraya göre)", () => {
  const { rig, id } = kur("a", "b", "c", "d");
  assert.equal(yaz(tasi(rig, id.a, ANA, 3)), "b c a d");
  assert.equal(yaz(tasi(rig, id.a, ANA, 4)), "b c d a");
  assert.equal(yaz(tasi(rig, id.d, ANA, 0)), "d a b c");
  assert.equal(tasi(rig, id.b, ANA, 1), rig, "yerinde bırakma değişiklik değil");
  assert.equal(tasi(rig, id.b, ANA, 2), rig);
});

test("kaydir: ←/→ bir adım; uçlarda değişmez", () => {
  const { rig, id } = kur("a", "b", "c");
  assert.equal(yaz(kaydir(rig, id.b, -1)), "b a c");
  assert.equal(yaz(kaydir(rig, id.b, 1)), "a c b");
  assert.equal(kaydir(rig, id.a, -1), rig);
  assert.equal(kaydir(rig, id.c, 1), rig);
});

test("sil: düğüm kalkar; olmayan kimlik değişiklik yapmaz", () => {
  const { rig, id } = kur("a", "b", "c");
  assert.equal(yaz(sil(rig, id.b)), "a c");
  assert.equal(sil(rig, "yok"), rig);
});

test("paralel: ekle, yollara taşı, rig başına tek blok, kaldırınca A sonra B birleşir", () => {
  const k = kur("gitar", "od", "ch", "amfi");
  let rig = k.rig;
  const p = paralelEkle(rig, 3);
  rig = p.rig;
  assert.equal(paralelEkle(rig).id, p.id, "ikinci blok açılmaz");
  rig = tasi(rig, k.id.od, kapA(p.id), 0);
  rig = tasi(rig, k.id.ch, kapB(p.id), 0);
  rig = ekle(rig, "dl", kapB(p.id)).rig;
  assert.equal(yaz(rig), "gitar [A: od | B: ch dl] amfi");
  assert.deepEqual(konumBul(rig, k.id.ch), { kap: kapB(p.id), indeks: 0 });
  // Blok iç içe olmaz: blok yollara ya da döngüye taşınamaz
  assert.equal(tasi(rig, p.id, kapA(p.id), 0), rig);
  // Blok ana zincirde bir bütün olarak taşınır
  assert.equal(yaz(tasi(rig, p.id, ANA, 0)), "[A: od | B: ch dl] gitar amfi");
  assert.equal(yaz(paralelKaldir(rig)), "gitar od ch dl amfi");
  assert.equal(yaz(sil(rig, p.id)), "gitar od ch dl amfi", "bloğu silmek kaldırmakla aynı");
});

test("paralel: klavyeyle blok atlanır, yolun ucunda dışarı çıkılır", () => {
  const k = kur("a", "b", "c");
  const p = paralelSar(k.rig, k.id.b);
  let rig = p.rig;
  assert.equal(yaz(rig), "a [A: b | B: ] c");
  assert.equal(yaz(kaydir(rig, k.id.a, 1)), "[A: b | B: ] a c", "ana zincirde blok tek adımda atlanır");
  assert.equal(yaz(kaydir(rig, k.id.b, -1)), "a b [A:  | B: ] c", "A yolunun başından sola: bloğun önüne");
  assert.equal(yaz(kaydir(rig, k.id.b, 1)), "a [A:  | B: ] b c", "A yolunun sonundan sağa: bloğun arkasına");
  rig = ekle(rig, "x", kapB(p.id!)).rig;
  rig = ekle(rig, "y", kapB(p.id!)).rig;
  const x = rig.zincir.flatMap((o) => (paralelMi(o) ? o.b : [])).find((d) => d.ekipmanId === "x")!;
  assert.equal(yaz(kaydir(rig, x.id, 1)), "a [A: b | B: y x] c", "yol içinde bir adım");
  assert.equal(paralelSar(rig, k.id.a).id, null, "ikinci blok sarılmaz");
});

test("FX loop: aç, içine taşı/ekle, iç içe döngü yok, kapatınca efektler amfinin arkasına", () => {
  const k = kur("gitar", "od", "amfi", "dl", "kabin");
  let rig = donguAc(k.rig, k.id.amfi);
  rig = tasi(rig, k.id.dl, kapDongu(k.id.amfi), 0);
  rig = ekle(rig, "rv", kapDongu(k.id.amfi)).rig;
  assert.equal(yaz(rig), "gitar od amfi{dl rv} kabin");
  // Döngüdeki düğümün kendi döngüsü açılmaz; döngülü amfi başka bir döngüye girmez
  assert.equal(donguAc(rig, k.id.dl), rig);
  const k2 = ekle(rig, "amfi2");
  rig = donguAc(k2.rig, k2.id!);
  assert.equal(tasi(rig, k2.id!, kapDongu(k.id.amfi), 0), rig);
  assert.equal(tasi(rig, k.id.amfi, kapDongu(k.id.amfi), 0), rig);
  rig = sil(rig, k2.id!);
  // Döngünün ucunda klavye: amfinin önüne / arkasına çıkar
  assert.equal(yaz(kaydir(rig, k.id.dl, -1)), "gitar od dl amfi{rv} kabin");
  const rv = rig.zincir.flatMap((o) => (!paralelMi(o) && o.dongu ? o.dongu : [])).find((d) => d.ekipmanId === "rv")!;
  assert.equal(yaz(kaydir(rig, rv.id, 1)), "gitar od amfi{dl} rv kabin");
  assert.equal(yaz(donguKapat(rig, k.id.amfi)), "gitar od amfi dl rv kabin");
  assert.equal(yaz(sil(rig, k.id.amfi)), "gitar od dl rv kabin", "amfi silinince döngüdeki efektler kalır");
});

test("FX loop: paralel yoldaki amfide de çalışır", () => {
  const k = kur("gitar", "amfi", "kabin");
  const p = paralelSar(k.rig, k.id.amfi);
  let rig = donguAc(p.rig, k.id.amfi);
  rig = ekle(rig, "dl", kapDongu(k.id.amfi)).rig;
  assert.equal(yaz(rig), "gitar [A: amfi{dl} | B: ] kabin");
  assert.deepEqual(
    duzListe(rig).map((d) => d.dugum.ekipmanId),
    ["gitar", "amfi", "dl", "kabin"],
  );
});

test("ayarla / gecis: değer 0–10 arasında, 0,1 adım; bypass", () => {
  const { rig, id } = kur("od");
  const r = ayarla(ayarla(rig, id.od, "Kazanç", 12.345), id.od, "Ton", 3.27);
  const d = r.zincir[0] as Dugum;
  assert.equal(d.ayar["Kazanç"], 10);
  assert.equal(d.ayar["Ton"], 3.3);
  assert.equal((gecis(r, id.od).zincir[0] as Dugum).kapali, true);
  assert.equal((gecis(gecis(r, id.od), id.od).zincir[0] as Dugum).kapali, false);
});

test("oneriIndeksi: türlerin olağan sırasına göre yer", () => {
  const sira: Record<string, number> = { gitar: 0, od: 3, amfi: 4, kabin: 5 };
  const { rig } = kur("gitar", "amfi", "kabin");
  const s = (d: Dugum) => sira[d.ekipmanId] ?? 9;
  assert.equal(oneriIndeksi(rig, 3, s), 1, "pedal amfiden önce");
  assert.equal(oneriIndeksi(rig, 6, s), 3, "mikrofon kabinden sonra");
  assert.equal(oneriIndeksi(rig, 0, s), 1, "ikinci gitar ilk gitarın arkasına");
});

test("depo: başlangıç, rig ekle/adlandır/kopyala/sil, benzersiz ad", () => {
  let d = baslangicDeposu();
  assert.equal(d.rigler.length, 1);
  assert.equal(d.ekipman.length, ONAYAR_EKIPMAN.length);
  d = rigEkle(d, "Crunch");
  d = rigEkle(d, "Crunch");
  assert.deepEqual(d.rigler.map((r) => r.ad), ["Temiz", "Crunch", "Crunch 2"]);
  d = rigAdlandir(d, d.seciliRig, "Solo");
  assert.equal(seciliRig(d).ad, "Solo");
  d = { ...d, rigler: d.rigler.map((r) => (r.ad === "Solo" ? { ...r, zincir: ornekZincir(d) } : r)) };
  d = rigKopyala(d, d.seciliRig);
  const kopya = seciliRig(d);
  assert.equal(kopya.ad, "Solo (kopya)");
  const asil = d.rigler.find((r) => r.ad === "Solo")!;
  assert.notEqual(duzListe(kopya)[0].dugum.id, duzListe(asil)[0].dugum.id, "kopyada kimlikler yeni");
  d = rigSil(d, kopya.id);
  assert.equal(seciliRig(d).ad, "Solo");
  for (const r of [...d.rigler]) d = rigSil(d, r.id);
  assert.equal(d.rigler.length, 1, "son rig silinince boş bir rig kalır");
});

test("örnek rig: istenen zincir ve FX loop", () => {
  const d = baslangicDeposu();
  const r: Rig = { ...bosRig("Örnek"), zincir: ornekZincir(d) };
  assert.equal(yaz(r), "e-les-paul-custom k-tuner k-kompresor k-overdrive e-dsl20cr{k-delay k-reverb} k-kabin-1x12 k-mikrofon e-scarlett-solo");
  for (const x of duzListe(r)) assert.ok(ekipmanBul(d, x.dugum.ekipmanId), `ekipman var: ${x.dugum.ekipmanId}`);
});

test("ekipman: kaydet, sil (kullanan düğümler kalkar)", () => {
  let d = baslangicDeposu();
  d = ekipmanKaydet(d, { id: "u-1", ad: "  Benim fuzz  ", cizim: "fuzz", renk: "#ABCDEF", benim: true });
  assert.equal(ekipmanBul(d, "u-1")?.ad, "Benim fuzz");
  assert.equal(ekipmanBul(d, "u-1")?.renk, "#abcdef");
  d = ekipmanKaydet(d, { id: "u-1", ad: "Fuzz 2", cizim: "fuzz", renk: "kırmızı" });
  assert.equal(ekipmanBul(d, "u-1")?.renk, "#3a3c42", "geçersiz renk varsayılana döner");
  const r = ekle(ekle(seciliRig(d), "u-1").rig, "k-delay").rig;
  d = { ...d, rigler: [r] };
  d = ekipmanSil(d, "u-1");
  assert.equal(yaz(seciliRig(d)), "k-delay");
  assert.ok(KATALOG.every((e) => e.cizim in CIZIMLER), "kitaplıktaki her ekipmanın çizimi var");
});

test("dışa / içe aktarma: gidiş-dönüş, kimlikler yenilenir, bozuk dosya anlaşılır hata", () => {
  let d = baslangicDeposu();
  d = { ...d, rigler: [{ ...seciliRig(d), ad: "Crunch", zincir: ornekZincir(d) }] };
  d = ekipmanKaydet(d, { id: "u-foto", ad: "Fotoğraflı", cizim: "boost", renk: "#112233", fotoId: "FOTO_ANAHTARI_9" });
  const metin = disaAktar(d);
  assert.ok(!metin.includes("FOTO_ANAHTARI_9"), "fotoğraf anahtarı dışa aktarılmaz");
  const { depo, rigSayisi } = iceAktar(baslangicDeposu(), metin);
  assert.equal(rigSayisi, 1);
  assert.deepEqual(depo.rigler.map((r) => r.ad), ["Temiz", "Crunch"]);
  const gelen = depo.rigler[1];
  assert.equal(yaz(gelen), yaz(d.rigler[0]));
  assert.notEqual(duzListe(gelen)[0].dugum.id, duzListe(d.rigler[0])[0].dugum.id);
  assert.ok(depo.ekipman.some((e) => e.id === "u-foto"));
  assert.throws(() => iceAktar(d, "{"), /JSON değil/);
  assert.throws(() => iceAktar(d, '{"tur":"baska"}'), /rig dosyası değil/);
  assert.throws(() => iceAktar(d, '{"tur":"guitarflex-rig","rigler":[]}'), /rig yok/);
});

test("goc: bozuk veri güvenli depoya döner; ikinci paralel blok düzleşir; geçersiz değerler ayıklanır", () => {
  assert.equal(goc(null).rigler.length, 1);
  const g = goc({
    rigler: [
      {
        id: "r1",
        ad: "X",
        zincir: [
          { tur: "paralel", a: [{ ekipmanId: "a" }], b: [] },
          { tur: "paralel", a: [{ ekipmanId: "b" }], b: [{ ekipmanId: "c" }] },
          { ekipmanId: "amfi", ayar: { Kazanç: 99, kötü: "x" }, dongu: [{ ekipmanId: "dl", dongu: [{ ekipmanId: "iç" }] }] },
          { yanlis: true },
        ],
      },
    ],
    seciliRig: "yok",
    ekipman: [{ id: "u", cizim: "olmayan" }, { id: "v", cizim: "delay", renk: "#000000" }],
  });
  const r = g.rigler[0];
  assert.equal(yaz(r), "[A: a | B: ] b c amfi{dl}");
  assert.equal(paralelBlok(r)?.a.length, 1);
  assert.deepEqual((r.zincir[3] as Dugum).ayar, { Kazanç: 10 });
  assert.equal(g.seciliRig, "r1");
  assert.deepEqual(g.ekipman.map((e) => e.id), ["v"]);
});

let gecen = 0;
for (const [ad, f] of testler) {
  try {
    f();
    gecen++;
    console.log(`  ✓ ${ad}`);
  } catch (e) {
    console.error(`  ✗ ${ad}\n    ${(e as Error).message}`);
  }
}
console.log(`\n${gecen}/${testler.length} sınama geçti`);
if (gecen !== testler.length) process.exit(1);
