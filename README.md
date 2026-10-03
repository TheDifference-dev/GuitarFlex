# GuitarFlex — Gitar Akademisi

**GuitarFlex** is a guitar practice platform that runs both as a desktop app (Electron) and as a website (Next.js) from a single codebase.
It offers 12 structured technique courses (550+ original exercises) with an interactive tab player and a music-theory note on every lesson,
a songs & solos library, backing tracks for improvisation, music theory lessons with an interactive fretboard,
practice tracking (streaks, ranks, badges) and a Songsterr-style multi-track Guitar Pro player.

| Ana sayfa | Menü |
|---|---|
| ![Ana sayfa](docs/ekran/ana-sayfa.png) | ![Menü](docs/ekran/menu.png) |
| **Kurs** | **Ders** |
| ![Kurs](docs/ekran/kurs.png) | ![Ders](docs/ekran/ders.png) |
| **Popüler Şarkılar** | **Doğaçlama Çal** |
| ![Popüler Şarkılar](docs/ekran/sarkilar.png) | ![Doğaçlama Çal](docs/ekran/dogaclama.png) |
| **Tab oynatıcı** | **Müzik teorisi** |
| ![Tab oynatıcı](docs/ekran/oynatici.png) | ![Teori](docs/ekran/teori.png) |

## Son güncellemeler

- **Şarkı ve Sololar** bölümü: Popüler Şarkılar (Songsterr bağlantılı, zorluk ve tekniğe göre filtre), Tabla Keşfet ve Doğaçlama Çal (7 eşlik kaydı + önerilen gamlar)
- **12 teknik kursunun tamamı** yeniden yazıldı: 3–6 bölüm, toplam 557 ders; her derste "Müzik Bilgisi" kutusu
- Gam, arpej, sweep, legato ve economy picking parmak düzenleri ile pena yönleri nota verisinden otomatik hesaplanıyor
- Üst menü sütunlu açılır panellere dönüştü
- Başlangıç rehberleri yeni kurslardan seçilmiş derslerle yeniden kuruldu

**Tech stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · alphaTab (tab rendering & MIDI playback) ·
Electron (desktop app with self-updating launcher) · Web Audio API (metronome, note playback)

**Highlights**
- Multi-track Guitar Pro / MusicXML / alphaTex player: per-track mute/solo/volume, speed control, metronome, count-in, click-to-seek, drag-to-loop
- Course structure (course → section → chapter → lesson) with timed lessons, locked sections and per-lesson progress
- Pluggable private content packs (JSON + images + Guitar Pro files) loaded at runtime from a git-ignored folder
- 12 complete technique courses with 550+ original exercises written as alphaTex. Scale fingerings, arpeggio shapes, sequences and pick-stroke directions are computed from pitch data (`src/content/dizi.ts`), and a custom checker (`npm run check-content`) validates every bar's length and every hammer-on/pull-off/slide
- Backing tracks (drums, bass, rhythm guitar) generated as multi-track alphaTex, with suggested scales shown on the fretboard
- Interactive SVG fretboard: scales, chords, intervals, note playback and a timed note-finding quiz
- Desktop launcher that pulls updates from GitHub, rebuilds when needed and starts the app with one click
- Brand assets (logo silhouettes) generated programmatically as SVG (`scripts/logo-ciz.py`)

---

Kolaydan zora gitar teknikleri, müzik teorisi ve çalışma takibi sunan masaüstü uygulaması ve web sitesi. İleride **Ton Lab** (ünlü şarkıların tonlarını kişinin kendi ekipmanına uyarlama) modülü eklenecek.

## Özellikler

- **Kurslar** (`/calis/<kurs>`): Bölüm → alt bölüm (1.0, 1.1 …) → ders yapısı. Her dersin BPM'i ve hedef süresi var; süre dolunca ders tamamlanır.
  Sol panelde Egzersiz/Rehber sekmeleri, eğitim videoları, bölümler ve sınav satırları. 12 teknik kursu (3–6 bölüm, toplam 550'den fazla ders) ve 2 başlangıç rehberi yerleşik gelir.
  Her derste "Müzik Bilgisi" kutusu dersin arkasındaki teoriyi (gam, aralık, akor, ritim) anlatır.
- **İçerik paketi**: `ozel-kaynak/icerik/*.json` ile kendi kurslarını, görsellerini ve tablarını ekleyebilirsin (bkz. [docs/ICERIK-PAKETI.md](docs/ICERIK-PAKETI.md)).
- **Tab oynatıcı** (`/oynatici`): Guitar Pro (.gp, .gp3–.gp7, .gpx), MusicXML ve alphaTex dosyalarını açar. Özellikler:
  - çoklu enstrüman: track seçimi, mute, solo, ses seviyesi
  - hız (%25–150), metronom, sayım, döngü
  - notaya tıklayıp oradan çalma, sürükleyerek bölüm seçip döngüye alma
  - Tab, Nota+Tab ya da Nota görünümü; yatay mod; zoom
  - kısayollar: Boşluk çal/duraklat, L döngü, M metronom, Esc seçimi kaldır
- **Şarkı ve Sololar**: Popüler Şarkılar (zorluk ve tekniğe göre filtrelenen liste; tablar Songsterr'de açılır), Tabla Keşfet (oynatıcı ve arşiv),
  Doğaçlama Çal (davul, bas ve ritim gitarından oluşan 7 eşlik kaydı; üzerinde çalınacak gamlar sap gezgininde gösterilir).
- **Kişisel arşiv**: `ozel-kaynak/tablar/` klasörüne koyduğun tab dosyaları oynatıcıda "Arşivim" altında listelenir. Bu klasör Git'e gönderilmez.
- **Profil** (`/profil`): Çalma süresi otomatik sayılır. Seri (streak), rütbe, rozetler, kurs ilerlemesi, son çalışmalar.
- **Müzik teorisi** (`/teori`): 10 ders ve interaktif sap gezgini (gamlar, akorlar, aralıklar, Do-Re-Mi).
- **Araçlar** (`/araclar`): Metronom ve 60 saniyelik nota bulma testi.

İlerleme şimdilik tarayıcıda (localStorage) saklanıyor. Üyelik sistemi eklenince Supabase'e taşınacak.

## Çalıştırma

Adım adım Windows rehberi: [KURULUM.md](KURULUM.md)

```bash
npm install            # alphaTab dosyalarını public/alphatab altına da kopyalar
npm run desktop        # masaüstü uygulaması (Electron), geliştirme modu
npm run desktop:prod   # masaüstü uygulaması, derlenmiş hızlı mod
npm run kisayol        # Windows: masaüstüne kendini güncelleyen GuitarFlex kısayolu ekler
npm run dev            # web sitesi: http://localhost:3000
```

Masaüstü uygulaması ile web sitesi aynı kodu kullanır; arayüzde yapılan her değişiklik ikisine birden yansır.
Uygulama adı ve logo `src/config/site.ts`, renk paleti (lacivert, turuncu, beyaz) `src/app/globals.css` içinde.
Logo adayları `public/marka/` klasöründe; uygulamada **Marka** sayfasında (alt bilgideki bağlantı) görülebilir.
Logoları yeniden üretmek için: `python3 scripts/logo-ciz.py`.

Diğer komutlar:

```bash
npm run build          # production build
npm run lint
npm run check-content  # tüm tabları alphaTab ile ayrıştırır; ölçü uzunluklarını, bağları ve slide'ları doğrular
```

## Yapı

```
desktop/main.cjs            masaüstü uygulaması (Electron penceresi + menüler)
desktop/guncelle.cjs        kısayoldan açılışta GitHub'dan güncelleme + derleme
desktop/kisayol-olustur.cjs masaüstü / Başlat menüsü kısayolu (Windows)
src/config/site.ts          uygulama adı ve metinleri
src/content/kurslar/        12 teknik kursu (her biri ayrı dosya) ve ortak yardımcılar
src/content/courses.ts      kurs sırası ve başlangıç rehberleri
src/content/dizi.ts         gam, arpej ve sekansları sap üzerine yerleştiren hesaplar
src/content/tex.ts          tab yazım yardımcıları
src/lib/courses.ts          kurs yükleyici (yerleşik + kişisel içerik paketi)
src/content/theory.ts       teori dersleri
src/content/songs.ts        oynatıcıyla gelen örnek şarkılar
src/content/sarkilar.ts     Popüler Şarkılar listesi (Songsterr bağlantıları)
src/content/dogaclama.ts    doğaçlama eşlik kayıtları (davul, bas, ritim gitarı)
src/lib/songs.ts            şarkı listesi + kişisel içerik paketindeki sarkilar.json
src/lib/archive.ts          kişisel arşiv (ozel-kaynak/tablar) okuma
src/lib/progress.ts         ilerleme kaydı
src/lib/ranks.ts            rütbe ve rozetler
src/lib/music.ts            nota, gam ve akor hesapları
src/components/             TabPlayer, Fretboard, SongList, BackingView, Metronome, NoteQuiz…
```

### Yeni ders eklemek

İlgili kursun dosyasında (`src/content/kurslar/<kurs>.ts`) bir alt bölümün ders listesine `ders(başlık, bpm, tab, açıklama, ipuçları, müzik bilgisi)` ekle.
Tab yazımı `perde.tel` şeklindedir (tel 1 = ince Mi, tel 6 = kalın Mi). Örnek: `:8 5.6 7.6 5.5{h} 7.5`.
Gamlar ve arpejler elle yazılmak zorunda değil: `dizi.ts` içindeki `perString`, `inPosition`, `arpShape`, `groups` gibi yardımcılar perdeleri notalardan hesaplar.
Sözdizimi için [alphaTex dokümantasyonuna](https://alphatab.net/docs/alphatex/introduction) bak. Ekledikten sonra `npm run check-content` çalıştır.
