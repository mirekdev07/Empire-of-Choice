"use client";

import { useGameStore } from "@/store/useGameStore";
import { InfoTooltip } from "./InfoTooltip";
import { useTranslations } from "next-intl";

interface SynergyPanelProps {
  pathColor: string;
}

export function SynergyPanel({ pathColor }: SynergyPanelProps) {
  const t = useTranslations("synergies");
  const synergyBonus = useGameStore((state) => state.synergyBonus);
  const activeSynergies = useGameStore((state) => state.activeSynergies);
  const currentTier = useGameStore((state) => state.currentTier);

  // Only show for Tier 2+
  if (currentTier < 2) {
    return null;
  }

  // Don't show if no synergies
  if (activeSynergies.length === 0 && synergyBonus === 0) {
    return null;
  }

  return (
    <div className="bg-slate-900 rounded-lg p-3 mb-4 relative">
      <InfoTooltip
        title={t("tooltipTitle")}
        content={<p>{t("tooltipDesc")}</p>}
      />
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <span>{t("title")}</span>
          {activeSynergies.length > 0 && (
            <span
              className="px-2 py-0.5 rounded text-xs"
              style={{ backgroundColor: pathColor + "30", color: pathColor }}
            >
              +{Math.round(synergyBonus * 100)}%
            </span>
          )}
        </h3>
      </div>

      {activeSynergies.length > 0 ? (
        <div className="flex flex-wrap gap-2 mt-2">
          {activeSynergies.map((synergy) => (
            <span
              key={synergy}
              className="px-2 py-1 bg-slate-800 rounded text-xs text-green-400"
            >
              {synergy}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-500 mt-1">
          {t("description")}
        </p>
      )}
    </div>
  );
}
