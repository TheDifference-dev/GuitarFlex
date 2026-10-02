import type { Metadata } from "next";
import { TechniqueGrid } from "@/components/ProgressWidgets";

export const metadata: Metadata = { title: "Teknik Yolları" };

export default function PathwaysPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Teknik Yolları</h1>
        <p className="mt-1 text-muted">
          Her teknik seviyelere ayrılır. Bir egzersizi hedef tempoda temiz çaldığında tamamlanmış sayılır.
        </p>
      </header>
      <TechniqueGrid />
    </div>
  );
}
