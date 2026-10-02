import type { Metadata } from "next";
import ProgressDashboard from "@/components/ProgressDashboard";

export const metadata: Metadata = { title: "İlerleme" };

export default function ProgressPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">İlerleme</h1>
        <p className="mt-1 text-muted">Şimdilik ilerlemen bu tarayıcıda saklanır.</p>
      </header>
      <ProgressDashboard />
    </div>
  );
}
