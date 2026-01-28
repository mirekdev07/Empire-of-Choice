"use client";

import { useEffect, useState } from "react";
import { getLeaderboard, LeaderboardData, LeaderboardEntry } from "@/actions/gameActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/Sidebar";
import { useTranslations } from "next-intl";

type PathTab = "MEDIA" | "INDUSTRIAL" | "FINANCE";

const PATH_CONFIG = {
  MEDIA: { color: "#ec4899", icon: "📺" },
  INDUSTRIAL: { color: "#f97316", icon: "🏭" },
  FINANCE: { color: "#22c55e", icon: "💰" },
};

function formatNumber(num: number): string {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toFixed(0);
}

function LeaderboardTable({
  entries,
  path,
  t
}: {
  entries: LeaderboardEntry[];
  path: PathTab;
  t: (key: string) => string;
}) {
  const config = PATH_CONFIG[path];

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        {t("noPlayers")}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-700">
            <th className="text-left py-3 px-4 text-slate-400 font-medium">#</th>
            <th className="text-left py-3 px-4 text-slate-400 font-medium">{t("player")}</th>
            <th className="text-right py-3 px-4 text-slate-400 font-medium">{t("score")}</th>
            <th className="text-right py-3 px-4 text-slate-400 font-medium">{t("tier")}</th>
            <th className="text-right py-3 px-4 text-slate-400 font-medium">{t("prestige")}</th>
            <th className="text-right py-3 px-4 text-slate-400 font-medium">{entries[0]?.mainStatLabel || ""}</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={entry.rank}
              className={`border-b border-slate-800 hover:bg-slate-800/50 transition-colors ${
                entry.rank <= 3 ? "bg-slate-800/30" : ""
              }`}
            >
              <td className="py-3 px-4">
                {entry.rank === 1 && <span className="text-yellow-400 text-lg">🥇</span>}
                {entry.rank === 2 && <span className="text-gray-300 text-lg">🥈</span>}
                {entry.rank === 3 && <span className="text-orange-400 text-lg">🥉</span>}
                {entry.rank > 3 && <span className="text-slate-500">{entry.rank}</span>}
              </td>
              <td className="py-3 px-4">
                <span className="text-white font-medium">{entry.playerName}</span>
              </td>
              <td className="py-3 px-4 text-right">
                <span style={{ color: config.color }} className="font-bold">
                  {formatNumber(entry.score)}
                </span>
              </td>
              <td className="py-3 px-4 text-right text-slate-300">
                T{entry.tier}
              </td>
              <td className="py-3 px-4 text-right text-purple-400">
                {entry.timesPrestiged > 0 ? `×${entry.timesPrestiged}` : "-"}
              </td>
              <td className="py-3 px-4 text-right text-slate-300">
                {formatNumber(entry.mainStat)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function RankingPage() {
  const t = useTranslations("ranking");
  const tPaths = useTranslations("paths");
  const [activeTab, setActiveTab] = useState<PathTab>("MEDIA");
  const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const data = await getLeaderboard();
        setLeaderboard(data);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  const getCurrentEntries = (): LeaderboardEntry[] => {
    if (!leaderboard) return [];
    switch (activeTab) {
      case "MEDIA": return leaderboard.media;
      case "INDUSTRIAL": return leaderboard.industrial;
      case "FINANCE": return leaderboard.finance;
      default: return [];
    }
  };

  const getPathDescription = (path: PathTab): string => {
    switch (path) {
      case "MEDIA": return t("mediaDesc");
      case "INDUSTRIAL": return t("industrialDesc");
      case "FINANCE": return t("financeDesc");
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent pointer-events-none" />

          <div className="max-w-4xl mx-auto relative z-10">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {t("title")}
              </h1>
              <p className="text-slate-400">
                {t("subtitle")}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 mb-6 justify-center">
              {(Object.keys(PATH_CONFIG) as PathTab[]).map((path) => {
                const config = PATH_CONFIG[path];
                const isActive = activeTab === path;
                return (
                  <button
                    key={path}
                    onClick={() => setActiveTab(path)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                      ${isActive
                        ? "text-white shadow-lg"
                        : "bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800"
                      }
                    `}
                    style={isActive ? { backgroundColor: config.color + "30", color: config.color } : {}}
                  >
                    <span>{config.icon}</span>
                    <span>{tPaths(`${path}.name`)}</span>
                  </button>
                );
              })}
            </div>

            <Card className="bg-slate-800/80 border-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className="text-2xl">{PATH_CONFIG[activeTab].icon}</span>
                  <div>
                    <h2 className="text-xl text-white">{tPaths(`${activeTab}.name`)}</h2>
                    <p className="text-sm text-slate-400 font-normal">
                      {getPathDescription(activeTab)}
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-slate-400">{t("title")}...</p>
                  </div>
                ) : (
                  <LeaderboardTable entries={getCurrentEntries()} path={activeTab} t={t} />
                )}
              </CardContent>
            </Card>

            <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <h3 className="text-white font-medium mb-2">{t("scoring.title")}</h3>
              <div className="text-sm text-slate-400 space-y-1">
                <p><strong className="text-pink-400">{tPaths("MEDIA.name")}:</strong> {t("scoring.media")}</p>
                <p><strong className="text-orange-400">{tPaths("INDUSTRIAL.name")}:</strong> {t("scoring.industrial")}</p>
                <p><strong className="text-green-400">{tPaths("FINANCE.name")}:</strong> {t("scoring.finance")}</p>
                <p className="text-purple-400 mt-2">{t("scoring.bonus")}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
