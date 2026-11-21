// Yalın düzen (route group): üst gezinme ve alt bilgi olmadan, pencereyi dolduran koyu zemin.
// Kök düzendeki site kabuğu (SiteKabugu) bu yolda gezinme/alt bilgiyi çizmez.
export default function MiniMetronomDuzeni({ children }: LayoutProps<"/metronom/mini">) {
  return <div className="bant-koyu fixed inset-0 overflow-hidden">{children}</div>;
}
