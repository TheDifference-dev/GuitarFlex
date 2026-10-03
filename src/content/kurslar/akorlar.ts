// Akorlar — 6 bölüm, özgün egzersizler. Akor notaları sözlükten hesaplanır.
import type { Course } from "../types.ts";
import { tex } from "../tex.ts";
import { AKOR, akorNotalari } from "./diziler.ts";
import { chapter, ders, section } from "./ortak.ts";

const P = "ak";
type R = "1" | "2" | "4" | "8";
const chord = (name: string) => `(${AKOR[name]})`;

/** Tarama kalıbı: D = aşağı, U = yukarı, - = boş (el yine salınır) */
function strum(name: string, r: R): string {
  const c = chord(name);
  if (r === "1") return `:1 ${c}{bd}`;
  if (r === "2") return `:2 ${c}{bd} ${c}{bd}`;
  if (r === "4") return `:4 ${c}{bd} ${c}{bd} ${c}{bd} ${c}{bd}`;
  return `:8 ${[..."D-DU-UDU"].map((x) => (x === "-" ? "r" : `${c}{${x === "D" ? "bd" : "bu"}}`)).join(" ")}`;
}
const play = (bpm: number, chords: string[], r: R) => tex(bpm, chords.map((c) => strum(c, r)));
const notes = (chords: string[]) => [...new Set(chords)].map((c) => `${c}: ${akorNotalari(c)}`).join(" · ");
/** Bir akor dizisi için üç ders: bütün, dörtlük, tarama kalıbı */
function trio(chords: string[], tips: string[], bpm = 70) {
  return [
    ders("Ölçü Başına Bir Vuruş", 60, play(60, chords, "1"), `${chords.join(" – ")}: her ölçüde bir kez vur ve akorun çınlamasını dinle.`, tips, `Notalar: ${notes(chords)}.`),
    ders("Dörtlük", bpm, play(bpm, chords, "4"), "Her vuruşta bir aşağı tarama.", tips),
    ders("Tarama Kalıbı", bpm, play(bpm, chords, "8"), "Aşağı – (boş) – aşağı – yukarı – (boş) – yukarı – aşağı – yukarı.", ["El hiç durmadan aşağı-yukarı salınır; boş yerlerde tellere değmez.", ...tips], "", 2),
  ];
}

const T1 = ["Parmak uçlarıyla, perdenin hemen arkasına bas.", "Her teli tek tek çalıp boğuk tel var mı kontrol et."];

// ── Bölüm 1: İlk Akorlar ─────────────────────────────────────────────────────
const s1 = section(1, "İlk Akorlar", [
  chapter(P, 1, 0, "Em ve Am", [
    "Akor, aynı anda çalınan en az üç notadır. En temel akor türü üçlüdür: kök, üçlü ve beşli.",
    "Em'nin iki parmağı (5. ve 4. tel, 2. perde) bir tel aşağı kayıp Si teline 1. perde eklenince Am olur.",
  ], trio(["Em", "Am", "Em", "Am"], T1, 60)),
  chapter(P, 1, 1, "E, A ve D", [
    "Majör akorlar parlak, minör akorlar hüzünlü duyulur. Farkı tek bir nota yaratır: üçlü (majörde 4, minörde 3 yarım ses).",
    "A – D – E: La majörün I – IV – V akorları. Blues ve rock'n'roll'un temel dizisi.",
  ], trio(["A", "D", "E", "A"], [...T1, "D akorunda sadece ince dört teli çal."])),
  chapter(P, 1, 2, "G, C ve D", ["G – C – D: Sol majörün I – IV – V akorları. Yüzlerce halk ve pop şarkısı yalnızca bu üç akorla çalınır."], trio(["G", "C", "D", "G"], [...T1, "C'de 6. teli çalma; G'de 5. teldeki parmak 6. teli hafifçe sustursun."])),
]);

// ── Bölüm 2: Geçişler ────────────────────────────────────────────────────────
const s2 = section(2, "Geçişler", [
  chapter(P, 2, 0, "Sol Majör Dizisi", ["G – Em – C – D (I – vi – IV – V): 1950'lerden beri pop şarkılarının en sevilen dizisi."], trio(["G", "Em", "C", "D"], ["Geçişi vuruştan önce bitir: parmaklar havada toplanıp birlikte iner.", "Ortak parmakları (ör. G ve Em arasında) yerinde bırak."])),
  chapter(P, 2, 1, "La Minör Dizisi", [
    "Am – Dm – E – Am (i – iv – V – i): minör tonun temel kadansı.",
    "E majör akoru La minör gamında yoktur (Sol yerine Sol#). Bu 'ödünç' Sol#, La'ya güçlü bir çekim yaratır: armonik minörün sesi.",
  ], trio(["Am", "Dm", "E", "Am"], ["Am ile E aynı şekli kullanır, sadece bir tel kayar.", "Dm'de 5. ve 6. telleri çalma."])),
  chapter(P, 2, 2, "Hızlı Geçiş", ["Akor geçişini hızlandırmanın yolu: en az parmak hareketiyle geçmek. Ortak notaları (ve parmakları) yerinde bırak."], [
    ders("Yarım Ölçü", 70, tex(70, ["C", "Am", "G", "Em", "C", "Am", "D", "G"].reduce<string[]>((acc, c, i, arr) => (i % 2 ? acc : [...acc, `:2 ${chord(c)}{bd} ${chord(arr[i + 1])}{bd}`]), [])), "Her ölçüde iki akor.", "C ile Am iki parmağı paylaşır: sadece yüzük parmağı hareket eder.", `Notalar: ${notes(["C", "Am", "G", "Em", "D"])}.`),
    ders("Her Vuruş", 60, tex(60, [["G", "C", "D", "Em"], ["C", "D", "G", "G"], ["G", "C", "D", "Em"], ["C", "D", "G", "G"]].map((b) => `:4 ${b.map((c) => `${chord(c)}{bd}`).join(" ")}`)), "Her vuruşta yeni akor.", "Akor tam basılmamış olsa bile vuruşu kaçırma; ritim önce gelir."),
    ders("Bir Dakika Testi", 80, tex(80, Array.from({ length: 8 }, (_, i) => `:4 ${["Am", "C", "Am", "C"].map((c, j) => `${chord(i % 2 ? (j % 2 ? "G" : "Em") : c)}{bd}`).join(" ")}`)), "Am–C ve Em–G arasında hızlı gidip gel.", "Bir dakikada kaç temiz geçiş yaptığını say; her gün sayıyı artır.", "", 2),
  ]),
]);

// ── Bölüm 3: Barre Akorlar ───────────────────────────────────────────────────
const s3 = section(3, "Barre Akorlar", [
  chapter(P, 3, 0, "F Akoru", [
    "Barre: işaret parmağı bütün telleri aynı perdede basar ve 'hareketli bir eşik' görevi görür. F, E akorunun bir perde yukarı taşınmış halidir.",
  ], trio(["C", "F", "C", "F"], ["İşaret parmağını hafifçe yana yatır: kemikli kenar telleri daha iyi basar.", "Başparmak sapın arkasında, orta parmak hizasında."], 60)),
  chapter(P, 3, 1, "Bm Akoru", ["Bm, Am şeklinin 2. perdeye taşınmış halidir (5. telden barre). D – Bm – G – A: Re majörün I – vi – IV – V akorları."], trio(["D", "Bm", "G", "A"], ["Bm'de 6. teli çalma.", "Barre zorluyorsa önce sadece ince dört teli bas."], 60)),
  chapter(P, 3, 2, "Hareketli Barre", [
    "Barre şekilleri sapta kaydırılarak her akoru verir: E şekli 3. perdede G, 5. perdede A; A şekli 3. perdede C, 5. perdede D.",
    "Kök hangi teldeyse (6. ya da 5.) akorun adı o notadır.",
  ], [
    ders("Majör Barre", 70, play(70, ["G (barre)", "C (barre)", "D (barre)", "G (barre)"], "4"), "G – C – D – G, hepsi barre.", "Şekli bozmadan kaydır.", `Notalar: ${notes(["G (barre)", "C (barre)", "D (barre)"])}.`),
    ders("Minör Barre", 70, play(70, ["Am (barre)", "Dm (barre)", "G (barre)", "C (barre)"], "4"), "Am – Dm – G – C: Do majörde vi – ii – V – I.", "Minör şekilde orta parmak kalkar.", `Notalar: ${notes(["Am (barre)", "Dm (barre)", "G (barre)", "C (barre)"])}.`),
    ders("Sol Minör", 70, play(70, ["Gm (barre)", "Cm (barre)", "D (barre)", "Gm (barre)"], "8"), "Gm – Cm – D – Gm: Sol minörde i – iv – V – i.", "D akoru majör: armonik minör.", `Notalar: ${notes(["Gm (barre)", "Cm (barre)", "D (barre)"])}.`, 2),
  ]),
]);

// ── Bölüm 4: 7'li Akorlar ────────────────────────────────────────────────────
const blues = ["A7", "A7", "A7", "A7", "D7", "D7", "A7", "A7", "E7", "D7", "A7", "E7"];
const s4 = section(4, "7'li Akorlar", [
  chapter(P, 4, 0, "Dominant 7", [
    "Dominant 7 akoru majör üçlüye küçük yedili ekler (1 – 3 – 5 – b7). Gerilimlidir ve bir dörtlü yukarıdaki akora çözülmek ister.",
  ], [
    ders("A7 – D7 – E7", 70, play(70, ["A7", "D7", "E7", "A7"], "4"), "Blues'un üç akoru.", "Açık 7'li akorlar genellikle tam akordan bir parmak eksiktir.", `Notalar: ${notes(["A7", "D7", "E7"])}.`),
    ders("G7 → C", 70, play(70, ["G7", "C", "G7", "C"], "4"), "Dominant 7'nin çözülmesi: V7 → I.", "G7'deki Fa, C'deki Mi'ye; Si ise Do'ya yarım sesle iner/çıkar.", `Notalar: ${notes(["G7", "C"])}.`),
    ders("B7 → Em", 70, play(70, ["Em", "B7", "Em", "B7"], "8"), "Minörde V7 → i: B7 – Em.", "B7'de dört parmak: önce yavaş.", `Notalar: ${notes(["Em", "B7"])}. B7'deki Re#, Mi'ye yarım sesle çözülür.`, 2),
  ]),
  chapter(P, 4, 1, "Majör 7 ve Minör 7", ["Majör 7 (1 – 3 – 5 – 7) yumuşak ve açık, minör 7 (1 – b3 – 5 – b7) sıcak ve dingin duyulur."], [
    ders("Cmaj7 – Fmaj7", 60, play(60, ["Cmaj7", "Fmaj7", "Cmaj7", "Fmaj7"], "2"), "İki majör 7.", "Fmaj7'de 5. ve 6. telleri çalma.", `Notalar: ${notes(["Cmaj7", "Fmaj7"])}.`),
    ders("Am7 – Dm7 – Em7", 60, play(60, ["Am7", "Dm7", "Em7", "Am7"], "4"), "Üç minör 7.", "Minör 7 akorları açık tellerle kolay çalınır.", `Notalar: ${notes(["Am7", "Dm7", "Em7"])}.`),
    ders("I – vi – ii – V", 70, play(70, ["Cmaj7", "Am7", "Dm7", "G7"], "8"), "Cmaj7 – Am7 – Dm7 – G7: caz standartlarının döngüsü.", "Akorların sesi 'kayıyor' gibi: ortak notalar çok.", `Notalar: ${notes(["Cmaj7", "Am7", "Dm7", "G7"])}.`, 2),
  ]),
  chapter(P, 4, 2, "12 Ölçü Blues", [
    "12 ölçü blues: I – I – I – I – IV – IV – I – I – V – IV – I – V. La'da: A7 – D7 – E7.",
    "Bluesta bütün akorlar dominant 7'dir; bu da türün 'kirli', gerilimli sesini verir.",
  ], [
    ders("Bütün Notalar", 60, play(60, blues, "1"), "12 ölçünün akorlarını tanı.", "Ölçüleri say: 4 + 4 + 4.", `Notalar: ${notes(["A7", "D7", "E7"])}.`),
    ders("Dörtlük", 80, play(80, blues, "4"), "Her vuruşta tarama.", "5. ve 9. ölçüdeki akor değişimlerini önceden hazırla.", "", 2),
    ders("Tarama Kalıbı", 80, play(80, blues, "8"), "Tarama kalıbıyla 12 ölçü.", "Son ölçüdeki E7 başa dönüşü (turnaround) hazırlar.", "", 3),
  ]),
]);

// ── Bölüm 5: Renkler ─────────────────────────────────────────────────────────
const s5 = section(5, "Renkler", [
  chapter(P, 5, 0, "Sus Akorları", [
    "Sus (suspended, asılı) akorlarda üçlünün yerini ikili (sus2) ya da dörtlü (sus4) alır. Akor ne majör ne minördür; 'asılı' kalır ve genellikle majöre çözülür.",
  ], [
    ders("D ve Sus'ları", 70, play(70, ["D", "Dsus4", "D", "Dsus2"], "4"), "D – Dsus4 – D – Dsus2.", "Sadece serçe ya da orta parmak hareket eder.", `Notalar: ${notes(["D", "Dsus4", "Dsus2"])}.`),
    ders("A ve Sus'ları", 70, play(70, ["A", "Asus4", "A", "Asus2"], "4"), "A – Asus4 – A – Asus2.", "Asus2'de Si teli açık.", `Notalar: ${notes(["A", "Asus4", "Asus2"])}.`),
    ders("Sus Süslemesi", 80, tex(80, [["D", "Dsus4"], ["D", "Dsus2"], ["A", "Asus4"], ["A", "Asus2"]].map(([a, b]) => `:8 ${chord(a)}{bd} r ${chord(a)}{bd} ${chord(b)}{bu} r ${chord(a)}{bu} ${chord(a)}{bd} ${chord(a)}{bu}`)), "Tarama sırasında sus akoruna kısa dokunuşlar.", "Rock ve folk eşliklerinin klasik süsü.", "", 2),
  ]),
  chapter(P, 5, 1, "Add9 ve Rock G", ["Add9 akoru majör üçlüye dokuzlu (bir oktav üstteki ikili) ekler: Cadd9 = Do–Mi–Sol + Re. Yüzük ve serçe parmaklar Si ve ince Mi tellerinde sabit kalır: akustik pop'un 'çınlayan' sesi."], [
    ders("Sabit Parmaklar", 60, play(60, ["G5/D", "Cadd9", "Dsus4", "Em7"], "2"), "G – Cadd9 – Dsus4 – Em7.", "3. perdedeki iki parmak (Si ve ince Mi) hiç kalkmaz.", `Notalar: ${notes(["G5/D", "Cadd9", "Dsus4", "Em7"])}.`),
    ders("Dörtlük", 70, play(70, ["G5/D", "Cadd9", "Dsus4", "Em7"], "4"), "Her vuruşta tarama.", "Bas teller dışındaki notalar ortak: geçişler kolay."),
    ders("Tarama Kalıbı", 80, play(80, ["Em7", "G5/D", "Dsus4", "Cadd9"], "8"), "Farklı sırayla, tarama kalıbı.", "Akustik gitarda bu dizi çok dolgun duyulur.", "", 2),
  ]),
  chapter(P, 5, 2, "Bas Yürüyüşü", ["Slash akor (ör. D/F#): akorun bası kök dışında bir nota. Bas notaları adım adım ilerleyince akorlar arasında akıcı bir 'yürüyüş' oluşur."], [
    ders("Sol'den İnen Bas", 70, play(70, ["G", "D/F#", "Em", "C"], "4"), "G – D/F# – Em – C: bas Sol – Fa# – Mi – Do.", "D/F#'de başparmak 6. teli basabilir ya da işaret parmağı kullanılır.", `Notalar: ${notes(["G", "D/F#", "Em", "C"])}.`),
    ders("Do'dan İnen Bas", 70, play(70, ["C", "G/B", "Am", "Am/G"], "4"), "C – G/B – Am – Am/G: bas Do – Si – La – Sol.", "Her akorda sadece bas parmağı hareket eder.", `Notalar: ${notes(["C", "G/B", "Am", "Am/G"])}.`),
    ders("Kromatik İniş", 70, play(70, ["Am", "Am/G", "Am/F#", "Fmaj7/E"], "8"), "Am üzerinde bas La – Sol – Fa# – Mi diye iner.", "Üstteki akor neredeyse sabit; hareket basta.", "Bu iniş klasik bir 'hüzünlü' harekettir: minör akorun altında bas yarım ve tam seslerle iner.", 2),
  ]),
]);

// ── Bölüm 6: Tonlar ──────────────────────────────────────────────────────────
const s6 = section(6, "Tonlar ve Diziler", [
  chapter(P, 6, 0, "Sol Majör Tonu", [
    "Bir tonun akorları gamın her notasına üçlü kurularak bulunur. Majör tonda sıra hep aynıdır: I majör, ii minör, iii minör, IV majör, V majör, vi minör (vii eksik).",
    "Sol majörde: G – Am – Bm – C – D – Em.",
  ], [
    ders("Tonun Akorları", 60, play(60, ["G", "Am", "Bm", "C", "D", "Em", "D", "G"], "1"), "Sol majörün altı akoru sırayla.", "Sıralı çalınca akorların gamı 'merdiven' gibi çıktığını duy.", `Notalar: ${notes(["G", "Am", "Bm", "C", "D", "Em"])}.`),
    ders("I – IV – V", 70, play(70, ["G", "C", "D", "G"], "8"), "Tonun üç ana akoru.", "Bu üç akor tonun bütün notalarını içerir."),
    ders("ii – V – I", 70, play(70, ["Am", "D", "G", "G"], "8"), "Am – D – G: en güçlü kadans hareketlerinden biri.", "ii – V – I caz ve pop'ta 'eve dönüş' hissi verir.", "", 2),
  ]),
  chapter(P, 6, 1, "Do Majör Tonu", ["Do majörün akorları: C – Dm – Em – F – G – Am. Hiç diyez/bemol yok: hepsi beyaz tuşlar."], [
    ders("Tonun Akorları", 60, play(60, ["C", "Dm", "Em", "F", "G", "Am", "G", "C"], "1"), "Do majörün altı akoru sırayla.", "F barre: zorlarsa Fmaj7 ile değiştir.", `Notalar: ${notes(["C", "Dm", "Em", "F", "G", "Am"])}.`),
    ders("I – vi – IV – V", 70, play(70, ["C", "Am", "F", "G"], "8"), "C – Am – F – G.", "50'lerin dizisi Do majörde."),
    ders("ii – V – I", 70, play(70, ["Dm", "G7", "C", "C"], "8"), "Dm – G7 – C.", "G7'deki Fa → Mi ve Si → Do çözülmelerini dinle.", "", 2),
  ]),
  chapter(P, 6, 2, "La Minör Tonu", ["La minörün akorları: Am – (Bdim) – C – Dm – Em – F – G. V akoru çoğunlukla majör (E) çalınır: armonik minörden ödünç Sol#."], [
    ders("i – iv – v ve V", 60, play(60, ["Am", "Dm", "Em", "Am", "Am", "Dm", "E", "Am"], "4"), "Önce Em ile, sonra E ile aynı dizi.", "Farkı dinle: E akoru dönüşü çok daha 'kesin' yapar.", `Notalar: ${notes(["Am", "Dm", "Em", "E"])}.`),
    ders("Endülüs Kadansı", 70, play(70, ["Am", "G", "F", "E"], "8"), "Am – G – F – E.", "Bas La – Sol – Fa – Mi diye iner."),
    ders("i – VI – III – VII", 80, play(80, ["Am", "F", "C", "G"], "8"), "Am – F – C – G: minör tonda pop dizisi.", "Bunu akıcı çalabiliyorsan akorların temellerine hakimsin.", "", 2),
  ]),
]);

export const akorCourse: Course = {
  slug: "akorlar",
  title: "Akorlar",
  description: "Açık akorlar, barre akorlar ve hızlı geçişler.",
  kind: "technique",
  icon: "♫",
  guide: [
    "## Akor nedir?",
    "Aynı anda çalınan en az üç nota. Akorlar gamın notaları üzerine üçlü aralıklarla kurulur; majör, minör, 7'li ve sus akorlar bu yapının çeşitleridir.",
    "## Nasıl çalışılır?",
    "Önce her akoru tek tek temiz çal: her teli ayrı ayrı çalıp boğuk tel var mı kontrol et. Sonra geçişleri çalış; ritim hiçbir zaman akor için beklemez.",
    "## Kurs planı",
    "Bölüm 1 – İlk akorlar.",
    "Bölüm 2 – Geçişler.",
    "Bölüm 3 – Barre akorlar.",
    "Bölüm 4 – 7'li akorlar ve 12 ölçü blues.",
    "Bölüm 5 – Renkler: sus, add9, bas yürüyüşü.",
    "Bölüm 6 – Tonlar ve diziler.",
  ],
  sections: [s1, s2, s3, s4, s5, s6],
};
