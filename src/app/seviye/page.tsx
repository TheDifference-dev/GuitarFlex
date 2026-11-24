import type { Metadata } from "next";
import { Bant, HapBag, MetinBag, SayfaBasi } from "@/components/site/Vitrin";
import { SeviyeKartlari, type SeviyeOzeti } from "@/components/SeviyeYolu";
import { LEVELS } from "@/content/seviyeler";
import { getSeviyeYolu } from "@/lib/seviye";
import { yerSimgesi } from "@/lib/simge";

export const metadata: Metadata = { title: "Seviye Yolu" };

export default async function SeviyeYoluPage() {
  const yol = await getSeviyeYolu();
  const items: SeviyeOzeti[] = LEVELS.map((level) => {
    const v = yol[level];
    const rows = [...v.groups, ...(v.ekler ?? []), ...(v.stiller ?? [])].flatMap((g) => g.rows);
    return {
      level,
      rows: rows.length,
      lessons: rows.reduce((n, r) => n + r.lessons.length, 0),
      tab: rows.flatMap((r) => r.lessons.filter((d) => d.tab)),
      yolAdim: v.yollar.flatMap((y) => y.adimlar.map((a) => a.step)),
    };
  });

  return (
    <div>
      <SayfaBasi
        simge={yerSimgesi("seviye")}
        kirinti={[{ href: "/elektro", label: "Elektro Gitar" }, { label: "Seviye Yolu" }]}
        baslik="Seviye Yolu"
        alt="Beş seviye, tek yol. Bir seviyenin teknik, klavye, ritim ve teori derslerini birlikte çalış."
      >
        <HapBag href="/seviye/L3">L3&apos;ten Başlayın</HapBag>
        <MetinBag href="/nasil-calismaliyim" buyuk>
          Seviyeni bul
        </MetinBag>
      </SayfaBasi>
      <Bant ton="gri" className="pt-12">
        <p className="mx-auto mb-10 max-w-[820px] text-center text-muted">
          Kurslardaki alt bölümler beş seviyeye ayrıldı. Kurs kurs ilerleyebilir ya da seviyece çalışabilirsin. Kilit yok; seviyeyi bitirmek için o
          seviyedeki tablı derslerin ve Okuma, Kulak, Ritim yolu adımlarının en az %70&apos;ini tamamla.
        </p>
        <SeviyeKartlari items={items} />
      </Bant>
    </div>
  );
}
