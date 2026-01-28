"use client";

import { useState, useEffect } from "react";
import { useGameStore } from "@/store/useGameStore";
import { formatMoney } from "@/lib/engine";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { InfoTooltip } from "./InfoTooltip";
import { saveGame } from "@/actions/gameActions";
import { Contract } from "@/config/contracts";
import { useTranslations } from "next-intl";

const MAX_ACTIVE_CONTRACTS = 3;

interface ContractPanelProps {
  pathColor: string;
}

export function ContractPanel({ pathColor }: ContractPanelProps) {
  const t = useTranslations("contract");
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

  const [minRewardInput, setMinRewardInput] = useState(autoAcceptMinReward.toString());

  // Sync local input state with store value when it changes (e.g., after server load)
  useEffect(() => {
    setMinRewardInput(autoAcceptMinReward.toString());
  }, [autoAcceptMinReward]);

  const now = Date.now();
  const isAtMaxContracts = activeContracts.length >= MAX_ACTIVE_CONTRACTS;

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
          <span className="text-xs text-slate-500">({activeContracts.length}/{MAX_ACTIVE_CONTRACTS})</span>
        </h3>
        <div className="flex gap-3 text-xs text-slate-400">
          <span>{t("completed")}: {completedContractsCount}</span>
          <span>{t("longTermShort")}: {completedLongTermCount}</span>
          <span>{t("collaborations")}: {completedCollaborationsCount}</span>
        </div>
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
          <p className="text-yellow-400 text-sm">{t("maxReached", { count: activeContracts.length, max: MAX_ACTIVE_CONTRACTS })}</p>
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
              <h4 className="text-white font-semibold">{pendingContractOffer.name}</h4>
              <p className="text-slate-400 text-sm">{pendingContractOffer.description}</p>
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
                    <h5 className="text-white text-sm font-medium">{ac.contract.name}</h5>
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
