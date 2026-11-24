// Çalışma Defteri veri katmanının sınaması: göç, süre hesabı, çift saymama, yerel tarih (gece yarısı sınırı).
// Çalıştırma: npm run test:defter
// Saat dilimi İstanbul'a sabitlenir (kullanıcının bilgisayarı); gün anahtarları yerel tarihle üretilmeli.
process.env.TZ = "Europe/Istanbul";

import assert from "node:assert/strict";
import { register } from "node:module";
import {
  birlestir, bos, disaAktar, durumAyarla, elleEkle, gitarBasina, gitarEkle, gitarSil, goc, gunToplami, gunlukToplamlar, gununOturumlari,
  haftaBasi, haftaOzeti, iceAktarMetin, kademe, kayitAc, kayitSil, konumYaz, listele, ogrenecekKayitlari, ogrenecekTasi, ogreneceklerdenCikar, ogreneceklereEkle, olcumEkle,
  planAyarla, planlananlar, siradakiPlan, sureEkle, takvimdenCikar, takvimeEkle, yerelGun, type KayitBilgisi,
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
const { gunler, seri } = await import("../src/lib/oyun.ts");

let gecen = 0;
const testler: [string, () => void][] = [];
const test = (ad: string, f: () => void) => testler.push([ad, f]);

const DERS: KayitBilgisi = { id: "egzersiz:alternatif-pena/1.1", tur: "egzersiz", baslik: "Tek tel", altBaslik: "Alternatif Pena", href: "/calis/alternatif-pena/1.1" };
const SARKI: KayitBilgisi = { id: "sarki:songsterr/Metallica|Enter Sandman", tur: "sarki", baslik: "Enter Sandman", altBaslik: "Metallica", href: "https://www.songsterr.com/" };
const an = (s: string) => new Date(s); // yerel saat (TZ=Europe/Istanbul)

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
  const p = { exercises: {}, quizBest: {}, steps: {}, teori: {}, sessions: [{ date: tarih23, exerciseId: "legato/1", seconds: 1200, bpm: 60 }, { date: tarih00, exerciseId: "legato/1", seconds: 300, bpm: 60 }] };
  const g = gunler(p);
  assert.equal(g.get("2026-11-20")?.egzersiz, 1200);
  assert.equal(g.get("2026-11-21")?.egzersiz, 300);
  const kural = { egzersizDk: 20, serbestDk: 10, teoriAdim: 1, kalkanGun: 3, kalkanMaks: 2, oyMaks: 10 };
  // 21 Kasım 00:30: dün (20) Egzersiz görevi tamam, bugün henüz değil → seri 1, bozulmaz
  assert.equal(saatiDondur("2026-11-21T00:30:00+03:00", () => seri(p, kural)).seri, 1);
});

test("sureEkle: 23:30 ve 00:30 oturumları ayrı günlere düşer, birleşmez", () => {
  let v = sureEkle(bos(), DERS, 600, {}, an("2026-11-20T23:30:00"));
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
  let v = bos();
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
  let v = ilk.veri;
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
  let v = sureEkle(v0, DERS, 10, { konum: 3 }, an("2026-11-21T10:00:00"));
  v = sureEkle(v, DERS, 0, { konum: 9, aralik: [8, 11] }, an("2026-11-21T10:01:00"));
  assert.equal(v.kayitlar[DERS.id].konum, 9);
  assert.deepEqual(v.kayitlar[DERS.id].aralik, [8, 11]);
  assert.equal(v.kayitlar[DERS.id].toplamSure, 10);
});

/* ── Çift saymama ── */

test("gunToplami: ilerleme kaydı ve defterin ölçülen süresi iki kez sayılmaz, elle süre eklenir", () => {
  // Uygulamada 20 dk çalındı: aynı saniyeler ilerleme kaydına (1200) ve deftere (1200) yazıldı
  let v = sureEkle(bos(), DERS, 1200, {}, an("2026-11-21T10:00:00"));
  // Songsterr'de 10 dk elle girildi
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
  let v = kayitAc(bos(), SARKI, an("2026-11-21T09:00:00"));
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
    { id: "sarki:eski", baslik: "Yalnız toplam", toplamSure: 300, guncellendi: "2026-10-10T08:00:00.000Z" },
    { baslik: "kimliksiz" },
    "çöp",
  ];
  const v = goc(v0);
  assert.equal(v.surum, 1);
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

test("goc v1 → v1: dışa aktar / içe aktar gidiş-dönüş kayıpsız", () => {
  let v = gitarEkle(bos(), "Les Paul", "elektro").veri;
  v = sureEkle(v, DERS, 125, { kisim: "B", konum: 18, hiz: 80, tempo: 96, aralik: [16, 23] }, an("2026-11-21T10:00:00"));
  v = durumAyarla(v, DERS, "devam", "B", an("2026-11-21T10:05:00"));
  v = planAyarla(v, 1, { hedefDk: 30, not: "sweep 4.1 + Metallica riff" });
  v = takvimeEkle(v, SARKI, "2026-11-28", an("2026-11-21T10:06:00"));
  v = ogreneceklereEkle(v, SARKI, an("2026-11-21T10:07:00"));
  const geri = iceAktarMetin(disaAktar(v));
  assert.deepEqual(geri, v);
  assert.throws(() => iceAktarMetin("{bozuk"), /JSON/);
  assert.throws(() => iceAktarMetin('{"baska":1}'), /yedeği değil/);
});

/* ── Diğer ── */

test("durumAyarla, listele: Öğreniyorum yalnız turuncuları, Öğrendiklerim yeşilleri, Tümü işaretsizleri de gösterir", () => {
  const ESKI: KayitBilgisi = { id: "egzersiz:eski/1", tur: "egzersiz", baslik: "Eski otomatik kayıt", altBaslik: "", href: "/calis/eski/1" };
  let v = durumAyarla(bos(), DERS, "ogrendim", null, an("2026-11-21T10:00:00"));
  v = durumAyarla(v, SARKI, "devam", "Riff", an("2026-11-21T11:00:00"));
  v = sureEkle(v, ESKI, 60, {}, an("2026-11-21T09:00:00")); // eski sürümün kendiliğinden açtığı, işaretsiz kayıt
  const f = { tur: "" as const, gitar: "", q: "", sira: "son" as const };
  assert.deepEqual(listele(v, { ...f, durum: "devam" }).map((k) => k.id), [SARKI.id]);
  assert.deepEqual(listele(v, { ...f, durum: "ogrendim" }).map((k) => k.id), [DERS.id]);
  assert.deepEqual(listele(v, { ...f, durum: "tumu", q: "metallica" }).map((k) => k.id), [SARKI.id]);
  assert.equal(listele(v, { ...f, durum: "tumu" }).length, 3, "işaretsiz eski kayıt silinmez, Tümü'nde görünür");
});

/* ── Kendiliğinden ekleme yok ── */

test("kayitAc ve olcumEkle: defterde olmayan kayıt açılmaz (açmak ya da çalmak deftere yazmaz)", () => {
  const v0 = bos();
  assert.equal(kayitAc(v0, SARKI, an("2026-11-21T10:00:00")), v0);
  assert.equal(olcumEkle(v0, DERS, 120, { konum: 4, hiz: 80 }, an("2026-11-21T10:00:00")), v0);
  assert.equal(Object.keys(v0.kayitlar).length, 0);
});

test("olcumEkle: kullanıcı deftere aldıktan sonra ölçülen süre ve kaldığın yer yazılır", () => {
  let v = durumAyarla(bos(), DERS, "devam", null, an("2026-11-21T10:00:00"));
  v = olcumEkle(v, DERS, 120, { konum: 4, hiz: 80, elle: true }, an("2026-11-21T10:05:00"));
  const k = v.kayitlar[DERS.id];
  assert.equal(k.toplamSure, 120);
  assert.equal(k.konum, 4);
  assert.equal(k.oturumlar[0].elle, undefined, "oynatıcı ölçümü her zaman 'ölçüldü' sayılır");
  v = kayitAc(v, DERS, an("2026-11-21T10:06:00"));
  assert.ok(v.kayitlar[DERS.id].acildi, "var olan kayıtta açılış işaretlenir");
});

/* ── Takvime al ── */

test("takvimeEkle / takvimdenCikar: gün eklenir, tekrar etmez, sıralı kalır; planlananlar güne göre", () => {
  let v = takvimeEkle(bos(), SARKI, "2026-11-28", an("2026-11-21T10:00:00"));
  assert.ok(v.kayitlar[SARKI.id], "Takvime al kayıt açar (kullanıcı isteği)");
  v = takvimeEkle(v, SARKI, "2026-11-25");
  const ayni = takvimeEkle(v, SARKI, "2026-11-25");
  assert.equal(ayni, v, "aynı gün ikinci kez eklenmez");
  assert.equal(takvimeEkle(v, SARKI, "28.11.2026"), v, "geçersiz tarih yok sayılır");
  assert.deepEqual(v.kayitlar[SARKI.id].takvim, ["2026-11-25", "2026-11-28"]);
  v = takvimeEkle(v, DERS, "2026-11-25");
  assert.deepEqual(planlananlar(v, "2026-11-25").map((k) => k.id).sort(), [DERS.id, SARKI.id].sort());
  assert.equal(siradakiPlan(v.kayitlar[SARKI.id], "2026-11-26"), "2026-11-28");
  assert.equal(siradakiPlan(v.kayitlar[SARKI.id], "2026-12-01"), "2026-11-28", "gelecek plan yoksa son plan");
  v = takvimdenCikar(v, SARKI.id, "2026-11-25");
  assert.deepEqual(v.kayitlar[SARKI.id].takvim, ["2026-11-28"]);
  v = takvimdenCikar(v, SARKI.id);
  assert.deepEqual(v.kayitlar[SARKI.id].takvim, []);
  const f = { tur: "" as const, gitar: "", q: "", sira: "son" as const };
  assert.deepEqual(listele(v, { ...f, durum: "takvim" }).map((k) => k.id), [DERS.id]);
});

/* ── Kütüphaneye ekle (Öğreneceklerim) ── */

test("ogreneceklereEkle / ogrenecekTasi / ogreneceklerdenCikar: sıralı liste", () => {
  const C: KayitBilgisi = { id: "sarki:kutuphane/c", tur: "sarki", baslik: "C", altBaslik: "", href: "/kutuphane/c" };
  let v = ogreneceklereEkle(bos(), DERS);
  v = ogreneceklereEkle(v, SARKI);
  v = ogreneceklereEkle(v, C);
  assert.equal(ogreneceklereEkle(v, SARKI), v, "ikinci kez eklenmez");
  assert.deepEqual(v.ogrenecekler, [DERS.id, SARKI.id, C.id]);
  v = ogrenecekTasi(v, C.id, -1);
  assert.deepEqual(v.ogrenecekler, [DERS.id, C.id, SARKI.id]);
  assert.equal(ogrenecekTasi(v, DERS.id, -1), v, "en üstteki yukarı taşınamaz");
  assert.equal(ogrenecekTasi(v, SARKI.id, 1), v, "en alttaki aşağı taşınamaz");
  const f = { tur: "" as const, gitar: "", q: "", sira: "son" as const };
  assert.deepEqual(listele(v, { ...f, durum: "ogrenecek" }).map((k) => k.id), [DERS.id, C.id, SARKI.id], "liste kullanıcının sırasıyla");
  v = ogreneceklerdenCikar(v, C.id);
  assert.deepEqual(ogrenecekKayitlari(v).map((k) => k.id), [DERS.id, SARKI.id]);
  assert.ok(v.kayitlar[C.id], "listeden çıkarmak kaydı silmez");
  v = kayitSil(v, DERS.id);
  assert.deepEqual(v.ogrenecekler, [SARKI.id], "silinen kayıt listeden de çıkar");
});

test("goc: eski defter (takvim ve Öğreneceklerim yok) bozulmadan açılır; bozuk liste temizlenir", () => {
  const eski = { surum: 1, kayitlar: { [DERS.id]: { id: DERS.id, tur: "egzersiz", baslik: "Tek tel", durum: "devam", oturumlar: [{ tarih: "2026-11-20", sure: 90 }] } }, gitarlar: [] };
  const v = goc(eski);
  assert.deepEqual(v.kayitlar[DERS.id].takvim, []);
  assert.deepEqual(v.ogrenecekler, []);
  assert.equal(v.kayitlar[DERS.id].toplamSure, 90);
  assert.equal(v.kayitlar[DERS.id].durum, "devam");
  const v2 = goc({ ...eski, kayitlar: { [DERS.id]: { ...eski.kayitlar[DERS.id], takvim: ["2026-11-28", "bozuk", "2026-11-25", "2026-11-28"] } }, ogrenecekler: [DERS.id, "yok:1", DERS.id, 5] });
  assert.deepEqual(v2.kayitlar[DERS.id].takvim, ["2026-11-25", "2026-11-28"]);
  assert.deepEqual(v2.ogrenecekler, [DERS.id]);
});

test("gitarSil: kayıt seçimi kalkar, varsayılan sıradakine geçer, geçmiş korunur", () => {
  let r = gitarEkle(bos(), "A");
  const g1 = r.id;
  r = gitarEkle(r.veri, "B");
  let v = sureEkle(r.veri, DERS, 60, { gitar: g1 }, an("2026-11-21T10:00:00"));
  v = gitarSil(v, g1);
  assert.equal(v.varsayilanGitar, r.id);
  assert.equal(v.kayitlar[DERS.id].gitar, null);
  assert.equal(v.kayitlar[DERS.id].oturumlar[0].gitar, g1);
  assert.equal(gitarBasina(v, "2026-11-21", "2026-11-21").get(g1), 60);
});

test("haftaOzeti: plan hedefi, yüzde ve hedef serisi (dinlenme günü seriyi bozmaz)", () => {
  // Hafta: 16–22 Kasım 2026; bugün cumartesi 21 Kasım 00:30
  let v = planAyarla(bos(), 3, { hedefDk: 0 }); // perşembe dinlenme
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
  const a = sureEkle(bos(), DERS, 60, {}, an("2026-11-20T10:00:00"));
  let b = sureEkle(bos(), DERS, 300, {}, an("2026-11-21T10:00:00"));
  b = elleEkle(b, { baslik: "Serbest", sure: 120 }, an("2026-11-21T11:00:00")).veri;
  const m = birlestir(a, b);
  assert.equal(m.kayitlar[DERS.id].toplamSure, 300);
  assert.equal(Object.keys(m.kayitlar).length, 2);
});

test("birlestir: Öğreneceklerim yerel sırası korunur, yedekteki yeniler sona eklenir", () => {
  const a = ogreneceklereEkle(bos(), DERS);
  const b = ogreneceklereEkle(ogreneceklereEkle(bos(), SARKI), DERS);
  assert.deepEqual(birlestir(a, b).ogrenecekler, [DERS.id, SARKI.id]);
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
