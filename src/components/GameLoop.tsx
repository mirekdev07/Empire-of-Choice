"use client";

import { useEffect, useRef } from "react";
import { useGameStore } from "@/store/useGameStore";
import { saveGame, markLastPlayed } from "@/actions/gameActions";

const SAVE_INTERVAL = 30000; // Save every 30 seconds

export function GameLoop() {
  const lastTimeRef = useRef<number>(performance.now());
  const lastSaveRef = useRef<number>(Date.now());

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

      // Auto-save (without updating lastPlayedAt - that's only for offline tracking)
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
          // Don't update lastPlayedAt during regular autosaves
          false
        );
        lastSaveRef.current = Date.now();
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    // Save and update lastPlayedAt when tab becomes hidden (for offline earnings)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        const state = useGameStore.getState();
        // Save game and mark the time for offline earnings calculation
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
          // Update lastPlayedAt when tab becomes hidden
          true
        );
        lastSaveRef.current = Date.now();
      }
    };

    // Save and update lastPlayedAt on page unload
    const handleBeforeUnload = () => {
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
        // Update lastPlayedAt when page closes
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
