// Masaüstüne ve Başlat menüsüne "GuitarFlex" kısayolu ekler (Windows).
// Çalıştırma: npm run kisayol
// Kısayol, uygulamayı her açılışta GitHub'dan güncelleyerek başlatır (--guncelle).

const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const electronExe = path.join(ROOT, "node_modules", "electron", "dist", "electron.exe");
const mainFile = path.join(__dirname, "main.cjs");
const icon = path.join(__dirname, "icon.ico");

if (process.platform !== "win32") {
  console.log("Bu komut sadece Windows içindir. Uygulamayı açmak için: npm run desktop");
  process.exit(0);
}
if (!fs.existsSync(electronExe)) {
  console.error("Electron bulunamadı. Önce `npm install` çalıştır (gerekirse: node node_modules/electron/install.js).");
  process.exit(1);
}

const q = (s) => s.replace(/'/g, "''");
const ps = `
$shell = New-Object -ComObject WScript.Shell
$targets = @([Environment]::GetFolderPath('Desktop'), [Environment]::GetFolderPath('Programs'))
foreach ($dir in $targets) {
  $lnk = $shell.CreateShortcut((Join-Path $dir 'GuitarFlex.lnk'))
  $lnk.TargetPath = '${q(electronExe)}'
  $lnk.Arguments = '"${q(mainFile)}" --guncelle'
  $lnk.WorkingDirectory = '${q(ROOT)}'
  $lnk.IconLocation = '${q(icon)}'
  $lnk.Description = 'GuitarFlex - gitar akademisi'
  $lnk.Save()
  Write-Output ('Kısayol oluşturuldu: ' + (Join-Path $dir 'GuitarFlex.lnk'))
}
`;

execFileSync("powershell.exe", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", ps], { stdio: "inherit" });
console.log("Tamam. Masaüstündeki GuitarFlex simgesine çift tıklayarak açabilirsin.");
