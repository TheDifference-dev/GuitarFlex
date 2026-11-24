import type { Metadata } from "next";
import { Bant, SayfaBasi } from "@/components/site/Vitrin";
import RigSayfasi from "@/components/rig/RigSayfasi";
import { RIG_SIMGESI } from "@/components/rig/simge";

export const metadata: Metadata = { title: "Rig'im" };

export default function RigPage() {
  return (
    <div>
      <SayfaBasi
        kirinti={[{ label: "Rig'im" }]}
        simge={RIG_SIMGESI}
        baslik="Rig'im"
        boyut="buyuk"
        alt="Gitarını, pedallarını, amfini ve kabinini bir sinyal zincirine diz. Yalnız görsel bir oyuncak: ses işlenmez. Rig'lerin bu bilgisayarda saklanır."
      />
      <Bant ton="gri" className="pt-10">
        <RigSayfasi />
      </Bant>
    </div>
  );
}
