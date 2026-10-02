# Muzik — Gitar Akademisi

Kolaydan zora gitar teknikleri, müzik teorisi ve çalışma takibi sunan web sitesi. İleride **Ton Lab** (ünlü şarkıların tonlarını kişinin kendi ekipmanına uyarlama) modülü eklenecek.

## Özellikler

- **Teknik Yolları** (`/yollar`): 12 teknik, 65 egzersiz, her teknik 2–3 seviye. Tüm tablar özgündür.
- **Tab oynatıcı** (`/oynatici`): Guitar Pro (.gp, .gp3–.gp7, .gpx), MusicXML ve alphaTex dosyalarını açar. Özellikler:
  - çoklu enstrüman: track seçimi, mute, solo, ses seviyesi
  - hız (%25–150), metronom, sayım, döngü
  - notaya tıklayıp oradan çalma, sürükleyerek bölüm seçip döngüye alma
  - Tab, Nota+Tab ya da Nota görünümü; yatay mod; zoom
  - kısayollar: Boşluk çal/duraklat, L döngü, M metronom, Esc seçimi kaldır
- **Kişisel arşiv**: `ozel-kaynak/tablar/` klasörüne koyduğun tab dosyaları oynatıcıda "Arşivim" altında listelenir. Bu klasör Git'e gönderilmez.
- **Çalışma takibi**: Çalma süresi otomatik sayılır. En iyi BPM, tamamlanan egzersizler, seri (streak), rütbe ve rozetler (`/ilerleme`).
- **Müzik teorisi** (`/teori`): 10 ders ve interaktif sap gezgini (gamlar, akorlar, aralıklar, Do-Re-Mi).
- **Araçlar** (`/araclar`): Metronom ve 60 saniyelik nota bulma testi.

İlerleme şimdilik tarayıcıda (localStorage) saklanıyor. Üyelik sistemi eklenince Supabase'e taşınacak.

## Çalıştırma

```bash
npm install        # alphaTab dosyalarını public/alphatab altına da kopyalar
npm run dev        # http://localhost:3000
```

Diğer komutlar:

```bash
npm run build          # production build
npm run lint
npm run check-content  # tüm tabları alphaTab ile ayrıştırır, her ölçünün 4/4 olduğunu doğrular
```

## Yapı

```
src/content/techniques.ts   egzersizler (alphaTex formatında tablar)
src/content/tex.ts          tab yazım yardımcıları
src/content/theory.ts       teori dersleri
src/content/songs.ts        oynatıcıyla gelen örnek şarkılar
src/lib/archive.ts          kişisel arşiv (ozel-kaynak/tablar) okuma
src/lib/progress.ts         ilerleme kaydı
src/lib/ranks.ts            rütbe ve rozetler
src/lib/music.ts            nota, gam ve akor hesapları
src/components/             TabPlayer, Fretboard, Metronome, NoteQuiz…
```

### Yeni egzersiz eklemek

`src/content/techniques.ts` içinde ilgili tekniğin `level(...)` listesine bir nesne ekle. Tab yazımı `perde.tel` şeklindedir (tel 1 = ince Mi, tel 6 = kalın Mi). Örnek: `:8 5.6 7.6 5.5{h} 7.5`. Sözdizimi için [alphaTex dokümantasyonuna](https://alphatab.net/docs/alphatex/introduction) bak. Ekledikten sonra `npm run check-content` çalıştır.
