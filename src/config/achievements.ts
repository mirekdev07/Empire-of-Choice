import { PathType } from "./gamedata";

export type Achievement = {
  id: string;
  name: string;
  description: string;
  reward: number;
  icon: string;
  category: "earnings" | "followers" | "tier" | "prestige" | "contracts" | "resources" | "finance" | "special";
  path?: PathType; // If undefined, available for all paths
  condition: (stats: AchievementStats) => boolean;
};

export type AchievementStats = {
  totalEarnings: number;
  totalLifetimeEarnings: number;
  followers: number;
  reputation: number;
  currentTier: number;
  timesPrestiged: number;
  completedContractsCount: number;
  completedLongTermCount: number;
  completedCollaborationsCount: number;
  resources: number;
  efficiency: number;
  aum: number;
  crashesSurvived: number;
  creditRating: string;
  buildingCount: number;
  path: PathType;
};

// Helper to get credit rating as number
function ratingToNumber(rating: string): number {
  const ratings = ["D", "C", "CC", "CCC", "B", "BB", "BBB", "A", "AA", "AAA"];
  return ratings.indexOf(rating);
}

export const ACHIEVEMENTS: Achievement[] = [
  // ==================== EARNINGS ====================
  {
    id: "earnings_100",
    name: "Pierwsze kroki",
    description: "Zarób łącznie 100$",
    reward: 50,
    icon: "💵",
    category: "earnings",
    condition: (s) => s.totalEarnings >= 100,
  },
  {
    id: "earnings_1k",
    name: "Tysiącznik",
    description: "Zarób łącznie 1,000$",
    reward: 200,
    icon: "💰",
    category: "earnings",
    condition: (s) => s.totalEarnings >= 1_000,
  },
  {
    id: "earnings_10k",
    name: "Solidne podstawy",
    description: "Zarób łącznie 10,000$",
    reward: 500,
    icon: "💰",
    category: "earnings",
    condition: (s) => s.totalEarnings >= 10_000,
  },
  {
    id: "earnings_100k",
    name: "Bogacz",
    description: "Zarób łącznie 100,000$",
    reward: 2_000,
    icon: "🤑",
    category: "earnings",
    condition: (s) => s.totalEarnings >= 100_000,
  },
  {
    id: "earnings_1m",
    name: "Milioner",
    description: "Zarób łącznie 1,000,000$",
    reward: 10_000,
    icon: "💎",
    category: "earnings",
    condition: (s) => s.totalEarnings >= 1_000_000,
  },
  {
    id: "earnings_10m",
    name: "Multi-milioner",
    description: "Zarób łącznie 10,000,000$",
    reward: 50_000,
    icon: "💎",
    category: "earnings",
    condition: (s) => s.totalEarnings >= 10_000_000,
  },
  {
    id: "earnings_100m",
    name: "Magnata",
    description: "Zarób łącznie 100,000,000$",
    reward: 200_000,
    icon: "👑",
    category: "earnings",
    condition: (s) => s.totalEarnings >= 100_000_000,
  },
  {
    id: "earnings_1b",
    name: "Miliarder",
    description: "Zarób łącznie 1,000,000,000$",
    reward: 1_000_000,
    icon: "🏆",
    category: "earnings",
    condition: (s) => s.totalEarnings >= 1_000_000_000,
  },
  {
    id: "lifetime_10m",
    name: "Weteran",
    description: "Zarób 10M$ łącznie przez wszystkie gry",
    reward: 25_000,
    icon: "⭐",
    category: "earnings",
    condition: (s) => s.totalLifetimeEarnings + s.totalEarnings >= 10_000_000,
  },
  {
    id: "lifetime_100m",
    name: "Legenda",
    description: "Zarób 100M$ łącznie przez wszystkie gry",
    reward: 100_000,
    icon: "🌟",
    category: "earnings",
    condition: (s) => s.totalLifetimeEarnings + s.totalEarnings >= 100_000_000,
  },

  // ==================== TIERS ====================
  {
    id: "tier_2",
    name: "Awans",
    description: "Osiągnij Tier 2",
    reward: 500,
    icon: "📈",
    category: "tier",
    condition: (s) => s.currentTier >= 2,
  },
  {
    id: "tier_3",
    name: "Rozwój",
    description: "Osiągnij Tier 3",
    reward: 2_000,
    icon: "📈",
    category: "tier",
    condition: (s) => s.currentTier >= 3,
  },
  {
    id: "tier_4",
    name: "Potęga",
    description: "Osiągnij Tier 4",
    reward: 10_000,
    icon: "🚀",
    category: "tier",
    condition: (s) => s.currentTier >= 4,
  },
  {
    id: "tier_5",
    name: "Szczyt",
    description: "Osiągnij Tier 5",
    reward: 50_000,
    icon: "🏔️",
    category: "tier",
    condition: (s) => s.currentTier >= 5,
  },

  // ==================== PRESTIGE ====================
  {
    id: "prestige_1",
    name: "Nowy początek",
    description: "Wykonaj pierwszy Prestige",
    reward: 5_000,
    icon: "🔄",
    category: "prestige",
    condition: (s) => s.timesPrestiged >= 1,
  },
  {
    id: "prestige_3",
    name: "Doświadczony",
    description: "Wykonaj 3 Prestige",
    reward: 15_000,
    icon: "🔄",
    category: "prestige",
    condition: (s) => s.timesPrestiged >= 3,
  },
  {
    id: "prestige_5",
    name: "Mistrz odrodzenia",
    description: "Wykonaj 5 Prestige",
    reward: 30_000,
    icon: "♻️",
    category: "prestige",
    condition: (s) => s.timesPrestiged >= 5,
  },
  {
    id: "prestige_10",
    name: "Nieśmiertelny",
    description: "Wykonaj 10 Prestige",
    reward: 100_000,
    icon: "🌀",
    category: "prestige",
    condition: (s) => s.timesPrestiged >= 10,
  },

  // ==================== CONTRACTS ====================
  {
    id: "contracts_1",
    name: "Pierwszy kontrakt",
    description: "Ukończ pierwszy kontrakt",
    reward: 100,
    icon: "📝",
    category: "contracts",
    condition: (s) => s.completedContractsCount >= 1,
  },
  {
    id: "contracts_10",
    name: "Kontraktowicz",
    description: "Ukończ 10 kontraktów",
    reward: 500,
    icon: "📋",
    category: "contracts",
    condition: (s) => s.completedContractsCount >= 10,
  },
  {
    id: "contracts_50",
    name: "Profesjonalista",
    description: "Ukończ 50 kontraktów",
    reward: 2_000,
    icon: "📋",
    category: "contracts",
    condition: (s) => s.completedContractsCount >= 50,
  },
  {
    id: "contracts_100",
    name: "Ekspert kontraktów",
    description: "Ukończ 100 kontraktów",
    reward: 5_000,
    icon: "📜",
    category: "contracts",
    condition: (s) => s.completedContractsCount >= 100,
  },
  {
    id: "contracts_500",
    name: "Maszyna do kontraktów",
    description: "Ukończ 500 kontraktów",
    reward: 20_000,
    icon: "🤖",
    category: "contracts",
    condition: (s) => s.completedContractsCount >= 500,
  },
  {
    id: "longterm_5",
    name: "Cierpliwy gracz",
    description: "Ukończ 5 długoterminowych kontraktów",
    reward: 3_000,
    icon: "⏳",
    category: "contracts",
    condition: (s) => s.completedLongTermCount >= 5,
  },
  {
    id: "longterm_20",
    name: "Strateg",
    description: "Ukończ 20 długoterminowych kontraktów",
    reward: 10_000,
    icon: "🎯",
    category: "contracts",
    condition: (s) => s.completedLongTermCount >= 20,
  },
  {
    id: "collab_5",
    name: "Współpracownik",
    description: "Ukończ 5 kolaboracji",
    reward: 2_000,
    icon: "🤝",
    category: "contracts",
    condition: (s) => s.completedCollaborationsCount >= 5,
  },
  {
    id: "collab_20",
    name: "Networker",
    description: "Ukończ 20 kolaboracji",
    reward: 8_000,
    icon: "🌐",
    category: "contracts",
    condition: (s) => s.completedCollaborationsCount >= 20,
  },

  // ==================== MEDIA PATH ====================
  {
    id: "followers_100",
    name: "Pierwsi fani",
    description: "Zdobądź 100 followersów",
    reward: 100,
    icon: "👥",
    category: "followers",
    path: "MEDIA",
    condition: (s) => s.path === "MEDIA" && s.followers >= 100,
  },
  {
    id: "followers_1k",
    name: "Micro-influencer",
    description: "Zdobądź 1,000 followersów",
    reward: 500,
    icon: "👥",
    category: "followers",
    path: "MEDIA",
    condition: (s) => s.path === "MEDIA" && s.followers >= 1_000,
  },
  {
    id: "followers_10k",
    name: "Influencer",
    description: "Zdobądź 10,000 followersów",
    reward: 2_000,
    icon: "📱",
    category: "followers",
    path: "MEDIA",
    condition: (s) => s.path === "MEDIA" && s.followers >= 10_000,
  },
  {
    id: "followers_100k",
    name: "Gwiazda social media",
    description: "Zdobądź 100,000 followersów",
    reward: 10_000,
    icon: "⭐",
    category: "followers",
    path: "MEDIA",
    condition: (s) => s.path === "MEDIA" && s.followers >= 100_000,
  },
  {
    id: "followers_1m",
    name: "Mega-influencer",
    description: "Zdobądź 1,000,000 followersów",
    reward: 50_000,
    icon: "🌟",
    category: "followers",
    path: "MEDIA",
    condition: (s) => s.path === "MEDIA" && s.followers >= 1_000_000,
  },
  {
    id: "followers_10m",
    name: "Celebryta",
    description: "Zdobądź 10,000,000 followersów",
    reward: 200_000,
    icon: "👑",
    category: "followers",
    path: "MEDIA",
    condition: (s) => s.path === "MEDIA" && s.followers >= 10_000_000,
  },
  {
    id: "reputation_25",
    name: "Szanowany",
    description: "Osiągnij 25 reputacji",
    reward: 500,
    icon: "🎖️",
    category: "followers",
    path: "MEDIA",
    condition: (s) => s.path === "MEDIA" && s.reputation >= 25,
  },
  {
    id: "reputation_50",
    name: "Autorytet",
    description: "Osiągnij 50 reputacji",
    reward: 2_000,
    icon: "🏅",
    category: "followers",
    path: "MEDIA",
    condition: (s) => s.path === "MEDIA" && s.reputation >= 50,
  },
  {
    id: "reputation_75",
    name: "Ikona",
    description: "Osiągnij 75 reputacji",
    reward: 5_000,
    icon: "🏆",
    category: "followers",
    path: "MEDIA",
    condition: (s) => s.path === "MEDIA" && s.reputation >= 75,
  },
  {
    id: "reputation_100",
    name: "Legenda mediów",
    description: "Osiągnij 100 reputacji",
    reward: 20_000,
    icon: "👑",
    category: "followers",
    path: "MEDIA",
    condition: (s) => s.path === "MEDIA" && s.reputation >= 100,
  },

  // ==================== INDUSTRIAL PATH ====================
  {
    id: "resources_100",
    name: "Zapasy",
    description: "Zgromadź 100 surowców",
    reward: 200,
    icon: "📦",
    category: "resources",
    path: "INDUSTRIAL",
    condition: (s) => s.path === "INDUSTRIAL" && s.resources >= 100,
  },
  {
    id: "resources_500",
    name: "Magazyn",
    description: "Zgromadź 500 surowców",
    reward: 1_000,
    icon: "🏭",
    category: "resources",
    path: "INDUSTRIAL",
    condition: (s) => s.path === "INDUSTRIAL" && s.resources >= 500,
  },
  {
    id: "resources_1k",
    name: "Hurtownia",
    description: "Zgromadź 1,000 surowców",
    reward: 3_000,
    icon: "🏗️",
    category: "resources",
    path: "INDUSTRIAL",
    condition: (s) => s.path === "INDUSTRIAL" && s.resources >= 1_000,
  },
  {
    id: "resources_5k",
    name: "Centrum logistyczne",
    description: "Zgromadź 5,000 surowców",
    reward: 10_000,
    icon: "🚚",
    category: "resources",
    path: "INDUSTRIAL",
    condition: (s) => s.path === "INDUSTRIAL" && s.resources >= 5_000,
  },
  {
    id: "resources_10k",
    name: "Imperium surowców",
    description: "Zgromadź 10,000 surowców",
    reward: 25_000,
    icon: "⛏️",
    category: "resources",
    path: "INDUSTRIAL",
    condition: (s) => s.path === "INDUSTRIAL" && s.resources >= 10_000,
  },
  {
    id: "efficiency_110",
    name: "Optymalizacja",
    description: "Osiągnij 110% efektywności",
    reward: 1_000,
    icon: "⚙️",
    category: "resources",
    path: "INDUSTRIAL",
    condition: (s) => s.path === "INDUSTRIAL" && s.efficiency >= 110,
  },
  {
    id: "efficiency_125",
    name: "Lean Manufacturing",
    description: "Osiągnij 125% efektywności",
    reward: 5_000,
    icon: "🔧",
    category: "resources",
    path: "INDUSTRIAL",
    condition: (s) => s.path === "INDUSTRIAL" && s.efficiency >= 125,
  },
  {
    id: "efficiency_140",
    name: "Perfekcyjna produkcja",
    description: "Osiągnij 140% efektywności",
    reward: 15_000,
    icon: "🎯",
    category: "resources",
    path: "INDUSTRIAL",
    condition: (s) => s.path === "INDUSTRIAL" && s.efficiency >= 140,
  },
  {
    id: "efficiency_150",
    name: "Mistrz efektywności",
    description: "Osiągnij maksymalne 150% efektywności",
    reward: 30_000,
    icon: "🏆",
    category: "resources",
    path: "INDUSTRIAL",
    condition: (s) => s.path === "INDUSTRIAL" && s.efficiency >= 150,
  },

  // ==================== FINANCE PATH ====================
  {
    id: "aum_10k",
    name: "Początkujący fundusz",
    description: "Zarządzaj kapitałem 10,000$",
    reward: 500,
    icon: "💼",
    category: "finance",
    path: "FINANCE",
    condition: (s) => s.path === "FINANCE" && s.aum >= 10_000,
  },
  {
    id: "aum_100k",
    name: "Boutique Fund",
    description: "Zarządzaj kapitałem 100,000$",
    reward: 2_000,
    icon: "💼",
    category: "finance",
    path: "FINANCE",
    condition: (s) => s.path === "FINANCE" && s.aum >= 100_000,
  },
  {
    id: "aum_1m",
    name: "Asset Manager",
    description: "Zarządzaj kapitałem 1,000,000$",
    reward: 10_000,
    icon: "🏦",
    category: "finance",
    path: "FINANCE",
    condition: (s) => s.path === "FINANCE" && s.aum >= 1_000_000,
  },
  {
    id: "aum_10m",
    name: "Hedge Fund",
    description: "Zarządzaj kapitałem 10,000,000$",
    reward: 50_000,
    icon: "🏛️",
    category: "finance",
    path: "FINANCE",
    condition: (s) => s.path === "FINANCE" && s.aum >= 10_000_000,
  },
  {
    id: "aum_100m",
    name: "Institutional Investor",
    description: "Zarządzaj kapitałem 100,000,000$",
    reward: 200_000,
    icon: "🌐",
    category: "finance",
    path: "FINANCE",
    condition: (s) => s.path === "FINANCE" && s.aum >= 100_000_000,
  },
  {
    id: "aum_1b",
    name: "Wall Street Giant",
    description: "Zarządzaj kapitałem 1,000,000,000$",
    reward: 1_000_000,
    icon: "👑",
    category: "finance",
    path: "FINANCE",
    condition: (s) => s.path === "FINANCE" && s.aum >= 1_000_000_000,
  },
  {
    id: "crash_1",
    name: "Przetrwałem",
    description: "Przetrwaj pierwszy krach rynkowy",
    reward: 5_000,
    icon: "📉",
    category: "finance",
    path: "FINANCE",
    condition: (s) => s.path === "FINANCE" && s.crashesSurvived >= 1,
  },
  {
    id: "crash_3",
    name: "Zahartowany",
    description: "Przetrwaj 3 krachy rynkowe",
    reward: 15_000,
    icon: "🛡️",
    category: "finance",
    path: "FINANCE",
    condition: (s) => s.path === "FINANCE" && s.crashesSurvived >= 3,
  },
  {
    id: "crash_5",
    name: "Antykryzysowy",
    description: "Przetrwaj 5 krachów rynkowych",
    reward: 30_000,
    icon: "🏰",
    category: "finance",
    path: "FINANCE",
    condition: (s) => s.path === "FINANCE" && s.crashesSurvived >= 5,
  },
  {
    id: "crash_10",
    name: "Niezniszczalny",
    description: "Przetrwaj 10 krachów rynkowych",
    reward: 100_000,
    icon: "💪",
    category: "finance",
    path: "FINANCE",
    condition: (s) => s.path === "FINANCE" && s.crashesSurvived >= 10,
  },
  {
    id: "rating_a",
    name: "Investment Grade",
    description: "Osiągnij rating A",
    reward: 5_000,
    icon: "📊",
    category: "finance",
    path: "FINANCE",
    condition: (s) => s.path === "FINANCE" && ratingToNumber(s.creditRating) >= 7,
  },
  {
    id: "rating_aa",
    name: "Premium Rating",
    description: "Osiągnij rating AA",
    reward: 15_000,
    icon: "📈",
    category: "finance",
    path: "FINANCE",
    condition: (s) => s.path === "FINANCE" && ratingToNumber(s.creditRating) >= 8,
  },
  {
    id: "rating_aaa",
    name: "Triple A",
    description: "Osiągnij najwyższy rating AAA",
    reward: 50_000,
    icon: "🌟",
    category: "finance",
    path: "FINANCE",
    condition: (s) => s.path === "FINANCE" && ratingToNumber(s.creditRating) >= 9,
  },

  // ==================== SPECIAL ====================
  {
    id: "buildings_10",
    name: "Budowniczy",
    description: "Posiadaj 10 budynków łącznie",
    reward: 300,
    icon: "🏠",
    category: "special",
    condition: (s) => s.buildingCount >= 10,
  },
  {
    id: "buildings_50",
    name: "Developer",
    description: "Posiadaj 50 budynków łącznie",
    reward: 2_000,
    icon: "🏢",
    category: "special",
    condition: (s) => s.buildingCount >= 50,
  },
  {
    id: "buildings_100",
    name: "Potentat nieruchomości",
    description: "Posiadaj 100 budynków łącznie",
    reward: 10_000,
    icon: "🏙️",
    category: "special",
    condition: (s) => s.buildingCount >= 100,
  },
  {
    id: "buildings_500",
    name: "Mega-korporacja",
    description: "Posiadaj 500 budynków łącznie",
    reward: 50_000,
    icon: "🌆",
    category: "special",
    condition: (s) => s.buildingCount >= 500,
  },
];

/**
 * Get achievements available for a specific path
 */
export function getAchievementsForPath(path: PathType): Achievement[] {
  return ACHIEVEMENTS.filter((a) => !a.path || a.path === path);
}

/**
 * Check which achievements are unlocked but not claimed
 */
export function getUnclaimedAchievements(
  stats: AchievementStats,
  claimedIds: string[]
): Achievement[] {
  const available = getAchievementsForPath(stats.path);
  return available.filter((a) => a.condition(stats) && !claimedIds.includes(a.id));
}

/**
 * Get all achievements with their status
 */
export function getAchievementsWithStatus(
  stats: AchievementStats,
  claimedIds: string[]
): Array<Achievement & { unlocked: boolean; claimed: boolean }> {
  const available = getAchievementsForPath(stats.path);
  return available.map((a) => ({
    ...a,
    unlocked: a.condition(stats),
    claimed: claimedIds.includes(a.id),
  }));
}
