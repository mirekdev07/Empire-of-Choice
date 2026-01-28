"use client";

import { useGameStore } from "@/store/useGameStore";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/engine";
import { useState, useEffect } from "react";
import { getPrestigePreview, performPrestige } from "@/actions/gameActions";
import { InfoTooltip } from "./InfoTooltip";

interface PrestigePreview {
  canPrestige: boolean;
  prestigePoints: number;
  path: string;
  bonuses: {
    productionMultiplier: number;
    startingMoney: number;
    startingFollowers: number;
    startingReputation: number;
    startingResources: number;
    startingEfficiency: number;
    startingAum: number;
    startingRatingBonus: number;
  };
  currentBonuses: {
    productionMultiplier: number;
    startingMoney: number;
    startingFollowers: number;
    startingReputation: number;
    startingResources: number;
    startingEfficiency: number;
    startingAum: number;
    startingRatingBonus: number;
  };
}

export function PrestigePanel({ pathColor }: { pathColor: string }) {
  const currentTier = useGameStore((state) => state.currentTier);
  const totalEarnings = useGameStore((state) => state.totalEarnings);
  const timesPrestiged = useGameStore((state) => state.timesPrestiged);
  const prestigeProductionBonus = useGameStore((state) => state.prestigeProductionBonus);
  const path = useGameStore((state) => state.path);
  const initializeFromServer = useGameStore((state) => state.initializeFromServer);

  const isIndustrial = path === "INDUSTRIAL";
  const isFinance = path === "FINANCE";

  const [preview, setPreview] = useState<PrestigePreview | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPrestiging, setIsPrestiging] = useState(false);

  // Fetch prestige preview
  useEffect(() => {
    const fetchPreview = async () => {
      const data = await getPrestigePreview();
      setPreview(data);
    };
    fetchPreview();
  }, [currentTier, totalEarnings]);

  // Only show if player has reached at least Tier 4
  if (currentTier < 4) {
    return null;
  }

  const canPrestigeNow = preview?.canPrestige ?? false;
  const prestigePoints = preview?.prestigePoints ?? 0;

  const handlePrestige = async () => {
    if (!canPrestigeNow) return;

    setIsPrestiging(true);
    const result = await performPrestige();

    if (result.success) {
      // Reload game state
      window.location.reload();
    } else {
      alert(result.error);
    }

    setIsPrestiging(false);
    setShowConfirm(false);
  };

  const getGradientClass = () => {
    if (isIndustrial) return "from-orange-900/50 to-amber-900/50 border-orange-500/50";
    if (isFinance) return "from-green-900/50 to-emerald-900/50 border-green-500/50";
    return "from-purple-900/50 to-pink-900/50 border-purple-500/50";
  };

  const getPathName = () => {
    if (isIndustrial) return "imperium przemyslowe";
    if (isFinance) return "imperium finansowe";
    return "imperium medialne";
  };

  const getPathSecondary = () => {
    if (isIndustrial) return "Surowce i efektywnosc";
    if (isFinance) return "AUM i rating kredytowy";
    return "Followers i reputacje";
  };

  return (
    <div className={`bg-gradient-to-r ${getGradientClass()} rounded-lg p-4 border mb-4 relative`}>
      <InfoTooltip
        title="System Prestige"
        content={
          <>
            <p>Prestige pozwala "sprzedac" swoje {getPathName()} i zaczac od nowa z permanentnymi bonusami.</p>
            <p className="mt-2 text-slate-400">Wymagania:</p>
            <ul className="list-disc list-inside text-slate-400 mt-1 text-xs">
              <li>Osiagnij <strong>Tier 5</strong></li>
              <li>Zgromadz <strong>10,000,000$</strong> lacznych zarobkow</li>
            </ul>
            <p className="mt-2 text-slate-400">Co tracisz:</p>
            <ul className="list-disc list-inside text-slate-400 mt-1 text-xs">
              <li>Wszystkie pieniadze i budynki</li>
              <li>{getPathSecondary()} (czesciowo)</li>
              <li>Postep tierow (wracasz do Tier 1)</li>
            </ul>
            <p className="mt-2 text-green-400">Co zyskujesz (permanentnie):</p>
            <ul className="list-disc list-inside text-slate-400 mt-1 text-xs">
              <li><span className="text-green-400">Bonus produkcji</span> - zwielokrotnia zarobki</li>
              <li><span className="text-blue-400">Startowe pieniadze</span> - wiecej $ na start</li>
              {isIndustrial ? (
                <>
                  <li><span className="text-orange-400">Startowe surowce</span> - wiecej surowcow na start</li>
                  <li><span className="text-yellow-400">Startowa efektywnosc</span> - lepsza produkcja</li>
                </>
              ) : isFinance ? (
                <>
                  <li><span className="text-cyan-400">Startowy AUM</span> - wiecej kapitalu na start</li>
                  <li><span className="text-green-400">Lepszy rating</span> - wyzszy rating kredytowy</li>
                </>
              ) : (
                <>
                  <li><span className="text-purple-400">Startowi followers</span> - szybszy poczatek</li>
                  <li><span className="text-yellow-400">Startowa reputacja</span> - lepsze kontrakty</li>
                </>
              )}
            </ul>
            <p className={`mt-2 ${isIndustrial ? "text-orange-400" : isFinance ? "text-green-400" : "text-purple-400"} text-xs`}>
              Im wiecej zarobkow przed prestige, tym lepsze bonusy!
            </p>
          </>
        }
      />
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">👑</span>
          <h3 className="text-white font-bold">System Prestige</h3>
          {timesPrestiged > 0 && (
            <span className="bg-purple-600 px-2 py-0.5 rounded text-xs text-white">
              x{timesPrestiged}
            </span>
          )}
        </div>
        {prestigeProductionBonus > 1 && (
          <span className="text-purple-400 text-sm">
            +{Math.round((prestigeProductionBonus - 1) * 100)}% produkcji
          </span>
        )}
      </div>

      {/* Current progress to prestige */}
      {!canPrestigeNow && (
        <div className="bg-slate-900/50 rounded p-3 mb-3">
          <p className="text-slate-400 text-sm mb-2">Wymagania do Prestige:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className={`flex justify-between ${currentTier >= 5 ? "text-green-400" : "text-slate-400"}`}>
              <span>Tier:</span>
              <span>{currentTier}/5 {currentTier >= 5 && "✓"}</span>
            </div>
            <div className={`flex justify-between ${totalEarnings >= 10000000 ? "text-green-400" : "text-slate-400"}`}>
              <span>Zarobki:</span>
              <span>${formatMoney(totalEarnings)}/10M {totalEarnings >= 10000000 && "✓"}</span>
            </div>
          </div>
        </div>
      )}

      {/* Preview rewards */}
      {preview && (
        <div className="bg-slate-900/50 rounded p-3 mb-3">
          <p className="text-slate-400 text-sm mb-2">
            {canPrestigeNow ? "Otrzymasz za Prestige:" : "Potencjalne nagrody:"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className={isIndustrial ? "text-orange-400" : isFinance ? "text-green-400" : "text-purple-400"}>
              <span className="block text-slate-500">Punkty prestige:</span>
              <span className="text-lg font-bold">{prestigePoints}</span>
            </div>
            <div className="text-green-400">
              <span className="block text-slate-500">Bonus produkcji:</span>
              <span className="text-lg font-bold">+{Math.round((preview.bonuses.productionMultiplier - 1) * 100)}%</span>
            </div>
            <div className="text-blue-400">
              <span className="block text-slate-500">Start z:</span>
              <span>${formatMoney(100 + preview.bonuses.startingMoney)}</span>
            </div>
            {isIndustrial ? (
              <>
                <div className="text-orange-400">
                  <span className="block text-slate-500">Surowce:</span>
                  <span>+{formatMoney(preview.bonuses.startingResources)}</span>
                </div>
                <div className="text-yellow-400">
                  <span className="block text-slate-500">Efektywnosc:</span>
                  <span>+{preview.bonuses.startingEfficiency}%</span>
                </div>
              </>
            ) : isFinance ? (
              <>
                <div className="text-cyan-400">
                  <span className="block text-slate-500">Startowy AUM:</span>
                  <span>+${formatMoney(preview.bonuses.startingAum)}</span>
                </div>
                <div className="text-green-400">
                  <span className="block text-slate-500">Bonus ratingu:</span>
                  <span>+{preview.bonuses.startingRatingBonus} poziomow</span>
                </div>
              </>
            ) : (
              <div className="text-purple-400">
                <span className="block text-slate-500">Followers:</span>
                <span>+{formatMoney(preview.bonuses.startingFollowers)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Prestige button */}
      {!showConfirm ? (
        <Button
          onClick={() => setShowConfirm(true)}
          disabled={!canPrestigeNow}
          className="w-full"
          style={{
            backgroundColor: canPrestigeNow ? pathColor : undefined,
          }}
          variant={canPrestigeNow ? "default" : "outline"}
        >
          {canPrestigeNow ? "🚀 Sprzedaj Imperium" : "🔒 Osiagnij Tier 5 i 10M$"}
        </Button>
      ) : (
        <div className="space-y-2">
          <p className="text-yellow-400 text-sm text-center">
            Czy na pewno? Stracisz caly postep, ale zachowasz bonusy!
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowConfirm(false)}
              variant="outline"
              className="flex-1"
            >
              Anuluj
            </Button>
            <Button
              onClick={handlePrestige}
              disabled={isPrestiging}
              className="flex-1"
              style={{ backgroundColor: "#dc2626" }}
            >
              {isPrestiging ? "Trwa..." : "Tak, Prestige!"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
