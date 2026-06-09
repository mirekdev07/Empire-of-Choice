"use client";

import { useGameStore } from "@/store/useGameStore";
import { useEffect, useState } from "react";
import { formatMoney } from "@/lib/engine";
import { useTranslations } from "next-intl";

export function EventNotification({ pathColor }: { pathColor: string }) {
  const t = useTranslations("eventNotification");
  const activeEvents = useGameStore((state) => state.activeEvents);
  const eventHistory = useGameStore((state) => state.eventHistory);
  const dismissEvent = useGameStore((state) => state.dismissEvent);

  const [showLatestEvent, setShowLatestEvent] = useState(false);
  const [latestEventTime, setLatestEventTime] = useState(0);

  // Show notification for new events
  useEffect(() => {
    if (eventHistory.length > 0) {
      const latest = eventHistory[eventHistory.length - 1];
      if (latest.time > latestEventTime) {
        setLatestEventTime(latest.time);
        setShowLatestEvent(true);
        // Auto-hide after 5 seconds
        const timer = setTimeout(() => setShowLatestEvent(false), 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [eventHistory, latestEventTime]);

  const latestEvent = eventHistory.length > 0 ? eventHistory[eventHistory.length - 1] : null;

  // Calculate remaining time for active events
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => forceUpdate((n) => n + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* New event popup */}
      {showLatestEvent && latestEvent && (
        <div
          className={`fixed top-16 md:top-4 left-4 right-4 md:left-auto md:right-4 z-50 p-3 md:p-4 rounded-lg shadow-lg border max-w-full md:max-w-sm animate-in slide-in-from-top md:slide-in-from-right ${
            latestEvent.event.isPositive
              ? "bg-green-900/90 border-green-500"
              : "bg-red-900/90 border-red-500"
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">
                  {latestEvent.event.isPositive ? "✨" : "⚠️"}
                </span>
                <h3 className={`font-bold ${latestEvent.event.isPositive ? "text-green-400" : "text-red-400"}`}>
                  {latestEvent.event.name}
                </h3>
              </div>
              <p className="text-sm text-slate-300">{latestEvent.event.description}</p>

              {/* Show effects */}
              <div className="mt-2 text-xs space-y-1">
                {latestEvent.event.effects.money && (
                  <p className={latestEvent.event.effects.money > 0 ? "text-green-400" : "text-red-400"}>
                    {latestEvent.event.effects.money > 0 ? "+" : ""}${formatMoney(latestEvent.event.effects.money)}
                  </p>
                )}
                {latestEvent.event.effects.followers && (
                  <p className={latestEvent.event.effects.followers > 0 ? "text-purple-400" : "text-red-400"}>
                    {latestEvent.event.effects.followers > 0 ? "+" : ""}{latestEvent.event.effects.followers} {t("followers")}
                  </p>
                )}
                {latestEvent.event.effects.followersPercent && (
                  <p className={latestEvent.event.effects.followersPercent > 0 ? "text-purple-400" : "text-red-400"}>
                    {latestEvent.event.effects.followersPercent > 0 ? "+" : ""}{latestEvent.event.effects.followersPercent}% {t("followers")}
                  </p>
                )}
                {latestEvent.event.effects.reputation && (
                  <p className={latestEvent.event.effects.reputation > 0 ? "text-yellow-400" : "text-red-400"}>
                    {latestEvent.event.effects.reputation > 0 ? "+" : ""}{latestEvent.event.effects.reputation} {t("reputation")}
                  </p>
                )}
                {latestEvent.event.effects.productionMultiplier && (
                  <p className={latestEvent.event.effects.productionMultiplier > 1 ? "text-blue-400" : "text-red-400"}>
                    x{latestEvent.event.effects.productionMultiplier} {t("production")}
                    {latestEvent.event.duration && ` ${t("forDuration", { minutes: Math.round(latestEvent.event.duration / 60) })}`}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowLatestEvent(false)}
              className="text-slate-400 hover:text-white ml-2"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Active events bar */}
      {activeEvents.length > 0 && (
        <div className="bg-slate-800 rounded-lg p-3 border border-slate-700 mb-4">
          <h3 className="text-sm font-semibold text-slate-400 mb-2">{t("activeEffects")}</h3>
          <div className="flex flex-wrap gap-2">
            {activeEvents.map((ae) => {
              const timeLeft = ae.endTime ? Math.max(0, Math.ceil((ae.endTime - Date.now()) / 1000)) : 0;
              const minutes = Math.floor(timeLeft / 60);
              const seconds = timeLeft % 60;

              return (
                <div
                  key={ae.event.id + ae.startTime}
                  className={`px-3 py-1 rounded-full text-xs flex items-center gap-2 ${
                    ae.event.isPositive
                      ? "bg-green-900/50 text-green-400 border border-green-700"
                      : "bg-red-900/50 text-red-400 border border-red-700"
                  }`}
                >
                  <span>{ae.event.isPositive ? "✨" : "⚠️"}</span>
                  <span>{ae.event.name}</span>
                  {ae.event.effects.productionMultiplier && (
                    <span className="font-mono">x{ae.event.effects.productionMultiplier}</span>
                  )}
                  {timeLeft > 0 && (
                    <span className="font-mono bg-slate-800 px-1 rounded">
                      {minutes}:{seconds.toString().padStart(2, "0")}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
