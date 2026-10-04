// Teori yollarının "Temeller" modülündeki sekmelerin anlatımları (sekme adına göre).

export const MODUL_METIN: Record<string, Record<string, string[]>> = {
  ritim: {
    "Vuruş ve Tempo": [
      "Vuruş (beat), müziğin içinde ayağınla tuttuğun sabit nabızdır. Tempo bu nabzın hızıdır ve dakikadaki vuruş sayısıyla (BPM) ölçülür: 60 BPM saniyede bir vuruş, 120 BPM saniyede iki vuruştur.",
      'Ritim çalışmasında önce nabzı sağlamlaştır: metronomu aç, her tıkla birlikte say ("1, 2, 3, 4") ve ayağınla vur. Hızlanmak için tempoyu 4–5 BPM\'lik küçük adımlarla artır.',
    ],
    "Nota Süreleri": [
      '4/4\'te bir dörtlük nota bir vuruş sürer. İkilik iki, birlik dört vuruştur. Bir dörtlüğü ikiye bölersen iki sekizlik ("1 ve"), dörde bölersen dört onaltılık ("1 e ve a") elde edersin.',
      'Noktalı nota kendi süresinin yarısı kadar uzar: noktalı sekizlik = sekizlik + onaltılık = üç onaltılık. Noktalı sekizlik + onaltılık, bir vuruşu "uzun–kısa" olarak böler.',
      'Üçleme (triole), bir vuruşu ikiye değil üçe eşit böler: "1 – ve – a" yerine "1 – trip – let". Üçlemenin üstünde ya da altında "3" yazar.',
      "Her nota süresinin bir de sus (es) karşılığı vardır; sus da sayılır, sadece çalınmaz.",
    ],
    "Ölçü ve Tartım": [
      "Ölçü işaretinin üstteki sayısı bir ölçüdeki vuruş sayısını, alttaki sayısı vuruşu hangi nota değerinin aldığını gösterir. 4/4'te ölçüde dört dörtlük, 3/4'te üç dörtlük vardır.",
      'Ölçü çizgileri sayımı düzenler: her ölçünün ilk vuruşu ("1") genellikle en güçlü vuruştur. Çalarken kaybolursan bir sonraki "1"e yetiş.',
    ],
    "Vurgular ve Senkop": [
      "4/4'te 1. ve 3. vuruşlar güçlü, 2. ve 4. vuruşlar zayıf sayılır; rock ve pop'ta trampet 2 ve 4'e vurur (backbeat).",
      'Senkop, vurgunun beklenmeyen bir yere, çoğunlukla vuruşun arasına ("ve") kaymasıdır. Sekizlik – dörtlük – sekizlik kalıbında dörtlük nota 1\'in "ve"sinde başlar ve 2. vuruşun üstünden uzar; 2. vuruşta yeni atak yoktur.',
      'Offbeat (vuruş arası) notaları çalarken sayımı yüksek sesle söyle: "1 VE 2 VE". El aşağı-yukarı hareketini durdurma; sadece çalmayacağın yerlerde teli vurma.',
    ],
    "Tab Üzerinde Süreler": [
      "Tablatür hangi tel ve perdeye basılacağını gösterir; süreleri ise tabın altındaki ya da üstündeki ritim işaretleri (saplar, kirişler, bayraklar) verir.",
      "Kirişler aynı vuruş içindeki notaları birbirine bağlar: tek kiriş sekizlik, çift kiriş onaltılık demektir. Sapı olmayan rakam çoğunlukla uzun bir notadır (ikilik ya da birlik).",
      "Uygulamadaki tab oynatıcısında ritim satırı tabın üstünde gösterilir; yavaş tempoda dinleyip sayarak okumayı alıştır.",
    ],
  },
  klavye: {
    "Klavye Anatomisi": [
      "Standart akortta teller inceden kalına 1'den 6'ya numaralanır: 1 ince Mi (E), 2 Si (B), 3 Sol (G), 4 Re (D), 5 La (A), 6 kalın Mi (E).",
      "Her perde bir yarım ses yükseltir. 12. perdede notalar bir oktav yukarıda tekrarlanır; 3, 5, 7, 9, 12, 15 ve 17. perdelerdeki işaretler yön bulmana yardım eder.",
    ],
    "Tab Okuma": [
      "Tab altı çizgiden oluşur. En üstteki çizgi 1. tel (ince Mi), en alttaki 6. tel (kalın Mi)'dir. Çizgideki rakam o telde basılacak perdedir; 0 açık tel demektir.",
      "Alt alta yazılmış rakamlar aynı anda (akor), yan yana yazılanlar sırayla çalınır. h (hammer-on), p (pull-off), / \\ (slide), b (bend) gibi harfler tekniği gösterir.",
    ],
    "Akor Diyagramları": [
      "Akor diyagramı sapı dik olarak gösterir: dikey çizgiler teller (solda kalın Mi), yatay çizgiler perdelerdir. Üstteki kalın çizgi eşiktir.",
      "Noktalar basılacak yerleri, üstteki ○ açık teli, ✕ çalınmayacak teli gösterir. Diyagram eşikten başlamıyorsa yanında başlangıç perdesi yazar; boydan boya çizgi barre demektir.",
    ],
    "Notalar ve Oktavlar": [
      "Doğal notalar Do Re Mi Fa Sol La Si'dir (C D E F G A B). Mi–Fa ve Si–Do arasında yarım ses, diğer komşu doğal notalar arasında tam ses (iki perde) vardır.",
      "Diyez (#) notayı yarım ses yükseltir, bemol (♭) yarım ses alçaltır; Fa# ile Sol♭ aynı perdedir (enarmonik).",
      "Oktav şekilleri: 6. ya da 5. teldeki notanın oktavı iki tel yukarıda, iki perde ileridedir. 4. ya da 3. telden ise Si teli yüzünden üç perde ileridedir. Aynı telde oktav 12 perde yukarıdadır.",
    ],
    "CAGED Sistemi": [
      "CAGED, majör akorun beş açık akor şeklinin (C, A, G, E, D) sap boyunca kaydırılarak her tonda çalınmasıdır. Beş şekil birbirine bağlanır ve sapı kaplar.",
      "Her formun kök notaları sabit tellerdedir: C formu 5. ve 2. tel, A formu 5. ve 3. tel, G formu 6., 3. ve 1. tel, E formu 6., 4. ve 1. tel, D formu 4. ve 2. tel.",
    ],
    "Pentatonik Şekiller": [
      "Minör pentatonik beş notadır: 1, ♭3, 4, 5, ♭7 (La minörde La Do Re Mi Sol). Sap üzerinde her telde iki nota olacak şekilde beş kutu (şekil) oluşturur.",
      "1. şekil 6. teldeki kökten başlar. Şekiller hareketlidir: kökü başka bir perdeye kaydırırsan aynı şekil yeni tonda çalar. Majör pentatonik, göreceli minörüyle aynı şekilleri kullanır (Do majör = La minör).",
    ],
    Aralıklar: [
      "Aralık iki nota arasındaki uzaklıktır ve yarım ses sayısıyla ölçülür: küçük 2'li 1, büyük 2'li 2, küçük 3'lü 3, büyük 3'lü 4, tam 4'lü 5, tritone 6, tam 5'li 7, küçük 6'lı 8, büyük 6'lı 9, küçük 7'li 10, büyük 7'li 11, oktav 12 yarım ses.",
      "Sapta aralıklar şekil olarak tekrarlanır: aynı telde 7 perde yukarısı ya da bir ince telde 2 perde ilerisi tam 5'lidir (Si teline geçerken bir perde kayar).",
    ],
    "Klavye Keşfi": [
      "Sapı ezberlemenin en hızlı yolu her gün kısa turlar atmaktır: bir nota seç ve onu 6 telin hepsinde bul; sonra oktav şekilleriyle kontrol et.",
      "Notaları söyleyerek çal, gam derecelerini (1, 3, 5) akor şekillerinin içinde gör. Bu yoldaki adımlar tam bu alışkanlığı kurar.",
    ],
  },
  kulak: {
    "Kulak Eğitimi Nedir?": [
      "Kulak eğitimi, duyduğun sesleri tanıyıp adlandırma becerisidir: iki ses arasındaki aralık, bir akorun türü, bir şarkının akor yürüyüşü.",
      "Gitarcı için en büyük kazanç, duyduğunu sapta hızlıca bulabilmektir. Her gün 10 dakikalık kısa çalışmalar uzun ve seyrek çalışmalardan daha etkilidir.",
    ],
    "Tiz/Pes ve Oktav": [
      "Tiz ses ince (yüksek frekanslı), pes ses kalın (düşük frekanslı) sestir. Gitarda perdeler ilerledikçe ve ince tellere geçtikçe ses tizleşir.",
      "Oktav, frekansın iki katına çıkmasıdır; iki ses aynı nota adını taşır ve birbirine çok benzer duyulur.",
    ],
    Aralıklar: [
      "Aralıkları tanımak için bildiğin şarkıların ilk iki notasından yararlan; ama en sağlam yöntem aralığın karakterini öğrenmektir: küçük 2'li gergin, tam 5'li boş ve güçlü, büyük 3'lü parlak, küçük 3'lü hüzünlü duyulur.",
    ],
    "Akor Türleri": [
      "Majör akor (1–3–5) parlak, minör akor (1–♭3–5) hüzünlü, eksik (dim, 1–♭3–♭5) gergin ve sıkışık, artık (aug, 1–3–♯5) askıda ve gizemli duyulur.",
      "Sus akorlarında 3'lü yoktur: sus2 (1–2–5) açık, sus4 (1–4–5) çözülmek isteyen bir ses verir. Dört sesli akorlar bu üçlülere 7'li ya da 6'lı ekler.",
    ],
    "Gam Aileleri": [
      "Majör gam (Ionian) parlak, doğal minör (Aeolian) hüzünlüdür. Modlar majör gamın farklı derecelerinden başlar ve her birinin ayırt edici notası vardır: Dorian'da büyük 6'lı, Phrygian'da küçük 2'li, Lydian'da artık 4'lü, Mixolydian'da küçük 7'li.",
      "Pentatonik gamlar beş notalıdır; blues gamı minör pentatoniğe ♭5 (blue note) ekler.",
    ],
    "Akor İlerlemeleri": [
      "Akor yürüyüşleri Roma rakamlarıyla yazılır: büyük harf majör (I, IV, V), küçük harf minör (ii, iii, vi) akordur. Do majörde I = Do, IV = Fa, V = Sol, vi = La minör.",
      "Bası (en kalın notayı) takip et: I'e dönüş \"eve varma\" hissi verir, V gerilim yaratır ve I'e çözülmek ister.",
    ],
    "Alıştırma Tüyoları": [
      "Cevaplamadan önce sesi içinden tekrar söyle. Emin değilsen tekrar dinle; tahmin etme alışkanlığı kulağını geliştirmez.",
      "Yanlış yaptığın soruların açıklamasını oku ve o sesi gitarında çal. Duyduğunu sapta bulmak, kulak ve klavye bilgisini birlikte geliştirir.",
    ],
  },
};
