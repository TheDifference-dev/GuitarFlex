import { Drum, Guitar, KeyboardMusic, MicVocal, Music, Piano } from "lucide-react";
import type { EnstrumanSimge } from "@/lib/enstruman";

// Enstrüman simgeleri: lucide'da olanlar oradan; bas, yaylı, bakır, saksofon, flüt, akustik gitar, org ve perküsyon
// lucide çizgi biçiminde (24×24, 2 px, yuvarlak uç) burada çizilir. Renk currentColor'dır.

function Cizim({ size, children }: { size: number; children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0">
      {children}
    </svg>
  );
}

export default function EnstrumanSimgesi({ simge, size = 15 }: { simge: EnstrumanSimge; size?: number }) {
  switch (simge) {
    case "gitar-elektro":
      return <Guitar size={size} aria-hidden className="shrink-0" />;
    case "gitar-akustik":
      // Akustik gitar: sekiz biçimli gövde, ses deliği, sap
      return (
        <Cizim size={size}>
          <path d="M14.5 9.5 20 4" />
          <path d="m18.5 2.5 3 3" />
          <path d="M14.6 9.4c-1.5-1.5-3.9-1.3-5 .4-.5.8-1.3 1.3-2.2 1.5C4.6 11.9 3 14 3 16.2 3 18.9 5.1 21 7.8 21c2.2 0 4.3-1.6 4.9-4.4.2-.9.7-1.7 1.5-2.2 1.7-1.1 1.9-3.5.4-5Z" />
          <circle cx="9" cy="15" r="1.6" />
        </Cizim>
      );
    case "bas":
      // Fa (bas) anahtarı
      return (
        <Cizim size={size}>
          <circle cx="6.5" cy="9" r="1.6" fill="currentColor" stroke="none" />
          <path d="M6.5 9.2C6 5.6 8.6 4 11 4c3.4 0 5.5 2.6 5.5 6 0 5-4.6 8.6-11 10" />
          <circle cx="20" cy="7.5" r="1.1" fill="currentColor" stroke="none" />
          <circle cx="20" cy="12.5" r="1.1" fill="currentColor" stroke="none" />
        </Cizim>
      );
    case "davul":
      return <Drum size={size} aria-hidden className="shrink-0" />;
    case "perkusyon":
      // Konga: fıçı gövde ve deri
      return (
        <Cizim size={size}>
          <ellipse cx="12" cy="5.5" rx="6" ry="2.5" />
          <path d="M6 5.5c-1 5-.6 10.5 1.5 14.5h9c2.1-4 2.5-9.5 1.5-14.5" />
          <path d="M5.7 11.5h12.6" />
        </Cizim>
      );
    case "piyano":
      return <Piano size={size} aria-hidden className="shrink-0" />;
    case "org":
      // Org: iki sıra tuş ve borular
      return (
        <Cizim size={size}>
          <path d="M5 3v8M9 5v6M13 3v8M17 6v5" />
          <rect x="3" y="13" width="18" height="8" rx="1.5" />
          <path d="M8 13v4M12 13v4M16 13v4" />
        </Cizim>
      );
    case "synth":
      return <KeyboardMusic size={size} aria-hidden className="shrink-0" />;
    case "yayli":
      // Keman: gövde, sap ve yay
      return (
        <Cizim size={size}>
          <path d="M13.5 10.5 20 4" />
          <path d="m18.5 2.5 3 3" />
          <path d="M13.8 10.2c-1.2-1.2-3.2-1.2-4.4 0-.4.4-.4 1 0 1.4.6.6.6 1.4 0 2-.4.4-1 .4-1.4 0-.7-.7-1.8-.7-2.5 0-1.7 1.7-1.7 4.4 0 6.1s4.4 1.7 6.1 0c.7-.7.7-1.8 0-2.5-.4-.4-.4-1 0-1.4.6-.6 1.4-.6 2 0 .4.4 1 .4 1.4 0 1.2-1.2 1.2-3.2 0-4.4Z" />
          <path d="M3 9 10 2" />
        </Cizim>
      );
    case "bakir":
      // Trompet: boru, üç piston ve kalak
      return (
        <Cizim size={size}>
          <path d="M2 12h13" />
          <path d="M15 12c2.5 0 4.5-1.2 7-4v8c-2.5-2.8-4.5-4-7-4Z" />
          <path d="M5 12v4.5a1.5 1.5 0 0 0 1.5 1.5h6a1.5 1.5 0 0 0 1.5-1.5V12" />
          <path d="M7 12V8M9.5 12V8M12 12V8" />
        </Cizim>
      );
    case "saksofon":
      // Saksofon: ağızlık, eğik boyun, gövde ve yukarı dönen kalak
      return (
        <Cizim size={size}>
          <path d="m4 3 3 1.5" />
          <path d="M7 4.5c1.5.7 2.5 2 2.5 4v7a3.5 3.5 0 0 0 7 0V13" />
          <path d="M14 13h5l-1.5-3h-2Z" />
          <path d="M9.5 10h2M9.5 13h2" />
        </Cizim>
      );
    case "flut":
      // Flüt: çapraz boru ve perde delikleri
      return (
        <Cizim size={size}>
          <path d="m3 19 16-16 2 2L5 21Z" />
          <path d="m9.5 13.5.01.01M12.5 10.5l.01.01M15.5 7.5l.01.01" />
        </Cizim>
      );
    case "vokal":
      return <MicVocal size={size} aria-hidden className="shrink-0" />;
    default:
      return <Music size={size} aria-hidden className="shrink-0" />;
  }
}
