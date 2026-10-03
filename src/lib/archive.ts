import { existsSync } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";

import { PRIVATE_ROOTS } from "./private-roots";

// Kişisel tab arşivi: içerik köklerindeki `tablar/` klasörleri (bkz. private-roots.ts).
const ARCHIVE_ROOTS = PRIVATE_ROOTS.map((r) => path.join(r, "tablar"));

export const ARCHIVE_EXTENSIONS = [".gp", ".gp3", ".gp4", ".gp5", ".gpx", ".gp7", ".xml", ".musicxml", ".tex", ".atex"];

export type ArchiveEntry = { path: string; name: string; folder: string; size: number };

export async function listArchive(): Promise<ArchiveEntry[]> {
  const out: ArchiveEntry[] = [];
  let currentRoot = ARCHIVE_ROOTS[0];
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
        const rel = path.relative(currentRoot, full).split(path.sep).join("/");
        out.push({
          path: rel,
          name: path.basename(e.name, path.extname(e.name)),
          folder: path.dirname(rel) === "." ? "" : path.dirname(rel),
          size: (await stat(full)).size,
        });
      }
    }
  }
  for (const root of ARCHIVE_ROOTS) {
    currentRoot = root;
    await walk(root);
  }
  return out
    .filter((e, i, all) => all.findIndex((x) => x.path === e.path) === i)
    .sort((a, b) => a.path.localeCompare(b.path, "tr"));
}

/** Arşiv içindeki göreli yolu mutlak yola çevirir; klasör dışına çıkan yolları reddeder. */
export function resolveArchivePath(rel: string): string | null {
  if (!ARCHIVE_EXTENSIONS.includes(path.extname(rel).toLowerCase())) return null;
  for (const root of ARCHIVE_ROOTS) {
    const full = path.resolve(root, rel);
    if (!full.startsWith(root + path.sep)) return null;
    if (existsSync(full)) return full;
  }
  return null;
}
