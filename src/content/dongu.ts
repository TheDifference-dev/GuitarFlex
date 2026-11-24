// Ders tablarını ölçü düzeyinde işleyen yardımcılar: kısa döngü (en çok 4 ölçü), tek alt bölüm denetimi
// ve bölüm sınavı için ölçü seçimi. Yalnız metin işler (alphaTab gerekmez); sunucu ve tarayıcıda çalışır.
// Biçim: tex(bpm, bars) çıktısı — "\tempo N . ölçü | ölçü | …"; ölçünün başında isteğe bağlı "\ts a b".

/** Bir dersin en çok kaç ölçülük döngü olacağı (GuitarBear tarzı kısa egzersiz; bkz. courses.ts) */
export const DONGU_OLCU = 4;

export type Olculer = { tempo: number; bars: string[] };

export function olculer(tex: string): Olculer {
  const m = /^\\tempo (\d+) \. ([\s\S]*)$/.exec(tex.trim());
  if (!m) throw new Error(`tex biçimi tanınmadı: ${tex.slice(0, 40)}`);
  return { tempo: Number(m[1]), bars: m[2].split(" | ") };
}

export const birlestir = (o: Olculer) => `\\tempo ${o.tempo} . ${o.bars.join(" | ")}`;

/** Ölçüyü vuruşlara ayırır: süre işaretleri (":8"), \ts, notalar ve akorlar ("(…){…}") ayrı belirteç olur */
export function belirtecler(bar: string): string[] {
  const out: string[] = [];
  let cur = "";
  let depth = 0;
  for (const ch of bar) {
    if (ch === "{" || ch === "(") depth++;
    if (ch === "}" || ch === ")") depth--;
    if (ch === " " && depth === 0) {
      if (cur) out.push(cur);
      cur = "";
    } else cur += ch;
  }
  if (cur) out.push(cur);
  return out;
}

const SURE = /^:(\d+)$/;
const isNota = (t: string) => !SURE.test(t) && !t.startsWith("\\") && !/^\d+$/.test(t);

/** Belirtecin efekt kelimeleri (nota içindeki ve dıştaki süslü parantezler) */
const efektler = (t: string) => [...t.matchAll(/\{([^{}]*)\}/g)].flatMap((m) => m[1].replace(/\([^)]*\)/g, " ").split(/\s+/).filter(Boolean));

/** Belirteçten verilen efekt kelimelerini siler (boş kalan süslü parantez de gider) */
function efektSil(t: string, sil: string[]): string {
  return t
    .replace(/\{([^{}]*)\}/g, (_, ic: string) => {
      // "b (0 4)" gibi parantezli değerler bütün kalsın: önce onları koru
      const parca = ic.match(/\S+\s*\([^)]*\)|\S+/g) ?? [];
      const kalan: string[] = [];
      for (let i = 0; i < parca.length; i++) {
        const w = parca[i];
        if (sil.includes(w)) continue;
        // "tu 3" gibi iki kelimelik efektler: sayı bir önceki kelimeye aittir
        kalan.push(w);
      }
      return kalan.length ? `{${kalan.join(" ")}}` : "";
    })
    .replace(/\(\s*\)/g, "()");
}

/**
 * Ölçünün alt bölümü: vuruş (dörtlük) başına nota sayısı ızgarası — sekizlik 2, triole 3, on altılık 4, altılık 6 …
 * Dörtlük ve daha uzun değerler (tutulan son nota, bend) ızgarayı belirlemez; ölçüdeki en sık ızgara döner.
 * Sadece uzun değerlerden oluşan ölçüde 0 döner. Aynı ölçüde ikili ve üçlü ızgara karışırsa "karisik" true olur.
 */
export function olcuIzgarasi(bar: string, varsayilan = 4): { izgara: number; sure: number; karisik: boolean } {
  let sure = varsayilan;
  let enBuyuk = 0;
  let ikili = false;
  let uclu = false;
  for (const t of belirtecler(bar)) {
    const s = SURE.exec(t);
    if (s) {
      sure = Number(s[1]);
      continue;
    }
    if (!isNota(t)) continue;
    const ef = efektler(t);
    const tu = ef.indexOf("tu");
    const n = tu >= 0 ? Number(ef[tu + 1]) : 1;
    // tu 3 → 3:2, tu 5 → 5:4, tu 6 → 6:4, tu 7 → 7:4
    const oran = n === 1 ? 1 : n === 3 ? 1.5 : n / 4;
    let g = (sure / 4) * oran;
    if (ef.includes("d")) g *= 2;
    if (g < 2) continue;
    if (g % 3 === 0) uclu = true;
    else ikili = true;
    enBuyuk = Math.max(enBuyuk, g);
  }
  return { izgara: enBuyuk, sure, karisik: ikili && uclu };
}

/** Bütün ölçülerin ızgaraları (süre işareti ölçüler arasında taşınır); 0 = yalnız uzun değerler */
export function izgaralar(bars: string[]): { izgara: number; karisik: boolean }[] {
  let sure = 4;
  return bars.map((b) => {
    const r = olcuIzgarasi(b, sure);
    sure = r.sure;
    return { izgara: r.izgara, karisik: r.karisik };
  });
}

/** Tek alt bölüm kuralı: ızgarası olan bütün ölçüler aynı ızgarada ve hiçbir ölçü ikili/üçlü karışık değil */
export function tekAltBolum(bars: string[]): { tamam: boolean; izgaralar: number[] } {
  const iz = izgaralar(bars);
  const set = [...new Set(iz.map((x) => x.izgara).filter((g) => g > 0))];
  return { tamam: set.length <= 1 && !iz.some((x) => x.karisik), izgaralar: set };
}

/** Ölçünün son vuruşundaki bağ/slide'ı (h, sl, ss) çözer: döngünün sonu bir sonraki ölçüye bağlanmasın */
function sonuCoz(bar: string): string {
  const t = belirtecler(bar);
  for (let i = t.length - 1; i >= 0; i--) {
    if (!isNota(t[i])) continue;
    t[i] = efektSil(t[i], ["h", "sl", "ss"]);
    break;
  }
  return t.join(" ");
}

/** Ölçünün ilk vuruşundaki bağ (t, önceki notadan uzatma) kaldırılır: döngü önceki ölçüye bağlı başlamasın */
function basiCoz(bar: string): string {
  const t = belirtecler(bar);
  const i = t.findIndex(isNota);
  if (i >= 0) t[i] = efektSil(t[i], ["t"]);
  return t.join(" ");
}

/** Ölçünün başında kendi süre işareti yoksa önceki ölçülerden gelen süreyi yazar; \ts kaldırılır (kes() yeniden ekler) */
function bagimsiz(bars: string[], i: number): string {
  const b = bars[i].replace(/\\ts \d+ \d+ ?/, "");
  const ilk = belirtecler(b)[0];
  if (!ilk || SURE.test(ilk)) return b;
  let onceki: string | null = null;
  for (let k = 0; k < i; k++) for (const t of belirtecler(bars[k])) if (SURE.test(t)) onceki = t;
  return onceki ? `${onceki} ${b}` : b;
}

/** Ölçünün ölçü birimi ("4 4", "6 8" …): o ölçüye kadarki son \ts; yoksa 4/4 */
export function olcuBirimi(bars: string[], i: number): string {
  let ts = "4 4";
  for (let k = 0; k <= i; k++) {
    const m = /\\ts (\d+ \d+)/.exec(bars[k]);
    if (m) ts = m[1];
  }
  return ts;
}

/** [bas, son) aralığındaki ölçüleri bağımsız bir döngü olarak keser */
export function kes(o: Olculer, bas: number, son: number): Olculer {
  const bars = o.bars.slice(bas, son).map((_, k) => {
    const i = bas + k;
    const b = bagimsiz(o.bars, i);
    const ts = olcuBirimi(o.bars, i);
    const yaz = k === 0 ? ts !== "4 4" : ts !== olcuBirimi(o.bars, i - 1);
    return yaz ? `\\ts ${ts} ${b}` : b;
  });
  bars[0] = basiCoz(bars[0]);
  bars[bars.length - 1] = sonuCoz(bars[bars.length - 1]);
  return { tempo: o.tempo, bars };
}

/** Yalnız uzun değerlerden (birlik/ikilik/dörtlük, sus) oluşan son ölçü: cümlenin "iniş" notası */
const inisOlcusu = (bar: string, onceki: string[]) => {
  const t = belirtecler(bar).filter(isNota);
  const notalar = t.filter((x) => !/^r(\{|$)/.test(x));
  return notalar.length <= 2 && izgaralar([...onceki, bar]).at(-1)!.izgara === 0;
};

/**
 * Uzun bir tabı kısa döngülere böler: iniş ölçüsü (son ölçüde tek uzun nota) atılır, kalan ölçüler en çok
 * DONGU_OLCU ölçülük parçalara ayrılır. Döngü bir sonraki ölçüye bağla geçmez. Kısa tab olduğu gibi döner (tek parça).
 */
export function donguler(tex: string, en = DONGU_OLCU): { tex: string; bas: number; son: number }[] {
  const o = olculer(tex);
  if (o.bars.length <= en) return [{ tex, bas: 1, son: o.bars.length }];
  let n = o.bars.length;
  if (inisOlcusu(o.bars[n - 1], o.bars.slice(0, n - 1))) n--;
  if (n <= en) return [{ tex: birlestir(kes(o, 0, n)), bas: 1, son: n }];
  // Çok kısa son parça (1 ölçü) bir öncekiyle birleşmez: 5–6 ölçülük tablar ilk 4 ölçüye iner
  const parcalar: { tex: string; bas: number; son: number }[] = [];
  const sayi = n <= en + 2 ? 1 : Math.floor(n / en);
  for (let p = 0; p < sayi; p++) {
    const bas = p * en;
    const son = Math.min(n, bas + en);
    parcalar.push({ tex: birlestir(kes(o, bas, son)), bas: bas + 1, son });
  }
  return parcalar;
}

/** Dersin döngü tabı: uzun tabın i'nci parçası (parça sayısına göre döner) */
export function donguSec(tex: string, i: number): { tex: string; bas: number; son: number; toplam: number; parca: number } {
  const p = donguler(tex);
  const k = i % p.length;
  return { ...p[k], toplam: olculer(tex).bars.length, parca: p.length };
}

/** Ölçünün grubu: ızgara ve ölçü birimi (sınavda yalnız aynı gruptaki ölçüler yan yana gelir) */
export function olcuGrubu(bars: string[], i: number): string {
  return `${izgaralar(bars)[i].izgara}@${olcuBirimi(bars, i)}`;
}

/** Bir tabın bağımsız tek ölçüsü (bölüm sınavında kullanılır) */
export function tekOlcu(tex: string, i: number): { bar: string; grup: string; tempo: number } {
  const o = olculer(tex);
  const k = i < 0 ? o.bars.length + i : i;
  const c = kes(o, k, k + 1);
  return { bar: c.bars[0], grup: olcuGrubu(o.bars, k), tempo: o.tempo };
}
