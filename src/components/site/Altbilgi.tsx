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

/** Alt satırdaki küçük yardımcı bağlantılar (apple.com'daki yasal bağlantılar satırı gibi) */
const ALT_BAGLAR = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/nasil-calismaliyim", label: "Nasıl Çalışmalıyım?" },
  { href: "/profil", label: "İlerleme" },
  { href: "/marka", label: "Marka" },
];

/** Alt bilgi (apple.com gibi): açık gri zemin, 12 px gri yazı; kısa not, site haritası, telif satırı */
export default function Altbilgi() {
  return (
    <footer className="bg-[var(--band)] text-[12px] leading-4 tracking-[-0.01em] text-[var(--altbilgi-yazi)]">
      <div className="mx-auto max-w-[1024px] px-[22px] pb-5 pt-[17px]">
        <p className="border-b border-line pb-[11px] pt-[3px]">
          {SITE.name} kişisel bir gitar akademisidir. İlerlemen bu bilgisayarda saklanır; hiçbir ders kilitli değildir. Şarkı
          kütüphanesindeki parçalar özgün ya da kamu malı düzenlemelerdir.
        </p>
        <nav aria-label="Site haritası" className="grid grid-cols-5 gap-x-5 pt-5">
          {SUTUNLAR.map((s) => (
            <div key={s.baslik}>
              <h2 className="mb-[0.8em] font-sans text-[12px] font-semibold leading-4 tracking-[-0.01em] text-heading">{s.baslik}</h2>
              <ul className="space-y-[0.6em]">
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
        <div className="mt-8 flex flex-wrap items-center gap-x-[30px] gap-y-2 border-t border-line pt-[15px]">
          <p>Telif Hakkı © 2026 {SITE.name}. Kişisel kullanım.</p>
          <ul className="flex flex-wrap items-center">
            {ALT_BAGLAR.map((b, i) => (
              <li key={b.href} className={i ? "ml-[7px] border-l border-line pl-[7px] leading-3" : "leading-3"}>
                <Link href={b.href} className="rounded hover:text-text hover:underline">
                  {b.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="ml-auto">Türkiye · Türkçe</p>
        </div>
      </div>
    </footer>
  );
}
