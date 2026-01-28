import { getBuildingById, PathType, BuildingDefinition } from "@/config/gamedata";

/**
 * Calculate the cost of buying a building at a given count
 * Formula: baseCost * multiplier^count
 */
export function getCost(building: BuildingDefinition, currentCount: number): number {
  return Math.floor(building.baseCost * Math.pow(building.costMultiplier, currentCount));
}

/**
 * Calculate total cost for buying multiple buildings
 */
export function getCostForMultiple(building: BuildingDefinition, currentCount: number, amount: number): number {
  let total = 0;
  for (let i = 0; i < amount; i++) {
    total += getCost(building, currentCount + i);
  }
  return total;
}

/**
 * Calculate max affordable buildings with current money
 */
export function getMaxAffordable(building: BuildingDefinition, currentCount: number, money: number, maxCount: number): number {
  let affordable = 0;
  let totalCost = 0;
  const maxPossible = maxCount - currentCount;

  for (let i = 0; i < maxPossible; i++) {
    const cost = getCost(building, currentCount + i);
    if (totalCost + cost > money) break;
    totalCost += cost;
    affordable++;
  }

  return affordable;
}

/**
 * Calculate the production per second from a building
 * Formula: baseProd * count
 */
export function getProduction(building: BuildingDefinition, count: number): number {
  return building.baseProduction * count;
}

/**
 * Calculate total production per second from all buildings
 */
export function getTotalProduction(
  path: PathType,
  buildingCounts: Record<string, number>,
  multiplier: number = 1
): number {
  let total = 0;
  for (const [buildingId, count] of Object.entries(buildingCounts)) {
    const building = getBuildingById(path, buildingId);
    if (building) {
      total += getProduction(building, count);
    }
  }
  return total * multiplier;
}

/**
 * Calculate offline earnings based on time elapsed
 * Offline earnings are reduced to 20% of normal production
 */
export function calculateOfflineEarnings(
  path: PathType,
  buildingCounts: Record<string, number>,
  secondsElapsed: number,
  multiplier: number = 1
): number {
  const productionPerSecond = getTotalProduction(path, buildingCounts, multiplier);
  // Cap offline earnings at 8 hours (28800 seconds)
  const cappedSeconds = Math.min(secondsElapsed, 28800);
  // Offline penalty: only 20% of normal production
  const offlineMultiplier = 0.20;
  return Math.floor(productionPerSecond * cappedSeconds * offlineMultiplier);
}

/**
 * Format money for display (e.g., 1,234,567 or 1.23M)
 */
export function formatMoney(amount: number): string {
  if (amount >= 1_000_000_000_000) {
    return (amount / 1_000_000_000_000).toFixed(2) + "T";
  }
  if (amount >= 1_000_000_000) {
    return (amount / 1_000_000_000).toFixed(2) + "B";
  }
  if (amount >= 1_000_000) {
    return (amount / 1_000_000).toFixed(2) + "M";
  }
  if (amount >= 1_000) {
    return (amount / 1_000).toFixed(2) + "K";
  }
  return amount.toFixed(2);
}

/**
 * Format production rate for display
 */
export function formatProduction(perSecond: number): string {
  if (perSecond < 0.01) {
    return "0.00";
  }
  return formatMoney(perSecond) + "/s";
}

/**
 * Calculate time to afford a building
 */
export function timeToAfford(
  cost: number,
  currentMoney: number,
  productionPerSecond: number
): number | null {
  if (currentMoney >= cost) return 0;
  if (productionPerSecond <= 0) return null;
  return Math.ceil((cost - currentMoney) / productionPerSecond);
}

/**
 * Format time duration for display
 */
export function formatTime(seconds: number | null): string {
  if (seconds === null) return "Never";
  if (seconds === 0) return "Now";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}

/**
 * Media path: Calculate content decay multiplier
 * Decays by 1% every 30 seconds from 100% down to 10% minimum
 */
export function calculateContentDecayMultiplier(
  lastContentPostTime: number,
  currentTime: number
): number {
  const elapsed = (currentTime - lastContentPostTime) / 1000; // in seconds
  const decayIntervals = Math.floor(elapsed / 30); // 30 seconds per decay
  const decayFactor = Math.pow(0.99, decayIntervals); // 1% decay per interval
  return Math.max(0.1, decayFactor); // Minimum 10% multiplier
}

/**
 * Finance path: Generate random market multiplier
 * Returns a value between 0.5 and 2.0
 */
export function generateMarketMultiplier(): number {
  // Use a weighted random to make extreme values less common
  const random = Math.random();
  // Gaussian-like distribution centered around 1.0
  const base = 1.0;
  const variance = 0.5;
  const multiplier = base + (random - 0.5) * 2 * variance + (Math.random() - 0.5) * variance;
  return Math.max(0.5, Math.min(2.0, multiplier));
}
