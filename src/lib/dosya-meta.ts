// Kullanıcının kendi bilgisayarından açtığı tab/nota dosyasından (Guitar Pro, MusicXML, Capella) özet bilgi çıkarır.
// alphaTab ile ayrıştırılır (tarayıcıda window.alphaTab, testte npm paketi); dosya hiçbir yere gönderilmez.

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * alphaTab 1.8.4'ün içe aktarıcıları (Environment.buildImporters sırasıyla): Gp3To5Importer (.gp3 .gp4 .gp5),
 * GpxImporter (.gpx, Guitar Pro 6), Gp7To8Importer (.gp, Guitar Pro 7–8), MusicXmlImporter (.xml .musicxml ve sıkıştırılmış
 * .mxl), CapellaImporter (.capx sıkıştırılmış, .capxml/.xml düz CapXML), AlphaTexImporter. Biçim uzantıdan değil
 * içerikten anlaşılır; uzantı listesi yalnız dosya seçicinin süzgecidir. .gp7 uzantısı Guitar Pro'nun kendi uzantısı
 * değildir (GP7–8 dosyası .gp'dir) ama aynı biçimdeki dosyalar böyle adlandırılabildiği için kabul edilir.
 */
export const DESTEKLENEN_UZANTILAR = [".gp", ".gp7", ".gpx", ".gp3", ".gp4", ".gp5", ".xml", ".musicxml", ".mxl", ".capx", ".capxml"] as const;
export const KABUL = DESTEKLENEN_UZANTILAR.join(",");
/** Arayüzde gösterilen kısa biçim listesi */
export const BICIM_METNI = "Guitar Pro 3–5 (.gp3, .gp4, .gp5), Guitar Pro 6 (.gpx), Guitar Pro 7–8 (.gp), MusicXML (.xml, .musicxml, .mxl) ve Capella (.capx)";
/** Tek dosyanın üst sınırı (alphaTab'ın varsayılan çözme sınırının altında; büyük dosyalar tarayıcıyı kilitlemesin) */
export const AZAMI_BOYUT = 25 * 1024 * 1024;

export const uzantiUygun = (ad: string) => DESTEKLENEN_UZANTILAR.some((u) => ad.toLocaleLowerCase("en").endsWith(u));

export type DosyaIzi = {
  ad: string;
  /** General MIDI programı; perküsyonda null */
  program: number | null;
  perkusyon: boolean;
  /** Tel sayısı (telsiz track'te 0) */
  tel: number;
  /** Akort, kalın telden inceye MIDI */
  akort: number[];
};

export type DosyaMeta = {
  baslik: string;
  sanatci: string;
  album: string;
  tempo: number;
  /** Ton (ör. "Sol majör"); dosyada yazılı ilk ölçünün donanımından */
  ton?: string;
  olcuBirimi: string;
  /** Yazılı ölçü sayısı */
  olcu: number;
  /** Tekrarlarla çalınan süre (saniye, dosyanın temposunda) */
  sureSn: number;
  izler: DosyaIzi[];
};

const MAJOR = ["Do♭", "Sol♭", "Re♭", "La♭", "Mi♭", "Si♭", "Fa", "Do", "Sol", "Re", "La", "Mi", "Si", "Fa#", "Do#"];
const MINOR = ["La♭", "Mi♭", "Si♭", "Fa", "Do", "Sol", "Re", "La", "Mi", "Si", "Fa#", "Do#", "Sol#", "Re#", "La#"];
/** alphaTab donanımı (−7…7 diyez/bemol sayısı) ve türü (0 majör, 1 minör) → Türkçe ton adı */
export function tonAdi(ks: number, tur: number): string | undefined {
  const i = ks + 7;
  if (!Number.isInteger(i) || i < 0 || i > 14) return undefined;
  return tur === 1 ? `${MINOR[i]} minör` : `${MAJOR[i]} majör`;
}

/** Ayrıştırılmış alphaTab skorundan özet (tekrarlarla süre MIDI üretiminin tick tablosundan) */
export function skorOzeti(at: any, score: any): DosyaMeta {
  let sureSn = 0;
  try {
    const midi = new at.midi.MidiFile();
    const gen = new at.midi.MidiFileGenerator(score, new at.Settings(), new at.midi.AlphaSynthMidiFileHandler(midi));
    gen.generate();
    for (const mb of gen.tickLookup.masterBars as any[]) {
      // Ölçü içinde tempo değişimi varsa parçalara bölünür
      const degisim: { tick: number; tempo: number }[] = mb.tempoChanges?.length ? mb.tempoChanges : [{ tick: mb.start, tempo: mb.tempo }];
      degisim.forEach((d, i) => {
        const bitis = degisim[i + 1]?.tick ?? mb.end;
        if (d.tempo > 0) sureSn += ((bitis - d.tick) / 960) * (60 / d.tempo);
      });
    }
  } catch {
    // MIDI üretilemezse yazılı ölçülerden yaklaşık süre
    let tempo = score.tempo || 120;
    for (const mb of score.masterBars) {
      tempo = mb.tempoAutomations?.[0]?.value ?? tempo;
      sureSn += (mb.calculateDuration() / 960) * (60 / tempo);
    }
  }
  const ilk = score.masterBars[0];
  const bar0 = score.tracks.map((t: any) => t.staves[0]).find((s: any) => s && !s.isPercussion)?.bars[0];
  return {
    baslik: String(score.title ?? "").trim(),
    sanatci: String(score.artist ?? "").trim(),
    album: String(score.album ?? "").trim(),
    tempo: Math.round(score.tempo || 120),
    ton: bar0 ? tonAdi(bar0.keySignature, bar0.keySignatureType) : undefined,
    olcuBirimi: ilk ? `${ilk.timeSignatureNumerator}/${ilk.timeSignatureDenominator}` : "4/4",
    olcu: score.masterBars.length,
    sureSn: Math.round(sureSn),
    izler: score.tracks.map((t: any) => {
      const st = t.staves[0];
      const perkusyon = !!st?.isPercussion;
      const akort: number[] = perkusyon ? [] : [...(st?.tuning ?? [])].reverse();
      return { ad: String(t.name || t.shortName || `Track ${t.index + 1}`).trim(), program: perkusyon ? null : t.playbackInfo.program, perkusyon, tel: akort.length, akort };
    }),
  };
}

/** Dosya baytlarını alphaTab ile ayrıştırır; desteklenmeyen ya da bozuk dosyada açıklamalı hata fırlatır */
export function dosyaOzeti(at: any, veri: ArrayBuffer): DosyaMeta {
  let score: any;
  try {
    score = at.importer.ScoreLoader.loadScoreFromBytes(new Uint8Array(veri), new at.Settings());
  } catch {
    throw new Error("Dosya okunamadı: desteklenen bir Guitar Pro, MusicXML ya da Capella dosyası değil ya da bozuk.");
  }
  if (!score?.tracks?.length || !score.masterBars?.length) throw new Error("Dosyada çalınacak track ya da ölçü yok.");
  return skorOzeti(at, score);
}
