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
    name: "Mały Warsztat",
    description: "Zaczynasz w garażu z podstawowymi narzędziami",
    requirements: {},
    maxBuildingCount: 10,
  },
  {
    id: 2,
    name: "Mała Fabryka",
    description: "Przenosisz się do prawdziwego budynku z pracownikami",
    requirements: {
      totalEarnings: 5000,
      resources: 500, // Zgromadź 500 jednostek surowców
      efficiency: 60, // Utrzymaj efektywność powyżej 60%
      // Need 5 workshops OR 5 tool sets
      buildingsAny: [
        { id: "i1_workshop", count: 5 },
        { id: "i1_tools", count: 5 },
      ],
    },
    maxBuildingCount: 15,
  },
  {
    id: 3,
    name: "Średnia Fabryka",
    description: "Masz rozpoznawalną markę. Automatyzacja staje się kluczowa",
    requirements: {
      totalEarnings: 50000,
      resources: 2000, // Posiadaj 2000 jednostek surowców
      efficiency: 70, // Efektywność minimum 70%
      // Need 3 machines OR 5 worker teams
      buildingsAny: [
        { id: "i2_machine", count: 3 },
        { id: "i2_workers", count: 5 },
      ],
    },
    maxBuildingCount: 20,
  },
  {
    id: 4,
    name: "Duża Korporacja",
    description: "Jesteś graczem na rynku krajowym. Rząd się tobą interesuje",
    requirements: {
      totalEarnings: 500000,
      resources: 10000, // Posiadaj 10000 jednostek surowców
      efficiency: 80, // Efektywność minimum 80%
      // Need 2 assembly lines
      buildingsAll: [
        { id: "i3_assembly", count: 2 },
      ],
    },
    maxBuildingCount: 25,
  },
  {
    id: 5,
    name: "Imperium Przemysłowe",
    description: "Jesteś międzynarodowym gigantem. Twoje decyzje wpływają na gospodarkę",
    requirements: {
      totalEarnings: 5000000,
      resources: 100000, // Posiadaj 100000 jednostek surowców
      efficiency: 90, // Efektywność minimum 90%
      // Need production plant AND own mine
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
    name: "Początkujący Twórca",
    description: "Zaczynasz w swoim pokoju z laptopem i marzeniami",
    requirements: {}, // No requirements for tier 1
    maxBuildingCount: 10,
  },
  {
    id: 2,
    name: "Rozpoznawalny Twórca",
    description: "Ludzie zaczynają Cię rozpoznawać",
    requirements: {
      totalEarnings: 5000,
      followers: 1000,
      // Need 5 blogs OR 5 social media accounts
      buildingsAny: [
        { id: "m1_blog", count: 5 },
        { id: "m1_social", count: 5 },
      ],
    },
    maxBuildingCount: 15,
  },
  {
    id: 3,
    name: "Profesjonalista",
    description: "Czas zatrudnić ludzi i założyć agencję",
    requirements: {
      totalEarnings: 50000,
      followers: 10000,
      reputation: 40,
      // Need 3 YouTube channels OR 5 podcasts
      buildingsAny: [
        { id: "m2_youtube", count: 3 },
        { id: "m2_podcast", count: 5 },
      ],
      // Need to complete at least 1 sponsor contract
      completedContracts: 1,
    },
    maxBuildingCount: 20,
  },
  {
    id: 4,
    name: "Influencer",
    description: "Jesteś kimś w branży. Marki same do Ciebie przychodzą",
    requirements: {
      totalEarnings: 500000,
      followers: 100000,
      reputation: 60,
      // Need at least 5 employees (editor, writer, or manager)
      buildingsAny: [
        { id: "m3_editor", count: 5 },
        { id: "m3_writer", count: 5 },
        { id: "m3_manager", count: 5 },
      ],
      // Need 3 long-term contracts completed
      completedLongTermContracts: 3,
    },
    maxBuildingCount: 25,
  },
  {
    id: 5,
    name: "Imperium Medialne",
    description: "Jesteś potentatem. Twoje decyzje wpływają na całą branżę",
    requirements: {
      totalEarnings: 5000000,
      followers: 1000000,
      reputation: 80,
      // Must have a production studio
      buildingsAll: [
        { id: "m4_production", count: 1 },
      ],
      // Must survive 3 scandals
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
    name: "Początkujący Inwestor",
    description: "Zaczynasz z własnymi oszczędnościami. Uczysz się podstaw rynku",
    requirements: {},
    maxBuildingCount: 10,
  },
  {
    id: 2,
    name: "Trader Indywidualny",
    description: "Zaczynasz aktywnie handlować. Pierwsi klienci powierzają Ci pieniądze",
    requirements: {
      totalEarnings: 5000,
      aum: 1000, // Posiadaj 1,000$ w kapitale (AUM)
      minRating: "BBB", // Utrzymaj rating BBB lub wyższy
      diversification: 3, // Posiadaj min. 3 różne aktywa
    },
    maxBuildingCount: 15,
  },
  {
    id: 3,
    name: "Zarządzający Funduszem",
    description: "Zakładasz własny fundusz inwestycyjny. Instytucje zaczynają Ci ufać",
    requirements: {
      totalEarnings: 50000,
      aum: 10000, // Posiadaj 10,000$ w kapitale (AUM)
      minRating: "A", // Utrzymaj rating A lub wyższy
      // Need 5 individual clients
      buildingsAny: [
        { id: "f2_client", count: 5 },
      ],
    },
    maxBuildingCount: 20,
  },
  {
    id: 4,
    name: "Instytucja Finansowa",
    description: "Jesteś poważnym graczem na rynku. Fundusze emerytalne powierzają Ci miliony",
    requirements: {
      totalEarnings: 500000,
      aum: 100000, // Posiadaj 100,000$ w kapitale (AUM)
      minRating: "AA", // Utrzymaj rating AA lub wyższy
      diversification: 5, // Dywersyfikacja 5+ klas aktywów
      // Need 3 funds or real estate
      buildingsAny: [
        { id: "f3_fund", count: 3 },
        { id: "f3_realestate", count: 3 },
      ],
    },
    maxBuildingCount: 25,
  },
  {
    id: 5,
    name: "Finansowe Imperium",
    description: "Jesteś jednym z najpotężniejszych graczy na światowych rynkach",
    requirements: {
      totalEarnings: 5000000,
      aum: 1000000, // Posiadaj 1,000,000$ w kapitale (AUM)
      minRating: "AAA", // Utrzymaj rating AAA
      diversification: 8, // Dywersyfikacja 8+ klas aktywów
      crashesSurvived: 2, // Przetrwaj 2 krachy rynkowe
      // Must have hedge fund AND private equity
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
    name: "Przemysł",
    description: "Produkcja fizyczna, zarządzanie łańcuchem dostaw i automatyzacja.",
    color: "#f97316",
    icon: "factory",
    buildings: [
      // ============ TIER 1: Mały Warsztat ============
      {
        id: "i1_workshop",
        name: "Warsztat",
        icon: "🔧",
        baseCost: 50,
        baseProduction: 0.1,
        followersPerSecond: 0,
        resourcesPerSecond: -0.05, // Zużywa surowce
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.15,
        description: "Podstawowa produkcja ręczna",
        tier: 1,
      },
      {
        id: "i1_tools",
        name: "Zestaw narzędzi",
        icon: "🛠️",
        baseCost: 100,
        baseProduction: 0.2,
        followersPerSecond: 0,
        resourcesPerSecond: -0.08,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.15,
        description: "Lepsze narzędzia = szybsza praca",
        tier: 1,
      },
      {
        id: "i1_storage",
        name: "Mały magazyn",
        icon: "📦",
        baseCost: 200,
        baseProduction: 0.15,
        followersPerSecond: 0,
        resourcesPerSecond: 0, // Nie zużywa surowców
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.15,
        description: "Przechowywanie gotowych produktów",
        tier: 1,
      },
      {
        id: "i1_supplier",
        name: "Lokalny dostawca",
        icon: "🚚",
        baseCost: 300,
        baseProduction: 0,
        followersPerSecond: 0,
        resourcesPerSecond: 0.5, // Dostarcza surowce
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.18,
        description: "Dostarcza surowce do warsztatu",
        tier: 1,
      },
      // ============ TIER 2: Mała Fabryka ============
      {
        id: "i2_machine",
        name: "Maszyna produkcyjna",
        icon: "⚙️",
        baseCost: 1500,
        baseProduction: 2.5,
        followersPerSecond: 0,
        resourcesPerSecond: -1.0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.14,
        description: "Pierwsza prawdziwa maszyna",
        tier: 2,
      },
      {
        id: "i2_workers",
        name: "Zespół pracowników",
        icon: "👷",
        baseCost: 2000,
        baseProduction: 3.0,
        followersPerSecond: 0,
        resourcesPerSecond: -0.5,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.14,
        description: "5 pracowników produkcyjnych",
        tier: 2,
      },
      {
        id: "i2_forklift",
        name: "Wózek widłowy",
        icon: "🚜",
        baseCost: 1000,
        baseProduction: 1.5,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.14,
        description: "Szybszy transport wewnętrzny",
        tier: 2,
      },
      {
        id: "i2_wholesale",
        name: "Hurtownia surowców",
        icon: "🏪",
        baseCost: 3000,
        baseProduction: 0,
        followersPerSecond: 0,
        resourcesPerSecond: 2.0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.16,
        description: "Tańsze surowce hurtowo",
        tier: 2,
      },
      {
        id: "i2_quality",
        name: "Kontrola jakości",
        icon: "✅",
        baseCost: 2500,
        baseProduction: 1.0,
        followersPerSecond: 0,
        resourcesPerSecond: -0.2,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.14,
        description: "+5% efektywności",
        tier: 2,
      },
      // ============ TIER 3: Średnia Fabryka ============
      {
        id: "i3_assembly",
        name: "Linia montażowa",
        icon: "🔄",
        baseCost: 15000,
        baseProduction: 15,
        followersPerSecond: 0,
        resourcesPerSecond: -5.0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.12,
        description: "Zautomatyzowany montaż",
        tier: 3,
      },
      {
        id: "i3_robot",
        name: "Robot przemysłowy",
        icon: "🤖",
        baseCost: 25000,
        baseProduction: 20,
        followersPerSecond: 0,
        resourcesPerSecond: -3.0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.14,
        description: "Nie wymaga pensji",
        tier: 3,
      },
      {
        id: "i3_warehouse",
        name: "Duży magazyn",
        icon: "🏭",
        baseCost: 10000,
        baseProduction: 5,
        followersPerSecond: 0,
        resourcesPerSecond: 1.0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.12,
        description: "Bufor surowców",
        tier: 3,
      },
      {
        id: "i3_import",
        name: "Kanał importowy",
        icon: "🚢",
        baseCost: 20000,
        baseProduction: 0,
        followersPerSecond: 0,
        resourcesPerSecond: 5.0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.16,
        description: "Tanie surowce z zagranicy",
        tier: 3,
      },
      {
        id: "i3_maintenance",
        name: "Dział utrzymania",
        icon: "🔩",
        baseCost: 12000,
        baseProduction: 0,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.14,
        description: "Automatyczna konserwacja maszyn",
        tier: 3,
      },
      {
        id: "i3_training",
        name: "Centrum szkoleniowe",
        icon: "🎓",
        baseCost: 18000,
        baseProduction: 8,
        followersPerSecond: 0,
        resourcesPerSecond: -1.0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.14,
        description: "+10% efektywności",
        tier: 3,
      },
      // ============ TIER 4: Duża Korporacja ============
      {
        id: "i4_plant",
        name: "Zakład produkcyjny",
        icon: "🏗️",
        baseCost: 150000,
        baseProduction: 80,
        followersPerSecond: 0,
        resourcesPerSecond: -25,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.18,
        description: "Cały kompleks fabryk",
        tier: 4,
      },
      {
        id: "i4_rnd",
        name: "Dział R&D",
        icon: "🔬",
        baseCost: 100000,
        baseProduction: 30,
        followersPerSecond: 0,
        resourcesPerSecond: -5,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.16,
        description: "+15% efektywności, nowe technologie",
        tier: 4,
      },
      {
        id: "i4_logistics",
        name: "Centrum logistyczne",
        icon: "📊",
        baseCost: 80000,
        baseProduction: 40,
        followersPerSecond: 0,
        resourcesPerSecond: 10,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.14,
        description: "Optymalizacja dostaw",
        tier: 4,
      },
      {
        id: "i4_mine",
        name: "Własna kopalnia",
        icon: "⛏️",
        baseCost: 200000,
        baseProduction: 10,
        followersPerSecond: 0,
        resourcesPerSecond: 20,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.20,
        description: "Niezależność surowcowa",
        tier: 4,
      },
      {
        id: "i4_green",
        name: "Zielona energia",
        icon: "🌱",
        baseCost: 120000,
        baseProduction: 25,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.16,
        description: "-50% kosztów energii",
        tier: 4,
      },
      {
        id: "i4_contract",
        name: "Dział kontraktów",
        icon: "📋",
        baseCost: 75000,
        baseProduction: 20,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.14,
        description: "Lepsze warunki umów",
        tier: 4,
      },
      // ============ TIER 5: Imperium Przemysłowe ============
      {
        id: "i5_megafactory",
        name: "Megafabryka",
        icon: "🏭",
        baseCost: 2000000,
        baseProduction: 500,
        followersPerSecond: 0,
        resourcesPerSecond: -150,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.22,
        description: "Największy zakład w kraju",
        tier: 5,
      },
      {
        id: "i5_global",
        name: "Sieć globalna",
        icon: "🌍",
        baseCost: 5000000,
        baseProduction: 1000,
        followersPerSecond: 0,
        resourcesPerSecond: 100,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.25,
        description: "Fabryki na całym świecie",
        tier: 5,
      },
      {
        id: "i5_automation",
        name: "Pełna automatyzacja",
        icon: "🤖",
        baseCost: 3000000,
        baseProduction: 800,
        followersPerSecond: 0,
        resourcesPerSecond: -50,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.24,
        description: "Fabryka bez ludzi",
        tier: 5,
      },
      {
        id: "i5_monopoly",
        name: "Monopol surowcowy",
        icon: "💎",
        baseCost: 10000000,
        baseProduction: 200,
        followersPerSecond: 0,
        resourcesPerSecond: 200,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.28,
        description: "Kontrolujesz rynek surowców",
        tier: 5,
      },
      {
        id: "i5_conglomerate",
        name: "Konglomerat",
        icon: "👑",
        baseCost: 20000000,
        baseProduction: 2000,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.30,
        description: "Wszystko w jednym",
        tier: 5,
      },
    ],
  },
  MEDIA: {
    id: "MEDIA",
    name: "Media & Rozrywka",
    description: "Buduj karierę od zera. Zdobywaj followersów i wspinaj się po szczeblach!",
    color: "#8b5cf6",
    icon: "video",
    buildings: [
      // ============ TIER 1: Początkujący Twórca ============
      {
        id: "m1_blog",
        name: "Blog osobisty",
        icon: "📝",
        baseCost: 50,
        baseProduction: 0.1,
        followersPerSecond: 0.01,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.15,
        description: "Piszesz artykuły w wolnym czasie",
        tier: 1,
      },
      {
        id: "m1_social",
        name: "Konto Social Media",
        icon: "📱",
        baseCost: 100,
        baseProduction: 0.2,
        followersPerSecond: 0.05,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.15,
        description: "Posty na Instagram/TikTok",
        tier: 1,
      },
      {
        id: "m1_freelance",
        name: "Zlecenia freelance",
        icon: "💼",
        baseCost: 300,
        baseProduction: 0.5,
        followersPerSecond: 0.02,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.18,
        description: "Piszesz teksty i tworzysz grafiki dla innych",
        tier: 1,
      },
      // ============ TIER 2: Rozpoznawalny Twórca ============
      {
        id: "m2_youtube",
        name: "Kanał YouTube",
        icon: "▶️",
        baseCost: 2000,
        baseProduction: 3,
        followersPerSecond: 0.5,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.14,
        description: "Twój własny kanał wideo",
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
        description: "Cotygodniowe odcinki audio",
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
        description: "Płatna subskrypcja emailowa",
        tier: 2,
      },
      {
        id: "m2_merch",
        name: "Sklep z merch",
        icon: "👕",
        baseCost: 3000,
        baseProduction: 4,
        followersPerSecond: 0.1,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.16,
        description: "Koszulki i kubki z Twoim logo",
        tier: 2,
      },
      // ============ TIER 3: Profesjonalista ============
      {
        id: "m3_editor",
        name: "Montażysta",
        icon: "🎬",
        baseCost: 10000,
        baseProduction: 8,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.12,
        description: "Zatrudniony edytor wideo",
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
        description: "Ktoś pisze treści za Ciebie",
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
        description: "Zarządza wszystkimi Twoimi kontami",
        tier: 3,
      },
      {
        id: "m3_studio",
        name: "Małe studio",
        icon: "🎥",
        baseCost: 50000,
        baseProduction: 25,
        followersPerSecond: 1,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.18,
        description: "Własne miejsce do nagrywania",
        tier: 3,
      },
      {
        id: "m3_agency",
        name: "Mikro-agencja",
        icon: "🏢",
        baseCost: 100000,
        baseProduction: 40,
        followersPerSecond: 3,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.20,
        description: "Reprezentujesz też innych twórców",
        tier: 3,
      },
      // ============ TIER 4: Influencer ============
      {
        id: "m4_brand_deal",
        name: "Umowa z marką",
        icon: "🤝",
        baseCost: 200000,
        baseProduction: 100,
        followersPerSecond: 5,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.22,
        description: "Ekskluzywna współpraca z dużą marką",
        tier: 4,
      },
      {
        id: "m4_production",
        name: "Studio produkcyjne",
        icon: "🎞️",
        baseCost: 500000,
        baseProduction: 200,
        followersPerSecond: 10,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.25,
        description: "Produkujesz content dla innych",
        tier: 4,
      },
      {
        id: "m4_app",
        name: "Własna aplikacja",
        icon: "📲",
        baseCost: 300000,
        baseProduction: 150,
        followersPerSecond: 15,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.20,
        description: "Twoja platforma dla fanów",
        tier: 4,
      },
      {
        id: "m4_course",
        name: "Kurs online",
        icon: "🎓",
        baseCost: 150000,
        baseProduction: 80,
        followersPerSecond: 2,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.18,
        description: '"Jak zostać influencerem"',
        tier: 4,
      },
      {
        id: "m4_talent",
        name: "Agencja talentów",
        icon: "⭐",
        baseCost: 750000,
        baseProduction: 300,
        followersPerSecond: 20,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.28,
        description: "Zarządzasz wschodzącymi gwiazdami",
        tier: 4,
      },
      // ============ TIER 5: Imperium Medialne ============
      {
        id: "m5_network",
        name: "Sieć kanałów",
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
        name: "Platforma streamingowa",
        icon: "📺",
        baseCost: 20000000,
        baseProduction: 5000,
        followersPerSecond: 500,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.35,
        description: 'Twój własny "Netflix"',
        tier: 5,
      },
      {
        id: "m5_record_label",
        name: "Wytwórnia muzyczna",
        icon: "🎵",
        baseCost: 10000000,
        baseProduction: 3000,
        followersPerSecond: 200,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.32,
        description: "Podpisujesz artystów i producentów",
        tier: 5,
      },
      {
        id: "m5_media_house",
        name: "Dom mediowy",
        icon: "🏛️",
        baseCost: 50000000,
        baseProduction: 10000,
        followersPerSecond: 1000,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.40,
        description: "Konglomerat kontrolujący rynek",
        tier: 5,
      },
    ],
  },
  FINANCE: {
    id: "FINANCE",
    name: "Finanse",
    description: "Zarządzaj ryzykiem, inwestuj kapitał i buduj finansowe imperium!",
    color: "#22c55e",
    icon: "chart",
    buildings: [
      // ============ TIER 1: Początkujący Inwestor ============
      {
        id: "f1_savings",
        name: "Konto oszczędnościowe",
        icon: "💰",
        baseCost: 50,
        baseProduction: 0.05,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 10, // Generates small AUM (savings grow)
        volatility: "none",
        costMultiplier: 1.15,
        description: "Bezpieczne ale niski zwrot",
        tier: 1,
      },
      {
        id: "f1_bonds",
        name: "Obligacje skarbowe",
        icon: "📜",
        baseCost: 100,
        baseProduction: 0.10,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 5, // Small AUM from bond returns
        volatility: "low",
        costMultiplier: 1.15,
        description: "Stabilny dochód",
        tier: 1,
      },
      {
        id: "f1_etf",
        name: "ETF indeksowy",
        icon: "📊",
        baseCost: 200,
        baseProduction: 0.20,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 20, // ETF grows your portfolio
        volatility: "medium",
        costMultiplier: 1.15,
        description: "Śledzisz rynek",
        tier: 1,
      },
      {
        id: "f1_course",
        name: "Kurs inwestowania",
        icon: "📚",
        baseCost: 150,
        baseProduction: 0,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.20,
        description: "+5% do wszystkich zysków",
        tier: 1,
      },
      // ============ TIER 2: Trader Indywidualny ============
      {
        id: "f2_stocks",
        name: "Akcje blue-chip",
        icon: "📈",
        baseCost: 500,
        baseProduction: 0.20,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "medium",
        costMultiplier: 1.14,
        description: "Stabilne spółki",
        tier: 2,
      },
      {
        id: "f2_growth",
        name: "Akcje wzrostowe",
        icon: "🚀",
        baseCost: 800,
        baseProduction: 0.35,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "high",
        costMultiplier: 1.16,
        description: "Ryzykowne ale zyskowne",
        tier: 2,
      },
      {
        id: "f2_client",
        name: "Klient indywidualny",
        icon: "👤",
        baseCost: 1000,
        baseProduction: 0.15,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 500, // +500$ AUM per client
        volatility: "none",
        costMultiplier: 1.14,
        description: "+500$ AUM, płaci prowizję",
        tier: 2,
      },
      {
        id: "f2_terminal",
        name: "Terminal tradingowy",
        icon: "🖥️",
        baseCost: 2000,
        baseProduction: 0.10,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.18,
        description: "+10% szybkości transakcji",
        tier: 2,
      },
      {
        id: "f2_analyst",
        name: "Analityk rynkowy",
        icon: "🔍",
        baseCost: 1500,
        baseProduction: 0,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.16,
        description: "Ostrzega przed zmianami rynku",
        tier: 2,
      },
      // ============ TIER 3: Zarządzający Funduszem ============
      {
        id: "f3_fund",
        name: "Fundusz inwestycyjny",
        icon: "💼",
        baseCost: 20000,
        baseProduction: 1.0,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "medium",
        costMultiplier: 1.12,
        description: "Zdywersyfikowany portfel",
        tier: 3,
      },
      {
        id: "f3_realestate",
        name: "Nieruchomości",
        icon: "🏠",
        baseCost: 50000,
        baseProduction: 0.8,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "low",
        costMultiplier: 1.14,
        description: "Stabilny dochód z najmu",
        tier: 3,
      },
      {
        id: "f3_commodities",
        name: "Surowce",
        icon: "🛢️",
        baseCost: 15000,
        baseProduction: 0.6,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "high",
        costMultiplier: 1.16,
        description: "Złoto, ropa, metale",
        tier: 3,
      },
      {
        id: "f3_corporate",
        name: "Klient korporacyjny",
        icon: "🏢",
        baseCost: 25000,
        baseProduction: 0.5,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 5000, // +5,000$ AUM per corporate client
        volatility: "none",
        costMultiplier: 1.18,
        description: "+5,000$ AUM",
        tier: 3,
      },
      {
        id: "f3_quant",
        name: "System algo-trading",
        icon: "🤖",
        baseCost: 30000,
        baseProduction: 0.7,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "medium",
        costMultiplier: 1.20,
        description: "Automatyczny trading",
        tier: 3,
      },
      {
        id: "f3_research",
        name: "Dział analiz",
        icon: "📋",
        baseCost: 18000,
        baseProduction: 0,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "none",
        costMultiplier: 1.14,
        description: "+15% przewidywania rynku",
        tier: 3,
      },
      // ============ TIER 4: Instytucja Finansowa ============
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
        description: "Inwestycje w firmy",
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
        description: "Zaawansowane strategie",
        tier: 4,
      },
      {
        id: "f4_crypto",
        name: "Portfel crypto",
        icon: "🪙",
        baseCost: 100000,
        baseProduction: 5.0,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "extreme",
        costMultiplier: 1.22,
        description: "Bitcoin, Ethereum, altcoiny",
        tier: 4,
      },
      {
        id: "f4_pension",
        name: "Fundusz emerytalny",
        icon: "👴",
        baseCost: 250000,
        baseProduction: 2.0,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 50000, // +50,000$ AUM
        volatility: "low",
        costMultiplier: 1.16,
        description: "+50,000$ AUM, wymaga stabilności",
        tier: 4,
      },
      {
        id: "f4_ipo",
        name: "Udział w IPO",
        icon: "🎪",
        baseCost: 150000,
        baseProduction: 3.0,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "high",
        costMultiplier: 1.18,
        description: "Wczesny dostęp do nowych spółek",
        tier: 4,
      },
      {
        id: "f4_bank",
        name: "Licencja bankowa",
        icon: "🏦",
        baseCost: 500000,
        baseProduction: 2.5,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 10000, // Depozyty
        volatility: "low",
        costMultiplier: 1.25,
        description: "Przyjmujesz depozyty",
        tier: 4,
      },
      // ============ TIER 5: Finansowe Imperium ============
      {
        id: "f5_sovereign",
        name: "Sovereign Wealth Fund",
        icon: "🌍",
        baseCost: 5000000,
        baseProduction: 20,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 500000, // +500,000$ AUM
        volatility: "low",
        costMultiplier: 1.28,
        description: "Zarządzasz państwowymi pieniędzmi",
        tier: 5,
      },
      {
        id: "f5_derivatives",
        name: "Instrumenty pochodne",
        icon: "📉",
        baseCost: 2000000,
        baseProduction: 15,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "configurable",
        costMultiplier: 1.26,
        description: "Opcje, futures, swaps",
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
        description: "Zapewniasz płynność",
        tier: 5,
      },
      {
        id: "f5_acquisition",
        name: "Przejęcia",
        icon: "🦈",
        baseCost: 20000000,
        baseProduction: 30,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "high",
        costMultiplier: 1.35,
        description: "Kupujesz inne fundusze",
        tier: 5,
      },
      {
        id: "f5_central",
        name: "Wpływ na bank centralny",
        icon: "👑",
        baseCost: 50000000,
        baseProduction: 50,
        followersPerSecond: 0,
        resourcesPerSecond: 0,
        aumPerSecond: 0,
        volatility: "low",
        costMultiplier: 1.40,
        description: "Wpływasz na stopy procentowe",
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
      label: "Surowce",
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
      label: "Efektywność",
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
      label: "Kapitał (AUM)",
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
      label: "Dywersyfikacja",
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
      label: "Przetrwane krachy",
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
      label: "Kontrakty",
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
      label: "Umowy dlugoterm.",
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
      label: "Przetrwane skandale",
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
