import type { Metadata } from "next";
import SarkiKutuphanesiArama from "@/components/SarkiKutuphanesiArama";
import SongsNav from "@/components/SongsNav";
import SarkiSeridi, { type SeritSarki } from "@/components/SarkiSeridi";
import { MADALYALAR, songUrl, type Madalya, type PopularSong } from "@/content/sarkilar";
import { Bant, HapBag, MetinBag } from "@/components/site/Vitrin";
import UygulamaSimgesi from "@/components/site/UygulamaSimgesi";
import Kirinti from "@/components/site/Kirinti";
import { kapakTuru } from "@/components/SarkiKapagi";
import { kursSimgesi, yerSimgesi, type SimgeRengi } from "@/lib/simge";
import { getPopularSongs } from "@/lib/songs";

export const metadata: Metadata = { title: "Şarkı Kütüphanesi" };

/**
 * Şarkı Kütüphanesi: Songsterr'in bütün tab kütüphanesi. Songsterr kataloğu indirilmez ya da taranmaz; arama ve
 * şarkılar Songsterr'in kendi sitesinde açılır (masaüstünde GuitarFlex içindeki Songsterr penceresinde).
 * Sekmeler: Kütüphane (bu sayfa), Rehber Şarkılar (/sarki-kutuphanesi/rehber), Tüm Şarkılar (/sarki-kutuphanesi/tum).
 */
const madalyaOf = (s: PopularSong): Madalya => s.madalya ?? (["Bronz", "Altın", "Elmas"] as const)[s.level - 1];
const zorluk = (s: PopularSong) => MADALYALAR.indexOf(madalyaOf(s)) * 1000 + (s.bpm ?? 0) / 10;

/** Kursu olmayan şarkılar için renk: adından türetilir (belirlenimci), bantlar renkli kalsın */
const CANLI: SimgeRengi[] = ["kirmizi", "turuncu", "sari", "yesil", "nane", "camgobegi", "mavi", "indigo", "mor", "pembe"];
function adRengi(s: PopularSong): SimgeRengi {
  let h = 0;
  for (const c of `${s.artist}|${s.title}`) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return CANLI[h % CANLI.length];
}

/** Bant kartı: kursun rengi ve glifi; kursu yoksa adından türetilen renk ve nota glifi */
function kart(s: PopularSong, adim?: number): SeritSarki {
  const kurs = s.rehber?.bolumler[0]?.kurs ?? s.courses?.[0];
  return {
    title: s.title,
    artist: s.artist,
    kind: s.kind,
    madalya: madalyaOf(s),
    bpm: s.bpm,
    url: songUrl(s),
    simge: kurs ? kursSimgesi(kurs) : { glif: "nota", renk: adRengi(s) },
    kapak: kapakTuru(s),
    ...(adim ? { adim } : {}),
  };
}

/** Derlenmiş koleksiyonlar (Fender Play'in şarkı bantları gibi): GuitarBear şarkı listesinden */
function bantlar(sarkilar: PopularSong[]) {
  const sirali = [...sarkilar].sort((a, b) => zorluk(a) - zorluk(b));
  const rehber = sarkilar.filter((s) => s.rehber).sort((a, b) => a.rehber!.adim - b.rehber!.adim);
  // En sık görülen sanatçı (en az 4 şarkı): "Sanatçı: …" bandı
  const sayim = new Map<string, number>();
  for (const s of sarkilar) sayim.set(s.artist, (sayim.get(s.artist) ?? 0) + 1);
  const sanatci = [...sayim.entries()].filter(([, n]) => n >= 4).sort((a, b) => b[1] - a[1])[0]?.[0];
  const liste: { baslik: string; alt?: string; sarkilar: SeritSarki[] }[] = [
    { baslik: "Rehberin ilk adımları", alt: "Şarkı Rehberi sırasıyla: önce bunlar.", sarkilar: rehber.slice(0, 12).map((s) => kart(s, s.rehber!.adim)) },
    {
      baslik: "Yeni başlayanlar için en kolay riffler",
      alt: "Bronz ve Gümüş riffler, kolaydan zora.",
      sarkilar: sirali.filter((s) => s.kind === "riff" && ["Bronz", "Gümüş"].includes(madalyaOf(s))).map((s) => kart(s)),
    },
    { baslik: "Efsane sololar", alt: "Platin, Elmas ve Usta sololar.", sarkilar: sirali.filter((s) => s.kind === "solo" && MADALYALAR.indexOf(madalyaOf(s)) >= 3).map((s) => kart(s)) },
    { baslik: "Türkçe şarkılar", sarkilar: sirali.filter((s) => s.koken === "Türkçe").map((s) => kart(s)) },
    ...(sanatci ? [{ baslik: `Sanatçı: ${sanatci}`, sarkilar: sirali.filter((s) => s.artist === sanatci).map((s) => kart(s)) }] : []),
    ...MADALYALAR.map((m) => ({ baslik: `${m} şarkılar`, alt: `${m} madalyası`, sarkilar: sirali.filter((s) => madalyaOf(s) === m).map((s) => kart(s)) })),
  ];
  return liste.filter((b) => b.sarkilar.length > 0);
}

export default async function SarkiKutuphanesiPage() {
  const sarkilar = await getPopularSongs();
  // Örnek aramalar: rehberdeki sanatçılardan ilk birkaçı (tekrarsız)
  const ornekler = [...new Set(sarkilar.filter((s) => s.rehber).sort((a, b) => a.rehber!.adim - b.rehber!.adim).map((s) => s.artist))].slice(0, 6);
  const seritler = bantlar(sarkilar);
  return (
    <div>
      <SongsNav />
      <Bant ton="beyaz" className="pb-20 pt-10 text-center">
        <Kirinti halkalar={[{ label: "Şarkı Kütüphanesi" }]} className="mb-10 justify-center" />
        <UygulamaSimgesi simge={yerSimgesi("sarki-kutuphanesi")} boyut={96} className="mb-6" />
        <h1 className="baslik-dev">Şarkı Kütüphanesi</h1>
        <p className="alt-baslik mx-auto mt-2 max-w-[760px] text-pretty text-muted">Songsterr&apos;in bütün tab kütüphanesi, GuitarFlex&apos;in içinde. Tablar Songsterr&apos;de açılır.</p>
        <div className="mt-10">
          <SarkiKutuphanesiArama ornekler={ornekler} />
        </div>
      </Bant>
      {seritler.length > 0 && (
        <Bant ton="gri" className="!pt-14" aria-label="Derlenmiş şarkı koleksiyonları">
          <div className="mx-auto max-w-[1200px] space-y-12">
            {seritler.map((b) => (
              <SarkiSeridi key={b.baslik} baslik={b.baslik} alt={b.alt} sarkilar={b.sarkilar} />
            ))}
          </div>
        </Bant>
      )}
      <Bant ton="beyaz" className="text-center">
        <h2 className="baslik-orta">Nereden başlayacağını bilmiyor musun?</h2>
        <p className="alt-baslik-kucuk mx-auto mt-2 max-w-[640px] text-pretty text-muted">Rehber Şarkılar, teknik kurslarına göre sıralanmış bir şarkı yolu; Tüm Şarkılar&apos;da hepsi kapaklarıyla.</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <HapBag href="/sarki-kutuphanesi/rehber">Rehber Şarkılar</HapBag>
          <MetinBag href="/sarki-kutuphanesi/tum">Tüm Şarkılar</MetinBag>
        </div>
      </Bant>
    </div>
  );
}
