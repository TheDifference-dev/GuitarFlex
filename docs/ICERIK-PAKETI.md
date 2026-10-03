# İçerik paketi

GuitarFlex'teki kurslar iki kaynaktan gelir:

1. **Yerleşik kurslar**: `src/content/courses.ts` (depoda, herkese açık).
2. **Kişisel içerik paketi**: aşağıdaki iki kökten birindeki `icerik/*.json` dosyaları:
   - `ozel-kaynak/` — proje içindeki, Git'e gönderilmeyen yerel klasör
   - `../GuitarFlex-icerik/` — proje klasörünün yanında duran ayrı (gizli) içerik deposu.
     Masaüstü kısayolu her açılışta bu depoyu da `git pull` ile günceller.

Paketteki bir kurs, aynı `slug`'a sahip yerleşik kursun yerine geçer. Farklı `slug`'lı kurslar listenin sonuna eklenir.
Değişiklikler uygulama yeniden başlatılmadan görünür (sayfayı yenilemek yeterli).

## Klasör yapısı

```
ozel-kaynak/
├── icerik/
│   ├── site.json             # ana sayfa metinleri (isteğe bağlı)
│   ├── alternate-picking.json
│   └── ...
├── gorseller/                # kurs görselleri
└── tablar/                   # Guitar Pro / MusicXML / alphaTex dosyaları
```

## Kurs dosyası

```json
{
  "slug": "alternate-picking",
  "title": "Alternate Picking",
  "description": "Kartta görünen kısa açıklama",
  "kind": "technique",
  "image": "gorseller/alternate-picking.jpg",
  "status": "yakinda",
  "videos": [{ "title": "Video başlığı", "channel": "Kanal", "url": "https://..." }],
  "guide": ["## Rehber başlığı", "Rehber paragrafı"],
  "sections": [
    {
      "number": 1,
      "title": "Bölüm adı",
      "exam": true,
      "chapters": [
        {
          "code": "1.0",
          "title": "Alt bölüm adı",
          "theory": ["Alt bölümdeki her derste görünen müzik bilgisi"],
          "lessons": [
            { "id": "1-0-1", "title": "Ders adı", "bpm": 50, "minutes": 1, "tabFile": "tablar/ders.gp" },
            { "id": "1-0-2", "title": "Ders adı", "bpm": 60, "minutes": 2, "tex": "\\tempo 60 . :8 5.6 7.6 | ..." }
          ]
        }
      ]
    }
  ]
}
```

| Alan | Açıklama |
|---|---|
| `slug` | Adres adı (`/calis/<slug>`). Yerleşik bir kursla aynıysa onun yerine geçer. |
| `kind` | `technique` → "Egzersize Başla", `guide` → "Rehberi Aç" |
| `image` | `ozel-kaynak/` klasörüne göre görsel yolu (png, jpg, webp, gif, svg) |
| `status` | `"yakinda"` verilirse kart soluk ve tıklanamaz görünür |
| `videos` | Sol paneldeki "Eğitim Videoları" listesi |
| `guide` | "Rehber" sekmesi; `## ` ile başlayan satırlar başlık olur |
| `exam` | Bölüm sonunda "Sınav" satırı gösterir |
| `minutes` | Dersin hedef süresi; bu süre dolunca ders tamamlanır (varsayılan 1) |
| `tabFile` | `ozel-kaynak/` klasörüne göre tab dosyası (.gp, .gp3–.gp7, .gpx, .xml, .musicxml, .tex) |
| `tex` | Tab'ı doğrudan alphaTex olarak yazmak için |
| `theory` | "Müzik Bilgisi" kutusu (alt bölümde ya da derste; ikisi birlikte gösterilir) |
| `description`, `tips` | Ders açıklaması ve "İpuçları" kutusu |

`tabFile` ve `tex` yoksa ders, metronom ve elle başlatılan sayaçla çalışılır.

## site.json

```json
{
  "navSubtitle": "Teknik Egzersizler",
  "hero": {
    "eyebrow": "...",
    "title": "...",
    "text": "...",
    "guides": [{ "slug": "...", "title": "...", "text": "...", "button": "Rehberi Aç" }]
  },
  "chordCard": { "eyebrow": "...", "title": "...", "text": "...", "button": "...", "slug": "akorlar" }
}
```

Verilmeyen alanlar yerleşik metinlerle doldurulur.
