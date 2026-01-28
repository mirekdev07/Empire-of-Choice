"use client";

import { useEffect, useRef } from "react";
import { useGameStore } from "@/store/useGameStore";
import { saveGame } from "@/actions/gameActions";

const SAVE_INTERVAL = 15000; // Save every 15 seconds (reduced from 30s)

// Helper to get save payload from store state
function getSavePayload() {
  const state = useGameStore.getState();
  return {
    money: state.money,
    followers: state.followers,
    totalEarnings: state.totalEarnings,
    reputation: state.reputation,
    resources: state.resources,
    efficiency: state.efficiency,
    machineCondition: state.machineCondition,
    buildings: state.buildings,
    lastProductionPerSecond: state.moneyPerSecond, // Snapshot for offline earnings
    // Finance fields
    aum: state.aum,
    creditRating: state.creditRating,
    leverage: state.leverage,
    marketPhase: state.marketPhase,
    crashesSurvived: state.crashesSurvived,
    hedgingEnabled: state.hedgingEnabled,
    // Contract fields
    activeContracts: state.activeContracts,
    autoAcceptContracts: state.autoAcceptContracts,
    autoAcceptMinReward: state.autoAcceptMinReward,
    completedContractsCount: state.completedContractsCount,
    completedLongTermCount: state.completedLongTermCount,
    completedCollaborationsCount: state.completedCollaborationsCount,
  };
}

export function GameLoop() {
  const lastTimeRef = useRef<number>(performance.now());
  const lastSaveRef = useRef<number>(Date.now());
  const isTabHiddenRef = useRef<boolean>(false);

  const tick = useGameStore((state) => state.tick);
  const isLoaded = useGameStore((state) => state.isLoaded);

  useEffect(() => {
    if (!isLoaded) return;

    let animationFrameId: number;

    const gameLoop = (currentTime: number) => {
      const deltaTime = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      // Cap delta time to prevent huge jumps
      const cappedDelta = Math.min(deltaTime, 0.1);

      // Update game state
      tick(cappedDelta);

      // Auto-save every SAVE_INTERVAL
      if (Date.now() - lastSaveRef.current > SAVE_INTERVAL) {
        const state = useGameStore.getState();
        saveGame(
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
          state.aum,
          state.creditRating,
          state.leverage,
          state.marketPhase,
          state.crashesSurvived,
          state.hedgingEnabled,
          true, // updateLastPlayedAt
          state.buildings,
          state.moneyPerSecond // lastProductionPerSecond
        );
        lastSaveRef.current = Date.now();
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    // Save when tab becomes hidden
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isTabHiddenRef.current = true;
        const state = useGameStore.getState();
        saveGame(
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
          state.aum,
          state.creditRating,
          state.leverage,
          state.marketPhase,
          state.crashesSurvived,
          state.hedgingEnabled,
          true,
          state.buildings,
          state.moneyPerSecond
        );
        lastSaveRef.current = Date.now();
      } else {
        isTabHiddenRef.current = false;
      }
    };

    // Use fetch with keepalive for reliable save on page close
    const handleBeforeUnload = () => {
      const payload = getSavePayload();

      // Use fetch with keepalive - browser will complete this request even after page closes
      fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true, // Critical: ensures request completes after page close
      }).catch(() => {
        // Ignore errors - page is closing anyway
      });
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      cancelAnimationFrame(animationFrameId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isLoaded, tick]);

  return null;
}
