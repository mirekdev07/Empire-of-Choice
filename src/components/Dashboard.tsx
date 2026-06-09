"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/store/useGameStore";
import { getGameState, upgradeTier, GameState } from "@/actions/gameActions";
import { PATHS, getAvailableBuildings, getBuildingsByTier, getTierDefinition, getNextTier, checkTierRequirements, getTiersForPath, getCreditRatingFromValue } from "@/config/gamedata";
import { formatMoney } from "@/lib/engine";
import { BuildingCard } from "./BuildingCard";
import { GameLoop } from "./GameLoop";
import { PublishButton } from "./PublishButton";
import { EmployeePanel } from "./EmployeePanel";
import { FactoryPanel } from "./FactoryPanel";
import { FinancePanel } from "./FinancePanel";
import { ClientPanel } from "./ClientPanel";
import { EventNotification } from "./EventNotification";
import { PrestigePanel } from "./PrestigePanel";
import { ContractPanel } from "./ContractPanel";
import { SynergyPanel } from "./SynergyPanel";
import { InfoTooltip } from "./InfoTooltip";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useTranslations } from "next-intl";

// Mobile tab types
type MobileTab = "stats" | "buildings" | "actions";

interface DashboardProps {
  initialState: GameState;
}

// Offline earnings modal component
function OfflineEarningsModal({
  earnings,
  seconds,
  onClose,
}: {
  earnings: number;
  seconds: number;
  onClose: () => void;
}) {
  const t = useTranslations("offline");
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  let timeText = "";
  if (hours > 0) {
    timeText = `${hours}${t("hours")} ${minutes}${t("minutes")}`;
  } else if (minutes > 0) {
    timeText = `${minutes} ${t("minutes")}`;
  } else {
    timeText = `${seconds} ${t("seconds")}`;
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl p-6 max-w-sm w-full border border-slate-600 shadow-2xl">
        <div className="text-center">
          <div className="text-5xl mb-4">💰</div>
          <h2 className="text-xl font-bold text-white mb-2">{t("title")}</h2>
          <p className="text-slate-400 mb-4">
            {t("earned", { time: timeText })}
          </p>
          <p className="text-3xl font-bold text-green-400 mb-6">
            +${formatMoney(earnings)}
          </p>
          <p className="text-xs text-slate-500 mb-4">
            {t("note")}
          </p>
          <button
            onClick={onClose}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {t("button")}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Dashboard({ initialState }: DashboardProps) {
  const t = useTranslations("dashboard");
  const tReq = useTranslations("requirements");
  const tTiers = useTranslations("tiers");
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState(1);
  const [offlineEarnings, setOfflineEarnings] = useState<{ earnings: number; seconds: number } | null>(null);
  const [mobileTab, setMobileTab] = useState<MobileTab>("stats");


  const path = useGameStore((state) => state.path);
  const money = useGameStore((state) => state.money);
  const followers = useGameStore((state) => state.followers);
  const reputation = useGameStore((state) => state.reputation);
  const currentTier = useGameStore((state) => state.currentTier);
  const totalEarnings = useGameStore((state) => state.totalEarnings);
  const moneyPerSecond = useGameStore((state) => state.moneyPerSecond);
  const followersPerSecond = useGameStore((state) => state.followersPerSecond);
  const buildings = useGameStore((state) => state.buildings);
  const isLoaded = useGameStore((state) => state.isLoaded);
  const initializeFromServer = useGameStore((state) => state.initializeFromServer);
  const setCurrentTier = useGameStore((state) => state.setCurrentTier);

  // Contract-related stats for tier requirements
  const completedContractsCount = useGameStore((state) => state.completedContractsCount);
  const completedLongTermCount = useGameStore((state) => state.completedLongTermCount);
  const scandalsSurvived = useGameStore((state) => state.scandalsSurvived);

  // Industrial-specific state
  const resources = useGameStore((state) => state.resources);
  const resourcesPerSecond = useGameStore((state) => state.resourcesPerSecond);
  const efficiency = useGameStore((state) => state.efficiency);
  const machineCondition = useGameStore((state) => state.machineCondition);
  const repairMachines = useGameStore((state) => state.repairMachines);

  // Finance-specific state
  const aum = useGameStore((state) => state.aum);
  const aumPerSecond = useGameStore((state) => state.aumPerSecond);
  const creditRating = useGameStore((state) => state.creditRating);
  const leverage = useGameStore((state) => state.leverage);
  const marketPhase = useGameStore((state) => state.marketPhase);
  const hedgingEnabled = useGameStore((state) => state.hedgingEnabled);
  const crashesSurvived = useGameStore((state) => state.crashesSurvived);

  // Initialize store from server-provided state
  // Offline earnings are already calculated in page.tsx's getGameState() call
  useEffect(() => {
    const LAST_PLAYED_KEY = "graidle_last_played";

    // Debug: log what we received from server
    console.log("[Dashboard] initialState from server:", {
      offlineEarnings: initialState.offlineEarnings,
      offlineSeconds: initialState.offlineSeconds,
      money: initialState.money,
    });

    // Update last played time
    localStorage.setItem(LAST_PLAYED_KEY, Date.now().toString());

    // Initialize from server-provided state (already includes offline earnings)
    initializeFromServer(initialState);

    // Show offline earnings modal if there were earnings (now always number, not undefined)
    if (initialState.offlineEarnings > 0) {
      console.log("[Dashboard] Showing offline earnings modal:", initialState.offlineEarnings);
      setOfflineEarnings({
        earnings: initialState.offlineEarnings,
        seconds: initialState.offlineSeconds,
      });
    }

    // Update localStorage timestamp periodically (every 10 seconds)
    const updateInterval = setInterval(() => {
      localStorage.setItem(LAST_PLAYED_KEY, Date.now().toString());
    }, 10000);

    return () => clearInterval(updateInterval);
  }, [initialState, initializeFromServer]);

  // Handle tab visibility - refresh state from server when returning to tab
  // Offline earnings are calculated automatically in getGameState()
  useEffect(() => {
    let lastHiddenTime = 0;

    const handleVisibilityChange = async () => {
      if (document.hidden) {
        lastHiddenTime = Date.now();
      } else if (lastHiddenTime > 0) {
        // Tab became visible - refresh state (includes offline earnings calculation)
        const timeAway = Date.now() - lastHiddenTime;
        if (timeAway > 30000) {
          const freshState = await getGameState();
          if (freshState) {
            initializeFromServer(freshState);
            // Show offline earnings modal if there were earnings
            if (freshState.offlineEarnings && freshState.offlineSeconds) {
              setOfflineEarnings({
                earnings: freshState.offlineEarnings,
                seconds: freshState.offlineSeconds,
              });
            }
          }
        }
        lastHiddenTime = 0;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [initializeFromServer]);

  if (!isLoaded || !path) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
          <p className="text-slate-400">{t("loading")}</p>
        </div>
      </div>
    );
  }

  const pathInfo = PATHS[path];
  const pathTiers = getTiersForPath(path);
  const tierDef = getTierDefinition(currentTier, path);
  const nextTier = getNextTier(currentTier, path);

  // Get buildings by tier for display
  const buildingsByTier: Record<number, typeof pathInfo.buildings> = {};
  for (let t = 1; t <= currentTier; t++) {
    buildingsByTier[t] = getBuildingsByTier(path, t);
  }

  // Calculate next tier progress
  let tierProgress = 100;
  let tierRequirementsDisplay: { key: string; label: string; current: number; required: number; met: boolean }[] = [];
  let buildingRequirements: { type: "any" | "all"; requirements: { id: string; name: string; current: number; required: number; met: boolean }[]; met: boolean } | undefined;

  // Calculate diversification count for Finance path
  const diversificationCount = path === "FINANCE"
    ? Object.entries(buildings).filter(([id, count]) => id.startsWith("f") && count > 0).length
    : 0;

  if (nextTier) {
    const check = checkTierRequirements(nextTier, {
      totalEarnings,
      followers,
      resources,
      reputation,
      efficiency,
      buildings,
      completedContractsCount,
      completedLongTermCount,
      scandalsSurvived,
      // Finance-specific stats
      aum,
      creditRating,
      diversificationCount,
      crashesSurvived,
    }, path);
    tierRequirementsDisplay = Object.entries(check.progress).map(([key, val]) => {
      const labels: Record<string, string> = {
        totalEarnings: tReq("totalEarnings"),
        followers: tReq("followers"),
        resources: tReq("resources"),
        reputation: tReq("reputation"),
        efficiency: tReq("efficiency"),
        completedContracts: tReq("contracts"),
        completedLongTermContracts: tReq("longTermContracts"),
        scandalsSurvived: tReq("scandalsSurvived"),
        aum: tReq("aum"),
        minRating: tReq("minRating"),
        diversification: tReq("diversification"),
        crashesSurvived: tReq("crashesSurvived"),
      };
      return {
        key,
        label: labels[key] || val.label || key,
        current: val.current,
        required: val.required,
        met: val.met,
      };
    });
    buildingRequirements = check.buildingProgress;

    // Calculate overall progress percentage (including building requirements)
    const progressValues = Object.values(check.progress).map(
      (p) => Math.min(100, (p.current / p.required) * 100)
    );

    // Add building progress if exists
    if (check.buildingProgress) {
      if (check.buildingProgress.type === "any") {
        // For "any" type, use the best progress
        const bestProgress = Math.max(
          ...check.buildingProgress.requirements.map((r) =>
            Math.min(100, (r.current / r.required) * 100)
          )
        );
        progressValues.push(bestProgress);
      } else {
        // For "all" type, average all building requirements
        const buildingProgressValues = check.buildingProgress.requirements.map((r) =>
          Math.min(100, (r.current / r.required) * 100)
        );
        progressValues.push(
          buildingProgressValues.reduce((a, b) => a + b, 0) / buildingProgressValues.length
        );
      }
    }

    tierProgress = progressValues.length > 0
      ? progressValues.reduce((a, b) => a + b, 0) / progressValues.length
      : 0;
  }

  const handleUpgradeTier = async () => {
    setUpgradeError(null);
    const result = await upgradeTier();
    if (result.success && result.newTier) {
      setCurrentTier(result.newTier);
    } else {
      setUpgradeError(result.error || "Nie mozna awansowac");
    }
  };

  const canUpgrade = nextTier &&
    tierRequirementsDisplay.every((r) => r.met) &&
    (!buildingRequirements || buildingRequirements.met);

  return (
    <>
      <GameLoop />

      {/* Offline earnings modal */}
      {offlineEarnings && (
        <OfflineEarningsModal
          earnings={offlineEarnings.earnings}
          seconds={offlineEarnings.seconds}
          onClose={() => setOfflineEarnings(null)}
        />
      )}

      {/* Mobile bottom navigation - only visible on mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 z-40 safe-area-pb">
        <div className="flex">
          <button
            onClick={() => setMobileTab("stats")}
            className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${
              mobileTab === "stats" ? "text-white bg-slate-800" : "text-slate-400"
            }`}
          >
            <span className="text-lg">📊</span>
            <span className="text-xs">{t("tabStats")}</span>
          </button>
          <button
            onClick={() => setMobileTab("buildings")}
            className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${
              mobileTab === "buildings" ? "text-white bg-slate-800" : "text-slate-400"
            }`}
          >
            <span className="text-lg">🏗️</span>
            <span className="text-xs">{t("tabBuildings")}</span>
          </button>
          <button
            onClick={() => setMobileTab("actions")}
            className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${
              mobileTab === "actions" ? "text-white bg-slate-800" : "text-slate-400"
            }`}
          >
            <span className="text-lg">⚡</span>
            <span className="text-xs">{t("tabActions")}</span>
          </button>
        </div>
      </div>

      {/* Mobile mini stats bar - always visible on mobile */}
      <div className="md:hidden fixed top-14 left-0 right-0 bg-slate-900/95 backdrop-blur border-b border-slate-700 z-30 px-3 py-2">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-3">
            <span className="text-green-400 font-semibold">${formatMoney(money)}</span>
            <span className="text-slate-500">+${formatMoney(moneyPerSecond)}/s</span>
          </div>
          <div className="flex items-center gap-2">
            {path === "MEDIA" && (
              <span className="text-purple-400">{formatMoney(followers)} {t("followersShort")}</span>
            )}
            {path === "INDUSTRIAL" && (
              <span className={resources < 10 ? "text-red-400" : "text-orange-400"}>{formatMoney(resources)} {t("resourcesShort")}</span>
            )}
            {path === "FINANCE" && (
              <span className="text-cyan-400">${formatMoney(aum)} AUM</span>
            )}
          </div>
        </div>
      </div>

      <div className="p-3 pt-28 md:p-6 md:pt-6 max-w-7xl mx-auto pb-24 md:pb-6">
        {/* STATS TAB CONTENT - visible on mobile stats tab or always on desktop */}
        <div className={`${mobileTab !== "stats" ? "hidden md:block" : ""}`}>

        {/* Header with tier info */}
        <div className="bg-slate-800 rounded-xl p-6 mb-6 border border-slate-700">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <span
                  className="px-3 py-1 rounded-full text-sm font-semibold"
                  style={{ backgroundColor: pathInfo.color + "30", color: pathInfo.color }}
                >
                  TIER {currentTier}
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-white">{tTiers(`${path?.toLowerCase()}.${currentTier}.name`)}</h1>
              </div>
              <p className="text-slate-400 text-sm">{tTiers(`${path?.toLowerCase()}.${currentTier}.desc`)}</p>
            </div>
            {nextTier && (
              <Button
                onClick={handleUpgradeTier}
                disabled={!canUpgrade}
                className={`w-full sm:w-auto px-4 sm:px-6 text-sm sm:text-base whitespace-nowrap ${!canUpgrade ? "bg-slate-700 text-slate-300 border-slate-600" : ""}`}
                style={{ backgroundColor: canUpgrade ? pathInfo.color : undefined }}
                variant={canUpgrade ? "default" : "outline"}
              >
                {canUpgrade ? t("upgradeTier", { tier: nextTier.id }) : `🔒 Tier ${nextTier.id}`}
              </Button>
            )}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
            {/* Money - same for all paths */}
            <div className="bg-slate-900 rounded-lg p-3 md:p-4 relative">
              <InfoTooltip
                title={t("money")}
                content={
                  <>
                    <p className="mb-2">{t("tooltip.money.desc")}</p>
                    <p className="text-cyan-400 font-semibold mb-1">{t("tooltip.sources")}:</p>
                    <ul className="list-disc list-inside text-slate-300 mb-2 space-y-0.5">
                      <li>{t("tooltip.money.buildings")}</li>
                      <li>{t("tooltip.money.contracts")}</li>
                      <li>{t("tooltip.money.events")}</li>
                    </ul>
                    <p className="text-yellow-400 font-semibold mb-1">{t("tooltip.multipliers")}:</p>
                    {path === "MEDIA" && (
                      <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                        <li><span className="text-green-400">{t("tooltip.money.mediaPublish")}</span></li>
                        <li><span className="text-green-400">{t("tooltip.money.mediaSynergy")}</span></li>
                        <li>{t("tooltip.money.mediaMorale")}</li>
                      </ul>
                    )}
                    {path === "INDUSTRIAL" && (
                      <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                        <li>{t("tooltip.money.industrialEff")}</li>
                        <li>{t("tooltip.money.industrialMachine")}</li>
                        <li><span className="text-red-400">{t("tooltip.money.industrialResources")}</span></li>
                      </ul>
                    )}
                    {path === "FINANCE" && (
                      <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                        <li><span className="text-green-400">{t("tooltip.money.financeBull")}</span></li>
                        <li>{t("tooltip.money.financeStable")}</li>
                        <li><span className="text-orange-400">{t("tooltip.money.financeBear")}</span></li>
                        <li><span className="text-red-400">{t("tooltip.money.financeCrash")}</span></li>
                      </ul>
                    )}
                  </>
                }
              />
              <p className="text-slate-400 text-xs uppercase mb-1">{t("money")}</p>
              <p className="text-xl md:text-2xl font-bold text-green-400">${formatMoney(money)}</p>
              <p className="text-xs text-slate-500">+${formatMoney(moneyPerSecond)}/s</p>
            </div>

            {/* Second stat - Followers for Media, Resources for Industrial, AUM for Finance */}
            {path === "MEDIA" ? (
              <div className="bg-slate-900 rounded-lg p-3 md:p-4 relative">
                <InfoTooltip
                  title={t("followers")}
                  content={
                    <>
                      <p className="mb-2">{t("tooltip.followers.desc")}</p>
                      <p className="text-cyan-400 font-semibold mb-1">{t("tooltip.sources")}:</p>
                      <ul className="list-disc list-inside text-slate-300 mb-2 space-y-0.5">
                        <li>{t("tooltip.followers.buildings")}</li>
                        <li><span className="text-green-400">{t("tooltip.followers.viral")}</span></li>
                        <li>{t("tooltip.followers.contracts")}</li>
                        <li>{t("tooltip.followers.events")}</li>
                      </ul>
                      <p className="text-yellow-400 font-semibold mb-1">{t("tooltip.usedFor")}:</p>
                      <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                        <li>{t("tooltip.followers.tiers")}</li>
                        <li>{t("tooltip.followers.sponsors")}</li>
                        <li>{t("tooltip.followers.someContracts")}</li>
                      </ul>
                    </>
                  }
                />
                <p className="text-slate-400 text-xs uppercase mb-1">{t("followers")}</p>
                <p className="text-xl md:text-2xl font-bold text-purple-400">{formatMoney(followers)}</p>
                <p className="text-xs text-slate-500">+{followersPerSecond.toFixed(2)}/s</p>
              </div>
            ) : path === "FINANCE" ? (
              <div className="bg-slate-900 rounded-lg p-3 md:p-4 relative">
                <InfoTooltip
                  title={t("aum")}
                  content={
                    <>
                      <p className="mb-2">{t("tooltip.aum.desc")}</p>
                      <p className="text-cyan-400 font-semibold mb-1">{t("tooltip.sources")}:</p>
                      <ul className="list-disc list-inside text-slate-300 mb-2 space-y-0.5">
                        <li><span className="text-green-400">{t("tooltip.aum.individual")}</span></li>
                        <li><span className="text-green-400">{t("tooltip.aum.corporate")}</span></li>
                        <li><span className="text-green-400">{t("tooltip.aum.pension")}</span></li>
                        <li><span className="text-green-400">{t("tooltip.aum.sovereign")}</span></li>
                      </ul>
                      <p className="text-yellow-400 font-semibold mb-1">{t("tooltip.effects")}:</p>
                      <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                        <li>{t("tooltip.aum.commission")}</li>
                        <li><span className="text-red-400">{t("tooltip.aum.loss")}</span></li>
                      </ul>
                    </>
                  }
                />
                <p className="text-slate-400 text-xs uppercase mb-1">{t("aum")}</p>
                <p className="text-xl md:text-2xl font-bold text-cyan-400">${formatMoney(aum)}</p>
                <p className="text-xs text-slate-500">+${aumPerSecond.toFixed(2)}/s</p>
              </div>
            ) : (
              <div className="bg-slate-900 rounded-lg p-3 md:p-4 relative">
                <InfoTooltip
                  title={t("resources")}
                  content={
                    <>
                      <p className="mb-2">{t("tooltip.resources.desc")}</p>
                      <p className="text-cyan-400 font-semibold mb-1">{t("tooltip.sources")}:</p>
                      <ul className="list-disc list-inside text-slate-300 mb-2 space-y-0.5">
                        <li><span className="text-green-400">{t("tooltip.resources.local")}</span></li>
                        <li><span className="text-green-400">{t("tooltip.resources.wholesale")}</span></li>
                        <li><span className="text-green-400">{t("tooltip.resources.import")}</span></li>
                        <li><span className="text-green-400">{t("tooltip.resources.mine")}</span></li>
                      </ul>
                      <p className="text-yellow-400 font-semibold mb-1">{t("tooltip.effects")}:</p>
                      <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                        <li>{t("tooltip.resources.consumption")}</li>
                        <li><span className="text-red-400">{t("tooltip.resources.noResources")}</span></li>
                      </ul>
                    </>
                  }
                />
                <p className="text-slate-400 text-xs uppercase mb-1">{t("resources")}</p>
                <p className={`text-xl md:text-2xl font-bold ${resources < 10 ? "text-red-400" : "text-orange-400"}`}>
                  {formatMoney(resources)}
                </p>
                <p className={`text-xs ${resourcesPerSecond >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {resourcesPerSecond >= 0 ? "+" : ""}{resourcesPerSecond.toFixed(2)}/s
                </p>
              </div>
            )}

            {/* Third stat - Reputation for Media, Efficiency for Industrial, Credit Rating for Finance */}
            {path === "MEDIA" ? (
              <div className="bg-slate-900 rounded-lg p-3 md:p-4 relative">
                <InfoTooltip
                  title={t("reputation")}
                  content={
                    <>
                      <p className="mb-2">{t("tooltip.reputation.desc")}</p>
                      <p className="text-green-400 font-semibold mb-1">{t("tooltip.increases")}:</p>
                      <ul className="list-disc list-inside text-slate-300 mb-2 space-y-0.5">
                        <li><span className="text-green-400">{t("tooltip.reputation.publish")}</span></li>
                        <li><span className="text-green-400">{t("tooltip.reputation.milestones")}</span></li>
                        <li><span className="text-green-400">{t("tooltip.reputation.contracts")}</span></li>
                        <li>{t("tooltip.reputation.positiveEvents")}</li>
                      </ul>
                      <p className="text-red-400 font-semibold mb-1">{t("tooltip.decreases")}:</p>
                      <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                        <li><span className="text-red-400">{t("tooltip.reputation.inactivity")}</span></li>
                        <li><span className="text-red-400">{t("tooltip.reputation.scandals")}</span></li>
                        <li>{t("tooltip.reputation.negativeEvents")}</li>
                      </ul>
                    </>
                  }
                />
                <p className="text-slate-400 text-xs uppercase mb-1">{t("reputation")}</p>
                <p className="text-xl md:text-2xl font-bold text-yellow-400">{reputation}/100</p>
              </div>
            ) : path === "FINANCE" ? (
              <div className="bg-slate-900 rounded-lg p-3 md:p-4 relative">
                <InfoTooltip
                  title={t("creditRating")}
                  content={
                    <>
                      <p className="mb-2">{t("tooltip.creditRating.desc")}</p>
                      <p className="text-green-400 font-semibold mb-1">{t("tooltip.increases")}:</p>
                      <ul className="list-disc list-inside text-slate-300 mb-2 space-y-0.5">
                        <li><span className="text-green-400">{t("tooltip.creditRating.stableProfit")}</span></li>
                        <li><span className="text-green-400">{t("tooltip.creditRating.diversification")}</span></li>
                        <li><span className="text-green-400">{t("tooltip.creditRating.lowLeverage")}</span></li>
                        <li><span className="text-green-400">{t("tooltip.creditRating.contracts")}</span></li>
                      </ul>
                      <p className="text-red-400 font-semibold mb-1">{t("tooltip.decreases")}:</p>
                      <ul className="list-disc list-inside text-slate-300 mb-2 space-y-0.5">
                        <li><span className="text-red-400">{t("tooltip.creditRating.losses")}</span></li>
                        <li><span className="text-red-400">{t("tooltip.creditRating.highLeverage")}</span></li>
                        <li><span className="text-red-400">{t("tooltip.creditRating.failedContracts")}</span></li>
                        <li><span className="text-red-400">{t("tooltip.creditRating.crisis")}</span></li>
                      </ul>
                      <p className="text-yellow-400 font-semibold mb-1">{t("tooltip.effects")}:</p>
                      <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                        <li><span className="text-green-400">{t("tooltip.creditRating.aaaBonus")}</span></li>
                        <li><span className="text-red-400">{t("tooltip.creditRating.dPenalty")}</span></li>
                      </ul>
                    </>
                  }
                />
                <p className="text-slate-400 text-xs uppercase mb-1">{t("creditRating")}</p>
                <p className={`text-xl md:text-2xl font-bold ${
                  ["AAA", "AA", "A"].includes(creditRating) ? "text-green-400" :
                  ["BBB", "BB"].includes(creditRating) ? "text-yellow-400" : "text-red-400"
                }`}>
                  {creditRating}
                </p>
              </div>
            ) : (
              <div className="bg-slate-900 rounded-lg p-3 md:p-4 relative">
                <InfoTooltip
                  title={t("efficiency")}
                  content={
                    <>
                      <p className="mb-2">{t("tooltip.efficiency.desc")}</p>
                      <p className="text-green-400 font-semibold mb-1">{t("tooltip.increases")}:</p>
                      <ul className="list-disc list-inside text-slate-300 mb-2 space-y-0.5">
                        <li><span className="text-green-400">{t("tooltip.efficiency.modernMachines")}</span></li>
                        <li><span className="text-green-400">{t("tooltip.efficiency.trainedWorkers")}</span></li>
                        <li><span className="text-green-400">{t("tooltip.efficiency.automation")}</span></li>
                        <li><span className="text-green-400">{t("tooltip.efficiency.quality")}</span></li>
                      </ul>
                      <p className="text-red-400 font-semibold mb-1">{t("tooltip.decreases")}:</p>
                      <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                        <li><span className="text-red-400">{t("tooltip.efficiency.oldMachines")}</span></li>
                        <li><span className="text-red-400">{t("tooltip.efficiency.breakdowns")}</span></li>
                        <li><span className="text-red-400">{t("tooltip.efficiency.strikes")}</span></li>
                      </ul>
                    </>
                  }
                />
                <p className="text-slate-400 text-xs uppercase mb-1">{t("efficiency")}</p>
                <p className={`text-xl md:text-2xl font-bold ${
                  efficiency >= 100 ? "text-green-400" : efficiency >= 70 ? "text-yellow-400" : "text-red-400"
                }`}>
                  {efficiency.toFixed(0)}%
                </p>
              </div>
            )}

            {/* Fourth stat - Total earnings for Media, Machine condition for Industrial, Market Phase for Finance */}
            {path === "MEDIA" ? (
              <div className="bg-slate-900 rounded-lg p-3 md:p-4 relative">
                <InfoTooltip
                  title={t("totalEarnings")}
                  content={
                    <>
                      <p className="mb-2">{t("tooltip.totalEarnings.desc")}</p>
                      <p className="text-yellow-400 font-semibold mb-1">{t("tooltip.usedFor")}:</p>
                      <ul className="list-disc list-inside text-slate-300 mb-2 space-y-0.5">
                        <li>{t("tooltip.totalEarnings.tiers")}</li>
                        <li><span className="text-cyan-400">{t("tooltip.totalEarnings.prestige")}</span></li>
                        <li>{t("tooltip.totalEarnings.points")}</li>
                      </ul>
                      <p className="text-green-400 text-sm mt-2">{t("tooltip.totalEarnings.note")}</p>
                    </>
                  }
                />
                <p className="text-slate-400 text-xs uppercase mb-1">{t("totalEarnings")}</p>
                <p className="text-xl md:text-2xl font-bold text-blue-400">${formatMoney(totalEarnings)}</p>
              </div>
            ) : path === "FINANCE" ? (
              <div className="bg-slate-900 rounded-lg p-3 md:p-4 relative">
                <InfoTooltip
                  title={t("market")}
                  content={
                    <>
                      <p className="mb-2">{t("tooltip.market.desc")}</p>
                      <p className="text-yellow-400 font-semibold mb-1">{t("tooltip.phases")}:</p>
                      <ul className="list-disc list-inside text-slate-300 mb-2 space-y-0.5">
                        <li><span className="text-green-400">{t("tooltip.market.bull")}</span></li>
                        <li>{t("tooltip.market.stable")}</li>
                        <li><span className="text-yellow-400">{t("tooltip.market.correction")}</span></li>
                        <li><span className="text-orange-400">{t("tooltip.market.bear")}</span></li>
                        <li><span className="text-red-400">{t("tooltip.market.crash")}</span></li>
                      </ul>
                      <p className="text-slate-400 text-sm">{t("tooltip.market.cycle")}</p>
                    </>
                  }
                />
                <p className="text-slate-400 text-xs uppercase mb-1">{t("market")}</p>
                <p className={`text-xl md:text-2xl font-bold ${
                  marketPhase === "bull" ? "text-green-400" :
                  marketPhase === "stable" ? "text-slate-300" :
                  marketPhase === "correction" ? "text-yellow-400" :
                  marketPhase === "bear" ? "text-orange-400" : "text-red-400"
                }`}>
                  {marketPhase === "bull" ? "BULL" :
                   marketPhase === "stable" ? "STABLE" :
                   marketPhase === "correction" ? "CORRECTION" :
                   marketPhase === "bear" ? "BEAR" : "CRASH"}
                </p>
              </div>
            ) : (
              <div className="bg-slate-900 rounded-lg p-3 md:p-4 relative">
                <InfoTooltip
                  title={t("machineCondition")}
                  content={
                    <>
                      <p className="mb-2">{t("tooltip.machineCondition.desc")}</p>
                      <p className="text-yellow-400 font-semibold mb-1">{t("tooltip.impact")}:</p>
                      <ul className="list-disc list-inside text-slate-300 mb-2 space-y-0.5">
                        <li><span className="text-green-400">{t("tooltip.machineCondition.full")}</span></li>
                        <li><span className="text-yellow-400">{t("tooltip.machineCondition.reduced10")}</span></li>
                        <li><span className="text-orange-400">{t("tooltip.machineCondition.reduced25")}</span></li>
                        <li><span className="text-red-400">{t("tooltip.machineCondition.reduced50")}</span></li>
                      </ul>
                      <p className="text-cyan-400 font-semibold mb-1">{t("tooltip.repair")}:</p>
                      <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                        <li>{t("tooltip.machineCondition.manualRepair")}</li>
                        <li><span className="text-green-400">{t("tooltip.machineCondition.autoRepair")}</span></li>
                      </ul>
                    </>
                  }
                />
                <p className="text-slate-400 text-xs uppercase mb-1">{t("machineCondition")}</p>
                <p className={`text-xl md:text-2xl font-bold ${
                  machineCondition >= 80 ? "text-green-400" : machineCondition >= 50 ? "text-yellow-400" : "text-red-400"
                }`}>
                  {machineCondition.toFixed(0)}%
                </p>
                <Progress
                  value={machineCondition}
                  className="h-1 mt-1"
                />
              </div>
            )}
          </div>

          {/* Additional stats row for Industrial - Total earnings */}
          {path === "INDUSTRIAL" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
              <div className="bg-slate-900 rounded-lg p-3 md:p-4 relative">
                <InfoTooltip
                  title={t("totalEarnings")}
                  content={
                    <>
                      <p className="mb-2">{t("tooltip.totalEarnings.desc")}</p>
                      <p className="text-yellow-400 font-semibold mb-1">{t("tooltip.usedFor")}:</p>
                      <ul className="list-disc list-inside text-slate-300 mb-2 space-y-0.5">
                        <li>{t("tooltip.totalEarnings.tiers")}</li>
                        <li><span className="text-cyan-400">{t("tooltip.totalEarnings.prestige")}</span></li>
                        <li>{t("tooltip.totalEarnings.points")}</li>
                      </ul>
                      <p className="text-green-400 text-sm mt-2">{t("tooltip.totalEarnings.note")}</p>
                    </>
                  }
                />
                <p className="text-slate-400 text-xs uppercase mb-1">{t("totalEarnings")}</p>
                <p className="text-xl md:text-2xl font-bold text-blue-400">${formatMoney(totalEarnings)}</p>
              </div>
            </div>
          )}

          {/* Additional stats row for Finance - Total earnings, Leverage, Hedging, Crashes survived */}
          {path === "FINANCE" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
              <div className="bg-slate-900 rounded-lg p-3 md:p-4 relative">
                <InfoTooltip
                  title={t("totalEarnings")}
                  content={
                    <>
                      <p className="mb-2">{t("tooltip.totalEarnings.desc")}</p>
                      <p className="text-yellow-400 font-semibold mb-1">{t("tooltip.usedFor")}:</p>
                      <ul className="list-disc list-inside text-slate-300 mb-2 space-y-0.5">
                        <li>{t("tooltip.totalEarnings.tiers")}</li>
                        <li><span className="text-cyan-400">{t("tooltip.totalEarnings.prestige")}</span></li>
                        <li>{t("tooltip.totalEarnings.points")}</li>
                      </ul>
                      <p className="text-green-400 text-sm mt-2">{t("tooltip.totalEarnings.note")}</p>
                    </>
                  }
                />
                <p className="text-slate-400 text-xs uppercase mb-1">{t("totalEarnings")}</p>
                <p className="text-xl md:text-2xl font-bold text-blue-400">${formatMoney(totalEarnings)}</p>
              </div>
              <div className="bg-slate-900 rounded-lg p-3 md:p-4 relative">
                <InfoTooltip
                  title={t("leverage")}
                  content={
                    <>
                      <p className="mb-2">{t("tooltip.leverage.desc")}</p>
                      <p className="text-yellow-400 font-semibold mb-1">{t("tooltip.levels")}:</p>
                      <ul className="list-disc list-inside text-slate-300 mb-2 space-y-0.5">
                        <li>{t("tooltip.leverage.level1")}</li>
                        <li><span className="text-yellow-400">{t("tooltip.leverage.level2")}</span></li>
                        <li><span className="text-yellow-400">{t("tooltip.leverage.level5")}</span></li>
                        <li><span className="text-orange-400">{t("tooltip.leverage.level10")}</span></li>
                        <li><span className="text-red-400">{t("tooltip.leverage.level20")}</span></li>
                      </ul>
                      <p className="text-red-400 font-semibold mb-1">{t("tooltip.marginCall")}:</p>
                      <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                        <li>{t("tooltip.leverage.margin1")}</li>
                        <li><span className="text-yellow-400">{t("tooltip.leverage.margin2")}</span></li>
                        <li><span className="text-orange-400">{t("tooltip.leverage.margin5")}</span></li>
                        <li><span className="text-red-400">{t("tooltip.leverage.margin10")}</span></li>
                        <li><span className="text-red-400">{t("tooltip.leverage.margin20")}</span></li>
                      </ul>
                    </>
                  }
                />
                <p className="text-slate-400 text-xs uppercase mb-1">{t("leverage")}</p>
                <p className={`text-xl md:text-2xl font-bold ${
                  leverage === 1 ? "text-slate-300" :
                  leverage <= 5 ? "text-yellow-400" : "text-red-400"
                }`}>
                  {leverage}x
                </p>
              </div>
              <div className="bg-slate-900 rounded-lg p-3 md:p-4 relative">
                <InfoTooltip
                  title="Hedging"
                  content={
                    <>
                      <p className="mb-2">{t("tooltip.hedging.desc")}</p>
                      <p className="text-yellow-400 font-semibold mb-1">{t("tooltip.effects")}:</p>
                      <ul className="list-disc list-inside text-slate-300 mb-2 space-y-0.5">
                        <li><span className="text-orange-400">{t("tooltip.hedging.reduceBull")}</span></li>
                        <li><span className="text-green-400">{t("tooltip.hedging.reduceBear")}</span></li>
                      </ul>
                      <p className="text-cyan-400 text-sm">{t("tooltip.hedging.available")}</p>
                    </>
                  }
                />
                <p className="text-slate-400 text-xs uppercase mb-1">Hedging</p>
                <p className={`text-xl md:text-2xl font-bold ${hedgingEnabled ? "text-green-400" : "text-slate-500"}`}>
                  {hedgingEnabled ? t("hedgingActive") : t("hedgingOff")}
                </p>
              </div>
              <div className="bg-slate-900 rounded-lg p-3 md:p-4 relative">
                <InfoTooltip
                  title={t("crashesSurvived")}
                  content={
                    <>
                      <p className="mb-2">{t("tooltip.crashesSurvived.desc")}</p>
                      <p className="text-yellow-400 font-semibold mb-1">{t("tooltip.requirements")}:</p>
                      <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                        <li><span className="text-cyan-400">{t("tooltip.crashesSurvived.tier5")}</span></li>
                        <li><span className="text-purple-400">{t("tooltip.crashesSurvived.prestige")}</span></li>
                      </ul>
                    </>
                  }
                />
                <p className="text-slate-400 text-xs uppercase mb-1">{t("crashesSurvived")}</p>
                <p className="text-xl md:text-2xl font-bold text-purple-400">{crashesSurvived}</p>
              </div>
            </div>
          )}

          {/* Repair button for Industrial path (Tier 1-2 only, before maintenance building) */}
          {path === "INDUSTRIAL" && currentTier <= 2 && (
            <div className="mb-4">
              <div className="bg-slate-900 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{t("machineMaintenance")}</p>
                    <p className="text-slate-400 text-sm">
                      {t("condition")}: <span className={machineCondition >= 80 ? "text-green-400" : machineCondition >= 50 ? "text-yellow-400" : "text-red-400"}>
                        {machineCondition.toFixed(0)}%
                      </span>
                      {machineCondition < 80 && ` - ${t("productionReduced")}`}
                    </p>
                  </div>
                  <Button
                    onClick={repairMachines}
                    disabled={machineCondition >= 100 || money < currentTier * 100}
                    style={{ backgroundColor: machineCondition < 100 && money >= currentTier * 100 ? pathInfo.color : undefined }}
                    variant={machineCondition < 100 && money >= currentTier * 100 ? "default" : "outline"}
                    className={machineCondition >= 100 || money < currentTier * 100 ? "text-slate-400" : ""}
                  >
                    {t("repair")} - ${currentTier * 100}
                  </Button>
                </div>
                <Progress value={machineCondition} className="h-2 mt-3" />
              </div>
            </div>
          )}

          {/* Publish button for Media path (Tier 1-2 only) */}
          {path === "MEDIA" && currentTier <= 2 && (
            <div className="mb-4">
              <PublishButton pathColor={pathInfo.color} />
            </div>
          )}

          {/* Next tier progress - moved up for Stats tab */}
          {nextTier && (
            <div className="bg-slate-900 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-slate-400">
                  {t("progressTo")} <span className="text-white font-semibold">Tier {nextTier.id}: {tTiers(`${path?.toLowerCase()}.${nextTier.id}.name`)}</span>
                </p>
                <p className="text-sm text-slate-500">{Math.round(tierProgress)}%</p>
              </div>
              <Progress value={tierProgress} className="h-2 mb-3" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                {tierRequirementsDisplay.map((req) => {
                  const formatValue = (value: number, key: string) => {
                    if (key === "minRating") {
                      return getCreditRatingFromValue(value);
                    }
                    return formatMoney(value);
                  };

                  return (
                    <div
                      key={req.key}
                      className={`flex justify-between px-2 py-1 rounded ${
                        req.met ? "bg-green-900/30 text-green-400" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      <span>{req.label}:</span>
                      <span>
                        {formatValue(req.current, req.key)} / {formatValue(req.required, req.key)}
                        {req.met && " ✓"}
                      </span>
                    </div>
                  );
                })}
              </div>
              {buildingRequirements && (
                <div className="mt-3 pt-3 border-t border-slate-700">
                  <p className="text-xs text-slate-500 mb-2">
                    {buildingRequirements.type === "any"
                      ? t("buildingRequiredOne")
                      : t("buildingRequiredAll")}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    {buildingRequirements.requirements.map((req) => (
                      <div
                        key={req.id}
                        className={`flex justify-between px-2 py-1 rounded ${
                          req.met ? "bg-green-900/30 text-green-400" : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        <span>{req.name}:</span>
                        <span>
                          {req.current} / {req.required}
                          {req.met && " ✓"}
                        </span>
                      </div>
                    ))}
                  </div>
                  {buildingRequirements.met && (
                    <p className="text-green-400 text-xs mt-1">
                      {buildingRequirements.type === "any" ? t("requirementMet") : t("allRequirementsMet")}
                    </p>
                  )}
                </div>
              )}
              {upgradeError && <p className="text-red-400 text-sm mt-2">{upgradeError}</p>}
            </div>
          )}
        </div>
        </div>
        {/* END STATS TAB CONTENT */}

        {/* ACTIONS TAB CONTENT - visible on mobile actions tab or always on desktop */}
        <div className={`${mobileTab !== "actions" ? "hidden md:block" : ""}`}>
        <div className="bg-slate-800 rounded-xl p-6 mb-6 border border-slate-700">

          {/* No actions available message for Tier 1 (except Industrial which has contracts) */}
          {((path === "MEDIA" && currentTier < 2) || (path === "FINANCE" && currentTier < 2)) && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-300 mb-2">{t("noActions.title")}</h3>
              <p className="text-sm text-slate-500 max-w-xs">{t("noActions.description")}</p>
            </div>
          )}

          {/* Synergy panel for Media path (Tier 2+) */}
          {path === "MEDIA" && currentTier >= 2 && (
            <SynergyPanel pathColor={pathInfo.color} />
          )}

          {/* Employee panel for Media path (Tier 3+) */}
          {path === "MEDIA" && currentTier >= 3 && (
            <EmployeePanel pathColor={pathInfo.color} />
          )}

          {/* Active events */}
          <EventNotification pathColor={pathInfo.color} />

          {/* Contract panel for Media path (Tier 2+) */}
          {path === "MEDIA" && currentTier >= 2 && (
            <ContractPanel pathColor={pathInfo.color} />
          )}

          {/* Contract panel for Industrial path (all tiers) */}
          {path === "INDUSTRIAL" && (
            <ContractPanel pathColor={pathInfo.color} />
          )}

          {/* Factory panel for Industrial path (Tier 2+) */}
          {path === "INDUSTRIAL" && currentTier >= 2 && (
            <FactoryPanel pathColor={pathInfo.color} />
          )}

          {/* Finance panel for Finance path (Tier 2+) */}
          {path === "FINANCE" && currentTier >= 2 && (
            <FinancePanel pathColor={pathInfo.color} />
          )}

          {/* Client panel for Finance path (Tier 2+) */}
          {path === "FINANCE" && currentTier >= 2 && (
            <ClientPanel pathColor={pathInfo.color} />
          )}

          {/* Prestige panel for Media path (Tier 4+) */}
          {path === "MEDIA" && currentTier >= 4 && (
            <PrestigePanel pathColor={pathInfo.color} />
          )}

          {/* Prestige panel for Industrial path (Tier 4+) */}
          {path === "INDUSTRIAL" && currentTier >= 4 && (
            <PrestigePanel pathColor={pathInfo.color} />
          )}

          {/* Prestige panel for Finance path (Tier 4+) */}
          {path === "FINANCE" && currentTier >= 4 && (
            <PrestigePanel pathColor={pathInfo.color} />
          )}
        </div>
        </div>
        {/* END ACTIONS TAB CONTENT */}

        {/* BUILDINGS TAB CONTENT - visible on mobile buildings tab or always on desktop */}
        <div className={`${mobileTab !== "buildings" ? "hidden md:block" : ""}`}>

        {/* Tier tabs */}
        <div className="mb-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {pathTiers.map((tier) => {
              const isUnlocked = tier.id <= currentTier;
              const isSelected = selectedTier === tier.id;
              const tierBuildings = buildingsByTier[tier.id] || [];
              const buildingCount = tierBuildings.reduce((sum, b) => sum + (buildings[b.id] || 0), 0);

              return (
                <button
                  key={tier.id}
                  onClick={() => isUnlocked && setSelectedTier(tier.id)}
                  disabled={!isUnlocked}
                  className={`
                    flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${isSelected
                      ? "text-white"
                      : isUnlocked
                        ? "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                        : "bg-slate-900 text-slate-600 cursor-not-allowed"
                    }
                  `}
                  style={{
                    backgroundColor: isSelected ? pathInfo.color : undefined,
                  }}
                >
                  <span className="flex items-center gap-2">
                    {!isUnlocked && <span>🔒</span>}
                    <span>T{tier.id}</span>
                    <span className="hidden sm:inline">- {tTiers(`${path?.toLowerCase()}.${tier.id}.name`)}</span>
                    {isUnlocked && buildingCount > 0 && (
                      <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">
                        {buildingCount}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Buildings for selected tier */}
        {buildingsByTier[selectedTier] && (
          <div className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {buildingsByTier[selectedTier].map((building) => (
                <BuildingCard
                  key={building.id}
                  building={building}
                  pathColor={pathInfo.color}
                  maxCount={getTierDefinition(selectedTier, path)?.maxBuildingCount || 10}
                />
              ))}
            </div>
          </div>
        )}

        {/* Show message for locked tier */}
        {selectedTier > currentTier && (
          <div className="bg-slate-800/50 rounded-lg p-8 text-center border border-slate-700">
            <span className="text-4xl mb-4 block">🔒</span>
            <h3 className="text-xl font-semibold text-slate-400 mb-2">
              Tier {selectedTier}: {tTiers(`${path?.toLowerCase()}.${selectedTier}.name`)}
            </h3>
            <p className="text-slate-500">
              {t("unlockTierAccess", { tier: selectedTier })}
            </p>
          </div>
        )}
        </div>
        {/* END BUILDINGS TAB CONTENT */}

      </div>
    </>
  );
}
