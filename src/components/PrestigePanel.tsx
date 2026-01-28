"use client";

import { useGameStore } from "@/store/useGameStore";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/engine";
import { useState, useEffect } from "react";
import { getPrestigePreview, performPrestige } from "@/actions/gameActions";
import { InfoTooltip } from "./InfoTooltip";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("prestige");
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
    if (isIndustrial) return t("empireIndustrial");
    if (isFinance) return t("empireFinance");
    return t("empireMedia");
  };

  const getPathSecondary = () => {
    if (isIndustrial) return t("resetIndustrial");
    if (isFinance) return t("resetFinance");
    return t("resetMedia");
  };

  return (
    <div className={`bg-gradient-to-r ${getGradientClass()} rounded-lg p-4 border mb-4 relative`}>
      <InfoTooltip
        title={t("tooltipTitle")}
        content={<p>{t("tooltipDesc")}</p>}
      />
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">👑</span>
          <h3 className="text-white font-bold">{t("title")}</h3>
          {timesPrestiged > 0 && (
            <span className="bg-purple-600 px-2 py-0.5 rounded text-xs text-white">
              x{timesPrestiged}
            </span>
          )}
        </div>
        {prestigeProductionBonus > 1 && (
          <span className="text-purple-400 text-sm">
            +{Math.round((prestigeProductionBonus - 1) * 100)}%
          </span>
        )}
      </div>

      {/* Current progress to prestige */}
      {!canPrestigeNow && (
        <div className="bg-slate-900/50 rounded p-3 mb-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className={`flex justify-between ${currentTier >= 5 ? "text-green-400" : "text-slate-400"}`}>
              <span>Tier:</span>
              <span>{currentTier}/5 {currentTier >= 5 && "✓"}</span>
            </div>
            <div className={`flex justify-between ${totalEarnings >= 10000000 ? "text-green-400" : "text-slate-400"}`}>
              <span>$:</span>
              <span>${formatMoney(totalEarnings)}/10M {totalEarnings >= 10000000 && "✓"}</span>
            </div>
          </div>
        </div>
      )}

      {/* Preview rewards */}
      {preview && (
        <div className="bg-slate-900/50 rounded p-3 mb-3">
          <p className="text-slate-400 text-sm mb-2">
            {canPrestigeNow ? t("youWillGet") : ""}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="text-green-400">
              <span className="block text-slate-500">{t("productionBonus")}:</span>
              <span className="text-lg font-bold">+{Math.round((preview.bonuses.productionMultiplier - 1) * 100)}%</span>
            </div>
            <div className="text-blue-400">
              <span className="block text-slate-500">{t("startingMoney")}:</span>
              <span>${formatMoney(100 + preview.bonuses.startingMoney)}</span>
            </div>
            {isIndustrial ? (
              <>
                <div className="text-orange-400">
                  <span className="block text-slate-500">{t("startingResources")}:</span>
                  <span>+{formatMoney(preview.bonuses.startingResources)}</span>
                </div>
              </>
            ) : isFinance ? (
              <>
                <div className="text-cyan-400">
                  <span className="block text-slate-500">{t("startingAUM")}:</span>
                  <span>+${formatMoney(preview.bonuses.startingAum)}</span>
                </div>
              </>
            ) : (
              <div className="text-purple-400">
                <span className="block text-slate-500">{t("startingFollowers")}:</span>
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
          {canPrestigeNow ? `🚀 ${t("sellEmpire")}` : `🔒 ${t("requireTier5")}`}
        </Button>
      ) : (
        <div className="space-y-2">
          <p className="text-yellow-400 text-sm text-center">
            {t("confirmTitle")} {t("confirmDesc")}
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowConfirm(false)}
              variant="outline"
              className="flex-1"
            >
              {t("confirmCancel")}
            </Button>
            <Button
              onClick={handlePrestige}
              disabled={isPrestiging}
              className="flex-1"
              style={{ backgroundColor: "#dc2626" }}
            >
              {isPrestiging ? "..." : t("confirmYes")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
