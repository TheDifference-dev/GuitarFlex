// Windows: masaüstü ve Başlat menüsü kısayollarının simgesini güncel tutar.
// Windows, .lnk simgesini dosya yoluna göre önbelleğe alır; icon.ico güncellenince
// eski simge görünmeye devam eder. Bu yüzden simgenin sürümlü bir kopyası
// (userData/simge/GuitarFlex-<özet>.ico) kısayollara bağlanır ve simge önbelleği yenilenir.

const { execFile } = require("node:child_process");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

function calistir(dosya, args) {
  return new Promise((resolve) => {
    execFile(dosya, args, { windowsHide: true, timeout: 30000 }, (err, stdout) => resolve({ ok: !err, stdout: String(stdout || "") }));
  });
}

/**
 * @param {{ ikon: string, klasor: string }} o  ikon: desktop/icon.ico · klasor: app.getPath("userData")
 * @returns {Promise<boolean>} kısayollar güncellendiyse true
 */
async function simgeleriYenile({ ikon, klasor }) {
  if (process.platform !== "win32" || !fs.existsSync(ikon)) return false;
  const ozet = crypto.createHash("sha1").update(fs.readFileSync(ikon)).digest("hex").slice(0, 10);
  const dizin = path.join(klasor, "simge");
  const hedef = path.join(dizin, `GuitarFlex-${ozet}.ico`);
  const kayit = path.join(dizin, "son.txt");
  fs.mkdirSync(dizin, { recursive: true });
  if (!fs.existsSync(hedef)) fs.copyFileSync(ikon, hedef);

  let son = "";
  try { son = fs.readFileSync(kayit, "utf8").trim(); } catch {}
  if (son === ozet) return false;

  const q = (s) => s.replace(/'/g, "''");
  const ps = `
$ErrorActionPreference = 'Stop'
$shell = New-Object -ComObject WScript.Shell
$n = 0
foreach ($dir in @([Environment]::GetFolderPath('Desktop'), [Environment]::GetFolderPath('Programs'))) {
  $yol = Join-Path $dir 'GuitarFlex.lnk'
  if (Test-Path -LiteralPath $yol) {
    $lnk = $shell.CreateShortcut($yol)
    $lnk.IconLocation = '${q(hedef)}'
    $lnk.Save()
    $n++
  }
}
Write-Output $n
`;
  const r = await calistir("powershell.exe", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", ps]);
  if (!r.ok) return false;

  // Simge önbelleğini yenile (Windows 10/11: -show; eski sürümler: -ClearIconCache)
  const ie4 = path.join(process.env.SystemRoot || "C:\\Windows", "System32", "ie4uinit.exe");
  if (fs.existsSync(ie4)) {
    const s = await calistir(ie4, ["-show"]);
    if (!s.ok) await calistir(ie4, ["-ClearIconCache"]);
  }

  fs.writeFileSync(kayit, ozet);
  for (const f of fs.readdirSync(dizin)) {
    if (/^GuitarFlex-[0-9a-f]+\.ico$/.test(f) && f !== path.basename(hedef)) {
      try { fs.unlinkSync(path.join(dizin, f)); } catch {}
    }
  }
  return true;
}

module.exports = { simgeleriYenile };
