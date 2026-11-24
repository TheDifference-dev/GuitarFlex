// Çalışma Defteri veri katmanının sınaması: göç, süre hesabı, çift saymama, yerel tarih (gece yarısı sınırı).
// Çalıştırma: npm run test:defter
// Saat dilimi İstanbul'a sabitlenir (kullanıcının bilgisayarı); gün anahtarları yerel tarihle üretilmeli.
process.env.TZ = "Europe/Istanbul";

import assert from "node:assert/strict";
import { register } from "node:module";
import {
  bilinenKisim, birlestir, bos, disaAktar, durumAyarla, elleEkle, gitarBasina, gitarEkle, gitarSil, goc, gunToplami, gunlukToplamlar, gununOturumlari,
  gununPlanlari, haftaBasi, haftaOzeti, iceAktarMetin, isaretli, kademe, kayitAc, konumYaz, listedenCikar, listele, listeTasi, listeyeEkle, planAyarla,
  planaEkle, plandanKaldir, sureEkle, yakinPlan, yerelGun, type DefterVeri, type KayitBilgisi,
} from "../src/lib/defter-cekirdek.ts";

// progress.ts ve oyun.ts uygulama içinde uzantısız göreli içe aktarım kullanır ("./progress"); Node bu yolları .ts ile
// çözsün diye küçük bir çözümleyici kaydedilir, modüller ondan sonra yüklenir.
register(
  "data:text/javascript," +
    encodeURIComponent(
      `export async function resolve(s, c, next) { if (/^\\.{1,2}\\//.test(s) && !/\\.[cm]?[jt]sx?$/.test(s) && c.parentURL && c.parentURL.includes("/src/")) { try { return await next(s + ".ts", c); } catch {} } return next(s, c); }`,
    ),
);
const { streak, today } = await import("../src/lib/progress.ts");
const { gorevler, gunler, seri } = await import("../src/lib/oyun.ts");

let gecen = 0;
const testler: [string, () => void][] = [];
const test = (ad: string, f: () => void) => testler.push([ad, f]);

const DERS: KayitBilgisi = { id: "egzersiz:alternatif-pena/1.1", tur: "egzersiz", baslik: "Tek tel", altBaslik: "Alternatif Pena", href: "/calis/alternatif-pena/1.1" };
const SARKI: KayitBilgisi = { id: "sarki:songsterr/Metallica|Enter Sandman", tur: "sarki", baslik: "Enter Sandman", altBaslik: "Metallica", href: "https://www.songsterr.com/" };
const an = (s: string) => new Date(s); // yerel saat (TZ=Europe/Istanbul)
/** Kullanıcı işaretledi ("Öğreniyorum"): defterde yalnız işaretli kayıtlar süre toplar */
const isaretle = (v: DefterVeri, b: KayitBilgisi, zaman = "2026-11-01T09:00:00") => durumAyarla(v, b, "devam", undefined, an(zaman));

/** `new Date()` çağrılarını sabit bir ana bağlar (progress.ts › today() gibi işlevler için) */
function saatiDondur<T>(zaman: string, f: () => T): T {
  const Gercek = Date;
  const sabit = new Gercek(zaman).getTime();
  class Sahte extends Gercek {
    constructor(...a: ConstructorParameters<typeof Date> | []) {
      if (a.length) super(...(a as ConstructorParameters<typeof Date>));
      else super(sabit);
    }
    static now() {
      return sabit;
    }
  }
  globalThis.Date = Sahte as DateConstructor;
  try {
    return f();
  } finally {
    globalThis.Date = Gercek;
  }
}

/* ── Yerel tarih: 23:30 ve 00:30 ── */

test("yerelGun: İstanbul 23:30 o günde, 00:30 ertesi günde (UTC'ye göre değil)", () => {
  const gece = an("2026-11-20T23:30:00");
  const sabah = an("2026-11-21T00:30:00");
  assert.equal(yerelGun(gece), "2026-11-20");
  assert.equal(yerelGun(sabah), "2026-11-21");
  // Karşılaştırma: UTC tabanlı anahtar 00:30'u (UTC 21:30) bir önceki güne yazardı
  assert.equal(sabah.toISOString().slice(0, 10), "2026-11-20");
});

test("progress.ts › today(): 23:30 ve 00:30'da yerel gün", () => {
  assert.equal(saatiDondur("2026-11-20T23:30:00+03:00", today), "2026-11-20");
  assert.equal(saatiDondur("2026-11-21T00:30:00+03:00", today), "2026-11-21");
});

test("progress.ts › streak(): gece yarısından sonra dünkü oturum seriyi sürdürür", () => {
  const s = [
    { date: "2026-11-19", exerciseId: "a", seconds: 60, bpm: 80 },
    { date: "2026-11-20", exerciseId: "a", seconds: 60, bpm: 80 },
  ];
  assert.equal(saatiDondur("2026-11-21T00:30:00+03:00", () => streak(s)), 2);
  assert.equal(saatiDondur("2026-11-20T23:30:00+03:00", () => streak(s)), 2);
});

test("oyun.ts › gunler() ve seri(): 23:30'da kaydedilen oturum o günün görevine, 00:30'da seri sürer", () => {
  // progress.ts › addPracticeTime oturum tarihini today() ile yazar: 23:30 ve 00:30 kayıtları
  const tarih23 = saatiDondur("2026-11-20T23:30:00+03:00", today);
  const tarih00 = saatiDondur("2026-11-21T00:30:00+03:00", today);
  // Kromatik Isınma dersi: günlük hedefin "Isınma" görevi (W5)
  const p = { exercises: {}, quizBest: {}, steps: {}, teori: {}, sessions: [{ date: tarih23, exerciseId: "kromatik-isinma/kr2-1-0-1", seconds: 1200, bpm: 60 }, { date: tarih00, exerciseId: "kromatik-isinma/kr2-1-0-1", seconds: 300, bpm: 60 }] };
  const g = gunler(p);
  assert.equal(g.get("2026-11-20")?.egzersiz, 1200);
  assert.equal(g.get("2026-11-21")?.egzersiz, 300);
  assert.equal(g.get("2026-11-20")?.isinma, 1200);
  const kural = { egzersizDk: 30, isinmaDk: 10, kalkanGun: 3, kalkanMaks: 2, oyMaks: 10 };
  // 21 Kasım 00:30: dün (20) Isınma görevi tamam, bugün henüz değil → seri 1, bozulmaz
  assert.equal(saatiDondur("2026-11-21T00:30:00+03:00", () => seri(p, kural)).seri, 1);
});

test("oyun.ts › gorevler(): ısınma, üç teknikten iki, şarkı (ilerleme kaydı + defter, çift sayma yok)", () => {
  const g = "2026-11-24";
  const ses = (exerciseId: string, seconds: number) => ({ date: g, exerciseId, seconds, bpm: 80 });
  const p = {
    exercises: {}, quizBest: {}, steps: {}, teori: {},
    sessions: [ses("kromatik-isinma/kr2-1-0-1", 400), ses("kromatik-isinma/kr2-2-0-1", 300), ses("legato/x", 200), ses("hammer-on-pull-off/y", 150), ses("sweep/z", 299), ses("serbest:kutuphane/yesil", 240)],
  };
  // Kütüphane şarkısı: defter aynı 240 sn'yi ölçtü (çift sayılmaz) + Songsterr şarkısı elle 6 dk
  const defter = { kayitlar: {
    "sarki:kutuphane/yesil": { tur: "sarki", oturumlar: [{ tarih: g, sure: 240 }] },
    "sarki:songsterr/X|Y": { tur: "sarki", oturumlar: [{ tarih: g, sure: 360, elle: true }] },
  } };
  const gun = gunler(p, defter).get(g)!;
  assert.equal(gun.isinma, 700);
  assert.equal(gun.sarki["kutuphane/yesil"], 240);
  const gv = gorevler(gun, { egzersizDk: 30, kalkanGun: 7, kalkanMaks: 10, oyMaks: 10 }, ["legato", "sweep", "tapping"]);
  assert.deepEqual(gv.map((x) => [x.deger, x.tamam]), [[11, true], [1, false], [1, true]]);
  assert.deepEqual(gv[1].alt!.map((a) => a.dk), [5, 4, 0]);
});

test("sureEkle: 23:30 ve 00:30 oturumları ayrı günlere düşer, birleşmez", () => {
  let v = sureEkle(isaretle(bos(), DERS), DERS, 600, {}, an("2026-11-20T23:30:00"));
  v = sureEkle(v, DERS, 300, {}, an("2026-11-21T00:30:00"));
  const k = v.kayitlar[DERS.id];
  assert.deepEqual(k.oturumlar.map((o) => [o.tarih, o.sure, o.saat]), [["2026-11-20", 600, 23], ["2026-11-21", 300, 0]]);
  assert.equal(gununOturumlari(v, "2026-11-21").length, 1);
});

test("haftaBasi: pazar 23:30 ve pazartesi 00:30", () => {
  assert.equal(haftaBasi(an("2026-11-22T23:30:00")), "2026-11-16");
  assert.equal(haftaBasi(an("2026-11-23T00:30:00")), "2026-11-23");
});

/* ── Süre hesabı ── */

test("sureEkle: ardışık 5 sn'lik eklemeler tek oturumda birleşir, toplam = oturumlar toplamı", () => {
  let v = isaretle(bos(), DERS);
  const t0 = an("2026-11-21T10:00:00").getTime();
  for (let i = 0; i < 12; i++) v = sureEkle(v, DERS, 5, { konum: i + 1, hiz: 80, tempo: 96, kisim: "B" }, new Date(t0 + i * 5000));
  const k = v.kayitlar[DERS.id];
  assert.equal(k.oturumlar.length, 1);
  assert.equal(k.toplamSure, 60);
  assert.equal(k.oturumlar[0].sure, 60);
  assert.equal(konumYaz(k), "B kısmı, 12. ölçü, %80 hız");
});

test("sureEkle: 15 dk aradan sonra, başka kısım ya da gitarla yeni oturum", () => {
  const ilk = gitarEkle(bos(), "Les Paul", "elektro");
  const g1 = ilk.id;
  let v = isaretle(ilk.veri, DERS);
  const r = gitarEkle(v, "Akustik", "akustik");
  v = r.veri;
  const t = an("2026-11-21T10:00:00").getTime();
  v = sureEkle(v, DERS, 60, { kisim: "A" }, new Date(t));
  v = sureEkle(v, DERS, 60, { kisim: "A" }, new Date(t + 16 * 60000)); // ara > 15 dk
  v = sureEkle(v, DERS, 60, { kisim: "B" }, new Date(t + 17 * 60000)); // kısım değişti
  v = sureEkle(v, DERS, 60, { kisim: "B", gitar: r.id }, new Date(t + 18 * 60000)); // gitar değişti
  const k = v.kayitlar[DERS.id];
  assert.equal(k.oturumlar.length, 4);
  assert.equal(k.oturumlar[0].gitar, g1, "varsayılan gitar ilk eklenen");
  assert.equal(k.oturumlar[3].gitar, r.id);
  assert.equal(k.toplamSure, 240);
});

test("sureEkle 0 sn: kayıt yoksa oluşturmaz, varsa yalnız konumu günceller", () => {
  const v0 = bos();
  assert.equal(sureEkle(v0, DERS, 0, { konum: 5 }), v0);
  let v = sureEkle(isaretle(v0, DERS), DERS, 10, { konum: 3 }, an("2026-11-21T10:00:00"));
  v = sureEkle(v, DERS, 0, { konum: 9, aralik: [8, 11] }, an("2026-11-21T10:01:00"));
  assert.equal(v.kayitlar[DERS.id].konum, 9);
  assert.deepEqual(v.kayitlar[DERS.id].aralik, [8, 11]);
  assert.equal(v.kayitlar[DERS.id].toplamSure, 10);
});

/* ── Çift saymama ── */

test("gunToplami: ilerleme kaydı ve defterin ölçülen süresi iki kez sayılmaz, elle süre eklenir", () => {
  // Uygulamada 20 dk çalındı: aynı saniyeler ilerleme kaydına (1200) ve deftere (1200) yazıldı
  let v = sureEkle(isaretle(bos(), DERS), DERS, 1200, {}, an("2026-11-21T10:00:00"));
  // Songsterr'de 10 dk elle girildi (şarkı listeye eklenmiş)
  v = listeyeEkle(v, SARKI, an("2026-11-21T10:59:00"));
  v = kayitAc(v, SARKI, an("2026-11-21T11:00:00"));
  v = sureEkle(v, SARKI, 600, { elle: true }, an("2026-11-21T11:30:00"));
  const d = gunlukToplamlar(v).get("2026-11-21");
  assert.deepEqual(d, { olculen: 1200, elle: 600 });
  assert.equal(gunToplami(d, 1200), 1800, "20 dk ölçülen + 10 dk elle (40 değil)");
  // İlerleme kaydında daha fazla süre var (ör. sayaç elle başlatıldı, doğaçlama eşliği): o alınır
  assert.equal(gunToplami(d, 1500), 2100);
  // Defter başka bilgisayardan içe aktarıldı, ilerleme kaydı boş: defterin ölçülen süresi alınır
  assert.equal(gunToplami(d, 0), 1800);
});

test("elle süre ilerleme kaydına yazılmaz: gunlukToplamlar ayrı tutar", () => {
  let v = kayitAc(isaretle(bos(), SARKI), SARKI, an("2026-11-21T09:00:00"));
  for (const dk of [5, 10, 15]) v = sureEkle(v, SARKI, dk * 60, { elle: true, kisim: "Riff" }, an("2026-11-21T09:05:00"));
  const k = v.kayitlar[SARKI.id];
  assert.equal(k.toplamSure, 30 * 60);
  assert.equal(k.oturumlar.length, 1, "aynı dakikadaki hızlı eklemeler birleşir");
  assert.equal(k.oturumlar[0].elle, true);
  assert.deepEqual(gunlukToplamlar(v).get("2026-11-21"), { olculen: 0, elle: 1800 });
});

/* ── Göç ── */

test("goc: boş, bozuk ve bilinmeyen veri boş deftere döner", () => {
  for (const x of [null, undefined, 42, "metin", {}]) assert.deepEqual(goc(x), bos());
});

test("goc v0 (dizi, sürümsüz): kayıtlar korunur, eski alan adları çevrilir, toplam süre oturumlardan", () => {
  const v0 = [
    { id: "egzersiz:x/1", baslik: "Eski ders", oturumlar: [{ date: "2026-11-01", seconds: 120, bpm: 90 }, { tarih: "2026-11-02T22:30:00.000Z", sure: 60 }], toplamSure: 9999, durum: "ogrendim" },
    { id: "sarki:eski", baslik: "Yalnız toplam", toplamSure: 300, guncellendi: "2026-10-10T08:00:00.000Z", durum: "devam" },
    { baslik: "kimliksiz", durum: "devam" },
    { id: "sarki:isaretsiz", baslik: "İşaretsiz (v1 otomatik)", toplamSure: 60 },
    "çöp",
  ];
  const v = goc(v0);
  assert.equal(v.surum, 2);
  assert.equal(v.kayitlar["sarki:isaretsiz"], undefined, "işaretsiz kayıt temizlenir");
  const a = v.kayitlar["egzersiz:x/1"];
  assert.equal(a.tur, "egzersiz");
  assert.equal(a.durum, "ogrendim");
  assert.equal(a.toplamSure, 180, "toplam oturumlardan yeniden hesaplanır");
  assert.equal(a.oturumlar[0].tempo, 90);
  assert.equal(a.oturumlar[1].tarih, "2026-11-03", "UTC 22:30 = İstanbul 01:30 → ertesi gün");
  const b = v.kayitlar["sarki:eski"];
  assert.equal(b.toplamSure, 300, "oturumsuz eski toplam tek oturuma dönüşür");
  assert.equal(b.oturumlar[0].tarih, "2026-10-10");
  assert.ok(v.kayitlar["eski:2"], "kimliksiz kayıt sıra numarasıyla korunur");
  assert.equal(Object.keys(v.kayitlar).length, 3);
});

test("goc v0 (nesne): gitar adları dizisi, varsayılan gitar doğrulanır, plan sınırlanır", () => {
  const v = goc({ kayitlar: {}, gitarlar: ["Les Paul", { ad: "Akustik", tur: "akustik" }, { ad: " " }], varsayilanGitar: "yok", plan: { hedefDk: [30, "45", -5, 9999], notlar: ["sweep 4.1"] } });
  assert.deepEqual(v.gitarlar, [{ id: "g1", ad: "Les Paul" }, { id: "g2", ad: "Akustik", tur: "akustik" }]);
  assert.equal(v.varsayilanGitar, null);
  assert.deepEqual(v.plan.hedefDk, [30, 45, 0, 600, null, null, null]);
  assert.equal(v.plan.notlar[0], "sweep 4.1");
});

test("goc v2 → v2: dışa aktar / içe aktar gidiş-dönüş kayıpsız", () => {
  let v = isaretle(gitarEkle(bos(), "Les Paul", "elektro").veri, DERS);
  v = sureEkle(v, DERS, 125, { kisim: "B", konum: 18, hiz: 80, tempo: 96, aralik: [16, 23] }, an("2026-11-21T10:00:00"));
  v = durumAyarla(v, DERS, "devam", "B", an("2026-11-21T10:05:00"));
  v = planAyarla(v, 1, { hedefDk: 30, not: "sweep 4.1 + Metallica riff" });
  v = planaEkle(v, SARKI, "2026-11-25", an("2026-11-21T10:06:00"));
  v = listeyeEkle(v, SARKI, an("2026-11-21T10:07:00"));
  v = bilinenKisim(listeyeEkle(v, DERS), DERS.id, "Riff", true, an("2026-11-21T10:08:00"));
  const geri = iceAktarMetin(disaAktar(v));
  assert.deepEqual(geri, v);
  assert.throws(() => iceAktarMetin("{bozuk"), /JSON/);
  assert.throws(() => iceAktarMetin('{"baska":1}'), /yedeği değil/);
});

/* ── Diğer ── */

test("durumAyarla, listele: Öğreniyorum turuncuları, Öğrendim yeşilleri gösterir", () => {
  let v = durumAyarla(bos(), DERS, "ogrendim", null, an("2026-11-21T10:00:00"));
  v = durumAyarla(v, SARKI, "devam", "Riff", an("2026-11-21T11:00:00"));
  const f = { tur: "" as const, gitar: "", q: "", sira: "son" as const };
  assert.deepEqual(listele(v, { ...f, durum: "devam" }).map((k) => k.id), [SARKI.id]);
  assert.deepEqual(listele(v, { ...f, durum: "ogrendim" }).map((k) => k.id), [DERS.id]);
  assert.deepEqual(listele(v, { ...f, durum: "tumu", q: "metallica" }).map((k) => k.id), [SARKI.id]);
  assert.equal(v.kayitlar[SARKI.id].kisim, "Riff");
});

/* ── Yeni kural: işaretsiz kayıt oluşmaz ── */

test("işaretsiz kayıt oluşmaz: çalmak (sureEkle), Songsterr'de açmak (kayitAc) ve 0 sn deftere kayıt açmaz", () => {
  const v0 = bos();
  assert.equal(sureEkle(v0, DERS, 600, { konum: 4 }, an("2026-11-21T10:00:00")), v0, "çalınan süre kayıt açmaz");
  assert.equal(kayitAc(v0, SARKI, an("2026-11-21T10:00:00")), v0, "Songsterr'de açmak kayıt açmaz");
  assert.equal(durumAyarla(v0, DERS, null), v0, "işaret kaldırmak kayıt açmaz");
  assert.deepEqual(Object.keys(v0.kayitlar), []);
  // İşaretlendikten sonra süre ve kaldığın yer güncellenir
  let v = durumAyarla(v0, DERS, "devam", "B", an("2026-11-21T10:00:00"));
  v = sureEkle(v, DERS, 120, { konum: 9, hiz: 80 }, an("2026-11-21T10:05:00"));
  assert.equal(v.kayitlar[DERS.id].toplamSure, 120);
  assert.equal(v.kayitlar[DERS.id].konum, 9);
});

test("son işaret kalkınca kayıt defterden çıkar; başka işaret varsa kalır", () => {
  let v = durumAyarla(bos(), DERS, "devam", null, an("2026-11-21T10:00:00"));
  v = durumAyarla(v, DERS, null, undefined, an("2026-11-21T10:01:00"));
  assert.equal(v.kayitlar[DERS.id], undefined, "yalnız durum vardı: çıkar");
  v = listeyeEkle(bos(), DERS, an("2026-11-21T10:00:00"));
  v = durumAyarla(v, DERS, "ogrendim", null, an("2026-11-21T10:01:00"));
  v = durumAyarla(v, DERS, null, undefined, an("2026-11-21T10:02:00"));
  assert.ok(v.kayitlar[DERS.id], "listede: kalır");
  assert.equal(v.kayitlar[DERS.id].durum, null);
  v = listedenCikar(v, DERS.id);
  assert.equal(v.kayitlar[DERS.id], undefined);
  assert.deepEqual(v.liste, []);
});

test("Takvime al: seçilen güne plan düşer, gün ve en yakın plan bulunur, plan kaldırılınca kayıt çıkar", () => {
  let v = planaEkle(bos(), SARKI, "2026-11-28", an("2026-11-21T10:00:00"));
  v = planaEkle(v, SARKI, "2026-11-23", an("2026-11-21T10:00:00"));
  v = planaEkle(v, SARKI, "2026-11-23", an("2026-11-21T10:00:00"));
  v = planaEkle(v, SARKI, "bozuk", an("2026-11-21T10:00:00"));
  assert.deepEqual(v.kayitlar[SARKI.id].planli, ["2026-11-23", "2026-11-28"]);
  assert.equal(isaretli(v, v.kayitlar[SARKI.id]), true);
  assert.deepEqual(gununPlanlari(v, "2026-11-23").map((k) => k.id), [SARKI.id]);
  assert.equal(yakinPlan(v.kayitlar[SARKI.id], "2026-11-24"), "2026-11-28");
  assert.equal(yakinPlan(v.kayitlar[SARKI.id], "2026-12-01"), "2026-11-28", "hepsi geçmişse son plan");
  const f = { tur: "" as const, gitar: "", q: "", sira: "son" as const };
  assert.deepEqual(listele(v, { ...f, durum: "takvim" }).map((k) => k.id), [SARKI.id]);
  v = plandanKaldir(v, SARKI.id, "2026-11-23");
  v = plandanKaldir(v, SARKI.id, "2026-11-28");
  assert.equal(v.kayitlar[SARKI.id], undefined);
});

test("Çalışma listem: sona eklenir, tekrar eklenmez, sıra taşınır, Listem filtresi liste sırasını izler", () => {
  const C: KayitBilgisi = { ...SARKI, id: "sarki:songsterr/AC/DC|Back in Black", baslik: "Back in Black", altBaslik: "AC/DC" };
  let v = listeyeEkle(bos(), DERS, an("2026-11-21T10:00:00"));
  v = listeyeEkle(v, SARKI, an("2026-11-21T10:01:00"));
  v = listeyeEkle(v, C, an("2026-11-21T10:02:00"));
  v = listeyeEkle(v, SARKI, an("2026-11-21T10:03:00"));
  assert.deepEqual(v.liste, [DERS.id, SARKI.id, C.id]);
  v = listeTasi(v, C.id, 0);
  assert.deepEqual(v.liste, [C.id, DERS.id, SARKI.id]);
  v = listeTasi(v, C.id, 99);
  assert.deepEqual(v.liste, [DERS.id, SARKI.id, C.id]);
  const f = { tur: "" as const, gitar: "", q: "", sira: "son" as const };
  assert.deepEqual(listele(v, { ...f, durum: "liste" }).map((k) => k.id), v.liste);
});

test("bilinenKisim: Profil › Bildiğim şarkılar kısımları; kayıt yoksa açılmaz", () => {
  assert.deepEqual(bilinenKisim(bos(), SARKI.id, "Riff", true), bos());
  let v = durumAyarla(bos(), SARKI, "ogrendim", null, an("2026-11-21T10:00:00"));
  v = bilinenKisim(v, SARKI.id, "Riff", true);
  v = bilinenKisim(v, SARKI.id, "1. Solo", true);
  v = bilinenKisim(v, SARKI.id, "Riff", true);
  v = bilinenKisim(v, SARKI.id, "Köprü (serbest)", true);
  v = bilinenKisim(v, SARKI.id, "1. Solo", false);
  assert.deepEqual(v.kayitlar[SARKI.id].kisimlar, ["Riff", "Köprü (serbest)"]);
});

test("göç v1 → v2: işaretsiz otomatik kayıtlar temizlenir, işaretliler, serbest notlar ve notlu kayıtlar kalır", () => {
  const v1 = {
    surum: 1,
    kayitlar: {
      "egzersiz:legato/1.1": { id: "egzersiz:legato/1.1", tur: "egzersiz", baslik: "Otomatik", durum: null, oturumlar: [{ tarih: "2026-11-20", sure: 300 }] },
      "sarki:songsterr/Nirvana|Come As You Are": { id: "sarki:songsterr/Nirvana|Come As You Are", tur: "sarki", baslik: "Come As You Are", durum: null, acildi: "2026-11-20T10:00:00.000Z" },
      "egzersiz:sweep/2.1": { id: "egzersiz:sweep/2.1", tur: "egzersiz", baslik: "İşaretli", durum: "devam" },
      "sarki:kutuphane/x": { id: "sarki:kutuphane/x", tur: "sarki", baslik: "Notlu", durum: null, not: "90 BPM'de temiz" },
      "serbest:abc": { id: "serbest:abc", tur: "serbest", baslik: "Serbest", durum: null },
    },
    gitarlar: [],
  };
  const v = goc(v1);
  assert.equal(v.surum, 2);
  assert.deepEqual(Object.keys(v.kayitlar).sort(), ["egzersiz:sweep/2.1", "sarki:kutuphane/x", "serbest:abc"]);
  assert.deepEqual(v.liste, []);
  assert.deepEqual(v.kayitlar["egzersiz:sweep/2.1"].planli, []);
});

test("gitarSil: kayıt seçimi kalkar, varsayılan sıradakine geçer, geçmiş korunur", () => {
  let r = gitarEkle(bos(), "A");
  const g1 = r.id;
  r = gitarEkle(r.veri, "B");
  let v = sureEkle(isaretle(r.veri, DERS), DERS, 60, { gitar: g1 }, an("2026-11-21T10:00:00"));
  v = gitarSil(v, g1);
  assert.equal(v.varsayilanGitar, r.id);
  assert.equal(v.kayitlar[DERS.id].gitar, null);
  assert.equal(v.kayitlar[DERS.id].oturumlar[0].gitar, g1);
  assert.equal(gitarBasina(v, "2026-11-21", "2026-11-21").get(g1), 60);
});

test("haftaOzeti: plan hedefi, yüzde ve hedef serisi (dinlenme günü seriyi bozmaz)", () => {
  // Hafta: 16–22 Kasım 2026; bugün cumartesi 21 Kasım 00:30
  let v = isaretle(planAyarla(bos(), 3, { hedefDk: 0 }), DERS); // perşembe dinlenme
  v = sureEkle(v, DERS, 25 * 60, {}, an("2026-11-18T20:00:00")); // çarşamba 25 dk
  v = sureEkle(v, DERS, 20 * 60, {}, an("2026-11-20T23:30:00")); // cuma 20 dk (23:30)
  const ilerleme = new Map([["2026-11-17", 5 * 60]]); // salı yalnız ilerleme kaydında 5 dk
  const o = haftaOzeti(v, ilerleme, an("2026-11-21T00:30:00"), 20);
  assert.deepEqual(o.gunler.map((g) => g.sn / 60), [0, 5, 25, 0, 20, 0, 0]);
  assert.equal(o.hedefToplam, 6 * 20 * 60);
  assert.equal(o.yuzde, Math.round((50 / 120) * 100));
  assert.equal(o.seri, 2, "cuma + (perşembe dinlenme) + çarşamba; salı 5 dk < 20");
});

test("kademe: 0 boş, 5 kademe", () => {
  assert.deepEqual([0, 30, 9 * 60, 10 * 60, 25 * 60, 45 * 60, 90 * 60].map(kademe), [0, 1, 1, 2, 3, 4, 5]);
});

test("birlestir: aynı kayıtta son güncellenen kalır, yeni kayıtlar eklenir", () => {
  const a = sureEkle(isaretle(bos(), DERS), DERS, 60, {}, an("2026-11-20T10:00:00"));
  let b = sureEkle(isaretle(bos(), DERS, "2026-11-21T09:00:00"), DERS, 300, {}, an("2026-11-21T10:00:00"));
  b = elleEkle(b, { baslik: "Serbest", sure: 120 }, an("2026-11-21T11:00:00")).veri;
  const m = birlestir(a, b);
  assert.equal(m.kayitlar[DERS.id].toplamSure, 300);
  assert.equal(Object.keys(m.kayitlar).length, 2);
});

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
