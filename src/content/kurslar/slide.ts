// Slide — 4 bölüm, özgün egzersizler.
// sl = legato slide (ikinci nota çalınmaz), ss = shift slide (ikinci nota tekrar çalınır),
// sib = aşağıdan kayarak gir, sod = aşağı kayarak çık.
import type { Course } from "../types.ts";
import { tex } from "../tex.ts";
import { chapter, ders, section } from "./ortak.ts";

const P = "sl";
const END = [":1 7.4{v}"];

const s1 = section(1, "Temeller", [
  chapter(P, 1, 0, "Legato Slide", [
    "Slide: parmağı teli bırakmadan bir perdeden diğerine kaydırmak. Legato slide'da ikinci nota pena ile çalınmaz; kayma sesi onu çalar.",
    "Kayarken basınç sabit kalmalı: fazla bastırırsan parmak takılır, az bastırırsan ses kesilir.",
  ], [
    ders("İki Perde", 60, tex(60, [":4 5.3{sl} 7.3 7.3{sl} 5.3", ":4 5.2{sl} 7.2 7.2{sl} 5.2", ":4 5.1{sl} 7.1 7.1{sl} 5.1", ":4 7.3{sl} 9.3 9.3{sl} 7.3"]), "Sol, Si ve ince Mi tellerinde iki perdelik slide, ileri ve geri.", ["Kayan parmağın arkasındaki parmaklar teli hafifçe tutsun.", "Varış notasının ritmini kaçırma."], "İki perde = tam ses. Do→Re, Mi→Fa#… Kayma sırasında aradaki yarım sesler de duyulur."),
    ders("Üç ve Beş Perde", 60, tex(60, [":4 5.3{sl} 8.3 8.3{sl} 5.3", ":4 5.2{sl} 8.2 8.2{sl} 5.2", ":4 5.3{sl} 10.3 10.3{sl} 5.3", ":4 5.2{sl} 10.2 10.2{sl} 5.2"]), "Daha uzun kaymalar: küçük üçlü ve tam dörtlü.", "Uzun kaymada hedef perdeye gözünle önceden bak.", "Üç perde küçük üçlü, beş perde tam dörtlüdür."),
    ders("Oktav Kayması", 60, tex(60, [":2 5.3{sl} 17.3", ":2 17.3{sl} 5.3", ":2 5.2{sl} 17.2", ":2 17.2{sl} 5.2"]), "On iki perdelik kayma: bir oktav.", "Kol hareketi omuzdan gelir; bilek sabit.", "12 perde = 12 yarım ses = bir oktav. Varış notası çıkış notasıyla aynı addır.", 2),
  ]),
  chapter(P, 1, 1, "Shift Slide", ["Shift slide'da varış notası pena ile tekrar çalınır: kayma sesi duyulur ama hedef nota vurgulu başlar."], [
    ders("Tekrar Çalarak", 60, tex(60, [":4 5.3{ss} 7.3 7.3{ss} 5.3", ":4 5.2{ss} 7.2 7.2{ss} 5.2", ":4 5.1{ss} 8.1 8.1{ss} 5.1", ":4 7.4{ss} 9.4 9.4{ss} 7.4"]), "Kay ve varış notasını pena ile çal.", "Pena, parmak hedefe vardığı anda vurur."),
    ders("Sekizlik", 70, tex(70, [":8 5.3{ss} 7.3 5.3 7.3{ss} 9.3 7.3 9.3{ss} 7.3", ":8 5.2{ss} 7.2 5.2 8.2{ss} 10.2 8.2 10.2{ss} 8.2", ":8 5.3{ss} 7.3 5.3 7.3{ss} 9.3 7.3 9.3{ss} 7.3", ":1 7.3{v}"]), "Sekizlik notalarla shift slide.", "Hızlı kaymada parmak kısa mesafeyi tek hareketle geçer."),
    ders("Legato ve Shift", 60, tex(60, [":4 5.3{sl} 7.3 5.3{ss} 7.3", ":4 5.2{sl} 8.2 5.2{ss} 8.2", ":4 5.1{sl} 8.1 5.1{ss} 8.1", ":1 5.1{v}"]), "Aynı slide'ı önce legato, sonra shift olarak çal.", "Farkı dinle: biri yumuşak, biri vurgulu.", "", 2),
  ]),
  chapter(P, 1, 2, "Kayarak Giriş ve Çıkış", ["Notaya aşağıdan kayarak girmek (slide in) ve notadan aşağı kayarak çıkmak (slide out) sese 'süs' katar. Blues ve rock'ta çok yaygındır."], [
    ders("Aşağıdan Giriş", 60, tex(60, [":2 7.3{sib} 5.3", ":2 8.2{sib} 5.2", ":2 8.1{sib} 5.1", ":2 7.4{sib} 5.4"]), "Belirsiz bir perdeden hedef notaya kayarak gir.", "Kayma 2-3 perde aşağıdan başlar; çok kısa."),
    ders("Aşağı Çıkış", 60, tex(60, [":2 7.3{sod} r", ":2 8.2{sod} r", ":2 8.1{sod} r", ":2 7.4{sod} r"]), "Notayı çal ve parmağı aşağı kaydırarak bırak.", "Kayma sonunda basıncı azalt; ses kendiliğinden sönsün."),
    ders("Giriş ve Çıkış", 60, tex(60, [":4 7.3{sib} 5.3 7.3 5.3{sod}", ":4 8.2{sib} 5.2 8.2 5.2{sod}", ":4 8.1{sib} 5.1 8.1 5.1{sod}", ":1 7.4{sib v}"]), "Cümleye kayarak gir, kayarak çık.", "Süslemeler cümlenin önüne geçmesin.", "", 2),
  ]),
]);

const s2 = section(2, "Pozisyon Değiştirme", [
  chapter(P, 2, 0, "Tek Telde Gam", ["Tek telde gam çalmak sapı yatay görmeyi öğretir. Her slide bir pozisyon değişimidir."], [
    ders("İnce Mi – La Minör", 60, tex(60, [":8 5.1 7.1 8.1{sl} 10.1 12.1 13.1{sl} 15.1 17.1", ":8 17.1 15.1{sl} 13.1 12.1 10.1{sl} 8.1 7.1 5.1", ":8 5.1 7.1 8.1{sl} 10.1 12.1 13.1{sl} 15.1 17.1", ":1 17.1{v}"]), "La'dan La'ya tek telde.", "Her üç notada bir kay.", "İnce Mi telinde La minör: 5 La, 7 Si, 8 Do, 10 Re, 12 Mi, 13 Fa, 15 Sol, 17 La."),
    ders("Sol Teli – Sol Majör", 60, tex(60, [":8 0.3 2.3 4.3{sl} 5.3 7.3 9.3{sl} 11.3 12.3", ":8 12.3 11.3{sl} 9.3 7.3 5.3{sl} 4.3 2.3 0.3", ":8 0.3 2.3 4.3{sl} 5.3 7.3 9.3{sl} 11.3 12.3", ":1 12.3{v}"]), "Sol majör, Sol telinde açık telden 12. perdeye.", "Açık telden başlamak yeni başlayanlar için kolaydır.", "Sol majör: Sol–La–Si–Do–Re–Mi–Fa#–Sol. Tek diyezi Fa#."),
    ders("Pentatonik Tek Tel", 70, tex(70, [":8 5.1 8.1{sl} 10.1 12.1{sl} 15.1 17.1 15.1{sl} 12.1", ":8 10.1{sl} 8.1 5.1 8.1{sl} 10.1 12.1{sl} 15.1 17.1", ":8 17.1 15.1{sl} 12.1 10.1{sl} 8.1 5.1 8.1 5.1", ":1 5.1{v}"]), "La minör pentatonik ince Mi telinde.", "Pentatonikte aralıklar geniş: kaymalar 2-3 perde.", "Pentatonik notaları: La – Do – Re – Mi – Sol.", 2),
  ]),
  chapter(P, 2, 1, "Kutular Arası", ["Pentatonik kutular arasında geçişin en doğal yolu slide'dır: bir kutunun notasından diğer kutunun aynı teldeki notasına kayılır."], [
    ders("1. Kutudan 2. Kutuya", 60, tex(60, [":8 5.6 8.6 5.5 7.5 5.4 7.4{sl} 10.4 7.3", ":8 9.3 8.2 10.2 8.1 10.1{sl} 8.1 10.2 8.2", ":8 9.3 7.3 10.4{sl} 7.4 5.4 7.5 5.5 8.6", ":1 5.6{v}"]), "1. kutuda çık, 4. telde 2. kutuya kay.", "Kayma noktasını önceden belirle."),
    ders("1. Kutudan 4. Kutuya", 60, tex(60, [":8 5.1 8.1 5.1 8.2 5.2 8.2{sl} 13.2 15.2", ":8 12.1 15.1 12.1 15.2 13.2{sl} 8.2 5.2 8.2", ":8 5.1 8.1{sl} 12.1 15.1 12.1 15.2 13.2 15.2", ":1 12.1{v}"]), "Pentatoniğin iki ana kutusu arasında kayarak gidip gel.", "Uzun kaymalarda varış notasının ritmine dikkat."),
    ders("Sapın Tamamı", 60, tex(60, [":8 5.4 7.4{sl} 10.4 7.3{sl} 9.3 12.3{sl} 14.3 13.2", ":8 13.2{sl} 15.2 12.1 15.1{sl} 17.1 15.1 12.1 15.2", ":8 13.2{sl} 10.2 12.3 9.3{sl} 7.3 10.4{sl} 7.4 5.4", ":1 7.5{v}"]), "Pentatoniği slide'larla sapın tepesine çık ve in.", "Her slide yeni bir pozisyon.", "", 2),
  ]),
  chapter(P, 2, 2, "Akorlarda Slide", ["Akor slide'ı: aynı şekli koruyarak bütün akoru kaydırmak. Power chord riff'lerinin ve funk gitarının temel hareketi."], [
    ders("Power Chord Slide", 80, tex(80, [":4 (5.6{sl} 7.5{sl}) (8.6 10.5) (8.6{sl} 10.5{sl}) (5.6 7.5)", ":4 (5.6{sl} 7.5{sl}) (10.6 12.5) (10.6{sl} 12.5{sl}) (5.6 7.5)", ":4 (8.6{sl} 10.5{sl}) (12.6 14.5) (12.6{sl} 14.5{sl}) (10.6 12.5)", ":1 (5.6 7.5)"]), "A5 power chord'u kaydırarak C5, D5 ve E5'e geç.", "İki parmak birlikte kayar; şekil bozulmasın.", "A5 – C5 – D5 – E5: La minör pentatoniğin notaları üzerinde power chord'lar, rock riff'lerinin klasik malzemesi."),
    ders("Üçlü Akor Slide", 70, tex(70, [":4 (5.3{sl} 5.2{sl} 5.1{sl}) (7.3 7.2 7.1) (7.3{sl} 7.2{sl} 7.1{sl}) (5.3 5.2 5.1)", ":4 (5.3{sl} 6.2{sl} 5.1{sl}) (7.3 8.2 7.1) (7.3{sl} 8.2{sl} 7.1{sl}) (5.3 6.2 5.1)", ":4 (2.3 1.2 0.1) (5.3{sl} 5.2{sl} 5.1{sl}) (7.3 7.2 7.1) (5.3 5.2 5.1)", ":1 (5.3 5.2 5.1)"]), "İnce üç telde akor şekillerini kaydır.", "Üç parmağın basıncı eşit olmalı.", "5. perdede üç tel Am akorunu (Do–Mi–La), 7. perdede Bm akorunu verir."),
    ders("Funk Slide", 90, tex(90, [":8 (4.4{sl} 5.3{sl}) (5.4 6.3) r (5.4 6.3) r (5.4 6.3) (4.4{sl} 5.3{sl}) (5.4 6.3)", ":8 r (5.4 6.3) r (5.4 6.3) (5.4 6.3) r (5.4 6.3) r", ":8 (4.4{sl} 5.3{sl}) (5.4 6.3) r (5.4 6.3) r (5.4 6.3) (4.4{sl} 5.3{sl}) (5.4 6.3)", ":2 (5.4 6.3) r"]), "İki notalı (double-stop) slide'larla funk ritmi.", "Suslarda sağ el salınmaya devam eder.", "Sol ve Do#, A7 akorunun yedilisi ve üçlüsüdür; aralarındaki artık dörtlü (tritone) funk'ın gerilimli rengini verir. Yarım ses aşağıdan kayarak gelinir.", 2),
  ]),
]);

const s3 = section(3, "Cümlelerde Slide", [
  chapter(P, 3, 0, "Blues Slide'ları", ["Blues'ta slide'lar sözlerin 'kayarak' söylenmesini taklit eder."], [
    ders("Cümle 1", 60, tex(60, [":8 5.3{sl} 7.3 5.2 8.2 :2 5.1{v}", ":8 8.1 5.1 8.2 5.2 :2 7.3{sib v}", ":8 5.3{sl} 7.3 5.2 8.2 :2 5.1{v}", ":1 7.4{v}"]), "Slide ile başlayan blues cümlesi.", "Slide'dan sonraki notalar düz ve net."),
    ders("Cümle 2", 60, tex(60, [":4 7.4{sib} 5.4 7.3{sl} 9.3", ":2 9.3{v} :4 7.3 5.3", ":4 7.4{sib} 5.4 7.3{sl} 9.3", ":2 9.3 7.3{sod}"]), "Slide ile Mi'ye ulaşan cümle.", "Kayarak çıkışla cümleyi 'bitir'."),
    ders("Cümle 3", 60, tex(60, [":8 12.1 15.1 12.1 15.2 13.2{sl} 15.2 12.1 15.2", ":4 13.2{sl} 15.2 14.3 12.3", ":8 14.4{sl} 12.4 14.3 12.3 14.4 12.4 14.5 12.5", ":1 12.5{v}"]), "4. kutuda slide'lı cümle.", "Tepede kaymalar kısa ve hızlı.", "", 2),
  ]),
  chapter(P, 3, 1, "Melodik Slide", ["Yavaş melodilerde slide, notalar arasında 'şarkı söyler gibi' bir geçiş sağlar."], [
    ders("Melodi 1", 50, tex(50, [":4 5.2 7.2{sl} 8.2 r", ":4 8.2{sl} 10.2 8.2 7.2", ":2 5.2 :4 7.3{sl} 9.3", ":1 9.3{v}"]), "Si telinde yavaş melodi.", "Slide'ları acele etme; kayma sesi melodinin parçası.", "Melodi Mi minör (Mi–Fa#–Sol–La–Si–Do–Re) notalarından."),
    ders("Melodi 2", 50, tex(50, [":4 7.1 8.1{sl} 10.1 r", ":4 10.1{sl} 12.1 10.1 8.1", ":2 7.1 :4 5.1{sl} 7.1", ":1 7.1{v}"]), "İnce Mi telinde melodi.", "Si notasında bitiyor: Mi minörün 5. derecesi.", "Mi minörün beşlisi Si; melodi 'açık' kalır."),
    ders("İki Melodi", 50, tex(50, [":4 5.2 7.2{sl} 8.2 r", ":4 8.2{sl} 10.2 8.2 7.2", ":4 7.1 8.1{sl} 10.1 r", ":4 10.1{sl} 12.1 10.1 8.1", ":2 7.1 :4 5.1{sl} 7.1", ":1 12.1{v}"]), "İki melodiyi birleştir, Mi ile bitir.", "Son nota Mi (tonik): melodi kapanır.", "", 2),
  ]),
]);

const s4 = section(4, "Etüt", [
  chapter(P, 4, 0, "Slide Etüdü", ["Etüt, La minör pentatoniğin üç kutusunu slide'larla birbirine bağlar. Her ölçü yeni bir pozisyonda başlar."], [
    ders("Yavaş", 60, tex(60, [":8 5.6 8.6 5.5 7.5{sl} 10.5 7.4 10.4 7.3", ":8 9.3{sl} 12.3 10.2 13.2 10.1 12.1{sl} 15.1 17.1", ":8 17.1 15.1{sl} 12.1 15.2 13.2{sl} 10.2 12.3 9.3", ":8 9.3{sl} 7.3 10.4 7.4 10.5 7.5{sl} 5.5 8.6", ...END]), "Pentatonik etüt, sekizlik.", "Her slide'da pozisyon değişir.", "", 2),
    ders("Orta", 80, tex(80, [":8 5.6 8.6 5.5 7.5{sl} 10.5 7.4 10.4 7.3", ":8 9.3{sl} 12.3 10.2 13.2 10.1 12.1{sl} 15.1 17.1", ":8 17.1 15.1{sl} 12.1 15.2 13.2{sl} 10.2 12.3 9.3", ":8 9.3{sl} 7.3 10.4 7.4 10.5 7.5{sl} 5.5 8.6", ...END]), "Aynı etüt daha hızlı.", "Slide'lar ritmi geciktirmesin.", "", 2),
    ders("Hedef Tempo", 100, tex(100, [":8 5.6 8.6 5.5 7.5{sl} 10.5 7.4 10.4 7.3", ":8 9.3{sl} 12.3 10.2 13.2 10.1 12.1{sl} 15.1 17.1", ":8 17.1 15.1{sl} 12.1 15.2 13.2{sl} 10.2 12.3 9.3", ":8 9.3{sl} 7.3 10.4 7.4 10.5 7.5{sl} 5.5 8.6", ...END]), "Hedef tempoda.", "Bunu akıcı çalabiliyorsan slide'ın temellerine hakimsin.", "", 3),
  ]),
]);

export const slideCourse: Course = {
  slug: "slide",
  title: "Slide",
  description: "Perdeler arasında kayarak bağlı geçişler.",
  kind: "technique",
  icon: "↗",
  guide: [
    "## Slide nedir?",
    "Parmağı teli bırakmadan bir perdeden diğerine kaydırmak. Legato slide'da varış notası çalınmaz; shift slide'da pena ile tekrar çalınır. Notaya aşağıdan kayarak girmek ya da notadan kayarak çıkmak ise süsleme olarak kullanılır.",
    "## Nasıl çalışılır?",
    "Basınç kayma boyunca sabit kalmalı. Varış notasının ritmi kayma yüzünden gecikmemeli: hareket notadan biraz önce başlar.",
    "## Kurs planı",
    "Bölüm 1 – Temeller: legato slide, shift slide, giriş ve çıkış.",
    "Bölüm 2 – Pozisyon değiştirme: tek telde gam, kutular arası, akorlarda slide.",
    "Bölüm 3 – Cümlelerde slide.",
    "Bölüm 4 – Etüt.",
  ],
  sections: [s1, s2, s3, s4],
};
