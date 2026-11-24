"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import SongsterrAra from "@/components/SongsterrAra";
import SongsterrBag from "@/components/SongsterrBag";
import UygulamaSimgesi from "@/components/site/UygulamaSimgesi";
import { ExternalLink, Search } from "lucide-react";
import { MADALYALAR, songUrl, type Madalya, type PopularSong } from "@/content/sarkilar";
import { useProgress } from "@/lib/progress";
import { kursSimgesi } from "@/lib/simge";
import { defterIsle, kayitAc, populerKaydi } from "@/lib/defter";
import SarkiDefterKutusu from "@/components/defter/SarkiDefterKutusu";
import AlbumKapagi from "@/components/AlbumKapagi";

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
  Bronz: "border-line text-muted",
  Gümüş: "border-line text-muted",
  Altın: "border-line text-text",
  Platin: "border-line text-text",
  Elmas: "border-accent/40 text-accent",
  Usta: "border-accent/70 text-accent",
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
/** Songsterr'de açıldı: "Sık çalışılan" sayımı; şarkı defterdeyse "açıldı" işareti (açmak deftere kayıt açmaz) */
function songsterrAcildi(s: PopularSong) {
  acildi(anahtar(s));
  defterIsle((v) => kayitAc(v, populerKaydi(s)));
}
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
    `rounded-full border px-3.5 py-1.5 text-sm font-semibold ${active ? "border-accent bg-accent text-accent-ink" : "border-line bg-panel hover:border-ink/20"}`;
  const adim = songs.filter((s) => s.rehber).sort((a, b) => a.rehber!.adim - b.rehber!.adim);

  const kart = (s: PopularSong) => (
    <article key={`${s.artist}-${s.title}-${s.kind}`} data-renk={kursSimgesi(s.courses?.[0] ?? "").renk} className="renkli-kart yukselen flex flex-col card p-4 pt-5">
      <div className="flex items-start justify-between gap-2">
        <AlbumKapagi sanatci={s.artist} baslik={s.title} boyut={56} className="ring-1 ring-ink/10" />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold leading-tight">
            {s.title}
            {s.yeni ? <span className="ml-2 rounded-full bg-primary px-2 py-0.5 align-middle text-[10px] font-semibold text-primary-ink">Yeni</span> : null}
          </h3>
          <p className="text-sm text-muted">{s.artist}</p>
        </div>
        <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${MADALYA_STYLE[madalyaOf(s)]}`}>
          {madalyaOf(s)}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent">{s.kind}</span>
        {s.bpm ? <span className="rounded-full bg-ink/[0.07] px-2.5 py-0.5 text-xs text-muted">{s.bpm} BPM</span> : null}
        {s.koken ? <span className="rounded-full bg-ink/[0.07] px-2.5 py-0.5 text-xs text-muted">{s.koken}</span> : null}
        {s.tags
          .filter((t) => !/BPM$/.test(t) && !["Riff", "Solo", "Türkçe"].includes(t))
          .map((t) => (
            <span key={t} className="rounded-full bg-ink/[0.07] px-2.5 py-0.5 text-xs text-muted">
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
      <div className="mt-3 border-t border-line/60 pt-3">
        <SarkiDefterKutusu bilgi={populerKaydi(s)} />
      </div>
      <div className="flex-1" />
      <SongsterrBag q={songUrl(s)} onAc={() => songsterrAcildi(s)} className="btn-primary mt-4 self-stretch px-4 py-2 text-sm">
        Songsterr&apos;de Aç <ExternalLink size={15} />
      </SongsterrBag>
    </article>
  );

  return (
    <div className="space-y-4">
      {rehber ? (
        <div className="flex gap-2">
          <button type="button" className={chip(gorunum === "rehber")} onClick={() => setGorunum("rehber")}>
            Rehber Şarkılar
          </button>
          <button type="button" className={chip(gorunum === "tum")} onClick={() => setGorunum("tum")}>
            Tüm Şarkılar
          </button>
        </div>
      ) : null}

      {gorunum === "rehber" ? (
        <div className="space-y-10" data-rehber-gorunumu>
          <p className="max-w-3xl text-[17px] text-muted">
            {adim.length} adımlık şarkı yolu (GuitarBear Şarkı Rehberi sırası): önce hazırlayan teknik bölümünü çalış, sonra şarkıya geç. Kilit yok, her adım açık.
            Profil Puanın (tamamlanan ders sayın) şu an <b className="font-semibold text-text">{puan}</b>; önerilen eşiğin altındaki adımlarda önerilen ders sayısı yazar.
          </p>
          {rehberBolumleri(adim).map((bolum, bi) => (
            <section key={bolum.puan} aria-labelledby={`rehber-bolum-${bi}`}>
              <h3 id={`rehber-bolum-${bi}`} className="mb-4 flex flex-wrap items-baseline gap-x-3 text-[28px] font-semibold leading-tight">
                Bölüm {bi + 1}
                <span className="text-[17px] font-normal text-muted">
                  {bolum.puan ? `Önerilen: ${bolum.puan} tamamlanmış ders` : "Hemen başla"} · Adım {bolum.sarkilar[0].rehber!.adim}–{bolum.sarkilar[bolum.sarkilar.length - 1].rehber!.adim}
                </span>
              </h3>
              <ol className="relative space-y-3 before:absolute before:bottom-6 before:left-[27px] before:top-6 before:w-0.5 before:rounded-full before:bg-ink/10">
                {bolum.sarkilar.map((s) => (
                  <RehberAdimi key={anahtar(s)} s={s} puan={puan} courseTitles={courseTitles} onAc={() => songsterrAcildi(s)} />
                ))}
              </ol>
            </section>
          ))}
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className={chip(madalya === "")} onClick={() => setMadalya("")}>
              Tümü ({songs.length})
            </button>
            {MADALYALAR.filter((m) => songs.some((s) => madalyaOf(s) === m)).map((m) => (
              <button key={m} type="button" className={chip(madalya === m)} onClick={() => setMadalya(m)}>
                {m} ({songs.filter((s) => madalyaOf(s) === m).length})
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex min-w-60 flex-1 items-center gap-2 rounded-full border border-ink/10 bg-ink/[0.05] px-3.5 py-1.5">
              <Search size={16} className="text-muted" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Şarkı veya sanatçı ara..." className="w-full bg-transparent text-sm outline-none" />
            </label>
            {kokenVar ? (
              <select value={koken} onChange={(e) => setKoken(e.target.value as typeof koken)} className="rounded-full border border-ink/10 bg-ink/[0.05] px-3.5 py-1.5 text-sm" aria-label="Köken">
                <option value="">Köken: Tümü</option>
                <option value="Global">Global</option>
                <option value="Türkçe">Türkçe</option>
              </select>
            ) : null}
            {turler.length > 1 ? (
              <select value={kind} onChange={(e) => setKind(e.target.value as typeof kind)} className="rounded-full border border-ink/10 bg-ink/[0.05] px-3.5 py-1.5 text-sm" aria-label="Tür">
                <option value="">Tür: Tümü</option>
                {turler.map((t) => (
                  <option key={t} value={t}>
                    {t[0].toLocaleUpperCase("tr") + t.slice(1)}
                  </option>
                ))}
              </select>
            ) : null}
            <select value={course} onChange={(e) => setCourse(e.target.value)} className="rounded-full border border-ink/10 bg-ink/[0.05] px-3.5 py-1.5 text-sm" aria-label="Teknik">
              <option value="">Bütün teknikler</option>
              {Object.entries(courseTitles)
                .filter(([slug]) => songs.some((s) => s.courses?.includes(slug)))
                .map(([slug, title]) => (
                  <option key={slug} value={slug}>
                    {title}
                  </option>
                ))}
            </select>
            <select value={sira} onChange={(e) => setSira(e.target.value as Siralama)} className="rounded-full border border-ink/10 bg-ink/[0.05] px-3.5 py-1.5 text-sm" aria-label="Sıralama">
              {Object.entries(SIRALAMA).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <p className="text-sm text-muted">{shown.length} şarkı · Tablar Songsterr&apos;de açılır.</p>

          <SongsterrAra q={q} bulunan={shown.length} />

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{shown.map(kart)}</div>
        </>
      )}
    </div>
  );
}

/** Rehber adımları önerilen eşiğe (Profil Puanı) göre bölümlere ayrılır; sıra aynen korunur */
function rehberBolumleri(adim: PopularSong[]) {
  const out: { puan: number; sarkilar: PopularSong[] }[] = [];
  for (const s of adim) {
    const son = out[out.length - 1];
    if (son && son.puan === s.rehber!.puan) son.sarkilar.push(s);
    else out.push({ puan: s.rehber!.puan, sarkilar: [s] });
  }
  return out;
}

/** Rehberin büyük adım kartı: adım numarası, şarkı, tür ve madalya, hazırlayan kurs bölümleri (kurs renkleriyle), Songsterr */
function RehberAdimi({ s, puan, courseTitles, onAc }: { s: PopularSong; puan: number; courseTitles: Record<string, string>; onAc: () => void }) {
  const r = s.rehber!;
  const ilk = kursSimgesi(r.bolumler[0]?.kurs ?? s.courses?.[0] ?? "");
  const onerilen = puan < r.puan;
  return (
    <li data-renk={ilk.renk} className="relative flex items-start gap-4">
      <span
        className="relative z-[1] mt-4 flex size-14 shrink-0 items-center justify-center rounded-full text-[21px] font-semibold tabular-nums text-white shadow-[0_0_0_4px_var(--bg)]"
        style={{ background: "var(--r2)" }}
        aria-label={`Adım ${r.adim}`}
      >
        {r.adim}
      </span>
      <article className="renkli-kart yukselen card flex min-w-0 flex-1 flex-wrap items-center gap-x-6 gap-y-3 p-5 pt-6">
        <AlbumKapagi sanatci={s.artist} baslik={s.title} boyut={84} className="ring-1 ring-ink/10" />
        <div className="min-w-[14rem] flex-1">
          <h4 className="text-[24px] font-semibold leading-tight">
            <SongsterrBag q={songUrl(s)} onAc={onAc} className="hover:underline">
              {s.title}
            </SongsterrBag>
          </h4>
          <p className="text-[17px] text-muted">{s.artist}</p>
          <p className="mt-2 flex flex-wrap gap-1.5 text-xs">
            <span className="rounded-full px-2.5 py-0.5 font-semibold text-white" style={{ background: "var(--r2)" }}>
              {s.kind[0].toLocaleUpperCase("tr") + s.kind.slice(1)}
            </span>
            <span className={`rounded-full border px-2.5 py-0.5 font-semibold ${MADALYA_STYLE[madalyaOf(s)]}`}>
              {madalyaOf(s)} · {r.seviye}
            </span>
            {s.bpm ? <span className="rounded-full bg-ink/[0.07] px-2.5 py-0.5 tabular-nums text-muted">{s.bpm} BPM</span> : null}
            {s.koken ? <span className="rounded-full bg-ink/[0.07] px-2.5 py-0.5 text-muted">{s.koken}</span> : null}
            {onerilen && (
              <span className="rounded-full bg-ink/[0.07] px-2.5 py-0.5 text-muted" title="Önerilen Profil Puanı: bu şarkıdan önce çalışman önerilen ders sayısı (kilit değil)">
                Önerilen: {r.puan} ders
              </span>
            )}
          </p>
        </div>
        <div className="min-w-[14rem] flex-1">
          <p className="mb-1.5 text-xs font-semibold text-muted">Bu şarkı için çalış</p>
          <ul className="flex flex-wrap gap-2">
            {r.bolumler.map((b) => (
              <li key={b.ad}>
                <Link
                  href={`/calis/${b.kurs}`}
                  className="flex items-center gap-2 rounded-full border border-ink/10 bg-[var(--bg)] py-1 pl-1 pr-3 text-sm font-semibold transition hover:border-ink/25"
                >
                  <UygulamaSimgesi simge={kursSimgesi(b.kurs)} boyut={24} />
                  {courseTitles[b.kurs] ?? b.kurs} · {b.bolum}. Bölüm
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="w-full border-t border-line/60 pt-3">
          <SarkiDefterKutusu bilgi={populerKaydi(s)} sureli={false} />
        </div>
        <SongsterrBag q={songUrl(s)} onAc={onAc} className={`${onerilen ? "btn-secondary" : "btn-primary"} shrink-0 px-5 py-2 text-[15px]`}>
          Songsterr&apos;de aç <ExternalLink size={15} aria-hidden />
        </SongsterrBag>
      </article>
    </li>
  );
}
