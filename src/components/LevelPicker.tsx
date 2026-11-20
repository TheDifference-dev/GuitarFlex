"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Guitar, Music } from "lucide-react";

export type LevelOption = { title: string; text: string; href: string };

/** "Gitarda Nasıl Çalışmalıyım?" seçicisi: elektro / akustik sekmesi ve üç seviye */
export default function LevelPicker({ elektro, akustik }: { elektro: LevelOption[]; akustik: LevelOption[] }) {
  const [tab, setTab] = useState<"elektro" | "akustik">("elektro");
  const options = tab === "elektro" ? elektro : akustik;
  const tabCls = (on: boolean) =>
    `flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition ${on ? "bg-seg text-text shadow-[var(--shadow-seg)]" : "text-muted hover:text-text"}`;
  return (
    <div className="space-y-4">
      <div className="flex gap-1 rounded-full border border-ink/[0.08] bg-ink/[0.05] p-1">
        <button type="button" className={tabCls(tab === "elektro")} onClick={() => setTab("elektro")}>
          <Guitar size={16} /> Elektro gitar
        </button>
        <button type="button" className={tabCls(tab === "akustik")} onClick={() => setTab("akustik")}>
          <Music size={16} /> Akustik gitar
        </button>
      </div>
      <div className="space-y-3">
        {options.map((o, i) => (
          <Link key={o.title} href={o.href} className="group flex items-center gap-4 card p-5 transition hover:border-ink/20">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-ink">{i + 1}</span>
            <span className="flex-1">
              <span className="block font-semibold">{o.title}</span>
              <span className="mt-0.5 block text-sm text-muted">{o.text}</span>
            </span>
            <ArrowRight size={18} className="text-accent transition group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </div>
  );
}
