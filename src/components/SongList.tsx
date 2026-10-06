"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { ExternalLink, Lock, Search } from "lucide-react";
import { MADALYALAR, songUrl, type Madalya, type PopularSong } from "@/content/sarkilar";
import { useProgress } from "@/lib/progress";
import { METAL_IKON } from "@/lib/oyun";

type Props = { songs: PopularSong[]; courseTitles: Record<string, string>; rehber?: boolean };
type Siralama = "sik" | "kolay" | "zor" | "yeni" | "isim";
const SIRALAMA: Record<Siralama, string> = {
  sik: "Sık çalışılan şarkılar",
  kolay: "Zorluk (Kolay → Zor)",
  zor: "Zorluk (Zor → Kolay)",
  yeni: "En Yeni",
  isim: "İsme Göre",
};
const MADALYA_STYLE: Record<Madalya, string> = {
  Bronz: "border-orange-400/50 text-orange-300",
  Gümüş: "border-slate-300/50 text-slate-200",
  Altın: "border-amber-400/60 text-amber-300",
  Platin: "border-cyan-300/50 text-cyan-200",
  Elmas: "border-sky-400/60 text-sky-300",
  Usta: "border-rose-400/60 text-rose-300",
};

/** Madalyası olmayan (yerleşik) şarkılarda kolay/orta/zor seviyesinden tahmin */
const madalyaOf = (s: PopularSong): Madalya => s.madalya ?? (["Bronz", "Altın", "Elmas"] as const)[s.level - 1];
const zorluk = (s: PopularSong) => MADALYALAR.indexOf(madalyaOf(s)) * 1000 + (s.rehber ? Number(s.rehber.seviye.split(".")[1]) : (s.bpm ?? 0) / 10);
const anahtar = (s: PopularSong) => `${s.artist}|${s.title}`;

// Şarkıların kaç kez açıldığı (Sık çalışılan sıralaması), bu tarayıcıda saklanır
const ACILIS = "gf-sarki-acilis";
const ACILIS_OLAY = "gf-sarki-acilis-degisti";
let acilisOnbellek: { raw: string | null; data: Record<string, number> } = { raw: null, data: {} };
function acilislar(): Record<string, number> {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(ACILIS);
  } catch {
    // Gizli sekme: sayım tutulmaz.
  }
  if (raw !== acilisOnbellek.raw) acilisOnbellek = { raw, data: raw ? (JSON.parse(raw) as Record<string, number>) : {} };
  return acilisOnbellek.data;
}
const BOS: Record<string, number> = {};
function acildi(k: string) {
  const d = { ...acilislar(), [k]: (acilislar()[k] ?? 0) + 1 };
  try {
    window.localStorage.setItem(ACILIS, JSON.stringify(d));
  } catch {
    // Kayıt yapılamazsa sıralama değişmez.
  }
  window.dispatchEvent(new Event(ACILIS_OLAY));
}
function abone(cb: () => void) {
  window.addEventListener(ACILIS_OLAY, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(ACILIS_OLAY, cb);
    window.removeEventListener("storage", cb);
  };
}

export default function SongList({ songs, courseTitles, rehber = false }: Props) {
  const [gorunum, setGorunum] = useState<"rehber" | "tum">(rehber ? "rehber" : "tum");
  const [q, setQ] = useState("");
  const [madalya, setMadalya] = useState<Madalya | "">("");
  const [koken, setKoken] = useState<"" | "Global" | "Türkçe">("");
  const [kind, setKind] = useState<PopularSong["kind"] | "">("");
  const [course, setCourse] = useState("");
  const [sira, setSira] = useState<Siralama>("kolay");
  const acilis = useSyncExternalStore(abone, acilislar, () => BOS);
  const progress = useProgress();
  // Profil Puanı: tamamlanan ders sayısı. Şarkı Rehberi adımlarının kilit eşiği bununla karşılaştırılır.
  const puan = Object.entries(progress.exercises).filter(([k, e]) => !k.startsWith("serbest:") && e.completed).length;

  const turler = [...new Set(songs.map((s) => s.kind))];
  const kokenVar = songs.some((s) => s.koken === "Türkçe") && songs.some((s) => s.koken === "Global");
  const shown = useMemo(() => {
    const needle = q.trim().toLocaleLowerCase("tr");
    const out = songs.filter(
      (s) =>
        (!madalya || madalyaOf(s) === madalya) &&
        (!koken || s.koken === koken) &&
        (!kind || s.kind === kind) &&
        (!course || s.courses?.includes(course)) &&
        (!needle || `${s.title} ${s.artist}`.toLocaleLowerCase("tr").includes(needle)),
    );
    const by: Record<Siralama, (a: PopularSong, b: PopularSong) => number> = {
      sik: (a, b) => (acilis[anahtar(b)] ?? 0) - (acilis[anahtar(a)] ?? 0) || zorluk(a) - zorluk(b),
      kolay: (a, b) => zorluk(a) - zorluk(b),
      zor: (a, b) => zorluk(b) - zorluk(a),
      yeni: (a, b) => Number(Boolean(b.yeni)) - Number(Boolean(a.yeni)),
      isim: (a, b) => a.title.localeCompare(b.title, "tr"),
    };
    return out.sort(by[sira]);
  }, [songs, q, madalya, koken, kind, course, sira, acilis]);

  const chip = (active: boolean) =>
    `rounded-full border px-3.5 py-1.5 text-sm font-semibold ${active ? "border-accent bg-accent/15 text-accent" : "border-line bg-panel hover:border-white/20"}`;
  const adim = songs.filter((s) => s.rehber).sort((a, b) => a.rehber!.adim - b.rehber!.adim);

  const kart = (s: PopularSong) => (
    <article key={`${s.artist}-${s.title}-${s.kind}`} className="flex flex-col card p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold leading-tight">
            {s.title}
            {s.yeni ? <span className="ml-2 rounded-full bg-[image:var(--grad)] px-2 py-0.5 align-middle text-[10px] font-semibold text-white">Yeni</span> : null}
          </h3>
          <p className="text-sm text-muted">{s.artist}</p>
        </div>
        <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${MADALYA_STYLE[madalyaOf(s)]}`}>
          {METAL_IKON[madalyaOf(s)]} {madalyaOf(s)}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent">{s.kind}</span>
        {s.bpm ? <span className="rounded-full bg-white/[0.07] px-2.5 py-0.5 text-xs text-muted">{s.bpm} BPM</span> : null}
        {s.koken ? <span className="rounded-full bg-white/[0.07] px-2.5 py-0.5 text-xs text-muted">{s.koken}</span> : null}
        {s.tags
          .filter((t) => !/BPM$/.test(t) && !["Riff", "Solo", "Türkçe"].includes(t))
          .map((t) => (
            <span key={t} className="rounded-full bg-white/[0.07] px-2.5 py-0.5 text-xs text-muted">
              {t}
            </span>
          ))}
      </div>
      {!!s.courses?.length && (
        <p className="mt-3 text-xs text-muted">
          Hazırlık:{" "}
          {s.rehber
            ? s.rehber.bolumler.map((b, i) => (
                <span key={b.ad}>
                  {i > 0 && ", "}
                  <Link href={`/calis/${b.kurs}`} className="font-semibold text-text hover:text-accent">
                    {courseTitles[b.kurs] ?? b.kurs} · {b.bolum}. Bölüm
                  </Link>
                </span>
              ))
            : s.courses.map((c, i) => (
                <span key={c}>
                  {i > 0 && ", "}
                  <Link href={`/calis/${c}`} className="font-semibold text-text hover:text-accent">
                    {courseTitles[c] ?? c}
                  </Link>
                </span>
              ))}
        </p>
      )}
      <div className="flex-1" />
      <a
        href={songUrl(s)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => acildi(anahtar(s))}
        className="btn-grad mt-4 self-stretch px-4 py-2 text-sm"
      >
        Songsterr&apos;de Aç <ExternalLink size={15} />
      </a>
    </article>
  );

  return (
    <div className="space-y-4">
      {rehber ? (
        <div className="flex gap-2">
          <button type="button" className={chip(gorunum === "rehber")} onClick={() => setGorunum("rehber")}>
            Rehber Görünümü
          </button>
          <button type="button" className={chip(gorunum === "tum")} onClick={() => setGorunum("tum")}>
            Tüm Şarkılar
          </button>
        </div>
      ) : null}

      {gorunum === "rehber" ? (
        <div className="space-y-3">
          <p className="text-sm text-muted">
            {adim.length} adımlık şarkı yolu: önce hazırlayan teknik bölümünü çalış, sonra şarkıya geç. Bir adımın kilidi, Profil Puanın (tamamlanan ders sayın: {puan}) eşiğe ulaşınca açılır.
          </p>
          <ol className="space-y-2">
            {adim.map((s) => {
              const kilitli = puan < s.rehber!.puan;
              return (
                <li key={anahtar(s)} className={`flex flex-wrap items-center gap-3 card p-3 ${kilitli ? "opacity-60" : ""}`}>
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[image:var(--grad)] text-sm font-semibold text-white">{s.rehber!.adim}</span>
                  <div className="min-w-48 flex-1">
                    <p className="font-semibold leading-tight">
                      {s.title} <span className="font-normal text-muted">– {s.artist}</span>
                    </p>
                    <p className="text-xs text-muted">
                      <span className="uppercase">{s.kind}</span> · {METAL_IKON[madalyaOf(s)]} {madalyaOf(s)} ({s.rehber!.seviye}) · {s.koken} · Hazırlık:{" "}
                      {s.rehber!.bolumler.map((b, i) => (
                        <span key={b.ad}>
                          {i > 0 && ", "}
                          <Link href={`/calis/${b.kurs}`} className="font-semibold text-text hover:text-accent">
                            {courseTitles[b.kurs] ?? b.kurs} {b.bolum}. Bölüm
                          </Link>
                        </span>
                      ))}
                    </p>
                  </div>
                  {kilitli ? (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                      <Lock size={14} /> Profil Puanı {s.rehber!.puan}
                    </span>
                  ) : (
                    <a
                      href={songUrl(s)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => acildi(anahtar(s))}
                      className="btn-grad px-3.5 py-1.5 text-sm"
                    >
                      Aç <ExternalLink size={14} />
                    </a>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className={chip(madalya === "")} onClick={() => setMadalya("")}>
              Tümü ({songs.length})
            </button>
            {MADALYALAR.filter((m) => songs.some((s) => madalyaOf(s) === m)).map((m) => (
              <button key={m} type="button" className={chip(madalya === m)} onClick={() => setMadalya(m)}>
                {METAL_IKON[m]} {m} ({songs.filter((s) => madalyaOf(s) === m).length})
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex min-w-60 flex-1 items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-1.5">
              <Search size={16} className="text-muted" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Şarkı veya sanatçı ara..." className="w-full bg-transparent text-sm outline-none" />
            </label>
            {kokenVar ? (
              <select value={koken} onChange={(e) => setKoken(e.target.value as typeof koken)} className="rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-1.5 text-sm" aria-label="Köken">
                <option value="">Köken: Tümü</option>
                <option value="Global">Global</option>
                <option value="Türkçe">Türkçe</option>
              </select>
            ) : null}
            {turler.length > 1 ? (
              <select value={kind} onChange={(e) => setKind(e.target.value as typeof kind)} className="rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-1.5 text-sm" aria-label="Tür">
                <option value="">Tür: Tümü</option>
                {turler.map((t) => (
                  <option key={t} value={t}>
                    {t[0].toLocaleUpperCase("tr") + t.slice(1)}
                  </option>
                ))}
              </select>
            ) : null}
            <select value={course} onChange={(e) => setCourse(e.target.value)} className="rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-1.5 text-sm" aria-label="Teknik">
              <option value="">Bütün teknikler</option>
              {Object.entries(courseTitles)
                .filter(([slug]) => songs.some((s) => s.courses?.includes(slug)))
                .map(([slug, title]) => (
                  <option key={slug} value={slug}>
                    {title}
                  </option>
                ))}
            </select>
            <select value={sira} onChange={(e) => setSira(e.target.value as Siralama)} className="rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-1.5 text-sm" aria-label="Sıralama">
              {Object.entries(SIRALAMA).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <p className="text-sm text-muted">{shown.length} şarkı · Tablar Songsterr&apos;de açılır.</p>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{shown.map(kart)}</div>
        </>
      )}
    </div>
  );
}
