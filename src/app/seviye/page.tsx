import type { Metadata } from "next";
import { SeviyeKartlari, type SeviyeOzeti } from "@/components/SeviyeYolu";
import { LEVELS } from "@/content/seviyeler";
import { getSeviyeYolu } from "@/lib/seviye";

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
    };
  });

  return (
    <div className="space-y-6">
      <header className="max-w-3xl">
        <p className="eyebrow">Elektro Gitar</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Seviye Yolu</h1>
        <p className="mt-2 text-muted">
          Kurslardaki alt bölümler beş seviyeye ayrıldı. Kurs kurs ilerleyebilir ya da bir seviyenin teknik, klavye, ritim ve teori derslerini birlikte
          çalışabilirsin. Kilit yok; seviyeyi bitirmek için o seviyedeki tablı derslerin en az %70&apos;ini tamamla.
        </p>
      </header>
      <SeviyeKartlari items={items} />
    </div>
  );
}
