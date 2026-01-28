"use client";

import { useGameStore } from "@/store/useGameStore";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/engine";
import { InfoTooltip } from "./InfoTooltip";

export function EmployeePanel({ pathColor }: { pathColor: string }) {
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
        title="Zarzadzanie zespolem"
        content={
          <>
            <p>W Tier 3+ zatrudniasz pracownikow, ktorzy generuja przychod, ale wymagaja pensji.</p>
            <p className="mt-2 text-slate-400">Morale zespolu (50-120%):</p>
            <ul className="list-disc list-inside text-slate-400 mt-1 text-xs">
              <li><span className="text-green-400">&gt;100%</span> - bonus do produktywnosci</li>
              <li><span className="text-blue-400">70-100%</span> - normalna produktywnosc</li>
              <li><span className="text-yellow-400">55-70%</span> - obnizena produktywnosc</li>
              <li><span className="text-red-400">&lt;55%</span> - krytycznie niskie!</li>
            </ul>
            <p className="mt-2 text-slate-400">Co wplywa na morale:</p>
            <ul className="list-disc list-inside text-slate-400 mt-1 text-xs">
              <li><span className="text-green-400">+5%</span> - przycisk "Zmotywuj zespol"</li>
              <li><span className="text-red-400">-0.5%/s</span> - brak aktywnosci (po 30s)</li>
            </ul>
            <p className="mt-2 text-slate-400">Koszty stale:</p>
            <ul className="list-disc list-inside text-slate-400 mt-1 text-xs">
              <li>Pensje pracownikow = ~20% produkcji</li>
              <li>Platne automatycznie co sekunde</li>
            </ul>
            {currentTier >= 4 && (
              <>
                <p className="mt-2 text-slate-400">Dywersyfikacja (Tier 4+):</p>
                <ul className="list-disc list-inside text-slate-400 mt-1 text-xs">
                  <li>+5% za kazdy unikalny typ aktywa</li>
                  <li>Maksymalnie +50% bonusu</li>
                </ul>
              </>
            )}
          </>
        }
      />
      <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
        <span>👥</span> Zarzadzanie zespolem
      </h3>

      <div className={`grid grid-cols-1 sm:grid-cols-2 ${currentTier >= 4 ? "md:grid-cols-3" : ""} gap-3 md:gap-4 mb-3`}>
        {/* Morale */}
        <div className="bg-slate-900 rounded-lg p-3">
          <p className="text-slate-400 text-xs uppercase mb-1">Morale zespolu</p>
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
            {isHighMorale && "Bonus produktywnosci!"}
            {isLowMorale && !isCriticalMorale && "Produktywnosc spada"}
            {isCriticalMorale && "Krytycznie niskie morale!"}
            {!isHighMorale && !isLowMorale && "Normalna produktywnosc"}
          </p>
        </div>

        {/* Fixed costs */}
        <div className="bg-slate-900 rounded-lg p-3">
          <p className="text-slate-400 text-xs uppercase mb-1">Koszty stale</p>
          <p className="text-2xl font-bold text-red-400">
            -${formatMoney(fixedCostsPerSecond)}/s
          </p>
          <p className="text-xs text-slate-500 mt-2">
            {Math.round((fixedCostsPerSecond / baseMoneyPerSecond) * 100) || 0}% produkcji na pensje
          </p>
        </div>

        {/* Diversification bonus (Tier 4+) */}
        {currentTier >= 4 && (
          <div className="bg-slate-900 rounded-lg p-3">
            <p className="text-slate-400 text-xs uppercase mb-1">Dywersyfikacja</p>
            <p className={`text-2xl font-bold ${diversificationBonus > 0 ? "text-green-400" : "text-slate-500"}`}>
              +{Math.round(diversificationBonus * 100)}%
            </p>
            <p className="text-xs text-slate-500 mt-2">
              {Object.values(buildings).filter(c => c > 0).length} unikalnych aktywow
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
        Zmotywuj zespol (+5% morale)
      </Button>

      {isCriticalMorale && (
        <p className="text-red-400 text-xs mt-2 text-center animate-pulse">
          Twoj zespol jest zdemotywowany! Produktywnosc spadla do {moralePercent}%
        </p>
      )}
    </div>
  );
}
