"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getUserSaves, selectSave, saveGame, SaveInfo } from "@/actions/gameActions";
import { useGameStore } from "@/store/useGameStore";
import { formatMoney } from "@/lib/engine";
import { Button } from "@/components/ui/button";

export function SaveSwitcher() {
  const router = useRouter();
  const [saves, setSaves] = useState<SaveInfo[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const saveId = useGameStore((state) => state.saveId);
  const saveName = useGameStore((state) => state.saveName);
  const path = useGameStore((state) => state.path);

  // Load saves when dropdown opens
  useEffect(() => {
    if (isOpen && saves.length === 0) {
      loadSaves();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const loadSaves = async () => {
    setIsLoading(true);
    const userSaves = await getUserSaves();
    setSaves(userSaves);
    setIsLoading(false);
  };

  const handleSwitchSave = async (newSaveId: string) => {
    if (newSaveId === saveId) {
      setIsOpen(false);
      return;
    }

    setIsSwitching(true);

    // Save current game state first
    const state = useGameStore.getState();
    await saveGame(
      state.money,
      state.followers,
      state.totalEarnings,
      state.reputation,
      state.activeContracts,
      state.autoAcceptContracts,
      state.autoAcceptMinReward,
      state.resources,
      state.efficiency,
      state.machineCondition,
      state.completedContractsCount,
      state.completedLongTermCount,
      state.completedCollaborationsCount,
      // Finance fields
      state.aum,
      state.creditRating,
      state.leverage,
      state.marketPhase,
      state.crashesSurvived,
      state.hedgingEnabled,
      // Update lastPlayedAt
      true,
      // Buildings
      state.buildings
    );

    // Switch to new save
    const result = await selectSave(newSaveId);
    if (result.success) {
      // Reload the page to get the new save state
      router.refresh();
      window.location.reload();
    }

    setIsSwitching(false);
    setIsOpen(false);
  };

  const getPathIcon = (pathType: string) => {
    switch (pathType) {
      case "MEDIA": return "🎬";
      case "INDUSTRIAL": return "🏭";
      case "FINANCE": return "💹";
      default: return "🎮";
    }
  };

  const getPathColor = (pathType: string) => {
    switch (pathType) {
      case "MEDIA": return "#a855f7";
      case "INDUSTRIAL": return "#f97316";
      case "FINANCE": return "#22c55e";
      default: return "#64748b";
    }
  };

  const currentIcon = path ? getPathIcon(path) : "🎮";
  const currentColor = path ? getPathColor(path) : "#64748b";

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Current save button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-600 transition-colors"
        disabled={isSwitching}
      >
        <span className="text-lg">{currentIcon}</span>
        <div className="text-left">
          <div className="text-sm font-medium text-white truncate max-w-[120px]">
            {saveName || "Zapis"}
          </div>
          <div className="text-xs text-slate-400">
            {isSwitching ? "Przełączanie..." : "Zmień zapis"}
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="p-2 border-b border-slate-700">
            <p className="text-xs text-slate-400 uppercase tracking-wide px-2">Twoje zapisy</p>
          </div>

          {isLoading ? (
            <div className="p-4 text-center text-slate-400">
              Ładowanie...
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              {saves.map((save) => {
                const isCurrent = save.id === saveId;
                const color = getPathColor(save.path);
                const icon = getPathIcon(save.path);

                return (
                  <button
                    key={save.id}
                    onClick={() => handleSwitchSave(save.id)}
                    disabled={isSwitching}
                    className={`w-full px-3 py-2 flex items-center gap-3 hover:bg-slate-700 transition-colors ${
                      isCurrent ? "bg-slate-700/50" : ""
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                      style={{ backgroundColor: color + "30" }}
                    >
                      {icon}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white truncate">
                          {save.name}
                        </span>
                        {isCurrent && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">
                            aktywny
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">
                        Tier {save.currentTier} • ${formatMoney(save.money)}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="p-2 border-t border-slate-700">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-slate-400 hover:text-white justify-start"
              onClick={() => {
                setIsOpen(false);
                router.push("/saves");
              }}
            >
              <span className="mr-2">+</span>
              Zarządzaj zapisami
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
