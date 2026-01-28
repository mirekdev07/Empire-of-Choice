"use client";

import { useGameStore } from "@/store/useGameStore";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { InfoTooltip } from "./InfoTooltip";
import { useTranslations } from "next-intl";

export function PublishButton({ pathColor }: { pathColor: string }) {
  const t = useTranslations("publish");
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
        title={t("tooltipTitle")}
        content={<p>{t("tooltipDesc")}</p>}
      />
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-white font-semibold text-sm">{t("title")}</h3>
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
            <span className="animate-pulse">{t("currentBonus")}</span>
            <span className="text-xs bg-slate-700 px-2 py-0.5 rounded">{timeLeft}s</span>
          </span>
        ) : (
          t("publish")
        )}
      </Button>

      {isCriticalContent && !publishBonusActive && (
        <p className="text-red-400 text-xs mt-2 text-center animate-pulse">
          {t("decayWarning")}
        </p>
      )}
    </div>
  );
}
