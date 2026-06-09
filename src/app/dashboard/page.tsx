import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { getUser } from "@/lib/getUser";
import { getGameState } from "@/actions/gameActions";
import { Dashboard } from "@/components/Dashboard";
import { Sidebar } from "@/components/Sidebar";

// Force dynamic rendering - nie cachuj, zawsze obliczaj offline earnings świeżo
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  // Disable ALL caching for this page
  noStore();

  const user = await getUser();

  if (!user?.id) {
    redirect("/");
  }

  const gameState = await getGameState();

  // No save selected - redirect to save selection
  if (!gameState) {
    redirect("/saves");
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Dashboard initialState={gameState} />
      </main>
    </div>
  );
}
