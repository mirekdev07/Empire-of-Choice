"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/store/useGameStore";
import { getGameState, syncOfflineEarnings, upgradeTier, GameState } from "@/actions/gameActions";
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

interface DashboardProps {
  initialState: GameState;
}

export function Dashboard({ initialState }: DashboardProps) {
  const [offlineEarnings, setOfflineEarnings] = useState<number | null>(null);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState(1);

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

  // Initialize store
  useEffect(() => {
    const init = async () => {
      const sessionKey = "graidle_session_active";
      const isNewSession = !sessionStorage.getItem(sessionKey);

      if (isNewSession) {
        sessionStorage.setItem(sessionKey, "true");
        const result = await syncOfflineEarnings();
        if (result.success && result.earnings && result.earnings > 1) {
          setOfflineEarnings(result.earnings);
          setShowOfflineModal(true);
        }
      }

      const freshState = await getGameState();
      if (freshState) {
        initializeFromServer(freshState);
      } else {
        initializeFromServer(initialState);
      }
    };

    init();
  }, [initialState, initializeFromServer]);

  // Handle tab visibility - sync offline earnings when returning to tab
  useEffect(() => {
    let lastHiddenTime = 0;

    const handleVisibilityChange = async () => {
      if (document.hidden) {
        // Tab became hidden - record time
        lastHiddenTime = Date.now();
      } else {
        // Tab became visible - check if enough time passed (min 5 seconds)
        const timeAway = Date.now() - lastHiddenTime;
        if (lastHiddenTime > 0 && timeAway > 5000) {
          const result = await syncOfflineEarnings();
          if (result.success && result.earnings && result.earnings > 1) {
            setOfflineEarnings(result.earnings);
            setShowOfflineModal(true);
            // Refresh state from server
            const freshState = await getGameState();
            if (freshState) {
              initializeFromServer(freshState);
            }
          }
        }
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
        totalEarnings: "Zarobki",
        followers: "Followers",
        resources: "Surowce",
        reputation: "Reputacja",
        efficiency: "Efektywność",
        completedContracts: "Kontrakty",
        completedLongTermContracts: "Umowy długoterm.",
        scandalsSurvived: "Skandale przetrwane",
        // Finance labels
        aum: "Kapitał (AUM)",
        minRating: "Rating",
        diversification: "Dywersyfikacja",
        crashesSurvived: "Przetrwane krachy",
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
      {showOfflineModal && offlineEarnings && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-8 max-w-md mx-4 text-center border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-4">Witaj z powrotem!</h2>
            <p className="text-slate-400 mb-4">Podczas Twojej nieobecnosci zarobiles:</p>
            <p className="text-4xl font-bold mb-6" style={{ color: pathInfo.color }}>
              ${formatMoney(offlineEarnings)}
            </p>
            <Button onClick={() => setShowOfflineModal(false)} style={{ backgroundColor: pathInfo.color }}>
              Super!
            </Button>
          </div>
        </div>
      )}

      <div className="p-3 pt-16 md:p-6 md:pt-6 max-w-7xl mx-auto">
        {/* DEV: Debug buttons for Media - TODO: remove before release */}
        {path === "MEDIA" && (
          <div className="bg-yellow-900/50 border border-yellow-600 rounded-lg p-2 mb-4 flex items-center gap-2 flex-wrap">
            <span className="text-yellow-400 text-xs font-mono">DEV:</span>
            <Button
              size="sm"
              variant="outline"
              className="text-xs border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-black"
              onClick={() => useGameStore.getState().addMoney(50000)}
            >
              +50,000$
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-black"
              onClick={() => useGameStore.getState().addFollowers(10000)}
            >
              +10,000 followers
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-black"
              onClick={() => useGameStore.getState().setReputation(Math.min(100, reputation + 20))}
            >
              +20 rep
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-black"
              onClick={() => useGameStore.setState((state) => ({ totalEarnings: state.totalEarnings + 50000 }))}
            >
              +50,000$ zarobki
            </Button>
          </div>
        )}

        {/* DEV: Debug buttons for Industrial - TODO: remove before release */}
        {path === "INDUSTRIAL" && (
          <div className="bg-yellow-900/50 border border-yellow-600 rounded-lg p-2 mb-4 flex items-center gap-2 flex-wrap">
            <span className="text-yellow-400 text-xs font-mono">DEV:</span>
            <Button
              size="sm"
              variant="outline"
              className="text-xs border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-black"
              onClick={() => useGameStore.getState().addMoney(50000)}
            >
              +50,000$
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-black"
              onClick={() => useGameStore.getState().addResources(500)}
            >
              +500 surowcow
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-black"
              onClick={() => useGameStore.getState().setEfficiency(Math.min(150, efficiency + 20))}
            >
              +20% efektywnosc
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-black"
              onClick={() => useGameStore.getState().setMachineCondition(100)}
            >
              100% kondycja
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-black"
              onClick={() => useGameStore.setState((state) => ({ totalEarnings: state.totalEarnings + 50000 }))}
            >
              +50,000$ zarobki
            </Button>
          </div>
        )}

        {/* DEV: Debug buttons for Finance - TODO: remove before release */}
        {path === "FINANCE" && (
          <div className="bg-yellow-900/50 border border-yellow-600 rounded-lg p-2 mb-4 flex items-center gap-2 flex-wrap">
            <span className="text-yellow-400 text-xs font-mono">DEV:</span>
            <Button
              size="sm"
              variant="outline"
              className="text-xs border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-black"
              onClick={() => useGameStore.getState().addMoney(50000)}
            >
              +50,000$
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-black"
              onClick={() => useGameStore.getState().addAum(10000)}
            >
              +10,000$ AUM
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-black"
              onClick={() => useGameStore.getState().setCreditRating("AAA")}
            >
              Rating AAA
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-black"
              onClick={() => useGameStore.getState().setMarketPhase("bull")}
            >
              Hossa
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-black"
              onClick={() => useGameStore.getState().setMarketPhase("crash")}
            >
              Krach
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-black"
              onClick={() => useGameStore.setState((state) => ({ totalEarnings: state.totalEarnings + 50000 }))}
            >
              +50,000$ zarobki
            </Button>
          </div>
        )}

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
                {canUpgrade ? `Awansuj do Tier ${nextTier.id}` : `🔒 Tier ${nextTier.id}`}
              </Button>
            )}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
            {/* Money - same for all paths */}
            <div className="bg-slate-900 rounded-lg p-3 md:p-4 relative">
              <InfoTooltip
                title="Pieniadze"
                content={
                  <>
                    <p>Twoja aktualna gotowka.</p>
                    <p className="mt-2 text-slate-400">Co wplywa na zarobki:</p>
                    <ul className="list-disc list-inside text-slate-400 mt-1">
                      <li>Budynki - kazdy generuje $/s</li>
                      {path === "MEDIA" && <li>Publikowanie - +10% na 30s</li>}
                      {path === "MEDIA" && currentTier >= 2 && <li>Synergie aktywow</li>}
                      {path === "MEDIA" && currentTier >= 3 && <li>Morale zespolu (50-120%)</li>}
                      {path === "MEDIA" && currentTier >= 3 && <li>Koszty stale (pensje -20%)</li>}
                      {path === "MEDIA" && currentTier >= 4 && <li>Dywersyfikacja (+5%/typ)</li>}
                      {path === "INDUSTRIAL" && <li>Efektywnosc (0-150%)</li>}
                      {path === "INDUSTRIAL" && <li>Kondycja maszyn</li>}
                      {path === "INDUSTRIAL" && <li>Dostepnosc surowcow</li>}
                      <li>Eventy (pozytywne/negatywne)</li>
                    </ul>
                  </>
                }
              />
              <p className="text-slate-400 text-xs uppercase mb-1">Pieniadze</p>
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
                      <p>Twoi obserwujacy/fani.</p>
                      <p className="mt-2 text-slate-400">Zrodla followers:</p>
                      <ul className="list-disc list-inside text-slate-400 mt-1">
                        <li>Budynki - niektore daja followers/s</li>
                        <li>Viralowy post (+1000)</li>
                        <li>Kontrakty (nagrody)</li>
                        <li>Eventy (pozytywne/negatywne)</li>
                      </ul>
                      <p className="mt-2 text-slate-400">Do czego potrzebni:</p>
                      <ul className="list-disc list-inside text-slate-400 mt-1">
                        <li>Odblokowanie tierow</li>
                        <li>Lepsze oferty sponsorskie</li>
                        <li>Niektore kontrakty</li>
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
                      <p>Kapital pod zarzadzaniem - pieniadze klientow.</p>
                      <p className="mt-2 text-slate-400">Zrodla AUM:</p>
                      <ul className="list-disc list-inside text-slate-400 mt-1">
                        <li>Klienci indywidualni (+500$/klient)</li>
                        <li>Klienci korporacyjni (+5,000$/firma)</li>
                        <li>Fundusze emerytalne (+50,000$/fundusz)</li>
                        <li>Sovereign wealth (+500,000$/kontrakt)</li>
                      </ul>
                      <p className="mt-2 text-slate-400">Wplyw:</p>
                      <ul className="list-disc list-inside text-slate-400 mt-1">
                        <li>Wiekszy AUM = wyzsza prowizja</li>
                        <li>Strata AUM klientow = spadek ratingu</li>
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
                  title="Surowce"
                  content={
                    <>
                      <p>Surowce niezbedne do produkcji.</p>
                      <p className="mt-2 text-slate-400">Zrodla surowcow:</p>
                      <ul className="list-disc list-inside text-slate-400 mt-1">
                        <li>Dostawcy lokalni (+0.5/s)</li>
                        <li>Hurtownie (+2.0/s)</li>
                        <li>Import (+5.0/s)</li>
                        <li>Wlasna kopalnia (+20/s)</li>
                      </ul>
                      <p className="mt-2 text-slate-400">Zuzycie:</p>
                      <ul className="list-disc list-inside text-slate-400 mt-1">
                        <li>Budynki produkcyjne zuzywaja surowce</li>
                        <li>Brak surowcow = spadek produkcji</li>
                      </ul>
                    </>
                  }
                />
                <p className="text-slate-400 text-xs uppercase mb-1">Surowce</p>
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
                  title="Reputacja"
                  content={
                    <>
                      <p>Twoja reputacja w branzy (0-100).</p>
                      <p className="mt-2 text-green-400">Co zwieksza:</p>
                      <ul className="list-disc list-inside text-slate-400 mt-1">
                        <li>Publikowanie (+1, cooldown 1 min)</li>
                        <li>Kamienie milowe followers (+10)</li>
                        <li>Ukonczone kontrakty (+2 do +25)</li>
                        <li>Pozytywne eventy</li>
                      </ul>
                      <p className="mt-2 text-red-400">Co zmniejsza:</p>
                      <ul className="list-disc list-inside text-slate-400 mt-1">
                        <li>Brak aktywnosci (-2)</li>
                        <li>Skandale (-15 do -30)</li>
                        <li>Negatywne eventy</li>
                      </ul>
                    </>
                  }
                />
                <p className="text-slate-400 text-xs uppercase mb-1">Reputacja</p>
                <p className="text-xl md:text-2xl font-bold text-yellow-400">{reputation}/100</p>
              </div>
            ) : path === "FINANCE" ? (
              <div className="bg-slate-900 rounded-lg p-3 md:p-4 relative">
                <InfoTooltip
                  title="Rating kredytowy"
                  content={
                    <>
                      <p>Twoja wiarygodnosc finansowa (D do AAA).</p>
                      <p className="mt-2 text-green-400">Co zwieksza:</p>
                      <ul className="list-disc list-inside text-slate-400 mt-1">
                        <li>Stabilne zyski (+1/5 min)</li>
                        <li>Dywersyfikacja portfela (+1)</li>
                        <li>Niski poziom dzwigni (+1)</li>
                        <li>Ukonczone kontrakty (+1)</li>
                      </ul>
                      <p className="mt-2 text-red-400">Co zmniejsza:</p>
                      <ul className="list-disc list-inside text-slate-400 mt-1">
                        <li>Straty (-1 za -10% kapitalu)</li>
                        <li>Wysoka dzwignia (-1)</li>
                        <li>Nieukonczone kontrakty (-2)</li>
                        <li>Kryzys finansowy (-1-3)</li>
                      </ul>
                      <p className="mt-2 text-slate-400">Wplyw ratingu:</p>
                      <ul className="list-disc list-inside text-slate-400 mt-1">
                        <li>AAA: 150% klientow, 2% pozyczki</li>
                        <li>BBB: 100% klientow, 8% pozyczki</li>
                        <li>D: Bankructwo</li>
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
                  title="Efektywnosc"
                  content={
                    <>
                      <p>Efektywnosc produkcji (0-150%).</p>
                      <p className="mt-2 text-green-400">Co zwieksza:</p>
                      <ul className="list-disc list-inside text-slate-400 mt-1">
                        <li>Nowoczesne maszyny (+5-20%)</li>
                        <li>Przeszkoleni pracownicy (+10%)</li>
                        <li>Automatyzacja (+15-30%)</li>
                        <li>Certyfikaty jakosci (+5%)</li>
                      </ul>
                      <p className="mt-2 text-red-400">Co zmniejsza:</p>
                      <ul className="list-disc list-inside text-slate-400 mt-1">
                        <li>Stare/zuzyte maszyny (-10-30%)</li>
                        <li>Awarie (-20% tymczasowo)</li>
                        <li>Strajki pracownikow (-50%)</li>
                      </ul>
                    </>
                  }
                />
                <p className="text-slate-400 text-xs uppercase mb-1">Efektywnosc</p>
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
                  title="Laczne zarobki"
                  content={
                    <>
                      <p>Suma wszystkich zarobionych pieniedzy.</p>
                      <p className="mt-2 text-slate-400">Do czego potrzebne:</p>
                      <ul className="list-disc list-inside text-slate-400 mt-1">
                        <li>Odblokowanie kolejnych tierow</li>
                        <li>Wymaganie do Prestige (10M$)</li>
                        <li>Obliczanie punktow prestige</li>
                      </ul>
                      <p className="mt-2 text-slate-500 text-xs">
                        Ta wartosc nigdy nie spada, nawet gdy wydajesz pieniadze.
                      </p>
                    </>
                  }
                />
                <p className="text-slate-400 text-xs uppercase mb-1">Laczne zarobki</p>
                <p className="text-xl md:text-2xl font-bold text-blue-400">${formatMoney(totalEarnings)}</p>
              </div>
            ) : path === "FINANCE" ? (
              <div className="bg-slate-900 rounded-lg p-3 md:p-4 relative">
                <InfoTooltip
                  title="Faza rynku"
                  content={
                    <>
                      <p>Aktualny cykl rynkowy wplywajacy na zyski.</p>
                      <p className="mt-2 text-slate-400">Fazy:</p>
                      <ul className="list-disc list-inside text-slate-400 mt-1">
                        <li><span className="text-green-400">Hossa:</span> +35% zyskow</li>
                        <li><span className="text-slate-300">Stabilny:</span> normalne zyski</li>
                        <li><span className="text-yellow-400">Korekta:</span> -15% zyskow</li>
                        <li><span className="text-orange-400">Bessa:</span> -40% zyskow</li>
                        <li><span className="text-red-400">Krach:</span> -70% zyskow</li>
                      </ul>
                      <p className="mt-2 text-slate-400">Cykl zmienia sie co 2-5 minut.</p>
                    </>
                  }
                />
                <p className="text-slate-400 text-xs uppercase mb-1">Rynek</p>
                <p className={`text-xl md:text-2xl font-bold ${
                  marketPhase === "bull" ? "text-green-400" :
                  marketPhase === "stable" ? "text-slate-300" :
                  marketPhase === "correction" ? "text-yellow-400" :
                  marketPhase === "bear" ? "text-orange-400" : "text-red-400"
                }`}>
                  {marketPhase === "bull" ? "HOSSA" :
                   marketPhase === "stable" ? "STABILNY" :
                   marketPhase === "correction" ? "KOREKTA" :
                   marketPhase === "bear" ? "BESSA" : "KRACH"}
                </p>
              </div>
            ) : (
              <div className="bg-slate-900 rounded-lg p-3 md:p-4 relative">
                <InfoTooltip
                  title="Kondycja maszyn"
                  content={
                    <>
                      <p>Stan techniczny maszyn (0-100%).</p>
                      <p className="mt-2 text-slate-400">Wplyw na produkcje:</p>
                      <ul className="list-disc list-inside text-slate-400 mt-1">
                        <li>100-80%: Pelna wydajnosc</li>
                        <li>80-50%: -10% wydajnosci</li>
                        <li>50-30%: -25% wydajnosci</li>
                        <li>30-0%: -50% wydajnosci</li>
                      </ul>
                      <p className="mt-2 text-slate-400">Konserwacja:</p>
                      <ul className="list-disc list-inside text-slate-400 mt-1">
                        <li>Tier 1-2: Reczna naprawa (+20%)</li>
                        <li>Tier 3+: Automatyczna z Dzialem utrzymania</li>
                      </ul>
                    </>
                  }
                />
                <p className="text-slate-400 text-xs uppercase mb-1">Kondycja maszyn</p>
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
                  title="Laczne zarobki"
                  content={
                    <>
                      <p>Suma wszystkich zarobionych pieniedzy.</p>
                      <p className="mt-2 text-slate-400">Do czego potrzebne:</p>
                      <ul className="list-disc list-inside text-slate-400 mt-1">
                        <li>Odblokowanie kolejnych tierow</li>
                        <li>Wymaganie do Prestige</li>
                      </ul>
                    </>
                  }
                />
                <p className="text-slate-400 text-xs uppercase mb-1">Laczne zarobki</p>
                <p className="text-xl md:text-2xl font-bold text-blue-400">${formatMoney(totalEarnings)}</p>
              </div>
            </div>
          )}

          {/* Additional stats row for Finance - Total earnings, Leverage, Hedging, Crashes survived */}
          {path === "FINANCE" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
              <div className="bg-slate-900 rounded-lg p-3 md:p-4 relative">
                <InfoTooltip
                  title="Laczne zarobki"
                  content={
                    <>
                      <p>Suma wszystkich zarobionych pieniedzy.</p>
                      <p className="mt-2 text-slate-400">Do czego potrzebne:</p>
                      <ul className="list-disc list-inside text-slate-400 mt-1">
                        <li>Odblokowanie kolejnych tierow</li>
                        <li>Wymaganie do Prestige (10M$)</li>
                      </ul>
                    </>
                  }
                />
                <p className="text-slate-400 text-xs uppercase mb-1">Laczne zarobki</p>
                <p className="text-xl md:text-2xl font-bold text-blue-400">${formatMoney(totalEarnings)}</p>
              </div>
              <div className="bg-slate-900 rounded-lg p-3 md:p-4 relative">
                <InfoTooltip
                  title="Dzwignia finansowa"
                  content={
                    <>
                      <p>Mnozy zyski i straty.</p>
                      <p className="mt-2 text-slate-400">Poziomy:</p>
                      <ul className="list-disc list-inside text-slate-400 mt-1">
                        <li>1x: brak dzwigni, 0% kosztu</li>
                        <li>2x: podwojenie, 0.5%/min</li>
                        <li>5x: Tier 3+, 1.5%/min</li>
                        <li>10x: Tier 4+, 3%/min</li>
                        <li>20x: Tier 5, 5%/min</li>
                      </ul>
                      <p className="mt-2 text-red-400">Ryzyko margin call rosnie z dzwignia!</p>
                    </>
                  }
                />
                <p className="text-slate-400 text-xs uppercase mb-1">Dzwignia</p>
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
                      <p>Zabezpieczenie przed zmiennoscia rynku.</p>
                      <p className="mt-2 text-slate-400">Efekt:</p>
                      <ul className="list-disc list-inside text-slate-400 mt-1">
                        <li>Redukuje zyski w hossie (30%)</li>
                        <li>Redukuje straty w bessie (20%)</li>
                      </ul>
                      <p className="mt-2 text-slate-500 text-xs">Dostepne od Tier 3.</p>
                    </>
                  }
                />
                <p className="text-slate-400 text-xs uppercase mb-1">Hedging</p>
                <p className={`text-xl md:text-2xl font-bold ${hedgingEnabled ? "text-green-400" : "text-slate-500"}`}>
                  {hedgingEnabled ? "AKTYWNY" : "WYL."}
                </p>
              </div>
              <div className="bg-slate-900 rounded-lg p-3 md:p-4 relative">
                <InfoTooltip
                  title="Przetrwane krachy"
                  content={
                    <>
                      <p>Liczba przetrwanych krachow rynkowych.</p>
                      <p className="mt-2 text-slate-400">Wymagane do:</p>
                      <ul className="list-disc list-inside text-slate-400 mt-1">
                        <li>Tier 5: 2 przetrwane krachy</li>
                        <li>Prestige: 3 przetrwane krachy</li>
                      </ul>
                    </>
                  }
                />
                <p className="text-slate-400 text-xs uppercase mb-1">Krachy przetrwane</p>
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
                    <p className="text-white font-medium">Konserwacja maszyn</p>
                    <p className="text-slate-400 text-sm">
                      Kondycja: <span className={machineCondition >= 80 ? "text-green-400" : machineCondition >= 50 ? "text-yellow-400" : "text-red-400"}>
                        {machineCondition.toFixed(0)}%
                      </span>
                      {machineCondition < 80 && " - produkcja zmniejszona!"}
                    </p>
                  </div>
                  <Button
                    onClick={repairMachines}
                    disabled={machineCondition >= 100 || money < currentTier * 100}
                    style={{ backgroundColor: machineCondition < 100 && money >= currentTier * 100 ? pathInfo.color : undefined }}
                    variant={machineCondition < 100 && money >= currentTier * 100 ? "default" : "outline"}
                    className={machineCondition >= 100 || money < currentTier * 100 ? "text-slate-400" : ""}
                  >
                    Napraw (+20%) - ${currentTier * 100}
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

          {/* Next tier progress */}
          {nextTier && (
            <div className="bg-slate-900 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-slate-400">
                  Postep do <span className="text-white font-semibold">Tier {nextTier.id}: {nextTier.name}</span>
                </p>
                <p className="text-sm text-slate-500">{Math.round(tierProgress)}%</p>
              </div>
              <Progress value={tierProgress} className="h-2 mb-3" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                {tierRequirementsDisplay.map((req) => {
                  // Special formatting for credit rating
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
                        {req.met && " \u2713"}
                      </span>
                    </div>
                  );
                })}
              </div>
              {/* Building requirements */}
              {buildingRequirements && (
                <div className="mt-3 pt-3 border-t border-slate-700">
                  <p className="text-xs text-slate-500 mb-2">
                    {buildingRequirements.type === "any"
                      ? "Wymagany jeden z budynków:"
                      : "Wymagane wszystkie budynki:"}
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
                      {buildingRequirements.type === "any" ? "Warunek spelniony!" : "Wszystkie spelnione!"}
                    </p>
                  )}
                </div>
              )}
              {upgradeError && <p className="text-red-400 text-sm mt-2">{upgradeError}</p>}
            </div>
          )}
        </div>

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
              Odblokuj Tier {selectedTier} aby uzyskac dostep do tych budynkow
            </p>
          </div>
        )}
      </div>
    </>
  );
}
