import type { Metadata } from "next";
import { Bant, SayfaBasi } from "@/components/site/Vitrin";
import DefterSayfasi from "@/components/defter/DefterSayfasi";
import { getOyun } from "@/lib/oyun-veri";
import { yerSimgesi } from "@/lib/simge";

export const metadata: Metadata = { title: "Çalışma Defteri" };

export default async function DefterPage() {
  // Günlük hedef: Profil'deki Egzersiz görevinin dakikası (içerik paketi › oyun.json); yoksa 20 dk
  const oyun = await getOyun();
  return (
    <div>
      <SayfaBasi
        kirinti={[{ label: "Çalışma Defteri" }]}
        simge={yerSimgesi("defter")}
        baslik="Çalışma Defteri"
        boyut="buyuk"
        alt="Çalıştığın egzersizler ve şarkılar, kaldığın kısım ve ölçü, hangi gitarla ne kadar çalıştığın. Bu bilgisayarda saklanır; yedek için dışa aktar."
      />
      <Bant ton="gri" className="pt-12">
        <DefterSayfasi gunlukHedefDk={oyun?.gorevler.egzersizDk ?? 20} />
      </Bant>
    </div>
  );
}
