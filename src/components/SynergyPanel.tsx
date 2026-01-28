"use client";

import { useGameStore } from "@/store/useGameStore";
import { InfoTooltip } from "./InfoTooltip";

interface SynergyPanelProps {
  pathColor: string;
}

export function SynergyPanel({ pathColor }: SynergyPanelProps) {
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
        title="Synergie aktywów"
        content={
          <>
            <p>Synergie to bonusy do zarobków za posiadanie komplementarnych aktywów.</p>
            <p className="mt-2 text-slate-400">Dostępne synergie:</p>
            <ul className="list-disc list-inside text-slate-400 mt-1 text-xs">
              <li><strong>YouTube + Podcast</strong> (+15%) - ten sam content, dwa formaty</li>
              <li><strong>YouTube + Merch</strong> (+10%) - sprzedajesz produkty widzom</li>
              <li><strong>Newsletter + Blog</strong> (+12%) - lojalni czytelnicy</li>
              <li><strong>Podcast + Newsletter</strong> (+8%) - ekskluzywne treści</li>
              <li><strong>Social Media + Merch</strong> (+10%) - promocja produktów</li>
            </ul>
            <p className="mt-2 text-green-400 text-xs">
              Synergie sumują się! Im więcej kombinacji, tym większy bonus.
            </p>
          </>
        }
      />
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <span>Synergie aktywow</span>
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
          Kup rozne typy aktywow zeby odblokować bonusy synergii
        </p>
      )}
    </div>
  );
}
