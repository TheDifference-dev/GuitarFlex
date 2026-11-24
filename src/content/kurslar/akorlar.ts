// Akorlar (CAGED) — orta–ileri elektro gitarist için kompakt akor kursu: akorların yapısı (kök – üçlü – beşli,
// majör / minör / eksik / artık, 7'li, sus ve 9'lu), aynı akorun sap boyunca C-A-G-E-D şekilleriyle beş pozisyonda
// basılması, şekil bağlantıları ve triad çevrimleri. Açık akor / ilk akor dersleri yoktur.
// Ders kimlikleri "akc-…" (eski açık akor kursunun "ak-…" kimlikleriyle çakışmasın: eski ilerleme yeni derse geçmez).
import type { Course } from "../types.ts";
import { tex } from "../tex.ts";
import { chapter, section, type LessonInput } from "./ortak.ts";

const P = "akc";

/** Akor sesleri pesten tize ("perde.tel" boşlukla) */
type V = string;
const notalar = (v: V) => v.split(" ");
/** Sekizlik arpej: akor seslerinde çık ve in, ölçüyü (8 sekizlik) dolduracak kadar döner; alternatif pena */
function arp(v: V): string {
  const n = notalar(v);
  const tur = [...n, ...n.slice(1, -1).reverse()];
  const sekiz = Array.from({ length: 8 }, (_, i) => tur[i % tur.length]);
  return `:8 ${sekiz.map((x, i) => `${x}{${i % 2 ? "su" : "sd"}}`).join(" ")}`;
}
/** Dörtlük tarama: dört aşağı vuruş */
const tara = (v: V) => `:4 ${Array.from({ length: 4 }, () => `(${v}){bd}`).join(" ")}`;
/** İkilik tarama: ölçüde iki akor */
const iki = (a: V, b: V) => `:2 (${a}){bd} (${b}){bd}`;
/** Üç sesli triad arpeji (sekizlik): 1-2-3-2 iki kez */
const triad = (v: V) => {
  const [a, b, c] = notalar(v);
  return `:8 ${[a, b, c, b, a, b, c, b].map((x, i) => `${x}{${i % 2 ? "su" : "sd"}}`).join(" ")}`;
};

function ders(title: string, bpm: number, bars: string[], description: string, tips: string[], theory: string[] = [], minutes = 1, caged = false): LessonInput {
  return { title, bpm, minutes, tex: tex(bpm, bars), description, tips, theory, ...(caged ? { caged: true } : {}) };
}

// ── Sesler (kalın telden inceye) ─────────────────────────────────────────────
// Bölüm 1: La kökü 5. perdede (E şekli) ve Re kökü 5. perdede (A şekli)
const A_MAJ = "5.6 7.5 7.4 6.3 5.2 5.1";
const A_MIN = "5.6 7.5 7.4 5.3 5.2 5.1";
// Re–Sol–Si tellerinde La üçlüleri (kök 7.4)
const T_MAJ = "7.4 6.3 5.2";
const T_MIN = "7.4 5.3 5.2";
const T_DIM = "7.4 5.3 4.2";
const T_AUG = "7.4 6.3 6.2";
const AMAJ7 = "5.6 6.4 6.3 5.2";
const A7 = "5.6 5.4 6.3 5.2";
const AM7 = "5.6 5.4 5.3 5.2";
const AM7B5 = "5.6 5.4 5.3 4.2";
const D = "5.5 7.4 7.3 7.2 5.1";
const DSUS4 = "5.5 7.4 7.3 8.2 5.1";
const DSUS2 = "5.5 7.4 7.3 5.2 5.1";
const DMAJ9 = "5.5 4.4 6.3 5.2";
const D9 = "5.5 4.4 5.3 5.2";
const DM9 = "5.5 3.4 5.3 5.2";
// Bölüm 2: Do majörün beş CAGED şekli
const C_C = "3.5 2.4 0.3 1.2 0.1"; // C şekli, açık
const C_A = "3.5 5.4 5.3 5.2 3.1"; // A şekli, 3. perde
const C_G = "8.6 7.5 5.4 5.3 5.2 8.1"; // G şekli, 5. perde
const C_E = "8.6 10.5 10.4 9.3 8.2 8.1"; // E şekli, 8. perde
const C_D = "10.4 12.3 13.2 12.1"; // D şekli, 10. perde
const C_C12 = "15.5 14.4 12.3 13.2 12.1"; // C şekli bir oktav yukarıda
// Bölüm 3: La minörün beş şekli ve 5. pozisyonda akor dizileri
const AM_A = "0.5 2.4 2.3 1.2 0.1"; // A şekli, açık
const AM_G = "5.6 2.4 5.3 5.2 5.1"; // G şekli, 2–5. perde
const AM_E = "5.6 7.5 7.4 5.3 5.2 5.1"; // E şekli, 5. perde
const AM_D = "7.4 9.3 10.2 8.1"; // D şekli, 7. perde
const AM_C = "12.5 10.4 9.3 10.2"; // C şekli, 9–12. perde
const D_A5 = "5.5 7.4 7.3 7.2 5.1"; // Re majör, A şekli
const DM_A5 = "5.5 7.4 7.3 6.2 5.1"; // Re minör, A şekli
const E_C = "7.5 6.4 4.3 5.2"; // Mi majör, C şekli (4–7. perde)
// Bölüm 4: Do majör triad çevrimleri
const C_KOK = "5.3 5.2 3.1"; // Do – Mi – Sol
const C_1 = "9.3 8.2 8.1"; // Mi – Sol – Do
const C_2 = "12.3 13.2 12.1"; // Sol – Do – Mi
const C_KOK2 = "17.3 17.2 15.1";
const C4_KOK = "10.4 9.3 8.2";
const C4_1 = "14.4 12.3 13.2";
const C4_2 = "5.4 5.3 5.2";
const F_KOK = "10.3 10.2 8.1"; // Fa – La – Do
const G_2 = "7.3 8.2 7.1"; // Re – Sol – Si
const AM_1 = "5.3 5.2 5.1"; // Do – Mi – La
const DM_KOK = "7.3 6.2 5.1"; // Re – Fa – La
const E_2 = "4.3 5.2 4.1"; // Si – Mi – Sol#

// ── Bölüm 1: Akor Yapısı ─────────────────────────────────────────────────────
const s1 = section(1, "Akor Yapısı", [
  chapter(P, 1, 0, "Kök – Üçlü – Beşli", [
    "Üçlü (triad): kök, üçlü ve beşli. Üçlünün ve beşlinin büyüklüğü akorun türünü belirler: majör 1 – 3 – 5 (büyük üçlü + küçük üçlü), minör 1 – ♭3 – 5, eksik (dim) 1 – ♭3 – ♭5, artık (aug) 1 – 3 – ♯5.",
    "Majörden minöre geçerken yalnız üçlü yarım ses iner: La majörde Do#, La minörde Do.",
  ], [
    ders("La Majör ve La Minör", 70, [arp(A_MAJ), tara(A_MAJ), arp(A_MIN), tara(A_MIN)], "E şekli 5. perdede: önce arpej (tek tek akor sesleri), sonra tarama; majör ve minör.", ["Arpejde kök notalarını (5. perde kalın Mi, 7. perde Re, 5. perde ince Mi) duy.", "Majörden minöre yalnız Sol telindeki parmak kalkar."], ["La majör: La – Do# – Mi · La minör: La – Do – Mi."]),
    ders("Dört Üçlü Türü", 70, [triad(T_MAJ), triad(T_MIN), triad(T_DIM), triad(T_AUG)], "Re–Sol–Si tellerinde La kökünden dört üçlü: majör, minör, eksik, artık.", ["Kök (Re telinde 7. perde) hiç kalkmaz; yalnız üçlü ve beşli hareket eder.", "Her türün rengini adlandır: parlak, hüzünlü, gergin, belirsiz."], ["A: La – Do# – Mi · Am: La – Do – Mi · Adim: La – Do – Mi♭ · Aaug: La – Do# – Mi#."]),
  ]),
  chapter(P, 1, 1, "7'li Akorlar", [
    "7'li akor üçlüye yedili ekler: maj7 1 – 3 – 5 – 7, dominant 7 1 – 3 – 5 – ♭7, m7 1 – ♭3 – 5 – ♭7, m7♭5 (yarım eksik) 1 – ♭3 – ♭5 – ♭7.",
    "Bu dört ses kalın Mi kökünden atlamalı (5. teli atlayan) bir dizilişle basılır: caz ve funk'ın kompakt sesi.",
  ], [
    ders("Dört 7'li Akor", 70, [arp(AMAJ7), arp(A7), arp(AM7), arp(AM7B5)], "La kökünde Amaj7 – A7 – Am7 – Am7♭5: her ölçüde bir ses değişir.", ["La telini işaret parmağının ucu sustursun.", "Ölçüden ölçüye tek bir parmak yer değiştirir; hangisi olduğunu bul."], ["Amaj7: La – Do# – Mi – Sol# · A7: La – Do# – Mi – Sol · Am7: La – Do – Mi – Sol · Am7♭5: La – Do – Mi♭ – Sol."]),
    ders("7'li Tarama", 80, [iki(AMAJ7, A7), iki(AM7, AM7B5), iki(AMAJ7, A7), iki(AM7, A7)], "Aynı dört akor, ölçüde iki akor; kısa ve vurgulu tarama.", ["Akoru çaldıktan sonra sol eli hafif gevşetip kısa kes (staccato)."]),
  ]),
  chapter(P, 1, 2, "Sus ve 9'lu Akorlar", [
    "Sus (asılı) akorda üçlünün yerini dörtlü (sus4) ya da ikili (sus2) alır; akor ne majör ne minördür ve genellikle majöre çözülür.",
    "Genişletilmiş akorlar 7'li akorun üstüne 9, 11, 13 ekler. 9'lu: maj9 1 – 3 – 7 – 9, dominant 9 1 – 3 – ♭7 – 9, m9 1 – ♭3 – ♭7 – 9 (beşli çoğunlukla atlanır).",
  ], [
    ders("D – Dsus4 – D – Dsus2", 70, [arp(D), arp(DSUS4), arp(D), arp(DSUS2)], "A şekli 5. perdede Re majör ve sus akorları.", ["Sus4'te serçe Si telinde 8. perdeye, sus2'de Si teli işaret parmağıyla 5. perdeye iner."], ["D: Re – Fa# – La · Dsus4: Re – Sol – La · Dsus2: Re – Mi – La."]),
    ders("9'lu Akorlar", 70, [arp(DMAJ9), arp(D9), arp(DM9), arp(D9)], "Re kökünde Dmaj9 – D9 – Dm9 – D9: beşli yok, dokuzlu (Mi) Si telinde 5. perdede.", ["Bu dizilişler funk ve neo-soul'un temel sesidir; kalın Mi'yi ve ince Mi'yi sustur."], ["Dmaj9: Re – Fa# – Do# – Mi · D9: Re – Fa# – Do – Mi · Dm9: Re – Fa – Do – Mi."]),
  ]),
]);

// ── Bölüm 2: CAGED — Bir Akor, Beş Şekil ────────────────────────────────────
const s2 = section(2, "CAGED: Bir Akor, Beş Şekil", [
  chapter(P, 2, 0, "C ve A Şekli", [
    "CAGED: beş açık akor şekli (C, A, G, E, D) sapta yukarı kaydırılınca her akoru beş pozisyonda verir. Şekiller bu sırayla birbirine bağlanır ve 12. perdede baştan başlar.",
    "Do majör: C şekli açık pozisyonda, A şekli 3. perdede (kök La telinde).",
  ], [
    ders("C Şekli", 70, [arp(C_C), tara(C_C)], "Do majör, C şekli (açık): arpej ve tarama.", ["Kökler La telinde 3. perde ve Si telinde 1. perde."], [], 1, true),
    ders("A Şekli", 70, [arp(C_A), tara(C_A)], "Do majör, A şekli 3. perdede.", ["A şeklinin kökü (3. perde La teli) C şeklininkiyle aynı nota: iki şekil kökü paylaşır."], [], 1, true),
    ders("C → A", 70, [iki(C_C, C_A), iki(C_A, C_C), iki(C_C, C_A), tara(C_A)], "İki şekil arasında git gel: ortak kök 3. perdede.", ["El kayarken işaret parmağı La telindeki kökün üstünde kalsın."], [], 2, true),
  ]),
  chapter(P, 2, 1, "G ve E Şekli", ["G şekli 5. perdede (kök kalın Mi 8. perde ve Sol teli 5. perde), E şekli 8. perdede (kök kalın Mi 8. perde): iki şekil kalın Mi'deki kökü paylaşır."], [
    ders("G Şekli", 70, [arp(C_G), tara(C_G)], "Do majör, G şekli 5. perdede.", ["G şeklini tam basmak zordur; tarama için alt dört teli (8.6 7.5 5.4 5.3) ya da üst dört teli kullanabilirsin."], [], 1, true),
    ders("E Şekli", 70, [arp(C_E), tara(C_E)], "Do majör, E şekli 8. perdede (barre).", ["Barre'yi işaret parmağının kemikli kenarıyla bas."], [], 1, true),
    ders("A → G → E", 70, [iki(C_A, C_G), iki(C_G, C_E), iki(C_E, C_G), iki(C_G, C_A)], "Üç şekil arasında yukarı ve aşağı.", ["Her geçişte paylaşılan kökü bul: A–G arasında Sol telindeki Do (5. perde), G–E arasında kalın Mi'deki Do (8. perde)."], [], 2, true),
  ]),
  chapter(P, 2, 2, "D Şekli ve Bütün Sap", ["D şekli 10. perdede (kök Re telinde 10. perde ve Si telinde 13. perde); sonra C şekli 12. perdede yeniden başlar: beş şekil sapı kaplar."], [
    ders("D Şekli", 70, [arp(C_D), tara(C_D)], "Do majör, D şekli 10. perdede.", ["Yalnız ince dört tel; kalın iki teli sustur."], [], 1, true),
    ders("C-A-G-E-D Sırayla", 60, [iki(C_C, C_A), iki(C_G, C_E), iki(C_D, C_C12), iki(C_E, C_G)], "Do majörü beş şekilde sırayla yukarı çık, 12. perdede C şekline var, geri dön.", ["Her şeklin kökünü çalmadan önce gör.", "Kayma sırasında akor çınlamaya devam etmesin: sol eli kaldırarak geç."], [], 2, true),
  ]),
]);

// ── Bölüm 3: Minör CAGED ve Şekil Bağlantıları ───────────────────────────────
const s3 = section(3, "Minör CAGED ve Şekil Bağlantıları", [
  chapter(P, 3, 0, "La Minör: A, G ve E Şekli", ["Minör şekiller majör şekillerin üçlüsü yarım ses inmiş hâlidir. La minör: A şekli açık, G şekli 2–5. perde, E şekli 5. perde."], [
    ders("A ve G Şekli", 70, [arp(AM_A), tara(AM_A), arp(AM_G), tara(AM_G)], "La minör önce açık A şekliyle, sonra G şekliyle (2–5. perde).", ["G minör şeklinde La teli susturulur."], [], 1, true),
    ders("G → E", 70, [arp(AM_G), arp(AM_E), iki(AM_G, AM_E), tara(AM_E)], "G şeklinden E şekline: iki şekil kalın Mi'deki 5. perde kökünü paylaşır.", ["Kökü (5.6) parmağın altında tut, şekli etrafında değiştir."], [], 2, true),
  ]),
  chapter(P, 3, 1, "La Minör: D ve C Şekli", ["D şekli 7. perdede (kök Re telinde), C şekli 9–12. perdede (kök La telinde 12. perde): sonra A şekli 12. perdede yeniden başlar."], [
    ders("D ve C Şekli", 70, [arp(AM_D), tara(AM_D), arp(AM_C), tara(AM_C)], "La minör D şekli 7. perdede, C şekli 9–12. perdede.", ["C minör şeklinde ince Mi ve kalın Mi susturulur."], [], 1, true),
    ders("Beş Minör Şekil", 60, [iki(AM_A, AM_G), iki(AM_E, AM_D), iki(AM_C, AM_D), iki(AM_E, AM_G)], "La minörü beş şekilde yukarı çık ve geri in.", ["Her şeklin kök notalarını sesli say: 'La'."], [], 2, true),
  ]),
  chapter(P, 3, 2, "Bir Pozisyonda Akor Dizisi", ["CAGED'in asıl kazancı: bir tonun akorlarını tek pozisyonda, el kaydırmadan çalmak. 5. pozisyonda La majör: A (E şekli) – D (A şekli) – E (C şekli)."], [
    ders("I – IV – V", 80, [tara(A_MAJ), tara(D_A5), tara(E_C), tara(A_MAJ)], "La majörde I – IV – V, el 4–7. perdede kalır.", ["Üç akor üç farklı şekil; kökler kalın Mi, La ve La telinde."], ["A: La – Do# – Mi · D: Re – Fa# – La · E: Mi – Sol# – Si."]),
    ders("i – iv – V – i", 80, [tara(A_MIN), tara(DM_A5), tara(E_C), tara(A_MIN)], "La minörde i – iv – V – i, aynı pozisyonda.", ["E majör (Sol#) La'ya yarım sesle çeker: armonik minörün dönüşü."], [], 2),
  ]),
]);

// ── Bölüm 4: Triadlar ve Çevrimler ───────────────────────────────────────────
const s4 = section(4, "Triadlar ve Çevrimler", [
  chapter(P, 4, 0, "Üst Üç Tel", ["Çevrim (inversiyon): akorun en pesteki sesi kök değilse. Kök konumu 1 – 3 – 5, 1. çevrim 3 – 5 – 1, 2. çevrim 5 – 1 – 3. Üst üç telde Do majörün üç çevrimi sapı 5. perdeden 17. perdeye kadar kaplar."], [
    ders("Do Majör Çevrimleri", 70, [triad(C_KOK), triad(C_1), triad(C_2), triad(C_KOK2)], "Sol–Si–ince Mi tellerinde Do majör: kök konumu, 1. çevrim, 2. çevrim, kök konumu (oktav).", ["Her çevrimde kökün (Do) hangi telde olduğunu bul."], ["Do – Mi – Sol · Mi – Sol – Do · Sol – Do – Mi."]),
    ders("Çevrimleri Tara", 70, [tara(C_KOK), tara(C_1), tara(C_2), tara(C_KOK2)], "Aynı çevrimler, dörtlük tarama.", ["Yalnız üç tel: pena kısa bir hareketle üç teli birlikte çalsın."], [], 2),
  ]),
  chapter(P, 4, 1, "Orta Üç Tel", ["Re–Sol–Si tellerinde de üç çevrim vardır; ritim gitarında bu küçük dizilişler bas ve klavyeyle çakışmadan akoru verir."], [
    ders("Re–Sol–Si Çevrimleri", 70, [triad(C4_2), triad(C4_KOK), triad(C4_1), triad(C4_KOK)], "Do majör: 2. çevrim 5. perdede, kök konumu 8–10. perdede, 1. çevrim 12–14. perdede.", ["Si telindeki notalar ince Mi'deki çevrimlerden farklı parmak ister; parmak numarasını önceden seç."], ["Sol – Do – Mi · Do – Mi – Sol · Mi – Sol – Do."]),
  ]),
  chapter(P, 4, 2, "Ses Yürütme", ["Ses yürütme (voice leading): akor değişirken en yakın çevrimi seçmek. Sesler en çok bir iki perde hareket eder; akorlar birbirine 'kayar'."], [
    ders("I – IV – V – I", 70, [triad(C_1), triad(F_KOK), triad(G_2), triad(C_1)], "Do majörde C – F – G – C, üst üç telde 7–10. perdede.", ["F'ye geçerken yalnız Sol ve Si telleri hareket eder; ince Mi'deki Do sabit."], ["C: Mi – Sol – Do · F: Fa – La – Do · G: Re – Sol – Si."]),
    ders("i – iv – V – i", 70, [triad(AM_1), triad(DM_KOK), triad(E_2), triad(AM_1)], "La minörde Am – Dm – E – Am, 4–7. perdede.", ["E'deki Sol# (ince Mi 4. perde) La'ya yarım ses çıkar."], ["Am: Do – Mi – La · Dm: Re – Fa – La · E: Si – Mi – Sol#."], 2),
  ]),
]);

export const akorCourse: Course = {
  slug: "akorlar",
  title: "Akorlar",
  cardTitle: "Akorlar · CAGED",
  description: "Akorların yapısı, CAGED şekilleri, şekil bağlantıları ve triad çevrimleri: aynı akoru sapın her yerinde bul.",
  kind: "technique",
  guide: [
    "## Bu kurs kimin için?",
    "Açık akorları ve barre'yi zaten bilen elektro gitarist için. Amaç akor ezberlemek değil, akorun nasıl kurulduğunu ve sapın her bölgesinde nerede olduğunu görmek.",
    "## Akor nasıl oluşur?",
    "Akor bir gamın notalarının üçlü aralıklarla üst üste konmasıdır: kök – üçlü – beşli (triad), üstüne yedili (7'li akorlar), dokuzlu, on birli, on üçlü (genişletilmiş akorlar). Üçlüyü dörtlü ya da ikiliyle değiştirmek sus akorunu verir.",
    "## CAGED",
    "Beş açık akor şekli (C, A, G, E, D) sapta bu sırayla birbirine bağlanır. Aynı akorun beş şekli sapı 12 perdede kaplar; sonra şekiller oktavda tekrar eder. Her şeklin kök notalarını bilmek, akoru, arpejini ve pentatonik kutusunu aynı anda bulmanı sağlar. CAGED şekilleri tablosu Bölüm 2 ve 3'ün ders sayfalarında.",
    "## Kurs planı",
    "Bölüm 1 – Akor yapısı.",
  ],
  sections: [s1, s2, s3, s4],
};
