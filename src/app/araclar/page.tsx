import type { Metadata } from "next";
import Metronome from "@/components/Metronome";
import NoteQuiz from "@/components/NoteQuiz";

export const metadata: Metadata = { title: "Araçlar" };

export default function ToolsPage() {
  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Araçlar</h1>
      </header>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Metronom</h2>
          <Metronome />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Nota Bulma Testi</h2>
          <p className="text-sm text-muted">60 saniyede sapta işaretlenen notaları bul. 12. perdeye kadar tüm teller.</p>
          <NoteQuiz />
        </div>
      </section>
    </div>
  );
}
