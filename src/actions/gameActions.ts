"use server";

import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCost, getCostForMultiple, calculateOfflineEarnings } from "@/lib/engine";
import { getBuildingById, PathType, getTierDefinition, getTiersForPath } from "@/config/gamedata";
import { calculatePrestigeReward, canPrestige } from "@/config/prestige";
import { auth } from "@/auth";
import { ActiveContract } from "@/config/contracts";
import { ACHIEVEMENTS, getUnclaimedAchievements, getAchievementsWithStatus, AchievementStats } from "@/config/achievements";

export type GameState = {
  saveId: string;
  saveName: string;
  money: number;
  followers: number;
  resources: number; // Surowce dla Industrial
  reputation: number;
  efficiency: number; // Efektywność dla Industrial (0-150)
  machineCondition: number; // Kondycja maszyn dla Industrial (0-100)
  currentTier: number;
  totalEarnings: number;
  buildings: Record<string, number>;
  path: PathType;
  lastSaveTime: Date;
  // Contract system
  activeContracts: ActiveContract[];
  autoAcceptContracts: boolean;
  autoAcceptMinReward: number;
  completedContractsCount: number;
  completedLongTermCount: number;
  completedCollaborationsCount: number;
  // Finance data
  aum: number; // Assets Under Management
  creditRating: string; // AAA to D
  leverage: number; // 1x to 20x
  marketPhase: string; // bull, stable, correction, bear, crash
  crashesSurvived: number;
  hedgingEnabled: boolean;
  // Prestige data
  timesPrestiged: number;
  totalLifetimeEarnings: number;
  highestTierReached: number;
  prestigeProductionBonus: number;
  prestigeMoneyBonus: number;
  prestigeFollowersBonus: number;
  prestigeReputationBonus: number;
  prestigeAumBonus: number;
  prestigeRatingBonus: number;
  // Offline earnings (0 if no earnings, >0 if earned while away)
  offlineEarnings: number;
  offlineSeconds: number;
};

export type SaveInfo = {
  id: string;
  name: string;
  path: PathType;
  currentTier: number;
  money: number;
  followers: number;
  lastPlayedAt: Date;
  createdAt: Date;
};

// ============ SAVE MANAGEMENT ============

/**
 * Get all saves for the current user
 */
export async function getUserSaves(): Promise<SaveInfo[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const saves = await prisma.gameSave.findMany({
    where: { userId: session.user.id },
    orderBy: { lastPlayedAt: "desc" },
  });

  return saves.map((save: typeof saves[number]) => ({
    id: save.id,
    name: save.name,
    path: save.chosenPath as PathType,
    currentTier: save.currentTier,
    money: save.money,
    followers: save.followers,
    lastPlayedAt: save.lastPlayedAt,
    createdAt: save.createdAt,
  }));
}

/**
 * Create a new game save
 */
export async function createSave(
  path: PathType,
  name?: string
): Promise<{ success: boolean; error?: string; saveId?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Nie jesteś zalogowany" };
  }

  // Check max saves (limit to 5)
  const existingSaves = await prisma.gameSave.count({
    where: { userId: session.user.id },
  });

  if (existingSaves >= 5) {
    return { success: false, error: "Maksymalnie 5 zapisów na konto" };
  }

  const pathNames: Record<PathType, string> = {
    MEDIA: "Media",
    INDUSTRIAL: "Przemysł",
    FINANCE: "Finanse",
  };

  const saveName = name || `${pathNames[path]} #${existingSaves + 1}`;

  // Set starting values based on path
  const isFinance = path === "FINANCE";
  const startingMoney = isFinance ? 200 : 100; // Finance gets more starting money
  const startingAum = isFinance ? 500 : 0; // Finance starts with own savings as AUM

  const save = await prisma.gameSave.create({
    data: {
      userId: session.user.id,
      name: saveName,
      chosenPath: path,
      money: startingMoney,
      aum: startingAum,
    },
  });

  // Set as current save
  await prisma.user.update({
    where: { id: session.user.id },
    data: { currentSaveId: save.id },
  });

  return { success: true, saveId: save.id };
}

/**
 * Select a save to play
 */
export async function selectSave(
  saveId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Nie jesteś zalogowany" };
  }

  // Verify the save belongs to this user
  const save = await prisma.gameSave.findFirst({
    where: { id: saveId, userId: session.user.id },
  });

  if (!save) {
    return { success: false, error: "Zapis nie istnieje" };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: session.user.id },
      data: { currentSaveId: saveId },
    }),
    prisma.gameSave.update({
      where: { id: saveId },
      data: { lastPlayedAt: new Date() },
    }),
  ]);

  return { success: true };
}

/**
 * Delete a save
 */
export async function deleteSave(
  saveId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Nie jesteś zalogowany" };
  }

  // Verify the save belongs to this user
  const save = await prisma.gameSave.findFirst({
    where: { id: saveId, userId: session.user.id },
  });

  if (!save) {
    return { success: false, error: "Zapis nie istnieje" };
  }

  // If this was the current save, clear it
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  await prisma.$transaction([
    prisma.gameSave.delete({
      where: { id: saveId },
    }),
    ...(user?.currentSaveId === saveId
      ? [
          prisma.user.update({
            where: { id: session.user.id },
            data: { currentSaveId: null },
          }),
        ]
      : []),
  ]);

  return { success: true };
}

/**
 * Get current save ID
 */
export async function getCurrentSaveId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { currentSaveId: true },
  });

  return user?.currentSaveId || null;
}

// ============ GAME STATE ============

/**
 * Get current game state from selected save
 * Automatically calculates and applies offline earnings using saved production rate
 */
export async function getGameState(): Promise<GameState | null> {
  // Disable Next.js Data Cache - always fetch fresh data for offline earnings
  noStore();

  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { currentSaveId: true },
  });

  if (!user?.currentSaveId) return null;

  const save = await prisma.gameSave.findUnique({
    where: { id: user.currentSaveId },
  });

  if (!save) return null;

  const buildings = (save.buildings as Record<string, number>) || {};

  // Calculate time difference using lastHeartbeat (NOT lastPlayedAt)
  // lastHeartbeat is only updated during active gameplay, not on page close
  // This prevents the race condition where beforeunload saves right before page load
  const now = new Date();
  const lastHeartbeat = new Date(save.lastHeartbeat);
  const secondsElapsed = Math.floor(Math.abs(now.getTime() - lastHeartbeat.getTime()) / 1000);

  // Ensure lastProductionPerSecond is a number (Prisma may return Decimal)
  const productionRate = Number(save.lastProductionPerSecond) || 0;

  // Debug log for offline earnings calculation
  console.log("[getGameState] Offline check (using heartbeat):", {
    now: now.toISOString(),
    lastHeartbeat: lastHeartbeat.toISOString(),
    secondsElapsed,
    productionRate,
    willCalculate: secondsElapsed > 60 && productionRate > 0,
  });

  let currentMoney = Number(save.money);
  let currentTotalEarnings = Number(save.totalEarnings);
  let offlineEarningsAmount = 0;
  let offlineSecondsAmount = 0;

  // Apply offline earnings if away for more than 60 seconds (increased for safety)
  if (secondsElapsed > 60 && productionRate > 0) {
    // Use saved production rate for reliable offline calculation
    offlineSecondsAmount = Math.min(secondsElapsed, 28800); // Max 8 hours
    offlineEarningsAmount = Math.floor(productionRate * offlineSecondsAmount * 0.20);

    console.log("[getGameState] Calculating offline earnings:", {
      offlineSecondsAmount,
      productionRate,
      offlineEarningsAmount,
    });

    if (offlineEarningsAmount > 0) {
      // Update database with increment and reset heartbeat
      await prisma.gameSave.update({
        where: { id: save.id },
        data: {
          money: { increment: offlineEarningsAmount },
          totalEarnings: { increment: offlineEarningsAmount },
          lastHeartbeat: now, // Reset heartbeat so we don't double-count
        },
      });

      currentMoney += offlineEarningsAmount;
      currentTotalEarnings += offlineEarningsAmount;

      console.log("[getGameState] Offline earnings applied:", {
        offlineEarningsAmount,
        offlineSecondsAmount,
        newMoney: currentMoney,
      });
    }
  }

  return {
    saveId: save.id,
    saveName: save.name,
    money: currentMoney,
    followers: Number(save.followers),
    resources: Number(save.resources),
    reputation: Number(save.reputation),
    efficiency: Number(save.efficiency),
    machineCondition: Number(save.machineCondition),
    currentTier: save.currentTier,
    totalEarnings: currentTotalEarnings,
    buildings,
    path: save.chosenPath as PathType,
    lastSaveTime: new Date(),
    // Contract system
    activeContracts: (save.activeContracts as unknown as ActiveContract[]) || [],
    autoAcceptContracts: save.autoAcceptContracts,
    autoAcceptMinReward: save.autoAcceptMinReward,
    completedContractsCount: save.completedContractsCount,
    completedLongTermCount: save.completedLongTermCount,
    completedCollaborationsCount: save.completedCollaborationsCount,
    // Finance data
    aum: Number(save.aum),
    creditRating: save.creditRating,
    leverage: Number(save.leverage),
    marketPhase: save.marketPhase,
    crashesSurvived: save.crashesSurvived,
    hedgingEnabled: save.hedgingEnabled,
    // Prestige data
    timesPrestiged: save.timesPrestiged,
    totalLifetimeEarnings: Number(save.totalLifetimeEarnings),
    highestTierReached: save.highestTierReached,
    prestigeProductionBonus: Number(save.prestigeProductionBonus),
    prestigeMoneyBonus: Number(save.prestigeMoneyBonus),
    prestigeFollowersBonus: Number(save.prestigeFollowersBonus),
    prestigeReputationBonus: Number(save.prestigeReputationBonus),
    prestigeAumBonus: Number(save.prestigeAumBonus),
    prestigeRatingBonus: Number(save.prestigeRatingBonus),
    // Offline earnings info (for showing modal) - always return number, not undefined
    offlineEarnings: offlineEarningsAmount,
    offlineSeconds: offlineSecondsAmount,
  };
}

/**
 * Helper to get current save with validation
 */
async function getCurrentSave() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { currentSaveId: true },
  });

  if (!user?.currentSaveId) return null;

  return prisma.gameSave.findUnique({
    where: { id: user.currentSaveId },
  });
}

/**
 * Buy a building (supports buying multiple at once)
 * Buildings are stored as JSON for atomic saves
 */
export async function buyBuilding(
  buildingId: string,
  clientMoney?: number,
  amount: number = 1
): Promise<{ success: boolean; error?: string; newMoney?: number; newCount?: number }> {
  const save = await getCurrentSave();
  if (!save) {
    return { success: false, error: "Nie wybrano zapisu gry" };
  }

  const building = getBuildingById(save.chosenPath as PathType, buildingId);
  if (!building) {
    return { success: false, error: "Budynek nie istnieje" };
  }

  // Check if building is unlocked (tier requirement)
  if (building.tier > save.currentTier) {
    return { success: false, error: `Wymaga Tier ${building.tier}` };
  }

  // Buildings are now stored as JSON
  const buildings = (save.buildings as Record<string, number>) || {};
  const currentCount = buildings[buildingId] || 0;

  // Check max building count for current tier
  const tierDef = getTierDefinition(save.currentTier, save.chosenPath as PathType);
  const maxAllowed = tierDef ? tierDef.maxBuildingCount - currentCount : amount;
  const actualAmount = Math.min(amount, maxAllowed);

  if (actualAmount <= 0) {
    return { success: false, error: `Maksymalna ilość dla Tier ${save.currentTier}` };
  }

  // Calculate total cost for all buildings
  const totalCost = getCostForMultiple(building, currentCount, actualAmount);
  const currentMoney = clientMoney ?? save.money;

  if (currentMoney < totalCost) {
    return { success: false, error: "Za mało pieniędzy" };
  }

  const newMoney = currentMoney - totalCost;
  const newCount = currentCount + actualAmount;

  // Update buildings JSON
  const updatedBuildings = { ...buildings, [buildingId]: newCount };

  // Atomic update - money and buildings together
  await prisma.gameSave.update({
    where: { id: save.id },
    data: {
      money: newMoney,
      buildings: updatedBuildings,
      lastPlayedAt: new Date(),
    },
  });

  return { success: true, newMoney, newCount };
}

/**
 * Sync offline earnings (uses saved production rate)
 */
export async function syncOfflineEarnings(): Promise<{
  success: boolean;
  error?: string;
  earnings?: number;
  newMoney?: number;
}> {
  const save = await getCurrentSave();
  if (!save) {
    return { success: false, error: "Nie wybrano zapisu gry" };
  }

  const now = new Date();
  const lastSave = save.lastPlayedAt;
  const secondsElapsed = Math.floor((now.getTime() - lastSave.getTime()) / 1000);

  // Minimum 30 seconds offline to count earnings
  if (secondsElapsed < 30) {
    return { success: true, earnings: 0, newMoney: save.money };
  }

  // Use saved production rate for reliable calculation
  const productionPerSecond = save.lastProductionPerSecond || 0;
  if (productionPerSecond <= 0) {
    return { success: true, earnings: 0, newMoney: save.money };
  }

  // Calculate offline earnings
  const cappedSeconds = Math.min(secondsElapsed, 28800); // Max 8 hours
  const offlineMultiplier = 0.20; // 20% of normal production
  const earnings = Math.floor(productionPerSecond * cappedSeconds * offlineMultiplier);

  const newMoney = save.money + earnings;

  await prisma.gameSave.update({
    where: { id: save.id },
    data: {
      money: newMoney,
      totalEarnings: save.totalEarnings + earnings,
      lastPlayedAt: now,
    },
  });

  return { success: true, earnings, newMoney };
}

/**
 * Save game state - atomic save with JSON buildings
 * @param updateLastPlayedAt - If true, updates lastPlayedAt timestamp
 * @param lastProductionPerSecond - Current production rate for offline earnings
 */
export async function saveGame(
  money: number,
  followers: number,
  totalEarnings: number,
  reputation?: number,
  activeContracts?: ActiveContract[],
  autoAcceptContracts?: boolean,
  autoAcceptMinReward?: number,
  resources?: number,
  efficiency?: number,
  machineCondition?: number,
  completedContractsCount?: number,
  completedLongTermCount?: number,
  completedCollaborationsCount?: number,
  // Finance fields
  aum?: number,
  creditRating?: string,
  leverage?: number,
  marketPhase?: string,
  crashesSurvived?: number,
  hedgingEnabled?: boolean,
  // Control whether to update lastPlayedAt
  updateLastPlayedAt: boolean = false,
  // Buildings as JSON - atomic save
  buildings?: Record<string, number>,
  // Production snapshot for offline earnings
  lastProductionPerSecond?: number
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Nie jesteś zalogowany" };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { currentSaveId: true },
  });

  if (!user?.currentSaveId) {
    return { success: false, error: "Nie wybrano zapisu gry" };
  }

  // Atomic update - everything in one query
  await prisma.gameSave.update({
    where: { id: user.currentSaveId },
    data: {
      money,
      followers,
      totalEarnings,
      ...(reputation !== undefined ? { reputation } : {}),
      ...(activeContracts !== undefined ? { activeContracts: JSON.parse(JSON.stringify(activeContracts)) } : {}),
      ...(autoAcceptContracts !== undefined ? { autoAcceptContracts } : {}),
      ...(autoAcceptMinReward !== undefined ? { autoAcceptMinReward } : {}),
      ...(resources !== undefined ? { resources } : {}),
      ...(efficiency !== undefined ? { efficiency } : {}),
      ...(machineCondition !== undefined ? { machineCondition } : {}),
      ...(completedContractsCount !== undefined ? { completedContractsCount } : {}),
      ...(completedLongTermCount !== undefined ? { completedLongTermCount } : {}),
      ...(completedCollaborationsCount !== undefined ? { completedCollaborationsCount } : {}),
      // Finance fields
      ...(aum !== undefined ? { aum } : {}),
      ...(creditRating !== undefined ? { creditRating } : {}),
      ...(leverage !== undefined ? { leverage } : {}),
      ...(marketPhase !== undefined ? { marketPhase } : {}),
      ...(crashesSurvived !== undefined ? { crashesSurvived } : {}),
      ...(hedgingEnabled !== undefined ? { hedgingEnabled } : {}),
      // Buildings as JSON - no more relation sync needed
      ...(buildings !== undefined ? { buildings } : {}),
      // Production snapshot for offline earnings
      ...(lastProductionPerSecond !== undefined ? { lastProductionPerSecond } : {}),
      // Update lastPlayedAt when requested
      ...(updateLastPlayedAt ? { lastPlayedAt: new Date() } : {}),
      // Always update heartbeat during active gameplay (saveGame is called from GameLoop)
      // This is used for offline earnings calculation
      lastHeartbeat: new Date(),
    },
  });

  return { success: true };
}

/**
 * Update lastPlayedAt timestamp - called when tab becomes hidden or page closes
 */
export async function markLastPlayed(): Promise<{ success: boolean }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { currentSaveId: true },
  });

  if (!user?.currentSaveId) {
    return { success: false };
  }

  await prisma.gameSave.update({
    where: { id: user.currentSaveId },
    data: { lastPlayedAt: new Date() },
  });

  return { success: true };
}

/**
 * Upgrade tier if requirements are met
 */
export async function upgradeTier(): Promise<{
  success: boolean;
  error?: string;
  newTier?: number;
}> {
  const save = await getCurrentSave();
  if (!save) {
    return { success: false, error: "Nie wybrano zapisu gry" };
  }

  if (save.currentTier >= 5) {
    return { success: false, error: "Osiągnąłeś maksymalny tier" };
  }

  const path = save.chosenPath as PathType;
  const tiers = getTiersForPath(path);
  const nextTier = tiers.find((t) => t.id === save.currentTier + 1);
  if (!nextTier) {
    return { success: false, error: "Brak następnego tieru" };
  }

  // Check requirements
  const req = nextTier.requirements;

  if (req.totalEarnings && save.totalEarnings < req.totalEarnings) {
    return { success: false, error: `Potrzebujesz ${req.totalEarnings}$ łącznych zarobków` };
  }

  if (req.followers && save.followers < req.followers) {
    return { success: false, error: `Potrzebujesz ${req.followers} followersów` };
  }

  if (req.reputation && save.reputation < req.reputation) {
    return { success: false, error: `Potrzebujesz ${req.reputation} reputacji` };
  }

  // Buildings are now stored as JSON
  const buildingCounts = (save.buildings as Record<string, number>) || {};

  // Check buildingsAny (at least ONE requirement must be met)
  if (req.buildingsAny && req.buildingsAny.length > 0) {
    const anyMet = req.buildingsAny.some((br) => {
      const count = buildingCounts[br.id] || 0;
      return count >= br.count;
    });
    if (!anyMet) {
      return { success: false, error: "Nie spełniasz wymagań budynków" };
    }
  }

  // Check buildingsAll (ALL requirements must be met)
  if (req.buildingsAll && req.buildingsAll.length > 0) {
    const allMet = req.buildingsAll.every((br) => {
      const count = buildingCounts[br.id] || 0;
      return count >= br.count;
    });
    if (!allMet) {
      return { success: false, error: "Nie spełniasz wszystkich wymagań budynków" };
    }
  }

  await prisma.gameSave.update({
    where: { id: save.id },
    data: { currentTier: save.currentTier + 1 },
  });

  return { success: true, newTier: save.currentTier + 1 };
}

/**
 * Prestige - reset game with bonuses
 */
export async function performPrestige(): Promise<{
  success: boolean;
  error?: string;
  prestigePoints?: number;
  bonuses?: {
    productionMultiplier: number;
    startingMoney: number;
    startingFollowers: number;
    startingReputation: number;
  };
}> {
  const save = await getCurrentSave();
  if (!save) {
    return { success: false, error: "Nie wybrano zapisu gry" };
  }

  // Check if can prestige
  if (!canPrestige(save.currentTier, save.totalEarnings)) {
    return { success: false, error: "Musisz osiągnąć Tier 5 i 10M$ zarobków aby prestige" };
  }

  // Calculate prestige rewards (include path-specific stats)
  const { prestigePoints, bonuses } = calculatePrestigeReward(
    save.totalEarnings,
    save.currentTier,
    save.followers,
    save.reputation,
    save.resources,
    save.efficiency,
    save.aum,
    save.crashesSurvived
  );

  // Combine with existing bonuses
  const newProductionBonus = save.prestigeProductionBonus * bonuses.productionMultiplier;
  const newMoneyBonus = save.prestigeMoneyBonus + bonuses.startingMoney;
  const newFollowersBonus = save.prestigeFollowersBonus + bonuses.startingFollowers;
  const newReputationBonus = Math.min(50, save.prestigeReputationBonus + bonuses.startingReputation);
  // Industrial bonuses
  const newResourcesBonus = (save.prestigeResourcesBonus || 0) + bonuses.startingResources;
  const newEfficiencyBonus = Math.min(30, (save.prestigeEfficiencyBonus || 0) + bonuses.startingEfficiency);
  // Finance bonuses
  const newAumBonus = (save.prestigeAumBonus || 0) + bonuses.startingAum;
  const newRatingBonus = Math.min(3, (save.prestigeRatingBonus || 0) + bonuses.startingRatingBonus);

  // Determine starting values based on path
  const isIndustrial = save.chosenPath === "INDUSTRIAL";
  const isFinance = save.chosenPath === "FINANCE";
  const startingResources = isIndustrial ? 50 + newResourcesBonus : 50;
  const startingEfficiency = isIndustrial ? 100 + newEfficiencyBonus : 100;
  const startingAum = isFinance ? 500 + newAumBonus : 0; // Base 500 + prestige bonus
  // Calculate starting credit rating from bonus (BBB=6 is base, max AAA=9)
  const CREDIT_RATINGS_LIST = ["D", "C", "CC", "CCC", "B", "BB", "BBB", "A", "AA", "AAA"];
  const startingRatingIndex = isFinance ? Math.min(9, 6 + newRatingBonus) : 6;
  const startingCreditRating = CREDIT_RATINGS_LIST[startingRatingIndex];

  // Update lifetime stats and reset game (buildings are now JSON, reset in same query)
  await prisma.gameSave.update({
    where: { id: save.id },
    data: {
      money: 100 + newMoneyBonus,
      followers: newFollowersBonus,
      resources: startingResources,
      efficiency: startingEfficiency,
      machineCondition: 100,
      reputation: 10 + newReputationBonus,
      currentTier: 1,
      totalEarnings: 0,
      buildings: {}, // Reset buildings - they're now JSON
      lastProductionPerSecond: 0, // Reset production snapshot
      timesPrestiged: save.timesPrestiged + 1,
      totalLifetimeEarnings: save.totalLifetimeEarnings + save.totalEarnings,
      highestTierReached: Math.max(save.highestTierReached, save.currentTier),
      prestigeProductionBonus: newProductionBonus,
      prestigeMoneyBonus: newMoneyBonus,
      prestigeFollowersBonus: newFollowersBonus,
      prestigeReputationBonus: newReputationBonus,
      prestigeResourcesBonus: newResourcesBonus,
      prestigeEfficiencyBonus: newEfficiencyBonus,
      // Finance prestige bonuses
      prestigeAumBonus: newAumBonus,
      prestigeRatingBonus: newRatingBonus,
      // Reset Finance state
      aum: startingAum,
      creditRating: startingCreditRating,
      leverage: 1,
      marketPhase: "stable",
      crashesSurvived: 0,
      hedgingEnabled: false,
      activeContracts: [],
      completedContractsCount: 0,
      completedLongTermCount: 0,
      completedCollaborationsCount: 0,
      lastPlayedAt: new Date(),
    },
  });

  return {
    success: true,
    prestigePoints,
    bonuses: {
      productionMultiplier: newProductionBonus,
      startingMoney: 100 + newMoneyBonus,
      startingFollowers: newFollowersBonus,
      startingReputation: 10 + newReputationBonus,
    },
  };
}

/**
 * Get prestige preview - what rewards would player get
 */
export async function getPrestigePreview(): Promise<{
  canPrestige: boolean;
  prestigePoints: number;
  path: PathType;
  bonuses: {
    productionMultiplier: number;
    startingMoney: number;
    startingFollowers: number;
    startingReputation: number;
    startingResources: number;
    startingEfficiency: number;
    startingAum: number;
    startingRatingBonus: number;
  };
  currentBonuses: {
    productionMultiplier: number;
    startingMoney: number;
    startingFollowers: number;
    startingReputation: number;
    startingResources: number;
    startingEfficiency: number;
    startingAum: number;
    startingRatingBonus: number;
  };
} | null> {
  const save = await getCurrentSave();
  if (!save) return null;

  const { prestigePoints, bonuses } = calculatePrestigeReward(
    save.totalEarnings,
    save.currentTier,
    save.followers,
    save.reputation,
    save.resources,
    save.efficiency,
    save.aum,
    save.crashesSurvived
  );

  return {
    canPrestige: canPrestige(save.currentTier, save.totalEarnings),
    prestigePoints,
    path: save.chosenPath as PathType,
    bonuses,
    currentBonuses: {
      productionMultiplier: save.prestigeProductionBonus,
      startingMoney: save.prestigeMoneyBonus,
      startingFollowers: save.prestigeFollowersBonus,
      startingReputation: save.prestigeReputationBonus,
      startingResources: save.prestigeResourcesBonus || 0,
      startingEfficiency: save.prestigeEfficiencyBonus || 0,
      startingAum: save.prestigeAumBonus || 0,
      startingRatingBonus: save.prestigeRatingBonus || 0,
    },
  };
}

// ============ LEADERBOARD ============

export type LeaderboardEntry = {
  rank: number;
  playerName: string;
  score: number;
  tier: number;
  timesPrestiged: number;
  mainStat: number; // followers for Media, efficiency for Industrial, AUM for Finance
  mainStatLabel: string;
};

export type LeaderboardData = {
  media: LeaderboardEntry[];
  industrial: LeaderboardEntry[];
  finance: LeaderboardEntry[];
};

/**
 * Calculate score for a game save based on its path
 */
function calculateScore(save: {
  chosenPath: string;
  totalLifetimeEarnings: number;
  totalEarnings: number;
  currentTier: number;
  timesPrestiged: number;
  followers: number;
  reputation: number;
  efficiency: number;
  resources: number;
  aum: number;
  crashesSurvived: number;
  creditRating: string;
}): number {
  const lifetimeEarnings = save.totalLifetimeEarnings + save.totalEarnings;
  const tierBonus = save.currentTier * 1000;
  const prestigeBonus = save.timesPrestiged * 5000;

  switch (save.chosenPath) {
    case "MEDIA":
      // Media: followers are key, reputation matters
      return Math.floor(
        lifetimeEarnings * 0.001 +
        save.followers * 10 +
        save.reputation * 100 +
        tierBonus +
        prestigeBonus
      );
    case "INDUSTRIAL":
      // Industrial: efficiency and resources matter
      return Math.floor(
        lifetimeEarnings * 0.001 +
        save.efficiency * 50 +
        save.resources * 5 +
        tierBonus +
        prestigeBonus
      );
    case "FINANCE":
      // Finance: AUM and surviving crashes matter
      const ratingBonus = ["D", "C", "CC", "CCC", "B", "BB", "BBB", "A", "AA", "AAA"]
        .indexOf(save.creditRating) * 200;
      return Math.floor(
        lifetimeEarnings * 0.001 +
        save.aum * 0.1 +
        save.crashesSurvived * 1000 +
        ratingBonus +
        tierBonus +
        prestigeBonus
      );
    default:
      return 0;
  }
}

/**
 * Get leaderboard for all paths
 */
export async function getLeaderboard(): Promise<LeaderboardData> {
  // Get best save per user per path
  const allSaves = await prisma.gameSave.findMany({
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
  });

  // Group by path and calculate scores
  const mediaScores: Map<string, { save: typeof allSaves[number]; score: number }> = new Map();
  const industrialScores: Map<string, { save: typeof allSaves[number]; score: number }> = new Map();
  const financeScores: Map<string, { save: typeof allSaves[number]; score: number }> = new Map();

  for (const save of allSaves) {
    const score = calculateScore(save);
    const userId = save.userId;

    const targetMap =
      save.chosenPath === "MEDIA" ? mediaScores :
      save.chosenPath === "INDUSTRIAL" ? industrialScores :
      save.chosenPath === "FINANCE" ? financeScores : null;

    if (targetMap) {
      const existing = targetMap.get(userId);
      if (!existing || existing.score < score) {
        targetMap.set(userId, { save, score });
      }
    }
  }

  // Convert to sorted arrays
  const formatLeaderboard = (
    scores: Map<string, { save: typeof allSaves[number]; score: number }>,
    path: PathType
  ): LeaderboardEntry[] => {
    const entries = Array.from(scores.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 100) // Top 100
      .map((entry, index) => {
        const playerName = entry.save.user.name || entry.save.user.email.split("@")[0];
        let mainStat: number;
        let mainStatLabel: string;

        switch (path) {
          case "MEDIA":
            mainStat = entry.save.followers;
            mainStatLabel = "Followers";
            break;
          case "INDUSTRIAL":
            mainStat = entry.save.efficiency;
            mainStatLabel = "Efektywnosc";
            break;
          case "FINANCE":
            mainStat = entry.save.aum;
            mainStatLabel = "AUM";
            break;
          default:
            mainStat = 0;
            mainStatLabel = "";
        }

        return {
          rank: index + 1,
          playerName,
          score: entry.score,
          tier: entry.save.currentTier,
          timesPrestiged: entry.save.timesPrestiged,
          mainStat,
          mainStatLabel,
        };
      });

    return entries;
  };

  return {
    media: formatLeaderboard(mediaScores, "MEDIA"),
    industrial: formatLeaderboard(industrialScores, "INDUSTRIAL"),
    finance: formatLeaderboard(financeScores, "FINANCE"),
  };
}

// ============ ACHIEVEMENTS ============

export type AchievementInfo = {
  id: string;
  name: string;
  description: string;
  reward: number;
  icon: string;
  category: string;
  unlocked: boolean;
  claimed: boolean;
};

/**
 * Get achievements for current save
 */
export async function getAchievements(): Promise<{
  achievements: AchievementInfo[];
  unclaimedCount: number;
} | null> {
  const save = await getCurrentSave();
  if (!save) return null;

  // Calculate total building count (buildings are now JSON)
  const buildings = (save.buildings as Record<string, number>) || {};
  let buildingCount = 0;
  for (const count of Object.values(buildings)) {
    buildingCount += count;
  }

  const stats: AchievementStats = {
    totalEarnings: save.totalEarnings,
    totalLifetimeEarnings: save.totalLifetimeEarnings,
    followers: save.followers,
    reputation: save.reputation,
    currentTier: save.currentTier,
    timesPrestiged: save.timesPrestiged,
    completedContractsCount: save.completedContractsCount,
    completedLongTermCount: save.completedLongTermCount,
    completedCollaborationsCount: save.completedCollaborationsCount,
    resources: save.resources,
    efficiency: save.efficiency,
    aum: save.aum,
    crashesSurvived: save.crashesSurvived,
    creditRating: save.creditRating,
    buildingCount,
    path: save.chosenPath as PathType,
  };

  const claimedIds = (save.claimedAchievements as string[]) || [];
  const achievementsWithStatus = getAchievementsWithStatus(stats, claimedIds);
  const unclaimed = getUnclaimedAchievements(stats, claimedIds);

  return {
    achievements: achievementsWithStatus.map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
      reward: a.reward,
      icon: a.icon,
      category: a.category,
      unlocked: a.unlocked,
      claimed: a.claimed,
    })),
    unclaimedCount: unclaimed.length,
  };
}

/**
 * Get just the unclaimed count (for sidebar badge)
 */
export async function getUnclaimedAchievementsCount(): Promise<number> {
  const save = await getCurrentSave();
  if (!save) return 0;

  const buildingsJson = (save.buildings as Record<string, number>) || {};
  let buildingCount = 0;
  for (const count of Object.values(buildingsJson)) {
    buildingCount += count;
  }

  const stats: AchievementStats = {
    totalEarnings: save.totalEarnings,
    totalLifetimeEarnings: save.totalLifetimeEarnings,
    followers: save.followers,
    reputation: save.reputation,
    currentTier: save.currentTier,
    timesPrestiged: save.timesPrestiged,
    completedContractsCount: save.completedContractsCount,
    completedLongTermCount: save.completedLongTermCount,
    completedCollaborationsCount: save.completedCollaborationsCount,
    resources: save.resources,
    efficiency: save.efficiency,
    aum: save.aum,
    crashesSurvived: save.crashesSurvived,
    creditRating: save.creditRating,
    buildingCount,
    path: save.chosenPath as PathType,
  };

  const claimedIds = (save.claimedAchievements as string[]) || [];
  const unclaimed = getUnclaimedAchievements(stats, claimedIds);

  return unclaimed.length;
}

/**
 * Claim an achievement reward
 */
export async function claimAchievement(
  achievementId: string
): Promise<{ success: boolean; error?: string; reward?: number; newMoney?: number }> {
  const save = await getCurrentSave();
  if (!save) {
    return { success: false, error: "Nie wybrano zapisu gry" };
  }

  // Find the achievement
  const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
  if (!achievement) {
    return { success: false, error: "Osiągnięcie nie istnieje" };
  }

  // Check if already claimed
  const claimedIds = (save.claimedAchievements as string[]) || [];
  if (claimedIds.includes(achievementId)) {
    return { success: false, error: "Osiągnięcie już odebrane" };
  }

  // Verify the achievement is unlocked
  const buildingsJson = (save.buildings as Record<string, number>) || {};
  let buildingCount = 0;
  for (const count of Object.values(buildingsJson)) {
    buildingCount += count;
  }

  const stats: AchievementStats = {
    totalEarnings: save.totalEarnings,
    totalLifetimeEarnings: save.totalLifetimeEarnings,
    followers: save.followers,
    reputation: save.reputation,
    currentTier: save.currentTier,
    timesPrestiged: save.timesPrestiged,
    completedContractsCount: save.completedContractsCount,
    completedLongTermCount: save.completedLongTermCount,
    completedCollaborationsCount: save.completedCollaborationsCount,
    resources: save.resources,
    efficiency: save.efficiency,
    aum: save.aum,
    crashesSurvived: save.crashesSurvived,
    creditRating: save.creditRating,
    buildingCount,
    path: save.chosenPath as PathType,
  };

  if (!achievement.condition(stats)) {
    return { success: false, error: "Osiągnięcie nie jest odblokowane" };
  }

  // Claim the achievement
  const newClaimedIds = [...claimedIds, achievementId];
  const newMoney = save.money + achievement.reward;

  await prisma.gameSave.update({
    where: { id: save.id },
    data: {
      claimedAchievements: newClaimedIds,
      money: newMoney,
      lastPlayedAt: new Date(),
    },
  });

  return { success: true, reward: achievement.reward, newMoney };
}

/**
 * Claim all available achievements at once
 */
export async function claimAllAchievements(): Promise<{
  success: boolean;
  error?: string;
  totalReward?: number;
  newMoney?: number;
  claimedCount?: number;
}> {
  const save = await getCurrentSave();
  if (!save) {
    return { success: false, error: "Nie wybrano zapisu gry" };
  }

  const buildingsJson = (save.buildings as Record<string, number>) || {};
  let buildingCount = 0;
  for (const count of Object.values(buildingsJson)) {
    buildingCount += count;
  }

  const stats: AchievementStats = {
    totalEarnings: save.totalEarnings,
    totalLifetimeEarnings: save.totalLifetimeEarnings,
    followers: save.followers,
    reputation: save.reputation,
    currentTier: save.currentTier,
    timesPrestiged: save.timesPrestiged,
    completedContractsCount: save.completedContractsCount,
    completedLongTermCount: save.completedLongTermCount,
    completedCollaborationsCount: save.completedCollaborationsCount,
    resources: save.resources,
    efficiency: save.efficiency,
    aum: save.aum,
    crashesSurvived: save.crashesSurvived,
    creditRating: save.creditRating,
    buildingCount,
    path: save.chosenPath as PathType,
  };

  const claimedIds = (save.claimedAchievements as string[]) || [];
  const unclaimed = getUnclaimedAchievements(stats, claimedIds);

  if (unclaimed.length === 0) {
    return { success: false, error: "Brak osiągnięć do odebrania" };
  }

  const totalReward = unclaimed.reduce((sum, a) => sum + a.reward, 0);
  const newClaimedIds = [...claimedIds, ...unclaimed.map((a) => a.id)];
  const newMoney = save.money + totalReward;

  await prisma.gameSave.update({
    where: { id: save.id },
    data: {
      claimedAchievements: newClaimedIds,
      money: newMoney,
      lastPlayedAt: new Date(),
    },
  });

  return { success: true, totalReward, newMoney, claimedCount: unclaimed.length };
}
