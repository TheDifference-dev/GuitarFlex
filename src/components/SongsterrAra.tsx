import { ExternalLink } from "lucide-react";
import { songUrl, type PopularSong } from "@/content/sarkilar";

/** Songsterr'de arama adresi. Tablar uygulamada tutulmaz; arama Songsterr'in kendi sayfasında açılır. */
export function songsterrAramaAdresi(q: string): string {
  return `https://www.songsterr.com/?pattern=${encodeURIComponent(q.trim())}`;
}

/**
 * Arama kutusunun altında: yazılan şarkı/sanatçıyı Songsterr'in tüm kataloğunda arar.
 * Masaüstü uygulamasında bağlantı varsayılan tarayıcıda açılır.
 */
export default function SongsterrAra({
  q,
  bulunan,
  oneriler = [],
}: {
  q: string;
  bulunan: number;
  oneriler?: PopularSong[];
}) {
  if (!q.trim()) return null;
  return (
    <div className="grid gap-2">
      {oneriler.length > 0 && (
        <ul
          className="grid gap-2 md:grid-cols-2 xl:grid-cols-3"
          aria-label="Popüler şarkılarda bulunanlar"
        >
          {oneriler.map((s) => (
            <li key={`${s.artist}-${s.title}`}>
              <a
                href={songUrl(s)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-[var(--panel-on-band)] px-4 py-2.5 text-sm transition-colors hover:border-[var(--accent)]"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">
                    {s.title}
                  </span>
                  <span className="block truncate text-muted">
                    {s.artist} · Songsterr
                  </span>
                </span>
                <ExternalLink
                  size={16}
                  className="shrink-0 text-muted"
                  aria-hidden
                />
              </a>
            </li>
          ))}
        </ul>
      )}
      <a
        href={songsterrAramaAdresi(q)}
        target="_blank"
        rel="noopener noreferrer"
        data-songsterr-ara
        className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-[var(--panel-on-band)] px-4 py-3 text-sm transition-colors hover:border-[var(--accent)]"
      >
        <ExternalLink
          size={18}
          className="shrink-0 text-[var(--accent)]"
          aria-hidden
        />
        <span className="min-w-0 flex-1">
          <span className="font-semibold">
            “{q.trim()}” için Songsterr&apos;de ara
          </span>
          <span className="block text-muted">
            {bulunan > 0
              ? "Burada olmayan sürümler ve diğer şarkılar için: "
              : "Burada bulunamadı. "}
            Songsterr&apos;in bütün tab kataloğu tarayıcıda açılır.
          </span>
        </span>
      </a>
    </div>
  );
}
