"use client";

import { useGameStore } from "@/store/useGameStore";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { InfoTooltip } from "./InfoTooltip";

export function PublishButton({ pathColor }: { pathColor: string }) {
  const publish = useGameStore((state) => state.publish);
  const publishBonusActive = useGameStore((state) => state.publishBonusActive);
  const publishBonusEndTime = useGameStore((state) => state.publishBonusEndTime);
  const contentMultiplier = useGameStore((state) => state.contentMultiplier);
  const currentTier = useGameStore((state) => state.currentTier);

  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!publishBonusActive) {
      setTimeLeft(0);
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((publishBonusEndTime - Date.now()) / 1000));
      setTimeLeft(remaining);
    }, 100);

    return () => clearInterval(interval);
  }, [publishBonusActive, publishBonusEndTime]);

  // Don't show for Tier 3+ (employees handle content)
  if (currentTier >= 3) {
    return null;
  }

  const decayPercentage = Math.round(contentMultiplier * 100);
  const isLowContent = decayPercentage < 50;
  const isCriticalContent = decayPercentage < 25;

  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 relative">
      <InfoTooltip
        title="Regularnosc publikacji"
        content={
          <>
            <p>W Tier 1-2 Twoja produktywnosc zalezy od regularnego publikowania contentu.</p>
            <p className="mt-2 text-slate-400">Jak to dziala:</p>
            <ul className="list-disc list-inside text-slate-400 mt-1 text-xs">
              <li>Pasek pokazuje aktualna produktywnosc (0-100%)</li>
              <li>Produktywnosc spada automatycznie z czasem</li>
              <li>Tier 1: -2% na minute</li>
              <li>Tier 2: -1% na minute</li>
            </ul>
            <p className="mt-2 text-slate-400">Przycisk "Publikuj":</p>
            <ul className="list-disc list-inside text-slate-400 mt-1 text-xs">
              <li><span className="text-green-400">+10% do zarobkow</span> przez 30 sekund</li>
              <li><span className="text-yellow-400">+1 reputacji</span> (cooldown 1 min)</li>
              <li>Resetuje spadek produktywnosci do 100%</li>
            </ul>
            <p className="mt-2 text-purple-400 text-xs">
              W Tier 3+ pracownicy zajmuja sie publikowaniem za Ciebie!
            </p>
          </>
        }
      />
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-white font-semibold text-sm">Regularnosc publikacji</h3>
          <p className="text-slate-400 text-xs">
            {currentTier === 1 ? "Spada 2% na minute" : "Spada 1% na minute"}
          </p>
        </div>
        <div
          className={`text-2xl font-bold ${
            isCriticalContent ? "text-red-400" :
            isLowContent ? "text-yellow-400" :
            "text-green-400"
          }`}
        >
          {decayPercentage}%
        </div>
      </div>

      {/* Content bar */}
      <div className="w-full h-2 bg-slate-700 rounded-full mb-3 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            isCriticalContent ? "bg-red-500" :
            isLowContent ? "bg-yellow-500" :
            "bg-green-500"
          }`}
          style={{ width: `${decayPercentage}%` }}
        />
      </div>

      {/* Publish button */}
      <Button
        onClick={publish}
        disabled={publishBonusActive}
        className="w-full"
        style={{
          backgroundColor: publishBonusActive ? undefined : pathColor,
        }}
        variant={publishBonusActive ? "outline" : "default"}
      >
        {publishBonusActive ? (
          <span className="flex items-center gap-2">
            <span className="animate-pulse">Bonus aktywny!</span>
            <span className="text-xs bg-slate-700 px-2 py-0.5 rounded">{timeLeft}s</span>
          </span>
        ) : (
          "Publikuj (+10% przez 30s)"
        )}
      </Button>

      {isCriticalContent && !publishBonusActive && (
        <p className="text-red-400 text-xs mt-2 text-center animate-pulse">
          Twoja produkcja spada! Publikuj regularnie!
        </p>
      )}
    </div>
  );
}
