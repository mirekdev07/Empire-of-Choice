"use client";

import { useGameStore } from "@/store/useGameStore";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/engine";
import { InfoTooltip } from "./InfoTooltip";
import { useTranslations } from "next-intl";

export function EmployeePanel({ pathColor }: { pathColor: string }) {
  const t = useTranslations("employees");
  const employeeMorale = useGameStore((state) => state.employeeMorale);
  const fixedCostsPerSecond = useGameStore((state) => state.fixedCostsPerSecond);
  const currentTier = useGameStore((state) => state.currentTier);
  const publish = useGameStore((state) => state.publish);
  const baseMoneyPerSecond = useGameStore((state) => state.baseMoneyPerSecond);
  const diversificationBonus = useGameStore((state) => state.diversificationBonus);
  const buildings = useGameStore((state) => state.buildings);

  // Only show for Tier 3+
  if (currentTier < 3) {
    return null;
  }

  const moralePercent = Math.round(employeeMorale * 100);
  const isLowMorale = moralePercent < 70;
  const isCriticalMorale = moralePercent < 55;
  const isHighMorale = moralePercent > 100;

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 mb-4 relative">
      <InfoTooltip
        title={t("tooltipTitle")}
        content={<p>{t("tooltipDesc")}</p>}
      />
      <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
        <span>👥</span> {t("title")}
      </h3>

      <div className={`grid grid-cols-1 sm:grid-cols-2 ${currentTier >= 4 ? "md:grid-cols-3" : ""} gap-3 md:gap-4 mb-3`}>
        {/* Morale */}
        <div className="bg-slate-900 rounded-lg p-3">
          <p className="text-slate-400 text-xs uppercase mb-1">{t("morale")}</p>
          <p
            className={`text-2xl font-bold ${
              isCriticalMorale
                ? "text-red-400"
                : isLowMorale
                ? "text-yellow-400"
                : isHighMorale
                ? "text-green-400"
                : "text-blue-400"
            }`}
          >
            {moralePercent}%
          </p>
          <div className="w-full h-2 bg-slate-700 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isCriticalMorale
                  ? "bg-red-500"
                  : isLowMorale
                  ? "bg-yellow-500"
                  : isHighMorale
                  ? "bg-green-500"
                  : "bg-blue-500"
              }`}
              style={{ width: `${Math.min(100, (moralePercent / 120) * 100)}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isHighMorale && t("moraleExcellent")}
            {isLowMorale && !isCriticalMorale && t("moralePoor")}
            {isCriticalMorale && t("moraleCritical")}
            {!isHighMorale && !isLowMorale && t("moraleGood")}
          </p>
        </div>

        {/* Fixed costs */}
        <div className="bg-slate-900 rounded-lg p-3">
          <p className="text-slate-400 text-xs uppercase mb-1">{t("fixedCosts")}</p>
          <p className="text-2xl font-bold text-red-400">
            -${formatMoney(fixedCostsPerSecond)}{t("perSecond")}
          </p>
        </div>

        {/* Diversification bonus (Tier 4+) */}
        {currentTier >= 4 && (
          <div className="bg-slate-900 rounded-lg p-3">
            <p className="text-slate-400 text-xs uppercase mb-1">{t("diversification")}</p>
            <p className={`text-2xl font-bold ${diversificationBonus > 0 ? "text-green-400" : "text-slate-500"}`}>
              +{Math.round(diversificationBonus * 100)}%
            </p>
          </div>
        )}
      </div>

      {/* Motivate team button */}
      <Button
        onClick={publish}
        className="w-full"
        style={{ backgroundColor: pathColor }}
      >
        <span className="mr-2">📢</span>
        {t("motivate")}
      </Button>
    </div>
  );
}
