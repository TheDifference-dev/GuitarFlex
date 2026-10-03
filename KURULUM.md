# Kurulum ve Kullanım (Windows)

## A. Bir kerelik kurulum

1. **GitHub Desktop**: https://desktop.github.com → indir, kur, GitHub hesabınla giriş yap.
2. **Node.js**: https://nodejs.org → **LTS** → **Windows Installer (.msi)** → indirilen dosyayı **çift tıklayıp kur**
   (her ekranda *Next*, "Tools for Native Modules" kutusunu işaretleme, sonda *Finish*).
   Kurulumdan sonra bilgisayarı yeniden başlat.
3. **Projeyi indir**: GitHub Desktop → **File → Clone repository** → `TheDifference-dev/Muzik` seç →
   en alttaki **Local path** kutusuna `C:\Projeler\GuitarFlex` yaz → **Clone**.
   > OneDrive klasörü (`...\OneDrive\...`) kullanma: binlerce dosyayı buluta yüklemeye çalışır ve hatalara yol açar.
4. Üstteki **Current branch** menüsünden `claude/charming-bardeen-qvypma` seç.
5. **Repository → Open in Command Prompt** → açılan siyah pencereye:
   ```
   node -v
   ```
   `v24...` gibi bir sürüm görmelisin. Sonra:
   ```
   npm install
   ```
   (birkaç dakika sürer, bir kerelik)

## B. Uygulamayı açmak

Siyah pencerede (GitHub Desktop → **Repository → Open in Command Prompt**):

| Ne istiyorsun? | Komut |
|---|---|
| **Masaüstü uygulaması** (düzenlerken kullan: kod değişikliği pencerede anında görünür) | `npm run desktop` |
| Masaüstü uygulaması, hızlı mod | `npm run desktop:prod` |
| Tarayıcıda web sitesi olarak | `npm run dev` → Chrome'da http://localhost:3000 |

Uygulamayı kapatınca arka plandaki sunucu da kapanır. Web sitesi modunu kapatmak için siyah pencerede **Ctrl + C**.

## C. Güncellemeleri almak

Yeni değişiklikler gönderildiğinde: GitHub Desktop → **Fetch origin** → **Pull origin**.
`package.json` değiştiyse siyah pencerede bir kez `npm install` çalıştır.

## D. Kendi tab arşivin

Guitar Pro / MusicXML dosyalarını `ozel-kaynak\tablar\` klasörüne koy (alt klasörler serbest).
Masaüstü uygulamasında **Dosya → Tab arşivi klasörünü aç** ile bu klasöre doğrudan ulaşırsın.
Dosyalar **Oynatıcı → Arşivim** altında görünür. Bu klasör GitHub'a gönderilmez.

## E. Adı ve renkleri değiştirmek

| Ne | Nerede |
|---|---|
| Uygulama adı, slogan, logo | `src/config/site.ts` |
| Renk paleti (lacivert & siyah) | `src/app/globals.css` dosyasının başı |
| Logo adayları | `public/marka/` (uygulamada alt bilgideki **Marka** sayfası) |

Masaüstü uygulaması `npm run desktop` ile açıkken kaydettiğin değişiklik pencerede anında görünür.

## F. Sorun giderme

- **`npm` / `node` is not recognized** → Node.js kurulmamış ya da pencere kurulumdan önce açılmış. Node.js'i kur, bütün siyah pencereleri kapat, gerekirse bilgisayarı yeniden başlat.
- **`npm install` hata veriyor** → proje OneDrive içinde mi? `C:\Projeler\GuitarFlex` gibi bir yere yeniden clone et.
- Başka bir hata → siyah penceredeki yazının ekran görüntüsünü paylaş.
