import type { Metadata } from "next";
import { Bant, SayfaBasi } from "@/components/site/Vitrin";
import { SeviyeAnasayfa } from "@/components/SeviyeYolu";
import { getSeviyeYolu } from "@/lib/seviye";
import { yerSimgesi } from "@/lib/simge";

export const metadata: Metadata = { title: "Seviye Yolu" };

export default async function SeviyeYoluPage() {
  const veriler = await getSeviyeYolu();
  return (
    <div>
      <SayfaBasi
        simge={yerSimgesi("seviye")}
        kirinti={[{ href: "/elektro", label: "Elektro Gitar" }, { label: "Seviye Yolu" }]}
        baslik="Seviye Yolu"
        alt="Başlangıç, Orta, Orta-Üst, Üst Düzey. Bilgi düzeyini seç; sıradaki dersleri biz önerelim."
      />
      <Bant ton="gri" className="pt-10">
        <SeviyeAnasayfa veriler={veriler} />
      </Bant>
    </div>
  );
}
