"use client";

import { useEffect, useRef } from "react";
import { useGameStore } from "@/store/useGameStore";
import { saveGame } from "@/actions/gameActions";

const SAVE_INTERVAL = 30000; // Save every 30 seconds

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

      // Auto-save - always update lastPlayedAt so offline earnings work on browser close
      // This means max 30 seconds of "missed" offline time
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
          // Finance fields
          state.aum,
          state.creditRating,
          state.leverage,
          state.marketPhase,
          state.crashesSurvived,
          state.hedgingEnabled,
          // Always update lastPlayedAt during autosaves for reliable offline tracking
          true
        );
        lastSaveRef.current = Date.now();
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    // Track when tab becomes hidden for offline earnings calculation
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isTabHiddenRef.current = true;
        // Immediately save when tab becomes hidden
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
          // Finance fields
          state.aum,
          state.creditRating,
          state.leverage,
          state.marketPhase,
          state.crashesSurvived,
          state.hedgingEnabled,
          true
        );
        lastSaveRef.current = Date.now();
      } else {
        isTabHiddenRef.current = false;
      }
    };

    // Use sendBeacon for reliable save on page close
    const handleBeforeUnload = () => {
      const state = useGameStore.getState();
      // Try regular save first
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
        // Finance fields
        state.aum,
        state.creditRating,
        state.leverage,
        state.marketPhase,
        state.crashesSurvived,
        state.hedgingEnabled,
        true
      );
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
