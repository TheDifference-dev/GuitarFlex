// Bend & Vibrato — 5 bölüm, özgün egzersizler.
// Bend değerleri çeyrek ses cinsinden: 2 = yarım ses, 4 = tam ses.
import type { Course } from "../types.ts";
import { tex } from "../tex.ts";
import { chapter, ders, section } from "./ortak.ts";

const P = "bv";
const H = "{b (0 2)}";
const HR = "{b (0 2 0)}";
const F = "{b (0 4)}";
const FR = "{b (0 4 0)}";
const PRE = "{b (4 4 0)}";

/** Referans nota, sus, bend, sus — kulak bend'in hedefini önceden duyar. */
const refBar = (ref: string, bend: string, kind: string) => `:4 ${ref} r ${bend}${kind} r`;

const s1 = section(1, "Vibrato", [
  chapter(P, 1, 0, "Yavaş Vibrato", [
    "Vibrato: notanın perdesini hafifçe ve düzenli olarak inceltip kalınlaştırmak. Sesi 'canlandırır' ve uzatır.",
    "Gitarda vibrato teli perdeye dik yönde itip bırakarak yapılır; hareket parmaktan değil bilekten gelir (kapı kolu çevirir gibi).",
  ], [
    ders("Birlik Notalar", 60, tex(60, [":1 7.3{v}", ":1 8.2{v}", ":1 8.1{v}", ":1 7.4{v}"]), "Her ölçüde bir nota, dört vuruş boyunca vibrato.", ["Yüzük parmağıyla bas, orta parmak destek versin.", "Vibratonun hızı ve genişliği sabit kalsın."], "Re, Sol, Do, La: La minör pentatoniğin notaları. Vibrato en çok cümle sonlarındaki uzun notalarda kullanılır."),
    ders("İkilik Notalar", 60, tex(60, [":2 7.3{v} 5.3{v}", ":2 8.2{v} 5.2{v}", ":2 8.1{v} 5.1{v}", ":2 7.4{v} 5.4{v}"]), "İki vuruşluk notalarda vibrato.", "Kısa notada vibrato daha hızlı başlamalı."),
    ders("Geniş Vibrato", 60, tex(60, [":1 7.3{vw}", ":1 8.2{vw}", ":1 8.1{vw}", ":1 5.1{vw}"]), "Daha geniş ve yavaş vibrato: rock ve blues sesi.", "Geniş vibrato küçük bir bend gibidir; perdeyi yarım sese kadar inceltebilir.", "", 2),
  ]),
  chapter(P, 1, 1, "Parmak Parmak", ["Her parmakla vibrato yapabilmek gerekir; cümle hangi parmakla biterse vibrato onunla yapılır."], [
    ders("İşaret ve Orta", 60, tex(60, [":2 5.3{v} 6.3{v}", ":2 5.2{v} 6.2{v}", ":2 5.1{v} 6.1{v}", ":2 5.4{v} 6.4{v}"]), "5. perde işaret, 6. perde orta parmak.", "İşaret parmağıyla vibrato en zorudur: bilek yine çalışır, parmak sadece tutar."),
    ders("Yüzük ve Serçe", 60, tex(60, [":2 7.3{v} 8.3{v}", ":2 7.2{v} 8.2{v}", ":2 7.1{v} 8.1{v}", ":2 7.4{v} 8.4{v}"]), "7. perde yüzük, 8. perde serçe.", "Serçe parmağıyla vibratoda yüzük ve orta parmak arkadan destek verir."),
    ders("Hepsi Sırayla", 70, tex(70, [":4 5.2{v} 6.2{v} 7.2{v} 8.2{v}", ":4 8.2{v} 7.2{v} 6.2{v} 5.2{v}", ":4 5.1{v} 6.1{v} 7.1{v} 8.1{v}", ":1 5.1{v}"]), "Dört parmakla sırayla, her notada vibrato.", "Her notanın vibratosu aynı genişlikte olsun.", "", 2),
  ]),
  chapter(P, 1, 2, "Melodide Vibrato", ["İyi bir melodide vibrato uzun notalara konur; kısa notalar düz çalınır. Bu kontrast cümleye 'nefes' verir."], [
    ders("Kısa Melodi", 60, tex(60, [":4 5.1 8.1 :2 7.1{v}", ":4 5.1 8.1 :2 10.1{v}", ":4 8.1 7.1 5.1 8.2", ":1 5.1{v}"]), "La minörde kısa bir melodi; uzun notalarda vibrato.", "Kısa notalarda vibrato yapma."),
    ders("Soru – Cevap", 60, tex(60, [":4 5.2 8.2 5.1 :4 7.3{v}", ":1 7.3{v}", ":4 5.2 8.2 5.1 :4 8.1", ":1 5.1{v}"]), "İki ölçülük soru Re'de asılı kalır, cevap La'da biter.", "Sorunun son notası ile cevabın son notasında farklı vibrato dene.", "La kök (tonik) olduğu için 'bitmiş', Re ise 'devam edecek' gibi duyulur."),
    ders("Yavaş Melodi", 50, tex(50, [":2 5.1 :4 8.1 7.1", ":1 5.1{v}", ":2 8.2 :4 5.1 8.2", ":1 7.3{v}", ":2 5.3 :4 7.3 5.3", ":1 7.4{v}", ":4 5.4 7.4 :2 5.3", ":1 7.4{v}"]), "Sekiz ölçülük yavaş bir melodi.", "Vibratoyu notanın sonuna doğru genişlet.", "", 2),
  ]),
]);

const s2 = section(2, "Yarım Ses Bend", [
  chapter(P, 2, 0, "Referansla Bend", [
    "Bend: teli perdeye dik yönde iterek notanın perdesini yükseltmek. Yarım ses bend, bir perde üstteki notaya ulaşır.",
    "Bend'den önce hedef notayı (referans) çalmak, kulağın doğru yüksekliği bulmasını sağlar.",
  ], [
    ders("Si'den Do'ya", 60, tex(60, [refBar("8.1", "7.1", H), refBar("8.1", "7.1", H), refBar("8.1", "7.1", H), refBar("8.1", "7.1", H)]), "İnce Mi telinde 8. perde (Do) referans, 7. perdeden (Si) yarım ses bend.", ["Bend yapan parmağın arkasında diğer parmaklar destek versin.", "Hedef nota ile bend sesi aynı yükseklikte olmalı."]),
    ders("Mi'den Fa'ya", 60, tex(60, [refBar("6.2", "5.2", H), refBar("6.2", "5.2", H), refBar("10.3", "9.3", H), refBar("10.3", "9.3", H)]), "Si telinde Mi → Fa, Sol telinde Mi → Fa.", "İşaret parmağıyla bend zordur; 5.2 için bilek dönüşünü kullan.", "Si–Do ve Mi–Fa, majör/minör gamlardaki iki doğal yarım sestir."),
    ders("Referanssız", 60, tex(60, [":2 7.1" + H + " 5.1", ":2 5.2" + H + " 8.2", ":2 9.3" + H + " 7.3", ":1 5.1{v}"]), "Referans yok: hedefi kulaktan bul.", "Emin değilsen bir önceki derse dön.", "", 2),
  ]),
  chapter(P, 2, 1, "Bend ve Bırakma", ["Bend–bırakma (release): bend'i tutup telin eski yerine dönmesini kontrollü yapmak. Bırakırken nota susmamalı."], [
    ders("Yarım Bend – Bırak", 60, tex(60, [`:2 7.1${HR} 5.1`, `:2 7.1${HR} 5.1`, `:2 5.2${HR} 8.2`, `:2 5.2${HR} 8.2`]), "Bend, bırak, bir alttaki notaya geç.", "Bırakırken parmak teli 'taşır', düşürmez."),
    ders("Sekizlik Bend", 70, tex(70, [`:8 5.1 8.1 7.1${H} 5.1 :2 8.2`, `:8 5.1 8.1 7.1${HR} 5.1 :2 8.2`, `:8 5.2 8.2 5.2${H} 8.2 :2 7.3`, `:1 7.3{v}`]), "Hızlı notaların içinde yarım bend.", "Kısa bend'de hedefe hızlı ulaş."),
    ders("Melodik Bend", 60, tex(60, [`:4 5.1 8.1 7.1${H} 5.1`, `:4 8.2 5.2${H} 8.2 5.1`, `:4 7.1${HR} 5.1 8.2 5.2`, ":1 7.3{v}"]), "Yarım bend'lerle kısa bir melodi.", "Bend'ler melodinin doğal notası gibi duyulsun.", "", 2),
  ]),
  chapter(P, 2, 2, "Blues Rengi", ["Blues'ta küçük üçlü (Do) çeyrek ya da yarım ses bend'le büyük üçlüye doğru 'esnetilir'. Majör ile minör arasındaki bu ses blues'un ruhudur."], [
    ders("Çeyrek Bend", 60, tex(60, [":2 8.1{b (0 1)} 5.1", ":2 8.1{b (0 1)} 5.1", ":2 8.2 8.1{b (0 1)}", ":1 5.1{v}"]), "Do notasında çeyrek ses bend: ne minör ne majör.", "Çok hafif bir itiş yeterli."),
    ders("Blues Cümlesi", 60, tex(60, [":8 5.1 8.1{b (0 1)} 5.1 8.2 :2 5.2{v}", ":8 7.3 5.3 7.3 5.3 :2 7.4{v}", ":8 5.1 8.1{b (0 1)} 5.1 8.2 :2 5.1{v}", ":1 7.4{v}"]), "Çeyrek bend'li klasik blues cümlesi.", "Çeyrek bend'i vibratoyla karıştırma: bend'de nota yükselip orada kalır."),
    ders("Yarım ve Çeyrek", 60, tex(60, [`:4 8.1{b (0 1)} 5.1 7.1${H} 5.1`, `:4 8.2 5.2${H} 8.2 5.1`, `:4 8.1{b (0 1)} 5.1 8.2 5.2`, ":1 7.3{v}"]), "İki bend türü bir arada.", "Kulağın iki farklı yüksekliği ayırt etsin.", "", 2),
  ]),
]);

const s3 = section(3, "Tam Ses Bend", [
  chapter(P, 3, 0, "Referansla Tam Bend", ["Tam ses bend iki perde yukarıdaki notaya ulaşır. Rock ve blues sololarının en karakteristik hareketidir.", "Pentatonikte bend'lenen notalar: Re → Mi, Sol → La, Do → Re. Her biri gamın bir sonraki notasına ulaşır."], [
    ders("Re'den Mi'ye", 60, tex(60, [refBar("9.3", "7.3", F), refBar("9.3", "7.3", F), refBar("9.3", "7.3", F), refBar("9.3", "7.3", F)]), "Sol telinde 9. perde referans, 7. perdeden tam ses bend.", ["Yüzük parmağıyla bend, orta ve işaret parmağı arkadan iter.", "Bend'i başparmak sapın üstüne kanca gibi takılarak destekler."]),
    ders("Sol'den La'ya", 60, tex(60, [refBar("10.2", "8.2", F), refBar("10.2", "8.2", F), refBar("10.1", "8.1", F), refBar("10.1", "8.1", F)]), "Si telinde Sol → La, ince Mi'de Do → Re.", "İnce tellerde bend daha kolay ama perdeyi aşmak da kolay; kulağını dinle."),
    ders("Dört Bend", 60, tex(60, [refBar("9.3", "7.3", F), refBar("10.2", "8.2", F), refBar("10.1", "8.1", F), refBar("12.2", "10.2", F)]), "Dört farklı tam ses bend.", "Hepsinin yüksekliği referansla aynı olmalı.", "", 2),
  ]),
  chapter(P, 3, 1, "Bend ve Bırakma", ["Bend–bırakma, notayı yükseltip geri indirerek 'ağlayan' bir ses verir."], [
    ders("Bend – Bırak", 60, tex(60, [`:2 7.3${FR} 5.3`, `:2 8.2${FR} 5.2`, `:2 8.1${FR} 5.1`, ":1 5.1{v}"]), "Tam bend, bırak, alttaki notaya geç.", "Bırakma da bend kadar kontrollü olmalı."),
    ders("Sekizlik", 70, tex(70, [`:8 5.2 8.2 7.3${F} 5.3 :2 7.4{v}`, `:8 5.1 8.1 8.2${FR} 5.2 :2 7.3{v}`, `:8 5.1 8.1 8.1${F} 5.1 :2 8.2{v}`, ":1 5.2{v}"]), "Hızlı notaların içinde tam bend.", "Bend'e geçerken ritim gecikmesin."),
    ders("Tekrarlı Bend", 70, tex(70, [`:8 7.3${F} 7.3${F} 7.3${FR} 5.3 :2 7.4{v}`, `:8 8.2${F} 8.2${F} 8.2${FR} 5.2 :2 7.3{v}`, `:8 8.1${F} 8.1${F} 8.1${FR} 5.1 :2 8.2{v}`, ":1 5.1{v}"]), "Aynı bend'i art arda tekrar et.", "Her tekrarda bend aynı yüksekliğe ulaşmalı.", "", 2),
  ]),
  chapter(P, 3, 2, "Tepe Pozisyonu", ["Pentatoniğin 12-15. perdelerdeki kutusu (4. kutu) bend için en rahat yerdir: teller gevşek, perdeler dar."], [
    ders("15'te Bend", 60, tex(60, [refBar("17.2", "15.2", F), refBar("17.1", "15.1", F), refBar("15.2", "13.2", F), refBar("16.3", "14.3", F)]), "Re → Mi, Sol → La, Do → Re, La → Si.", "Tepede telin gerginliği az: bend kolay ama aşırıya kaçma.", "La → Si bend'i pentatoniğin dışına (gamın 2. derecesine) çıkar; minör gamın sesini getirir."),
    ders("Tepe Cümlesi", 70, tex(70, [`:8 12.1 15.1 12.1 15.2${F} 13.2 15.2 :4 14.3{v}`, `:8 12.3 14.3 12.3 14.4 12.4 14.4 :4 12.5{v}`, `:8 12.1 15.1${FR} 12.1 15.2 13.2 15.2 :4 12.1{v}`, ":1 14.3{v}"]), "4. kutuda bend'li cümle.", "Bend'den sonraki notayı temiz çal."),
    ders("İki Kutu", 60, tex(60, [`:8 5.1 8.1 5.2 8.2${F} :2 5.1{v}`, `:8 12.1 15.1 13.2 15.2${F} :2 12.1{v}`, `:8 5.1 8.1${F} 5.1 8.2 :2 5.2{v}`, `:8 12.1 15.1${F} 12.1 15.2 :2 14.3{v}`]), "Benzer cümleler 1. ve 4. kutuda, sırayla.", "Kutular arasında elin tek hamlede kaymasını çalış.", "", 2),
  ]),
]);

const s4 = section(4, "İleri Bend", [
  chapter(P, 4, 0, "Unison Bend", ["Unison bend: iki tel aynı anda çalınır, alttaki bend'lenerek üstteki ile aynı notaya ulaşır. İki sesin 'birleşmesi' çok güçlü bir efekt verir."], [
    ders("Re → Mi", 60, tex(60, [`:2 (7.3${F} 5.2) r`, `:2 (7.3${F} 5.2) r`, `:2 (7.3${F} 5.2) (7.3${F} 5.2)`, `:1 (7.3${F} 5.2{v})`]), "Sol telinde 7. perde bend, Si telinde 5. perde (Mi) sabit.", "Alttaki bend üstteki notaya tam ulaşınca 'titreşim' kaybolur; bunu dinle."),
    ders("Sol → La", 60, tex(60, [`:2 (8.2${F} 5.1) r`, `:2 (8.2${F} 5.1) r`, `:2 (8.2${F} 5.1) (8.2${F} 5.1)`, `:1 (8.2${F} 5.1{v})`]), "Si telinde 8. perde bend, ince Mi'de 5. perde (La).", "İşaret parmağı ince Mi'yi bend boyunca sabit basar."),
    ders("Unison Cümlesi", 70, tex(70, [`:8 5.1 8.1 5.1 8.2 :2 (8.2${F} 5.1)`, `:8 5.2 8.2 5.2 7.3 :2 (7.3${F} 5.2)`, `:8 5.1 8.1 5.1 8.2 :2 (8.2${F} 5.1)`, ":1 5.1{v}"]), "Pentatonik cümle + unison bend.", "Unison bend'ler cümlenin 'vurgusu'.", "", 2),
  ]),
  chapter(P, 4, 1, "Ön Bend (Pre-bend)", ["Ön bend: tel önce sessizce bend'lenir, sonra çalınıp bırakılır. Nota yukarıdan 'iner'; ağlayan, insan sesine benzeyen bir etki."], [
    ders("Ön Bend – Bırak", 60, tex(60, [`:2 7.3${PRE} 5.3`, `:2 8.2${PRE} 5.2`, `:2 8.1${PRE} 5.1`, ":1 5.1{v}"]), "Önce bend'le, sonra çal ve bırak.", "Ön bend'in yüksekliğini çalmadan önce tahmin etmek gerekir; referansla kontrol et."),
    ders("Bend ve Ön Bend", 60, tex(60, [`:2 7.3${F} 7.3${PRE}`, `:2 8.2${F} 8.2${PRE}`, `:2 8.1${F} 8.1${PRE}`, ":1 5.1{v}"]), "Aynı notada önce bend sonra ön bend.", "İki hareket simetrik: biri çıkar, biri iner."),
    ders("Ağlayan Cümle", 50, tex(50, [`:4 8.1${PRE} 5.1 8.2${PRE} 5.2`, `:2 7.3${F} :4 5.3 7.3`, `:4 8.2${PRE} 5.2 7.3${PRE} 5.3`, ":1 7.4{v}"]), "Ön bend'lerle yavaş bir cümle.", "Yavaş tempoda her ön bend'in inişi duyulsun.", "", 2),
  ]),
  chapter(P, 4, 2, "Çift Nota Bend", ["Bir tel bend'lenirken diğeri sabit kalır: bend'lenen nota sabit notaya göre aralığını değiştirir (ör. Sol–Do dörtlüsü, La–Do üçlüsüne döner)."], [
    ders("Si Telinde Bend", 60, tex(60, [`:2 (8.2${F} 8.1) r`, `:2 (8.2${F} 8.1) r`, `:2 (8.2${FR} 8.1) 5.1`, ":1 5.1{v}"]), "Si telinde Sol → La, ince Mi'de Do sabit.", "Bend yaparken ince Mi teli parmağın altından kaymasın."),
    ders("Sol Telinde Bend", 60, tex(60, [`:2 (7.3${F} 8.2) r`, `:2 (7.3${F} 8.2) r`, `:2 (7.3${FR} 8.2) 5.2`, ":1 7.4{v}"]), "Sol telinde Re → Mi, Si telinde Sol sabit.", "Rock'n'roll'un klasik çift nota hareketi."),
    ders("Çift Nota Cümlesi", 70, tex(70, [`:8 (8.2${F} 8.1) (8.2${F} 8.1) 5.1 8.2 :2 5.2{v}`, `:8 (7.3${F} 8.2) (7.3${F} 8.2) 5.2 7.3 :2 5.3{v}`, `:8 (8.2${F} 8.1) 5.1 8.2 5.2 :2 7.3{v}`, ":1 7.4{v}"]), "Çift nota bend'leriyle cümle.", "Bend'leri tekrarlarken ritim sabit kalsın.", "", 2),
  ]),
]);

const s5 = section(5, "Cümleler", [
  chapter(P, 5, 0, "Blues Cümleleri", ["Blues cümlelerinde bend, vibrato ve sus aynı önemdedir: cümleler arasında boşluk bırakmak 'konuşma' hissi verir."], [
    ders("Cümle 1", 60, tex(60, [`:8 5.1 8.1 5.1 8.2${F} :2 5.1{v}`, `:4 r :8 8.2 5.2 7.3${FR} 5.3 :4 7.4{v}`, `:8 5.1 8.1 5.1 8.2${F} :2 5.2{v}`, ":1 7.4{v}"]), "Tam bend ve bend–bırakmalı blues cümlesi.", "Cümleler arasındaki sus da müziğin parçası."),
    ders("Cümle 2", 60, tex(60, [`:4 8.1{b (0 1)} 5.1 8.2 5.2`, `:2 7.3${F} 7.3${FR}`, `:8 5.3 7.3 5.3 7.4 :2 5.4{v}`, ":1 7.5{v}"]), "Çeyrek bend ile başlayan, Mi'de biten cümle.", "Son nota Mi (5. derece): cümle 'soru' gibi açık kalır."),
    ders("Cümle 3", 60, tex(60, [`:8 12.1 15.1 12.1 15.2${F} :2 12.1{v}`, `:8 12.1 15.1${FR} 12.1 15.2 13.2 15.2 13.2 14.3`, `:2 14.3${F} 12.3`, ":1 14.3{v}"]), "4. kutuda tepeden cümle.", "Yüksek pozisyonda vibrato daha geniş yapılabilir.", "", 2),
  ]),
  chapter(P, 5, 1, "Rock Cümleleri", ["Rock sololarında tekrarlı bend'ler ve unison bend'ler enerji yaratır."], [
    ders("Tekrar Eden Bend", 80, tex(80, [`:8 15.2${F} 12.1 15.2${F} 12.1 15.2${F} 12.1 15.2${F} 12.1`, `:8 15.2${F} 12.1 15.2${F} 12.1 15.2${FR} 13.2 :4 14.3`, `:8 15.2${F} 12.1 15.2${F} 12.1 15.2${F} 12.1 15.2${F} 12.1`, ":1 12.1{v}"]), "Bend ile açık nota arasında hızlı gidip gelme.", "Bend'i bırakmadan üstteki notayı çal (her bend aynı yükseklikte)."),
    ders("Unison Merdiveni", 70, tex(70, [`:2 (7.3${F} 5.2) (8.2${F} 5.1)`, `:2 (14.3${F} 12.2) (15.2${F} 12.1)`, `:2 (7.3${F} 5.2) (8.2${F} 5.1)`, `:1 (15.2${F} 12.1{v})`]), "Unison bend'ler iki oktavda.", "Pozisyon kayarken bend eli gevşesin."),
    ders("Hızlı Cümle", 80, tex(80, [`:16 5.1 8.1 5.1 8.2 5.1 8.1 5.1 8.2 :4 7.3${F} 5.3`, `:16 5.2 8.2 5.2 7.3 5.2 8.2 5.2 7.3 :2 7.4{v}`, `:16 5.1 8.1 5.1 8.2 5.1 8.1 5.1 8.2 :4 8.2${F} 5.1`, ":1 5.1{v}"]), "Hızlı pentatonik + bend.", "Hızlı kısımdan bend'e geçerken ritmi koru.", "", 2),
  ]),
  chapter(P, 5, 2, "Yavaş Solo", ["Yavaş bir soloda her nota önemlidir. Bend'lerin yüksekliği ve vibratonun karakteri, gitaristin 'sesi'dir."], [
    ders("Solo – Bölüm 1", 50, tex(50, [`:4 5.1 8.1 :2 7.1${H}`, ":1 8.1{v}", `:4 8.2 5.1 :2 8.2${F}`, ":1 5.1{v}"]), "Sekiz ölçülük solonun ilk yarısı.", "Yarım ve tam bend'leri karıştırma; hedefleri dinle.", "", 2),
    ders("Solo – Bölüm 2", 50, tex(50, [`:4 12.1 15.1 :2 15.2${F}`, `:2 15.2${FR} 13.2`, `:4 14.3 12.3 :2 14.3${F}`, ":1 12.3{v}"]), "İkinci yarı: 4. kutuya çık.", "Pozisyon değişimi solonun 'yükselişi'.", "", 2),
    ders("Solo – Tamamı", 50, tex(50, [`:4 5.1 8.1 :2 7.1${H}`, ":1 8.1{v}", `:4 8.2 5.1 :2 8.2${F}`, ":1 5.1{v}", `:4 12.1 15.1 :2 15.2${F}`, `:2 15.2${FR} 13.2`, `:4 14.3 12.3 :2 14.3${F}`, ":1 12.3{v}"]), "Solonun tamamı.", "Bunu duygulu çalabiliyorsan bend ve vibratonun temellerine hakimsin.", "", 3),
  ]),
]);

export const bendVibratoCourse: Course = {
  slug: "bend-vibrato",
  title: "Bend & Vibrato",
  description: "Doğru perdeye bend ve notaya can veren vibrato.",
  kind: "technique",
  icon: "〰",
  guide: [
    "## Bend ve vibrato nedir?",
    "Bend, teli perdeye dik yönde iterek notanın perdesini yükseltmektir. Vibrato ise notanın perdesini hafifçe ve düzenli olarak inceltip kalınlaştırmaktır. İkisi birlikte gitarın 'şarkı söylemesini' sağlar.",
    "## Nasıl çalışılır?",
    "Bend'in en önemli kuralı hedef notaya tam ulaşmaktır; eksik bend akortsuz duyulur. Bu yüzden önce referans notayı çal, sonra bend'le aynı yüksekliği bul. Bend için güç parmaktan değil bilek dönüşünden gelir; başparmak sapın üstüne kanca gibi takılarak destek verir.",
    "## Kurs planı",
    "Bölüm 1 – Vibrato.",
    "Bölüm 2 – Yarım ses bend ve blues rengi.",
    "Bölüm 3 – Tam ses bend.",
    "Bölüm 4 – Unison, ön bend ve çift nota bend.",
    "Bölüm 5 – Cümleler ve yavaş solo.",
  ],
  sections: [s1, s2, s3, s4, s5],
};
