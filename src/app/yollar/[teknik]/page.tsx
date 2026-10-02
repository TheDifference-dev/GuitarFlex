import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TECHNIQUES, getTechnique } from "@/content/techniques";
import { LevelList } from "@/components/ProgressWidgets";

export function generateStaticParams() {
  return TECHNIQUES.map((t) => ({ teknik: t.slug }));
}

export async function generateMetadata(props: PageProps<"/yollar/[teknik]">): Promise<Metadata> {
  const { teknik } = await props.params;
  return { title: getTechnique(teknik)?.name ?? "Teknik" };
}

export default async function TechniquePage(props: PageProps<"/yollar/[teknik]">) {
  const { teknik } = await props.params;
  const technique = getTechnique(teknik);
  if (!technique) notFound();

  return (
    <div className="space-y-6">
      <nav className="text-sm text-muted">
        <Link href="/yollar" className="hover:text-accent">
          Yollar
        </Link>{" "}
        / {technique.name}
      </nav>
      <header className="flex items-center gap-4">
        <span className="flex size-14 items-center justify-center rounded-xl bg-panel text-3xl">{technique.icon}</span>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{technique.name}</h1>
          <p className="text-muted">{technique.summary}</p>
        </div>
      </header>
      <LevelList technique={technique} />
    </div>
  );
}
