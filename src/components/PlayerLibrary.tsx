"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import TabPlayer, { type TabSource } from "./TabPlayer";
import { SONGS } from "@/content/songs";
import type { ArchiveEntry } from "@/lib/archive";

const ACCEPT = ".gp,.gp3,.gp4,.gp5,.gpx,.gp7,.xml,.musicxml,.tex,.atex";
const isTex = (name: string) => /\.(a?tex)$/i.test(name);

type Opened = { name: string; source: TabSource };

export default function PlayerLibrary() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const songSlug = params.get("sarki");
  const archivePath = params.get("arsiv");

  const [archive, setArchive] = useState<ArchiveEntry[] | null>(null);
  const [filter, setFilter] = useState("");
  const [opened, setOpened] = useState<Opened | null>(null);
  const [archiveTex, setArchiveTex] = useState<{ path: string; source: TabSource } | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    fetch("/api/arsiv")
      .then((r) => (r.ok ? r.json() : []))
      .then(setArchive)
      .catch(() => setArchive([]));
  }, []);

  // Arşivden seçilen alphaTex dosyası metin olarak, diğerleri dosya adresi olarak yüklenir.
  const archiveUrl = archivePath ? `/api/arsiv/dosya?yol=${encodeURIComponent(archivePath)}` : null;
  const archiveFileSource = useMemo<TabSource | null>(
    () => (archiveUrl && archivePath && !isTex(archivePath) ? { kind: "url", url: archiveUrl } : null),
    [archiveUrl, archivePath],
  );
  useEffect(() => {
    if (!archiveUrl || !archivePath || !isTex(archivePath)) return;
    let cancelled = false;
    fetch(archiveUrl)
      .then((r) => r.text())
      .then((tex) => !cancelled && setArchiveTex({ path: archivePath, source: { kind: "tex", tex } }));
    return () => {
      cancelled = true;
    };
  }, [archiveUrl, archivePath]);
  const archiveSource = archiveFileSource ? { path: archivePath!, source: archiveFileSource } : archiveTex;

  const song = SONGS.find((s) => s.slug === songSlug) ?? (!archivePath && !opened ? SONGS[0] : undefined);
  const songSource = useMemo<TabSource | null>(() => (song ? { kind: "tex", tex: song.tex } : null), [song]);

  let current: { title: string; subtitle: string; source: TabSource } | null = null;
  if (opened && !songSlug && !archivePath) current = { title: opened.name, subtitle: "Açılan dosya", source: opened.source };
  else if (archivePath && archiveSource?.path === archivePath)
    current = { title: archivePath.split("/").pop() ?? archivePath, subtitle: "Arşivim", source: archiveSource.source };
  else if (song && songSource) current = { title: song.title, subtitle: song.artist, source: songSource };

  const select = (query: string) => {
    router.replace(`${pathname}?${query}`, { scroll: false });
  };

  const openFile = async (file: File) => {
    const source: TabSource = isTex(file.name) ? { kind: "tex", tex: await file.text() } : { kind: "file", data: await file.arrayBuffer(), name: file.name };
    setOpened({ name: file.name, source });
    router.replace(pathname, { scroll: false });
  };

  const filtered = (archive ?? []).filter((a) => a.path.toLocaleLowerCase("tr").includes(filter.toLocaleLowerCase("tr")));
  const item = (active: boolean) =>
    `block w-full truncate rounded-lg px-2.5 py-1.5 text-left text-sm transition ${active ? "bg-accent/15 font-medium text-accent" : "hover:bg-white/[0.06]"}`;

  return (
    <div
      className="relative grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]"
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) void openFile(file);
      }}
    >
      {dragging && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-3xl border-2 border-dashed border-accent bg-bg/80 text-lg font-semibold">
          Tab dosyasını bırak
        </div>
      )}

      <aside className="space-y-5">
        <label className="block cursor-pointer rounded-2xl border border-dashed border-line p-4 text-center text-sm transition hover:border-white/20">
          <span className="font-semibold">Dosya aç</span>
          <span className="block text-xs text-muted">Guitar Pro, MusicXML, alphaTex · ya da sürükle-bırak</span>
          <input
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void openFile(f);
              e.target.value = "";
            }}
          />
        </label>

        <section>
          <h2 className="mb-1 text-xs font-semibold text-muted">Örnek şarkılar</h2>
          {SONGS.map((s) => (
            <button key={s.slug} type="button" onClick={() => select(`sarki=${s.slug}`)} className={item(current?.source === songSource && song?.slug === s.slug)}>
              {s.title} <span className="opacity-70">· {s.artist}</span>
            </button>
          ))}
        </section>

        <section>
          <h2 className="mb-1 text-xs font-semibold text-muted">Arşivim</h2>
          {archive === null ? (
            <p className="text-sm text-muted">Yükleniyor…</p>
          ) : archive.length === 0 ? (
            <p className="text-sm text-muted">
              Arşiv boş. Tab dosyalarını projedeki <code className="rounded bg-line px-1">ozel-kaynak/tablar/</code> klasörüne koy.
            </p>
          ) : (
            <>
              <input
                type="search"
                placeholder={`${archive.length} dosyada ara…`}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="mb-2 w-full rounded-lg border border-white/10 bg-white/[0.05] px-2.5 py-1.5 text-sm"
              />
              <div className="max-h-[50vh] overflow-auto">
                {filtered.map((a) => (
                  <button key={a.path} type="button" onClick={() => select(`arsiv=${encodeURIComponent(a.path)}`)} className={item(archivePath === a.path)} title={a.path}>
                    {a.name}
                    {a.folder && <span className="block truncate text-xs opacity-70">{a.folder}</span>}
                  </button>
                ))}
              </div>
            </>
          )}
        </section>
      </aside>

      <section className="min-w-0 space-y-3">
        {current ? (
          <>
            <header>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{current.title}</h1>
              <p className="text-muted">{current.subtitle}</p>
            </header>
            <TabPlayer source={current.source} />
          </>
        ) : (
          <p className="text-muted">Yükleniyor…</p>
        )}
      </section>
    </div>
  );
}
