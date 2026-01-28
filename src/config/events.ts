// Event system configuration
import { PathType } from "./gamedata";

// Media path events
export type MediaEventType =
  | "viral_post"
  | "sponsor_offer"
  | "collaboration"
  | "trending"
  | "award"
  | "hate_comments"
  | "controversy"
  | "copycat"
  | "scandal"
  | "algorithm_change";

// Industrial path events
export type IndustrialEventType =
  | "economic_boom"
  | "government_grant"
  | "tech_innovation"
  | "export_contract"
  | "resource_discovery"
  | "machine_breakdown"
  | "strike"
  | "delivery_delay"
  | "workplace_accident"
  | "safety_inspection"
  | "resource_price_hike"
  | "competition";

// Finance path events
export type FinanceEventType =
  | "bull_market"
  | "earnings_beat"
  | "new_investor"
  | "regulatory_approval"
  | "market_insight"
  | "market_crash"
  | "bad_quarter"
  | "client_exodus"
  | "regulatory_fine"
  | "scandal"
  | "cyberattack"
  | "liquidity_crisis";

export type EventType = MediaEventType | IndustrialEventType | FinanceEventType;

export interface GameEvent {
  id: string;
  type: EventType;
  name: string;
  description: string;
  isPositive: boolean;
  duration?: number; // Duration in seconds (for temporary effects)
  effects: {
    money?: number;           // Instant money change
    followers?: number;       // Instant follower change (can be negative)
    followersPercent?: number; // Percentage change to followers (can be negative)
    reputation?: number;      // Instant reputation change
    productionMultiplier?: number; // Temporary production multiplier
    // Industrial-specific effects
    efficiency?: number;      // Instant efficiency change
    efficiencyMultiplier?: number; // Temporary efficiency multiplier
    machineCondition?: number; // Instant machine condition change
    resources?: number;       // Instant resources change
    // Finance-specific effects
    aum?: number;             // Instant AUM change
    aumPercent?: number;      // Percentage change to AUM
    creditRatingChange?: number; // Credit rating level change (+1 = upgrade, -1 = downgrade)
    leverageReset?: boolean;  // Force reset leverage to 1x
  };
  minTier: number;           // Minimum tier required
  minReputation?: number;    // Minimum reputation required
  minEfficiency?: number;    // Minimum efficiency required (Industrial)
  chancePerHour: number;     // Base chance per hour (0-100)
  path?: PathType;           // Which path this event is for (undefined = MEDIA)
  requiredBuilding?: string; // Building ID required to trigger this event
}

export const GAME_EVENTS: Record<EventType, GameEvent> = {
  // Positive events
  viral_post: {
    id: "viral_post",
    type: "viral_post",
    name: "Viralowy post!",
    description: "Twój post stał się viralem! Zyskujesz mnóstwo followersów.",
    isPositive: true,
    effects: {
      followers: 1000,
      money: 500,
    },
    minTier: 1,
    chancePerHour: 2,
  },
  sponsor_offer: {
    id: "sponsor_offer",
    type: "sponsor_offer",
    name: "Oferta sponsorska!",
    description: "Marka chce z Tobą współpracować!",
    isPositive: true,
    effects: {
      money: 2000,
      reputation: 5,
    },
    minTier: 1,
    minReputation: 30,
    chancePerHour: 5,
  },
  collaboration: {
    id: "collaboration",
    type: "collaboration",
    name: "Kolaboracja!",
    description: "Inny twórca chce z Tobą nagrać materiał. +50% produkcji przez 1h.",
    isPositive: true,
    duration: 3600, // 1 hour
    effects: {
      productionMultiplier: 1.5,
      followers: 200,
    },
    minTier: 2,
    chancePerHour: 3,
  },
  trending: {
    id: "trending",
    type: "trending",
    name: "Trending!",
    description: "Jesteś na liście trendów! x2 followersów przez 30 min.",
    isPositive: true,
    duration: 1800, // 30 minutes
    effects: {
      productionMultiplier: 2.0,
    },
    minTier: 3,
    chancePerHour: 2,
  },
  award: {
    id: "award",
    type: "award",
    name: "Nagroda branżowa!",
    description: "Otrzymujesz prestiżową nagrodę!",
    isPositive: true,
    effects: {
      reputation: 20,
      money: 10000,
    },
    minTier: 4,
    minReputation: 80,
    chancePerHour: 1,
  },

  // Negative events
  hate_comments: {
    id: "hate_comments",
    type: "hate_comments",
    name: "Fala hejtu",
    description: "Twoje komentarze są pełne negatywnych wiadomości.",
    isPositive: false,
    effects: {
      followersPercent: -5,
      reputation: -3,
    },
    minTier: 1,
    chancePerHour: 4,
  },
  controversy: {
    id: "controversy",
    type: "controversy",
    name: "Kontrowersja",
    description: "Coś co powiedziałeś wywołało burzę w internecie.",
    isPositive: false,
    effects: {
      reputation: -10,
      followers: -100,
    },
    minTier: 2,
    chancePerHour: 3,
  },
  copycat: {
    id: "copycat",
    type: "copycat",
    name: "Ktoś Cię kopiuje",
    description: "Konkurent ukradł Twój pomysł. -20% produkcji przez 2h.",
    isPositive: false,
    duration: 7200, // 2 hours
    effects: {
      productionMultiplier: 0.8,
    },
    minTier: 3,
    chancePerHour: 2,
  },
  scandal: {
    id: "scandal",
    type: "scandal",
    name: "Skandal!",
    description: "Wybuchł skandal z Twoim udziałem!",
    isPositive: false,
    effects: {
      followersPercent: -20,
      reputation: -20,
    },
    minTier: 4,
    chancePerHour: 1,
  },
  algorithm_change: {
    id: "algorithm_change",
    type: "algorithm_change",
    name: "Zmiana algorytmu",
    description: "Platforma zmieniła algorytm. -30% produkcji przez 24h.",
    isPositive: false,
    duration: 86400, // 24 hours (but we'll use 10 min for testing)
    effects: {
      productionMultiplier: 0.7,
    },
    minTier: 1,
    chancePerHour: 1,
  },

  // ============================================
  // INDUSTRIAL PATH EVENTS
  // ============================================

  // Positive Industrial events
  economic_boom: {
    id: "economic_boom",
    type: "economic_boom",
    name: "Boom gospodarczy!",
    description: "Gospodarka kwitnie! +50% produkcji przez 5 minut.",
    isPositive: true,
    duration: 300, // 5 minutes
    effects: {
      productionMultiplier: 1.5,
    },
    minTier: 1,
    chancePerHour: 3,
    path: "INDUSTRIAL",
  },
  government_grant: {
    id: "government_grant",
    type: "government_grant",
    name: "Dotacja rządowa!",
    description: "Otrzymujesz dotację na rozwój produkcji!",
    isPositive: true,
    effects: {
      money: 10000,
      reputation: 5,
    },
    minTier: 3,
    minEfficiency: 80,
    chancePerHour: 2,
    path: "INDUSTRIAL",
  },
  tech_innovation: {
    id: "tech_innovation",
    type: "tech_innovation",
    name: "Innowacja technologiczna!",
    description: "Twój dział R&D dokonał przełomu! +10% efektywności na stałe.",
    isPositive: true,
    effects: {
      efficiency: 10,
      reputation: 10,
    },
    minTier: 4,
    chancePerHour: 5, // Higher chance when you have R&D
    path: "INDUSTRIAL",
    requiredBuilding: "i4_rnd",
  },
  export_contract: {
    id: "export_contract",
    type: "export_contract",
    name: "Kontrakt eksportowy!",
    description: "Zagraniczny partner chce kupować Twoje produkty!",
    isPositive: true,
    effects: {
      money: 25000,
      reputation: 8,
    },
    minTier: 3,
    chancePerHour: 2,
    path: "INDUSTRIAL",
  },
  resource_discovery: {
    id: "resource_discovery",
    type: "resource_discovery",
    name: "Odkrycie złoża!",
    description: "Twoja kopalnia odkryła nowe złoże surowców! +5000 surowców.",
    isPositive: true,
    effects: {
      resources: 5000,
    },
    minTier: 4,
    chancePerHour: 3,
    path: "INDUSTRIAL",
    requiredBuilding: "i4_mine",
  },

  // Negative Industrial events
  machine_breakdown: {
    id: "machine_breakdown",
    type: "machine_breakdown",
    name: "Awaria maszyny!",
    description: "Jedna z Twoich maszyn uległa poważnej awarii!",
    isPositive: false,
    effects: {
      machineCondition: -30,
      money: -500,
    },
    minTier: 1,
    chancePerHour: 4,
    path: "INDUSTRIAL",
  },
  strike: {
    id: "strike",
    type: "strike",
    name: "Strajk pracowników!",
    description: "Pracownicy strajkują! -50% produkcji przez 3 minuty.",
    isPositive: false,
    duration: 180, // 3 minutes
    effects: {
      productionMultiplier: 0.5,
    },
    minTier: 3,
    chancePerHour: 2,
    path: "INDUSTRIAL",
  },
  delivery_delay: {
    id: "delivery_delay",
    type: "delivery_delay",
    name: "Opóźnienie dostawy!",
    description: "Dostawa surowców się opóźnia! Brak nowych surowców przez 2 minuty.",
    isPositive: false,
    duration: 120, // 2 minutes
    effects: {
      resources: -100,
    },
    minTier: 2,
    chancePerHour: 3,
    path: "INDUSTRIAL",
  },
  workplace_accident: {
    id: "workplace_accident",
    type: "workplace_accident",
    name: "Wypadek przy pracy!",
    description: "Doszło do wypadku w fabryce. -15% efektywności przez 5 minut.",
    isPositive: false,
    duration: 300, // 5 minutes
    effects: {
      efficiencyMultiplier: 0.85,
      money: -1000,
    },
    minTier: 1,
    chancePerHour: 3,
    path: "INDUSTRIAL",
  },
  safety_inspection: {
    id: "safety_inspection",
    type: "safety_inspection",
    name: "Kontrola BHP!",
    description: "Inspekcja BHP wstrzymuje produkcję. -20% produkcji przez 2 minuty.",
    isPositive: false,
    duration: 120, // 2 minutes
    effects: {
      productionMultiplier: 0.8,
      money: -2000,
    },
    minTier: 2,
    chancePerHour: 2,
    path: "INDUSTRIAL",
  },
  resource_price_hike: {
    id: "resource_price_hike",
    type: "resource_price_hike",
    name: "Wzrost cen surowców!",
    description: "Ceny surowców gwałtownie wzrosły! Tracisz część zasobów.",
    isPositive: false,
    effects: {
      resources: -200,
      money: -1000,
    },
    minTier: 1,
    chancePerHour: 3,
    path: "INDUSTRIAL",
  },
  competition: {
    id: "competition",
    type: "competition",
    name: "Agresywna konkurencja!",
    description: "Konkurent obniża ceny! -20% produkcji przez 3 minuty.",
    isPositive: false,
    duration: 180, // 3 minutes
    effects: {
      productionMultiplier: 0.8,
    },
    minTier: 4,
    chancePerHour: 2,
    path: "INDUSTRIAL",
  },

  // ============================================
  // FINANCE PATH EVENTS
  // ============================================

  // Positive Finance events
  bull_market: {
    id: "bull_market",
    type: "bull_market",
    name: "Hossa na rynku!",
    description: "Rynki rosna! +40% produkcji przez 5 minut.",
    isPositive: true,
    duration: 300, // 5 minutes
    effects: {
      productionMultiplier: 1.4,
    },
    minTier: 1,
    chancePerHour: 3,
    path: "FINANCE",
  },
  earnings_beat: {
    id: "earnings_beat",
    type: "earnings_beat",
    name: "Swietne wyniki kwartalne!",
    description: "Twoje inwestycje przekroczyly oczekiwania! +5000$ i upgrade ratingu.",
    isPositive: true,
    effects: {
      money: 5000,
      creditRatingChange: 1,
    },
    minTier: 2,
    chancePerHour: 2,
    path: "FINANCE",
  },
  new_investor: {
    id: "new_investor",
    type: "new_investor",
    name: "Nowy duzy inwestor!",
    description: "Bogaty klient powierza Ci swoj kapital! +10,000$ AUM.",
    isPositive: true,
    effects: {
      aum: 10000,
    },
    minTier: 2,
    chancePerHour: 2,
    path: "FINANCE",
  },
  regulatory_approval: {
    id: "regulatory_approval",
    type: "regulatory_approval",
    name: "Zgoda regulatora!",
    description: "Otrzymujesz licence na nowe instrumenty! +2 poziomy ratingu.",
    isPositive: true,
    effects: {
      creditRatingChange: 2,
      money: 10000,
    },
    minTier: 3,
    chancePerHour: 1,
    path: "FINANCE",
  },
  market_insight: {
    id: "market_insight",
    type: "market_insight",
    name: "Genialna analiza!",
    description: "Twoi analitycy przewidzieli ruch rynku! +100% produkcji przez 2 minuty.",
    isPositive: true,
    duration: 120, // 2 minutes
    effects: {
      productionMultiplier: 2.0,
    },
    minTier: 3,
    chancePerHour: 3, // Higher chance with f3_research
    path: "FINANCE",
    requiredBuilding: "f3_research",
  },

  // Negative Finance events
  market_crash: {
    id: "market_crash",
    type: "market_crash",
    name: "Krach rynkowy!",
    description: "Rynki spadaja gwaltownie! -50% produkcji przez 3 minuty.",
    isPositive: false,
    duration: 180, // 3 minutes
    effects: {
      productionMultiplier: 0.5,
      aumPercent: -10, // Lose 10% of AUM
    },
    minTier: 1,
    chancePerHour: 2,
    path: "FINANCE",
  },
  bad_quarter: {
    id: "bad_quarter",
    type: "bad_quarter",
    name: "Slabe wyniki!",
    description: "Ten kwartal byl rozczarowujacy. -1 poziom ratingu.",
    isPositive: false,
    effects: {
      creditRatingChange: -1,
      money: -2000,
    },
    minTier: 2,
    chancePerHour: 3,
    path: "FINANCE",
  },
  client_exodus: {
    id: "client_exodus",
    type: "client_exodus",
    name: "Exodus klientow!",
    description: "Klienci traca zaufanie i zabieraja pieniadze! -15% AUM.",
    isPositive: false,
    effects: {
      aumPercent: -15,
    },
    minTier: 2,
    chancePerHour: 2,
    path: "FINANCE",
  },
  regulatory_fine: {
    id: "regulatory_fine",
    type: "regulatory_fine",
    name: "Kara od regulatora!",
    description: "Komisja nadzoru naklada kare za nieprawidlowosci!",
    isPositive: false,
    effects: {
      money: -10000,
      creditRatingChange: -1,
    },
    minTier: 3,
    chancePerHour: 1,
    path: "FINANCE",
  },
  cyberattack: {
    id: "cyberattack",
    type: "cyberattack",
    name: "Atak hakerski!",
    description: "Hakerzy wlamali sie do Twojego systemu! -30% produkcji przez 5 minut.",
    isPositive: false,
    duration: 300, // 5 minutes
    effects: {
      productionMultiplier: 0.7,
      money: -5000,
    },
    minTier: 3,
    chancePerHour: 2,
    path: "FINANCE",
  },
  liquidity_crisis: {
    id: "liquidity_crisis",
    type: "liquidity_crisis",
    name: "Kryzys plynnosci!",
    description: "Brak plynnosci zmusza do wyprzedazy! Reset dzwigni i -20% AUM.",
    isPositive: false,
    effects: {
      aumPercent: -20,
      leverageReset: true,
    },
    minTier: 4,
    chancePerHour: 1,
    path: "FINANCE",
  },
};

export interface ActiveEvent {
  event: GameEvent;
  startTime: number; // timestamp
  endTime?: number;  // timestamp for timed events
  applied: boolean;  // whether instant effects have been applied
}

// Get eligible events based on tier, reputation, and path
export function getEligibleEvents(
  tier: number,
  reputation: number,
  path: PathType = "MEDIA",
  efficiency?: number
): GameEvent[] {
  return Object.values(GAME_EVENTS).filter((event) => {
    // Filter by path (undefined means MEDIA)
    const eventPath = event.path || "MEDIA";
    if (eventPath !== path) return false;

    if (tier < event.minTier) return false;
    if (event.minReputation && reputation < event.minReputation) return false;
    if (event.minEfficiency && (efficiency || 100) < event.minEfficiency) return false;
    return true;
  });
}

// Roll for a random event
export function rollForEvent(
  tier: number,
  reputation: number,
  deltaHours: number,
  path: PathType = "MEDIA",
  efficiency?: number,
  buildings?: Record<string, number>
): GameEvent | null {
  const eligibleEvents = getEligibleEvents(tier, reputation, path, efficiency);

  for (const event of eligibleEvents) {
    // Skip events that require a building the player doesn't have
    if (event.requiredBuilding && (!buildings || (buildings[event.requiredBuilding] || 0) === 0)) {
      continue;
    }

    // Calculate chance based on time passed
    let effectiveChance = event.chancePerHour;

    // Import delay risk: 10% chance boost when player has i3_import
    if (event.type === "delivery_delay" && buildings && (buildings["i3_import"] || 0) > 0) {
      // Base 3% + 10% per import channel = higher risk for cheap imports
      const importCount = buildings["i3_import"] || 0;
      effectiveChance = 3 + (importCount * 10); // 13% per hour with 1 import, 23% with 2, etc.
    }

    const chanceForPeriod = (effectiveChance / 100) * deltaHours;

    // Roll dice
    if (Math.random() < chanceForPeriod) {
      return event;
    }
  }

  return null;
}
