// Müzik Teorisi derslerinin bağımsız doğrulaması: şemalardaki nota adları, aralıklar, akor şekilleri,
// gam kutuları, porte notaları, tablolar ve dinleme örnekleri buradaki kendi hesaplarla karşılaştırılır.
// Ders verisini üreten yardımcılar (src/content/teori/yardim.ts) KULLANILMAZ: akort, yazım ve formüller
// bu dosyada ayrıca tanımlıdır.
// Çalıştırma: node --experimental-strip-types scripts/teori-dogrula.mjs   (ya da npm run teori-dogrula)
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { TUM_DERSLER } from "../src/content/teori/hepsi.ts";
import { BESLILER } from "../src/content/teori/cember.ts";
import { ARMONI_UNITELERI, OKUMA_KONULARI, SEVIYELER, SIRA } from "../src/content/teori/mufredat.ts";
import { GAMLAR, KOKLER, gamNotalari, konumNotalari, konumSayisi } from "../src/lib/gamlar.ts";

// ── Bağımsız müzik hesabı ────────────────────────────────────────────────────
const HARFLER = "CDEFGAB";
const DOGAL_SES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const TR = { Do: "C", Re: "D", Mi: "E", Fa: "F", Sol: "G", La: "A", Si: "B" };
// Standart akort: telin açık sesi (MIDI). 1. tel E4 = 64 … 6. tel E2 = 40
const AKORT = { 1: 64, 2: 59, 3: 55, 4: 50, 5: 45, 6: 40 };
const mod12 = (n) => ((n % 12) + 12) % 12;

/** "F#", "Bb", "Do#", "Si♭", "E𝄫" → { harf, ariza } */
function notaCoz(ad) {
  const s = String(ad).trim().replace(/♭/g, "b").replace(/♯/g, "#").replace(/𝄫/g, "bb").replace(/𝄪/g, "##");
  let m = /^(Do|Re|Mi|Fa|Sol|La|Si)(#{1,2}|b{1,2})?$/.exec(s);
  if (m) return { harf: TR[m[1]], ariza: m[2] ? (m[2][0] === "#" ? m[2].length : -m[2].length) : 0 };
  m = /^([A-G])(#{1,2}|b{1,2})?$/.exec(s);
  if (m) return { harf: m[1], ariza: m[2] ? (m[2][0] === "#" ? m[2].length : -m[2].length) : 0 };
  return null;
}
const sesSinifi = (ad) => {
  const n = notaCoz(ad);
  if (!n) throw new Error(`çözülemeyen nota adı "${ad}"`);
  return mod12(DOGAL_SES[n.harf] + n.ariza);
};
/** Bilimsel ad → MIDI ("C4" = 60) */
function bilimsel(ad) {
  const m = /^([A-G])(#{1,2}|b{1,2})?(-?\d)$/.exec(ad);
  if (!m) throw new Error(`bilimsel ad değil: "${ad}"`);
  const a = m[2] ? (m[2][0] === "#" ? m[2].length : -m[2].length) : 0;
  return 12 * (Number(m[3]) + 1) + DOGAL_SES[m[1]] + a;
}
const perdeSesi = (tel, perde) => AKORT[tel] + perde;

// Aralık simgesi → yarım ses (sayı = harf adımı + 1)
const BUYUK = { 1: 0, 2: 2, 3: 4, 4: 5, 5: 7, 6: 9, 7: 11, 8: 12 };
function simgeYarim(simge) {
  const m = /^(bb|b|#)?(\d{1,2})$/.exec(String(simge).replace(/♭/g, "b").replace(/♯/g, "#").replace(/𝄫/g, "bb"));
  if (!m) throw new Error(`aralık simgesi değil: "${simge}"`);
  const no = Number(m[2]);
  const taban = no <= 8 ? BUYUK[no] : 12 + BUYUK[no - 7];
  return taban + (m[1] === "#" ? 1 : m[1] === "b" ? -1 : m[1] === "bb" ? -2 : 0);
}
const simgeSayi = (simge) => Number(String(simge).replace(/[^\d]/g, ""));

// Formül ve akor türleri (bağımsız tanım)
const AKOR_TURU = [
  ["maj9", "1 3 5 7 9"], ["m11", "1 b3 5 b7 9 11"], ["m9", "1 b3 5 b7 9"], ["7b9", "1 3 5 b7 b9"], ["7#9", "1 3 5 b7 #9"], ["7#11", "1 3 5 b7 9 #11"],
  ["13", "1 3 5 b7 9 13"], ["9", "1 3 5 b7 9"],
  ["maj7", "1 3 5 7"], ["m7b5", "1 b3 b5 b7"], ["mMaj7", "1 b3 5 7"], ["dim7", "1 b3 b5 bb7"], ["m7", "1 b3 5 b7"], ["m6", "1 b3 5 6"],
  ["7", "1 3 5 b7"], ["6", "1 3 5 6"], ["sus2", "1 2 5"], ["sus4", "1 4 5"], ["dim", "1 b3 b5"], ["°", "1 b3 b5"], ["aug", "1 3 #5"],
  ["+", "1 3 #5"], ["5", "1 5"], ["m", "1 b3 5"], ["", "1 3 5"],
];
/** "F#m7" → { kok: "F#", formul, bas } */
function akorCoz(ad) {
  const [govde, bas] = String(ad).replace(/♭/g, "b").replace(/♯/g, "#").split("/");
  const m = /^([A-G](?:#|b)?)(.*)$/.exec(govde);
  if (!m) throw new Error(`akor adı değil: "${ad}"`);
  const tur = AKOR_TURU.find(([ek]) => ek === m[2]);
  if (!tur) throw new Error(`bilinmeyen akor türü: "${ad}"`);
  return { kok: m[1], formul: tur[1], bas };
}
const formulSiniflari = (kok, formul) => new Set(formul.split(" ").map((s) => mod12(sesSinifi(kok) + simgeYarim(s))));

/** Kökten aralık simgesiyle doğru yazılmış nota (harf adımı korunur) */
function yazilis(kok, simge) {
  const k = notaCoz(kok);
  const harf = HARFLER[(HARFLER.indexOf(k.harf) + simgeSayi(simge) - 1) % 7];
  let a = mod12(sesSinifi(kok) + simgeYarim(simge)) - DOGAL_SES[harf];
  if (a > 6) a -= 12;
  if (a < -6) a += 12;
  return harf + (a > 0 ? "#".repeat(a) : "b".repeat(-a));
}
const ayniYazim = (a, b) => {
  const x = notaCoz(a);
  const y = notaCoz(b);
  return x && y && x.harf === y.harf && x.ariza === y.ariza;
};
const MAJOR = "1 2 3 4 5 6 7";
const AD = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

/**
 * Roma rakamı → akor (bağımsız): kök, aynı kökteki majör gamın derecesine göre (♭/♯ öneki kromatik), tür büyük/küçük
 * harften ve ekten (°, ø, +, 7, maj7). İkincil: "V7/ii" = ii akorunun kökünü ton sayan V7. Dönüş: kök yazımı ve ses sınıfları.
 */
function romenCoz(ton, romen) {
  const r = String(romen).replace(/♭/g, "b").replace(/♯/g, "#").trim();
  if (r.includes("/")) {
    const [ust, alt] = r.split("/");
    return romenCoz(romenCoz(ton, alt).kok, ust);
  }
  const m = /^(b|#)?(VII|VI|IV|V|III|II|I|vii|vi|iv|v|iii|ii|i)(°|ø|\+)?(maj7|7)?$/.exec(r);
  if (!m) throw new Error(`Roma rakamı okunamadı: ${romen}`);
  const derece = ["I", "II", "III", "IV", "V", "VI", "VII"].indexOf(m[2].toUpperCase());
  let kok = yazilis(ton, MAJOR.split(" ")[derece]);
  if (m[1]) {
    const n = notaCoz(kok);
    const a = n.ariza + (m[1] === "b" ? -1 : 1);
    kok = n.harf + (a > 0 ? "#".repeat(a) : "b".repeat(-a));
  }
  const buyuk = m[2] === m[2].toUpperCase();
  const isaret = m[3];
  let formul = isaret === "°" ? "1 b3 b5" : isaret === "ø" ? "1 b3 b5" : isaret === "+" ? "1 3 #5" : buyuk ? "1 3 5" : "1 b3 5";
  if (m[4] === "maj7") formul += " 7";
  else if (m[4] === "7") formul += isaret === "°" ? " bb7" : " b7";
  else if (isaret === "ø") formul += " b7";
  return { kok, formul, siniflar: formulSiniflari(kok, formul) };
}

// ── Denetim kaydı ────────────────────────────────────────────────────────────
const hatalar = [];
let denetim = 0;
const ozet = [];
function bekle(kosul, yer, mesaj) {
  denetim++;
  if (!kosul) hatalar.push(`${yer}: ${mesaj}`);
}
function dene(yer, fn) {
  try {
    fn();
  } catch (e) {
    denetim++;
    hatalar.push(`${yer}: ${e.message}`);
  }
}

// ── Görseller ────────────────────────────────────────────────────────────────
function sapDenetle(g, yer) {
  const [bas, son] = g.perde;
  bekle(bas >= 0 && son >= bas && son <= 22, yer, `perde aralığı ${bas}-${son}`);
  const kokPc = g.kok ? sesSinifi(g.kok) : null;
  g.noktalar.forEach((n, i) => {
    const y = `${yer} nokta ${i + 1} (${n.t}. tel ${n.p}. perde)`;
    bekle(n.t >= 1 && n.t <= 6, y, "tel 1-6 dışında");
    bekle(n.p >= bas && n.p <= son, y, `perde ${bas}-${son} aralığının dışında`);
    const ses = mod12(perdeSesi(n.t, n.p));
    if (g.etiket === "nota" && n.e) bekle(sesSinifi(n.e) === ses, y, `etiket "${n.e}" ama ses ${AD[ses]}`);
    // Serbest etiket bilimsel adsa (A3) tam yükseklik denetlenir
    if (g.etiket === "serbest" && n.e && /^[A-G](#|b)?\d$/.test(n.e)) bekle(perdeSesi(n.t, n.p) === bilimsel(n.e), y, `etiket ${n.e} ama MIDI ${perdeSesi(n.t, n.p)}`);
    if (g.etiket === "aralik" && n.e) {
      bekle(kokPc !== null, y, "aralık etiketi için kök yok");
      bekle(mod12(ses - kokPc) === mod12(simgeYarim(n.e)), y, `etiket "${n.e}" ama köke uzaklık ${mod12(ses - kokPc)} yarım ses`);
    }
    if (n.k === "kok" && kokPc !== null) bekle(ses === kokPc, y, "kök işaretli ama kök değil");
    if (g.kalip && kokPc !== null) bekle(g.kalip.map(mod12).includes(mod12(ses - kokPc)), y, "kalıp dışında nota");
  });
  if (g.tam && g.kalip && kokPc !== null) {
    for (const t of g.teller ?? [1, 2, 3, 4, 5, 6])
      for (let p = bas; p <= son; p++) {
        if (!g.kalip.map(mod12).includes(mod12(perdeSesi(t, p) - kokPc))) continue;
        bekle(g.noktalar.some((n) => n.t === t && n.p === p), yer, `eksik nota: ${t}. tel ${p}. perde`);
      }
  }
  for (const [a, b] of g.baglar ?? []) bekle(g.noktalar[a] && g.noktalar[b], yer, `bağ ${a}-${b} geçersiz`);
  // Bağlı noktalar oktav ya da (etiketleri aynıysa) aynı ses sınıfı olmalı
  for (const [a, b] of g.baglar ?? []) {
    const x = g.noktalar[a];
    const y = g.noktalar[b];
    if (x?.e && y?.e && x.e === y.e) bekle(mod12(perdeSesi(x.t, x.p) - perdeSesi(y.t, y.p)) === 0, yer, `bağlı ${x.e} notaları aynı ses değil`);
  }
}

function akorDenetle(a, yer) {
  const perdeler = a.sekil.split(" ");
  bekle(perdeler.length === 6, yer, `${a.ad}: 6 tel yerine ${perdeler.length}`);
  const sesler = perdeler.map((f, i) => (f === "x" ? null : perdeSesi(6 - i, Number(f)))).filter((x) => x !== null);
  const siniflar = new Set(sesler.map(mod12));
  const beklenen = formulSiniflari(a.kok, a.formul);
  bekle([...siniflar].every((s) => beklenen.has(s)) && [...beklenen].every((s) => siniflar.has(s)), yer, `${a.ad} (${a.sekil}): notalar ${[...siniflar]} formül ${[...beklenen]}`);
  // Ad ile kök/formül uyumu
  const c = akorCoz(a.ad);
  bekle(sesSinifi(c.kok) === sesSinifi(a.kok), yer, `${a.ad}: ad kökü ${c.kok} ≠ ${a.kok}`);
  bekle(c.formul === a.formul, yer, `${a.ad}: addan formül ${c.formul} ≠ ${a.formul}`);
  const enPes = Math.min(...sesler);
  bekle(mod12(enPes) === sesSinifi(a.bas ?? a.kok), yer, `${a.ad}: basta ${mod12(enPes)} (beklenen ${a.bas ?? a.kok})`);
  if (a.parmak) {
    const pr = a.parmak.split(" ").map(Number);
    bekle(pr.length === 6, yer, `${a.ad}: parmak sayısı`);
    perdeler.forEach((f, i) => bekle((f === "x" || f === "0") === (pr[i] === 0), yer, `${a.ad}: ${6 - i}. tel parmak/perde uyumsuz`));
    // Aynı parmak farklı perdelerde olamaz
    for (const n of [1, 2, 3, 4]) {
      const fs = new Set(perdeler.filter((_, i) => pr[i] === n).map(Number));
      bekle(fs.size <= 1, yer, `${a.ad}: ${n}. parmak birden çok perdede`);
    }
  }
}

function adimDenetle(g, yer) {
  bekle(g.adimlar.length === g.notalar.length - 1, yer, "adım sayısı");
  g.adimlar.forEach((a, i) => {
    const fark = mod12(sesSinifi(g.notalar[i + 1]) - sesSinifi(g.notalar[i]));
    bekle(fark === { T: 2, Y: 1, A: 3 }[a], yer, `${g.notalar[i]}→${g.notalar[i + 1]} = ${fark} yarım ses, etiket ${a}`);
    const h1 = HARFLER.indexOf(notaCoz(g.notalar[i]).harf);
    const h2 = HARFLER.indexOf(notaCoz(g.notalar[i + 1]).harf);
    bekle((h1 + 1) % 7 === h2, yer, `${g.notalar[i]}→${g.notalar[i + 1]} harf atlıyor`);
  });
  if (g.dereceler) g.dereceler.forEach((d, i) => bekle(mod12(sesSinifi(g.notalar[i]) - sesSinifi(g.notalar[0])) === mod12(simgeYarim(d)), yer, `${g.notalar[i]} derecesi ${d} değil`));
}

/** Porte notasının yazılı MIDI'si (donanım ve ölçü içi arıza kuralıyla) */
function porteSesleri(porte) {
  const DIYEZ = "FCGDAEB";
  const BEMOL = "BEADGCF";
  const donanim = {};
  if (porte.donanim > 0) for (const h of DIYEZ.slice(0, porte.donanim)) donanim[h] = 1;
  if (porte.donanim < 0) for (const h of BEMOL.slice(0, -porte.donanim)) donanim[h] = -1;
  const olcuBoy = porte.olcu?.[0] ?? 4;
  let t = 0;
  let olcuAriza = {};
  return porte.notalar.map((n) => {
    if (Math.abs(t % olcuBoy) < 1e-9) olcuAriza = {};
    const harf = HARFLER[n.h];
    const anahtar = `${harf}${n.o}`;
    if (n.a !== undefined) olcuAriza[anahtar] = n.a;
    const a = olcuAriza[anahtar] ?? donanim[harf] ?? 0;
    t += n.d ?? 1;
    return { yazili: 12 * (n.o + 1) + DOGAL_SES[harf] + a, harf, a };
  });
}
function porteDenetle(g, yer) {
  const sesler = porteSesleri(g.porte);
  g.etiketler?.forEach((e, i) => {
    if (!e || /^[kBTA]?\d|^8$/.test(e) || !notaCoz(e)) return;
    bekle(sesSinifi(e) === mod12(sesler[i].yazili), yer, `${i + 1}. nota etiketi ${e} ama yazılı ses farklı`);
  });
  g.konumlar?.forEach((k, i) => {
    if (!k) return;
    bekle(perdeSesi(k.t, k.p) === sesler[i].yazili - 12, yer, `${i + 1}. nota ${k.t}. tel ${k.p}. perde duyulan ${perdeSesi(k.t, k.p)}, yazılı-12 = ${sesler[i].yazili - 12}`);
  });
  // Aralık etiketleri (k3, B3, T4, T5, B6, 8): bir önceki notaya göre
  g.etiketler?.forEach((e, i) => {
    const m = /^([kBTAE])?(\d)$/.exec(e ?? "");
    if (!m || i === 0) return;
    const fark = sesler[i].yazili - sesler[i - 1].yazili;
    const no = Number(m[2]);
    const taban = BUYUK[no];
    const nitelik = m[1] ?? (no === 8 ? "T" : "");
    const beklenen = nitelik === "k" ? taban - 1 : nitelik === "A" ? taban + 1 : nitelik === "E" ? taban - 1 : taban;
    bekle(fark === beklenen, yer, `${i + 1}. nota aralık etiketi ${e} ama ${fark} yarım ses`);
  });
  if (g.porte.olcu) {
    const toplam = g.porte.notalar.reduce((s, n) => s + (n.d ?? 1), 0);
    bekle(Math.abs(toplam % g.porte.olcu[0]) < 1e-9, yer, `toplam süre ${toplam} ölçüye bölünmüyor`);
  }
}

// Ritim hücreleri: vuruş sayısı (bağımsız tablo)
const HUCRE_VURUS = { q: 1, qr: 1, h: 2, ee: 1, "e-r": 1, "r-e": 1, ssss: 1, "e-ss": 1, "ss-e": 1, "de-s": 1, "s-de": 1, "r-sss": 1, syn: 2, t: 1, "t-r-t": 1, "t-q": 1 };
function ritimDenetle(desen, olcu, yer) {
  desen.forEach((o, i) => {
    let v = 0;
    for (const h of o) {
      bekle(h in HUCRE_VURUS, yer, `bilinmeyen hücre ${h}`);
      v += HUCRE_VURUS[h] ?? 0;
    }
    bekle(v === olcu[0], yer, `${i + 1}. ölçü ${v} vuruş, ölçü ${olcu[0]}`);
  });
}

function tabDenetle(g, yer) {
  g.kolonlar.forEach((k, i) => {
    for (const n of k.n) bekle(n.t >= 1 && n.t <= 6 && n.p >= 0 && n.p <= 24, yer, `${i + 1}. kolon geçersiz konum`);
    if (g.etiket === "nota" && k.e && k.n.length === 1) bekle(sesSinifi(k.e) === mod12(perdeSesi(k.n[0].t, k.n[0].p)), yer, `${i + 1}. kolon etiketi ${k.e} ama ses farklı`);
    if (g.etiket === "nota" && k.e && k.n.length > 1) dene(yer, () => {
      const c = akorCoz(k.e);
      const s = new Set(k.n.map((n) => mod12(perdeSesi(n.t, n.p))));
      const f = formulSiniflari(c.kok, c.formul);
      bekle([...s].every((x) => f.has(x)), yer, `${i + 1}. kolon ${k.e} akoruna uymuyor`);
    });
  });
  if (g.olcu && g.kolonlar.every((k) => k.d !== undefined)) {
    const toplam = g.kolonlar.reduce((s, k) => s + k.d, 0);
    const boy = g.olcu[0] * (4 / g.olcu[1]);
    bekle(Math.abs(toplam / boy - Math.round(toplam / boy)) < 1e-9, yer, `tab süreleri ${toplam}, ölçü ${boy}`);
  }
}

/** Akor şemasının çalınış sırası: tekrar, volta, D.S. al Fine / al Coda (D.S. dönüşünde tekrar alınmaz) */
function calinisSirasi(sema) {
  const o = sema.olculer;
  const sira = [];
  let i = 0;
  let tekrarBas = 0;
  const tekrarlandi = new Set();
  let ds = false;
  let adim = 0;
  while (i < o.length && adim++ < 500) {
    const m = o[i];
    if (m.bas) tekrarBas = i;
    // Volta: ilk geçişte 1., tekrarda 2. son
    if (m.volta) {
      const ikinci = tekrarlandi.has(tekrarBasIcin(o, i));
      if ((m.volta === 1 && ikinci) || (m.volta === 2 && !ikinci && !ds)) {
        i++;
        continue;
      }
    }
    sira.push(i + 1);
    if (ds && m.fine) break;
    if (ds && m.yon === "To Coda") {
      i = o.findIndex((x) => x.coda);
      continue;
    }
    if (m.son && !ds && !tekrarlandi.has(tekrarBas)) {
      tekrarlandi.add(tekrarBas);
      i = tekrarBas;
      continue;
    }
    if (!ds && (m.yon === "D.S. al Fine" || m.yon === "D.S. al Coda")) {
      ds = true;
      i = o.findIndex((x) => x.segno);
      continue;
    }
    i++;
  }
  return sira;
}
function tekrarBasIcin(o, i) {
  for (let j = i; j >= 0; j--) if (o[j].bas) return j;
  return 0;
}
function semaDenetle(g, yer) {
  const [vurus] = g.sema.olcu;
  g.sema.olculer.forEach((m, i) => {
    bekle(m.akorlar.reduce((s, a) => s + a.vurus, 0) === vurus, yer, `${i + 1}. ölçü vuruş toplamı`);
    for (const a of m.akorlar) dene(yer, () => akorCoz(a.ad));
  });
  if (g.sira) bekle(JSON.stringify(calinisSirasi(g.sema)) === JSON.stringify(g.sira), yer, `çalınış sırası ${calinisSirasi(g.sema).join(" ")} ≠ ${g.sira.join(" ")}`);
}

function gorselDenetle(g, yer) {
  const y = `${yer} [${g.tur}: ${g.baslik.slice(0, 40)}]`;
  switch (g.tur) {
    case "sap":
      return sapDenetle(g, y);
    case "akorlar":
      return g.akorlar.forEach((a) => dene(y, () => akorDenetle(a, y)));
    case "adim":
      return adimDenetle(g, y);
    case "piyano":
      for (const [a, b] of g.yarimlar ?? []) bekle(mod12(sesSinifi(b) - sesSinifi(a)) === 1, y, `${a}-${b} yarım ses değil`);
      for (const v of g.vurgu ?? []) bekle(notaCoz(v) !== null, y, `vurgu ${v}`);
      return;
    case "cember":
      for (const v of g.vurgu ?? []) bekle(BESLILER.some((b) => b.major === v), y, `vurgu ${v} çemberde yok`);
      return;
    case "porte":
      return porteDenetle(g, y);
    case "ritim":
      return ritimDenetle(g.desen, g.olcu ?? [4, 4], y);
    case "tab":
      return tabDenetle(g, y);
    case "sema":
      return semaDenetle(g, y);
    case "vurgu":
      for (const s of g.satirlar) {
        const m = /^(\d+)\/(\d+)$/.exec(s.ad);
        if (m) bekle(s.vuruslar.length === Number(m[1]), y, `${s.ad}: ${s.vuruslar.length} vuruş`);
        if (m) bekle(s.vuruslar[0] === 3 && s.vuruslar.every((v, i) => i === 0 || v < 3), y, `${s.ad}: ölçü başı en güçlü vuruş olmalı`);
        if (s.sayim) bekle(s.sayim.length === s.vuruslar.length, y, `${s.ad}: sayım uzunluğu`);
      }
      return;
    case "tempo":
      for (const b of g.bpm) bekle(b > 0 && b <= 300, y, `BPM ${b}`);
      return;
    case "agac":
    case "akis":
      return;
  }
}

// ── Tablolar ─────────────────────────────────────────────────────────────────
const temizle = (s) => String(s).replace(/\*\*/g, "").trim();
function tabloDenetle(t, yer) {
  const d = t.dogrula;
  const y = `${yer} [tablo: ${t.baslik ?? t.bas.join("/")}]`;
  t.satirlar.forEach((r) => bekle(r.length === t.bas.length, y, `satır sütun sayısı: ${r.join(" | ")}`));
  if (!d) return;
  if (d.tur === "parlaklik") {
    // Parlaktan karanlığa: her satırda tam bir derece yarım ses iner
    const ivs = t.satirlar.map((r) => temizle(r[d.formul]).split(" ").map((x) => mod12(simgeYarim(x))));
    ivs.slice(1).forEach((iv, i) => {
      const fark = iv.map((x, j) => x - ivs[i][j]);
      bekle(fark.filter((f) => f === -1).length === 1 && fark.filter((f) => f !== 0).length === 1, y, `${t.satirlar[i + 1][0]}: bir öncekinden tek nota yarım ses inmeli (${fark})`);
    });
  }
  for (const r of t.satirlar) {
    const yy = `${y} satır "${r[0]}"`;
    dene(yy, () => {
      switch (d.tur) {
        case "aralik": {
          const yarim = Number(r[d.yarim]);
          for (const s of r[d.simge].split("/").map((x) => x.trim())) bekle(mod12(simgeYarim(s)) === mod12(yarim) && (yarim === 12 ? simgeYarim(s) === 12 : true), yy, `simge ${s} ≠ ${yarim} yarım ses`);
          if (d.ornek !== undefined)
            for (const cift of r[d.ornek].split("/").map((x) => x.trim())) {
              const [a, b] = cift.split("–");
              const fark = mod12(sesSinifi(b) - sesSinifi(a)) || (yarim === 12 ? 12 : 0);
              bekle(fark === yarim, yy, `${cift} = ${fark} yarım ses`);
              const harfFark = (HARFLER.indexOf(notaCoz(b).harf) - HARFLER.indexOf(notaCoz(a).harf) + 7) % 7;
              const simgeler = r[d.simge].split("/").map((x) => simgeSayi(x.trim()));
              bekle(simgeler.some((n) => (n - 1) % 7 === harfFark), yy, `${cift} harf sayısı simgeyle uyumsuz`);
            }
          break;
        }
        case "gam": {
          const kok = typeof d.kok === "number" ? temizle(r[d.kok]) : d.kok;
          const formul = typeof d.formul === "number" ? temizle(r[d.formul]) : d.formul;
          const notalar = temizle(r[d.notalar]).split(" ");
          const simgeler = formul.split(" ");
          bekle(notalar.length === simgeler.length, yy, "nota ve formül sayısı farklı");
          simgeler.forEach((s, i) => bekle(ayniYazim(notalar[i], yazilis(kok, s)), yy, `${s}. derece ${notalar[i]} yazılmış, doğrusu ${yazilis(kok, s)}`));
          break;
        }
        case "akor": {
          const c = akorCoz(temizle(r[d.ad]));
          const notalar = temizle(r[d.notalar]).split(" ");
          const formul = d.formul !== undefined ? temizle(r[d.formul]) : c.formul;
          bekle(c.formul === formul, yy, `${r[d.ad]} formülü ${c.formul}, tabloda ${formul}`);
          formul.split(" ").forEach((s, i) => bekle(ayniYazim(notalar[i], yazilis(c.kok, s)), yy, `${s}: ${notalar[i]} yazılmış, doğrusu ${yazilis(c.kok, s)}`));
          break;
        }
        case "diyatonik": {
          const derece = ["I", "II", "III", "IV", "V", "VI", "VII"].indexOf(r[0].replace(/[°ø]/g, "").toUpperCase());
          bekle(derece >= 0, yy, "derece okunamadı");
          const tur = (formul) => (formul === "1 3 5" ? "I" : formul === "1 b3 5" ? "i" : formul === "1 b3 b5" ? "°" : "?");
          for (const [sutun, ton] of Object.entries(d.tonlar)) {
            const simgeler = MAJOR.split(" ");
            const kok = yazilis(ton, simgeler[derece]);
            const ucu = [0, 2, 4].map((k) => yazilis(ton, simgeler[(derece + k) % 7]));
            const f = ["1", "", ""].map((_, k) => mod12(sesSinifi(ucu[k]) - sesSinifi(kok)));
            const formul = f[1] === 4 && f[2] === 7 ? "1 3 5" : f[1] === 3 && f[2] === 7 ? "1 b3 5" : f[1] === 3 && f[2] === 6 ? "1 b3 b5" : "?";
            const c = akorCoz(temizle(r[Number(sutun)]));
            bekle(ayniYazim(c.kok, kok) && c.formul === formul, yy, `${ton} tonunda ${r[0]} = ${kok} ${formul}, tabloda ${r[sutun]}`);
            const buyuk = r[0].replace(/[°ø]/g, "") === r[0].replace(/[°ø]/g, "").toUpperCase();
            bekle(tur(formul) === (r[0].includes("°") ? "°" : buyuk ? "I" : "i"), yy, `Roma rakamı yazımı türle uyumsuz`);
          }
          for (const [sutun, ton] of Object.entries(d.yedili ?? {})) {
            const simgeler = MAJOR.split(" ");
            const kok = yazilis(ton, simgeler[derece]);
            const dort = [0, 2, 4, 6].map((k) => mod12(sesSinifi(yazilis(ton, simgeler[(derece + k) % 7])) - sesSinifi(kok)));
            const c = akorCoz(temizle(r[Number(sutun)]));
            const f = c.formul.split(" ").map(simgeYarim).map(mod12);
            bekle(ayniYazim(c.kok, kok) && JSON.stringify(f) === JSON.stringify(dort), yy, `${ton} tonunda ${r[0]} yedilisi ${r[sutun]} değil`);
          }
          break;
        }
        case "paralel": {
          const ma = akorCoz(temizle(r[d.major]));
          const mi = akorCoz(temizle(r[d.minor]));
          bekle(mi.formul === "1 b3 5", yy, "minör değil");
          bekle(ayniYazim(mi.kok, yazilis(ma.kok, "6")), yy, `${ma.kok} majörün paraleli ${yazilis(ma.kok, "6")}m`);
          const don = temizle(r[2]);
          const ariza = MAJOR.split(" ").map((s) => notaCoz(yazilis(ma.kok, s)).ariza);
          const sayi = ariza.filter((a) => a > 0).length - ariza.filter((a) => a < 0).length;
          const yazilan = don === "—" ? 0 : Number(don.split(" ")[0]) * (don.includes("bemol") ? -1 : 1);
          bekle(sayi === yazilan, yy, `donanım ${sayi}, tabloda ${don}`);
          break;
        }
        case "bpm": {
          const bpm = Number(r[d.bpm]);
          const sn = Number(String(r[d.saniye]).replace(",", ".").replace(/[^\d.]/g, ""));
          bekle(Math.abs(60 / bpm - sn) < 0.005, yy, `${bpm} BPM vuruşu ${60 / bpm} sn, tabloda ${sn}`);
          break;
        }
        case "tel": {
          const tel = Number(r[d.tel]);
          bekle(bilimsel(r[d.nota]) === AKORT[tel], yy, `${tel}. tel ${r[d.nota]} değil`);
          if (d.yazili !== undefined) bekle(bilimsel(r[d.yazili]) === AKORT[tel] + 12, yy, `${tel}. tel yazılışı ${r[d.yazili]} değil (bir oktav tiz yazılır)`);
          break;
        }
        case "sure": {
          const DEGER = { birlik: 4, ikilik: 2, dörtlük: 1, sekizlik: 0.5, onaltılık: 0.25, otuzikilik: 0.125, "sekizlik üçleme": 1 / 3, "noktalı ikilik": 3, "noktalı dörtlük": 1.5, "noktalı sekizlik": 0.75, "dörtlük üçleme": 2 / 3, "noktalı birlik": 6, "çift noktalı ikilik": 3.5, "çift noktalı dörtlük": 1.75, "onaltılık üçleme": 1 / 6 };
          const ad = temizle(r[d.ad]).toLocaleLowerCase("tr").replace(/ sus$/, "");
          const v = String(r[d.vurus]).split("/").map(Number);
          const deger = v.length === 2 ? v[0] / v[1] : v[0];
          bekle(ad in DEGER && Math.abs(DEGER[ad] - deger) < 1e-9, yy, `${ad} = ${DEGER[ad]} vuruş, tabloda ${r[d.vurus]}`);
          break;
        }
        case "kayma": {
          const sayi = (x) => Number(String(x).replace("−", "-").replace("+", ""));
          const yarim = sayi(r[d.yarim]);
          bekle(sayi(r[d.ayni]) === yarim, yy, `aynı telde ${r[d.ayni]} ≠ ${yarim}`);
          // Komşu ince tel 5 yarım ses (tam dörtlü), Sol→Si 4 yarım ses (büyük üçlü) tizdir
          bekle(sayi(r[d.ust]) === yarim - (AKORT[5] - AKORT[6]), yy, `bir ince telde ${r[d.ust]} ≠ ${yarim - 5}`);
          bekle(sayi(r[d.si]) === yarim - (AKORT[2] - AKORT[3]), yy, `Sol→Si telinde ${r[d.si]} ≠ ${yarim - 4}`);
          break;
        }
        case "frekans": {
          const hz = 440 * 2 ** ((bilimsel(temizle(r[d.nota])) - 69) / 12);
          bekle(Math.abs(hz - Number(String(r[d.hz]).replace(/[^\d.]/g, ""))) < 0.5, yy, `${r[d.nota]} = ${hz.toFixed(1)} Hz`);
          // "Gitarda bir yeri" sütunu: "3. tel 2. perde" / "5. tel açık"
          const m = /(\d)\. tel (?:(\d+)\. perde|açık)/.exec(r[2] ?? "");
          if (m) bekle(perdeSesi(Number(m[1]), Number(m[2] ?? 0)) === bilimsel(temizle(r[d.nota])), yy, `${r[2]} ${r[d.nota]} değil`);
          break;
        }
        case "yuruyus": {
          const romenler = temizle(r[d.romen]).split(" ");
          for (const [sutun, ton] of Object.entries(d.tonlar)) {
            const akorlar = temizle(r[Number(sutun)]).split(" ");
            bekle(akorlar.length === romenler.length, yy, "akor sayısı");
            romenler.forEach((rm, i) => {
              const { siniflar } = romenCoz(ton, rm);
              const c = akorCoz(akorlar[i]);
              const s = formulSiniflari(c.kok, c.formul);
              bekle(s.size === siniflar.size && [...s].every((x) => siniflar.has(x)), yy, `${ton} tonunda ${rm} = ${akorlar[i]} değil`);
            });
          }
          break;
        }
        case "romen": {
          const ton = typeof d.ton === "number" ? temizle(r[d.ton]) : d.ton;
          const ciftler = d.sutunlar ? Object.entries(d.sutunlar).map(([sutun, rm]) => [rm, temizle(r[Number(sutun)])]) : [[temizle(r[d.romen]), temizle(r[d.akor])]];
          for (const [rm, akor] of ciftler) {
            const beklenen = romenCoz(ton, rm);
            const c = akorCoz(akor);
            const s2 = formulSiniflari(c.kok, c.formul);
            bekle(ayniYazim(c.kok, beklenen.kok), yy, `${ton} tonunda ${rm} kökü ${beklenen.kok}, tabloda ${akor}`);
            bekle(s2.size === beklenen.siniflar.size && [...s2].every((x) => beklenen.siniflar.has(x)), yy, `${ton} tonunda ${rm} ≠ ${akor}`);
            if (d.notalar !== undefined) {
              const notalar = temizle(r[d.notalar]).split(" ");
              c.formul.split(" ").forEach((sm, i) => bekle(ayniYazim(notalar[i], yazilis(c.kok, sm)), yy, `${akor}: ${sm} = ${yazilis(c.kok, sm)}, tabloda ${notalar[i]}`));
            }
          }
          break;
        }
        case "mod":
        case "parlaklik": {
          // Mod: ana gamın dereceden döndürülmesi (bağımsız ana gam tanımları)
          const ANA = { major: [0, 2, 4, 5, 7, 9, 11], harmonic: [0, 2, 3, 5, 7, 8, 11], melodic: [0, 2, 3, 5, 7, 9, 11] };
          const formul = temizle(r[d.formul]).split(" ");
          const iv = formul.map((x) => mod12(simgeYarim(x)));
          bekle(new Set(iv).size === iv.length && iv[0] === 0, yy, "formül geçersiz");
          if (d.tur === "mod") {
            const anaHucre = typeof d.ana === "number" ? temizle(r[d.ana]) : d.ana;
            const ana = /melodik|melodic/.test(anaHucre) ? "melodic" : /armonik|harmonic/.test(anaHucre) ? "harmonic" : "major";
            const derece = Number((/(\d)\s*$/.exec(temizle(r[d.derece])) ?? [])[1]);
            bekle(derece >= 1 && derece <= 7, yy, "derece okunamadı");
            const don = ANA[ana].map((_, i) => mod12(ANA[ana][(derece - 1 + i) % 7] - ANA[ana][derece - 1]));
            bekle(JSON.stringify(don) === JSON.stringify(iv), yy, `${ana} gamının ${derece}. modu ${don}, formül ${iv}`);
            // Notalar: modun kökü ana gamın derecesi (ana kök verildiyse), notalar modun kökünden harf adımıyla
            if (d.notalar !== undefined) {
              const anaSimge = { major: "1 2 3 4 5 6 7", harmonic: "1 2 b3 4 5 b6 7", melodic: "1 2 b3 4 5 6 7" }[ana].split(" ");
              const modKok = d.modKok ?? yazilis(d.kok, anaSimge[derece - 1]);
              const notalar = temizle(r[d.notalar]).split(" ");
              formul.forEach((sm, i) => bekle(ayniYazim(notalar[i], yazilis(modKok, sm)), yy, `${sm}: ${notalar[i]} yazılmış, doğrusu ${yazilis(modKok, sm)}`));
            }
          } else {
            const notalar = temizle(r[d.notalar]).split(" ");
            formul.forEach((sm, i) => bekle(ayniYazim(notalar[i], yazilis(d.kok, sm)), yy, `${sm}: ${notalar[i]} yazılmış, doğrusu ${yazilis(d.kok, sm)}`));
            // Majör gamın bir modu olmalı
            const major = [0, 2, 4, 5, 7, 9, 11];
            bekle([0, 1, 2, 3, 4, 5, 6].some((k) => JSON.stringify(major.map((_, i) => mod12(major[(k + i) % 7] - major[k]))) === JSON.stringify(iv)), yy, "majör gamın modu değil");
          }
          break;
        }
        case "gamAdi": {
          const GAM_AD = {
            Miksolidyen: "1 2 3 4 5 6 b7", "Lidyen dominant": "1 2 3 #4 5 6 b7", "Frigyen dominant": "1 b2 3 4 5 b6 b7", Alterli: "1 b2 b3 b4 b5 b6 b7",
            "Azaltılmış (yarım–tam)": "1 b2 #2 3 #4 5 6 b7", "Tam ton": "1 2 3 #4 #5 b7",
          };
          const ad = temizle(r[d.gam]);
          const f = GAM_AD[ad];
          bekle(!!f, yy, `bilinmeyen gam adı ${ad}`);
          if (f) {
            const notalar = temizle(r[d.notalar]).split(" ");
            bekle(notalar.length === f.split(" ").length, yy, "nota sayısı");
            f.split(" ").forEach((sm, i) => bekle(ayniYazim(notalar[i], yazilis(d.kok, sm)), yy, `${ad} ${sm}: ${notalar[i]}, doğrusu ${yazilis(d.kok, sm)}`));
          }
          break;
        }
        case "komsu": {
          const n = notaCoz(temizle(r[d.nota]));
          const sonraki = HARFLER[(HARFLER.indexOf(n.harf) + 1) % 7];
          const fark = mod12(DOGAL_SES[sonraki] - DOGAL_SES[n.harf]);
          const yazilan = temizle(r[d.uzaklik]);
          bekle((fark === 2 && yazilan === "tam") || (fark === 1 && yazilan === "yarım"), yy, `${n.harf}→${sonraki} ${fark} yarım ses, tabloda ${yazilan}`);
          const ara = temizle(r[3]);
          if (fark === 2) for (const a of ara.split("/").map((x) => x.trim())) bekle(sesSinifi(a) === mod12(DOGAL_SES[n.harf] + 1), yy, `ara ses ${a}`);
          else bekle(ara === "—", yy, "yarım seste ara ses olmamalı");
          break;
        }
      }
    });
  }
}

// ── Dinleme örnekleri ────────────────────────────────────────────────────────
function dinleDenetle(o, yer) {
  const y = `${yer} [dinle: ${o.ad}]`;
  const m = (o.notalar ?? []).map(bilimsel);
  m.forEach((x) => bekle(x >= 28 && x <= 96, y, `nota aralık dışında ${x}`));
  if (o.tip === "aralik") bekle(m.length === 2, y, "aralık için iki nota gerekir");
  const b = o.beklenen;
  if (b?.aralik !== undefined) bekle(m[1] - m[0] === b.aralik, y, `aralık ${m[1] - m[0]}, beklenen ${b.aralik}`);
  if (b?.formul) {
    const kok = Math.min(...m);
    const s = new Set(m.map((x) => mod12(x - kok)));
    const f = new Set(b.formul.split(" ").map((x) => mod12(simgeYarim(x))));
    bekle(s.size === f.size && [...s].every((x) => f.has(x)), y, `akor ${[...s]} ≠ ${b.formul}`);
  }
  if (b?.kalip) bekle(JSON.stringify(m.map((x) => x - m[0])) === JSON.stringify(b.kalip), y, `dizi ${m.map((x) => x - m[0])} ≠ ${b.kalip}`);
  if (o.tip === "akorlar") {
    (o.akorlar ?? []).forEach((a) => a.forEach((n) => dene(y, () => bilimsel(n))));
    if (b?.romen) {
      bekle(b.romen.length === o.akorlar.length, y, "Roma rakamı sayısı");
      b.romen.forEach((r, i) => {
        const { siniflar } = romenCoz(b.ton, r);
        const s = new Set(o.akorlar[i].map(bilimsel).map(mod12));
        bekle(s.size === siniflar.size && [...s].every((x) => siniflar.has(x)), y, `${i + 1}. akor ${r} (${b.ton}) değil`);
      });
    }
  }
  if (o.tip === "ritim" || o.tip === "metronom") ritimDenetle(o.desen ?? [["q", "q", "q", "q"]], o.olcu ?? [4, 4], y);
}

// ── Ders yapısı ──────────────────────────────────────────────────────────────
function bloklarDenetle(bloklar, y0, say) {
  bloklar.forEach((b, i) => {
    const y = `${y0}#${i + 1}`;
    if (b.t === "gorsel") {
      if (!b.ekran) say.gorsel++;
      dene(y, () => gorselDenetle(b.g, y));
    }
    if (b.t === "tablo") {
      say.tablo++;
      dene(y, () => tabloDenetle(b.tablo, y));
    }
    if (b.t === "liste") bekle(b.m.length >= 1 && b.m.every((x) => x.length <= 260), y, "liste maddesi boş ya da çok uzun (kısa cümleler)");
    if (b.t === "dinle")
      for (const o of b.ornekler) {
        say.dinle++;
        dene(y, () => dinleDenetle(o, y));
      }
  });
}
function dersDenetle(d, yer) {
  const yaprak = 1 + (d.ekYapraklar?.length ?? 0);
  bekle(d.tanim.length >= 1, yer, "tanım yok");
  bekle(d.dene.length >= 3 && d.dene.length <= 5, yer, `“hemen dene” ${d.dene.length} madde (3–5 olmalı)`);
  bekle(d.ipucu.length >= 1, yer, "ipucu yok");
  bekle(d.kaynaklar.length >= 1 && d.kaynaklar.length <= Math.min(6, 3 * yaprak), yer, `kaynak sayısı ${d.kaynaklar.length}`);
  const toplam = { gorsel: 0, tablo: 0, dinle: 0 };
  // 1. yaprak
  const ilk = { gorsel: 0, tablo: 0, dinle: 0 };
  for (const bolum of ["kural", "gitarda", "kulakla"]) bloklarDenetle(d[bolum], `${yer} ${bolum}`, ilk);
  const yapraklar = [ilk];
  (d.ekYapraklar ?? []).forEach((yp, i) => {
    const say = { gorsel: 0, tablo: 0, dinle: 0 };
    bekle(yp.kisimlar.length >= 1, yer, `${i + 2}. yaprakta kısım yok`);
    for (const k of yp.kisimlar) {
      bekle(!!k.baslik && k.bloklar.length >= 1, yer, `${i + 2}. yaprakta boş kısım`);
      bloklarDenetle(k.bloklar, `${yer} yaprak ${i + 2} ${k.baslik}`, say);
    }
    yapraklar.push(say);
  });
  yapraklar.forEach((sy, i) => {
    toplam.gorsel += sy.gorsel;
    toplam.tablo += sy.tablo;
    toplam.dinle += sy.dinle;
    // Her kavrama bir şema/tablo: her yaprakta en az bir, en çok beş görsel
    bekle(sy.gorsel + sy.tablo >= (yaprak === 1 ? 2 : 1) && sy.gorsel + sy.tablo <= 5, yer, `${i + 1}. yaprak: ${sy.gorsel} şema + ${sy.tablo} tablo (${yaprak === 1 ? "2" : "1"}–5 bekleniyor)`);
  });
  ozet.push({ ders: yer, gorsel: toplam.gorsel, tablo: toplam.tablo, dinle: toplam.dinle, yaprak });
}

const sluglar = TUM_DERSLER.map((d) => d.slug);
bekle(new Set(sluglar).size === sluglar.length, "dersler", `aynı slug iki kez: ${sluglar.filter((x, i) => sluglar.indexOf(x) !== i).join(", ")}`);
for (const d of TUM_DERSLER) dersDenetle(d, `teori/${d.slug}`);

// ── Müfredat: başlangıçtan ileriye tek sıra, kitaplar, sınavlar ─────────────
dene("müfredat", () => {
  const sira = SIRA.map((x) => x.slug);
  bekle(new Set(sira).size === sira.length, "müfredat", "bir ders sırada iki kez");
  for (const d of TUM_DERSLER) bekle(sira.includes(d.slug), "müfredat", `${d.slug} sırada yok`);
  for (const x of SIRA) {
    const d = TUM_DERSLER.find((y) => y.slug === x.slug);
    bekle(!!d, "müfredat", `${x.slug}: ders yok`);
    if (d) bekle(d.baslik === x.baslik, "müfredat", `${x.slug}: başlık "${x.baslik}", derste "${d.baslik}"`);
  }
  // Seviye: dersin kendi seviyesi müfredattaki seviyesinden en çok bir fazla, sıra seviyeye göre azalmıyor
  SEVIYELER.forEach((s, i) => bekle(s.no === i + 1, "müfredat", "seviye numarası"));
  // Kitaplar müfredat sırasının alt dizisidir (başlangıçtan ileriye)
  const altDizi = (liste, ad) => {
    let son = -1;
    for (const x of liste) {
      const i = sira.indexOf(x);
      bekle(i >= 0, ad, `${x} müfredatta yok`);
      bekle(i >= son, ad, `${x} sırayı bozuyor`);
      son = Math.max(son, i);
    }
  };
  altDizi(ARMONI_UNITELERI.flatMap((u) => u.dersler), "Armoni kitabı");
  altDizi(OKUMA_KONULARI.flatMap((k) => k.dersler), "Nota Okuma kitabı");
  bekle(OKUMA_KONULARI.length === 11, "Nota Okuma kitabı", "11 konu bekleniyor");
  // İçerik paketi: Armoni sınavları ve Okuma bölümleri
  const kok = ["../GuitarFlex-icerik", "ozel-kaynak"].map((x) => path.resolve(x)).find((x) => existsSync(path.join(x, "icerik", "yollar", "armoni.json")));
  if (!kok) return console.log("  (içerik paketi yok: sınav ve alıştırma eşlemesi atlandı)");
  const oku = (f) => JSON.parse(readFileSync(path.join(kok, "icerik", f), "utf8"));
  const armoni = oku("yollar/armoni.json");
  const sinav = ARMONI_UNITELERI.flatMap((u) => u.sinav);
  bekle(new Set(sinav).size === sinav.length, "Armoni kitabı", "bir sınav adımı iki ünitede");
  for (const a of armoni.adimlar) bekle(sinav.includes(a.kod), "Armoni kitabı", `${a.kod} ${a.ad} hiçbir ünitede değil`);
  for (const k of sinav) bekle(armoni.adimlar.some((a) => a.kod === k), "Armoni kitabı", `${k} yolda yok`);
  const gb = armoni.adimlar.filter((a) => !armoni.bolumler.find((b) => b.no === a.bolum)?.ek);
  bekle(gb.length === 11, "Armoni kitabı", `GuitarBear pratik kartı ${gb.length} (11 bekleniyor)`);
  const kurs = oku("armoni.json");
  const ekKod = kurs.sections.flatMap((s) => s.chapters.filter((c) => c.lessons.some((l) => l.card === "ek")).map((c) => c.code));
  const cal = ARMONI_UNITELERI.flatMap((u) => u.cal);
  for (const k of ekKod) bekle(cal.includes(k), "Armoni kitabı", `${k} Ek İnceleme kartları hiçbir ünitede değil`);
  // Sınavlar yalnız armoni yolundan (başka yolların soruları alınmaz)
  for (const k of sinav) bekle(/^(\d\.\d(-\d)?|E\d\.\d)$/.test(k), "Armoni kitabı", `sınav kodu ${k}`);
  const okuma = oku("yollar/okuma.json");
  const bol = OKUMA_KONULARI.flatMap((k) => k.bolumler);
  bekle(JSON.stringify(bol) === JSON.stringify(okuma.bolumler.map((b) => b.no)), "Nota Okuma kitabı", `konu bölümleri ${bol.join(",")} ≠ yol bölümleri ${okuma.bolumler.map((b) => b.no).join(",")}`);
});

// ── Sap Gezgini: gam/mod formülleri, hecelenen notalar ve konumlar ─────────
dene("sap gezgini", () => {
  // Bağımsız tanımlar: modlar ana gamın döndürülmesi, diğerleri sabit aralık kalıbı
  const ANA = { major: [0, 2, 4, 5, 7, 9, 11], "harmonic-minor": [0, 2, 3, 5, 7, 8, 11], "melodic-minor": [0, 2, 3, 5, 7, 9, 11] };
  const BEKLENEN = {
    major: ["major", 1], dorian: ["major", 2], phrygian: ["major", 3], lydian: ["major", 4], mixolydian: ["major", 5], minor: ["major", 6], locrian: ["major", 7],
    "harmonic-minor": ["harmonic-minor", 1], "phrygian-dominant": ["harmonic-minor", 5],
    "melodic-minor": ["melodic-minor", 1], "dorian-b2": ["melodic-minor", 2], "lydian-augmented": ["melodic-minor", 3], "lydian-dominant": ["melodic-minor", 4],
    "mixolydian-b6": ["melodic-minor", 5], "locrian-nat2": ["melodic-minor", 6], altered: ["melodic-minor", 7],
  };
  const SABIT = {
    "minor-penta": [0, 3, 5, 7, 10], "major-penta": [0, 2, 4, 7, 9], blues: [0, 3, 5, 6, 7, 10], "major-blues": [0, 2, 3, 4, 7, 9],
    "whole-tone": [0, 2, 4, 6, 8, 10], "dim-hw": [0, 1, 3, 4, 6, 7, 9, 10], "dim-wh": [0, 2, 3, 5, 6, 8, 9, 11],
  };
  const gerekli = [...Object.keys(BEKLENEN), ...Object.keys(SABIT)];
  for (const id of gerekli) bekle(GAMLAR.some((g) => g.id === id), "sap gezgini", `${id} yok`);
  for (const g of GAMLAR) {
    const y = `sap gezgini ${g.id}`;
    const iv = g.formul.split(" ").map((x) => mod12(simgeYarim(x)));
    if (g.grup === "akorlar") {
      dene(y, () => {
        const ad = { maj: "", min: "m", 5: "5", dim: "dim", aug: "aug", sus2: "sus2", sus4: "sus4", 7: "7", maj7: "maj7", m7: "m7", m7b5: "m7b5", dim7: "dim7" }[g.id];
        bekle(ad !== undefined && akorCoz(`C${ad}`).formul === g.formul, y, `akor formülü ${g.formul}`);
      });
      continue;
    }
    if (BEKLENEN[g.id]) {
      const [ana, d] = BEKLENEN[g.id];
      const don = ANA[ana].map((_, i) => mod12(ANA[ana][(d - 1 + i) % 7] - ANA[ana][d - 1]));
      bekle(JSON.stringify(don) === JSON.stringify(iv), y, `formül ${iv}, ${ana} gamının ${d}. modu ${don}`);
      bekle(g.aile?.ana === ana && g.aile?.derece === d, y, "aile bilgisi");
    } else if (SABIT[g.id]) bekle(JSON.stringify(SABIT[g.id]) === JSON.stringify(iv), y, `formül ${iv}`);
    else bekle(false, y, "bağımsız tanımı yok");
    // Her kökte heceleme: ses sınıfları formüle uyar; yedi notalı gamda her harf bir kez
    for (const kok of KOKLER) {
      const notalar = gamNotalari(g, kok).map((n) => "CDEFGAB"[n.h] + (n.a > 0 ? "#".repeat(n.a) : "b".repeat(-n.a)));
      notalar.forEach((n, i) => bekle(mod12(sesSinifi(n) - sesSinifi(kok)) === iv[i], y, `${kok}: ${n} ${iv[i]}. yarım ses değil`));
      notalar.forEach((n, i) => bekle(ayniYazim(n, yazilis(kok, g.formul.split(" ")[i])), y, `${kok}: ${g.formul.split(" ")[i]} = ${yazilis(kok, g.formul.split(" ")[i])}, gezginde ${n}`));
      if (iv.length === 7 && g.id !== "altered") bekle(new Set(notalar.map((n) => n[0])).size === 7, y, `${kok}: harf tekrarı ${notalar.join(" ")}`);
      // Konumlar: tel başına 2 (penta) ya da 3 (3nps) nota; hepsi gamda; ardışık gam sesleri; sap içinde
      for (let k = 1; k <= konumSayisi(g); k++) {
        const kutu = konumNotalari(g, kok, k);
        const yk = `${y} ${kok} konum ${k}`;
        const tel = g.konum === "penta" ? 2 : 3;
        for (let t = 1; t <= 6; t++) bekle(kutu.filter((x) => x.t === t).length >= tel, yk, `${t}. telde ${kutu.filter((x) => x.t === t).length} nota`);
        for (const x of kutu) {
          bekle(x.p >= 0 && x.p <= 17, yk, `${x.t}:${x.p} sap dışında`);
          bekle(iv.includes(mod12(perdeSesi(x.t, x.p) - sesSinifi(kok))), yk, `${x.t}:${x.p} gamda değil`);
        }
        const iskelet = (g.iskelet ?? g.formul).split(" ").map((x) => mod12(simgeYarim(x)));
        const sira = kutu.filter((x) => iskelet.includes(mod12(perdeSesi(x.t, x.p) - sesSinifi(kok)))).map((x) => perdeSesi(x.t, x.p)).sort((a, b) => a - b);
        for (let i = 1; i < sira.length; i++) {
          const a = iskelet.indexOf(mod12(sira[i - 1] - sesSinifi(kok)));
          bekle(mod12(sira[i] - sira[i - 1]) === mod12(iskelet[(a + 1) % iskelet.length] - iskelet[a]) && sira[i] > sira[i - 1], yk, "kutuda gam sesleri ardışık değil");
        }
        bekle(sira.length === 6 * tel, yk, `iskelet nota sayısı ${sira.length}`);
      }
    }
  }
});

// Beşliler çemberi
dene("beşliler çemberi", () => {
  BESLILER.forEach((b, i) => {
    const y = `beşliler çemberi ${b.major}`;
    if (i > 0) bekle(mod12(sesSinifi(b.major) - sesSinifi(BESLILER[i - 1].major)) === 7, y, "önceki tondan tam beşli yukarı değil");
    for (const t of [b, b.enarmonik].filter(Boolean)) {
      bekle(ayniYazim(t.minor, yazilis(t.major, "6")), y, `paralel minör ${t.minor} değil`);
      const ariza = MAJOR.split(" ").map((s) => notaCoz(yazilis(t.major, s)).ariza);
      const sayi = ariza.filter((a) => a > 0).length - ariza.filter((a) => a < 0).length;
      bekle(sayi === t.donanim, y, `donanım ${sayi}, veride ${t.donanim}`);
    }
  });
});

console.log(`Teori doğrulaması: ${ozet.length} ders · ${denetim} denetim · ${hatalar.length} hata`);
for (const o of ozet) console.log(`  ${o.ders.padEnd(40)} yaprak ${o.yaprak} · şema ${o.gorsel} · tablo ${o.tablo} · dinleme ${o.dinle}`);
console.log(`  Müfredat: ${SIRA.length} ders, ${SEVIYELER.length} seviye · Armoni ${ARMONI_UNITELERI.length} ünite · Nota Okuma ${OKUMA_KONULARI.length} konu · Sap Gezgini ${GAMLAR.length} gam/akor × ${KOKLER.length} kök`);
if (hatalar.length) {
  console.log("\nHatalar:");
  for (const h of hatalar) console.log("  ✗ " + h);
  process.exit(1);
}
