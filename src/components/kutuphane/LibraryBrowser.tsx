"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { Clock, LayoutGrid, List, Search, SlidersHorizontal, X } from "lucide-react";
import type { Level, LibraryTrackRole } from "@/content/types";
import { LEVELS, SEVIYE } from "@/content/seviyeler";
import { ROL_ADI, SeviyeEtiketi, sure } from "./ortak";
import type { LibrarySummary } from "@/lib/kutuphane";

// Şarkı Kütüphanesi listesi: arama, filtreler (tür, zorluk, ton, tempo, enstrüman, kaynak), sıralama, liste ya da kart görünümü.

const ROL_SIRA: LibraryTrackRole[] = ["lead", "rhythm", "bass", "drums", "keys", "organ", "strings"];

/** Tempo aralıkları (BPM) */
const TEMPOLAR = [
  { id: "yavas", ad: "Yavaş", not: "< 90", test: (b: number) => b < 90 },
  { id: "orta", ad: "Orta", not: "90–129", test: (b: number) => b >= 90 && b < 130 },
  { id: "hizli", ad: "Hızlı", not: "130+", test: (b: number) => b >= 130 },
] as const;
type Tempo = (typeof TEMPOLAR)[number]["id"];

const SIRALAMA = { kolay: "Kolaydan zora", zor: "Zordan kolaya", ad: "Ada göre", tempo: "Tempoya göre" } as const;
type Siralama = keyof typeof SIRALAMA;

// Görünüm tercihi (liste / kart) bu tarayıcıda saklanır
const GORUNUM_KEY = "gf-kutuphane-gorunum";
const GORUNUM_OLAY = "gf-kutuphane-gorunum-degisti";
function gorunumOku(): "liste" | "kart" {
  try {
    return window.localStorage.getItem(GORUNUM_KEY) === "kart" ? "kart" : "liste";
  } catch {
    return "liste";
  }
}
function gorunumAbone(cb: () => void) {
  window.addEventListener(GORUNUM_OLAY, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(GORUNUM_OLAY, cb);
    window.removeEventListener("storage", cb);
  };
}
function gorunumYaz(v: "liste" | "kart") {
  try {
    window.localStorage.setItem(GORUNUM_KEY, v);
  } catch {
    // Saklanamazsa tercih yalnız bu sayfada geçerli olur.
  }
  window.dispatchEvent(new Event(GORUNUM_OLAY));
}

const ozgun = (s: LibrarySummary) => s.source.startsWith("Özgün");
const roller = (s: LibrarySummary) => new Set(s.tracks.map((t) => t.role));

export default function LibraryBrowser({ songs }: { songs: LibrarySummary[] }) {
  const gorunum = useSyncExternalStore(gorunumAbone, gorunumOku, () => "liste" as const);
  const [q, setQ] = useState("");
  const [acik, setAcik] = useState(false);
  const [turler, setTurler] = useState<Set<string>>(new Set());
  const [seviyeler, setSeviyeler] = useState<Set<Level>>(new Set());
  const [ton, setTon] = useState("");
  const [tempo, setTempo] = useState<Tempo | "">("");
  const [enstruman, setEnstruman] = useState<LibraryTrackRole | "">("");
  const [kaynak, setKaynak] = useState<"" | "ozgun" | "kamu">("");
  const [sira, setSira] = useState<Siralama>("kolay");

  const tumTurler = useMemo(() => [...new Set(songs.map((s) => s.genre))].sort((a, b) => a.localeCompare(b, "tr")), [songs]);
  const tumTonlar = useMemo(() => [...new Set(songs.map((s) => s.key))].sort((a, b) => a.localeCompare(b, "tr")), [songs]);
  const tumRoller = useMemo(() => ROL_SIRA.filter((r) => songs.some((s) => roller(s).has(r))), [songs]);

  const shown = useMemo(() => {
    const needle = q.trim().toLocaleLowerCase("tr");
    const out = songs.filter((s) => {
      if (turler.size && !turler.has(s.genre)) return false;
      if (seviyeler.size && !seviyeler.has(s.level)) return false;
      if (ton && s.key !== ton) return false;
      if (tempo && !TEMPOLAR.find((t) => t.id === tempo)!.test(s.bpm)) return false;
      if (enstruman && !roller(s).has(enstruman)) return false;
      if (kaynak && (kaynak === "ozgun") !== ozgun(s)) return false;
      if (!needle) return true;
      const metin = [s.title, s.genre, s.key, s.description, s.origin ?? "", ...s.chords, ...s.techniques].join(" ").toLocaleLowerCase("tr");
      return metin.includes(needle);
    });
    const lv = (s: LibrarySummary) => LEVELS.indexOf(s.level);
    const by: Record<Siralama, (a: LibrarySummary, b: LibrarySummary) => number> = {
      kolay: (a, b) => lv(a) - lv(b) || a.bpm - b.bpm,
      zor: (a, b) => lv(b) - lv(a) || b.bpm - a.bpm,
      ad: (a, b) => a.title.localeCompare(b.title, "tr"),
      tempo: (a, b) => a.bpm - b.bpm,
    };
    return out.sort(by[sira]);
  }, [songs, q, turler, seviyeler, ton, tempo, enstruman, kaynak, sira]);

  const filtreSayisi = turler.size + seviyeler.size + (ton ? 1 : 0) + (tempo ? 1 : 0) + (enstruman ? 1 : 0) + (kaynak ? 1 : 0);
  const temizle = () => {
    setTurler(new Set());
    setSeviyeler(new Set());
    setTon("");
    setTempo("");
    setEnstruman("");
    setKaynak("");
  };
  const degistir = <T,>(v: T, yaz: (f: (s: Set<T>) => Set<T>) => void) =>
    yaz((onceki) => {
      const n = new Set(onceki);
      if (n.has(v)) n.delete(v);
      else n.add(v);
      return n;
    });
  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1 text-sm font-semibold transition ${active ? "border-accent bg-accent/15 text-accent" : "border-line bg-panel hover:border-white/20"}`;
  const say = (f: (s: LibrarySummary) => boolean) => songs.filter(f).length;

  const ekstra = (s: LibrarySummary) => s.tracks.filter((t) => !["lead", "rhythm", "bass", "drums"].includes(t.role)).map((t) => ROL_ADI[t.role]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex min-w-60 flex-1 items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-1.5">
          <Search size={16} className="text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Şarkı, tür, akor ya da teknik ara..." className="w-full bg-transparent text-sm outline-none" aria-label="Kütüphanede ara" />
          {q && (
            <button type="button" onClick={() => setQ("")} className="text-muted hover:text-text" aria-label="Aramayı temizle">
              <X size={14} />
            </button>
          )}
        </label>
        <button type="button" onClick={() => setAcik(!acik)} className={`flex items-center gap-1.5 ${chip(acik || filtreSayisi > 0)} py-1.5`} aria-expanded={acik}>
          <SlidersHorizontal size={15} /> Filtreler{filtreSayisi ? ` (${filtreSayisi})` : ""}
        </button>
        <select value={sira} onChange={(e) => setSira(e.target.value as Siralama)} className="rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-1.5 text-sm" aria-label="Sıralama">
          {Object.entries(SIRALAMA).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <div className="flex rounded-full border border-white/10 bg-white/[0.05] p-0.5" role="group" aria-label="Görünüm">
          {(["liste", "kart"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => gorunumYaz(g)}
              aria-pressed={gorunum === g}
              title={g === "liste" ? "Liste görünümü" : "Kart görünümü"}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${gorunum === g ? "bg-white/[0.12] text-text" : "text-muted hover:text-text"}`}
            >
              {g === "liste" ? <List size={15} /> : <LayoutGrid size={15} />} {g === "liste" ? "Liste" : "Kart"}
            </button>
          ))}
        </div>
      </div>

      {acik && (
        <section className="card space-y-3 p-4" aria-label="Filtreler">
          <Satir ad="Tür">
            {tumTurler.map((t) => (
              <button key={t} type="button" className={chip(turler.has(t))} onClick={() => degistir(t, setTurler)}>
                {t} <span className="text-muted">{say((s) => s.genre === t)}</span>
              </button>
            ))}
          </Satir>
          <Satir ad="Zorluk">
            {LEVELS.map((l) => (
              <button key={l} type="button" className={chip(seviyeler.has(l))} onClick={() => degistir(l, setSeviyeler)} title={SEVIYE[l].ad}>
                {l} <span className="text-muted">{say((s) => s.level === l)}</span>
              </button>
            ))}
          </Satir>
          <Satir ad="Tempo">
            {TEMPOLAR.map((t) => (
              <button key={t.id} type="button" className={chip(tempo === t.id)} onClick={() => setTempo(tempo === t.id ? "" : t.id)}>
                {t.ad} <span className="text-muted">{t.not}</span>
              </button>
            ))}
          </Satir>
          <Satir ad="Enstrüman">
            {tumRoller.map((r) => (
              <button key={r} type="button" className={chip(enstruman === r)} onClick={() => setEnstruman(enstruman === r ? "" : r)}>
                {ROL_ADI[r]} <span className="text-muted">{say((s) => roller(s).has(r))}</span>
              </button>
            ))}
          </Satir>
          <Satir ad="Ton ve kaynak">
            <select value={ton} onChange={(e) => setTon(e.target.value)} className="rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-1 text-sm" aria-label="Ton">
              <option value="">Ton: Tümü</option>
              {tumTonlar.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <button type="button" className={chip(kaynak === "ozgun")} onClick={() => setKaynak(kaynak === "ozgun" ? "" : "ozgun")}>
              Özgün
            </button>
            <button type="button" className={chip(kaynak === "kamu")} onClick={() => setKaynak(kaynak === "kamu" ? "" : "kamu")}>
              Kamu malı düzenleme
            </button>
            {filtreSayisi > 0 && (
              <button type="button" onClick={temizle} className="ml-auto flex items-center gap-1 text-sm font-semibold text-accent hover:underline">
                <X size={14} /> Filtreleri temizle
              </button>
            )}
          </Satir>
        </section>
      )}

      <p className="text-sm text-muted">
        {shown.length} / {songs.length} şarkı · Hepsi GuitarFlex&apos;e ait özgün parça ya da kamu malı ezgi düzenlemesi; çok track&apos;li tab oynatıcıyla açılır.
      </p>

      {!shown.length ? (
        <div className="card p-8 text-center text-muted">
          Bu filtrelere uyan şarkı yok.{" "}
          <button type="button" onClick={temizle} className="font-semibold text-accent hover:underline">
            Filtreleri temizle
          </button>
        </div>
      ) : gorunum === "liste" ? (
        <div className="card overflow-hidden">
          <div className="hidden grid-cols-[minmax(0,1fr)_9rem_8rem_5rem_minmax(0,11rem)_3.5rem] gap-3 border-b border-line px-4 py-2 text-xs font-semibold text-muted md:grid">
            <span>Şarkı</span>
            <span>Zorluk</span>
            <span>Ton</span>
            <span>Tempo</span>
            <span>Track&apos;ler</span>
            <span className="text-right">Süre</span>
          </div>
          <ol>
            {shown.map((s) => (
              <li key={s.slug} className="border-b border-line/60 last:border-b-0">
                <Link
                  href={`/kutuphane/${s.slug}`}
                  className="grid gap-x-3 gap-y-1 px-4 py-3 transition hover:bg-white/[0.04] md:grid-cols-[minmax(0,1fr)_9rem_8rem_5rem_minmax(0,11rem)_3.5rem] md:items-center"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{s.title}</span>
                    <span className="block truncate text-xs text-muted">
                      {s.genre} · {ozgun(s) ? "Özgün" : "Kamu malı, GuitarFlex düzenlemesi"}
                    </span>
                  </span>
                  <span>
                    <SeviyeEtiketi level={s.level} />
                  </span>
                  <span className="text-sm">{s.key}</span>
                  <span className="text-sm tabular-nums text-muted">
                    {s.bpm} <span className="text-xs">BPM</span>
                  </span>
                  <span className="truncate text-xs text-muted">
                    {s.tracks.length} track{ekstra(s).length ? ` · ${ekstra(s).join(", ")}` : ""} · {s.timeSignature}
                  </span>
                  <span className="text-right text-sm tabular-nums text-muted md:block">{sure(s.durationSec)}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((s) => (
            <Link key={s.slug} href={`/kutuphane/${s.slug}`} className="card flex flex-col p-4 transition hover:border-white/20">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold leading-tight">{s.title}</h3>
                  <p className="text-sm text-muted">{s.genre}</p>
                </div>
                <SeviyeEtiketi level={s.level} />
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-muted">{s.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
                <span className="rounded-full bg-white/[0.07] px-2.5 py-0.5">{s.key}</span>
                <span className="rounded-full bg-white/[0.07] px-2.5 py-0.5 tabular-nums">{s.bpm} BPM</span>
                <span className="rounded-full bg-white/[0.07] px-2.5 py-0.5">{s.timeSignature}</span>
                {s.feel && <span className="rounded-full bg-white/[0.07] px-2.5 py-0.5">{s.feel}</span>}
                <span className="flex items-center gap-1 rounded-full bg-white/[0.07] px-2.5 py-0.5 tabular-nums">
                  <Clock size={11} /> {sure(s.durationSec)}
                </span>
              </div>
              <p className="mt-auto pt-3 text-xs text-muted">
                {s.tracks.map((t) => ROL_ADI[t.role]).join(" · ")}
              </p>
              <p className="mt-1 text-[11px] font-medium text-accent">{ozgun(s) ? "Özgün (GuitarFlex)" : "Kamu malı · GuitarFlex düzenlemesi"}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Satir({ ad, children }: { ad: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-28 shrink-0 text-xs font-semibold text-muted">{ad}</span>
      {children}
    </div>
  );
}
