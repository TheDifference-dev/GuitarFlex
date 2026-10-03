// Kısayoldan açılışta çalışan güncelleyici.
// 1) GitHub'dan yeni sürümü çeker (git pull --ff-only)
// 2) package-lock.json değiştiyse paketleri kurar (npm install)
// 3) Kod derlenmiş sürümden farklıysa yeniden derler (next build)
// Projede kaydedilmemiş yerel değişiklik varsa derleme yerine geliştirme modu seçilir,
// böylece yerelde yapılan düzenlemeler anında görünür.

const { spawn } = require("node:child_process");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const isWin = process.platform === "win32";

function run(cmd, args, opts = {}) {
  return new Promise((resolve) => {
    let out = "";
    let child;
    try {
      child = spawn(cmd, args, { windowsHide: true, ...opts });
    } catch (e) {
      resolve({ code: -1, out: String(e) });
      return;
    }
    child.stdout?.on("data", (d) => (out += d));
    child.stderr?.on("data", (d) => (out += d));
    child.on("error", (e) => resolve({ code: -1, out: out + String(e) }));
    child.on("close", (code) => resolve({ code, out }));
  });
}

function fileHash(file) {
  try {
    return crypto.createHash("sha1").update(fs.readFileSync(file)).digest("hex");
  } catch {
    return null;
  }
}

/** PATH'teki git'i, yoksa GitHub Desktop'ın kendi içindeki git'i bulur. */
async function findGit() {
  if ((await run("git", ["--version"])).code === 0) return "git";
  if (isWin && process.env.LOCALAPPDATA) {
    const base = path.join(process.env.LOCALAPPDATA, "GitHubDesktop");
    try {
      const versions = fs
        .readdirSync(base)
        .filter((d) => d.startsWith("app-"))
        .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
      for (const v of versions) {
        const exe = path.join(base, v, "resources", "app", "git", "cmd", "git.exe");
        if (fs.existsSync(exe)) return exe;
      }
    } catch {}
  }
  return null;
}

/**
 * @param {string} root proje klasörü
 * @param {(text: string) => void} status açılış ekranındaki durum yazısı
 * @returns {Promise<{ mode: "prod" | "dev", notes: string[] }>}
 */
async function prepare(root, status) {
  const notes = [];
  const nodeEnv = { ...process.env, ELECTRON_RUN_AS_NODE: "1", NEXT_TELEMETRY_DISABLED: "1" };
  const git = await findGit();
  const hasRepo = fs.existsSync(path.join(root, ".git"));
  const lockFile = path.join(root, "package-lock.json");
  const lockBefore = fileHash(lockFile);

  let head = "yerel";
  let dirty = false;
  if (git && hasRepo) {
    status("Güncellemeler kontrol ediliyor…");
    const pull = await run(git, ["pull", "--ff-only"], { cwd: root });
    if (pull.code !== 0) notes.push("Güncelleme alınamadı (internet yok ya da çakışan yerel değişiklik var); mevcut sürümle açılıyor.");
    head = (await run(git, ["rev-parse", "HEAD"], { cwd: root })).out.trim() || "yerel";
    // Sadece gerçek kaynak dosyalarındaki değişiklikler sayılır; araçların kendiliğinden
    // dokunduğu dosyalar (tsconfig.json, package-lock.json vb.) yok sayılır.
    const changed = (await run(git, ["status", "--porcelain", "--untracked-files=all"], { cwd: root })).out
      .split("\n")
      .map((l) => l.slice(3).trim().replace(/^"|"$/g, ""))
      .filter(Boolean);
    dirty = changed.some((f) => /^(src|public|desktop|scripts)\//.test(f) || f === "package.json");
  } else {
    notes.push("Git bulunamadı; güncelleme denetlenmeden açılıyor.");
  }

  const needInstall = !fs.existsSync(path.join(root, "node_modules", "next")) || fileHash(lockFile) !== lockBefore;
  if (needInstall) {
    status("Yeni paketler kuruluyor… (birkaç dakika sürebilir)");
    const npm = await run(isWin ? "npm.cmd" : "npm", ["install"], { cwd: root, shell: isWin });
    if (npm.code !== 0) notes.push("Paket kurulumu tamamlanamadı; komut penceresinde `npm install` çalıştırmayı dene.");
  }

  // alphaTab dosyaları her zaman yerinde olsun
  await run(process.execPath, [path.join(root, "scripts", "copy-alphatab.mjs")], { cwd: root, env: nodeEnv });

  if (dirty) {
    notes.push("Projede kaydedilmemiş yerel değişiklikler var; geliştirme modunda açılıyor.");
    return { mode: "dev", notes };
  }

  const stamp = path.join(root, ".next", "guitarflex-surum.txt");
  const built = fs.existsSync(path.join(root, ".next", "BUILD_ID")) && fs.existsSync(stamp) && fs.readFileSync(stamp, "utf8") === head;
  if (!built) {
    status("Yeni sürüm hazırlanıyor… (1-2 dakika)");
    const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
    const build = await run(process.execPath, [nextBin, "build"], { cwd: root, env: nodeEnv });
    if (build.code !== 0) {
      notes.push("Derleme başarısız oldu; geliştirme modunda açılıyor.");
      fs.writeFileSync(path.join(root, "desktop", "son-derleme-hatasi.log"), build.out);
      return { mode: "dev", notes };
    }
    fs.writeFileSync(stamp, head);
  }
  return { mode: "prod", notes };
}

module.exports = { prepare };
