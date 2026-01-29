// Contract system configuration
import { PathType } from "./gamedata";

export type ContractType = "sponsor" | "long_term" | "collaboration" | "production";

export interface Contract {
  id: string;
  type: ContractType;
  name: string;
  description: string;
  duration: number; // Duration in seconds
  reward: {
    money: number;
    reputation: number;
    followers?: number;
    efficiency?: number; // For Industrial contracts
    resources?: number; // For Industrial contracts
  };
  penalty: {
    reputation: number; // Lost if not completed
    efficiency?: number; // For Industrial contracts
  };
  requirement?: {
    minReputation?: number;
    minFollowers?: number;
    minTier?: number;
    minResources?: number; // For Industrial contracts
    minEfficiency?: number; // For Industrial contracts
  };
  path?: PathType; // Which path this contract is for (undefined = MEDIA)
}

export interface ActiveContract {
  contract: Contract;
  startTime: number;
  endTime: number;
  completed: boolean;
}

// Predefined contract templates
export const CONTRACT_TEMPLATES: Record<ContractType, Contract[]> = {
  sponsor: [
    {
      id: "sponsor_small",
      type: "sponsor",
      name: "Small Sponsorship",
      description: "Mention the product in your content",
      duration: 60,
      reward: { money: 500, reputation: 3 },
      penalty: { reputation: 5 },
      requirement: { minReputation: 20, minTier: 1 },
    },
    {
      id: "sponsor_medium",
      type: "sponsor",
      name: "Medium Sponsorship",
      description: "Dedicated sponsored post",
      duration: 120,
      reward: { money: 2000, reputation: 5 },
      penalty: { reputation: 8 },
      requirement: { minReputation: 40, minTier: 2 },
    },
    {
      id: "sponsor_large",
      type: "sponsor",
      name: "Large Sponsor Contract",
      description: "Series of sponsored posts",
      duration: 300,
      reward: { money: 10000, reputation: 10, followers: 500 },
      penalty: { reputation: 15 },
      requirement: { minReputation: 60, minTier: 3 },
    },
  ],
  long_term: [
    {
      id: "longterm_starter",
      type: "long_term",
      name: "Starter Agreement",
      description: "Monthly partnership with a brand",
      duration: 180,
      reward: { money: 5000, reputation: 8 },
      penalty: { reputation: 10 },
      requirement: { minReputation: 40, minTier: 2 },
    },
    {
      id: "longterm_pro",
      type: "long_term",
      name: "Professional Agreement",
      description: "Quarterly partnership with a big brand",
      duration: 300,
      reward: { money: 20000, reputation: 15, followers: 1000 },
      penalty: { reputation: 15 },
      requirement: { minReputation: 50, minTier: 3 },
    },
    {
      id: "longterm_exclusive",
      type: "long_term",
      name: "Exclusive Agreement",
      description: "Yearly exclusive partnership",
      duration: 600,
      reward: { money: 100000, reputation: 25, followers: 5000 },
      penalty: { reputation: 25 },
      requirement: { minReputation: 70, minTier: 4 },
    },
  ],
  collaboration: [
    {
      id: "collab_small",
      type: "collaboration",
      name: "Small Collaboration",
      description: "Joint post with another creator",
      duration: 60,
      reward: { money: 300, reputation: 2, followers: 200 },
      penalty: { reputation: 3 },
      requirement: { minTier: 2 },
    },
    {
      id: "collab_video",
      type: "collaboration",
      name: "Joint Video",
      description: "Recording with a popular creator",
      duration: 120,
      reward: { money: 1000, reputation: 5, followers: 1000 },
      penalty: { reputation: 5 },
      requirement: { minTier: 2, minFollowers: 5000 },
    },
    {
      id: "collab_series",
      type: "collaboration",
      name: "Collaboration Series",
      description: "Series of joint content",
      duration: 300,
      reward: { money: 5000, reputation: 10, followers: 5000 },
      penalty: { reputation: 10 },
      requirement: { minTier: 3, minFollowers: 50000 },
    },
  ],
  // Industrial production contracts
  production: [
    {
      id: "production_local",
      type: "production",
      name: "Local Order",
      description: "Small order from a local client",
      duration: 60,
      reward: { money: 500, reputation: 2 },
      penalty: { reputation: 3, efficiency: 5 },
      requirement: { minTier: 1 },
      path: "INDUSTRIAL",
    },
    {
      id: "production_regional",
      type: "production",
      name: "Regional Contract",
      description: "Order from a regional distributor",
      duration: 180,
      reward: { money: 3000, reputation: 5 },
      penalty: { reputation: 5, efficiency: 10 },
      requirement: { minTier: 2, minResources: 200 },
      path: "INDUSTRIAL",
    },
    {
      id: "production_national",
      type: "production",
      name: "National Contract",
      description: "Large order for retail chain",
      duration: 300,
      reward: { money: 15000, reputation: 10 },
      penalty: { reputation: 10, efficiency: 15 },
      requirement: { minTier: 3, minResources: 1000, minEfficiency: 70 },
      path: "INDUSTRIAL",
    },
    {
      id: "production_government",
      type: "production",
      name: "Government Contract",
      description: "Public sector order from government",
      duration: 600,
      reward: { money: 100000, reputation: 20, efficiency: 5 },
      penalty: { reputation: 15, efficiency: 20 },
      requirement: { minTier: 4, minResources: 5000, minEfficiency: 80 },
      path: "INDUSTRIAL",
    },
    {
      id: "production_international",
      type: "production",
      name: "International Contract",
      description: "Export to foreign partners",
      duration: 900,
      reward: { money: 500000, reputation: 30, resources: 10000 },
      penalty: { reputation: 20, efficiency: 25 },
      requirement: { minTier: 5, minResources: 20000, minEfficiency: 90 },
      path: "INDUSTRIAL",
    },
  ],
};

// Generate a random contract offer based on player stats
export function generateContractOffer(
  tier: number,
  reputation: number,
  followers: number,
  path: PathType = "MEDIA",
  resources?: number,
  efficiency?: number
): Contract | null {
  let allContracts: Contract[];

  if (path === "INDUSTRIAL") {
    // Industrial path only gets production contracts
    allContracts = [...CONTRACT_TEMPLATES.production];
  } else {
    // Media path gets sponsor, long_term, and collaboration contracts
    allContracts = [
      ...CONTRACT_TEMPLATES.sponsor,
      ...CONTRACT_TEMPLATES.long_term,
      ...CONTRACT_TEMPLATES.collaboration,
    ];
  }

  const eligible = allContracts.filter((c) => {
    // Check path restriction
    if (c.path && c.path !== path) return false;

    // Common requirements
    if (c.requirement?.minTier && tier < c.requirement.minTier) return false;
    if (c.requirement?.minReputation && reputation < c.requirement.minReputation) return false;

    // Media-specific requirements
    if (c.requirement?.minFollowers && followers < c.requirement.minFollowers) return false;

    // Industrial-specific requirements
    if (c.requirement?.minResources && (resources || 0) < c.requirement.minResources) return false;
    if (c.requirement?.minEfficiency && (efficiency || 100) < c.requirement.minEfficiency) return false;

    return true;
  });

  if (eligible.length === 0) return null;

  // Random selection with weight towards appropriate level
  return eligible[Math.floor(Math.random() * eligible.length)];
}
