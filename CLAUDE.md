@AGENTS.md

# Proje kuralları

- `README.md` bir tanıtım (vitrin) sayfasıdır: kurulum, çalıştırma, klasör yapısı ya da içerik ekleme talimatı içermez.
- Her özellik değişikliğinde `README.md` güncellenir: "Son güncellemeler", özellikler ve gerekirse `docs/ekran/` ekran görüntüleri.
- Kurulum ve içerik paketi belgeleri gizli içerik deposunda (GuitarFlex-icerik/belgeler) tutulur.
- Tab içeren her değişiklikten sonra `npm run check-content`, `npx tsc --noEmit` ve `npm run lint` çalıştırılır.
