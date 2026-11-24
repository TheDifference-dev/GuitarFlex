// Fotoğraftan ekipman: kullanıcının kendi ekipman fotoğrafından arka planı ayırıp ekipmanı kırpar. Ağ ve model
// gerektirmez; tamamen bu bilgisayarda, piksel düzeyinde çalışır (tarayıcıya ve React'e bağlı değildir; Node'da
// sınanır: npm run test:rig).
//
// Yöntem
//   1. Kenar örnekleri: fotoğrafın dış çerçevesindeki pikseller k-ortalamalarla en çok 3 arka plan rengine ayrılır.
//   2. Kenardan taşma (flood fill): kenardaki arka plan renginde piksellerden başlayıp komşulara yayılır. Bir komşu,
//      hem bir arka plan rengine yeterince yakınsa (genel eşik; gölge ve ışık geçişleri için gevşek) hem de geldiği
//      piksele benziyorsa (yerel eşik; ekipmanın kenarında durur) arka plandır.
//   3. Temizlik: ön plandaki küçük adacıklar (toz, yansıma) atılır; en büyük parçanın %8'inden küçük olanlar silinir.
//   4. Yumuşak kenar: maske 3x3 kutu bulanıklığıyla saydamlığa çevrilir (tırtıksız kenar).
//   5. Kırpma: ön planın sınır kutusu + pay.
//   Ön plan fotoğrafın %3'ünden azsa ya da %97'sinden çoksa ayırma başarısız sayılır; o zaman yalnız özgün görüntü
//   (kırpılmadan) döner.

export type Goruntu = { width: number; height: number; data: Uint8ClampedArray };
export type Kutu = { x: number; y: number; w: number; h: number };
export type KesimSonucu = {
  /** Saydam arka planlı, kırpılmış görüntü (başarısızsa özgün görüntünün kopyası) */
  goruntu: Goruntu;
  /** Özgün görüntüde kırpma kutusu */
  kutu: Kutu;
  /** Ön planın (ekipmanın) alan oranı, 0–1 */
  onPlan: number;
  basarili: boolean;
};

export type KesimAyari = {
  /** Arka plan rengine uzaklık eşiği (0–100, varsayılan 34). Büyüdükçe daha çok şey arka plan sayılır. */
  tolerans?: number;
  /** Kırpma payı (kenarın oranı; varsayılan 0,04) */
  pay?: number;
};

type Renk = [number, number, number];

/** Algısal ağırlıklı RGB uzaklığı ("redmean"), 0–~765 */
export function renkUzakligi(a: Renk, b: Renk): number {
  const rm = (a[0] + b[0]) / 2;
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return Math.sqrt((2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db);
}

const piksel = (g: Goruntu, i: number): Renk => [g.data[i * 4], g.data[i * 4 + 1], g.data[i * 4 + 2]];

/** Kenar piksellerinden en çok `k` arka plan rengi (k-ortalamalar; az örnekli kümeler atılır) */
export function kenarRenkleri(g: Goruntu, k = 3): Renk[] {
  const { width: w, height: h } = g;
  const ornek: Renk[] = [];
  const adim = Math.max(1, Math.floor((2 * (w + h)) / 1600));
  for (let x = 0; x < w; x += adim) ornek.push(piksel(g, x), piksel(g, (h - 1) * w + x));
  for (let y = 0; y < h; y += adim) ornek.push(piksel(g, y * w), piksel(g, y * w + w - 1));
  if (!ornek.length) return [];
  // Başlangıç merkezleri: birbirinden en uzak örnekler
  const merkez: Renk[] = [ornek[0]];
  while (merkez.length < k) {
    let enIyi = ornek[0];
    let enUzak = -1;
    for (const o of ornek) {
      const d = Math.min(...merkez.map((m) => renkUzakligi(o, m)));
      if (d > enUzak) {
        enUzak = d;
        enIyi = o;
      }
    }
    if (enUzak < 12) break;
    merkez.push(enIyi);
  }
  let sayi: number[] = [];
  for (let tur = 0; tur < 8; tur++) {
    const top = merkez.map(() => [0, 0, 0]);
    sayi = merkez.map(() => 0);
    for (const o of ornek) {
      let j = 0;
      let dj = Infinity;
      merkez.forEach((m, i) => {
        const d = renkUzakligi(o, m);
        if (d < dj) {
          dj = d;
          j = i;
        }
      });
      top[j][0] += o[0];
      top[j][1] += o[1];
      top[j][2] += o[2];
      sayi[j]++;
    }
    merkez.forEach((m, i) => {
      if (sayi[i]) for (let c = 0; c < 3; c++) m[c] = top[i][c] / sayi[i];
    });
  }
  return merkez.filter((_, i) => sayi[i] >= ornek.length * 0.08);
}

/** Arka plan maskesi: 1 = arka plan (kenardan taşmayla) */
export function arkaPlanMaskesi(g: Goruntu, tolerans = 34): Uint8Array {
  const { width: w, height: h } = g;
  const n = w * h;
  const maske = new Uint8Array(n);
  const renkler = kenarRenkleri(g);
  if (!renkler.length) return maske;
  // Eşikler: tolerans 0–100 → genel ~[40, 200], yerel ~[10, 48]
  const genel = 40 + tolerans * 1.6;
  const yerel = 10 + tolerans * 0.38;
  const arkaPlanaYakin = (i: number) => {
    const p = piksel(g, i);
    return renkler.some((r) => renkUzakligi(p, r) < genel);
  };
  const kuyruk = new Int32Array(n);
  let bas = 0;
  let son = 0;
  const tohum = (i: number) => {
    if (!maske[i] && renkler.some((r) => renkUzakligi(piksel(g, i), r) < genel * 0.75)) {
      maske[i] = 1;
      kuyruk[son++] = i;
    }
  };
  for (let x = 0; x < w; x++) {
    tohum(x);
    tohum((h - 1) * w + x);
  }
  for (let y = 0; y < h; y++) {
    tohum(y * w);
    tohum(y * w + w - 1);
  }
  while (bas < son) {
    const i = kuyruk[bas++];
    const x = i % w;
    const y = (i - x) / w;
    const p = piksel(g, i);
    const komsu = [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1];
    for (const j of komsu) {
      if (j < 0 || maske[j]) continue;
      if (renkUzakligi(p, piksel(g, j)) < yerel && arkaPlanaYakin(j)) {
        maske[j] = 1;
        kuyruk[son++] = j;
      }
    }
  }
  return maske;
}

/** Ön plandaki küçük parçaları atar (yerinde): en büyük parçanın `oran`ından küçük olanlar arka plan olur */
export function adaciklariTemizle(maske: Uint8Array, w: number, h: number, oran = 0.08): void {
  const etiket = new Int32Array(w * h).fill(-1);
  const alanlar: number[] = [];
  const kuyruk = new Int32Array(w * h);
  for (let s = 0; s < w * h; s++) {
    if (maske[s] || etiket[s] >= 0) continue;
    const no = alanlar.length;
    let bas = 0;
    let son = 0;
    kuyruk[son++] = s;
    etiket[s] = no;
    while (bas < son) {
      const i = kuyruk[bas++];
      const x = i % w;
      const y = (i - x) / w;
      for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1]) {
        if (j >= 0 && !maske[j] && etiket[j] < 0) {
          etiket[j] = no;
          kuyruk[son++] = j;
        }
      }
    }
    alanlar.push(son);
  }
  if (!alanlar.length) return;
  const enBuyuk = Math.max(...alanlar);
  for (let i = 0; i < w * h; i++) if (!maske[i] && alanlar[etiket[i]] < enBuyuk * oran) maske[i] = 1;
}

/** Fotoğraftan ekipmanı ayırır ve kırpar */
export function arkaPlaniTemizle(g: Goruntu, ayar: KesimAyari = {}): KesimSonucu {
  const { width: w, height: h } = g;
  const tolerans = Math.max(0, Math.min(100, ayar.tolerans ?? 34));
  const pay = Math.max(0, Math.min(0.2, ayar.pay ?? 0.04));
  const kopya = (): Goruntu => ({ width: w, height: h, data: new Uint8ClampedArray(g.data) });
  const tam: Kutu = { x: 0, y: 0, w, h };
  if (w < 3 || h < 3) return { goruntu: kopya(), kutu: tam, onPlan: 1, basarili: false };

  const maske = arkaPlanMaskesi(g, tolerans);
  adaciklariTemizle(maske, w, h);
  let onSayi = 0;
  let x0 = w;
  let y0 = h;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (!maske[y * w + x]) {
        onSayi++;
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
  const onPlan = onSayi / (w * h);
  if (onPlan < 0.03 || onPlan > 0.97) return { goruntu: kopya(), kutu: tam, onPlan, basarili: false };

  // Yumuşak kenar: ön plan (0/1) maskesinin 3x3 ortalaması → saydamlık
  const alfa = new Uint8ClampedArray(w * h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let t = 0;
      let say = 0;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx;
          const yy = y + dy;
          if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
          t += maske[yy * w + xx] ? 0 : 1;
          say++;
        }
      // Ön plan pikseli en az yarı saydam kalır; arka plan pikseli kenarda hafifçe görünür
      const a = t / say;
      alfa[y * w + x] = Math.round(255 * (maske[y * w + x] ? a * 0.5 : 0.5 + a * 0.5));
    }

  const p = Math.round(Math.max(x1 - x0 + 1, y1 - y0 + 1) * pay);
  const kutu: Kutu = { x: Math.max(0, x0 - p), y: Math.max(0, y0 - p), w: 0, h: 0 };
  kutu.w = Math.min(w, x1 + p + 1) - kutu.x;
  kutu.h = Math.min(h, y1 + p + 1) - kutu.y;
  const data = new Uint8ClampedArray(kutu.w * kutu.h * 4);
  for (let y = 0; y < kutu.h; y++)
    for (let x = 0; x < kutu.w; x++) {
      const kaynak = (kutu.y + y) * w + kutu.x + x;
      const hedef = (y * kutu.w + x) * 4;
      data[hedef] = g.data[kaynak * 4];
      data[hedef + 1] = g.data[kaynak * 4 + 1];
      data[hedef + 2] = g.data[kaynak * 4 + 2];
      data[hedef + 3] = Math.min(g.data[kaynak * 4 + 3], alfa[kaynak]);
    }
  return { goruntu: { width: kutu.w, height: kutu.h, data }, kutu, onPlan, basarili: true };
}
