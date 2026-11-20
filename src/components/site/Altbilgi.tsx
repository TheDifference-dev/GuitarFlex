import Link from "next/link";
import { SITE } from "@/config/site";

/** Alt bilgideki site haritası (apple.com'daki gibi küçük, gri, sütunlu) */
const SUTUNLAR: { baslik: string; items: { href: string; label: string }[] }[] = [
  {
    baslik: "Gitar Çalış",
    items: [
      { href: "/elektro", label: "Elektro Gitar" },
      { href: "/akustik", label: "Akustik Gitar" },
      { href: "/seviye", label: "Seviye Yolu" },
      { href: "/kurslar", label: "Tüm Kurslar" },
      { href: "/nasil-calismaliyim", label: "Nasıl Çalışmalıyım?" },
    ],
  },
  {
    baslik: "Teori",
    items: [
      { href: "/teori", label: "Müzik Teorisi" },
      { href: "/calis/armoni", label: "Armoni" },
      { href: "/teori/yol/ritim", label: "Ritim" },
      { href: "/teori/yol/klavye", label: "Klavye Görselleştirme" },
      { href: "/teori/yol/kulak", label: "Kulak Eğitimi" },
    ],
  },
  {
    baslik: "Kütüphane",
    items: [
      { href: "/kutuphane", label: "Şarkı Kütüphanesi" },
      { href: "/sarkilar", label: "Popüler Şarkılar" },
      { href: "/akustik/sarkilar", label: "Akustik Şarkılar" },
      { href: "/oynatici", label: "Tabla Keşfet" },
      { href: "/sarkilar/dogaclama", label: "Doğaçlama Çal" },
    ],
  },
  {
    baslik: "Araçlar",
    items: [
      { href: "/araclar#metronom", label: "Metronom" },
      { href: "/araclar#nota-testi", label: "Nota Bulma Testi" },
      { href: "/teori#sap", label: "Sap Gezgini" },
    ],
  },
  {
    baslik: "Profil",
    items: [
      { href: "/profil", label: "İlerleme ve görevler" },
      { href: "/marka", label: "Marka" },
    ],
  },
];

export default function Altbilgi() {
  return (
    <footer className="uzay-kapsam bg-[var(--uzay)] text-xs leading-[1.33] text-muted">
      <div className="mx-auto max-w-[1100px] px-5 pb-6 pt-8 sm:px-6">
        <p className="border-b border-line pb-4">
          {SITE.name} kişisel bir gitar akademisidir. İlerlemen bu bilgisayarda saklanır; hiçbir ders kilitli değildir.
        </p>
        <nav aria-label="Site haritası" className="grid grid-cols-2 gap-x-6 gap-y-6 pt-6 sm:grid-cols-3 lg:grid-cols-5">
          {SUTUNLAR.map((s) => (
            <div key={s.baslik}>
              <h2 className="mb-2.5 text-xs font-semibold tracking-normal text-heading">{s.baslik}</h2>
              <ul className="space-y-2">
                {s.items.map((b) => (
                  <li key={b.href + b.label}>
                    <Link href={b.href} className="rounded transition hover:text-text hover:underline">
                      {b.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4">
          <p>
            <span className="font-semibold text-text/90">{SITE.name}</span> · {SITE.footer}
          </p>
          <p className="flex gap-3">
            <Link href="/marka" className="rounded hover:text-text hover:underline">
              Marka
            </Link>
            <span aria-hidden className="text-line">
              |
            </span>
            <Link href="/" className="rounded hover:text-text hover:underline">
              Ana sayfa
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
