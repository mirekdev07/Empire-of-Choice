# Finanse - Szczegółowy Plan Rozwoju

## Koncepcja

Gracz zaczyna jako początkujący inwestor z małym kapitałem i rozwija się w potentata finansowego. Ścieżka skupia się na **zarządzaniu ryzykiem**, **inwestycjach**, **zmienności rynku** i **budowaniu portfela**. W przeciwieństwie do Media (popularność) i Industrial (produkcja), tutaj liczy się **kapitał**, **zwrot z inwestycji** i **zarządzanie ryzykiem**.

### Główne różnice od innych ścieżek:
- **Kapitał (AUM)** zamiast Followers/Surowców - ile pieniędzy zarządzasz
- **Rating kredytowy** zamiast Reputacji/Efektywności - Twoja wiarygodność finansowa
- **Zmienność rynku** zamiast Content Decay/Zużycia - rynek się zmienia, wpływając na zyski
- **Ryzyko vs Zwrot** - wyższe ryzyko = wyższy potencjalny zysk ale też strata
- **Dźwignia finansowa** - pożyczaj żeby zwiększyć zyski (i straty)

---

## Kluczowe Mechaniki Finansów

### 1. System Kapitału (AUM - Assets Under Management)
Kapitał reprezentuje ile pieniędzy zarządzasz (własne + klientów).

| Źródło | Kapitał | Tier | Uwagi |
|--------|---------|------|-------|
| Własne oszczędności | 100$ start | 1 | Twój kapitał początkowy |
| Klienci indywidualni | +500$/klient | 2 | Zarządzasz ich pieniędzmi |
| Małe firmy | +5,000$/firma | 3 | Klienci korporacyjni |
| Fundusze emerytalne | +50,000$/fundusz | 4 | Duże instytucje |
| Sovereign wealth | +500,000$/kontrakt | 5 | Fundusze państwowe |

**Mechanika:**
- Twój zysk = % od zarządzanego kapitału
- Wyższy kapitał = wyższe potencjalne zyski
- Utrata kapitału klientów = utrata ratingu kredytowego

### 2. System Ratingu Kredytowego
Rating (AAA do D) wpływa na zaufanie klientów i dostęp do instrumentów.

**Skala:** AAA → AA → A → BBB → BB → B → CCC → CC → C → D

| Rating | Mnożnik klientów | Dostępne instrumenty | Koszt pożyczki |
|--------|------------------|---------------------|----------------|
| AAA | 150% | Wszystkie | 2% |
| AA | 130% | Wszystkie | 3% |
| A | 115% | Większość | 5% |
| BBB | 100% | Standardowe | 8% |
| BB | 80% | Podstawowe | 12% |
| B | 60% | Ograniczone | 18% |
| CCC | 40% | Minimalne | 25% |
| CC | 20% | Tylko gotówka | 35% |
| C | 10% | Tylko gotówka | 50% |
| D | 0% | Bankructwo | - |

**Co poprawia rating:**
- Stabilne zyski przez dłuższy czas (+1 poziom/5 min stabilności)
- Dywersyfikacja portfela (+1 poziom)
- Niski poziom dźwigni (+1 poziom)
- Ukończone kontrakty z klientami (+1 poziom)

**Co obniża rating:**
- Straty (-1 poziom za każde -10% kapitału)
- Wysoka dźwignia (-1 poziom)
- Nieukończone kontrakty (-2 poziomy)
- Kryzys finansowy (-1-3 poziomy)

### 3. System Zmienności Rynku (Market Volatility)
Rynek zmienia się cyklicznie, wpływając na wszystkie inwestycje.

**Cykle rynkowe:**
- **Hossa (Bull Market):** +20-50% do zysków z inwestycji
- **Stabilny:** Normalne zyski
- **Korekta:** -10-20% do zysków
- **Bessa (Bear Market):** -30-50% do zysków, możliwe straty
- **Krach:** -50-80% do zysków, duże straty

**Mechanika:**
- Cykl zmienia się losowo co 2-5 minut
- Wskaźniki dają sygnały zbliżającej się zmiany
- Można się zabezpieczyć (hedging) kosztem niższych zysków

### 4. System Dźwigni Finansowej (Leverage)
Pożyczaj pieniądze żeby zwiększyć potencjalne zyski (i straty).

| Poziom dźwigni | Mnożnik zysku/straty | Koszt (% kapitału/min) | Ryzyko margin call |
|----------------|----------------------|------------------------|-------------------|
| 1x (brak) | 100% | 0% | Brak |
| 2x | 200% | 0.5% | 50% straty |
| 5x | 500% | 1.5% | 20% straty |
| 10x | 1000% | 3% | 10% straty |
| 20x | 2000% | 5% | 5% straty |

**Margin Call:** Jeśli strata przekroczy próg, automatycznie tracisz pozycję i płacisz karę.

### 5. System Portfela Inwestycyjnego
Różne klasy aktywów z różnym profilem ryzyko/zwrot.

| Klasa aktywów | Bazowy zwrot/s | Zmienność | Korelacja z rynkiem | Tier |
|---------------|----------------|-----------|---------------------|------|
| Gotówka | 0.01% | Brak | Brak | 1 |
| Obligacje | 0.05% | Niska | Odwrotna | 1 |
| Akcje blue-chip | 0.15% | Średnia | Wysoka | 2 |
| Akcje growth | 0.30% | Wysoka | Bardzo wysoka | 2 |
| Nieruchomości | 0.20% | Niska | Średnia | 3 |
| Commodities | 0.25% | Wysoka | Niska | 3 |
| Private equity | 0.40% | Bardzo wysoka | Średnia | 4 |
| Hedge funds | 0.35% | Średnia | Niska (hedged) | 4 |
| Crypto | 0.50% | Ekstremalna | Nieprzewidywalna | 4 |
| Derivatives | varies | Ekstremalna | Konfigurowalna | 5 |

**Dywersyfikacja:**
- Bonus +5% za każdą różną klasę aktywów w portfelu
- Maximum +50% bonus przy 10 klasach
- Zmniejsza ogólną zmienność portfela

---

## System Tierów (Etapy Kariery)

### 💵 TIER 1: Początkujący Inwestor (Start)
**Opis:** Zaczynasz z własnymi oszczędnościami. Uczysz się podstaw rynku.

**Dostępne aktywa:**
| ID | Nazwa | Koszt bazowy | Zwrot/s | Zmienność | Opis |
|----|-------|--------------|---------|-----------|------|
| f1_savings | Konto oszczędnościowe | 50 | 0.02 | Brak | Bezpieczne ale niski zwrot |
| f1_bonds | Obligacje skarbowe | 100 | 0.05 | Niska | Stabilny dochód |
| f1_etf | ETF indeksowy | 200 | 0.10 | Średnia | Śledzisz rynek |
| f1_course | Kurs inwestowania | 150 | 0 | - | +5% do wszystkich zysków |

**Mechaniki Tier 1:**
- **Zmienność rynku** - wpływa na ETF, nie na obligacje/oszczędności
- **Brak dźwigni** - nie możesz pożyczać
- **Prosty portfel** - max 3 różne aktywa
- Maksymalnie 10 sztuk każdego aktywa

**Warunki odblokowania Tier 2:**
- [ ] Osiągnij 5,000$ łącznych zarobków
- [ ] Posiadaj minimum 1,000$ w kapitale (AUM)
- [ ] Utrzymaj rating BBB lub wyższy
- [ ] Posiadaj min. 3 różne aktywa (dywersyfikacja)

---

### 📈 TIER 2: Trader Indywidualny
**Opis:** Zaczynasz aktywnie handlować. Pierwsi klienci powierzają Ci pieniądze.

**Odblokowuje:**
| ID | Nazwa | Koszt bazowy | Zwrot/s | Zmienność | Opis |
|----|-------|--------------|---------|-----------|------|
| f2_stocks | Akcje blue-chip | 500 | 0.20 | Średnia | Stabilne spółki |
| f2_growth | Akcje wzrostowe | 800 | 0.35 | Wysoka | Ryzykowne ale zyskowne |
| f2_client | Klient indywidualny | 1,000 | 0.15 | - | +500$ AUM, płaci prowizję |
| f2_terminal | Terminal tradingowy | 2,000 | 0.10 | - | +10% szybkości transakcji |
| f2_analyst | Analityk rynkowy | 1,500 | 0 | - | Ostrzega przed zmianami rynku |

**Nowe mechaniki:**
- **Klienci** - zarządzasz ich pieniędzmi za prowizję (2% AUM/rok)
- **Dźwignia 2x** - możesz podwoić ekspozycję
- **Trading aktywny** - możesz "sprzedać" aktywa w dowolnym momencie
- **Sygnały rynkowe** - analityk daje wcześniejsze ostrzeżenia

**Warunki odblokowania Tier 3:**
- [ ] Osiągnij 50,000$ łącznych zarobków
- [ ] Posiadaj 10,000$ w kapitale (AUM)
- [ ] Pozyskaj minimum 5 klientów indywidualnych
- [ ] Utrzymaj rating A lub wyższy przez 3 minuty
- [ ] Przetrwaj bessę bez margin call

---

### 🏦 TIER 3: Zarządzający Funduszem
**Opis:** Zakładasz własny fundusz inwestycyjny. Instytucje zaczynają Ci ufać.

**Odblokowuje:**
| ID | Nazwa | Koszt bazowy | Zwrot/s | Zmienność | Opis |
|----|-------|--------------|---------|-----------|------|
| f3_fund | Fundusz inwestycyjny | 20,000 | 1.0 | Średnia | Zdywersyfikowany portfel |
| f3_realestate | Nieruchomości | 50,000 | 0.8 | Niska | Stabilny dochód z najmu |
| f3_commodities | Surowce | 15,000 | 0.6 | Wysoka | Złoto, ropa, metale |
| f3_corporate | Klient korporacyjny | 25,000 | 0.5 | - | +5,000$ AUM |
| f3_quant | System algo-trading | 30,000 | 0.7 | Średnia | Automatyczny trading |
| f3_research | Dział analiz | 18,000 | 0 | - | +15% do przewidywania rynku |

**Nowe mechaniki:**
- **Fundusz inwestycyjny** - automatyczna dywersyfikacja
- **Dźwignia 5x** - większe możliwości, większe ryzyko
- **Klienci korporacyjni** - duże AUM ale wymagający
- **Algo-trading** - automatyczne decyzje oparte na algorytmach
- **Hedging** - możliwość zabezpieczenia przed spadkami (koszt: -30% zysków w hossie)

**Warunki odblokowania Tier 4:**
- [ ] Osiągnij 500,000$ łącznych zarobków
- [ ] Posiadaj 100,000$ w kapitale (AUM)
- [ ] Posiadaj minimum 3 fundusze lub nieruchomości
- [ ] Utrzymaj rating AA lub wyższy
- [ ] Ukończ 5 kontraktów z klientami korporacyjnymi
- [ ] Osiągnij dywersyfikację 5+ klas aktywów

---

### 🏛️ TIER 4: Instytucja Finansowa
**Opis:** Jesteś poważnym graczem na rynku. Fundusze emerytalne powierzają Ci miliony.

**Odblokowuje:**
| ID | Nazwa | Koszt bazowy | Zwrot/s | Zmienność | Opis |
|----|-------|--------------|---------|-----------|------|
| f4_pe | Private Equity | 200,000 | 4.0 | Bardzo wysoka | Inwestycje w firmy |
| f4_hedge | Hedge Fund | 300,000 | 3.5 | Średnia | Zaawansowane strategie |
| f4_crypto | Portfel crypto | 100,000 | 5.0 | Ekstremalna | Bitcoin, Ethereum, altcoiny |
| f4_pension | Fundusz emerytalny | 250,000 | 2.0 | Niska | +50,000$ AUM, wymaga stabilności |
| f4_ipo | Udział w IPO | 150,000 | 3.0 | Wysoka | Wczesny dostęp do nowych spółek |
| f4_bank | Licencja bankowa | 500,000 | 2.5 | Niska | Możesz przyjmować depozyty |

**Nowe mechaniki:**
- **Dźwignia 10x** - dla doświadczonych
- **Fundusze emerytalne** - ogromne AUM ale surowe wymagania (rating AA+)
- **Crypto** - ekstremalna zmienność, możliwość 10x zysków lub strat
- **Licencja bankowa** - pasywny dochód z depozytów
- **Margin call protection** - możesz kupić ubezpieczenie

**Warunki odblokowania Tier 5:**
- [ ] Osiągnij 5,000,000$ łącznych zarobków
- [ ] Posiadaj 1,000,000$ w kapitale (AUM)
- [ ] Utrzymaj rating AAA przez 5 minut
- [ ] Posiadaj hedge fund i private equity
- [ ] Przetrwaj 2 krachy rynkowe bez bankructwa
- [ ] Dywersyfikacja 8+ klas aktywów

---

### 👑 TIER 5: Finansowe Imperium
**Opis:** Jesteś jednym z najpotężniejszych graczy na światowych rynkach.

**Odblokowuje:**
| ID | Nazwa | Koszt bazowy | Zwrot/s | Zmienność | Opis |
|----|-------|--------------|---------|-----------|------|
| f5_sovereign | Sovereign Wealth Fund | 5,000,000 | 20 | Niska | Zarządzasz państwowymi pieniędzmi |
| f5_derivatives | Instrumenty pochodne | 2,000,000 | 15 | Konfigurowalna | Opcje, futures, swaps |
| f5_market_maker | Market Maker | 10,000,000 | 25 | Średnia | Zapewniasz płynność |
| f5_acquisition | Przejęcia | 20,000,000 | 30 | Wysoka | Kupujesz inne fundusze |
| f5_central | Wpływ na bank centralny | 50,000,000 | 50 | Niska | Wpływasz na stopy procentowe |

**Nowe mechaniki:**
- **Dźwignia 20x** - dla mistrzów
- **Wpływ na rynek** - Twoje transakcje wpływają na ceny
- **Market making** - zarabiasz na spreadzie
- **Derivatives** - twórz własne instrumenty
- **Lobbying** - wpływaj na regulacje finansowe

---

## System Cykli Rynkowych - Szczegóły

### Fazy rynku:
```
     HOSSA          SZCZYT         KOREKTA         BESSA          DNO
    (+20-50%)    (niestabilność)  (-10-20%)     (-30-50%)    (odbicie?)
       📈             ⚡              📉            💥           🔄
    2-4 min       30s-1min        1-2 min       1-3 min       30s-1min
```

**Sygnały ostrzegawcze:**
- Przed szczytem: "Rynek przegrzany" - 30s ostrzeżenia
- Przed krachem: "Panika na rynkach" - 15s ostrzeżenia
- Przed odbiciem: "Sygnały ożywienia" - 30s ostrzeżenia

**Strategie:**
| Strategia | Zysk w hossie | Zysk w bessie | Opis |
|-----------|---------------|---------------|------|
| Agresywna | +50% | -50% | Pełna ekspozycja |
| Zrównoważona | +30% | -30% | Standardowa |
| Defensywna | +15% | -15% | Więcej obligacji |
| Hedged | +10% | +5% | Pełne zabezpieczenie |

---

## System Kontraktów z Klientami

| Typ klienta | AUM | Prowizja | Wymagany rating | Kara za stratę | Tier |
|-------------|-----|----------|-----------------|----------------|------|
| Indywidualny | 500$ | 2% | BBB | -1 rating | 2 |
| Zamożny | 2,000$ | 2.5% | A | -1 rating | 2 |
| Mała firma | 5,000$ | 1.5% | A | -2 rating | 3 |
| Korporacja | 20,000$ | 1% | AA | -2 rating | 3 |
| Fundusz emerytalny | 50,000$ | 0.8% | AA | -3 rating | 4 |
| Instytucja | 100,000$ | 0.5% | AAA | -3 rating | 4 |
| Sovereign | 500,000$ | 0.3% | AAA | -4 rating | 5 |

**Mechanika:**
- Klienci płacą prowizję od AUM rocznie (symulowane co minutę)
- Jeśli stracisz >10% ich kapitału, tracisz klienta i rating
- Klienci mogą odejść podczas bessy jeśli rating spadnie

---

## System Eventów

### Pozytywne eventy:
| Event | Efekt | Warunek |
|-------|-------|---------|
| Hossa | +30% zyski na 3 min | Cykliczny |
| Dywidenda | +5% kapitału jednorazowo | Akcje blue-chip |
| IPO sukces | +20% wartości akcji growth | Tier 3+, losowy |
| Nowy klient | +1 klient za darmo | Rating A+, losowy |
| Odkrycie inwestycyjne | +50% zysku z jednego aktywa | Tier 4+, R&D |
| QE (luzowanie) | +20% do wszystkich zysków na 2 min | Tier 5, losowy |

### Negatywne eventy:
| Event | Efekt | Warunek |
|-------|-------|---------|
| Bessa | -30% zyski na 3 min | Cykliczny |
| Krach | -50% zyski, ryzyko margin call | Rzadki, losowy |
| Margin call | Utrata pozycji z dźwignią | Wysoka dźwignia + straty |
| Ucieczka klientów | -20% AUM | Rating < BB |
| Audit regulatora | -30% zysków na 2 min | Tier 3+, losowy |
| Flash crash | -80% na 30s, potem powrót | Tier 4+, crypto |
| Skandal finansowy | -2 poziomy ratingu | Tier 4+, rzadki |
| Podwyżka stóp | -20% wartości obligacji | Losowy |

---

## Prestige System

**Wymagania:**
- Tier 5
- 10,000,000$ łącznych zarobków
- 5,000,000$ AUM
- Rating AAA
- Przetrwanie 3 krachów

**Bonusy za Prestige:**
- +X% do bazowych zwrotów
- +X% startowego kapitału
- Start z ratingiem A zamiast BBB
- Odblokowanie ekskluzywnych instrumentów

---

## UI/UX

### Główny ekran:
```
┌─────────────────────────────────────────────────────┐
│  TIER 3: Zarządzający Funduszem        [70% → T4]  │
├─────────────────────────────────────────────────────┤
│  💰 $245,000    💼 AUM: $150,000                    │
│  📊 Rating: AA   📈 Rynek: HOSSA (+25%)            │
│  📈 +$125/s     ⚖️ Dźwignia: 3x                    │
├─────────────────────────────────────────────────────┤
│  [Portfel]  [Klienci: 12]  [Hedging: OFF]          │
├─────────────────────────────────────────────────────┤
│  PORTFEL:                                           │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐      │
│  │ Akcje      │ │ Obligacje  │ │ Nieruchom. │      │
│  │ 40%        │ │ 30%        │ │ 20%        │      │
│  │ +$50/s     │ │ +$15/s     │ │ +$20/s     │      │
│  │ ⚠️ Wysoka   │ │ ✓ Stabilne │ │ ✓ Stabilne │      │
│  └────────────┘ └────────────┘ └────────────┘      │
├─────────────────────────────────────────────────────┤
│  📊 Dywersyfikacja: 6/10 (+30% bonus)              │
│  ⚠️ UWAGA: Sygnały przegrzania rynku!               │
└─────────────────────────────────────────────────────┘
```

### Panel rynku:
```
┌─────────────────────────────────────────────────────┐
│  STAN RYNKU                                         │
├─────────────────────────────────────────────────────┤
│  Faza: HOSSA 📈        Czas trwania: 2:34          │
│  Zmienność: Średnia    Prognoza: Możliwy szczyt    │
├─────────────────────────────────────────────────────┤
│  Historia (ostatnie 10 min):                        │
│  [BESSA]→[DNO]→[HOSSA]→[HOSSA]→[obecnie]           │
├─────────────────────────────────────────────────────┤
│  Wskaźniki:                                         │
│  • Sentyment: 75% (optymizm)                       │
│  • Wolumen: Wysoki                                  │
│  • VIX: 18 (niski strach)                          │
└─────────────────────────────────────────────────────┘
```

---

## Implementacja - Kolejność

### Faza 1: Podstawy systemu
1. [x] Konfiguracja tierów i budynków w `gamedata.ts`
   - 5 tierów zdefiniowanych (FINANCE_TIERS)
   - 26 budynków z prefix "f" (f1_ do f5_)
   - Nowe pola: aumPerSecond, volatility
2. [x] System kapitału (AUM) jako druga waluta
   - Pole aum w schema.prisma
   - aumPerSecond generowane przez budynki klientów
   - Zapisywanie/wczytywanie w gameActions.ts
3. [x] System ratingu kredytowego (AAA-D)
   - Pole creditRating w schema.prisma
   - Helper functions: getCreditRatingValue, getCreditRatingMultiplier, getLoanCostRate
   - Wpływ na produkcję i dostęp do instrumentów
4. [x] UI dla kapitału i ratingu w Dashboard
   - Wyświetlanie AUM jako drugie pole statystyk
   - Wyświetlanie Credit Rating jako trzecie pole
   - Wyświetlanie Market Phase jako czwarte pole
   - Dodatkowy wiersz z Total Earnings, Leverage, Hedging, Crashes Survived
   - Tooltips z wyjaśnieniami dla każdego pola
   - Dev buttons dla testowania Finance path

### Faza 2: Mechaniki rynkowe
5. [x] System cykli rynkowych (hossa/bessa)
   - marketPhase field (bull, stable, correction, bear, crash)
   - MARKET_PHASE_MULTIPLIERS dla każdej fazy
6. [x] Zmienność wpływająca na zyski
   - volatilityMultiplier w state
   - VOLATILITY_MULTIPLIERS per volatility level
7. [x] Timer i przejścia między fazami
   - checkMarketCycle() action
   - marketPhaseEndTime tracking
   - Automatyczne przejścia w tick()
8. [x] UI panelu rynku
   - FinancePanel.tsx z wyświetlaniem fazy rynku
   - Timer pokazujący czas do zmiany fazy
   - Cykl rynkowy jako wizualna timeline
   - Kontrolki dźwigni z progami tierów
   - Kontrolka hedgingu z wyjaśnieniem efektów

### Faza 3: Portfel i dywersyfikacja
9. [x] System portfela inwestycyjnego
   - Różne klasy aktywów z różną volatility
   - Tracking w buildings
10. [x] Bonus za dywersyfikację (produkcyjny)
    - +5% per unique Finance building (Tier 2+)
    - Maximum +50% bonus
    - Zintegrowane z updateProductionRates
11. [x] Różne profile ryzyko/zwrot
    - volatility field per building
12. [x] UI wyboru strategii
    - Hedging toggle w FinancePanel
    - Leverage selection w FinancePanel

### Faza 4: Dźwignia i ryzyko
13. [x] System dźwigni finansowej
    - leverage field (1, 2, 5, 10, 20)
    - setLeverage() action
    - Mnożnik w updateProductionRates i tick
14. [x] Mechanika margin call
    - Peak AUM tracking dla wykrywania strat
    - Margin call triggery per leverage level (50%/20%/10%/5%)
    - Kary: -20% AUM, -10% money, reset leverage, -1 rating
    - Cooldown 1 minuta między margin calls
    - Event notification przy margin call
15. [x] Koszty pożyczki
    - LEVERAGE_COSTS per leverage level
    - Odejmowane jako fixedCosts
16. [x] UI zarządzania dźwignią
    - Leverage buttons w FinancePanel
    - Wyświetlanie kosztów i wymaganych tierów
    - Ostrzeżenie o margin call threshold

### Faza 5: Klienci i kontrakty
17. [x] System klientów i AUM
    - aumPerSecond from client buildings (f2_client, f3_corporate, f4_pension, etc.)
    - AUM accumulation in tick()
18. [x] Prowizje od zarządzania
    - Commission income based on AUM (0.00001/s base rate)
    - Credit rating multiplier affects commission collection
    - Added to money and totalEarnings in tick()
19. [x] Utrata klientów przy stratach
    - Client exodus when rating drops below BB
    - 5-25% AUM loss based on rating severity (D=25%, B=5%)
    - 2 minute cooldown between exodus events
    - Event notification on client exodus
20. [x] UI panelu klientów
    - ClientPanel.tsx z lista klientow i ich AUM
    - Statystyki: laczni klienci, AUM od klientow, prowizje roczne
    - Wplyw ratingu na pozyskiwanie klientow
    - Lista typow klientow z AUM/prowizja/tier

### Faza 6: Eventy i zaawansowane
21. [x] Eventy finansowe (krachy, hossy)
    - FinanceEventType z 12 typami eventów (6 pozytywnych, 6 negatywnych)
    - Finance-specific effects: aum, aumPercent, creditRatingChange, leverageReset
    - Pozytywne: bull_market, earnings_beat, new_investor, regulatory_approval, market_insight
    - Negatywne: market_crash, bad_quarter, client_exodus, regulatory_fine, cyberattack, liquidity_crisis
    - Integracja z triggerEvent() dla Finance-specific effects
22. [x] Hedging i zabezpieczenia
    - hedgingEnabled field
    - toggleHedging() action
    - Reduces both gains and losses in calculations
23. [x] Algo-trading (Tier 3+)
    - f3_quant building już zaimplementowany
    - Budynki dostępne od Tier 3
24. [x] Crypto (Tier 4+)
    - f4_crypto building już zaimplementowany
    - Extreme volatility
    - Budynki dostępne od Tier 4

### Faza 7: Endgame
25. [x] Budynki Tier 5
    - f5_sovereign, f5_derivatives, f5_market_maker, f5_acquisition, f5_central
26. [x] Prestige system dla Finance
    - PrestigeBonus z startingAum i startingRatingBonus
    - calculatePrestigeReward uwzględnia AUM i crashesSurvived
    - performPrestige resetuje Finance state i aplikuje bonusy
    - UI w PrestigePanel z Finance-specific bonusami
27. [x] Wpływ na rynek (Tier 5)
    - financeMarketInfluence state field
    - f5_central building daje +10% influence (max 50%)
    - Reduced crash chance (5% -> 2.5% with max influence)
    - Bias towards favorable phases (bull/stable)
    - Longer favorable phases, shorter unfavorable
    - UI w FinancePanel dla Tier 5
28. [x] Market making
    - spreadIncome state field
    - f5_market_maker building earns from spread
    - Higher income during volatile phases (crash = 2.5x, bear = 1.8x)
    - Base rate: 0.5$/s per market maker
    - UI w FinancePanel dla Tier 5

---

## Balans - Porównanie Ścieżek

| Aspekt | Media | Industrial | Finance |
|--------|-------|------------|---------|
| Druga waluta | Followers | Surowce | Kapitał (AUM) |
| Główna metryka | Reputacja (0-100) | Efektywność (0-150%) | Rating (AAA-D) |
| Zmienność | Content decay | Zużycie maszyn | Cykle rynkowe |
| Aktywność | Publikuj | Napraw | Zarządzaj portfelem |
| Mnożnik | Morale (50-120%) | Kondycja (0-100%) | Dźwignia (1-20x) |
| Eventy neg. | Skandale | Strajki, awarie | Krachy, margin call |
| Eventy poz. | Viral, sponsor | Boom, dotacja | Hossa, dywidenda |
| Ryzyko | Średnie | Niskie | Wysokie |
| Potencjalny zysk | Średni | Stabilny | Bardzo wysoki |

---

## Notatki Techniczne

- AUM jako osobne pole w bazie (aum: Float)
- Rating jako enum lub string (creditRating: String)
- Faza rynku przechowywana globalnie dla wszystkich graczy
- Dźwignia jako mnożnik (leverage: Float, default 1.0)
- Historia rynku w tablicy (last 10 phases)
- Portfel jako JSON (portfolio: { [assetClass]: percentage })

### Formuła zysków:
```
zysk = baseReturn × marketMultiplier × leverage × (1 + diversificationBonus) × ratingMultiplier
```

### Formuła ryzyka margin call:
```
marginCallThreshold = 1 / leverage
// Przy 10x dźwigni, margin call przy 10% straty
```

---

## Przykładowe Czasy Progresji

| Milestone | Szacowany czas | Uwagi |
|-----------|----------------|-------|
| Tier 2 | 30-60 minut | Zależne od rynku |
| Tier 3 | 3-5 godzin | Wymaga stabilności |
| Tier 4 | 1-2 dni | Trudne utrzymanie ratingu |
| Tier 5 | 1 tydzień | Przetrwanie krachów |
| Pełne ukończenie | 2-3 tygodnie | Najwyższe ryzyko |

---

## Różnice w Rozgrywce

### Media:
"Publikuję content → zdobywam followers → dostaję sponsorów → buduję markę"

### Industrial:
"Kupuję surowce → produkuję towary → sprzedaję → rozwijam fabrykę"

### Finance:
"Inwestuję kapitał → zarządzam ryzykiem → przetrwam bessę → buduję imperium"

**Finance jest najbardziej ryzykowna ale potencjalnie najbardziej dochodowa ścieżka.**
