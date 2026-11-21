// Dersin A4 yaprağının tek stili: ekranda da yazdırmada da aynı ölçüler (210 × 297 mm, 15/16/12 mm kenar,
// 10.5 pt gövde, iki sütun). Stil yalnız bu bileşenin bulunduğu sayfada geçerlidir (öğe kalkınca stil de kalkar).
// Yaprak her temada beyaz kâğıttır: renk değişkenleri yaprağın içinde açık mod değerlerine çekilir.
// Yazdırmada @page kenarı 0'dır; kenar boşluğunu yaprağın kendisi verir, böylece ekran = PDF.

const CSS = `
.a4-yaprak {
  --bg: #ffffff; --panel: #f2f2f4; --panel-2: #e8e8ed; --line: #c7c7cc; --ink: #1d1d1f; --seg: #ffffff; --elevated: #ffffff;
  --text: #1d1d1f; --heading: #1d1d1f; --muted: #55555a; --accent: #0058b0; --accent-ink: #ffffff; --link: #0058b0;
  --nota-ikincil: #5e5e63; --ok: #1e7a37; --warn: #a34700; --warn-ink: #ffffff; --bad: #c4001a;
  color-scheme: light;
  box-sizing: border-box; width: 210mm; height: 297mm; padding: 15mm 16mm 12mm; overflow: hidden;
  display: flex; flex-direction: column; text-align: left;
  background: #ffffff; color: #1d1d1f; font-size: 10.5pt; line-height: 1.34; letter-spacing: normal;
  box-shadow: 0 0 0 1px rgb(0 0 0 / 0.06), 0 2px 6px rgb(0 0 0 / 0.08), 0 14px 40px -8px rgb(0 0 0 / 0.22);
}
.a4-yaprak *, .a4-yaprak *::before, .a4-yaprak *::after { box-sizing: border-box; }
.a4-yaprak .ders-baski-basi { flex: none; margin-bottom: 3mm; padding-bottom: 2mm; border-bottom: 0.4mm solid #1d1d1f; }
.a4-yaprak .ders-baski-basi .ust { font-size: 8.5pt; letter-spacing: 0.02em; color: #55555a; text-transform: uppercase; margin: 0; }
.a4-yaprak .ders-baski-basi .a4-baslik { font-size: 19pt; line-height: 1.1; font-weight: 700; margin: 0.6mm 0 0.8mm; letter-spacing: -0.01em; }
.a4-yaprak .ders-baski-basi .ozet { font-size: 10.5pt; color: #3a3a3c; margin: 0; }
.a4-yaprak .ders-govde { flex: 1 1 auto; min-height: 0; columns: 2; column-gap: 7mm; column-fill: balance; }
.a4-yaprak .ders-govde > * { margin: 0; }
.a4-yaprak .ders-govde h3 { font-size: 11.5pt; line-height: 1.2; font-weight: 600; margin: 2.2mm 0 0.8mm; break-after: avoid; color: #0058b0; }
.a4-yaprak .ders-bolum:first-child h3 { margin-top: 0; }
.a4-yaprak .ders-govde p, .a4-yaprak .ders-govde li { font-size: 10.5pt; line-height: 1.34; margin: 0 0 1.2mm; orphans: 2; widows: 2; }
.a4-yaprak .ders-govde ol, .a4-yaprak .ders-govde ul { padding-left: 4.5mm; margin: 0; }
.a4-yaprak .ders-govde ol { list-style: decimal; }
.a4-yaprak .ders-govde ul { list-style: disc; }
.a4-yaprak .ders-sekil, .a4-yaprak .ders-tablo-kap, .a4-yaprak .ders-dinle { break-inside: avoid; margin: 1.2mm 0 1.6mm; }
.a4-yaprak .ders-sekil { display: block; }
.a4-yaprak .ders-sekil figcaption { font-size: 8.5pt; line-height: 1.25; margin-top: 0.8mm; color: #55555a; }
.a4-yaprak .ders-sekil .sema-svg { max-width: 100% !important; }
.a4-yaprak .ders-sekil[data-tur="cember"] .sema-svg { width: 58mm !important; margin: 0 auto; display: block; }
.a4-yaprak .ders-sekil[data-tur="piyano"] .sema-svg { width: 52mm !important; }
.a4-yaprak .ders-sekil[data-tur="porte"] svg { max-width: 100% !important; width: 100% !important; height: auto; }
.a4-yaprak .ders-sekil[data-tur="ritim"] svg { max-width: 100% !important; height: auto; }
.a4-yaprak .ders-genis[data-tur="ritim"] svg { max-width: 118mm !important; display: block; margin: 0 auto; }
.a4-yaprak .ders-genis[data-tur="ritim"] p { text-align: center; }
.a4-yaprak .ders-sekil[data-tur="sema"] svg { max-width: 135mm !important; height: auto; display: block; margin: 0 auto; }
.a4-yaprak .ders-sekil .porte-etiket, .a4-yaprak .ders-sekil p { font-size: 8.5pt; margin: 0.5mm 0 0; color: #55555a; }
.a4-yaprak .akor-izgara { display: grid; grid-template-columns: repeat(auto-fill, minmax(15.5mm, 1fr)); gap: 0 1.5mm; }
.a4-yaprak .ders-genis { column-span: all; }
.a4-yaprak .ders-genis .sema-svg { max-width: 142mm !important; margin: 0 auto; display: block; }
.a4-yaprak .ders-tablo-kap { overflow: visible; border: 0; border-radius: 0; }
.a4-yaprak .ders-tablo { font-size: 9pt; line-height: 1.22; width: 100%; border-collapse: collapse; text-align: left; }
.a4-yaprak .ders-tablo caption { font-size: 8.5pt; text-align: left; caption-side: top; margin-bottom: 0.6mm; padding: 0; color: #55555a; }
.a4-yaprak .ders-tablo th, .a4-yaprak .ders-tablo td { padding: 0.5mm 1.2mm; border-bottom: 0.2mm solid #c7c7cc; font-size: 9pt; }
.a4-yaprak .ders-tablo thead th { border-bottom: 0.35mm solid #1d1d1f; color: #1d1d1f; font-weight: 600; }
.a4-yaprak .ders-dinle { display: flex; flex-wrap: wrap; gap: 1mm 1.5mm; }
.a4-yaprak .ders-dinle button {
  display: inline-flex; align-items: center; gap: 1mm; font-size: 9pt; line-height: 1.2; padding: 0.5mm 2mm;
  border: 0.25mm solid #0058b0; border-radius: 99px; color: #0058b0; background: none; cursor: pointer;
}
.a4-yaprak .ders-dinle button:hover { background: rgb(0 88 176 / 0.08); }
.a4-yaprak .ders-dinle button svg { width: 3mm; height: 3mm; }
.a4-yaprak .ders-kaynak { font-size: 8.5pt; color: #55555a; margin-top: 1.5mm; }
.a4-yaprak a { color: #0058b0; }
@media print {
  @page { size: A4; margin: 0; }
  html, body { background: #ffffff !important; color: #1d1d1f !important; margin: 0 !important; }
  body *:not(:has(.ders-yazdir)):not(.ders-yazdir):not(.ders-yazdir *) { display: none !important; }
  body *:has(.ders-yazdir) {
    margin: 0 !important; padding: 0 !important; border: 0 !important; box-shadow: none !important; background: none !important;
    max-width: none !important; width: auto !important; height: auto !important; min-height: 0 !important; position: static !important;
    gap: 0 !important; display: block !important; transform: none !important; overflow: visible !important;
  }
  .ders-ekran, .a4-arac { display: none !important; }
  .a4-yaprak { box-shadow: none; break-inside: avoid; }
  .a4-yaprak .ders-dinle button { border-color: transparent; }
  .a4-yaprak a { color: inherit; text-decoration: none; }
}
`;

export default function A4Stili() {
  return <style>{CSS}</style>;
}
