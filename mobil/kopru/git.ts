// DOM bileşenindeki bağlantıların hedefi: yerel tarafın verdiği işlev (WebView'de köprü, web'de doğrudan router)
let hedef: ((yol: string) => void) | null = null;
export const gitKur = (f: (yol: string) => void) => {
  hedef = f;
};
export const git = (yol: string) => hedef?.(yol);
