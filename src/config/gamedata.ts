export type PathType = "INDUSTRIAL" | "MEDIA" | "FINANCE";

// ============================================
// TIER SYSTEM (for MEDIA path)
// ============================================

export interface BuildingRequirement {
  id: string;
  count: number;
}

export interface TierRequirement {
  totalEarnings?: number;
  followers?: number;
  resources?: number; // For Industrial path
  reputation?: number;
  efficiency?: number; // For Industrial path (minimum efficiency required)
  // Finance path requirements
  aum?: number; // Assets Under Management (kapitał klientów)
  minRating?: string; // Minimum credit rating (AAA, AA, A, BBB, BB, B, CCC, CC, C)
  diversification?: number; // Minimum number of different asset classes
  crashesSurvived?: number; // Number of market crashes survived
  // Building requirements - ANY of these need to be met (OR logic)
  buildingsAny?: BuildingRequirement[];
  // Building requirements - ALL of these need to be met (AND logic)
  buildingsAll?: BuildingRequirement[];
  // Contract requirements
  completedContracts?: number;
  completedLongTermContracts?: number;
  // Scandal requirements
  scandalsSurvived?: number;
}

export interface TierDefinition {
  id: number;
  name: string;
  description: string;
  requirements: TierRequirement;
  maxBuildingCount: number; // Max count per building in this tier
}

// ============================================
// INDUSTRIAL TIER SYSTEM
// ============================================

export const INDUSTRIAL_TIERS: TierDefinition[] = [
  {
    id: 1,
    name: "Small Workshop",
    description: "You start in a garage with basic tools",
    requirements: {},
    maxBuildingCount: 10,
  },
  {
    id: 2,
    name: "Small Factory",
    description: "You move to a real building with employees",
    requirements: {
      totalEarnings: 5000,
      resources: 500,
      efficiency: 60,
      buildingsAny: [
        { id: "i1_workshop", count: 5 },
        { id: "i1_tools", count: 5 },
      ],
    },
    maxBuildingCount: 15,
  },
  {
    id: 3,
    name: "Medium Factory",
    description: "You have a recognized brand. Automation becomes key",
    requirements: {
      totalEarnings: 50000,
      resources: 2000,
      efficiency: 70,
      buildingsAny: [
        { id: "i2_machine", count: 3 },
        { id: "i2_workers", count: 5 },
      ],
    },
    maxBuildingCount: 20,
  },
  {
    id: 4,
    name: "Large Corporation",
    description: "You're a player in the national market. The government takes notice",
    requirements: {
      totalEarnings: 500000,
      resources: 10000,
      efficiency: 80,
      buildingsAll: [
        { id: "i3_assembly", count: 2 },
      ],
    },
    maxBuildingCount: 25,
  },
  {
    id: 5,
    name: "Industrial Empire",
    description: "You're an international giant. Your decisions affect the economy",
    requirements: {
      totalEarnings: 5000000,
      resources: 100000,
      efficiency: 90,
      buildingsAll: [
        { id: "i4_plant", count: 1 },
        { id: "i4_mine", count: 1 },
      ],
    },
    maxBuildingCount: 50,
  },
];

// ============================================
// MEDIA TIER SYSTEM
// ============================================

export const MEDIA_TIERS: TierDefinition[] = [
  {
    id: 1,
    name: "Beginner Creator",
    description: "You start in your room with a laptop and dreams",
    requirements: {},
    maxBuildingCount: 10,
  },
  {
    id: 2,
    name: "Recognized Creator",
    description: "People start to recognize you",
    requirements: {
      totalEarnings: 5000,
      followers: 1000,
      buildingsAny: [
        { id: "m1_blog", count: 5 },
        { id: "m1_social", count: 5 },
      ],
    },
    maxBuildingCount: 15,
  },
  {
    id: 3,
    name: "Professional",
    description: "Time to hire people and start an agency",
    requirements: {
      totalEarnings: 50000,
      followers: 10000,
      reputation: 40,
      buildingsAny: [
        { id: "m2_youtube", count: 3 },
        { id: "m2_podcast", count: 5 },
      ],
      completedContracts: 1,
    },
    maxBuildingCount: 20,
  },
  {
    id: 4,
    name: "Influencer",
    description: "You're somebody in the industry. Brands come to you",
    requirements: {
      totalEarnings: 500000,
      followers: 100000,
      reputation: 60,
      buildingsAny: [
        { id: "m3_editor", count: 5 },
        { id: "m3_writer", count: 5 },
        { id: "m3_manager", count: 5 },
      ],
      completedLongTermContracts: 3,
    },
    maxBuildingCount: 25,
  },
  {
    id: 5,
    name: "Media Empire",
    description: "You're a mogul. Your decisions affect the entire industry",
    requirements: {
      totalEarnings: 5000000,
      followers: 1000000,
      reputation: 80,
      buildingsAll: [
        { id: "m4_production", count: 1 },
      ],
      scandalsSurvived: 3,
    },
    maxBuildingCount: 50,
  },
];

// ============================================
// FINANCE TIER SYSTEM
// ============================================

export const FINANCE_TIERS: TierDefinition[] = [
  {
    id: 1,
    name: "Beginner Investor",
    description: "You start with your own savings. Learning market basics",
    requirements: {},
    maxBuildingCount: 10,
  },
  {
    id: 2,
    name: "Individual Trader",
    description: "You start actively trading. First clients trust you with money",
    requirements: {
      totalEarnings: 5000,
      aum: 1000,
      minRating: "BBB",
      diversification: 3,
    },
    maxBuildingCount: 15,
  },
  {
    id: 3,
    name: "Fund Manager",
    description: "You start your own investment fund. Institutions begin to trust you",
    requirements: {
      totalEarnings: 50000,
      aum: 10000,
      minRating: "A",
      buildingsAny: [
        { id: "f2_client", count: 5 },
      ],
    },
    maxBuildingCount: 20,
  },
  {
    id: 4,
    name: "Financial Institution",
    description: "You're a serious player. Pension funds entrust you with millions",
    requirements: {
      totalEarnings: 500000,
      aum: 100000,
      minRating: "AA",
      diversification: 5,
      buildingsAny: [
        { id: "f3_fund", count: 3 },
        { id: "f3_realestate", count: 3 },
      ],
    },
    maxBuildingCount: 25,
  },
  {
    id: 5,
    name: "Financial Empire",
    description: "You're one of the most powerful players in global markets",
    requirements: {
      totalEarnings: 5000000,
      aum: 1000000,
      minRating: "AAA",
      diversification: 8,
      crashesSurvived: 2,
      buildingsAll: [
        { id: "f4_hedge", count: 1 },
        { id: "f4_pe", count: 1 },
      ],
    },
    maxBuildingCount: 50,
  },
];

// ============================================
// BUILDING DEFINITIONS
// ============================================

export type VolatilityLevel = "none" | "low" | "medium" | "high" | "extreme" | "configurable";

export interface BuildingDefinition {
  id: string;
  name: string;
  icon: string; // Emoji icon for the building
  baseCost: number;
  baseProduction: number; // $ per second
  followersPerSecond: number; // Followers generated per second (Media)
  resourcesPerSecond: number; // Resources per second (Industrial) - negative = consumption, positive = production
  aumPerSecond: number; // AUM per second (Finance) - for client buildings
  volatility: VolatilityLevel; // Market volatility for Finance buildings
  costMultiplier: number;
  description: string;
  tier: number; // Required tier to unlock
}

export interface PathDefinition {
  id: PathType;
  name: string;
  description: string;
  color: string;
  icon: string;
  buildings: BuildingDefinition[];
}

export const PATHS: Record<PathType, PathDefinition> = {
  INDUSTRIAL: {
    id: "INDUSTRIAL",
    name: "Industrial",
    description: "Physical production, supply chain management and automation.",
    color: "#f97316",
    icon: "factory",
    buildings: [
      // ============ TIER 1: Small Workshop ============
      {
        id: "i1_workshop",
        name: "Workshop",
        icon: "🔧",
        baseCost: 50,
        baseProduction: 0.1,
        followersPerSecond: 0,
        resourcesPerSecond: -0.05,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.15,
        description: "Basic manual production",
        tier: 1,
      },
      {
        id: "i1_tools",
        name: "Tool Set",
        icon: "🛠️",
        baseCost: 100,
        baseProduction: 0.2,
        followersPerSecond: 0,
        resourcesPerSecond: -0.08,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.15,
        description: "Better tools = faster work",
        tier: 1,
      },
      {
        id: "i1_storage",
        name: "Small Storage",
        icon: "📦",
        baseCost: 200,
        baseProduction: 0.15,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.15,
        description: "Store finished products",
        tier: 1,
      },
      {
        id: "i1_supplier",
        name: "Local Supplier",
        icon: "🚚",
        baseCost: 300,
        baseProduction: 0,
        followersPerSecond: 0,
        resourcesPerSecond: 0.5,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.18,
        description: "Delivers resources to workshop",
        tier: 1,
      },
      // ============ TIER 2: Small Factory ============
      {
        id: "i2_machine",
        name: "Production Machine",
        icon: "⚙️",
        baseCost: 1500,
        baseProduction: 2.5,
        followersPerSecond: 0,
        resourcesPerSecond: -1.0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.14,
        description: "Your first real machine",
        tier: 2,
      },
      {
        id: "i2_workers",
        name: "Worker Team",
        icon: "👷",
        baseCost: 2000,
        baseProduction: 3.0,
        followersPerSecond: 0,
        resourcesPerSecond: -0.5,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.14,
        description: "5 production workers",
        tier: 2,
      },
      {
        id: "i2_forklift",
        name: "Forklift",
        icon: "🚜",
        baseCost: 1000,
        baseProduction: 1.5,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.14,
        description: "Faster internal transport",
        tier: 2,
      },
      {
        id: "i2_wholesale",
        name: "Resource Wholesale",
        icon: "🏪",
        baseCost: 3000,
        baseProduction: 0,
        followersPerSecond: 0,
        resourcesPerSecond: 2.0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.16,
        description: "Cheaper bulk resources",
        tier: 2,
      },
      {
        id: "i2_quality",
        name: "Quality Control",
        icon: "✅",
        baseCost: 2500,
        baseProduction: 1.0,
        followersPerSecond: 0,
        resourcesPerSecond: -0.2,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.14,
        description: "+5% efficiency",
        tier: 2,
      },
      // ============ TIER 3: Medium Factory ============
      {
        id: "i3_assembly",
        name: "Assembly Line",
        icon: "🔄",
        baseCost: 15000,
        baseProduction: 15,
        followersPerSecond: 0,
        resourcesPerSecond: -5.0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.12,
        description: "Automated assembly",
        tier: 3,
      },
      {
        id: "i3_robot",
        name: "Industrial Robot",
        icon: "🤖",
        baseCost: 25000,
        baseProduction: 20,
        followersPerSecond: 0,
        resourcesPerSecond: -3.0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.14,
        description: "No salary required",
        tier: 3,
      },
      {
        id: "i3_warehouse",
        name: "Large Warehouse",
        icon: "🏭",
        baseCost: 10000,
        baseProduction: 5,
        followersPerSecond: 0,
        resourcesPerSecond: 1.0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.12,
        description: "Resource buffer",
        tier: 3,
      },
      {
        id: "i3_import",
        name: "Import Channel",
        icon: "🚢",
        baseCost: 20000,
        baseProduction: 0,
        followersPerSecond: 0,
        resourcesPerSecond: 5.0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.16,
        description: "Cheap resources from abroad",
        tier: 3,
      },
      {
        id: "i3_maintenance",
        name: "Maintenance Dept.",
        icon: "🔩",
        baseCost: 12000,
        baseProduction: 0,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.14,
        description: "Automatic machine maintenance",
        tier: 3,
      },
      {
        id: "i3_training",
        name: "Training Center",
        icon: "🎓",
        baseCost: 18000,
        baseProduction: 8,
        followersPerSecond: 0,
        resourcesPerSecond: -1.0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.14,
        description: "+10% efficiency",
        tier: 3,
      },
      // ============ TIER 4: Large Corporation ============
      {
        id: "i4_plant",
        name: "Production Plant",
        icon: "🏗️",
        baseCost: 150000,
        baseProduction: 80,
        followersPerSecond: 0,
        resourcesPerSecond: -25,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.18,
        description: "Entire factory complex",
        tier: 4,
      },
      {
        id: "i4_rnd",
        name: "R&D Department",
        icon: "🔬",
        baseCost: 100000,
        baseProduction: 30,
        followersPerSecond: 0,
        resourcesPerSecond: -5,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.16,
        description: "+15% efficiency, new tech",
        tier: 4,
      },
      {
        id: "i4_logistics",
        name: "Logistics Center",
        icon: "📊",
        baseCost: 80000,
        baseProduction: 40,
        followersPerSecond: 0,
        resourcesPerSecond: 10,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.14,
        description: "Delivery optimization",
        tier: 4,
      },
      {
        id: "i4_mine",
        name: "Own Mine",
        icon: "⛏️",
        baseCost: 200000,
        baseProduction: 10,
        followersPerSecond: 0,
        resourcesPerSecond: 20,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.20,
        description: "Resource independence",
        tier: 4,
      },
      {
        id: "i4_green",
        name: "Green Energy",
        icon: "🌱",
        baseCost: 120000,
        baseProduction: 25,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.16,
        description: "-50% energy costs",
        tier: 4,
      },
      {
        id: "i4_contract",
        name: "Contracts Dept.",
        icon: "📋",
        baseCost: 75000,
        baseProduction: 20,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.14,
        description: "Better contract terms",
        tier: 4,
      },
      // ============ TIER 5: Industrial Empire ============
      {
        id: "i5_megafactory",
        name: "Mega Factory",
        icon: "🏭",
        baseCost: 2000000,
        baseProduction: 500,
        followersPerSecond: 0,
        resourcesPerSecond: -150,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.22,
        description: "Largest plant in the country",
        tier: 5,
      },
      {
        id: "i5_global",
        name: "Global Network",
        icon: "🌍",
        baseCost: 5000000,
        baseProduction: 1000,
        followersPerSecond: 0,
        resourcesPerSecond: 100,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.25,
        description: "Factories worldwide",
        tier: 5,
      },
      {
        id: "i5_automation",
        name: "Full Automation",
        icon: "🤖",
        baseCost: 3000000,
        baseProduction: 800,
        followersPerSecond: 0,
        resourcesPerSecond: -50,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.24,
        description: "Factory without people",
        tier: 5,
      },
      {
        id: "i5_monopoly",
        name: "Resource Monopoly",
        icon: "💎",
        baseCost: 10000000,
        baseProduction: 200,
        followersPerSecond: 0,
        resourcesPerSecond: 200,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.28,
        description: "You control the resource market",
        tier: 5,
      },
      {
        id: "i5_conglomerate",
        name: "Conglomerate",
        icon: "👑",
        baseCost: 20000000,
        baseProduction: 2000,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.30,
        description: "Everything in one",
        tier: 5,
      },
    ],
  },
  MEDIA: {
    id: "MEDIA",
    name: "Media & Entertainment",
    description: "Build your career from scratch. Gain followers and climb the ladder!",
    color: "#8b5cf6",
    icon: "video",
    buildings: [
      // ============ TIER 1: Beginner Creator ============
      {
        id: "m1_blog",
        name: "Personal Blog",
        icon: "📝",
        baseCost: 50,
        baseProduction: 0.1,
        followersPerSecond: 0.01,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.15,
        description: "Write articles in your free time",
        tier: 1,
      },
      {
        id: "m1_social",
        name: "Social Media Account",
        icon: "📱",
        baseCost: 100,
        baseProduction: 0.2,
        followersPerSecond: 0.05,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.15,
        description: "Posts on Instagram/TikTok",
        tier: 1,
      },
      {
        id: "m1_freelance",
        name: "Freelance Jobs",
        icon: "💼",
        baseCost: 300,
        baseProduction: 0.5,
        followersPerSecond: 0.02,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.18,
        description: "Write texts and create graphics for others",
        tier: 1,
      },
      // ============ TIER 2: Recognized Creator ============
      {
        id: "m2_youtube",
        name: "YouTube Channel",
        icon: "▶️",
        baseCost: 2000,
        baseProduction: 3,
        followersPerSecond: 0.5,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.14,
        description: "Your own video channel",
        tier: 2,
      },
      {
        id: "m2_podcast",
        name: "Podcast",
        icon: "🎙️",
        baseCost: 1500,
        baseProduction: 2,
        followersPerSecond: 0.3,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.14,
        description: "Weekly audio episodes",
        tier: 2,
      },
      {
        id: "m2_newsletter",
        name: "Newsletter",
        icon: "📧",
        baseCost: 800,
        baseProduction: 1.5,
        followersPerSecond: 0.2,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.12,
        description: "Paid email subscription",
        tier: 2,
      },
      {
        id: "m2_merch",
        name: "Merch Store",
        icon: "👕",
        baseCost: 3000,
        baseProduction: 4,
        followersPerSecond: 0.1,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.16,
        description: "T-shirts and mugs with your logo",
        tier: 2,
      },
      // ============ TIER 3: Professional ============
      {
        id: "m3_editor",
        name: "Video Editor",
        icon: "🎬",
        baseCost: 10000,
        baseProduction: 8,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.12,
        description: "Hired video editor",
        tier: 3,
      },
      {
        id: "m3_writer",
        name: "Copywriter",
        icon: "✍️",
        baseCost: 8000,
        baseProduction: 6,
        followersPerSecond: 0.5,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.12,
        description: "Someone writes content for you",
        tier: 3,
      },
      {
        id: "m3_manager",
        name: "Social Media Manager",
        icon: "📊",
        baseCost: 15000,
        baseProduction: 12,
        followersPerSecond: 2,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.14,
        description: "Manages all your accounts",
        tier: 3,
      },
      {
        id: "m3_studio",
        name: "Small Studio",
        icon: "🎥",
        baseCost: 50000,
        baseProduction: 25,
        followersPerSecond: 1,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.18,
        description: "Your own recording space",
        tier: 3,
      },
      {
        id: "m3_agency",
        name: "Micro-Agency",
        icon: "🏢",
        baseCost: 100000,
        baseProduction: 40,
        followersPerSecond: 3,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.20,
        description: "You represent other creators too",
        tier: 3,
      },
      // ============ TIER 4: Influencer ============
      {
        id: "m4_brand_deal",
        name: "Brand Deal",
        icon: "🤝",
        baseCost: 200000,
        baseProduction: 100,
        followersPerSecond: 5,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.22,
        description: "Exclusive partnership with a big brand",
        tier: 4,
      },
      {
        id: "m4_production",
        name: "Production Studio",
        icon: "🎞️",
        baseCost: 500000,
        baseProduction: 200,
        followersPerSecond: 10,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.25,
        description: "You produce content for others",
        tier: 4,
      },
      {
        id: "m4_app",
        name: "Own App",
        icon: "📲",
        baseCost: 300000,
        baseProduction: 150,
        followersPerSecond: 15,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.20,
        description: "Your platform for fans",
        tier: 4,
      },
      {
        id: "m4_course",
        name: "Online Course",
        icon: "🎓",
        baseCost: 150000,
        baseProduction: 80,
        followersPerSecond: 2,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.18,
        description: '"How to become an influencer"',
        tier: 4,
      },
      {
        id: "m4_talent",
        name: "Talent Agency",
        icon: "⭐",
        baseCost: 750000,
        baseProduction: 300,
        followersPerSecond: 20,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.28,
        description: "You manage rising stars",
        tier: 4,
      },
      // ============ TIER 5: Media Empire ============
      {
        id: "m5_network",
        name: "Channel Network",
        icon: "🌐",
        baseCost: 5000000,
        baseProduction: 1500,
        followersPerSecond: 100,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.30,
        description: "Multi-Channel Network (MCN)",
        tier: 5,
      },
      {
        id: "m5_streaming",
        name: "Streaming Platform",
        icon: "📺",
        baseCost: 20000000,
        baseProduction: 5000,
        followersPerSecond: 500,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.35,
        description: 'Your own "Netflix"',
        tier: 5,
      },
      {
        id: "m5_record_label",
        name: "Record Label",
        icon: "🎵",
        baseCost: 10000000,
        baseProduction: 3000,
        followersPerSecond: 200,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.32,
        description: "You sign artists and producers",
        tier: 5,
      },
      {
        id: "m5_media_house",
        name: "Media House",
        icon: "🏛️",
        baseCost: 50000000,
        baseProduction: 10000,
        followersPerSecond: 1000,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.40,
        description: "A conglomerate controlling the market",
        tier: 5,
      },
    ],
  },
  FINANCE: {
    id: "FINANCE",
    name: "Finance",
    description: "Manage risk, invest capital and build a financial empire!",
    color: "#22c55e",
    icon: "chart",
    buildings: [
      // ============ TIER 1: Beginner Investor ============
      {
        id: "f1_savings",
        name: "Savings Account",
        icon: "💰",
        baseCost: 25,
        baseProduction: 0.15,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 0.5,
        volatility: "none",
        costMultiplier: 1.12,
        description: "Safe but low returns",
        tier: 1,
      },
      {
        id: "f1_bonds",
        name: "Treasury Bonds",
        icon: "📜",
        baseCost: 50,
        baseProduction: 0.25,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 0.3,
        volatility: "low",
        costMultiplier: 1.12,
        description: "Stable income",
        tier: 1,
      },
      {
        id: "f1_etf",
        name: "Index ETF",
        icon: "📊",
        baseCost: 100,
        baseProduction: 0.40,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 1.0,
        volatility: "medium",
        costMultiplier: 1.12,
        description: "Track the market",
        tier: 1,
      },
      {
        id: "f1_course",
        name: "Investment Course",
        icon: "📚",
        baseCost: 75,
        baseProduction: 0,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.15,
        description: "+5% to all profits",
        tier: 1,
      },
      // ============ TIER 2: Individual Trader ============
      {
        id: "f2_stocks",
        name: "Blue-chip Stocks",
        icon: "📈",
        baseCost: 500,
        baseProduction: 0.20,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "medium",
        costMultiplier: 1.14,
        description: "Stable companies",
        tier: 2,
      },
      {
        id: "f2_growth",
        name: "Growth Stocks",
        icon: "🚀",
        baseCost: 800,
        baseProduction: 0.35,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "high",
        costMultiplier: 1.16,
        description: "Risky but profitable",
        tier: 2,
      },
      {
        id: "f2_client",
        name: "Individual Client",
        icon: "👤",
        baseCost: 1000,
        baseProduction: 0.15,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 5,
        volatility: "none",
        costMultiplier: 1.14,
        description: "+5$/s AUM, pays commission",
        tier: 2,
      },
      {
        id: "f2_terminal",
        name: "Trading Terminal",
        icon: "🖥️",
        baseCost: 2000,
        baseProduction: 0.10,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.18,
        description: "+10% transaction speed",
        tier: 2,
      },
      {
        id: "f2_analyst",
        name: "Market Analyst",
        icon: "🔍",
        baseCost: 1500,
        baseProduction: 0,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.16,
        description: "Warns of market changes",
        tier: 2,
      },
      // ============ TIER 3: Fund Manager ============
      {
        id: "f3_fund",
        name: "Investment Fund",
        icon: "💼",
        baseCost: 20000,
        baseProduction: 1.0,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "medium",
        costMultiplier: 1.12,
        description: "Diversified portfolio",
        tier: 3,
      },
      {
        id: "f3_realestate",
        name: "Real Estate",
        icon: "🏠",
        baseCost: 50000,
        baseProduction: 0.8,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "low",
        costMultiplier: 1.14,
        description: "Stable rental income",
        tier: 3,
      },
      {
        id: "f3_commodities",
        name: "Commodities",
        icon: "🛢️",
        baseCost: 15000,
        baseProduction: 0.6,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "high",
        costMultiplier: 1.16,
        description: "Gold, oil, metals",
        tier: 3,
      },
      {
        id: "f3_corporate",
        name: "Corporate Client",
        icon: "🏢",
        baseCost: 25000,
        baseProduction: 0.5,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 25,
        volatility: "none",
        costMultiplier: 1.18,
        description: "+25$/s AUM",
        tier: 3,
      },
      {
        id: "f3_quant",
        name: "Algo-Trading System",
        icon: "🤖",
        baseCost: 30000,
        baseProduction: 0.7,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "medium",
        costMultiplier: 1.20,
        description: "Automated trading",
        tier: 3,
      },
      {
        id: "f3_research",
        name: "Research Dept.",
        icon: "📋",
        baseCost: 18000,
        baseProduction: 0,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.14,
        description: "+15% market prediction",
        tier: 3,
      },
      // ============ TIER 4: Financial Institution ============
      {
        id: "f4_pe",
        name: "Private Equity",
        icon: "🎯",
        baseCost: 200000,
        baseProduction: 4.0,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "high",
        costMultiplier: 1.18,
        description: "Investments in companies",
        tier: 4,
      },
      {
        id: "f4_hedge",
        name: "Hedge Fund",
        icon: "🛡️",
        baseCost: 300000,
        baseProduction: 3.5,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "medium",
        costMultiplier: 1.20,
        description: "Advanced strategies",
        tier: 4,
      },
      {
        id: "f4_crypto",
        name: "Crypto Portfolio",
        icon: "🪙",
        baseCost: 100000,
        baseProduction: 5.0,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "extreme",
        costMultiplier: 1.22,
        description: "Bitcoin, Ethereum, altcoins",
        tier: 4,
      },
      {
        id: "f4_pension",
        name: "Pension Fund",
        icon: "👴",
        baseCost: 250000,
        baseProduction: 2.0,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 100,
        volatility: "low",
        costMultiplier: 1.16,
        description: "+100$/s AUM, requires stability",
        tier: 4,
      },
      {
        id: "f4_ipo",
        name: "IPO Access",
        icon: "🎪",
        baseCost: 150000,
        baseProduction: 3.0,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "high",
        costMultiplier: 1.18,
        description: "Early access to new companies",
        tier: 4,
      },
      {
        id: "f4_bank",
        name: "Banking License",
        icon: "🏦",
        baseCost: 500000,
        baseProduction: 2.5,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 50,
        volatility: "low",
        costMultiplier: 1.25,
        description: "Accept deposits +50$/s AUM",
        tier: 4,
      },
      // ============ TIER 5: Financial Empire ============
      {
        id: "f5_sovereign",
        name: "Sovereign Wealth Fund",
        icon: "🌍",
        baseCost: 5000000,
        baseProduction: 20,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 500,
        volatility: "low",
        costMultiplier: 1.28,
        description: "Manage state money +500$/s AUM",
        tier: 5,
      },
      {
        id: "f5_derivatives",
        name: "Derivatives",
        icon: "📉",
        baseCost: 2000000,
        baseProduction: 15,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "configurable",
        costMultiplier: 1.26,
        description: "Options, futures, swaps",
        tier: 5,
      },
      {
        id: "f5_market_maker",
        name: "Market Maker",
        icon: "⚖️",
        baseCost: 10000000,
        baseProduction: 25,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "medium",
        costMultiplier: 1.30,
        description: "You provide liquidity",
        tier: 5,
      },
      {
        id: "f5_acquisition",
        name: "Acquisitions",
        icon: "🦈",
        baseCost: 20000000,
        baseProduction: 30,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "high",
        costMultiplier: 1.35,
        description: "You buy other funds",
        tier: 5,
      },
      {
        id: "f5_central",
        name: "Central Bank Influence",
        icon: "👑",
        baseCost: 50000000,
        baseProduction: 50,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "low",
        costMultiplier: 1.40,
        description: "You influence interest rates",
        tier: 5,
      },
    ],
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getBuildingsByPath(path: PathType): BuildingDefinition[] {
  return PATHS[path].buildings;
}

export function getBuildingById(
  path: PathType,
  buildingId: string
): BuildingDefinition | undefined {
  return PATHS[path].buildings.find((b) => b.id === buildingId);
}

export function getBuildingsByTier(path: PathType, tier: number): BuildingDefinition[] {
  return PATHS[path].buildings.filter((b) => b.tier === tier);
}

export function getAvailableBuildings(
  path: PathType,
  currentTier: number
): BuildingDefinition[] {
  return PATHS[path].buildings.filter((b) => b.tier <= currentTier);
}

export function getTierDefinition(tier: number, path: PathType = "MEDIA"): TierDefinition | undefined {
  const tiers = getTiersForPath(path);
  return tiers.find((t) => t.id === tier);
}

export function getNextTier(currentTier: number, path: PathType = "MEDIA"): TierDefinition | undefined {
  const tiers = getTiersForPath(path);
  return tiers.find((t) => t.id === currentTier + 1);
}

export function getTiersForPath(path: PathType): TierDefinition[] {
  switch (path) {
    case "INDUSTRIAL":
      return INDUSTRIAL_TIERS;
    case "FINANCE":
      return FINANCE_TIERS;
    case "MEDIA":
    default:
      return MEDIA_TIERS;
  }
}

// Credit rating scale (higher = better)
export const CREDIT_RATINGS = ["D", "C", "CC", "CCC", "B", "BB", "BBB", "A", "AA", "AAA"] as const;
export type CreditRating = typeof CREDIT_RATINGS[number];

export function getCreditRatingValue(rating: string): number {
  const index = CREDIT_RATINGS.indexOf(rating as CreditRating);
  return index >= 0 ? index : 6; // Default to BBB (index 6) if not found
}

export function getCreditRatingFromValue(value: number): CreditRating {
  const clampedValue = Math.max(0, Math.min(CREDIT_RATINGS.length - 1, Math.round(value)));
  return CREDIT_RATINGS[clampedValue];
}

// Get rating multiplier for production and client attraction
export function getCreditRatingMultiplier(rating: string): number {
  const ratingMultipliers: Record<string, number> = {
    "AAA": 1.50,
    "AA": 1.30,
    "A": 1.15,
    "BBB": 1.00,
    "BB": 0.80,
    "B": 0.60,
    "CCC": 0.40,
    "CC": 0.20,
    "C": 0.10,
    "D": 0,
  };
  return ratingMultipliers[rating] ?? 1.0;
}

// Get loan cost based on credit rating
export function getLoanCostRate(rating: string): number {
  const loanCosts: Record<string, number> = {
    "AAA": 0.02,
    "AA": 0.03,
    "A": 0.05,
    "BBB": 0.08,
    "BB": 0.12,
    "B": 0.18,
    "CCC": 0.25,
    "CC": 0.35,
    "C": 0.50,
    "D": 1.00,
  };
  return loanCosts[rating] ?? 0.08;
}

export interface TierCheckResult {
  met: boolean;
  progress: Record<string, { current: number; required: number; met: boolean; label?: string }>;
  buildingProgress?: {
    type: "any" | "all";
    requirements: { id: string; name: string; current: number; required: number; met: boolean }[];
    met: boolean;
  };
}

export interface TierCheckStats {
  totalEarnings: number;
  followers: number;
  resources?: number; // For Industrial
  reputation: number;
  efficiency?: number; // For Industrial
  // Finance-specific stats
  aum?: number; // Assets Under Management
  creditRating?: string; // AAA, AA, A, BBB, BB, B, CCC, CC, C, D
  diversificationCount?: number; // Number of different asset classes
  crashesSurvived?: number; // Number of market crashes survived
  buildings?: Record<string, number>;
  completedContractsCount?: number;
  completedLongTermCount?: number;
  scandalsSurvived?: number;
}

export function checkTierRequirements(
  tier: TierDefinition,
  stats: TierCheckStats,
  path: PathType = "MEDIA"
): TierCheckResult {
  const progress: Record<string, { current: number; required: number; met: boolean; label?: string }> = {};
  let allMet = true;

  if (tier.requirements.totalEarnings !== undefined) {
    const met = stats.totalEarnings >= tier.requirements.totalEarnings;
    progress.totalEarnings = {
      current: stats.totalEarnings,
      required: tier.requirements.totalEarnings,
      met,
    };
    if (!met) allMet = false;
  }

  if (tier.requirements.followers !== undefined) {
    const met = stats.followers >= tier.requirements.followers;
    progress.followers = {
      current: stats.followers,
      required: tier.requirements.followers,
      met,
    };
    if (!met) allMet = false;
  }

  if (tier.requirements.reputation !== undefined) {
    const met = stats.reputation >= tier.requirements.reputation;
    progress.reputation = {
      current: stats.reputation,
      required: tier.requirements.reputation,
      met,
    };
    if (!met) allMet = false;
  }

  // Check Industrial-specific requirements
  if (tier.requirements.resources !== undefined) {
    const current = stats.resources || 0;
    const met = current >= tier.requirements.resources;
    progress.resources = {
      current,
      required: tier.requirements.resources,
      met,
      label: "Resources",
    };
    if (!met) allMet = false;
  }

  if (tier.requirements.efficiency !== undefined) {
    const current = stats.efficiency || 100;
    const met = current >= tier.requirements.efficiency;
    progress.efficiency = {
      current,
      required: tier.requirements.efficiency,
      met,
      label: "Efficiency",
    };
    if (!met) allMet = false;
  }

  // Check Finance-specific requirements
  if (tier.requirements.aum !== undefined) {
    const current = stats.aum || 0;
    const met = current >= tier.requirements.aum;
    progress.aum = {
      current,
      required: tier.requirements.aum,
      met,
      label: "Capital (AUM)",
    };
    if (!met) allMet = false;
  }

  if (tier.requirements.minRating !== undefined) {
    const currentRating = stats.creditRating || "BBB";
    const ratingValue = getCreditRatingValue(currentRating);
    const requiredValue = getCreditRatingValue(tier.requirements.minRating);
    const met = ratingValue >= requiredValue;
    progress.minRating = {
      current: ratingValue,
      required: requiredValue,
      met,
      label: `Rating (min. ${tier.requirements.minRating})`,
    };
    if (!met) allMet = false;
  }

  if (tier.requirements.diversification !== undefined) {
    const current = stats.diversificationCount || 0;
    const met = current >= tier.requirements.diversification;
    progress.diversification = {
      current,
      required: tier.requirements.diversification,
      met,
      label: "Diversification",
    };
    if (!met) allMet = false;
  }

  if (tier.requirements.crashesSurvived !== undefined) {
    const current = stats.crashesSurvived || 0;
    const met = current >= tier.requirements.crashesSurvived;
    progress.crashesSurvived = {
      current,
      required: tier.requirements.crashesSurvived,
      met,
      label: "Crashes Survived",
    };
    if (!met) allMet = false;
  }

  // Check contract requirements
  if (tier.requirements.completedContracts !== undefined) {
    const current = stats.completedContractsCount || 0;
    const met = current >= tier.requirements.completedContracts;
    progress.completedContracts = {
      current,
      required: tier.requirements.completedContracts,
      met,
      label: "Contracts",
    };
    if (!met) allMet = false;
  }

  if (tier.requirements.completedLongTermContracts !== undefined) {
    const current = stats.completedLongTermCount || 0;
    const met = current >= tier.requirements.completedLongTermContracts;
    progress.completedLongTermContracts = {
      current,
      required: tier.requirements.completedLongTermContracts,
      met,
      label: "Long-term Contracts",
    };
    if (!met) allMet = false;
  }

  // Check scandal requirements
  if (tier.requirements.scandalsSurvived !== undefined) {
    const current = stats.scandalsSurvived || 0;
    const met = current >= tier.requirements.scandalsSurvived;
    progress.scandalsSurvived = {
      current,
      required: tier.requirements.scandalsSurvived,
      met,
      label: "Scandals Survived",
    };
    if (!met) allMet = false;
  }

  // Check building requirements
  let buildingProgress: TierCheckResult["buildingProgress"];

  // BuildingsAny - need at least ONE of the requirements met
  if (tier.requirements.buildingsAny && tier.requirements.buildingsAny.length > 0 && stats.buildings) {
    const requirements = tier.requirements.buildingsAny.map((req) => {
      const building = PATHS[path].buildings.find((b) => b.id === req.id);
      const current = stats.buildings![req.id] || 0;
      return {
        id: req.id,
        name: building?.name || req.id,
        current,
        required: req.count,
        met: current >= req.count,
      };
    });
    const anyMet = requirements.some((r) => r.met);
    buildingProgress = {
      type: "any",
      requirements,
      met: anyMet,
    };
    if (!anyMet) allMet = false;
  }

  // BuildingsAll - need ALL requirements met
  if (tier.requirements.buildingsAll && tier.requirements.buildingsAll.length > 0 && stats.buildings) {
    const requirements = tier.requirements.buildingsAll.map((req) => {
      const building = PATHS[path].buildings.find((b) => b.id === req.id);
      const current = stats.buildings![req.id] || 0;
      return {
        id: req.id,
        name: building?.name || req.id,
        current,
        required: req.count,
        met: current >= req.count,
      };
    });
    const allBuildingsMet = requirements.every((r) => r.met);
    buildingProgress = {
      type: "all",
      requirements,
      met: allBuildingsMet,
    };
    if (!allBuildingsMet) allMet = false;
  }

  return { met: allMet, progress, buildingProgress };
}

export function getAllBuildingIds(path: PathType): string[] {
  return PATHS[path].buildings.map((b) => b.id);
}
