// Rig'im zincir işlemlerinin sınaması: ekle, taşı, kaydır (klavye), sil, paralel yol, FX loop, depo, içe/dışa aktarma.
// Çalıştırma: npm run test:rig
import assert from "node:assert/strict";
import {
  ANA, CIZIMLER, CIZIM_LISTESI, HOPARLORLER, KATALOG, PEDAL_ALT_TURLERI, pedalAltTuru, sabitDugmeDegeri, dugmeleri, esinSatiri, eslesenKabin, turAdi, ONAYAR_EKIPMAN, cizimEtiketi, secenekDegeri, secenekSec, ayarla, baslangicDeposu, bosRig, disaAktar, donguAc, donguKapat, duzListe, ekipmanBul, ekipmanKaydet, ekipmanSil, ekle,
  gecis, goc, iceAktar, kapA, kapB, kapDongu, kaydir, konumBul, oneriIndeksi, ornekZincir, paralelBlok, paralelEkle, paralelKaldir, paralelMi, paralelSar,
  rigAdlandir, rigEkle, rigKopyala, rigSil, seciliRig, sil, tasi, type Dugum, type Rig,
} from "../src/lib/rig-cekirdek.ts";
import { arkaPlaniTemizle, kenarRenkleri, type Goruntu } from "../src/lib/rig-foto.ts";

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
  assert.equal(oneriIndeksi(rig, 7, s), 3, "rack kabinden sonra");
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
  assert.equal(yaz(r), "e-les-paul-custom k-tuner k-kompresor k-overdrive e-dsl20cr{k-delay k-reverb} k-kabin-1x12 e-scarlett-solo");
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

// ── Katalog (GuitarFlex modelleri) ──

/** İlk sürümün kitaplık kimlikleri: eski rig'ler çözülmeye devam etmeli */
const ESKI_KIMLIKLER = ["k-gitar-tek-kesik", "k-gitar-cift-kesik", "k-gitar-akustik", "k-tuner", "k-wah", "k-kompresor", "k-gurultu-kapisi", "k-boost", "k-overdrive", "k-distortion", "k-fuzz", "k-eq", "k-chorus", "k-phaser", "k-flanger", "k-delay", "k-reverb", "k-looper", "k-amfi-kafa", "k-amfi-kombo", "k-amfi-kombo-kucuk", "k-kabin-4x12", "k-kabin-2x12", "k-kabin-1x12", "k-rack-kompresor", "k-rack-eq", "k-rack-delay", "k-rack-reverb", "k-di", "k-ses-karti", "k-yazilim"];

/** Katalogda geçmemesi gereken gerçek marka / model adları ve onlara çağrışım yapan sayı-ad birleşimleri */
const YASAK = /\b(marshall|fender|vox|mesa|boogie|orange|peavey|ampeg|ibanez|boss|mxr|dunlop|electro|ehx|strymon|tc ?electronic|line ?6|kemper|celestion|jensen|eminence|shure|sennheiser|royer|neumann|focusrite|universal audio|teletronix|urei|klon|tube ?screamer|ts-?\d+|808|9 ?volt|jcm|plexi|deluxe|twin|bassman|princeton|champ|ac ?30|ac ?15|rectifier|dual rectifier|big ?muff|rat|ds-?1|cry ?baby|uni-?vibe|whammy|g12|v30|vintage 30|greenback|sm ?57|sm ?58|r-?121|la-?2a|1176|cub|epiphone|gibson|les paul|stratocaster|telecaster|strat|tele|amplitube|hiwatt|5150|6505|rockerverb|memory ?man|dyna ?comp|soldano|engl|diezel|bogner|friedman|laney)\b/i;

test("katalog: istenen çeşitlilik (amfi, kabin, pedal türleri, rack, DI, ses kartı); mikrofon yok", () => {
  const say = (k: string) => KATALOG.filter((e) => CIZIMLER[e.cizim].kategori === k).length;
  assert.ok(say("amfi") >= 8, `amfi ${say("amfi")}`);
  assert.ok(say("kabin") >= 5, `kabin ${say("kabin")}`);
  assert.ok(say("pedal") >= 20, `pedal ${say("pedal")}`);
  assert.ok(say("rack") >= 6, `rack ${say("rack")}`);
  const tur = (c: string) => KATALOG.filter((e) => e.cizim === c || e.cizim.startsWith(`${c}-`)).length;
  assert.ok(tur("overdrive") >= 3 && tur("distortion") >= 2 && tur("fuzz") >= 2 && tur("delay") >= 2 && tur("reverb") >= 2, "pedal türleri");
  for (const c of ["boost", "kompresor", "gurultu-kapisi", "wah", "zarf-filtresi", "chorus", "phaser", "flanger", "tremolo", "vibe", "oktav", "looper", "tuner", "eq", "volum"]) assert.equal(tur(c) >= 1, true, c);
  assert.ok(tur("di") >= 1 && tur("ses-karti") >= 1, "stüdyo");
  assert.ok(!CIZIM_LISTESI.some((c) => c.startsWith("mikrofon")) && !KATALOG.some((e) => /mikrofon|\bmic\b/i.test(`${e.id} ${e.ad} ${CIZIMLER[e.cizim].ad}`)), "mikrofon kaldırıldı");
  assert.ok(KATALOG.some((e) => e.cizim === "kabin-4x10-bas") && KATALOG.some((e) => e.cizim === "amfi-bas"), "bas amfi ve bas kabini");
  assert.equal(HOPARLORLER.length, 3, "üç hoparlör türü");
});

test("katalog: her model GuitarFlex adlı, benzersiz, her çizim türü kitaplıkta; eski kimlikler korunur", () => {
  assert.equal(new Set(KATALOG.map((e) => e.id)).size, KATALOG.length, "kimlikler benzersiz");
  assert.equal(new Set(KATALOG.map((e) => e.ad)).size, KATALOG.length, "adlar benzersiz");
  for (const e of KATALOG) {
    assert.ok(e.ad.startsWith("GuitarFlex "), e.ad);
    assert.ok(cizimEtiketi(e), `etiket: ${e.ad}`);
    assert.ok(/^#[0-9a-f]{6}$/.test(e.renk), `renk: ${e.ad}`);
  }
  for (const c of CIZIM_LISTESI) assert.ok(KATALOG.some((e) => e.cizim === c), `kitaplıkta yok: ${c}`);
  const d = baslangicDeposu();
  for (const id of ESKI_KIMLIKLER) assert.ok(ekipmanBul(d, id), `eski kimlik çözülmeli: ${id}`);
  for (const e of ONAYAR_EKIPMAN) assert.equal(cizimEtiketi(e), undefined, "kullanıcı ekipmanına GuitarFlex etiketi basılmaz");
});

test("katalog: gerçek marka / model adı ya da çağrışımı yok; yalnız esin alanında izinli", () => {
  // Esin dışındaki her alan: ad, kimlik, açıklama, düğme ve anahtar adları (çizime basılanlar), tür adları, hoparlörler
  const metinler = [
    ...KATALOG.flatMap((e) => [e.ad, e.id, e.aciklama ?? "", turAdi(e), ...dugmeleri(e), ...(e.anahtarlar ?? []), ...Object.values(e.eskiDugmeler ?? {})]),
    ...CIZIM_LISTESI.map((c) => CIZIMLER[c].ad),
    ...HOPARLORLER,
  ];
  for (const m of metinler) assert.ok(!YASAK.test(m), `yasak ad: ${m}`);
  // Esin alanında gerçek ad bulunabilir (ve sınama onu yakalar: alan gerçekten ayrı tutuluyor)
  const esinli = KATALOG.filter((e) => e.esin);
  assert.ok(esinli.some((e) => YASAK.test(e.esin!)), "esin alanında gerçek ad izinli");
  for (const e of esinli) {
    // kafa ve pedallarda yıl zorunlu; kabinlerde doğrulanamayan yıl yazılmaz
    if (CIZIMLER[e.cizim].kategori !== "kabin") assert.ok(e.yil, `yıl yok: ${e.ad}`);
    if (e.yil) assert.ok(e.yil > 1900 && e.yil <= 2026, `yıl: ${e.ad}`);
    assert.ok(!e.ad.toLocaleLowerCase("tr").includes(e.esin!.toLocaleLowerCase("tr")), `ad esini taşımamalı: ${e.ad}`);
  }
  // Ekipmanım önayarları kullanıcının kendi ekipmanının etiketidir (marka adı olabilir) ve aynen kalır
  assert.deepEqual(ONAYAR_EKIPMAN.map((e) => e.ad), ["Epiphone Les Paul Custom", "Marshall DSL20CR", "Boss Dual Cube LX", "Focusrite Scarlett Solo", "AmpliTube 5"]);
  assert.ok(ONAYAR_EKIPMAN.every((e) => e.benim && e.ozel));
});

test("hoparlör seçeneği: kabinde seçilir, sınırlanır; diğer türlerde yok", () => {
  const sc = CIZIMLER["kabin-4x12"].secenekler![0];
  const { rig, id } = kur("k-kabin-4x12");
  const d0 = rig.zincir[0] as Dugum;
  assert.equal(secenekDegeri(d0, sc), 0, "varsayılan ilk hoparlör");
  const r1 = secenekSec(rig, id["k-kabin-4x12"], sc, 2);
  assert.equal(secenekDegeri(r1.zincir[0] as Dugum, sc), 2);
  const r2 = secenekSec(rig, id["k-kabin-4x12"], sc, 9);
  assert.equal(secenekDegeri(r2.zincir[0] as Dugum, sc), 2, "listenin dışı sınırlanır");
  assert.ok(CIZIM_LISTESI.filter((c) => CIZIMLER[c].secenekler).every((c) => CIZIMLER[c].kategori === "kabin"));
});

// ── Fotoğraftan ekipman ──

/** Sınama görüntüsü: hafif geçişli açık zemin, ortada koyu kırmızı dikdörtgen (ekipman), köşede küçük leke */
function ornekGoruntu(w = 120, h = 90): Goruntu {
  const data = new Uint8ClampedArray(w * h * 4);
  let tohum = 7;
  const gurultu = () => ((tohum = (tohum * 1103515245 + 12345) % 2147483648) / 2147483648 - 0.5) * 8;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const ekipman = x >= 40 && x < 82 && y >= 25 && y < 70;
      const leke = x >= 6 && x < 9 && y >= 6 && y < 9;
      const zemin = 232 - y * 0.35 - x * 0.1;
      const [r, g, b] = ekipman ? [150, 32, 30] : leke ? [60, 60, 60] : [zemin, zemin - 2, zemin - 6];
      data[i] = r + gurultu();
      data[i + 1] = g + gurultu();
      data[i + 2] = b + gurultu();
      data[i + 3] = 255;
    }
  return { width: w, height: h, data };
}

test("fotoğraf: arka plan ayrılır, ekipman kırpılır, küçük leke atılır", () => {
  const g = ornekGoruntu();
  const renk = kenarRenkleri(g);
  assert.ok(renk.length >= 1 && renk[0][0] > 190, "kenar rengi açık zemin");
  const s = arkaPlaniTemizle(g, { pay: 0 });
  assert.equal(s.basarili, true);
  assert.ok(Math.abs(s.kutu.x - 40) <= 1 && Math.abs(s.kutu.y - 25) <= 1, `kutu başı ${JSON.stringify(s.kutu)}`);
  assert.ok(Math.abs(s.kutu.w - 42) <= 2 && Math.abs(s.kutu.h - 45) <= 2, `kutu boyu ${JSON.stringify(s.kutu)}`);
  assert.ok(Math.abs(s.onPlan - (42 * 45) / (120 * 90)) < 0.01, `ön plan oranı ${s.onPlan}`);
  const a = (x: number, y: number) => s.goruntu.data[(y * s.goruntu.width + x) * 4 + 3];
  assert.equal(a(20, 20), 255, "ekipmanın ortası opak");
  assert.ok(a(0, 0) >= 100 && a(0, 0) < 255, "köşe kenar yumuşatması");
  // Pay ile kırpınca kenarda saydam zemin kalır
  const p = arkaPlaniTemizle(g, { pay: 0.1 });
  assert.ok(p.kutu.w > s.kutu.w && p.goruntu.data[3] === 0, "payda arka plan saydam");
});

test("fotoğraf: düz renk ya da her yeri kaplayan görüntüde ayırma başarısız sayılır (özgün döner)", () => {
  const w = 40;
  const h = 30;
  const duz: Goruntu = { width: w, height: h, data: new Uint8ClampedArray(w * h * 4).fill(200) };
  const s = arkaPlaniTemizle(duz);
  assert.equal(s.basarili, false);
  assert.equal(s.goruntu.width, w);
  assert.deepEqual(s.kutu, { x: 0, y: 0, w, h });
  assert.equal(arkaPlaniTemizle({ width: 2, height: 2, data: new Uint8ClampedArray(16) }).basarili, false);
});

test("goc: eski kayıtlardaki mikrofonlar sessizce çıkar (kitaplık ve kullanıcı mikrofonu; döngü ve yollarda da)", () => {
  const g = goc({
    rigler: [
      {
        id: "r1",
        ad: "Eski",
        zincir: [
          { ekipmanId: "k-overdrive" },
          { ekipmanId: "k-amfi-kombo", dongu: [{ ekipmanId: "k-mikrofon" }, { ekipmanId: "k-delay" }] },
          { tur: "paralel", a: [{ ekipmanId: "u-mic" }, { ekipmanId: "k-chorus" }], b: [{ ekipmanId: "k-mikrofon-serit" }] },
          { ekipmanId: "k-kabin-1x12" },
          { ekipmanId: "k-mikrofon", ayar: { Mesafe: 3 } },
          { ekipmanId: "u-mic" },
          { ekipmanId: "e-scarlett-solo" },
        ],
      },
    ],
    ekipman: [{ id: "u-mic", ad: "Benim mikrofonum", cizim: "mikrofon", renk: "#333333" }, ...ONAYAR_EKIPMAN],
  });
  assert.equal(yaz(g.rigler[0]), "k-overdrive k-amfi-kombo{k-delay} [A: k-chorus | B: ] k-kabin-1x12 e-scarlett-solo");
  assert.ok(!g.ekipman.some((e) => e.id === "u-mic"), "kullanıcının mikrofon ekipmanı da çıkar");
  assert.equal(g.ekipman.length, ONAYAR_EKIPMAN.length);
});

test("örnek modeller: esin satırı, model düğmeleri, eşleşen kabin", () => {
  const bul = (id: string) => KATALOG.find((e) => e.id === id)!;
  const kafa = bul("k-amfi-kafa");
  assert.equal(esinSatiri(kafa), "Esinlendiği: Marshall JCM800 2203 (1981)");
  assert.equal(kafa.ad, "GuitarFlex Brit 800 Head");
  assert.deepEqual(dugmeleri(kafa), ["Presence", "Bas", "Orta", "Tiz", "Master", "Kazanç"]);
  assert.equal(eslesenKabin(kafa)?.id, "k-kabin-4x12");
  assert.equal(eslesenKabin(kafa)?.hoparlorDuzeni, "4x12");
  assert.equal(esinSatiri(bul("k-overdrive")), "Esinlendiği: Ibanez TS808 Tube Screamer (1979)");
  assert.deepEqual(dugmeleri(bul("k-ruby-comp")), ["Çıkış", "Duyarlılık"]);
  assert.deepEqual(dugmeleri(bul("k-tuner")), CIZIMLER.tuner.dugmeler, "esinsiz model çizim türünün düğmelerini kullanır");
  for (const e of KATALOG) if (e.kabin) assert.equal(CIZIMLER[eslesenKabin(e)!.cizim].kategori, "kabin", `kabin: ${e.ad}`);
  assert.equal(esinSatiri(ONAYAR_EKIPMAN[0]), "", "kullanıcı ekipmanında esin yok");
});

test("örnek kafalar: beş farklı düzen, kontrol sayısı gerçeğe uygun, tür satırı ve görünüş", () => {
  const bul = (id: string) => KATALOG.find((e) => e.id === id)!;
  const titan = bul("k-amfi-modern");
  assert.equal(esinSatiri(titan), "Esinlendiği: Mesa/Boogie Dual Rectifier (1989)");
  assert.equal(dugmeleri(titan).length, 12, "iki kanal × altı düğme");
  assert.equal(eslesenKabin(titan)?.id, "k-kabin-4x12-modern");
  const crush = bul("k-crush-120-head");
  assert.equal(crush.cizim, "amfi-modern");
  assert.equal(crush.gorunum?.amfi, "crush");
  assert.equal(dugmeleri(crush).length, 9);
  const valf = bul("k-valve-verb-100-head");
  assert.equal(valf.gorunum?.amfi, "valf");
  assert.match(turAdi(valf), /turuncu/);
  const studyo = bul("k-studio-power-head");
  assert.deepEqual(dugmeleri(studyo), ["Normal", "Parlak", "Bas", "Tiz", "Orta", "Presence", "Master"]);
  assert.equal(turAdi(bul("k-amfi-kafa")), CIZIMLER["amfi-kafa"].ad, "tür adı yoksa çizim türününki");
  // eski Titan kayıtlarının düğmeleri ikinci kanala geçer
  const g = goc({ rigler: [{ id: "r", ad: "R", zincir: [{ ekipmanId: "k-amfi-modern", ayar: { Kazanç: 8, Parlaklık: 2 } }] }], ekipman: ONAYAR_EKIPMAN });
  assert.deepEqual((g.rigler[0].zincir[0] as Dugum).ayar, { "K2 · Kazanç": 8, "K2 · Presence": 2 });
  const dusk = bul("k-delay");
  assert.equal(dusk.gorunum?.govde, "yatay");
  assert.equal(dugmeleri(dusk).length, 5);
});

test("goc: düğme adı değişen modelde eski değerler yeni ada geçer (yeni ad varsa korunur)", () => {
  const g = goc({
    rigler: [
      {
        id: "r1",
        ad: "Eski kafa",
        zincir: [
          { ekipmanId: "k-amfi-kafa", ayar: { Kazanç: 7, Parlaklık: 3, "Ana ses": 6 }, dongu: [{ ekipmanId: "k-delay", ayar: { Zaman: 4 } }] },
          { tur: "paralel", a: [{ ekipmanId: "k-amfi-kafa", ayar: { Parlaklık: 2, Presence: 9 } }], b: [] },
          { ekipmanId: "e-dsl20cr", ayar: { "Ana ses": 4 } },
        ],
      },
    ],
    ekipman: ONAYAR_EKIPMAN,
  });
  const [kafa, p, dsl] = g.rigler[0].zincir as [Dugum, { a: Dugum[] }, Dugum];
  assert.deepEqual(kafa.ayar, { Kazanç: 7, Presence: 3, Master: 6 });
  assert.deepEqual(kafa.dongu?.[0].ayar, { Zaman: 4 });
  assert.deepEqual(p.a[0].ayar, { Presence: 9 }, "yeni adın değeri korunur");
  assert.deepEqual(dsl.ayar, { "Ana ses": 4 }, "kullanıcı ekipmanına dokunulmaz");
});

test("tam katalog: kategori ve pedal alt türü sayıları", () => {
  const pedallar = KATALOG.filter((e) => CIZIMLER[e.cizim].kategori === "pedal");
  assert.equal(pedallar.length, 97, "97 pedal");
  const say = (t: string) => pedallar.filter((e) => pedalAltTuru(e) === t).length;
  const hedef: Record<string, number> = { Kompresör: 5, Overdrive: 10, Distortion: 10, Delay: 10, Reverb: 10, Chorus: 5, Flanger: 5 };
  for (const t of PEDAL_ALT_TURLERI) assert.equal(say(t), hedef[t] ?? 3, `${t}: ${say(t)}`);
  assert.ok(pedallar.every((e) => PEDAL_ALT_TURLERI.includes(pedalAltTuru(e) as (typeof PEDAL_ALT_TURLERI)[number])), "her pedalın alt türü var");
  for (const e of pedallar) assert.ok(e.esin && e.yil, `pedal esini: ${e.ad}`);
});

test("tam katalog: 20 kafa, her kafanın kendi eşleşen kabini (20 farklı kabin)", () => {
  const kafalar = KATALOG.filter((e) => CIZIMLER[e.cizim].kategori === "amfi" && /kafa/i.test(turAdi(e)) && e.cizim !== "amfi-bas");
  assert.equal(kafalar.length, 20, kafalar.map((e) => e.ad).join(", "));
  const kabinler = new Set<string>();
  for (const k of kafalar) {
    const kb = eslesenKabin(k);
    assert.ok(kb, `kabin yok: ${k.ad}`);
    assert.equal(CIZIMLER[kb!.cizim].kategori, "kabin", `kabin türü: ${k.ad}`);
    assert.ok(kb!.esin && kb!.hoparlorDuzeni, `kabin bilgisi: ${kb!.ad}`);
    kabinler.add(kb!.id);
    assert.ok(k.esin && k.yil && dugmeleri(k).length >= 3, `kafa bilgisi: ${k.ad}`);
  }
  assert.equal(kabinler.size, 20, "her kafanın ayrı kabini");
  // her kafanın düğme adları kendi içinde eşsiz (ayar kaydında anahtar)
  for (const e of KATALOG) assert.equal(new Set(dugmeleri(e)).size, dugmeleri(e).length, `yinelenen düğme: ${e.ad}`);
});

test("tam katalog: kimlikler kararlı ve GuitarFlex adından türer; çizimdeki düğme konumu sabit", () => {
  for (const e of KATALOG) {
    if (/^k-[a-z0-9-]+$/.test(e.id) && !CIZIM_LISTESI.some((c) => e.id === `k-${c}`)) {
      const beklenen = `k-${e.ad.slice("GuitarFlex ".length).toLocaleLowerCase("tr").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ı/g, "i").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
      assert.equal(e.id, beklenen, `kimlik: ${e.ad}`);
    }
  }
  const v = sabitDugmeDegeri("k-amfi-kafa", "Bas");
  assert.equal(v, sabitDugmeDegeri("k-amfi-kafa", "Bas"), "aynı model, aynı konum");
  assert.ok(v >= 2.5 && v <= 8, "doğal aralık");
  const farkli = new Set(KATALOG.slice(0, 30).map((e) => sabitDugmeDegeri(e.id, "Seviye")));
  assert.ok(farkli.size > 3, "modelden modele farklı");
});

test("goc: eski kayıt, yeni katalogda bozulmadan açılır (ayar değerleri veride kalır)", () => {
  const g = goc({
    rigler: [{ id: "r", ad: "Eski", zincir: [{ ekipmanId: "k-amfi-butik", ayar: { Kazanç: 6, "Ana ses": 3 } }, { ekipmanId: "k-delay", ayar: { Zaman: 4 } }, { ekipmanId: "k-overdrive-seffaf", ayar: { Bas: 2 } }] }],
    ekipman: ONAYAR_EKIPMAN,
  });
  const [butik, dly, amber] = g.rigler[0].zincir as Dugum[];
  assert.deepEqual(butik.ayar, { "K1 · Kazanç": 6, Master: 3 });
  assert.deepEqual(dly.ayar, { Zaman: 4 });
  assert.deepEqual(amber.ayar, { Bas: 2 }, "artık çizilmeyen düğmenin değeri silinmez");
  assert.ok(g.rigler[0].zincir.every((d) => KATALOG.some((e) => e.id === (d as Dugum).ekipmanId)));
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
