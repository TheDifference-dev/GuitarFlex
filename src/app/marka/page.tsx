/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { SITE } from "@/config/site";
import { Bant, SayfaBasi } from "@/components/site/Vitrin";
import UygulamaSimgesi, { type SimgeBoyutu } from "@/components/site/UygulamaSimgesi";
import { OZGUN_GLIF_ADI, OZGUN_GLIFLER, type OzgunGlif } from "@/components/site/glifler/Glifler";
import { RENK_ADI, SIMGE_DOKUMU, SIMGE_RENKLERI, kursSimgesi, type SimgeRengi } from "@/lib/simge";

export const metadata: Metadata = { title: "Marka" };

/** Renk paleti: beyaz, uzay grisi, siyah ve etkileşim için laciverden maviye (globals.css değişkenleriyle aynı değerler) */
const PALETTE = [
  { group: "Beyaz", colors: [{ c: "#FFFFFF", ad: "Zemin" }, { c: "#F5F5F7", ad: "Açık gri" }, { c: "#D2D2D7", ad: "Çizgi" }] },
  { group: "Uzay grisi", colors: [{ c: "#48484A", ad: "Uzay grisi 3" }, { c: "#3A3A3C", ad: "Uzay grisi 2" }, { c: "#2C2C2E", ad: "Uzay grisi 1" }] },
  { group: "Siyah", colors: [{ c: "#000000", ad: "Siyah" }, { c: "#1D1D1F", ad: "Metin" }, { c: "#6E6E73", ad: "İkincil metin" }] },
  {
    group: "Lacivert ve mavi",
    colors: [
      { c: "#0A1630", ad: "Derin lacivert" },
      { c: "#0A2A6B", ad: "Lacivert" },
      { c: "#0071E3", ad: "Düğme mavisi" },
      { c: "#0066CC", ad: "Bağlantı" },
      { c: "#2997FF", ad: "Bağlantı (koyu)" },
    ],
  },
];

/** WCAG 2.1 kontrast oranları (AA: normal yazı ≥ 4,5, büyük yazı ve grafik ≥ 3) */
const KONTRAST = [
  { on: "#FFFFFF", arka: "#0066CC", oran: "5,57", nerede: "Seçili sekme / çip yazısı; bağlantı beyaz zeminde" },
  { on: "#0066CC", arka: "#F5F5F7", oran: "5,11", nerede: "Bağlantı açık gri bantta" },
  { on: "#FFFFFF", arka: "#0071E3", oran: "4,70", nerede: "Birincil düğme (geçişin en açık ucu)" },
  { on: "#FFFFFF", arka: "#0A2A6B", oran: "13,5", nerede: "Birincil düğme (lacivert ucu)" },
  { on: "#2997FF", arka: "#000000", oran: "6,96", nerede: "Bağlantı ve vurgu koyu bantta / koyu modda" },
  { on: "#2997FF", arka: "#0A1630", oran: "5,95", nerede: "Bağlantı koyu bandın lacivert dibinde" },
  { on: "#2997FF", arka: "#1C1C1E", oran: "5,64", nerede: "Vurgu koyu moddaki kartta" },
  { on: "#001433", arka: "#2997FF", oran: "6,07", nerede: "Koyu modda seçili çip yazısı" },
  { on: "#FFFFFF", arka: "#1F5FD6", oran: "5,73", nerede: "Teknik simgesindeki beyaz glif (açık uç)" },
];

const ICON_SIZES = [
  { file: "simge", size: 160 },
  { file: "simge", size: 96 },
  { file: "simge-kucuk", size: 48 },
  { file: "simge-kucuk", size: 32 },
  { file: "simge-kucuk", size: 16 },
];

const USES = [
  { what: "Çizimin iki sürümü", where: "/marka/cizim-acik.png (siyah çizgi, şeffaf zemin) · cizim-koyu.png (#E5E5EA çizgi; koyu bantlar)" },
  { what: "Üst çubuk logosu", where: "/marka/logo.png (çerçevesiz; kağıt zemini kenarlarda şeffaflaşır)" },
  { what: "Uygulama simgesi", where: "/marka/simge.svg · simge-512.png · küçük boyutlar simge-kucuk.svg" },
  { what: "Sekme ve masaüstü", where: "src/app/icon.png · apple-icon.png · desktop/icon.png (512) · desktop/icon.ico (16–256)" },
  { what: "Kapak", where: "/marka/kapak.svg · kapak.png (1600×900) · kapak-kare.png (1080×1080)" },
  { what: "Üretici", where: "scripts/marka-uret.py (kaynak: scripts/kaynak/cizim-kaynak.png)" },
];

const BOYUTLAR: SimgeBoyutu[] = [152, 96, 60, 44, 32, 24];

const AILE_ACIKLAMA: Record<SimgeRengi, string> = {
  teknik: "Bütün gitar tekniği kursları, rehberler, akorlar, seviyeler",
  akustik: "Akustik kursları: teknik ailesinin sıcak, derin tonu",
  teori: "Teori yolları, bölümler, araçlar, ders türleri, ödüller",
  tur: "Şarkı Kütüphanesi ve eşlik türleri",
};

const GLIFLER = Object.keys(OZGUN_GLIFLER) as OzgunGlif[];

export default function BrandPage() {
  return (
    <div>
      <SayfaBasi
        ton="koyu"
        kirinti={[{ label: "Marka" }]}
        baslik="Marka"
        alt="Arda Uğur'un kendi fotoğrafından yaptığı karakalem gitarist çizimi. Çizim çerçevesiz durur, zemini sayfanın zeminine karışır. Siyahtan laciverte zemin, mavi vurgu."
        ek={<img src="/marka/cizim-koyu.png" alt={`${SITE.name} çizimi`} width={1024} height={1024} className="mx-auto mt-8 block h-[420px] w-auto [mask-image:linear-gradient(to_bottom,#000_70%,transparent)]" />}
        className="!pb-0"
      />

      <Bant ton="gri">
        <h2 className="baslik-orta mb-8 text-center">Logo ve uygulama simgesi</h2>
        <div className="mx-auto grid max-w-[1100px] gap-3 md:grid-cols-2">
          <div className="doseme items-stretch gap-6 p-8 text-left">
            <p className="text-xs font-semibold text-muted">Üst çubukta: kutusuz, zemine karışan çizim</p>
            <div className="gnav flex h-12 items-center gap-1.5 rounded-xl px-4 text-[14px] font-semibold text-white/90">
              <img src="/marka/logo.png" alt="" width={34} height={34} className="-my-2 size-[34px]" />
              {SITE.name}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <figure className="overflow-hidden rounded-xl bg-white">
                <img src="/marka/cizim-acik.png" alt="Çizimin açık zemin sürümü" width={1024} height={1024} className="block h-auto w-full" />
                <figcaption className="px-3 py-2 text-xs text-[#6e6e73]">cizim-acik.png · açık zemin</figcaption>
              </figure>
              <figure className="bant-koyu overflow-hidden rounded-xl">
                <img src="/marka/cizim-koyu.png" alt="Çizimin koyu zemin sürümü" width={1024} height={1024} className="block h-auto w-full" />
                <figcaption className="px-3 py-2 text-xs text-muted">cizim-koyu.png · koyu zemin</figcaption>
              </figure>
            </div>
          </div>
          <div className="doseme items-stretch gap-6 p-8 text-left">
            <p className="text-xs font-semibold text-muted">Uygulama simgesi: kağıt zemini kenarlara doğru siyah → laciverde erir</p>
            <div className="flex flex-wrap items-end justify-center gap-6">
              {ICON_SIZES.map((s) => (
                <figure key={`${s.file}-${s.size}`} className="flex flex-col items-center gap-2">
                  <img src={`/marka/${s.file}.svg`} alt={s.size === 160 ? `${SITE.name} simgesi` : ""} width={s.size} height={s.size} />
                  <figcaption className="font-mono text-xs text-muted">{s.size} px</figcaption>
                </figure>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <img src="/marka/kapak-kare.png" alt={`${SITE.name} kare kapak`} width={120} height={120} className="rounded-xl" />
              <p className="text-sm text-muted">Kare kapak · 1080×1080. Sosyal medya paylaşımları için; SVG kaynağında yazı, sistem yazı tipiyle metin olarak durur.</p>
            </div>
          </div>
        </div>
        <img src="/marka/kapak.png" alt={`${SITE.name} — Gitar akademisi kapağı`} width={1600} height={900} className="mx-auto mt-3 block h-auto w-full max-w-[1100px] rounded-[var(--radius-tile)]" />
        <ul className="mx-auto mt-8 max-w-[860px] space-y-1.5 text-sm">
          {USES.map((u) => (
            <li key={u.what}>
              <b className="font-semibold text-heading">{u.what}:</b> <span className="text-muted">{u.where}</span>
            </li>
          ))}
        </ul>
      </Bant>

      <Bant ton="beyaz" id="simgeler" className="scroll-mt-12">
        <h2 className="baslik-orta mb-3 text-center">Uygulama simgeleri</h2>
        <p className="mx-auto mb-10 max-w-[760px] text-center text-muted">
          Uygulamadaki tek simge türü: yuvarlatılmış kare, dikey geçişli zemin, ortada beyaz çizgi glif. Zeminler üç ailedir; glif, tekniğin kendisini gösteren
          sade bir müzik ya da tab işaretidir. {SIMGE_DOKUMU.reduce((n, g) => n + g.simgeler.length, 0)} eşleme.
        </p>
        <div className="mx-auto max-w-[1100px] space-y-12">
          <div className="flex flex-wrap items-end justify-center gap-8">
            {BOYUTLAR.map((b) => (
              <figure key={b} className="flex flex-col items-center gap-2">
                <UygulamaSimgesi simge={kursSimgesi("bend-vibrato")} boyut={b} />
                <figcaption className="font-mono text-xs text-muted">{b} px</figcaption>
              </figure>
            ))}
          </div>
          <ul className="mx-auto grid max-w-[900px] grid-cols-2 gap-3 md:grid-cols-4" aria-label="Simge zemin aileleri">
            {SIMGE_RENKLERI.map((r) => (
              <li key={r} className="card flex flex-col items-center gap-2 p-5 text-center">
                <UygulamaSimgesi simge={{ glif: r === "tur" ? "nota" : r === "teori" ? "kulak" : "slide", renk: r }} boyut={60} />
                <span className="text-[15px] font-semibold">{RENK_ADI[r]}</span>
                <span className="text-xs text-muted">{AILE_ACIKLAMA[r]}</span>
              </li>
            ))}
          </ul>

          <section aria-labelledby="glifler">
            <h3 id="glifler" className="mb-1 text-[21px] font-semibold">
              Özgün glifler <span className="text-sm font-medium text-muted">{GLIFLER.length}</span>
            </h3>
            <p className="mb-5 text-sm text-muted">24×24 ızgara, 1,75 çizgi, yuvarlak uçlar. Her biri 152 ve 32 px&apos;de.</p>
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(10.5rem,1fr))] gap-x-3 gap-y-6">
              {GLIFLER.map((g) => (
                <li key={g} className="flex flex-col items-center gap-2 text-center text-xs">
                  <UygulamaSimgesi simge={{ glif: g, renk: g === "ritim" || g === "klavye" || g === "kulak" || g === "okuma" || g === "armoni" ? "teori" : "teknik" }} boyut={152} />
                  <span className="flex items-center gap-2">
                    <UygulamaSimgesi simge={{ glif: g, renk: g === "ritim" || g === "klavye" || g === "kulak" || g === "okuma" || g === "armoni" ? "teori" : "teknik" }} boyut={32} />
                    {OZGUN_GLIF_ADI[g]}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {SIMGE_DOKUMU.map((g) => (
            <section key={g.baslik}>
              <h3 className="mb-4 text-[21px] font-semibold">
                {g.baslik} <span className="text-sm font-medium text-muted">{g.simgeler.length}</span>
              </h3>
              <ul className="grid grid-cols-[repeat(auto-fill,minmax(6.5rem,1fr))] gap-x-2 gap-y-5">
                {g.simgeler.map((x) => (
                  <li key={x.ad} className="flex flex-col items-center gap-1.5 text-center text-xs leading-tight">
                    <UygulamaSimgesi simge={x.simge} boyut={60} />
                    <span className="break-words">{x.ad}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </Bant>

      <Bant ton="gri">
        <h2 className="baslik-orta mb-8 text-center">Renk paleti</h2>
        <div className="mx-auto grid max-w-[1100px] gap-10 md:grid-cols-2 lg:grid-cols-4">
          {PALETTE.map((p) => (
            <div key={p.group}>
              <h3 className="mb-3 text-center text-[21px] font-semibold">{p.group}</h3>
              <div className="flex flex-wrap justify-center gap-3">
                {p.colors.map(({ c, ad }) => (
                  <div key={c} className="w-28 overflow-hidden rounded-xl border border-line">
                    <div className="h-14" style={{ background: c }} />
                    <p className="bg-panel px-2 pt-1 text-xs font-semibold">{ad}</p>
                    <p className="bg-panel px-2 pb-1 font-mono text-xs text-muted">{c}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-10 flex max-w-[1100px] flex-wrap items-center justify-center gap-4">
          <span className="btn-primary px-[15px] py-2 text-[14px]">Birincil düğme</span>
          <span className="btn-secondary px-[15px] py-2 text-[14px]">İkincil düğme</span>
          <span className="metin-bag">
            Metin bağlantı <span aria-hidden>›</span>
          </span>
          <span className="bant-koyu inline-flex items-center gap-4 rounded-full px-5 py-2">
            <span className="btn-primary px-[15px] py-2 text-[14px]">Koyu bantta</span>
            <span className="metin-bag">
              Bağlantı <span aria-hidden>›</span>
            </span>
          </span>
        </div>
        <h3 className="mt-12 mb-3 text-center text-[21px] font-semibold">Kontrast (WCAG 2.1 AA)</h3>
        <table className="mx-auto w-full max-w-[860px] text-left text-sm">
          <thead className="text-xs text-muted">
            <tr>
              <th className="px-3 py-2 font-semibold">Örnek</th>
              <th className="px-3 py-2 font-semibold">Oran</th>
              <th className="px-3 py-2 font-semibold">Nerede</th>
            </tr>
          </thead>
          <tbody>
            {KONTRAST.map((k) => (
              <tr key={k.on + k.arka} className="border-t border-line">
                <td className="px-3 py-2">
                  <span className="inline-block rounded-md px-2 py-0.5 font-mono text-xs" style={{ color: k.on, background: k.arka }}>
                    {k.on} / {k.arka}
                  </span>
                </td>
                <td className="px-3 py-2 font-mono tabular-nums">{k.oran}:1</td>
                <td className="px-3 py-2 text-muted">{k.nerede}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Bant>
    </div>
  );
}
