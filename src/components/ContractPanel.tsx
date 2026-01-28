"use client";

import { useState, useEffect } from "react";
import { useGameStore } from "@/store/useGameStore";
import { formatMoney } from "@/lib/engine";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { InfoTooltip } from "./InfoTooltip";
import { saveGame } from "@/actions/gameActions";
import { Contract } from "@/config/contracts";

const MAX_ACTIVE_CONTRACTS = 3;

interface ContractPanelProps {
  pathColor: string;
}

export function ContractPanel({ pathColor }: ContractPanelProps) {
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
      state.completedCollaborationsCount
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
      case "sponsor": return "Sponsoring";
      case "long_term": return "Umowa dlugoterm.";
      case "collaboration": return "Kolaboracja";
      case "production": return "Produkcja";
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
        title="Kontrakty"
        content={
          path === "INDUSTRIAL" ? (
            <>
              <p>Kontrakty produkcyjne od klientow biznesowych.</p>
              <p className="mt-2 text-slate-400">Warunki pojawienia sie:</p>
              <ul className="list-disc list-inside text-slate-400 mt-1 text-xs">
                <li>Nowa oferta co ~20 sekund</li>
                <li>Tylko gdy nie masz oczekujacej oferty</li>
                <li><strong>Maksymalnie 3 aktywne kontrakty!</strong></li>
              </ul>
              <p className="mt-2 text-slate-400">Typy kontraktow:</p>
              <ul className="list-disc list-inside text-slate-400 mt-1 text-xs">
                <li><span className="text-orange-400">Lokalne</span> - szybkie, male nagrody</li>
                <li><span className="text-orange-400">Regionalne</span> - srednie nagrody</li>
                <li><span className="text-orange-400">Krajowe</span> - duze nagrody</li>
                <li><span className="text-orange-400">Rzadowe</span> - bonus do efektywnosci</li>
                <li><span className="text-orange-400">Miedzynarodowe</span> - bonus surowcow</li>
              </ul>
              <p className="mt-2 text-yellow-400 text-xs">
                Uwaga: Nieukonczone kontrakty obnizaja efektywnosc!
              </p>
            </>
          ) : (
            <>
              <p>Kontrakty to oferty wspolpracy z markami i innymi tworcami.</p>
              <p className="mt-2 text-slate-400">Warunki pojawienia sie:</p>
              <ul className="list-disc list-inside text-slate-400 mt-1 text-xs">
                <li>Minimum <strong>20 reputacji</strong></li>
                <li>Nowa oferta co ~20 sekund</li>
                <li>Tylko gdy nie masz oczekujacej oferty</li>
                <li><strong>Maksymalnie 3 aktywne kontrakty!</strong></li>
              </ul>
              <p className="mt-2 text-slate-400">Typy kontraktow:</p>
              <ul className="list-disc list-inside text-slate-400 mt-1 text-xs">
                <li><span className="text-green-400">Sponsoring</span> - szybkie, mniejsze nagrody</li>
                <li><span className="text-blue-400">Dlugoterminowe</span> - wieksze nagrody, dluzszy czas</li>
                <li><span className="text-purple-400">Kolaboracje</span> - duzo followers</li>
              </ul>
              <p className="mt-2 text-slate-400">Auto-akceptacja:</p>
              <ul className="list-disc list-inside text-slate-400 mt-1 text-xs">
                <li>Wlacz aby automatycznie akceptowac kontrakty</li>
                <li>Ustaw minimalna nagrode do auto-akceptacji</li>
              </ul>
              <p className="mt-2 text-yellow-400 text-xs">
                Uwaga: Nieukonczone kontrakty obnizaja reputacje!
              </p>
            </>
          )
        }
      />
      {/* Contract stats */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <span>Kontrakty</span>
          <span className="text-xs text-slate-500">({activeContracts.length}/{MAX_ACTIVE_CONTRACTS})</span>
        </h3>
        <div className="flex gap-3 text-xs text-slate-400">
          <span>Ukonczone: {completedContractsCount}</span>
          <span>Dlugoterm.: {completedLongTermCount}</span>
          <span>Kolaboracje: {completedCollaborationsCount}</span>
        </div>
      </div>

      {/* Auto-accept controls */}
      <div className="bg-slate-800 rounded-lg p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-300">Auto-akceptacja</span>
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
            <span className="text-xs text-slate-400">Min. nagroda:</span>
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
              <p className="text-yellow-400">Potrzebujesz minimum 20 reputacji</p>
              <p className="text-xs mt-1">Aktualna reputacja: {reputation}/20</p>
            </>
          ) : (
            <>
              <p>Oczekiwanie na oferty kontraktow...</p>
              <p className="text-xs mt-1">Nowe oferty pojawiaja sie co ~20 sekund</p>
            </>
          )}
        </div>
      )}

      {/* Max contracts reached */}
      {isAtMaxContracts && !pendingContractOffer && (
        <div className="text-center py-2 mb-3 bg-yellow-900/30 rounded-lg border border-yellow-600/50">
          <p className="text-yellow-400 text-sm">Osiagnieto limit {MAX_ACTIVE_CONTRACTS} aktywnych kontraktow</p>
          <p className="text-xs text-slate-400 mt-1">Nowe oferty pojawia sie po ukonczeniu kontraktu</p>
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
            <span className="text-xs text-slate-500">NOWA OFERTA!</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3 text-xs">
            <div className="bg-slate-800 rounded p-2">
              <p className="text-slate-500">Nagroda</p>
              <p className="text-green-400">${formatMoney(pendingContractOffer.reward.money)}</p>
              {pendingContractOffer.reward.followers && (
                <p className="text-purple-400">+{formatMoney(pendingContractOffer.reward.followers)} followers</p>
              )}
              {pendingContractOffer.reward.efficiency && (
                <p className="text-cyan-400">+{pendingContractOffer.reward.efficiency}% efektywnosci</p>
              )}
              {pendingContractOffer.reward.resources && (
                <p className="text-orange-400">+{formatMoney(pendingContractOffer.reward.resources)} surowcow</p>
              )}
              <p className="text-yellow-400">+{pendingContractOffer.reward.reputation} reputacji</p>
            </div>
            <div className="bg-slate-800 rounded p-2">
              <p className="text-slate-500">Kara za niedotrzymanie</p>
              <p className="text-red-400">-{pendingContractOffer.penalty.reputation} reputacji</p>
              {pendingContractOffer.penalty.efficiency && (
                <p className="text-red-400">-{pendingContractOffer.penalty.efficiency}% efektywnosci</p>
              )}
              <p className="text-slate-400 mt-1">Czas: {Math.floor(pendingContractOffer.duration / 60)}min</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => handleAcceptContract(pendingContractOffer)}
              size="sm"
              className="flex-1"
              style={{ backgroundColor: pathColor }}
            >
              Akceptuj
            </Button>
            <Button
              onClick={declineContract}
              size="sm"
              variant="outline"
              className="flex-1 border-slate-500 text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              Odrzuc
            </Button>
          </div>
        </div>
      )}

      {/* Active contracts */}
      {activeContracts.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-slate-500 mb-2">Aktywne kontrakty ({activeContracts.length})</p>
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
                  <span>Nagroda: ${formatMoney(ac.contract.reward.money)}</span>
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
