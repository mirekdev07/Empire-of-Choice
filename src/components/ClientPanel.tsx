"use client";

import { useGameStore } from "@/store/useGameStore";
import { InfoTooltip } from "./InfoTooltip";
import { formatMoney } from "@/lib/engine";

// Client type definitions with their properties
const CLIENT_TYPES = [
  {
    id: "f2_client",
    name: "Klienci indywidualni",
    icon: "👤",
    aumPerClient: 500,
    commissionRate: 2.0, // %
    requiredRating: "BBB",
    tier: 2,
  },
  {
    id: "f3_corporate",
    name: "Klienci korporacyjni",
    icon: "🏢",
    aumPerClient: 5000,
    commissionRate: 1.5,
    requiredRating: "A",
    tier: 3,
  },
  {
    id: "f4_pension",
    name: "Fundusze emerytalne",
    icon: "👴",
    aumPerClient: 50000,
    commissionRate: 0.8,
    requiredRating: "AA",
    tier: 4,
  },
  {
    id: "f4_bank",
    name: "Depozyty bankowe",
    icon: "🏦",
    aumPerClient: 10000,
    commissionRate: 0.5,
    requiredRating: "AA",
    tier: 4,
  },
  {
    id: "f5_sovereign",
    name: "Fundusze panstwowe",
    icon: "🌍",
    aumPerClient: 500000,
    commissionRate: 0.3,
    requiredRating: "AAA",
    tier: 5,
  },
];

// Credit rating multipliers for client acquisition
const RATING_CLIENT_MULTIPLIERS: Record<string, number> = {
  AAA: 1.5,
  AA: 1.3,
  A: 1.15,
  BBB: 1.0,
  BB: 0.8,
  B: 0.6,
  CCC: 0.4,
  CC: 0.2,
  C: 0.1,
  D: 0,
};

interface ClientPanelProps {
  pathColor: string;
}

export function ClientPanel({ pathColor }: ClientPanelProps) {
  const buildings = useGameStore((state) => state.buildings);
  const aum = useGameStore((state) => state.aum);
  const creditRating = useGameStore((state) => state.creditRating);
  const currentTier = useGameStore((state) => state.currentTier);

  // Calculate client statistics
  const clientStats = CLIENT_TYPES.map((clientType) => {
    const count = buildings[clientType.id] || 0;
    const totalAum = count * clientType.aumPerClient;
    const isUnlocked = currentTier >= clientType.tier;
    return {
      ...clientType,
      count,
      totalAum,
      isUnlocked,
    };
  });

  // Calculate totals
  const totalClients = clientStats.reduce((sum, c) => sum + c.count, 0);
  const totalClientAum = clientStats.reduce((sum, c) => sum + c.totalAum, 0);
  const ratingMultiplier = RATING_CLIENT_MULTIPLIERS[creditRating] || 1.0;

  // Calculate commission income (annual rate converted to per-second)
  // Commission = AUM * rate% / year, converted to per second
  const annualCommission = clientStats.reduce((sum, c) => {
    return sum + (c.totalAum * c.commissionRate) / 100;
  }, 0);
  const commissionPerSecond = annualCommission / (365 * 24 * 60 * 60);

  // Don't show if no clients unlocked yet
  const hasAnyUnlocked = clientStats.some((c) => c.isUnlocked);
  if (!hasAnyUnlocked) {
    return null;
  }

  return (
    <div className="bg-slate-900 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>👥</span> Panel Klientow
        </h3>
        <InfoTooltip
          title="Panel Klientow"
          content={
            <>
              <p>Zarzadzaj klientami i ich kapitalem.</p>
              <p className="mt-2 text-slate-400">Typy klientow:</p>
              <ul className="list-disc list-inside text-slate-400 mt-1 text-xs">
                <li>Indywidualni - niski AUM, wysoka prowizja</li>
                <li>Korporacyjni - sredni AUM, srednia prowizja</li>
                <li>Emerytalni - wysoki AUM, niska prowizja</li>
                <li>Panstwowi - ogromny AUM, minimalna prowizja</li>
              </ul>
              <p className="mt-2 text-yellow-400 text-xs">
                Wyzszy rating = wieksza zdolnosc pozyskiwania klientow
              </p>
            </>
          }
        />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-800 rounded p-3 text-center">
          <p className="text-slate-400 text-xs">Laczni klienci</p>
          <p className="text-xl font-bold text-white">{totalClients}</p>
        </div>
        <div className="bg-slate-800 rounded p-3 text-center">
          <p className="text-slate-400 text-xs">AUM od klientow</p>
          <p className="text-xl font-bold text-cyan-400">
            ${formatMoney(totalClientAum)}
          </p>
        </div>
        <div className="bg-slate-800 rounded p-3 text-center">
          <p className="text-slate-400 text-xs">Prowizje/rok</p>
          <p className="text-xl font-bold text-green-400">
            ${formatMoney(annualCommission)}
          </p>
        </div>
      </div>

      {/* Rating Impact */}
      <div className="bg-slate-800 rounded p-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm">Rating kredytowy:</span>
            <span
              className="font-bold px-2 py-0.5 rounded"
              style={{ backgroundColor: pathColor }}
            >
              {creditRating}
            </span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 text-xs">Mnoznik pozyskiwania: </span>
            <span
              className={`font-bold ${
                ratingMultiplier >= 1 ? "text-green-400" : "text-red-400"
              }`}
            >
              {(ratingMultiplier * 100).toFixed(0)}%
            </span>
          </div>
        </div>
        {ratingMultiplier < 1 && (
          <p className="text-yellow-400 text-xs mt-2">
            Niski rating - klienci moga odejsc! Popraw rating aby zatrzymac klientow.
          </p>
        )}
      </div>

      {/* Client List */}
      <div className="space-y-2">
        {clientStats.map((client) => (
          <div
            key={client.id}
            className={`bg-slate-800 rounded p-3 ${
              !client.isUnlocked ? "opacity-50" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">{client.icon}</span>
                <span className="text-white font-medium">{client.name}</span>
                {!client.isUnlocked && (
                  <span className="text-xs text-slate-500 bg-slate-700 px-1.5 py-0.5 rounded">
                    Tier {client.tier}
                  </span>
                )}
              </div>
              <span className="text-lg font-bold text-white">
                x{client.count}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-slate-500">AUM/klient:</span>
                <span className="text-cyan-400 ml-1">
                  ${formatMoney(client.aumPerClient)}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Laczny AUM:</span>
                <span className="text-cyan-400 ml-1">
                  ${formatMoney(client.totalAum)}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Prowizja:</span>
                <span className="text-green-400 ml-1">
                  {client.commissionRate}%
                </span>
              </div>
            </div>
            {client.isUnlocked && client.count === 0 && (
              <p className="text-slate-500 text-xs mt-1">
                Wymagany rating: {client.requiredRating}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Commission Info */}
      <div className="mt-4 bg-green-900/30 border border-green-500/30 rounded p-3">
        <div className="flex items-center justify-between">
          <span className="text-green-400 text-sm">Przychod z prowizji:</span>
          <span className="text-green-400 font-bold">
            +${(commissionPerSecond * ratingMultiplier).toFixed(4)}/s
          </span>
        </div>
        <p className="text-slate-400 text-xs mt-1">
          Prowizja pobierana od zarzadzanego kapitalu klientow. Rating wplywa na
          efektywnosc pobierania prowizji.
        </p>
      </div>
    </div>
  );
}
