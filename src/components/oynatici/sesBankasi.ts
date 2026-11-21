"use client";

// Ses bankası (SoundFont) yükleyicisi. alphaTab'ın kendi indirmesi yerine burada indirilir, çünkü:
//  · indirme başarısız olursa (dosya yok, bağlantı koptu, sf2 yerine hata sayfası geldi) alphaTab oynatıcıyı
//    sessizce kilitli bırakır; burada öteki bankaya düşülür ve hâlâ olmuyorsa çağırana anlaşılır bir hata döner;
//  · banka oturum boyunca bellekte tutulur: dersten derse geçerken ~30 MB yeniden indirilmez.

export type Banka = "generaluser" | "sonivox";

const ADRES: Record<Banka, string> = {
  generaluser: "/alphatab/soundfont/GeneralUser.sf2",
  sonivox: "/alphatab/soundfont/sonivox.sf2",
};
export const BANKA_ADI: Record<Banka, string> = { generaluser: "GeneralUser GS", sonivox: "Sonivox" };

type Indirme = { veri: Promise<Uint8Array>; yuzde: number; dinleyenler: Set<(yuzde: number) => void> };
const indirmeler = new Map<Banka, Indirme>();

/** Yanıt gerçekten bir SoundFont mu (RIFF … sfbk)? Eksik dosyada sunucu 404 sayfası döndürebilir. */
function sf2Mi(b: Uint8Array) {
  const ad = (i: number) => String.fromCharCode(b[i], b[i + 1], b[i + 2], b[i + 3]);
  return b.length > 12 && ad(0) === "RIFF" && ad(8) === "sfbk";
}

async function indir(banka: Banka, ilerleme: (yuzde: number) => void): Promise<Uint8Array> {
  const r = await fetch(ADRES[banka]);
  if (!r.ok) throw new Error(`${BANKA_ADI[banka]}: HTTP ${r.status}`);
  const toplam = Number(r.headers.get("content-length")) || 0;
  let veri: Uint8Array;
  if (r.body && toplam > 0) {
    // Akıştan oku: yüzde gösterilebilsin
    veri = new Uint8Array(toplam);
    const okuyucu = r.body.getReader();
    let konum = 0;
    for (;;) {
      const { done, value } = await okuyucu.read();
      if (done) break;
      if (konum + value.length > veri.length) {
        // Sunucunun bildirdiği boydan uzun (sıkıştırılmış aktarım): tamponu büyüt
        const yeni = new Uint8Array(Math.max(veri.length * 2, konum + value.length));
        yeni.set(veri.subarray(0, konum));
        veri = yeni;
      }
      veri.set(value, konum);
      konum += value.length;
      ilerleme(Math.min(99, Math.round((konum / toplam) * 100)));
    }
    if (konum !== veri.length) veri = veri.slice(0, konum);
  } else veri = new Uint8Array(await r.arrayBuffer());
  if (!sf2Mi(veri)) throw new Error(`${BANKA_ADI[banka]}: dosya bir ses bankası değil`);
  ilerleme(100);
  return veri;
}

/** Bankayı indirir (ya da bellekteki kopyayı verir). Aynı anda isteyen bütün oynatıcılar tek indirmeyi paylaşır. */
function bankaVerisi(banka: Banka, ilerleme: (yuzde: number) => void): Promise<Uint8Array> {
  let i = indirmeler.get(banka);
  if (!i) {
    const yeni: Indirme = { veri: Promise.resolve(new Uint8Array()), yuzde: 0, dinleyenler: new Set() };
    yeni.veri = indir(banka, (y) => {
      yeni.yuzde = y;
      for (const d of yeni.dinleyenler) d(y);
    }).finally(() => yeni.dinleyenler.clear());
    // Başarısız indirme saklanmaz: "Yeniden dene" baştan indirir
    yeni.veri.catch(() => indirmeler.get(banka) === yeni && indirmeler.delete(banka));
    indirmeler.set(banka, yeni);
    i = yeni;
  }
  ilerleme(i.yuzde);
  i.dinleyenler.add(ilerleme);
  return i.veri;
}

export type YuklenenBanka = {
  veri: Uint8Array;
  banka: Banka;
  /** Seçilen banka yüklenemedi; öteki banka kullanılıyor */
  yedek: boolean;
};

/**
 * Seçilen ses bankasını yükler; olmazsa öteki bankayı dener (GeneralUser yoksa Sonivox, Sonivox yoksa GeneralUser).
 * İkisi de yüklenemezse reddeder. `ilerleme`: indirilen yüzde (0–100).
 */
export async function sesBankasiYukle(tercih: Banka, ilerleme: (yuzde: number) => void): Promise<YuklenenBanka> {
  try {
    return { veri: await bankaVerisi(tercih, ilerleme), banka: tercih, yedek: false };
  } catch (ilkHata) {
    const oteki: Banka = tercih === "generaluser" ? "sonivox" : "generaluser";
    try {
      return { veri: await bankaVerisi(oteki, ilerleme), banka: oteki, yedek: true };
    } catch {
      throw ilkHata;
    }
  }
}
