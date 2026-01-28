"use client";

import { useGameStore } from "@/store/useGameStore";
import { Button } from "@/components/ui/button";
import { InfoTooltip } from "./InfoTooltip";

interface FinancePanelProps {
  pathColor: string;
}

const MARKET_PHASE_INFO: Record<string, { label: string; icon: string; multiplier: string; color: string }> = {
  bull: { label: "HOSSA", icon: "\u{1F4C8}", multiplier: "+35%", color: "text-green-400" },
  stable: { label: "STABILNY", icon: "\u{1F4CA}", multiplier: "0%", color: "text-slate-300" },
  correction: { label: "KOREKTA", icon: "\u{1F4C9}", multiplier: "-15%", color: "text-yellow-400" },
  bear: { label: "BESSA", icon: "\u{1F43B}", multiplier: "-40%", color: "text-orange-400" },
  crash: { label: "KRACH", icon: "\u{1F4A5}", multiplier: "-70%", color: "text-red-400" },
};

const LEVERAGE_LEVELS = [
  { value: 1, label: "1x", cost: "0%", minTier: 1 },
  { value: 2, label: "2x", cost: "0.5%/min", minTier: 2 },
  { value: 5, label: "5x", cost: "1.5%/min", minTier: 3 },
  { value: 10, label: "10x", cost: "3%/min", minTier: 4 },
  { value: 20, label: "20x", cost: "5%/min", minTier: 5 },
];

export function FinancePanel({ pathColor }: FinancePanelProps) {
  const currentTier = useGameStore((state) => state.currentTier);
  const marketPhase = useGameStore((state) => state.marketPhase);
  const marketPhaseEndTime = useGameStore((state) => state.marketPhaseEndTime);
  const leverage = useGameStore((state) => state.leverage);
  const hedgingEnabled = useGameStore((state) => state.hedgingEnabled);
  const setLeverage = useGameStore((state) => state.setLeverage);
  const toggleHedging = useGameStore((state) => state.toggleHedging);
  const volatilityMultiplier = useGameStore((state) => state.volatilityMultiplier);
  const spreadIncome = useGameStore((state) => state.spreadIncome);
  const financeMarketInfluence = useGameStore((state) => state.financeMarketInfluence);

  const phaseInfo = MARKET_PHASE_INFO[marketPhase] || MARKET_PHASE_INFO.stable;

  // Calculate time remaining in current phase
  const now = Date.now();
  const timeRemaining = Math.max(0, Math.floor((marketPhaseEndTime - now) / 1000));
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <div className="bg-slate-900 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>{phaseInfo.icon}</span> Panel Rynku
        </h3>
        <InfoTooltip
          title="Panel Rynku"
          content={
            <>
              <p>Monitoruj rynek i zarzadzaj ryzykiem.</p>
              <p className="mt-2 text-slate-400">Funkcje:</p>
              <ul className="list-disc list-inside text-slate-400 mt-1">
                <li>Faza rynku - wplywa na wszystkie zyski</li>
                <li>Dzwignia - mnozy zyski i straty</li>
                <li>Hedging - zabezpieczenie (Tier 3+)</li>
              </ul>
            </>
          }
        />
      </div>

      {/* Market Phase Display */}
      <div className="bg-slate-800 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-400 text-sm">Faza rynku</span>
          <span className="text-slate-500 text-xs">
            {minutes}:{seconds.toString().padStart(2, "0")} do zmiany
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className={`text-2xl font-bold ${phaseInfo.color}`}>
            {phaseInfo.icon} {phaseInfo.label}
          </span>
          <span className={`text-lg ${phaseInfo.color}`}>
            ({phaseInfo.multiplier})
          </span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-slate-500 text-xs">Zmiennosc:</span>
          <span className={`text-xs ${volatilityMultiplier >= 1 ? "text-green-400" : "text-red-400"}`}>
            {((volatilityMultiplier - 1) * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Market Phase Timeline */}
      <div className="bg-slate-800 rounded-lg p-3 mb-4">
        <p className="text-slate-400 text-xs mb-2">Cykl rynkowy:</p>
        <div className="flex items-center gap-1">
          {["bull", "stable", "correction", "bear", "crash"].map((phase) => {
            const info = MARKET_PHASE_INFO[phase];
            const isActive = phase === marketPhase;
            return (
              <div
                key={phase}
                className={`flex-1 h-6 rounded flex items-center justify-center text-xs ${
                  isActive ? "ring-2 ring-white" : "opacity-50"
                }`}
                style={{
                  backgroundColor: isActive ? pathColor : "#334155",
                }}
              >
                <span className={isActive ? "text-white" : "text-slate-400"}>
                  {info.icon}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leverage Controls */}
      <div className="bg-slate-800 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white font-medium">Dzwignia finansowa</span>
          <span className="text-slate-400 text-sm">Aktualnie: {leverage}x</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {LEVERAGE_LEVELS.map((level) => {
            const isUnlocked = currentTier >= level.minTier;
            const isActive = leverage === level.value;
            return (
              <Button
                key={level.value}
                size="sm"
                variant={isActive ? "default" : "outline"}
                disabled={!isUnlocked}
                onClick={() => setLeverage(level.value)}
                className={`
                  ${isActive ? "" : "border-slate-600 text-slate-400"}
                  ${!isUnlocked ? "opacity-50 cursor-not-allowed" : ""}
                `}
                style={{
                  backgroundColor: isActive ? pathColor : undefined,
                }}
              >
                <span className="flex flex-col items-center">
                  <span>{level.label}</span>
                  <span className="text-[10px] opacity-70">
                    {!isUnlocked ? `T${level.minTier}` : level.cost}
                  </span>
                </span>
              </Button>
            );
          })}
        </div>
        {leverage > 1 && (
          <p className="text-yellow-400 text-xs mt-2">
            Uwaga: Wysokie ryzyko margin call przy {((1 / leverage) * 100).toFixed(0)}% straty!
          </p>
        )}
      </div>

      {/* Hedging Control */}
      <div className="bg-slate-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-medium">Hedging</p>
            <p className="text-slate-400 text-sm">
              {currentTier >= 3
                ? hedgingEnabled
                  ? "Zabezpieczenie aktywne - redukcja zyskow i strat"
                  : "Wylaczony - pelna ekspozycja na rynek"
                : "Wymagany Tier 3"}
            </p>
          </div>
          <Button
            onClick={toggleHedging}
            disabled={currentTier < 3}
            variant={hedgingEnabled ? "default" : "outline"}
            style={{
              backgroundColor: hedgingEnabled ? pathColor : undefined,
            }}
            className={currentTier < 3 ? "opacity-50 cursor-not-allowed" : ""}
          >
            {hedgingEnabled ? "Aktywny" : "Wlacz"}
          </Button>
        </div>
        {hedgingEnabled && (
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-900 rounded p-2">
              <p className="text-slate-500">W hossie:</p>
              <p className="text-yellow-400">+10% zamiast +35%</p>
            </div>
            <div className="bg-slate-900 rounded p-2">
              <p className="text-slate-500">W krachu:</p>
              <p className="text-green-400">-14% zamiast -70%</p>
            </div>
          </div>
        )}
      </div>

      {/* Tier 5: Market Making & Market Influence */}
      {currentTier >= 5 && (
        <div className="bg-slate-800 rounded-lg p-4 mt-4">
          <p className="text-white font-medium mb-3">Tier 5: Zaawansowane</p>
          <div className="grid grid-cols-2 gap-3">
            {/* Market Making */}
            <div className="bg-slate-900 rounded p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{"\u2696\uFE0F"}</span>
                <span className="text-slate-400 text-sm">Market Making</span>
              </div>
              {spreadIncome > 0 ? (
                <>
                  <p className="text-green-400 font-bold">
                    +${spreadIncome.toFixed(2)}/s
                  </p>
                  <p className="text-slate-500 text-xs mt-1">
                    Zarabiasz na spreadzie. Wyzszy zysk podczas zmiennosci.
                  </p>
                </>
              ) : (
                <p className="text-slate-500 text-xs">
                  Kup Market Maker aby zarabiac na spreadzie
                </p>
              )}
            </div>

            {/* Market Influence */}
            <div className="bg-slate-900 rounded p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{"\uD83D\uDC51"}</span>
                <span className="text-slate-400 text-sm">Wplyw na rynek</span>
              </div>
              {financeMarketInfluence > 0 ? (
                <>
                  <p className="text-purple-400 font-bold">
                    {(financeMarketInfluence * 100).toFixed(0)}%
                  </p>
                  <p className="text-slate-500 text-xs mt-1">
                    Mniejsza szansa na krach. Dluzsze hossy.
                  </p>
                </>
              ) : (
                <p className="text-slate-500 text-xs">
                  Kup Wplyw na bank centralny aby kontrolowac rynek
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
