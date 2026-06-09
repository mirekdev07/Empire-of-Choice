"use client";

import { useGameStore } from "@/store/useGameStore";
import { BuildingDefinition } from "@/config/gamedata";
import { getCost, getCostForMultiple, getMaxAffordable, formatMoney, timeToAfford, formatTime } from "@/lib/engine";
import { buyBuilding } from "@/actions/gameActions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";

interface BuildingCardProps {
  building: BuildingDefinition;
  pathColor: string;
  maxCount: number;
}

export function BuildingCard({ building, pathColor, maxCount }: BuildingCardProps) {
  const t = useTranslations("building");
  const tBuildings = useTranslations("buildings");
  const money = useGameStore((state) => state.money);
  const buildings = useGameStore((state) => state.buildings);
  const moneyPerSecond = useGameStore((state) => state.moneyPerSecond);
  const setMoney = useGameStore((state) => state.setMoney);
  const setBuildings = useGameStore((state) => state.setBuildings);
  const updateProductionRates = useGameStore((state) => state.updateProductionRates);

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const count = buildings[building.id] || 0;
  const cost1 = getCost(building, count);
  const cost5 = getCostForMultiple(building, count, Math.min(5, maxCount - count));
  const cost10 = getCostForMultiple(building, count, Math.min(10, maxCount - count));
  const maxAffordable = getMaxAffordable(building, count, money, maxCount);
  const costMax = getCostForMultiple(building, count, maxAffordable);

  const canAfford1 = money >= cost1 && count < maxCount;
  const canAfford5 = money >= cost5 && count + 5 <= maxCount;
  const canAfford10 = money >= cost10 && count + 10 <= maxCount;
  const canAffordMax = maxAffordable > 0;
  const isMaxed = count >= maxCount;
  const timeLeft = timeToAfford(cost1, money, moneyPerSecond);

  const handleBuy = (amount: number) => {
    const actualAmount = amount === -1 ? maxAffordable : Math.min(amount, maxCount - count);
    if (actualAmount <= 0 || isMaxed) return;

    const totalCost = getCostForMultiple(building, count, actualAmount);
    if (money < totalCost) return;

    setError(null);
    const currentMoney = money;
    const currentBuildings = { ...buildings };

    // Optimistic update
    setMoney(money - totalCost);
    setBuildings({
      ...buildings,
      [building.id]: count + actualAmount,
    });
    updateProductionRates();

    startTransition(async () => {
      const result = await buyBuilding(building.id, currentMoney, actualAmount);
      if (!result.success) {
        // Revert on error
        setMoney(currentMoney);
        setBuildings(currentBuildings);
        updateProductionRates();
        setError(result.error || t("purchaseError"));
      }
    });
  };

  return (
    <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <span className="text-2xl">{building.icon}</span>
              {tBuildings(`${building.id}.name`)}
            </CardTitle>
            <p className="text-sm text-slate-400 mt-1">{tBuildings(`${building.id}.desc`)}</p>
          </div>
          <div
            className="text-2xl font-bold px-3 py-1 rounded-lg ml-2"
            style={{ backgroundColor: pathColor + "20", color: pathColor }}
          >
            {count}
            <span className="text-xs text-slate-500">/{maxCount}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Production info */}
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">{t("earnings")}:</span>
            <span className="text-green-400">+${building.baseProduction.toFixed(2)}/s</span>
          </div>
          {building.followersPerSecond > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">{t("followers")}:</span>
              <span className="text-purple-400">+{building.followersPerSecond.toFixed(2)}/s</span>
            </div>
          )}
          {building.resourcesPerSecond !== undefined && building.resourcesPerSecond !== 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">{t("resources")}:</span>
              <span className={building.resourcesPerSecond > 0 ? "text-orange-400" : "text-red-400"}>
                {building.resourcesPerSecond > 0 ? "+" : ""}{building.resourcesPerSecond.toFixed(2)}/s
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">{t("total")}:</span>
            <span style={{ color: pathColor }}>
              ${(building.baseProduction * count).toFixed(2)}/s
            </span>
          </div>

          {/* Cost and buy button */}
          <div className="pt-2 border-t border-slate-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400 text-sm">{t("cost")}:</span>
              <span className={`font-semibold ${canAfford1 ? "text-green-400" : "text-red-400"}`}>
                ${formatMoney(cost1)}
              </span>
            </div>

            {!canAfford1 && !isMaxed && timeLeft !== null && timeLeft > 0 && (
              <p className="text-xs text-slate-500 mb-2 text-right">{formatTime(timeLeft)}</p>
            )}

            {isMaxed ? (
              <Button disabled className="w-full" variant="outline">
                {t("maxAmount")}
              </Button>
            ) : (
              <div className="grid grid-cols-4 gap-1">
                <Button
                  onClick={() => handleBuy(1)}
                  disabled={!canAfford1 || isPending}
                  className="text-xs px-1"
                  style={{
                    backgroundColor: canAfford1 ? pathColor : undefined,
                    borderColor: pathColor,
                  }}
                  variant={canAfford1 ? "default" : "outline"}
                  title={`${t("cost")}: $${formatMoney(cost1)}`}
                >
                  {isPending ? "..." : t("buy")}
                </Button>
                <Button
                  onClick={() => handleBuy(5)}
                  disabled={!canAfford5 || isPending}
                  className="text-xs px-1"
                  style={{
                    backgroundColor: canAfford5 ? pathColor : undefined,
                    borderColor: pathColor,
                  }}
                  variant={canAfford5 ? "default" : "outline"}
                  title={`${t("cost")}: $${formatMoney(cost5)}`}
                >
                  x5
                </Button>
                <Button
                  onClick={() => handleBuy(10)}
                  disabled={!canAfford10 || isPending}
                  className="text-xs px-1"
                  style={{
                    backgroundColor: canAfford10 ? pathColor : undefined,
                    borderColor: pathColor,
                  }}
                  variant={canAfford10 ? "default" : "outline"}
                  title={`${t("cost")}: $${formatMoney(cost10)}`}
                >
                  x10
                </Button>
                <Button
                  onClick={() => handleBuy(-1)}
                  disabled={!canAffordMax || isPending}
                  className="text-xs px-1"
                  style={{
                    backgroundColor: canAffordMax ? pathColor : undefined,
                    borderColor: pathColor,
                  }}
                  variant={canAffordMax ? "default" : "outline"}
                  title={`${t("buyFor", { count: maxAffordable })} $${formatMoney(costMax)}`}
                >
                  Max
                </Button>
              </div>
            )}

            {error && <p className="text-xs text-red-400 mt-2 text-center">{error}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
