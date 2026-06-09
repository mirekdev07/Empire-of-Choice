import { create } from "zustand";
import { PathType, getAvailableBuildings } from "@/config/gamedata";
import { ActiveEvent, GameEvent, rollForEvent } from "@/config/events";
import { ActiveContract, Contract, generateContractOffer } from "@/config/contracts";

// Content decay rates by tier (per minute)
const CONTENT_DECAY_RATES: Record<number, number> = {
  1: 0.02, // -2% per minute in Tier 1
  2: 0.01, // -1% per minute in Tier 2
  // Tier 3+ has no decay (employees handle it)
};

const PUBLISH_BONUS = 0.10; // +10% production
const PUBLISH_DURATION = 30; // 30 seconds

// Reputation mechanics
const REPUTATION_PUBLISH_COOLDOWN = 60000; // 1 minute cooldown for reputation from publishing
const REPUTATION_INACTIVITY_THRESHOLD = 300000; // 5 minutes of inactivity starts decay (for testing, normally 24h)
const REPUTATION_INACTIVITY_DECAY_RATE = 2; // -2 reputation per decay tick
const REPUTATION_INACTIVITY_CHECK_INTERVAL = 60000; // Check inactivity every minute

// Follower milestones for reputation bonus
const FOLLOWER_MILESTONES = [100, 1000, 10000, 100000, 1000000, 10000000];

// Event system
const EVENT_CHECK_INTERVAL = 10000; // Check for new events every 10 seconds
const EVENT_HOURS_PER_CHECK = 10 / 3600; // Simulated hours per check (for faster events in testing)

// Employee morale system (Tier 3+)
const MORALE_DECAY_RATE = 0.001; // -0.1% per second when inactive
const MORALE_RECOVERY_RATE = 0.005; // +0.5% per second when active (publishing)
const MORALE_MIN = 0.5; // Minimum 50% productivity
const MORALE_MAX = 1.2; // Maximum 120% productivity (bonus for high morale)

// Fixed costs (Tier 3+ employees)
const EMPLOYEE_BUILDING_IDS = ["m3_editor", "m3_writer", "m3_manager", "m3_studio", "m3_agency"];
const EMPLOYEE_COST_RATE = 0.2; // 20% of base production goes to salaries

// Diversification bonus (Tier 4+) - bonus for having different asset types
const DIVERSIFICATION_BONUS_PER_TYPE = 0.05; // +5% per unique building type
const DIVERSIFICATION_MAX_BONUS = 0.5; // Maximum 50% bonus

// Collaboration synergies (Tier 2+) - bonus for having specific building combinations
const COLLABORATION_SYNERGIES: { buildings: string[]; bonus: number; name: string }[] = [
  { buildings: ["m2_youtube", "m2_podcast"], bonus: 0.15, name: "YouTube + Podcast" },
  { buildings: ["m2_youtube", "m2_merch"], bonus: 0.10, name: "YouTube + Merch" },
  { buildings: ["m2_newsletter", "m2_podcast"], bonus: 0.10, name: "Newsletter + Podcast" },
  { buildings: ["m1_blog", "m2_newsletter"], bonus: 0.08, name: "Blog + Newsletter" },
  { buildings: ["m1_social", "m2_youtube"], bonus: 0.12, name: "Social + YouTube" },
];

// Industrial constants
const MACHINE_DECAY_RATE = 0.01; // -1% kondycji na minutę
const MACHINE_REPAIR_AMOUNT = 20; // +20% kondycji przy naprawie
const INDUSTRIAL_EMPLOYEE_BUILDING_IDS = ["i2_workers", "i3_training"]; // Budynki z pracownikami
const INDUSTRIAL_EMPLOYEE_COST_RATE = 0.15; // 15% produkcji idzie na pensje

// Market influence (Tier 5 Industrial)
const MARKET_INFLUENCE_THRESHOLD = 500; // Base production for market influence
const MARKET_INFLUENCE_MAX_BONUS = 0.5; // Max +50% bonus from market influence

// Finance constants
const FINANCE_COURSE_BONUS = 0.05; // +5% from investment course
const FINANCE_TERMINAL_BONUS = 0.10; // +10% transaction speed
const FINANCE_RESEARCH_BONUS = 0.15; // +15% market prediction

// Market cycle durations (in milliseconds)
const MARKET_CYCLE_MIN_DURATION = 120000; // 2 minutes minimum
const MARKET_CYCLE_MAX_DURATION = 300000; // 5 minutes maximum

// Market phases and their multipliers
const MARKET_PHASE_MULTIPLIERS: Record<string, number> = {
  "bull": 1.35, // +35% in bull market
  "stable": 1.0,
  "correction": 0.85, // -15% in correction
  "bear": 0.60, // -40% in bear market
  "crash": 0.30, // -70% in crash
};

// Volatility multipliers for different volatility levels
const VOLATILITY_MULTIPLIERS: Record<string, { min: number; max: number }> = {
  "none": { min: 1.0, max: 1.0 },
  "low": { min: 0.95, max: 1.05 },
  "medium": { min: 0.85, max: 1.15 },
  "high": { min: 0.70, max: 1.30 },
  "extreme": { min: 0.40, max: 1.60 },
  "configurable": { min: 0.50, max: 1.50 },
};

// Leverage settings
const LEVERAGE_COSTS: Record<number, number> = {
  1: 0,       // No cost
  2: 0.005,   // 0.5% per minute
  5: 0.015,   // 1.5% per minute
  10: 0.03,   // 3% per minute
  20: 0.05,   // 5% per minute
};

const LEVERAGE_MARGIN_CALL_THRESHOLDS: Record<number, number> = {
  1: 0,      // No margin call
  2: 0.50,   // 50% loss triggers margin call
  5: 0.20,   // 20% loss
  10: 0.10,  // 10% loss
  20: 0.05,  // 5% loss
};

interface GameState {
  // Core state
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
  path: PathType | null;
  lastSaveTime: Date;
  isLoaded: boolean;

  // Industrial-specific computed
  resourcesPerSecond: number; // Netto surowce/s (może być ujemne)
  marketInfluence: number; // Wpływ na rynek (Tier 5 Industrial, 0-0.5)

  // Finance-specific state
  aum: number; // Assets Under Management (kapitał klientów)
  creditRating: string; // AAA to D
  leverage: number; // 1x to 20x
  marketPhase: string; // bull, stable, correction, bear, crash
  marketPhaseEndTime: number; // timestamp when current phase ends
  crashesSurvived: number; // Number of market crashes survived
  hedgingEnabled: boolean; // Whether hedging is active
  aumPerSecond: number; // Computed AUM generation rate
  volatilityMultiplier: number; // Current random volatility multiplier
  peakAum: number; // Highest AUM reached (for margin call calculation)
  lastMarginCallTime: number; // Timestamp of last margin call (cooldown)
  spreadIncome: number; // Income from market making (Tier 5)
  financeMarketInfluence: number; // Ability to influence market phases (Tier 5)

  // Content decay & publish system
  contentMultiplier: number; // 0.0 to 1.0, decays over time
  publishBonusActive: boolean;
  publishBonusEndTime: number; // timestamp
  lastPublishTime: number; // timestamp

  // Activity tracking for reputation
  lastActivityTime: number; // timestamp
  lastReputationFromPublish: number; // timestamp - when last got reputation from publishing
  lastInactivityCheck: number; // timestamp - last time we checked for inactivity
  reachedFollowerMilestones: number[]; // which milestones have been achieved

  // Event system
  activeEvents: ActiveEvent[];
  eventHistory: { event: GameEvent; time: number }[];
  lastEventCheck: number; // timestamp
  eventMultiplier: number; // combined multiplier from active events

  // Employee system (Tier 3+)
  employeeMorale: number; // 0.5 to 1.2 (50% to 120%)
  fixedCostsPerSecond: number; // Calculated from employees

  // Diversification bonus (Tier 4+)
  diversificationBonus: number; // 0 to 0.5 (0% to 50%)

  // Collaboration synergy bonus (Tier 2+)
  synergyBonus: number; // Bonus from building combinations
  activeSynergies: string[]; // Names of active synergies

  // Prestige system
  timesPrestiged: number;
  totalLifetimeEarnings: number;
  highestTierReached: number;
  prestigeProductionBonus: number;
  prestigeMoneyBonus: number;
  prestigeFollowersBonus: number;
  prestigeReputationBonus: number;
  prestigeAumBonus: number; // Finance prestige bonus
  prestigeRatingBonus: number; // Finance prestige bonus (rating levels)

  // Contract system
  activeContracts: ActiveContract[];
  pendingContractOffer: Contract | null;
  completedContractsCount: number;
  completedLongTermCount: number;
  completedCollaborationsCount: number;
  lastContractCheck: number; // timestamp for contract offer generation
  autoAcceptContracts: boolean; // Auto-accept contracts toggle
  autoAcceptMinReward: number; // Minimum reward to auto-accept

  // Scandal tracking (for Tier 5 requirement)
  scandalsEndured: number;
  scandalsSurvived: number; // Survived without losing >50% followers

  // Ad bonus - extra contract slots (from watching ads)
  adBonusExpiresAt: number | null; // timestamp when bonus expires

  // Production rates (computed, before multipliers)
  baseMoneyPerSecond: number;
  baseFollowersPerSecond: number;
  // Effective rates (after multipliers)
  moneyPerSecond: number;
  followersPerSecond: number;

  // Actions
  setMoney: (money: number) => void;
  addMoney: (amount: number) => void;
  setFollowers: (followers: number) => void;
  addFollowers: (amount: number) => void;
  setReputation: (reputation: number) => void;
  addReputation: (amount: number) => void;
  setCurrentTier: (tier: number) => void;
  setTotalEarnings: (total: number) => void;
  addToTotalEarnings: (amount: number) => void;
  setBuildings: (buildings: Record<string, number>) => void;
  incrementBuilding: (buildingId: string) => void;
  decrementBuilding: (buildingId: string) => void;
  setPath: (path: PathType | null) => void;
  setIsLoaded: (loaded: boolean) => void;
  updateProductionRates: () => void;

  // New actions for content/publish system
  publish: () => void;
  setContentMultiplier: (multiplier: number) => void;

  // Event system actions
  triggerEvent: (event: GameEvent) => void;
  dismissEvent: (eventId: string) => void;
  updateEventMultiplier: () => void;

  // Contract system actions
  acceptContract: (contract: Contract) => void;
  declineContract: () => void;
  checkContracts: () => void;
  setAutoAcceptContracts: (enabled: boolean) => void;
  setAutoAcceptMinReward: (minReward: number) => void;

  // Ad bonus actions
  setAdBonusExpiresAt: (expiresAt: number | null) => void;
  isAdBonusActive: () => boolean;
  getMaxContracts: () => number;

  // Industrial-specific actions
  setResources: (resources: number) => void;
  addResources: (amount: number) => void;
  setEfficiency: (efficiency: number) => void;
  setMachineCondition: (condition: number) => void;
  repairMachines: () => void; // Napraw maszyny (+20% kondycji)

  // Finance-specific actions
  setAum: (aum: number) => void;
  addAum: (amount: number) => void;
  setCreditRating: (rating: string) => void;
  setLeverage: (leverage: number) => void;
  setMarketPhase: (phase: string) => void;
  toggleHedging: () => void;
  checkMarketCycle: () => void; // Check and update market phase

  // Initialize state from server
  initializeFromServer: (data: {
    saveId: string;
    saveName: string;
    money: number;
    followers: number;
    resources?: number;
    reputation: number;
    efficiency?: number;
    machineCondition?: number;
    currentTier: number;
    totalEarnings: number;
    buildings: Record<string, number>;
    path: PathType;
    lastSaveTime: Date;
    contentMultiplier?: number;
    // Contract system
    activeContracts?: ActiveContract[];
    autoAcceptContracts?: boolean;
    autoAcceptMinReward?: number;
    completedContractsCount?: number;
    completedLongTermCount?: number;
    completedCollaborationsCount?: number;
    // Prestige data
    timesPrestiged?: number;
    totalLifetimeEarnings?: number;
    highestTierReached?: number;
    prestigeProductionBonus?: number;
    prestigeMoneyBonus?: number;
    prestigeFollowersBonus?: number;
    prestigeReputationBonus?: number;
    // Finance data
    aum?: number;
    creditRating?: string;
    leverage?: number;
    marketPhase?: string;
    crashesSurvived?: number;
    hedgingEnabled?: boolean;
    prestigeAumBonus?: number;
    prestigeRatingBonus?: number;
    // Ad bonus
    adBonusExpiresAt?: Date | null;
  }) => void;

  // Game tick - called every frame
  tick: (deltaSeconds: number) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  saveId: "",
  saveName: "",
  money: 100,
  followers: 0,
  resources: 50, // Starting resources for Industrial
  reputation: 10,
  efficiency: 100, // Starting efficiency for Industrial (100%)
  machineCondition: 100, // Starting machine condition for Industrial (100%)
  currentTier: 1,
  totalEarnings: 0,
  buildings: {},
  path: null,
  lastSaveTime: new Date(),
  isLoaded: false,

  // Industrial-specific computed
  resourcesPerSecond: 0,
  marketInfluence: 0,

  // Finance-specific state
  aum: 0,
  creditRating: "BBB",
  leverage: 1,
  marketPhase: "stable",
  marketPhaseEndTime: 0,
  crashesSurvived: 0,
  hedgingEnabled: false,
  aumPerSecond: 0,
  volatilityMultiplier: 1.0,
  peakAum: 0,
  lastMarginCallTime: 0,
  spreadIncome: 0,
  financeMarketInfluence: 0,

  // Content system
  contentMultiplier: 1.0,
  publishBonusActive: false,
  publishBonusEndTime: 0,
  lastPublishTime: 0,

  // Activity tracking
  lastActivityTime: Date.now(),
  lastReputationFromPublish: 0,
  lastInactivityCheck: Date.now(),
  reachedFollowerMilestones: [],

  // Event system
  activeEvents: [],
  eventHistory: [],
  lastEventCheck: Date.now(),
  eventMultiplier: 1.0,

  // Employee system
  employeeMorale: 1.0, // Start at 100%
  fixedCostsPerSecond: 0,

  // Diversification bonus
  diversificationBonus: 0,

  // Synergy bonus
  synergyBonus: 0,
  activeSynergies: [],

  // Prestige system
  timesPrestiged: 0,
  totalLifetimeEarnings: 0,
  highestTierReached: 1,
  prestigeProductionBonus: 1.0,
  prestigeMoneyBonus: 0,
  prestigeFollowersBonus: 0,
  prestigeReputationBonus: 0,
  prestigeAumBonus: 0,
  prestigeRatingBonus: 0,

  // Contract system
  activeContracts: [],
  pendingContractOffer: null,
  completedContractsCount: 0,
  completedLongTermCount: 0,
  completedCollaborationsCount: 0,
  lastContractCheck: Date.now(),
  autoAcceptContracts: false,
  autoAcceptMinReward: 0,

  // Scandal tracking
  scandalsEndured: 0,
  scandalsSurvived: 0,

  // Ad bonus
  adBonusExpiresAt: null,

  // Production rates
  baseMoneyPerSecond: 0,
  baseFollowersPerSecond: 0,
  moneyPerSecond: 0,
  followersPerSecond: 0,

  // Actions
  setMoney: (money) => set({ money }),

  addMoney: (amount) => {
    set((state) => ({
      money: state.money + amount,
      totalEarnings: state.totalEarnings + (amount > 0 ? amount : 0),
    }));
  },

  setFollowers: (followers) => set({ followers }),

  addFollowers: (amount) => {
    set((state) => ({ followers: Math.max(0, state.followers + amount) }));
  },

  setReputation: (reputation) => set({ reputation: Math.max(0, Math.min(100, reputation)) }),

  addReputation: (amount) => {
    set((state) => ({
      reputation: Math.max(0, Math.min(100, state.reputation + amount))
    }));
  },

  setCurrentTier: (tier) => {
    set({ currentTier: tier });
    get().updateProductionRates();
  },

  setTotalEarnings: (total) => set({ totalEarnings: total }),

  addToTotalEarnings: (amount) => {
    set((state) => ({ totalEarnings: state.totalEarnings + amount }));
  },

  setBuildings: (buildings) => {
    set({ buildings });
    get().updateProductionRates();
  },

  incrementBuilding: (buildingId) => {
    set((state) => ({
      buildings: {
        ...state.buildings,
        [buildingId]: (state.buildings[buildingId] || 0) + 1,
      },
      lastActivityTime: Date.now(),
    }));
    get().updateProductionRates();
  },

  decrementBuilding: (buildingId) => {
    set((state) => ({
      buildings: {
        ...state.buildings,
        [buildingId]: Math.max(0, (state.buildings[buildingId] || 0) - 1),
      },
    }));
    get().updateProductionRates();
  },

  setPath: (path) => set({ path }),

  setIsLoaded: (loaded) => set({ isLoaded: loaded }),

  // Publish action - resets content multiplier and gives temporary bonus
  publish: () => {
    const now = Date.now();
    const { lastReputationFromPublish, reputation, employeeMorale, currentTier } = get();

    // Check if we can get reputation from publishing (cooldown)
    const canGetReputation = now - lastReputationFromPublish >= REPUTATION_PUBLISH_COOLDOWN;

    // Boost morale when publishing (Tier 3+)
    let newMorale = employeeMorale;
    if (currentTier >= 3) {
      newMorale = Math.min(MORALE_MAX, employeeMorale + 0.05); // +5% morale per publish
    }

    set({
      contentMultiplier: 1.0, // Reset decay
      publishBonusActive: true,
      publishBonusEndTime: now + PUBLISH_DURATION * 1000,
      lastPublishTime: now,
      lastActivityTime: now,
      employeeMorale: newMorale,
      // Give +1 reputation if cooldown passed
      ...(canGetReputation ? {
        reputation: Math.min(100, reputation + 1),
        lastReputationFromPublish: now,
      } : {}),
    });
    get().updateProductionRates();
  },

  setContentMultiplier: (multiplier) => {
    set({ contentMultiplier: Math.max(0.1, Math.min(1.0, multiplier)) });
    get().updateProductionRates();
  },

  // Event system actions
  triggerEvent: (event: GameEvent) => {
    const now = Date.now();
    const { money, followers, reputation, resources, efficiency, machineCondition, activeEvents, eventHistory, scandalsEndured, scandalsSurvived } = get();

    // Create active event
    const activeEvent: ActiveEvent = {
      event,
      startTime: now,
      endTime: event.duration ? now + event.duration * 1000 : undefined,
      applied: false,
    };

    // Apply instant effects
    let newMoney = money;
    let newFollowers = followers;
    let newReputation = reputation;
    let newResources = resources;
    let newEfficiency = efficiency;
    let newMachineCondition = machineCondition;

    if (event.effects.money) {
      newMoney = Math.max(0, money + event.effects.money);
    }
    if (event.effects.followers) {
      newFollowers = Math.max(0, followers + event.effects.followers);
    }
    if (event.effects.followersPercent) {
      const change = Math.floor(followers * (event.effects.followersPercent / 100));
      newFollowers = Math.max(0, followers + change);
    }
    if (event.effects.reputation) {
      newReputation = Math.max(0, Math.min(100, reputation + event.effects.reputation));
    }

    // Industrial-specific instant effects
    if (event.effects.resources) {
      newResources = Math.max(0, resources + event.effects.resources);
    }
    if (event.effects.efficiency) {
      newEfficiency = Math.max(0, Math.min(150, efficiency + event.effects.efficiency));
    }
    if (event.effects.machineCondition) {
      newMachineCondition = Math.max(0, Math.min(100, machineCondition + event.effects.machineCondition));
    }

    // Finance-specific instant effects
    const { aum, creditRating, leverage } = get();
    let newAum = aum;
    let newCreditRating = creditRating;
    let newLeverage = leverage;

    if (event.effects.aum) {
      newAum = Math.max(0, aum + event.effects.aum);
    }
    if (event.effects.aumPercent) {
      const change = aum * (event.effects.aumPercent / 100);
      newAum = Math.max(0, aum + change);
    }
    if (event.effects.creditRatingChange) {
      const CREDIT_RATINGS_LIST = ["D", "C", "CC", "CCC", "B", "BB", "BBB", "A", "AA", "AAA"];
      const currentIndex = CREDIT_RATINGS_LIST.indexOf(creditRating);
      const newIndex = Math.max(0, Math.min(9, currentIndex + event.effects.creditRatingChange));
      newCreditRating = CREDIT_RATINGS_LIST[newIndex];
    }
    if (event.effects.leverageReset) {
      newLeverage = 1;
    }

    activeEvent.applied = true;

    // Track scandals for Tier 5 requirement
    let newScandalsEndured = scandalsEndured;
    let newScandalsSurvived = scandalsSurvived;

    if (event.type === "scandal") {
      newScandalsEndured++;
      // Check if survived (didn't lose more than 50% followers)
      const followerLoss = followers - newFollowers;
      const lossPercent = (followerLoss / followers) * 100;
      if (lossPercent <= 50) {
        newScandalsSurvived++;
      }
    }

    // Add to active events (only if it has duration for ongoing effects)
    const newActiveEvents = event.duration
      ? [...activeEvents, activeEvent]
      : activeEvents;

    set({
      money: newMoney,
      followers: newFollowers,
      reputation: newReputation,
      resources: newResources,
      efficiency: newEfficiency,
      machineCondition: newMachineCondition,
      // Finance-specific state
      aum: newAum,
      creditRating: newCreditRating,
      leverage: newLeverage,
      activeEvents: newActiveEvents,
      eventHistory: [...eventHistory.slice(-19), { event, time: now }],
      scandalsEndured: newScandalsEndured,
      scandalsSurvived: newScandalsSurvived,
    });

    get().updateEventMultiplier();
    get().updateProductionRates();
  },

  dismissEvent: (eventId: string) => {
    const { activeEvents } = get();
    set({
      activeEvents: activeEvents.filter((ae) => ae.event.id !== eventId),
    });
    get().updateEventMultiplier();
    get().updateProductionRates();
  },

  updateEventMultiplier: () => {
    const { activeEvents, path } = get();
    let multiplier = 1.0;
    let efficiencyMult = 1.0;

    for (const activeEvent of activeEvents) {
      if (activeEvent.event.effects.productionMultiplier) {
        multiplier *= activeEvent.event.effects.productionMultiplier;
      }
      // Track efficiency multiplier for Industrial events
      if (activeEvent.event.effects.efficiencyMultiplier) {
        efficiencyMult *= activeEvent.event.effects.efficiencyMultiplier;
      }
    }

    // Apply efficiency event multiplier to actual efficiency for Industrial path
    if (path === "INDUSTRIAL" && efficiencyMult !== 1.0) {
      const { efficiency } = get();
      // Store temporary modified efficiency for display/calculation
      // Note: This is handled in updateProductionRates via eventMultiplier
    }

    set({ eventMultiplier: multiplier });
  },

  // Contract system actions
  acceptContract: (contract: Contract) => {
    const now = Date.now();
    const activeContract: ActiveContract = {
      contract,
      startTime: now,
      endTime: now + contract.duration * 1000,
      completed: false,
    };

    set((state) => ({
      activeContracts: [...state.activeContracts, activeContract],
      pendingContractOffer: null,
    }));
  },

  declineContract: () => {
    set({ pendingContractOffer: null });
  },

  setAutoAcceptContracts: (enabled: boolean) => {
    set({ autoAcceptContracts: enabled });
  },

  setAutoAcceptMinReward: (minReward: number) => {
    set({ autoAcceptMinReward: minReward });
  },

  // Ad bonus actions
  setAdBonusExpiresAt: (expiresAt: number | null) => {
    set({ adBonusExpiresAt: expiresAt });
  },

  isAdBonusActive: () => {
    const { adBonusExpiresAt } = get();
    if (!adBonusExpiresAt) return false;
    return Date.now() < adBonusExpiresAt;
  },

  getMaxContracts: () => {
    const { adBonusExpiresAt } = get();
    const BASE_MAX_CONTRACTS = 3;
    const AD_BONUS_CONTRACTS = 3;

    if (adBonusExpiresAt && Date.now() < adBonusExpiresAt) {
      return BASE_MAX_CONTRACTS + AD_BONUS_CONTRACTS;
    }
    return BASE_MAX_CONTRACTS;
  },

  // Industrial-specific actions
  setResources: (resources: number) => set({ resources: Math.max(0, resources) }),

  addResources: (amount: number) => {
    set((state) => ({ resources: Math.max(0, state.resources + amount) }));
  },

  setEfficiency: (efficiency: number) => {
    set({ efficiency: Math.max(0, Math.min(150, efficiency)) });
    get().updateProductionRates();
  },

  setMachineCondition: (condition: number) => {
    set({ machineCondition: Math.max(0, Math.min(100, condition)) });
    get().updateProductionRates();
  },

  repairMachines: () => {
    const { machineCondition, money, currentTier } = get();
    // Repair cost scales with tier
    const repairCost = currentTier * 100;

    if (money >= repairCost) {
      const newCondition = Math.min(100, machineCondition + MACHINE_REPAIR_AMOUNT);
      set({
        machineCondition: newCondition,
        money: money - repairCost,
        lastActivityTime: Date.now(),
      });
      get().updateProductionRates();
    }
  },

  // Finance-specific actions
  setAum: (aum: number) => {
    set({ aum: Math.max(0, aum) });
    get().updateProductionRates();
  },

  addAum: (amount: number) => {
    const { aum } = get();
    set({ aum: Math.max(0, aum + amount) });
    get().updateProductionRates();
  },

  setCreditRating: (rating: string) => {
    set({ creditRating: rating });
    get().updateProductionRates();
  },

  setLeverage: (leverage: number) => {
    // Valid leverage levels: 1, 2, 5, 10, 20
    const validLeverage = [1, 2, 5, 10, 20].includes(leverage) ? leverage : 1;
    set({ leverage: validLeverage });
    get().updateProductionRates();
  },

  setMarketPhase: (phase: string) => {
    const validPhases = ["bull", "stable", "correction", "bear", "crash"];
    if (validPhases.includes(phase)) {
      // Set random duration for the new phase
      const duration = MARKET_CYCLE_MIN_DURATION + Math.random() * (MARKET_CYCLE_MAX_DURATION - MARKET_CYCLE_MIN_DURATION);
      set({
        marketPhase: phase,
        marketPhaseEndTime: Date.now() + duration,
      });
      get().updateProductionRates();
    }
  },

  toggleHedging: () => {
    const { hedgingEnabled, currentTier } = get();
    // Hedging only available at Tier 3+
    if (currentTier >= 3) {
      set({ hedgingEnabled: !hedgingEnabled });
      get().updateProductionRates();
    }
  },

  checkMarketCycle: () => {
    const { marketPhaseEndTime, marketPhase, path, financeMarketInfluence } = get();
    if (path !== "FINANCE") return;

    const now = Date.now();
    if (now >= marketPhaseEndTime) {
      // Time for a new market phase
      const phases = ["bull", "stable", "correction", "bear"];

      // Market influence reduces crash chance (5% base, can be reduced to 2.5% with max influence)
      const crashChance = 0.05 * (1 - financeMarketInfluence);

      let newPhase: string;
      if (Math.random() < crashChance) {
        newPhase = "crash";
      } else {
        // Tendency to move to adjacent phases
        // With market influence, bias towards favorable phases (bull, stable)
        const currentIndex = phases.indexOf(marketPhase === "crash" ? "bear" : marketPhase);

        // Base 50% chance to go up or down
        // With influence, increase chance to move towards favorable phases
        const upwardBias = 0.5 + (financeMarketInfluence * 0.3); // Up to 80% chance to go up with max influence
        const direction = Math.random() < upwardBias ? -1 : 1; // -1 is towards bull (index 0)

        const newIndex = Math.max(0, Math.min(phases.length - 1, currentIndex + direction));
        newPhase = phases[newIndex];
      }

      // Calculate duration with market influence
      // Favorable phases (bull, stable) are longer, unfavorable (correction, bear, crash) are shorter
      let baseDuration = MARKET_CYCLE_MIN_DURATION + Math.random() * (MARKET_CYCLE_MAX_DURATION - MARKET_CYCLE_MIN_DURATION);

      if (financeMarketInfluence > 0) {
        if (newPhase === "bull" || newPhase === "stable") {
          // Extend favorable phases by up to 50%
          baseDuration *= (1 + financeMarketInfluence);
        } else if (newPhase === "bear" || newPhase === "crash") {
          // Shorten unfavorable phases by up to 30%
          baseDuration *= (1 - financeMarketInfluence * 0.6);
        }
      }

      set({
        marketPhase: newPhase,
        marketPhaseEndTime: now + baseDuration,
        // Update volatility multiplier randomly
        volatilityMultiplier: 0.9 + Math.random() * 0.2, // 0.9 to 1.1
      });

      // If we survived a crash, increment counter
      if (marketPhase === "crash" && newPhase !== "crash") {
        set((state) => ({ crashesSurvived: state.crashesSurvived + 1 }));
      }

      get().updateProductionRates();
    }
  },

  checkContracts: () => {
    const now = Date.now();
    const { activeContracts, money, followers, reputation, resources, efficiency } = get();

    let newMoney = money;
    let newFollowers = followers;
    let newReputation = reputation;
    let newResources = resources;
    let newEfficiency = efficiency;
    let completedCount = 0;
    let completedLongTerm = 0;
    let completedCollabs = 0;
    let completedProduction = 0;

    const remainingContracts: ActiveContract[] = [];

    for (const ac of activeContracts) {
      if (now >= ac.endTime && !ac.completed) {
        // Contract completed successfully
        newMoney += ac.contract.reward.money;
        newReputation = Math.min(100, newReputation + ac.contract.reward.reputation);
        if (ac.contract.reward.followers) {
          newFollowers += ac.contract.reward.followers;
        }
        // Industrial contract rewards
        if (ac.contract.reward.efficiency) {
          newEfficiency = Math.min(150, newEfficiency + ac.contract.reward.efficiency);
        }
        if (ac.contract.reward.resources) {
          newResources += ac.contract.reward.resources;
        }
        completedCount++;

        if (ac.contract.type === "long_term") {
          completedLongTerm++;
        } else if (ac.contract.type === "collaboration") {
          completedCollabs++;
        } else if (ac.contract.type === "production") {
          completedProduction++;
        }

        ac.completed = true;
      }

      // Keep completed contracts for a bit to show completion, then remove
      if (!ac.completed || now < ac.endTime + 5000) {
        remainingContracts.push(ac);
      }
    }

    if (completedCount > 0 || remainingContracts.length !== activeContracts.length) {
      set((state) => ({
        activeContracts: remainingContracts,
        money: newMoney,
        followers: newFollowers,
        reputation: newReputation,
        resources: newResources,
        efficiency: newEfficiency,
        completedContractsCount: state.completedContractsCount + completedCount,
        completedLongTermCount: state.completedLongTermCount + completedLongTerm,
        completedCollaborationsCount: state.completedCollaborationsCount + completedCollabs,
      }));
    }
  },

  updateProductionRates: () => {
    const { path, buildings, currentTier, contentMultiplier, publishBonusActive, eventMultiplier, employeeMorale, prestigeProductionBonus, efficiency, machineCondition, resources } = get();
    if (!path) {
      set({ baseMoneyPerSecond: 0, baseFollowersPerSecond: 0, moneyPerSecond: 0, followersPerSecond: 0, fixedCostsPerSecond: 0, resourcesPerSecond: 0 });
      return;
    }

    let totalMoney = 0;
    let totalFollowers = 0;
    let totalResourcesPerSecond = 0; // Net resources/s for Industrial
    let employeeProduction = 0; // Production from employees (for fixed costs calculation)

    const availableBuildings = getAvailableBuildings(path, currentTier);

    for (const building of availableBuildings) {
      const count = buildings[building.id] || 0;
      if (count > 0) {
        const production = building.baseProduction * count;
        totalMoney += production;
        totalFollowers += building.followersPerSecond * count;

        // Calculate resources per second for Industrial path
        if (path === "INDUSTRIAL" && building.resourcesPerSecond !== undefined) {
          totalResourcesPerSecond += building.resourcesPerSecond * count;
        }

        // Track employee production for fixed costs (Tier 3+ buildings for Media)
        if (path === "MEDIA" && EMPLOYEE_BUILDING_IDS.includes(building.id)) {
          employeeProduction += production;
        }
        // Track Industrial employee production for fixed costs (Tier 2+ for Industrial)
        if (path === "INDUSTRIAL" && INDUSTRIAL_EMPLOYEE_BUILDING_IDS.includes(building.id)) {
          employeeProduction += production;
        }
      }
    }

    // Calculate fixed costs (salaries for employees)
    let fixedCosts = 0;
    if (path === "MEDIA") {
      fixedCosts = employeeProduction * EMPLOYEE_COST_RATE;
    } else if (path === "INDUSTRIAL") {
      fixedCosts = employeeProduction * INDUSTRIAL_EMPLOYEE_COST_RATE;
    }

    // Calculate multipliers based on path
    let effectiveMultiplier = 1.0;

    if (path === "MEDIA") {
      // Content decay only affects Tier 1 and 2
      if (currentTier <= 2) {
        effectiveMultiplier *= contentMultiplier;
      }
      // Publish bonus
      if (publishBonusActive) {
        effectiveMultiplier *= (1 + PUBLISH_BONUS);
      }
      // Event multiplier
      effectiveMultiplier *= eventMultiplier;

      // Employee morale affects Tier 3+ employee production
      if (currentTier >= 3 && employeeProduction > 0) {
        // Apply morale only to employee portion
        const nonEmployeeProduction = totalMoney - employeeProduction;
        const moraleAdjustedEmployeeProduction = employeeProduction * employeeMorale;
        totalMoney = nonEmployeeProduction + moraleAdjustedEmployeeProduction;
      }

      // Apply prestige production bonus
      effectiveMultiplier *= prestigeProductionBonus;
    } else if (path === "INDUSTRIAL") {
      // Industrial path multipliers

      // Efficiency multiplier (0-150% -> 0.0-1.5)
      const efficiencyMultiplier = efficiency / 100;
      effectiveMultiplier *= efficiencyMultiplier;

      // Machine condition affects production
      // 100-80%: full production
      // 80-50%: -10%
      // 50-30%: -25%
      // 30-0%: -50%
      let conditionMultiplier = 1.0;
      if (machineCondition < 30) {
        conditionMultiplier = 0.5;
      } else if (machineCondition < 50) {
        conditionMultiplier = 0.75;
      } else if (machineCondition < 80) {
        conditionMultiplier = 0.9;
      }
      effectiveMultiplier *= conditionMultiplier;

      // Resource availability affects production
      // If consuming resources faster than producing, check if we have enough
      if (totalResourcesPerSecond < 0) {
        // We're consuming resources
        const consumption = Math.abs(totalResourcesPerSecond);
        // If resources are running low, reduce production proportionally
        // resources < 10 seconds worth of consumption = reduced production
        const secondsOfResources = resources / consumption;
        if (secondsOfResources < 10) {
          const resourceMultiplier = Math.max(0.1, secondsOfResources / 10);
          effectiveMultiplier *= resourceMultiplier;
        }
      }

      // Apply prestige production bonus
      effectiveMultiplier *= prestigeProductionBonus;
    } else if (path === "FINANCE") {
      // Finance path multipliers
      const { aum, creditRating, leverage, marketPhase, hedgingEnabled, volatilityMultiplier } = get();

      // Calculate AUM from client buildings
      let totalAumPerSecond = 0;
      for (const building of availableBuildings) {
        const count = buildings[building.id] || 0;
        if (count > 0 && building.aumPerSecond) {
          totalAumPerSecond += building.aumPerSecond * count;
        }
      }

      // Credit rating multiplier (affects production and client attraction)
      const ratingMultiplier = {
        "AAA": 1.50, "AA": 1.30, "A": 1.15, "BBB": 1.00,
        "BB": 0.80, "B": 0.60, "CCC": 0.40, "CC": 0.20, "C": 0.10, "D": 0
      }[creditRating] || 1.0;
      effectiveMultiplier *= ratingMultiplier;

      // Market phase multiplier
      const phaseMultiplier = MARKET_PHASE_MULTIPLIERS[marketPhase] || 1.0;

      // Apply hedging (reduces both gains and losses)
      let hedgingFactor = 1.0;
      if (hedgingEnabled) {
        // Hedging: in bull market +10% instead of +35%, in crash +5% instead of -70%
        if (phaseMultiplier > 1) {
          hedgingFactor = 0.3; // Only 30% of upside
        } else if (phaseMultiplier < 1) {
          hedgingFactor = 0.2; // Only 20% of downside (positive)
        }
      }

      // Calculate effective phase impact with hedging
      const hedgedPhaseMultiplier = 1 + (phaseMultiplier - 1) * (hedgingEnabled ? hedgingFactor : 1);
      effectiveMultiplier *= hedgedPhaseMultiplier;

      // Apply random volatility
      effectiveMultiplier *= volatilityMultiplier;

      // Leverage amplifies both gains and losses
      effectiveMultiplier *= leverage;

      // Leverage costs (per minute, converted to per second rate already accounted)
      const leverageCost = LEVERAGE_COSTS[leverage] || 0;
      if (leverageCost > 0) {
        fixedCosts += (totalMoney * leverageCost) / 60; // Convert per-minute to per-second
      }

      // Investment course bonus (+5% if owned)
      const hasCourse = (buildings["f1_course"] || 0) > 0;
      if (hasCourse) {
        effectiveMultiplier *= (1 + FINANCE_COURSE_BONUS);
      }

      // Research department bonus (+15% if owned)
      const hasResearch = (buildings["f3_research"] || 0) > 0;
      if (hasResearch) {
        effectiveMultiplier *= (1 + FINANCE_RESEARCH_BONUS);
      }

      // Apply prestige production bonus
      effectiveMultiplier *= prestigeProductionBonus;

      // Store Finance-specific calculated values
      set({
        aumPerSecond: totalAumPerSecond,
      });
    }

    // Calculate collaboration synergy bonus (Tier 2+ for MEDIA path)
    let synergyBonus = 0;
    const activeSynergies: string[] = [];
    if (path === "MEDIA" && currentTier >= 2) {
      for (const synergy of COLLABORATION_SYNERGIES) {
        // Check if player has all buildings in the synergy
        const hasAll = synergy.buildings.every((bid) => (buildings[bid] || 0) > 0);
        if (hasAll) {
          synergyBonus += synergy.bonus;
          activeSynergies.push(synergy.name);
        }
      }
      effectiveMultiplier *= (1 + synergyBonus);
    }

    // Calculate diversification bonus
    // MEDIA: Tier 4+, counts all unique building types
    // FINANCE: Tier 2+, counts unique Finance buildings
    let diversificationBonus = 0;
    if (path === "MEDIA" && currentTier >= 4) {
      // Count unique building types owned
      const uniqueTypes = Object.entries(buildings).filter(([_, count]) => count > 0).length;
      diversificationBonus = Math.min(
        DIVERSIFICATION_MAX_BONUS,
        uniqueTypes * DIVERSIFICATION_BONUS_PER_TYPE
      );
      effectiveMultiplier *= (1 + diversificationBonus);
    } else if (path === "FINANCE" && currentTier >= 2) {
      // Count unique Finance building types owned
      const uniqueAssets = Object.entries(buildings).filter(
        ([id, count]) => id.startsWith("f") && count > 0
      ).length;
      diversificationBonus = Math.min(
        DIVERSIFICATION_MAX_BONUS,
        uniqueAssets * DIVERSIFICATION_BONUS_PER_TYPE
      );
      effectiveMultiplier *= (1 + diversificationBonus);
    }

    // Calculate market influence (Tier 5 Industrial)
    // Higher production = more market influence = better prices
    let marketInfluence = 0;
    if (path === "INDUSTRIAL" && currentTier >= 5) {
      // Market influence based on how much production exceeds threshold
      const productionExcess = totalMoney - MARKET_INFLUENCE_THRESHOLD;
      if (productionExcess > 0) {
        // Logarithmic scaling: influence grows slower as production increases
        // At 500+ production: starts gaining influence
        // At 5000 production: ~50% bonus (max)
        marketInfluence = Math.min(
          MARKET_INFLUENCE_MAX_BONUS,
          Math.log10(productionExcess / 100 + 1) * 0.2
        );
        effectiveMultiplier *= (1 + marketInfluence);
      }
    }

    // Subtract fixed costs from money production
    const netMoney = totalMoney - fixedCosts;

    set({
      baseMoneyPerSecond: totalMoney,
      baseFollowersPerSecond: totalFollowers,
      moneyPerSecond: netMoney * effectiveMultiplier,
      followersPerSecond: totalFollowers * effectiveMultiplier,
      fixedCostsPerSecond: fixedCosts,
      diversificationBonus,
      synergyBonus,
      activeSynergies,
      resourcesPerSecond: totalResourcesPerSecond,
      marketInfluence,
    });
  },

  // Initialize from server
  initializeFromServer: (data) => {
    // Calculate already reached milestones from followers
    const reachedMilestones = FOLLOWER_MILESTONES.filter((m) => data.followers >= m);

    set({
      saveId: data.saveId,
      saveName: data.saveName,
      money: data.money,
      followers: data.followers,
      resources: data.resources ?? 50,
      reputation: data.reputation,
      efficiency: data.efficiency ?? 100,
      machineCondition: data.machineCondition ?? 100,
      currentTier: data.currentTier,
      totalEarnings: data.totalEarnings,
      buildings: data.buildings,
      path: data.path,
      lastSaveTime: data.lastSaveTime,
      contentMultiplier: data.contentMultiplier ?? 1.0,
      isLoaded: true,
      lastActivityTime: Date.now(),
      reachedFollowerMilestones: reachedMilestones,
      // Contract system - restore active contracts and settings
      activeContracts: data.activeContracts ?? [],
      autoAcceptContracts: data.autoAcceptContracts ?? false,
      autoAcceptMinReward: data.autoAcceptMinReward ?? 0,
      completedContractsCount: data.completedContractsCount ?? 0,
      completedLongTermCount: data.completedLongTermCount ?? 0,
      completedCollaborationsCount: data.completedCollaborationsCount ?? 0,
      // Prestige data
      timesPrestiged: data.timesPrestiged ?? 0,
      totalLifetimeEarnings: data.totalLifetimeEarnings ?? 0,
      highestTierReached: data.highestTierReached ?? 1,
      prestigeProductionBonus: data.prestigeProductionBonus ?? 1.0,
      prestigeMoneyBonus: data.prestigeMoneyBonus ?? 0,
      prestigeFollowersBonus: data.prestigeFollowersBonus ?? 0,
      prestigeReputationBonus: data.prestigeReputationBonus ?? 0,
      // Finance data
      aum: data.aum ?? 0,
      creditRating: data.creditRating ?? "BBB",
      leverage: data.leverage ?? 1,
      marketPhase: data.marketPhase ?? "stable",
      marketPhaseEndTime: Date.now() + MARKET_CYCLE_MIN_DURATION + Math.random() * (MARKET_CYCLE_MAX_DURATION - MARKET_CYCLE_MIN_DURATION),
      crashesSurvived: data.crashesSurvived ?? 0,
      hedgingEnabled: data.hedgingEnabled ?? false,
      prestigeAumBonus: data.prestigeAumBonus ?? 0,
      prestigeRatingBonus: data.prestigeRatingBonus ?? 0,
      // Ad bonus - convert Date to timestamp
      adBonusExpiresAt: data.adBonusExpiresAt ? new Date(data.adBonusExpiresAt).getTime() : null,
    });
    get().updateProductionRates();
  },

  // Game tick
  tick: (deltaSeconds) => {
    const {
      moneyPerSecond,
      followersPerSecond,
      path,
      currentTier,
      contentMultiplier,
      publishBonusActive,
      publishBonusEndTime,
    } = get();

    if (!path) return;

    const now = Date.now();

    // Check if publish bonus expired (MEDIA only)
    if (path === "MEDIA" && publishBonusActive && now >= publishBonusEndTime) {
      set({ publishBonusActive: false });
      get().updateProductionRates();
    }

    // Apply content decay (only for MEDIA path, Tier 1-2)
    if (path === "MEDIA" && currentTier <= 2) {
      const decayRate = CONTENT_DECAY_RATES[currentTier] || 0;
      if (decayRate > 0) {
        // Decay per second = decayRate / 60
        const decayPerSecond = decayRate / 60;
        const newMultiplier = Math.max(0.1, contentMultiplier - (decayPerSecond * deltaSeconds));
        if (newMultiplier !== contentMultiplier) {
          set({ contentMultiplier: newMultiplier });
          // Don't call updateProductionRates here to avoid recursion,
          // we'll use the multiplier directly
        }
      }
    }

    // Apply employee morale decay (only for MEDIA path, Tier 3+)
    if (path === "MEDIA" && currentTier >= 3) {
      const { employeeMorale, lastActivityTime } = get();
      // Morale decays when inactive
      if (now - lastActivityTime > 30000) { // 30 seconds of inactivity
        const newMorale = Math.max(MORALE_MIN, employeeMorale - (MORALE_DECAY_RATE * deltaSeconds));
        if (newMorale !== employeeMorale) {
          set({ employeeMorale: newMorale });
        }
      }
    }

    // INDUSTRIAL PATH: Machine condition decay
    if (path === "INDUSTRIAL") {
      const { machineCondition, buildings } = get();

      // Check if player has maintenance building (Tier 3+)
      const hasMaintenanceBuilding = (buildings["i3_maintenance"] || 0) > 0;

      // Only decay if no automatic maintenance
      if (!hasMaintenanceBuilding) {
        // Decay rate: -1% per minute = -0.0167% per second
        const decayPerSecond = MACHINE_DECAY_RATE / 60;
        const newCondition = Math.max(0, machineCondition - (decayPerSecond * deltaSeconds));
        if (Math.abs(newCondition - machineCondition) > 0.001) {
          set({ machineCondition: newCondition });
          // Update production rates since condition affects production
          get().updateProductionRates();
        }
      } else {
        // With maintenance building, slowly repair machines if below 90%
        if (machineCondition < 90) {
          const repairPerSecond = 0.05; // +0.05% per second with maintenance
          const newCondition = Math.min(90, machineCondition + (repairPerSecond * deltaSeconds));
          if (newCondition !== machineCondition) {
            set({ machineCondition: newCondition });
            get().updateProductionRates();
          }
        }
      }

      // INDUSTRIAL PATH: Resource consumption/production
      const { resourcesPerSecond, resources } = get();
      const resourceChange = resourcesPerSecond * deltaSeconds;
      if (Math.abs(resourceChange) > 0.001) {
        const newResources = Math.max(0, resources + resourceChange);
        set({ resources: newResources });
      }
    }

    // FINANCE PATH: Market cycle, AUM updates, and commission income
    if (path === "FINANCE") {
      // Check and update market cycle
      get().checkMarketCycle();

      // Update AUM from client buildings
      const { aumPerSecond, aum, creditRating } = get();
      if (aumPerSecond > 0) {
        const aumChange = aumPerSecond * deltaSeconds;
        set({ aum: aum + aumChange });
      }

      // Commission income from managed AUM
      // Average commission rate ~1.5% per year = 0.015/365/24/3600 per second
      // Simplified: 0.00000047564% per second, or roughly aum * 0.000000476
      // For game balance, we use 0.00001 (roughly 0.86% per day game-time)
      const COMMISSION_RATE_PER_SECOND = 0.00001;
      // Credit rating affects commission collection (better rating = more trust = can charge more)
      const ratingCommissionMultiplier = {
        "AAA": 1.50, "AA": 1.30, "A": 1.15, "BBB": 1.00,
        "BB": 0.80, "B": 0.60, "CCC": 0.40, "CC": 0.20, "C": 0.10, "D": 0
      }[creditRating] || 1.0;

      const commissionIncome = aum * COMMISSION_RATE_PER_SECOND * ratingCommissionMultiplier * deltaSeconds;
      if (commissionIncome > 0) {
        set((state) => ({
          money: state.money + commissionIncome,
          totalEarnings: state.totalEarnings + commissionIncome,
        }));
      }

      // TIER 5: Market Making - f5_market_maker earns from spread
      // Higher volatility = higher spread income (market makers profit from volatility)
      const { buildings, marketPhase, currentTier } = get();
      const marketMakerCount = buildings["f5_market_maker"] || 0;
      let spreadIncome = 0;

      if (marketMakerCount > 0 && currentTier >= 5) {
        // Base spread rate per market maker: 0.5$/s
        // Multiplied by volatility factor based on market phase
        const volatilityFactors: Record<string, number> = {
          bull: 1.2,      // Moderate volatility in bull market
          stable: 0.8,    // Low volatility in stable market
          correction: 1.5, // Higher volatility during correction
          bear: 1.8,      // High volatility in bear market
          crash: 2.5,     // Extreme volatility during crash
        };
        const volatilityFactor = volatilityFactors[marketPhase] || 1.0;
        const baseSpreadRate = 0.5; // $/s per market maker
        spreadIncome = marketMakerCount * baseSpreadRate * volatilityFactor * deltaSeconds;

        if (spreadIncome > 0) {
          set((state) => ({
            money: state.money + spreadIncome,
            totalEarnings: state.totalEarnings + spreadIncome,
            spreadIncome: spreadIncome / deltaSeconds, // Store per-second rate for display
          }));
        }
      } else {
        set({ spreadIncome: 0 });
      }

      // TIER 5: Market Influence - f5_central allows influencing market phases
      // When you have influence, unfavorable phases are shorter, favorable are longer
      const centralBankCount = buildings["f5_central"] || 0;
      let financeMarketInfluence = 0;

      if (centralBankCount > 0 && currentTier >= 5) {
        // Each f5_central building gives +10% market influence, max 50%
        financeMarketInfluence = Math.min(0.5, centralBankCount * 0.1);
        set({ financeMarketInfluence });
      } else {
        set({ financeMarketInfluence: 0 });
      }

      // Update peak AUM tracking and margin call check
      const { peakAum, leverage, lastMarginCallTime, money: currentMoney, aum: currentAum } = get();

      // Update peak AUM if current is higher
      if (currentAum > peakAum) {
        set({ peakAum: currentAum });
      }

      // Margin call check (only if leverage > 1 and cooldown passed)
      const MARGIN_CALL_COOLDOWN = 60000; // 1 minute cooldown between margin calls
      if (leverage > 1 && now - lastMarginCallTime > MARGIN_CALL_COOLDOWN && peakAum > 0) {
        const lossPercent = (peakAum - currentAum) / peakAum;
        const marginCallThreshold = LEVERAGE_MARGIN_CALL_THRESHOLDS[leverage] || 0;

        if (lossPercent >= marginCallThreshold && marginCallThreshold > 0) {
          // MARGIN CALL TRIGGERED!
          // Penalties:
          // 1. Lose 20% of remaining AUM
          // 2. Reset leverage to 1x
          // 3. Lose 1 credit rating level
          const aumLoss = currentAum * 0.20;
          const moneyPenalty = currentMoney * 0.10; // Also lose 10% of cash as penalty

          // Calculate new credit rating (drop by 1)
          const CREDIT_RATINGS_LIST = ["D", "C", "CC", "CCC", "B", "BB", "BBB", "A", "AA", "AAA"];
          const currentRatingIndex = CREDIT_RATINGS_LIST.indexOf(creditRating);
          const newRatingIndex = Math.max(0, currentRatingIndex - 1);
          const newRating = CREDIT_RATINGS_LIST[newRatingIndex];

          set({
            aum: Math.max(0, currentAum - aumLoss),
            money: Math.max(0, currentMoney - moneyPenalty),
            leverage: 1,
            creditRating: newRating,
            peakAum: Math.max(0, currentAum - aumLoss), // Reset peak to current after margin call
            lastMarginCallTime: now,
          });

          // Trigger margin call event for notification
          const marginCallEvent: GameEvent = {
            id: "margin_call",
            type: "scandal",
            name: "Margin Call!",
            description: `Straty przekroczyly ${(marginCallThreshold * 100).toFixed(0)}%! Straciles ${aumLoss.toFixed(0)}$ AUM i ${moneyPenalty.toFixed(0)}$ gotowki.`,
            isPositive: false,
            effects: {},
            duration: 10,
            minTier: 2,
            chancePerHour: 0,
          };
          get().triggerEvent(marginCallEvent);
        }
      }

      // Client exodus check - clients leave when rating drops or losses are too high
      const CLIENT_EXODUS_COOLDOWN = 120000; // 2 minute cooldown
      const lastClientExodusTime = get().lastMarginCallTime; // Reuse for simplicity

      // Check if clients should leave (low rating or high losses)
      const CREDIT_RATINGS_LIST = ["D", "C", "CC", "CCC", "B", "BB", "BBB", "A", "AA", "AAA"];
      const ratingIndex = CREDIT_RATINGS_LIST.indexOf(creditRating);

      // Clients start leaving if rating drops below BB (index 5) or losses exceed 15%
      if (ratingIndex < 5 && now - lastClientExodusTime > CLIENT_EXODUS_COOLDOWN) {
        // Client loss rate based on how bad the rating is
        // D=0, C=1, CC=2, CCC=3, B=4 -> higher loss rate for worse ratings
        const clientLossRate = (5 - ratingIndex) * 0.05; // 5-25% of AUM lost
        const aumLostToExodus = currentAum * clientLossRate;

        if (aumLostToExodus > 0) {
          set({
            aum: Math.max(0, currentAum - aumLostToExodus),
            peakAum: Math.max(0, currentAum - aumLostToExodus), // Update peak too
            lastMarginCallTime: now, // Use same cooldown
          });

          // Trigger client exodus event
          const exodusEvent: GameEvent = {
            id: "client_exodus",
            type: "client_exodus",
            name: "Klienci odchodza!",
            description: `Niski rating (${creditRating}) powoduje utrate zaufania. Straciles ${aumLostToExodus.toFixed(0)}$ AUM.`,
            isPositive: false,
            effects: {},
            duration: 5,
            minTier: 2,
            chancePerHour: 0,
          };
          get().triggerEvent(exodusEvent);
        }
      }
    }

    // Calculate actual production with current multiplier
    const { baseMoneyPerSecond, baseFollowersPerSecond, eventMultiplier, efficiency, machineCondition: currentCondition, resources: currentResources, resourcesPerSecond: resPerSec, prestigeProductionBonus } = get();
    let effectiveMultiplier = 1.0;

    if (path === "MEDIA") {
      if (currentTier <= 2) {
        effectiveMultiplier *= get().contentMultiplier;
      }
      if (get().publishBonusActive) {
        effectiveMultiplier *= (1 + PUBLISH_BONUS);
      }
      // Apply event multiplier
      effectiveMultiplier *= eventMultiplier;
    } else if (path === "INDUSTRIAL") {
      // Efficiency multiplier (0-150% -> 0.0-1.5)
      effectiveMultiplier *= (efficiency / 100);

      // Machine condition multiplier
      let conditionMultiplier = 1.0;
      if (currentCondition < 30) {
        conditionMultiplier = 0.5;
      } else if (currentCondition < 50) {
        conditionMultiplier = 0.75;
      } else if (currentCondition < 80) {
        conditionMultiplier = 0.9;
      }
      effectiveMultiplier *= conditionMultiplier;

      // Resource availability multiplier
      if (resPerSec < 0) {
        const consumption = Math.abs(resPerSec);
        const secondsOfResources = currentResources / consumption;
        if (secondsOfResources < 10) {
          const resourceMultiplier = Math.max(0.1, secondsOfResources / 10);
          effectiveMultiplier *= resourceMultiplier;
        }
      }

      // Apply prestige production bonus
      effectiveMultiplier *= prestigeProductionBonus;
    } else if (path === "FINANCE") {
      const { creditRating, leverage, marketPhase, hedgingEnabled, volatilityMultiplier, buildings } = get();

      // Credit rating multiplier
      const ratingMultiplier = {
        "AAA": 1.50, "AA": 1.30, "A": 1.15, "BBB": 1.00,
        "BB": 0.80, "B": 0.60, "CCC": 0.40, "CC": 0.20, "C": 0.10, "D": 0
      }[creditRating] || 1.0;
      effectiveMultiplier *= ratingMultiplier;

      // Market phase multiplier with hedging
      const phaseMultiplier = MARKET_PHASE_MULTIPLIERS[marketPhase] || 1.0;
      let hedgingFactor = 1.0;
      if (hedgingEnabled) {
        if (phaseMultiplier > 1) hedgingFactor = 0.3;
        else if (phaseMultiplier < 1) hedgingFactor = 0.2;
      }
      const hedgedPhaseMultiplier = 1 + (phaseMultiplier - 1) * (hedgingEnabled ? hedgingFactor : 1);
      effectiveMultiplier *= hedgedPhaseMultiplier;

      // Apply volatility and leverage
      effectiveMultiplier *= volatilityMultiplier * leverage;

      // Bonus buildings
      if ((buildings["f1_course"] || 0) > 0) effectiveMultiplier *= (1 + FINANCE_COURSE_BONUS);
      if ((buildings["f3_research"] || 0) > 0) effectiveMultiplier *= (1 + FINANCE_RESEARCH_BONUS);

      // Apply prestige production bonus
      effectiveMultiplier *= prestigeProductionBonus;
    }

    const actualMoneyPerSecond = baseMoneyPerSecond * effectiveMultiplier;
    const actualFollowersPerSecond = baseFollowersPerSecond * effectiveMultiplier;

    const moneyGained = actualMoneyPerSecond * deltaSeconds;
    const followersGained = actualFollowersPerSecond * deltaSeconds;

    if (moneyGained > 0 || followersGained > 0) {
      set((state) => ({
        money: state.money + moneyGained,
        followers: state.followers + followersGained,
        totalEarnings: state.totalEarnings + moneyGained,
        moneyPerSecond: actualMoneyPerSecond,
        followersPerSecond: actualFollowersPerSecond,
      }));
    }

    // Check for follower milestones (for MEDIA path)
    if (path === "MEDIA") {
      const { followers, reachedFollowerMilestones, reputation } = get();
      const newMilestones: number[] = [];

      for (const milestone of FOLLOWER_MILESTONES) {
        if (followers >= milestone && !reachedFollowerMilestones.includes(milestone)) {
          newMilestones.push(milestone);
        }
      }

      if (newMilestones.length > 0) {
        // +10 reputation for each new milestone reached
        const reputationGain = newMilestones.length * 10;
        set({
          reputation: Math.min(100, reputation + reputationGain),
          reachedFollowerMilestones: [...reachedFollowerMilestones, ...newMilestones],
        });
      }

      // Check for inactivity decay (only for MEDIA path)
      const { lastActivityTime, lastInactivityCheck } = get();
      if (now - lastInactivityCheck >= REPUTATION_INACTIVITY_CHECK_INTERVAL) {
        set({ lastInactivityCheck: now });

        // If inactive for too long, decay reputation
        if (now - lastActivityTime >= REPUTATION_INACTIVITY_THRESHOLD) {
          const { reputation: currentRep } = get();
          if (currentRep > 0) {
            set({ reputation: Math.max(0, currentRep - REPUTATION_INACTIVITY_DECAY_RATE) });
          }
        }
      }
    }

    // Contract system - works for both MEDIA and INDUSTRIAL paths
    get().checkContracts();

    // Generate contract offers periodically (every 20 seconds if no pending offer)
    const { pendingContractOffer, lastContractCheck, activeContracts, autoAcceptContracts, autoAcceptMinReward, resources: currentRes, efficiency: currentEff } = get();
    const maxContracts = get().getMaxContracts();

    // Only generate offers if we have less than max contracts and no pending offer
    if (!pendingContractOffer && activeContracts.length < maxContracts && now - lastContractCheck >= 20000) {
      set({ lastContractCheck: now }); // Update timer regardless of outcome
      const { reputation: rep, followers: fol } = get();

      // Different minimum reputation requirements for different paths
      const minRepForContracts = path === "INDUSTRIAL" ? 0 : 20;

      if (rep >= minRepForContracts || path === "INDUSTRIAL") {
        const offer = generateContractOffer(currentTier, rep, fol, path, currentRes, currentEff);
        if (offer && Math.random() < 0.7) { // 70% chance to get an offer
          // Check if should auto-accept
          if (autoAcceptContracts && offer.reward.money >= autoAcceptMinReward) {
            // Auto-accept the contract
            get().acceptContract(offer);
          } else {
            set({ pendingContractOffer: offer });
          }
        }
      }
    }

    // Event system - check for expired events (works for both paths)
    const { activeEvents, triggerEvent } = get();
    const expiredEvents = activeEvents.filter((ae) => ae.endTime && now >= ae.endTime);

    if (expiredEvents.length > 0) {
      set({
        activeEvents: activeEvents.filter((ae) => !ae.endTime || now < ae.endTime),
      });
      get().updateEventMultiplier();
      get().updateProductionRates();
    }

    // Roll for new events periodically (works for both MEDIA and INDUSTRIAL paths)
    const { lastEventCheck: eventCheckTime, buildings: currentBuildings } = get();
    if (now - eventCheckTime >= EVENT_CHECK_INTERVAL) {
      set({ lastEventCheck: now });

      const { reputation: currentReputation, efficiency: currentEfficiency } = get();
      const newEvent = rollForEvent(currentTier, currentReputation, EVENT_HOURS_PER_CHECK, path, currentEfficiency, currentBuildings);

      if (newEvent) {
        triggerEvent(newEvent);
      }
    }
  },
}));
