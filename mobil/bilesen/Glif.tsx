// Masaüstünün özgün glifleri (içerik paketinde SVG olarak; tek kaynak src/components/site/glifler)
import { SvgXml } from "react-native-svg";
import { GLIFLER } from "~/lib/icerik";

export default function Glif({ ad, boyut = 28, renk = "#FFFFFF", kalinlik }: { ad: string; boyut?: number; renk?: string; kalinlik?: number }) {
  let xml = GLIFLER[ad] ?? GLIFLER["nota"];
  if (!xml) return null;
  xml = xml.replace(/width="[^"]*"/, `width="${boyut}"`).replace(/height="[^"]*"/, `height="${boyut}"`);
  if (kalinlik) xml = xml.replace(/stroke-width="[^"]*"/, `stroke-width="${kalinlik}"`);
  return <SvgXml xml={xml.replace(/currentColor/g, renk)} width={boyut} height={boyut} />;
}
