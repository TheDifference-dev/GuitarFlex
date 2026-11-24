import { redirect } from "next/navigation";

// "Şarkılarla Öğren" artık Şarkı Kütüphanesi'nin bir sekmesi (Rehber Şarkılar): eski bağlantılar oraya gider.
export default function SongsPage() {
  redirect("/sarki-kutuphanesi/rehber");
}
