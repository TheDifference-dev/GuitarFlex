// Şarkı Kütüphanesi = Songsterr'in bütün tab kataloğu. Katalog indirilmez ya da kopyalanmaz; Songsterr'in kendi sitesi
// açılır. Masaüstü uygulamasında ayrı bir uygulama penceresinde ("Şarkı Kütüphanesi — Songsterr", desktop/
// sarki-kutuphanesi.cjs), web'de yeni sekmede. Sunucuda da istemcide de içe aktarılabilir (window yalnız çağrıda).

export const SONGSTERR = "https://www.songsterr.com/";

/** Songsterr adresi: arama metni verilirse Songsterr araması, Songsterr bağlantısı verilirse kendisi */
export function songsterrAdresi(q?: string): string {
  const t = (q ?? "").trim();
  if (!t) return SONGSTERR;
  if (songsterrBaglantisi(t)) return t;
  return `${SONGSTERR}?pattern=${encodeURIComponent(t)}`;
}

/** https://www.songsterr.com/… (ya da songsterr.com alt alanı) mı */
export function songsterrBaglantisi(u: string): boolean {
  try {
    const x = new URL(u);
    return x.protocol === "https:" && (x.hostname === "songsterr.com" || x.hostname.endsWith(".songsterr.com"));
  } catch {
    return false;
  }
}

type Masaustu = { sarkiKutuphanesiAc?: (q?: string) => unknown };

/**
 * Şarkı Kütüphanesini (Songsterr) açar. `q`: arama metni ya da bir Songsterr bağlantısı.
 * Masaüstünde uygulama içi pencerede açar ve true döner; web'de false döner (bağlantı kendisi yeni sekmede açılır).
 */
export function sarkiKutuphanesiAc(q?: string): boolean {
  if (typeof window === "undefined") return false;
  const m = (window as unknown as { guitarflexMasaustu?: Masaustu }).guitarflexMasaustu;
  if (typeof m?.sarkiKutuphanesiAc !== "function") return false;
  // Ana süreç bu kanalı tanımıyorsa (ör. güncelleme sonrası eski sürüm çalışıyorsa) bağlantıyı yine de aç
  Promise.resolve()
    .then(() => m.sarkiKutuphanesiAc!(q?.trim() || undefined))
    .catch(() => window.open(songsterrAdresi(q), "_blank", "noopener,noreferrer"));
  return true;
}
