import { readdir, stat } from "node:fs/promises";
import path from "node:path";

// Kişisel tab arşivi: Git'e gönderilmeyen `ozel-kaynak/tablar/` klasörü.
export const ARCHIVE_ROOT = path.join(process.cwd(), "ozel-kaynak", "tablar");

export const ARCHIVE_EXTENSIONS = [".gp", ".gp3", ".gp4", ".gp5", ".gpx", ".gp7", ".xml", ".musicxml", ".tex", ".atex"];

export type ArchiveEntry = { path: string; name: string; folder: string; size: number };

export async function listArchive(): Promise<ArchiveEntry[]> {
  const out: ArchiveEntry[] = [];
  async function walk(dir: string) {
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) await walk(full);
      else if (ARCHIVE_EXTENSIONS.includes(path.extname(e.name).toLowerCase())) {
        const rel = path.relative(ARCHIVE_ROOT, full).split(path.sep).join("/");
        out.push({
          path: rel,
          name: path.basename(e.name, path.extname(e.name)),
          folder: path.dirname(rel) === "." ? "" : path.dirname(rel),
          size: (await stat(full)).size,
        });
      }
    }
  }
  await walk(ARCHIVE_ROOT);
  return out.sort((a, b) => a.path.localeCompare(b.path, "tr"));
}

/** Arşiv içindeki göreli yolu mutlak yola çevirir; klasör dışına çıkan yolları reddeder. */
export function resolveArchivePath(rel: string): string | null {
  const full = path.resolve(ARCHIVE_ROOT, rel);
  if (!full.startsWith(ARCHIVE_ROOT + path.sep)) return null;
  if (!ARCHIVE_EXTENSIONS.includes(path.extname(full).toLowerCase())) return null;
  return full;
}
