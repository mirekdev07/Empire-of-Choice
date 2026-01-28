"use client";

import { useGameStore } from "@/store/useGameStore";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/engine";
import { InfoTooltip } from "./InfoTooltip";
import { Progress } from "@/components/ui/progress";
import { useTranslations } from "next-intl";

export function FactoryPanel({ pathColor }: { pathColor: string }) {
  const t = useTranslations("factory");
  const machineCondition = useGameStore((state) => state.machineCondition);
  const efficiency = useGameStore((state) => state.efficiency);
  const resources = useGameStore((state) => state.resources);
  const resourcesPerSecond = useGameStore((state) => state.resourcesPerSecond);
  const fixedCostsPerSecond = useGameStore((state) => state.fixedCostsPerSecond);
  const baseMoneyPerSecond = useGameStore((state) => state.baseMoneyPerSecond);
  const currentTier = useGameStore((state) => state.currentTier);
  const buildings = useGameStore((state) => state.buildings);
  const money = useGameStore((state) => state.money);
  const repairMachines = useGameStore((state) => state.repairMachines);
  const marketInfluence = useGameStore((state) => state.marketInfluence);

  // Only show for Tier 2+
  if (currentTier < 2) {
    return null;
  }

  // Machine condition status
  const conditionPercent = Math.round(machineCondition);
  const isCriticalCondition = conditionPercent < 30;
  const isLowCondition = conditionPercent < 50;
  const isPoorCondition = conditionPercent < 80;

  // Efficiency status
  const efficiencyPercent = Math.round(efficiency);
  const isLowEfficiency = efficiencyPercent < 70;
  const isHighEfficiency = efficiencyPercent > 100;

  // Resource flow
  const isConsumingResources = resourcesPerSecond < 0;
  const resourceBalance = resourcesPerSecond;

  // Repair cost scales with tier
  const repairCost = currentTier * 100;
  const canRepair = money >= repairCost && machineCondition < 100;

  // Has maintenance building (auto-repair)
  const hasMaintenanceDept = (buildings["i3_maintenance"] || 0) > 0;

  // Count workers
  const workerCount = (buildings["i2_workers"] || 0) * 5; // Each team = 5 workers
  const hasWorkers = workerCount > 0;

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 mb-4 relative">
      <InfoTooltip
        title={t("tooltipTitle")}
        content={<p>{t("tooltipDesc")}</p>}
      />
      <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
        <span>🏭</span> {t("title")}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-3">
        {/* Machine Condition */}
        <div className="bg-slate-900 rounded-lg p-3">
          <p className="text-slate-400 text-xs uppercase mb-1">{t("machineCondition")}</p>
          <p
            className={`text-2xl font-bold ${
              isCriticalCondition
                ? "text-red-400"
                : isLowCondition
                ? "text-yellow-400"
                : isPoorCondition
                ? "text-blue-400"
                : "text-green-400"
            }`}
          >
            {conditionPercent}%
          </p>
          <Progress
            value={conditionPercent}
            className="h-2 mt-2"
          />
          <p className="text-xs text-slate-500 mt-1">
            {isCriticalCondition && t("statusCritical")}
            {isLowCondition && !isCriticalCondition && t("statusPoor")}
            {isPoorCondition && !isLowCondition && t("statusAverage")}
            {!isPoorCondition && t("statusGood")}
          </p>
        </div>

        {/* Efficiency */}
        <div className="bg-slate-900 rounded-lg p-3">
          <p className="text-slate-400 text-xs uppercase mb-1">{t("efficiency")}</p>
          <p
            className={`text-2xl font-bold ${
              isLowEfficiency
                ? "text-yellow-400"
                : isHighEfficiency
                ? "text-green-400"
                : "text-orange-400"
            }`}
          >
            {efficiencyPercent}%
          </p>
          <Progress
            value={(efficiencyPercent / 150) * 100}
            className="h-2 mt-2"
          />
        </div>

        {/* Resource Flow */}
        <div className="bg-slate-900 rounded-lg p-3">
          <p className="text-slate-400 text-xs uppercase mb-1">{t("resourceFlow")}</p>
          <p
            className={`text-2xl font-bold ${
              resourceBalance > 0
                ? "text-green-400"
                : resourceBalance < 0
                ? "text-orange-400"
                : "text-slate-400"
            }`}
          >
            {resourceBalance > 0 ? "+" : ""}{resourceBalance.toFixed(1)}{t("perSecond")}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            {formatMoney(resources)}
          </p>
        </div>
      </div>

      {/* Second row - Workers, Costs, and Market Influence */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-3">
        {/* Workers */}
        {hasWorkers && (
          <div className="bg-slate-900 rounded-lg p-3">
            <p className="text-slate-400 text-xs uppercase mb-1">{t("workers")}</p>
            <p className="text-2xl font-bold text-blue-400">
              {workerCount}
            </p>
          </div>
        )}

        {/* Fixed costs */}
        {fixedCostsPerSecond > 0 && (
          <div className="bg-slate-900 rounded-lg p-3">
            <p className="text-slate-400 text-xs uppercase mb-1">{t("fixedCosts")}</p>
            <p className="text-2xl font-bold text-red-400">
              -${formatMoney(fixedCostsPerSecond)}{t("perSecond")}
            </p>
          </div>
        )}

        {/* Market Influence (Tier 5 only) */}
        {currentTier >= 5 && (
          <div className="bg-slate-900 rounded-lg p-3">
            <p className="text-slate-400 text-xs uppercase mb-1">{t("marketInfluence")}</p>
            <p className={`text-2xl font-bold ${marketInfluence > 0 ? "text-purple-400" : "text-slate-400"}`}>
              +{Math.round(marketInfluence * 100)}%
            </p>
            <Progress
              value={(marketInfluence / 0.5) * 100}
              className="h-2 mt-2"
            />
          </div>
        )}
      </div>

      {/* Repair button - only for Tier 1-2 without maintenance dept */}
      {!hasMaintenanceDept && (
        <Button
          onClick={repairMachines}
          disabled={!canRepair}
          className="w-full"
          style={{ backgroundColor: canRepair ? pathColor : undefined }}
          variant={canRepair ? "default" : "outline"}
        >
          <span className="mr-2">🔧</span>
          {t("repairMachines")} - ${formatMoney(repairCost)}
        </Button>
      )}

      {hasMaintenanceDept && (
        <div className="bg-green-900/30 border border-green-600/50 rounded-lg p-3 text-center">
          <p className="text-green-400 text-sm">
            <span className="mr-2">✅</span>
            {t("maintenanceDept")}
          </p>
        </div>
      )}
    </div>
  );
}
