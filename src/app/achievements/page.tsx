"use client";

import { useEffect, useState } from "react";
import {
  getAchievements,
  claimAchievement,
  claimAllAchievements,
  AchievementInfo,
} from "@/actions/gameActions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/Sidebar";
import { useTranslations } from "next-intl";

type Category = "all" | "earnings" | "tier" | "prestige" | "contracts" | "followers" | "resources" | "finance" | "special";

const CATEGORY_ICONS: Record<Category, string> = {
  all: "🏆",
  earnings: "💰",
  tier: "📈",
  prestige: "🔄",
  contracts: "📝",
  followers: "📺",
  resources: "🏭",
  finance: "💼",
  special: "⭐",
};

function formatNumber(num: number): string {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toFixed(0);
}

function AchievementCard({
  achievement,
  onClaim,
  claiming,
  t,
  tName,
  tDesc,
}: {
  achievement: AchievementInfo;
  onClaim: (id: string) => void;
  claiming: boolean;
  t: (key: string) => string;
  tName: (key: string) => string;
  tDesc: (key: string) => string;
}) {
  const canClaim = achievement.unlocked && !achievement.claimed;

  return (
    <div
      className={`
        p-4 rounded-lg border transition-all
        ${achievement.claimed
          ? "bg-green-900/20 border-green-700/50"
          : achievement.unlocked
          ? "bg-yellow-900/20 border-yellow-600/50 hover:border-yellow-500"
          : "bg-slate-800/50 border-slate-700/50 opacity-60"
        }
      `}
    >
      <div className="flex items-start gap-3">
        <div className="text-3xl">{achievement.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-white truncate">{tName(achievement.id)}</h3>
            {achievement.claimed && (
              <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded">
                {t("claimed")}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400 mb-2">{tDesc(achievement.id)}</p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-yellow-400">
              +{formatNumber(achievement.reward)}$
            </span>
            {canClaim && (
              <Button
                size="sm"
                onClick={() => onClaim(achievement.id)}
                disabled={claiming}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                {claiming ? "..." : t("claim")}
              </Button>
            )}
            {!achievement.unlocked && (
              <span className="text-xs text-slate-500">{t("locked")}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AchievementsPage() {
  const t = useTranslations("achievements");
  const tName = useTranslations("achievementNames");
  const tDesc = useTranslations("achievementDescs");
  const [achievements, setAchievements] = useState<AchievementInfo[]>([]);
  const [unclaimedCount, setUnclaimedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [claimingAll, setClaimingAll] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchAchievements = async () => {
    try {
      const data = await getAchievements();
      if (data) {
        setAchievements(data.achievements);
        setUnclaimedCount(data.unclaimedCount);
      }
    } catch (error) {
      console.error("Failed to fetch achievements:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const handleClaim = async (id: string) => {
    setClaiming(id);
    try {
      const result = await claimAchievement(id);
      if (result.success) {
        setNotification({
          message: t("claimedSuccess", { amount: formatNumber(result.reward!) }),
          type: "success",
        });
        await fetchAchievements();
      } else {
        setNotification({ message: result.error || "Error", type: "error" });
      }
    } catch {
      setNotification({ message: "Error", type: "error" });
    } finally {
      setClaiming(null);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleClaimAll = async () => {
    setClaimingAll(true);
    try {
      const result = await claimAllAchievements();
      if (result.success) {
        setNotification({
          message: t("claimedAllSuccess", { count: result.claimedCount || 0, amount: formatNumber(result.totalReward!) }),
          type: "success",
        });
        await fetchAchievements();
      } else {
        setNotification({ message: result.error || "Error", type: "error" });
      }
    } catch {
      setNotification({ message: "Error", type: "error" });
    } finally {
      setClaimingAll(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const filteredAchievements = achievements.filter(
    (a) => activeCategory === "all" || a.category === activeCategory
  );

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const claimedCount = achievements.filter((a) => a.claimed).length;

  const availableCategories = ["all", ...new Set(achievements.map((a) => a.category))] as Category[];

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-900/20 via-transparent to-transparent pointer-events-none" />

          {notification && (
            <div
              className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
                notification.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
              }`}
            >
              {notification.message}
            </div>
          )}

          <div className="max-w-4xl mx-auto relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {t("title")}
                </h1>
                <p className="text-slate-400">
                  {t("unlockedCount", { claimed: claimedCount, total: achievements.length })}
                  {unclaimedCount > 0 && (
                    <span className="text-yellow-400 ml-2">
                      {t("unclaimedNotice", { count: unclaimedCount })}
                    </span>
                  )}
                </p>
              </div>
              {unclaimedCount > 0 && (
                <Button
                  onClick={handleClaimAll}
                  disabled={claimingAll}
                  className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
                >
                  {claimingAll ? t("claiming") : t("claimAll", { count: unclaimedCount })}
                </Button>
              )}
            </div>

            <div className="mb-6">
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500"
                  style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {availableCategories.map((category) => {
                const isActive = activeCategory === category;
                const categoryAchievements = category === "all"
                  ? achievements
                  : achievements.filter((a) => a.category === category);
                const categoryUnclaimed = categoryAchievements.filter(
                  (a) => a.unlocked && !a.claimed
                ).length;

                return (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`
                      flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all relative
                      ${isActive
                        ? "bg-yellow-600/30 text-yellow-400 border border-yellow-600/50"
                        : "bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent"
                      }
                    `}
                  >
                    <span>{CATEGORY_ICONS[category]}</span>
                    <span>{t(`categories.${category}`)}</span>
                    {categoryUnclaimed > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {categoryUnclaimed}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <Card className="bg-slate-800/80 border-slate-700 backdrop-blur-sm">
              <CardContent className="p-4 md:p-6">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-slate-400">{t("claiming")}</p>
                  </div>
                ) : filteredAchievements.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    {t("noAchievements")}
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {filteredAchievements
                      .sort((a, b) => {
                        if (a.unlocked && !a.claimed && !(b.unlocked && !b.claimed)) return -1;
                        if (!(a.unlocked && !a.claimed) && b.unlocked && !b.claimed) return 1;
                        if (a.claimed && !b.claimed) return -1;
                        if (!a.claimed && b.claimed) return 1;
                        return b.reward - a.reward;
                      })
                      .map((achievement) => (
                        <AchievementCard
                          key={achievement.id}
                          achievement={achievement}
                          onClaim={handleClaim}
                          claiming={claiming === achievement.id}
                          t={t}
                          tName={tName}
                          tDesc={tDesc}
                        />
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
