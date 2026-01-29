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
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  let timeText = "";
  if (hours > 0) {
    timeText = `${hours}h ${minutes}min`;
  } else if (minutes > 0) {
    timeText = `${minutes} min`;
  } else {
    timeText = `${seconds} sec`;
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl p-6 max-w-sm w-full border border-slate-600 shadow-2xl">
        <div className="text-center">
          <div className="text-5xl mb-4">💰</div>
          <h2 className="text-xl font-bold text-white mb-2">Welcome back!</h2>
          <p className="text-slate-400 mb-4">
            While you were away ({timeText}) you earned:
          </p>
          <p className="text-3xl font-bold text-green-400 mb-6">
            +${formatMoney(earnings)}
          </p>
          <p className="text-xs text-slate-500 mb-4">
            (20% of normal production, max 8h)
          </p>
          <button
            onClick={onClose}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Awesome!
          </button>
        </div>
      </div>
    </div>
  );
}

export function Dashboard({ initialState }: DashboardProps) {
  const t = useTranslations("dashboard");
  const tReq = useTranslations("requirements");
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
          <p className="text-slate-400">Ladowanie gry...</p>
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
            <span className="text-xs">Stats</span>
          </button>
          <button
            onClick={() => setMobileTab("buildings")}
            className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${
              mobileTab === "buildings" ? "text-white bg-slate-800" : "text-slate-400"
            }`}
          >
            <span className="text-lg">🏗️</span>
            <span className="text-xs">Buildings</span>
          </button>
          <button
            onClick={() => setMobileTab("actions")}
            className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${
              mobileTab === "actions" ? "text-white bg-slate-800" : "text-slate-400"
            }`}
          >
            <span className="text-lg">⚡</span>
            <span className="text-xs">Actions</span>
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
              <span className="text-purple-400">{formatMoney(followers)} foll.</span>
            )}
            {path === "INDUSTRIAL" && (
              <span className={resources < 10 ? "text-red-400" : "text-orange-400"}>{formatMoney(resources)} sur.</span>
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
                <h1 className="text-xl sm:text-2xl font-bold text-white">{tierDef?.name}</h1>
              </div>
              <p className="text-slate-400 text-sm">{tierDef?.description}</p>
            </div>
            {nextTier && (
              <Button
                onClick={handleUpgradeTier}
                disabled={!canUpgrade}
                className={`w-full sm:w-auto px-4 sm:px-6 text-sm sm:text-base whitespace-nowrap ${!canUpgrade ? "bg-slate-700 text-slate-300 border-slate-600" : ""}`}
                style={{ backgroundColor: canUpgrade ? pathInfo.color : undefined }}
                variant={canUpgrade ? "default" : "outline"}
              >
                {canUpgrade ? `Upgrade to Tier ${nextTier.id}` : `🔒 Tier ${nextTier.id}`}
              </Button>
            )}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
            {/* Money - same for all paths */}
            <div className="bg-slate-900 rounded-lg p-3 md:p-4 relative">
              <InfoTooltip
                title="Money"
                content={
                  <>
                    <p>Your current cash.</p>
                    <p className="mt-2 text-slate-400">What affects earnings:</p>
                    <ul className="list-disc list-inside text-slate-400 mt-1">
                      <li>Buildings - each generates $/s</li>
                      {path === "MEDIA" && <li>Publishing - +10% for 30s</li>}
                      {path === "MEDIA" && currentTier >= 2 && <li>Asset synergies</li>}
                      {path === "MEDIA" && currentTier >= 3 && <li>Team morale (50-120%)</li>}
                      {path === "MEDIA" && currentTier >= 3 && <li>Fixed costs (salaries -20%)</li>}
                      {path === "MEDIA" && currentTier >= 4 && <li>Diversification (+5%/type)</li>}
                      {path === "INDUSTRIAL" && <li>Efficiency (0-150%)</li>}
                      {path === "INDUSTRIAL" && <li>Machine condition</li>}
                      {path === "INDUSTRIAL" && <li>Resource availability</li>}
                      <li>Events (positive/negative)</li>
                    </ul>
                  </>
                }
              />
              <p className="text-slate-400 text-xs uppercase mb-1">Money</p>
              <p className="text-xl md:text-2xl font-bold text-green-400">${formatMoney(money)}</p>
              <p className="text-xs text-slate-500">+${formatMoney(moneyPerSecond)}/s</p>
            </div>

            {/* Second stat - Followers for Media, Resources for Industrial, AUM for Finance */}
            {path === "MEDIA" ? (
              <div className="bg-slate-900 rounded-lg p-3 md:p-4 relative">
                <InfoTooltip
                  title="Followers"
                  content={
                    <>
                      <p>Your followers/fans.</p>
                      <p className="mt-2 text-slate-400">Follower sources:</p>
                      <ul className="list-disc list-inside text-slate-400 mt-1">
                        <li>Buildings - some give followers/s</li>
                        <li>Viral post (+1000)</li>
                        <li>Contracts (rewards)</li>
                        <li>Events (positive/negative)</li>
                      </ul>
                      <p className="mt-2 text-slate-400">What they are needed for:</p>
                      <ul className="list-disc list-inside text-slate-400 mt-1">
                        <li>Unlocking tiers</li>
                        <li>Better sponsorship offers</li>
                        <li>Some contracts</li>
                      </ul>
                    </>
                  }
                />
                <p className="text-slate-400 text-xs uppercase mb-1">Followers</p>
                <p className="text-xl md:text-2xl font-bold text-purple-400">{formatMoney(followers)}</p>
                <p className="text-xs text-slate-500">+{followersPerSecond.toFixed(2)}/s</p>
              </div>
            ) : path === "FINANCE" ? (
              <div className="bg-slate-900 rounded-lg p-3 md:p-4 relative">
                <InfoTooltip
                  title="AUM (Assets Under Management)"
                  content={
                    <>
                      <p>Capital under management - client money.</p>
                      <p className="mt-2 text-slate-400">AUM sources:</p>
                      <ul className="list-disc list-inside text-slate-400 mt-1">
                        <li>Individual clients (+$500/client)</li>
                        <li>Corporate clients (+$5,000/company)</li>
                        <li>Pension funds (+$50,000/fund)</li>
                        <li>Sovereign wealth (+$500,000/contract)</li>
                      </ul>
                      <p className="mt-2 text-slate-400">Impact:</p>
                      <ul className="list-disc list-inside text-slate-400 mt-1">
                        <li>Higher AUM = higher commission</li>
                        <li>Client AUM loss = rating drop</li>
                      </ul>
                    </>
                  }
                />
                <p className="text-slate-400 text-xs uppercase mb-1">AUM</p>
                <p className="text-xl md:text-2xl font-bold text-cyan-400">${formatMoney(aum)}</p>
                <p className="text-xs text-slate-500">+${aumPerSecond.toFixed(2)}/s</p>
              </div>
            ) : (
              <div className="bg-slate-900 rounded-lg p-3 md:p-4 relative">
                <InfoTooltip
                  title="Resources"
                  content={
                    <>
                      <p>Resources needed for production.</p>
                      <p className="mt-2 text-slate-400">Resource sources:</p>
                      <ul className="list-disc list-inside text-slate-400 mt-1">
                        <li>Local suppliers (+0.5/s)</li>
                        <li>Wholesalers (+2.0/s)</li>
                        <li>Import (+5.0/s)</li>
                        <li>Own mine (+20/s)</li>
                      </ul>
                      <p className="mt-2 text-slate-400">Consumption:</p>
                      <ul className="list-disc list-inside text-slate-400 mt-1">
                        <li>Production buildings use resources</li>
                        <li>No resources = production drop</li>
                      </ul>
                    </>
                  }
                />
                <p className="text-slate-400 text-xs uppercase mb-1">Resources</p>
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
                  title="Reputation"
                  content={
                    <>
                      <p>Your industry reputation (0-100).</p>
                      <p className="mt-2 text-green-400">What increases it:</p>
                      <ul className="list-disc list-inside text-slate-400 mt-1">
                        <li>Publishing (+1, 1 min cooldown)</li>
                        <li>Follower milestones (+10)</li>
                        <li>Completed contracts (+2 to +25)</li>
                        <li>Positive events</li>
                      </ul>
                      <p className="mt-2 text-red-400">What decreases it:</p>
                      <ul className="list-disc list-inside text-slate-400 mt-1">
                        <li>Inactivity (-2)</li>
                        <li>Scandals (-15 to -30)</li>
                        <li>Negative events</li>
                      </ul>
                    </>
                  }
                />
                <p className="text-slate-400 text-xs uppercase mb-1">Reputation</p>
                <p className="text-xl md:text-2xl font-bold text-yellow-400">{reputation}/100</p>
              </div>
            ) : path === "FINANCE" ? (
              <div className="bg-slate-900 rounded-lg p-3 md:p-4 relative">
                <InfoTooltip
                  title="Credit Rating"
                  content={
                    <>
                      <p>Your financial credibility (D to AAA).</p>
                      <p className="mt-2 text-green-400">What increases it:</p>
                      <ul className="list-disc list-inside text-slate-400 mt-1">
                        <li>Stable profits (+1/5 min)</li>
                        <li>Portfolio diversification (+1)</li>
                        <li>Low leverage (+1)</li>
                        <li>Completed contracts (+1)</li>
                      </ul>
                      <p className="mt-2 text-red-400">What decreases it:</p>
                      <ul className="list-disc list-inside text-slate-400 mt-1">
                        <li>Losses (-1 per -10% capital)</li>
                        <li>High leverage (-1)</li>
                        <li>Uncompleted contracts (-2)</li>
                        <li>Financial crisis (-1-3)</li>
                      </ul>
                      <p className="mt-2 text-slate-400">Rating impact:</p>
                      <ul className="list-disc list-inside text-slate-400 mt-1">
                        <li>AAA: 150% clients, 2% loans</li>
                        <li>BBB: 100% clients, 8% loans</li>
                        <li>D: Bankruptcy</li>
                      </ul>
                    </>
                  }
                />
                <p className="text-slate-400 text-xs uppercase mb-1">Rating</p>
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
                  title="Efficiency"
                  content={
                    <>
                      <p>Production efficiency (0-150%).</p>
                      <p className="mt-2 text-green-400">What increases it:</p>
                      <ul className="list-disc list-inside text-slate-400 mt-1">
                        <li>Modern machines (+5-20%)</li>
                        <li>Trained workers (+10%)</li>
                        <li>Automation (+15-30%)</li>
                        <li>Quality certificates (+5%)</li>
                      </ul>
                      <p className="mt-2 text-red-400">What decreases it:</p>
                      <ul className="list-disc list-inside text-slate-400 mt-1">
                        <li>Old/worn machines (-10-30%)</li>
                        <li>Breakdowns (-20% temporarily)</li>
                        <li>Worker strikes (-50%)</li>
                      </ul>
                    </>
                  }
                />
                <p className="text-slate-400 text-xs uppercase mb-1">Efficiency</p>
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
                  title="Total Earnings"
                  content={
                    <>
                      <p>Sum of all money earned.</p>
                      <p className="mt-2 text-slate-400">What it's needed for:</p>
                      <ul className="list-disc list-inside text-slate-400 mt-1">
                        <li>Unlocking next tiers</li>
                        <li>Prestige requirement ($10M)</li>
                        <li>Calculating prestige points</li>
                      </ul>
                      <p className="mt-2 text-slate-500 text-xs">
                        This value never decreases, even when you spend money.
                      </p>
                    </>
                  }
                />
                <p className="text-slate-400 text-xs uppercase mb-1">Total Earnings</p>
                <p className="text-xl md:text-2xl font-bold text-blue-400">${formatMoney(totalEarnings)}</p>
              </div>
            ) : path === "FINANCE" ? (
              <div className="bg-slate-900 rounded-lg p-3 md:p-4 relative">
                <InfoTooltip
                  title="Market Phase"
                  content={
                    <>
                      <p>Current market cycle affecting profits.</p>
                      <p className="mt-2 text-slate-400">Phases:</p>
                      <ul className="list-disc list-inside text-slate-400 mt-1">
                        <li><span className="text-green-400">Bull:</span> +35% profits</li>
                        <li><span className="text-slate-300">Stable:</span> normal profits</li>
                        <li><span className="text-yellow-400">Correction:</span> -15% profits</li>
                        <li><span className="text-orange-400">Bear:</span> -40% profits</li>
                        <li><span className="text-red-400">Crash:</span> -70% profits</li>
                      </ul>
                      <p className="mt-2 text-slate-400">Cycle changes every 2-5 minutes.</p>
                    </>
                  }
                />
                <p className="text-slate-400 text-xs uppercase mb-1">Market</p>
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
                  title="Machine Condition"
                  content={
                    <>
                      <p>Technical condition of machines (0-100%).</p>
                      <p className="mt-2 text-slate-400">Production impact:</p>
                      <ul className="list-disc list-inside text-slate-400 mt-1">
                        <li>100-80%: Full efficiency</li>
                        <li>80-50%: -10% efficiency</li>
                        <li>50-30%: -25% efficiency</li>
                        <li>30-0%: -50% efficiency</li>
                      </ul>
                      <p className="mt-2 text-slate-400">Maintenance:</p>
                      <ul className="list-disc list-inside text-slate-400 mt-1">
                        <li>Tier 1-2: Manual repair (+20%)</li>
                        <li>Tier 3+: Automatic with Maintenance Dept</li>
                      </ul>
                    </>
                  }
                />
                <p className="text-slate-400 text-xs uppercase mb-1">Machine Condition</p>
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
                  title="Total Earnings"
                  content={
                    <>
                      <p>Sum of all money earned.</p>
                      <p className="mt-2 text-slate-400">What it's needed for:</p>
                      <ul className="list-disc list-inside text-slate-400 mt-1">
                        <li>Unlocking next tiers</li>
                        <li>Prestige requirement</li>
                      </ul>
                    </>
                  }
                />
                <p className="text-slate-400 text-xs uppercase mb-1">Total Earnings</p>
                <p className="text-xl md:text-2xl font-bold text-blue-400">${formatMoney(totalEarnings)}</p>
              </div>
            </div>
          )}

          {/* Additional stats row for Finance - Total earnings, Leverage, Hedging, Crashes survived */}
          {path === "FINANCE" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
              <div className="bg-slate-900 rounded-lg p-3 md:p-4 relative">
                <InfoTooltip
                  title="Total Earnings"
                  content={
                    <>
                      <p>Sum of all money earned.</p>
                      <p className="mt-2 text-slate-400">What it's needed for:</p>
                      <ul className="list-disc list-inside text-slate-400 mt-1">
                        <li>Unlocking next tiers</li>
                        <li>Prestige requirement ($10M)</li>
                      </ul>
                    </>
                  }
                />
                <p className="text-slate-400 text-xs uppercase mb-1">Total Earnings</p>
                <p className="text-xl md:text-2xl font-bold text-blue-400">${formatMoney(totalEarnings)}</p>
              </div>
              <div className="bg-slate-900 rounded-lg p-3 md:p-4 relative">
                <InfoTooltip
                  title="Leverage"
                  content={
                    <>
                      <p>Multiplies profits and losses.</p>
                      <p className="mt-2 text-slate-400">Levels:</p>
                      <ul className="list-disc list-inside text-slate-400 mt-1">
                        <li>1x: no leverage, 0% cost</li>
                        <li>2x: double, 0.5%/min</li>
                        <li>5x: Tier 3+, 1.5%/min</li>
                        <li>10x: Tier 4+, 3%/min</li>
                        <li>20x: Tier 5, 5%/min</li>
                      </ul>
                      <p className="mt-2 text-red-400">Margin call risk increases with leverage!</p>
                    </>
                  }
                />
                <p className="text-slate-400 text-xs uppercase mb-1">Leverage</p>
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
                      <p>Protection against market volatility.</p>
                      <p className="mt-2 text-slate-400">Effect:</p>
                      <ul className="list-disc list-inside text-slate-400 mt-1">
                        <li>Reduces profits in bull market (30%)</li>
                        <li>Reduces losses in bear market (20%)</li>
                      </ul>
                      <p className="mt-2 text-slate-500 text-xs">Available from Tier 3.</p>
                    </>
                  }
                />
                <p className="text-slate-400 text-xs uppercase mb-1">Hedging</p>
                <p className={`text-xl md:text-2xl font-bold ${hedgingEnabled ? "text-green-400" : "text-slate-500"}`}>
                  {hedgingEnabled ? "ACTIVE" : "OFF"}
                </p>
              </div>
              <div className="bg-slate-900 rounded-lg p-3 md:p-4 relative">
                <InfoTooltip
                  title="Crashes Survived"
                  content={
                    <>
                      <p>Number of market crashes survived.</p>
                      <p className="mt-2 text-slate-400">Required for:</p>
                      <ul className="list-disc list-inside text-slate-400 mt-1">
                        <li>Tier 5: 2 crashes survived</li>
                        <li>Prestige: 3 crashes survived</li>
                      </ul>
                    </>
                  }
                />
                <p className="text-slate-400 text-xs uppercase mb-1">Crashes Survived</p>
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
                    <p className="text-white font-medium">Machine Maintenance</p>
                    <p className="text-slate-400 text-sm">
                      Condition: <span className={machineCondition >= 80 ? "text-green-400" : machineCondition >= 50 ? "text-yellow-400" : "text-red-400"}>
                        {machineCondition.toFixed(0)}%
                      </span>
                      {machineCondition < 80 && " - production reduced!"}
                    </p>
                  </div>
                  <Button
                    onClick={repairMachines}
                    disabled={machineCondition >= 100 || money < currentTier * 100}
                    style={{ backgroundColor: machineCondition < 100 && money >= currentTier * 100 ? pathInfo.color : undefined }}
                    variant={machineCondition < 100 && money >= currentTier * 100 ? "default" : "outline"}
                    className={machineCondition >= 100 || money < currentTier * 100 ? "text-slate-400" : ""}
                  >
                    Repair (+20%) - ${currentTier * 100}
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
                  Progress to <span className="text-white font-semibold">Tier {nextTier.id}: {nextTier.name}</span>
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
                      ? "One of these buildings required:"
                      : "All buildings required:"}
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
                      {buildingRequirements.type === "any" ? "Requirement met!" : "All requirements met!"}
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
                    <span className="hidden sm:inline">- {tier.name}</span>
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
              Tier {selectedTier}: {getTierDefinition(selectedTier, path)?.name}
            </h3>
            <p className="text-slate-500">
              Unlock Tier {selectedTier} to access these buildings
            </p>
          </div>
        )}
        </div>
        {/* END BUILDINGS TAB CONTENT */}

      </div>
    </>
  );
}
