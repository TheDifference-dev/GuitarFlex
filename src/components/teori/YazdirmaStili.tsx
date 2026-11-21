// Dersin yazdırma stili: yalnız bu bileşenin bulunduğu sayfada geçerlidir (öğe sayfadan kalkınca stil de kalkar).
// A4, 16 mm kenar, 10.5 pt gövde, iki sütun; gezinme, alt bilgi ve dersin dışındaki her şey gizlenir.
// Koyu modda yazdırılsa bile kâğıt beyaz kalsın diye renk değişkenleri açık mod değerlerine çekilir.

const CSS = `
@media print {
  @page { size: A4; margin: 15mm 16mm 12mm; }
  :root:root:root {
    color-scheme: light;
    --bg: #ffffff; --panel: #f2f2f4; --panel-2: #e8e8ed; --line: #c7c7cc; --ink: #1d1d1f; --seg: #ffffff; --elevated: #ffffff;
    --text: #1d1d1f; --heading: #1d1d1f; --muted: #55555a; --accent: #0058b0; --accent-ink: #ffffff; --link: #0058b0;
    --nota-ikincil: #5e5e63; --ok: #1e7a37; --warn: #a34700; --warn-ink: #ffffff; --bad: #c4001a;
  }
  html, body { background: #ffffff !important; color: #1d1d1f !important; }
  body *:not(:has(.ders-yazdir)):not(.ders-yazdir):not(.ders-yazdir *) { display: none !important; }
  body *:has(.ders-yazdir) {
    margin: 0 !important; padding: 0 !important; border: 0 !important; box-shadow: none !important; background: none !important;
    max-width: none !important; width: auto !important; min-height: 0 !important; position: static !important; gap: 0 !important; display: block !important;
  }
  .ders-ekran { display: none !important; }
  .ders-baski-basi { display: block !important; margin-bottom: 3mm; padding-bottom: 2mm; border-bottom: 0.4mm solid #1d1d1f; }
  .ders-baski-basi .ust { font-size: 8.5pt; letter-spacing: 0.02em; color: #55555a; text-transform: uppercase; }
  .ders-baski-basi h1 { font-size: 19pt; line-height: 1.1; font-weight: 700; margin: 0.6mm 0 0.8mm; }
  .ders-baski-basi .ozet { font-size: 10.5pt; color: #3a3a3c; }
  .ders-yazdir { font-size: 10.5pt !important; line-height: 1.34 !important; color: #1d1d1f; }
  .ders-govde { display: block !important; columns: 2; column-gap: 7mm; column-fill: balance; }
  .ders-govde > * { margin: 0 !important; }
  .ders-bolum { break-inside: auto; }
  .ders-govde h2 { font-size: 11.5pt !important; line-height: 1.2 !important; margin: 2.2mm 0 0.8mm !important; break-after: avoid; color: #0058b0; }
  .ders-bolum:first-child h2 { margin-top: 0 !important; }
  .ders-govde p, .ders-govde li { font-size: 10.5pt !important; line-height: 1.34 !important; margin: 0 0 1.2mm !important; orphans: 2; widows: 2; }
  .ders-govde ol, .ders-govde ul { padding-left: 4.5mm !important; margin: 0 !important; }
  .ders-sekil, .ders-tablo-kap, .ders-dinle { break-inside: avoid; margin: 1.2mm 0 1.6mm !important; }
  .ders-sekil { display: block !important; }
  .ders-sekil figcaption { font-size: 8.5pt !important; line-height: 1.25 !important; margin-top: 0.8mm; }
  .ders-sekil .sema-svg { max-width: 100% !important; }
  .ders-sekil[data-tur="cember"] .sema-svg { width: 58mm !important; margin: 0 auto; display: block; }
  .ders-sekil[data-tur="piyano"] .sema-svg { width: 52mm !important; }
  .ders-sekil[data-tur="porte"] svg { max-width: 100% !important; width: 100% !important; height: auto; }
  .ders-sekil[data-tur="ritim"] svg { max-width: 100% !important; height: auto; }
  .ders-genis[data-tur="ritim"] svg { max-width: 118mm !important; display: block; margin: 0 auto; }
  .ders-genis[data-tur="ritim"] p { text-align: center; }
  .ders-sekil[data-tur="sema"] svg { max-width: 135mm !important; height: auto; display: block; margin: 0 auto; }
  .ders-sekil .porte-etiket, .ders-sekil p { font-size: 8.5pt !important; margin: 0.5mm 0 0 !important; }
  .akor-izgara { display: grid !important; grid-template-columns: repeat(auto-fill, minmax(15.5mm, 1fr)) !important; gap: 0 1.5mm !important; }
  .ders-genis { column-span: all; }
  .ders-genis .sema-svg { max-width: 142mm !important; margin: 0 auto; display: block; }
  .ders-tablo-kap { overflow: visible !important; border: 0 !important; }
  .ders-tablo { font-size: 9pt !important; line-height: 1.22 !important; width: 100%; border-collapse: collapse; }
  .ders-tablo caption { font-size: 8.5pt !important; text-align: left; caption-side: top; margin-bottom: 0.6mm; }
  .ders-tablo th, .ders-tablo td { padding: 0.5mm 1.2mm !important; border-bottom: 0.2mm solid #c7c7cc; }
  .ders-tablo thead th { border-bottom: 0.35mm solid #1d1d1f; color: #1d1d1f; }
  .ders-dinle { display: block !important; }
  .ders-dinle button { display: inline !important; border: 0 !important; background: none !important; padding: 0 !important; margin: 0 3mm 0 0 !important; font-size: 9.5pt !important; color: #1d1d1f !important; box-shadow: none !important; min-height: 0 !important; }
  .ders-kaynak { font-size: 8.5pt !important; color: #55555a; margin-top: 1.5mm !important; }
  a { color: inherit !important; text-decoration: none !important; }
}
`;

export default function YazdirmaStili() {
  return <style>{CSS}</style>;
}
