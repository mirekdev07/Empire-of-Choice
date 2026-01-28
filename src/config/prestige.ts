// Prestige system configuration

export interface PrestigeBonus {
  productionMultiplier: number;  // Multiplier to all production
  startingMoney: number;         // Starting money bonus
  startingFollowers: number;     // Starting followers bonus (Media)
  startingReputation: number;    // Starting reputation bonus
  startingResources: number;     // Starting resources bonus (Industrial)
  startingEfficiency: number;    // Starting efficiency bonus (Industrial)
  startingAum: number;           // Starting AUM bonus (Finance)
  startingRatingBonus: number;   // Starting credit rating bonus (Finance) - levels to add
}

export interface PrestigeState {
  timesPrestiged: number;
  totalLifetimeEarnings: number;
  highestTierReached: number;
  bonuses: PrestigeBonus;
}

// Calculate prestige bonuses based on current state
export function calculatePrestigeReward(
  totalEarnings: number,
  currentTier: number,
  followers: number,
  reputation: number,
  resources?: number,
  efficiency?: number,
  aum?: number,
  crashesSurvived?: number
): { prestigePoints: number; bonuses: PrestigeBonus } {
  // Prestige points based on total earnings and tier
  const earningsBonus = Math.floor(Math.log10(Math.max(1, totalEarnings)) * 10);
  const tierBonus = currentTier * 20;
  const followerBonus = Math.floor(Math.log10(Math.max(1, followers)) * 5);
  const reputationBonus = Math.floor(reputation / 10);
  // Industrial bonuses
  const resourceBonus = resources ? Math.floor(Math.log10(Math.max(1, resources)) * 5) : 0;
  const efficiencyBonus = efficiency ? Math.floor(efficiency / 10) : 0;
  // Finance bonuses
  const aumBonus = aum ? Math.floor(Math.log10(Math.max(1, aum)) * 8) : 0;
  const crashBonus = (crashesSurvived || 0) * 15; // 15 points per survived crash

  const prestigePoints = earningsBonus + tierBonus + followerBonus + reputationBonus + resourceBonus + efficiencyBonus + aumBonus + crashBonus;

  // Calculate actual bonuses from prestige points
  const productionMultiplier = 1 + (prestigePoints * 0.01); // +1% per point
  const startingMoney = 100 + (prestigePoints * 10); // Base 100 + 10 per point
  const startingFollowers = prestigePoints * 5; // 5 followers per point
  const startingReputation = Math.min(50, 10 + Math.floor(prestigePoints / 10)); // Max 50 reputation
  // Industrial bonuses
  const startingResources = prestigePoints * 10; // 10 resources per point
  const startingEfficiency = Math.min(30, Math.floor(prestigePoints / 5)); // Max +30% efficiency bonus
  // Finance bonuses
  const startingAum = prestigePoints * 50; // 50 AUM per point
  const startingRatingBonus = Math.min(3, Math.floor(prestigePoints / 50)); // Max +3 rating levels (BBB -> AA)

  return {
    prestigePoints,
    bonuses: {
      productionMultiplier,
      startingMoney,
      startingFollowers,
      startingReputation,
      startingResources,
      startingEfficiency,
      startingAum,
      startingRatingBonus,
    },
  };
}

// Check if player can prestige (requires Tier 5 and certain conditions)
export function canPrestige(currentTier: number, totalEarnings: number): boolean {
  return currentTier >= 5 && totalEarnings >= 10000000; // 10M total earnings
}

// Get prestige requirements
export function getPrestigeRequirements(): { tier: number; earnings: number } {
  return {
    tier: 5,
    earnings: 10000000,
  };
}
