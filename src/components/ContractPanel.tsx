"use client";

import { useState, useEffect, useCallback } from "react";
import { useGameStore } from "@/store/useGameStore";
import { formatMoney } from "@/lib/engine";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { InfoTooltip } from "./InfoTooltip";
import { saveGame, activateAdBonus } from "@/actions/gameActions";
import { Contract } from "@/config/contracts";
import { useTranslations } from "next-intl";
import { Capacitor } from "@capacitor/core";

const BASE_MAX_CONTRACTS = 3;
const AD_BONUS_CONTRACTS = 3;

// AdMob Rewarded Ad Unit ID
const ADMOB_REWARDED_AD_ID = "ca-app-pub-3402973990721389/7824200727";

interface ContractPanelProps {
  pathColor: string;
}

export function ContractPanel({ pathColor }: ContractPanelProps) {
  const t = useTranslations("contract");
  const tContracts = useTranslations("contracts");
  const activeContracts = useGameStore((state) => state.activeContracts);
  const pendingContractOffer = useGameStore((state) => state.pendingContractOffer);
  const acceptContract = useGameStore((state) => state.acceptContract);
  const declineContract = useGameStore((state) => state.declineContract);
  const completedContractsCount = useGameStore((state) => state.completedContractsCount);
  const completedLongTermCount = useGameStore((state) => state.completedLongTermCount);
  const completedCollaborationsCount = useGameStore((state) => state.completedCollaborationsCount);
  const reputation = useGameStore((state) => state.reputation);
  const autoAcceptContracts = useGameStore((state) => state.autoAcceptContracts);
  const autoAcceptMinReward = useGameStore((state) => state.autoAcceptMinReward);
  const setAutoAcceptContracts = useGameStore((state) => state.setAutoAcceptContracts);
  const setAutoAcceptMinReward = useGameStore((state) => state.setAutoAcceptMinReward);
  const adBonusExpiresAt = useGameStore((state) => state.adBonusExpiresAt);
  const setAdBonusExpiresAt = useGameStore((state) => state.setAdBonusExpiresAt);
  const getMaxContracts = useGameStore((state) => state.getMaxContracts);

  const [minRewardInput, setMinRewardInput] = useState(autoAcceptMinReward.toString());
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adBonusTimeLeft, setAdBonusTimeLeft] = useState(0);

  // Sync local input state with store value when it changes (e.g., after server load)
  useEffect(() => {
    setMinRewardInput(autoAcceptMinReward.toString());
  }, [autoAcceptMinReward]);

  // Update ad bonus timer
  useEffect(() => {
    if (!adBonusExpiresAt) {
      setAdBonusTimeLeft(0);
      return;
    }

    const updateTimer = () => {
      const remaining = Math.max(0, adBonusExpiresAt - Date.now());
      setAdBonusTimeLeft(Math.floor(remaining / 1000));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [adBonusExpiresAt]);

  const now = Date.now();
  const maxContracts = getMaxContracts();
  const isAdBonusActive = adBonusExpiresAt && adBonusExpiresAt > now;
  const isAtMaxContracts = activeContracts.length >= maxContracts;

  // Format time remaining for ad bonus
  const formatTimeRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle watching ad - uses AdMob on native, placeholder on web
  const handleWatchAd = useCallback(async () => {
    setIsWatchingAd(true);

    try {
      // Check if running in native app (Capacitor)
      if (Capacitor.isNativePlatform()) {
        // Dynamic import AdMob only on native platform
        const { AdMob, RewardAdPluginEvents } = await import(
          "@capacitor-community/admob"
        );

        // Initialize AdMob (only once)
        await AdMob.initialize({
          initializeForTesting: false,
        });

        // Set up reward listener
        const rewardListener = await AdMob.addListener(
          RewardAdPluginEvents.Rewarded,
          async (reward: { type: string; amount: number }) => {
            console.log("Ad reward received:", reward);
            // User watched the full ad - activate bonus
            const result = await activateAdBonus();
            if (result.success && result.expiresAt) {
              setAdBonusExpiresAt(new Date(result.expiresAt).getTime());
            }
          }
        );

        // Set up dismiss listener to clean up
        const dismissListener = await AdMob.addListener(
          RewardAdPluginEvents.Dismissed,
          async () => {
            console.log("Ad dismissed");
            setIsWatchingAd(false);
            await rewardListener.remove();
            await dismissListener.remove();
          }
        );

        // Set up failed listener
        const failedListener = await AdMob.addListener(
          RewardAdPluginEvents.FailedToLoad,
          async (error: unknown) => {
            console.error("Ad failed to load:", error);
            setIsWatchingAd(false);
            await rewardListener.remove();
            await dismissListener.remove();
            await failedListener.remove();
          }
        );

        // Load and show the rewarded ad
        await AdMob.prepareRewardVideoAd({
          adId: ADMOB_REWARDED_AD_ID,
        });

        await AdMob.showRewardVideoAd();
      } else {
        // Web version - just activate bonus directly (for testing)
        // In production web, you might want to show a message that ads are only available in the app
        const result = await activateAdBonus();
        if (result.success && result.expiresAt) {
          setAdBonusExpiresAt(new Date(result.expiresAt).getTime());
        }
        setIsWatchingAd(false);
      }
    } catch (error) {
      console.error("Error showing ad:", error);
      setIsWatchingAd(false);
    }
  }, [setAdBonusExpiresAt]);

  // Accept contract and save immediately
  const handleAcceptContract = async (contract: Contract) => {
    acceptContract(contract);
    // Get updated state after accepting and save immediately
    const state = useGameStore.getState();
    await saveGame(
      state.money,
      state.followers,
      state.totalEarnings,
      state.reputation,
      state.activeContracts,
      state.autoAcceptContracts,
      state.autoAcceptMinReward,
      state.resources,
      state.efficiency,
      state.machineCondition,
      state.completedContractsCount,
      state.completedLongTermCount,
      state.completedCollaborationsCount,
      // Finance fields
      state.aum,
      state.creditRating,
      state.leverage,
      state.marketPhase,
      state.crashesSurvived,
      state.hedgingEnabled,
      // Update lastPlayedAt
      false,
      // Buildings
      state.buildings
    );
  };

  const getContractProgress = (startTime: number, endTime: number) => {
    const total = endTime - startTime;
    const elapsed = now - startTime;
    return Math.min(100, (elapsed / total) * 100);
  };

  const getTimeRemaining = (endTime: number) => {
    const remaining = Math.max(0, endTime - now);
    const seconds = Math.floor(remaining / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return minutes > 0 ? `${minutes}m ${secs}s` : `${secs}s`;
  };

  const path = useGameStore((state) => state.path);

  const getContractTypeLabel = (type: string) => {
    switch (type) {
      case "sponsor": return t("sponsorship");
      case "long_term": return t("longTerm");
      case "collaboration": return t("collaboration");
      case "production": return t("production");
      default: return type;
    }
  };

  const getContractTypeColor = (type: string) => {
    switch (type) {
      case "sponsor": return "text-green-400";
      case "long_term": return "text-blue-400";
      case "collaboration": return "text-purple-400";
      case "production": return "text-orange-400";
      default: return "text-slate-400";
    }
  };

  // Industrial path doesn't need minimum reputation for contracts
  const needsMoreReputation = path === "MEDIA" && reputation < 20;

  return (
    <div className="bg-slate-900 rounded-lg p-4 mb-4 relative">
      <InfoTooltip
        title={t("tooltipTitle")}
        content={<p>{t("tooltipDesc")}</p>}
      />
      {/* Contract stats */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <span>{t("title")}</span>
          <span className={`text-xs ${isAdBonusActive ? "text-green-400" : "text-slate-500"}`}>
            ({activeContracts.length}/{maxContracts})
            {isAdBonusActive && " +3"}
          </span>
        </h3>
        <div className="flex gap-3 text-xs text-slate-400">
          <span>{t("completed")}: {completedContractsCount}</span>
          <span>{t("longTermShort")}: {completedLongTermCount}</span>
          <span>{t("collaborations")}: {completedCollaborationsCount}</span>
        </div>
      </div>

      {/* Ad Bonus Section */}
      <div className="bg-slate-800 rounded-lg p-3 mb-3">
        {isAdBonusActive ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-green-400">🎬</span>
              <span className="text-sm text-green-400">{t("adBonusActive")}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400 font-bold">+3 {t("slots")}</span>
              <span className="text-slate-400 text-sm">
                {formatTimeRemaining(adBonusTimeLeft)}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">🎬</span>
              <span className="text-sm text-slate-300">{t("watchAdForBonus")}</span>
            </div>
            <Button
              onClick={handleWatchAd}
              disabled={isWatchingAd}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isWatchingAd ? t("watching") : t("watchAd")}
            </Button>
          </div>
        )}
      </div>

      {/* Auto-accept controls */}
      <div className="bg-slate-800 rounded-lg p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-300">{t("autoAccept")}</span>
          <button
            onClick={() => setAutoAcceptContracts(!autoAcceptContracts)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              autoAcceptContracts ? "bg-green-500" : "bg-slate-600"
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ${
                autoAcceptContracts ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
        {autoAcceptContracts && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">{t("minReward")}:</span>
            <input
              type="number"
              value={minRewardInput}
              onChange={(e) => setMinRewardInput(e.target.value)}
              onBlur={() => {
                const value = parseInt(minRewardInput) || 0;
                setAutoAcceptMinReward(value);
                setMinRewardInput(value.toString());
              }}
              className="w-24 px-2 py-1 text-xs bg-slate-700 border border-slate-600 rounded text-white"
              placeholder="0"
            />
            <span className="text-xs text-slate-500">$</span>
          </div>
        )}
      </div>

      {/* Status messages */}
      {!pendingContractOffer && activeContracts.length === 0 && (
        <div className="text-center py-4 text-slate-500">
          {needsMoreReputation ? (
            <>
              <p className="text-yellow-400">{t("needReputation")}</p>
              <p className="text-xs mt-1">{reputation}/20</p>
            </>
          ) : (
            <p>{t("waiting")}</p>
          )}
        </div>
      )}

      {/* Max contracts reached */}
      {isAtMaxContracts && !pendingContractOffer && (
        <div className="text-center py-2 mb-3 bg-yellow-900/30 rounded-lg border border-yellow-600/50">
          <p className="text-yellow-400 text-sm">{t("maxReached", { count: activeContracts.length, max: maxContracts })}</p>
          {!isAdBonusActive && (
            <p className="text-slate-400 text-xs mt-1">{t("watchAdForMore")}</p>
          )}
        </div>
      )}

      {/* Pending contract offer */}
      {pendingContractOffer && (
        <div
          className="rounded-lg p-4 mb-3 border-2 animate-pulse"
          style={{ borderColor: pathColor, backgroundColor: pathColor + "10" }}
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className={`text-xs font-semibold ${getContractTypeColor(pendingContractOffer.type)}`}>
                {getContractTypeLabel(pendingContractOffer.type)}
              </span>
              <h4 className="text-white font-semibold">{tContracts(`${pendingContractOffer.id}.name`)}</h4>
              <p className="text-slate-400 text-sm">{tContracts(`${pendingContractOffer.id}.desc`)}</p>
            </div>
            <span className="text-xs text-slate-500">{t("newOffer")}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3 text-xs">
            <div className="bg-slate-800 rounded p-2">
              <p className="text-slate-500">{t("reward")}</p>
              <p className="text-green-400">${formatMoney(pendingContractOffer.reward.money)}</p>
              {pendingContractOffer.reward.followers && (
                <p className="text-purple-400">+{formatMoney(pendingContractOffer.reward.followers)} followers</p>
              )}
              {pendingContractOffer.reward.efficiency && (
                <p className="text-cyan-400">+{pendingContractOffer.reward.efficiency}%</p>
              )}
              {pendingContractOffer.reward.resources && (
                <p className="text-orange-400">+{formatMoney(pendingContractOffer.reward.resources)}</p>
              )}
              <p className="text-yellow-400">+{pendingContractOffer.reward.reputation}</p>
            </div>
            <div className="bg-slate-800 rounded p-2">
              <p className="text-slate-500">{t("penalty")}</p>
              <p className="text-red-400">-{pendingContractOffer.penalty.reputation}</p>
              {pendingContractOffer.penalty.efficiency && (
                <p className="text-red-400">-{pendingContractOffer.penalty.efficiency}%</p>
              )}
              <p className="text-slate-400 mt-1">{t("timeLeft")}: {Math.floor(pendingContractOffer.duration / 60)}min</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => handleAcceptContract(pendingContractOffer)}
              size="sm"
              className="flex-1"
              style={{ backgroundColor: pathColor }}
            >
              {t("accept")}
            </Button>
            <Button
              onClick={declineContract}
              size="sm"
              variant="outline"
              className="flex-1 border-slate-500 text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              {t("reject")}
            </Button>
          </div>
        </div>
      )}

      {/* Active contracts */}
      {activeContracts.length > 0 && (
        <div className="space-y-2">
          {activeContracts.map((ac, index) => {
            const progress = getContractProgress(ac.startTime, ac.endTime);
            const timeLeft = getTimeRemaining(ac.endTime);
            const isNearEnd = progress > 80;

            return (
              <div
                key={index}
                className={`bg-slate-800 rounded-lg p-3 ${isNearEnd ? "border border-yellow-500/50" : ""}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className={`text-xs ${getContractTypeColor(ac.contract.type)}`}>
                      {getContractTypeLabel(ac.contract.type)}
                    </span>
                    <h5 className="text-white text-sm font-medium">{tContracts(`${ac.contract.id}.name`)}</h5>
                  </div>
                  <span className={`text-xs ${isNearEnd ? "text-yellow-400" : "text-slate-400"}`}>
                    {timeLeft}
                  </span>
                </div>
                <Progress value={progress} className="h-1.5" />
                <div className="flex justify-between mt-1 text-xs text-slate-500">
                  <span>{t("reward")}: ${formatMoney(ac.contract.reward.money)}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
