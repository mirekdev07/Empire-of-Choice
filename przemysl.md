# Przemysł - Szczegółowy Plan Rozwoju

## Koncepcja

Gracz zaczyna jako właściciel małego warsztatu i rozwija się w potentata przemysłowego. Ścieżka skupia się na **produkcji fizycznej**, zarządzaniu **łańcuchem dostaw**, **efektywności** i **automatyzacji**. W przeciwieństwie do Media (gdzie liczy się popularność), tutaj liczy się **wydajność**, **jakość** i **skala operacji**.

### Główne różnice od Media:
- **Surowce** zamiast Followers - potrzebujesz surowców do produkcji
- **Efektywność** zamiast Reputacji - jak dobrze wykorzystujesz zasoby
- **Zużycie maszyn** zamiast Content Decay - maszyny się psują i wymagają konserwacji
- **Kontrakty produkcyjne** zamiast sponsorskich - długoterminowe zamówienia od klientów

---

## Kluczowe Mechaniki Przemysłu

### 1. System Surowców (Druga Waluta)
Surowce są niezbędne do produkcji. Bez surowców, produkcja spada.

| Źródło | Surowce/s | Tier | Uwagi |
|--------|-----------|------|-------|
| Dostawca lokalny | 0.5 | 1 | Drogi ale pewny |
| Hurtownia | 2.0 | 2 | Tańszy, wymaga minimalnego zamówienia |
| Import | 5.0 | 3 | Najtańszy, ale ryzyko opóźnień |
| Własna kopalnia/farma | 10.0 | 4 | Wymaga dużej inwestycji |
| Konglomerat surowcowy | 50.0 | 5 | Pełna kontrola nad łańcuchem |

**Mechanika:** Jeśli surowce < zapotrzebowanie, produkcja spada proporcjonalnie.
- 100% surowców = 100% produkcji
- 50% surowców = 50% produkcji
- 0% surowców = 10% produkcji (praca na zapasach)

### 2. System Efektywności
Efektywność (0-150%) wpływa na to, ile produktu otrzymujesz z surowców.

**Skala:** 0-150%

**Co zwiększa efektywność:**
- Nowoczesne maszyny (+5-20%)
- Przeszkoleni pracownicy (+10%)
- Automatyzacja (+15-30%)
- Certyfikaty jakości (+5%)
- Optymalizacja procesów (+10%)

**Co zmniejsza efektywność:**
- Stare/zużyte maszyny (-10-30%)
- Awarie (-20% tymczasowo)
- Strajki pracowników (-50%)
- Problemy z dostawami (-15%)
- Wypadki przy pracy (-10%)

### 3. System Zużycia Maszyn
Maszyny się zużywają podczas pracy i wymagają konserwacji.

**Kondycja maszyn:** 0-100%
- 100-80%: Pełna wydajność
- 80-50%: -10% wydajności
- 50-30%: -25% wydajności, ryzyko awarii
- 30-0%: -50% wydajności, częste awarie

**Konserwacja:**
- **Podstawowa** (Tier 1-2): Ręczna, wymaga kliknięcia, +20% kondycji
- **Regularna** (Tier 3): Automatyczna co X czasu, kosztuje % produkcji
- **Predykcyjna** (Tier 4+): AI przewiduje awarie, minimalne przestoje

### 4. System Kontraktów Produkcyjnych
Długoterminowe zamówienia od klientów biznesowych.

| Typ | Czas | Nagroda | Kara | Tier |
|-----|------|---------|------|------|
| Zamówienie lokalne | 1 min | 500$ | -5% efektywności | 1 |
| Kontrakt regionalny | 3 min | 3000$ | -10% efektywności | 2 |
| Umowa krajowa | 5 min | 15000$ | -15% efektywności | 3 |
| Kontrakt rządowy | 10 min | 100000$, +efektywność | -20% efektywności | 4 |
| Umowa międzynarodowa | 15 min | 500000$, +surowce | -25% efektywności | 5 |

---

## System Tierów (Etapy Rozwoju)

### 🔧 TIER 1: Mały Warsztat (Start)
**Opis:** Zaczynasz w garażu z podstawowymi narzędziami. Produkujesz proste rzeczy na zamówienie.

**Dostępne aktywa:**
| ID | Nazwa | Koszt bazowy | Produkcja/s | Surowce/s | Opis |
|----|-------|--------------|-------------|-----------|------|
| i1_workshop | Warsztat | 50 | 0.1 | -0.05 | Podstawowa produkcja ręczna |
| i1_tools | Zestaw narzędzi | 100 | 0.2 | -0.08 | Lepsze narzędzia = szybsza praca |
| i1_storage | Mały magazyn | 200 | 0.15 | 0 | Przechowywanie gotowych produktów |
| i1_supplier | Lokalny dostawca | 300 | 0 | +0.5 | Dostarcza surowce |

**Mechaniki Tier 1:**
- **Konserwacja ręczna** - kliknij "Napraw" żeby przywrócić kondycję maszyn (+20%)
- **Zużycie:** -1% kondycji co minutę
- Maksymalnie 10 sztuk każdego aktywa
- Surowce zużywane przez produkcję

**Warunki odblokowania Tier 2:**
- [ ] Osiągnij 5,000$ łącznych zarobków
- [ ] Posiadaj minimum 5 warsztatów LUB 5 zestawów narzędzi
- [ ] Zgromadź 500 jednostek surowców
- [ ] Utrzymaj efektywność powyżej 60% przez 2 minuty

---

### �icing TIER 2: Mała Fabryka
**Opis:** Przenosisz się do prawdziwego budynku. Masz pierwszych pracowników i maszyny.

**Odblokowuje:**
| ID | Nazwa | Koszt bazowy | Produkcja/s | Surowce/s | Opis |
|----|-------|--------------|-------------|-----------|------|
| i2_machine | Maszyna produkcyjna | 1,500 | 2.5 | -1.0 | Pierwsza prawdziwa maszyna |
| i2_workers | Zespół pracowników | 2,000 | 3.0 | -0.5 | 5 pracowników |
| i2_forklift | Wózek widłowy | 1,000 | 1.5 | 0 | Szybszy transport wewnętrzny |
| i2_wholesale | Hurtownia surowców | 3,000 | 0 | +2.0 | Tańsze surowce hurtowo |
| i2_quality | Kontrola jakości | 2,500 | 1.0 | -0.2 | +5% efektywności |

**Nowe mechaniki:**
- **Pracownicy** - generują produkcję ale wymagają pensji (15% ich produkcji)
- **Maszyny** - szybsze zużycie (-2% kondycji/min) ale wyższa produkcja
- **Hurtownia** - tańsze surowce ale wymaga minimum 100 jednostek zapasu
- **Zużycie spowolnione** do -1.5% kondycji/min przy dobrej konserwacji

**Warunki odblokowania Tier 3:**
- [ ] Osiągnij 50,000$ łącznych zarobków
- [ ] Posiadaj 2,000 jednostek surowców
- [ ] Posiadaj minimum 3 maszyny produkcyjne LUB 5 zespołów pracowników
- [ ] Ukończ 3 kontrakty regionalne
- [ ] Efektywność minimum 70%

---

### 🏭 TIER 3: Średnia Fabryka
**Opis:** Masz już rozpoznawalną markę. Automatyzacja staje się kluczowa.

**Odblokowuje:**
| ID | Nazwa | Koszt bazowy | Produkcja/s | Surowce/s | Opis |
|----|-------|--------------|-------------|-----------|------|
| i3_assembly | Linia montażowa | 15,000 | 15 | -5.0 | Zautomatyzowany montaż |
| i3_robot | Robot przemysłowy | 25,000 | 20 | -3.0 | Nie wymaga pensji |
| i3_warehouse | Duży magazyn | 10,000 | 5 | +1.0 | Bufor surowców |
| i3_import | Kanał importowy | 20,000 | 0 | +5.0 | Tanie surowce z zagranicy |
| i3_maintenance | Dział utrzymania | 12,000 | 0 | 0 | Automatyczna konserwacja |
| i3_training | Centrum szkoleniowe | 18,000 | 8 | -1.0 | +10% efektywności |

**Nowe mechaniki:**
- **Automatyczna konserwacja** - Dział utrzymania naprawia maszyny automatycznie
- **Roboty** - nie potrzebują pensji, ale drogie w naprawie
- **Import** - tanie surowce ale 10% szansa na opóźnienie (event)
- **Linia montażowa** - wysoka produkcja ale wymaga ciągłego zasilania surowcami
- **Zużycie wyłączone** dla zautomatyzowanych procesów (roboty same się konserwują)

**Warunki odblokowania Tier 4:**
- [ ] Osiągnij 500,000$ łącznych zarobków
- [ ] Posiadaj 10,000 jednostek surowców
- [ ] Posiadaj minimum 2 linie montażowe
- [ ] Zatrudnij 20 pracowników (4 zespoły)
- [ ] Ukończ 5 kontraktów krajowych
- [ ] Efektywność minimum 80%

---

### 🏗️ TIER 4: Duża Korporacja
**Opis:** Jesteś graczem na rynku krajowym. Rząd zaczyna się tobą interesować.

**Odblokowuje:**
| ID | Nazwa | Koszt bazowy | Produkcja/s | Surowce/s | Opis |
|----|-------|--------------|-------------|-----------|------|
| i4_plant | Zakład produkcyjny | 150,000 | 80 | -25 | Cały kompleks fabryk |
| i4_rnd | Dział R&D | 100,000 | 30 | -5 | +15% efektywności, nowe technologie |
| i4_logistics | Centrum logistyczne | 80,000 | 40 | +10 | Optymalizacja dostaw |
| i4_mine | Własna kopalnia | 200,000 | 10 | +20 | Niezależność surowcowa |
| i4_green | Zielona energia | 120,000 | 25 | 0 | -50% kosztów energii, +efektywność |
| i4_contract | Dział kontraktów | 75,000 | 20 | 0 | Lepsze warunki umów |

**Nowe mechaniki:**
- **Kontrakty rządowe** - duże zamówienia od państwa
- **R&D** - losowe odkrycia dające permanentne bonusy
- **Własne surowce** - uniezależnienie od dostawców
- **Zielona energia** - redukuje koszty i zwiększa reputację firmy
- **Związki zawodowe** - mogą strajkować jeśli warunki są złe

**Warunki odblokowania Tier 5:**
- [ ] Osiągnij 5,000,000$ łącznych zarobków
- [ ] Posiadaj 100,000 jednostek surowców
- [ ] Posiadaj zakład produkcyjny i własną kopalnię
- [ ] Efektywność minimum 90%
- [ ] Ukończ 3 kontrakty rządowe
- [ ] Przetrwaj 2 strajki bez utraty >30% efektywności

---

### 🌍 TIER 5: Imperium Przemysłowe
**Opis:** Jesteś międzynarodowym gigantem. Twoje decyzje wpływają na gospodarkę.

**Odblokowuje:**
| ID | Nazwa | Koszt bazowy | Produkcja/s | Surowce/s | Opis |
|----|-------|--------------|-------------|-----------|------|
| i5_megafactory | Megafabryka | 2,000,000 | 500 | -150 | Największy zakład w kraju |
| i5_global | Sieć globalna | 5,000,000 | 1000 | +100 | Fabryki na całym świecie |
| i5_automation | Pełna automatyzacja | 3,000,000 | 800 | -50 | Fabryka bez ludzi |
| i5_monopoly | Monopol surowcowy | 10,000,000 | 200 | +200 | Kontrolujesz rynek surowców |
| i5_conglomerate | Konglomerat | 20,000,000 | 2000 | 0 | Wszystko w jednym |

**Nowe mechaniki:**
- **Wpływ na rynek** - Twoja produkcja wpływa na ceny surowców
- **Lobbing** - możesz wpływać na regulacje (eventy)
- **Fuzje i przejęcia** - kupuj konkurencję
- **Prestiż przemysłowy** - końcowa punktacja

---

## System Surowców - Szczegóły

**Jednostki:** Surowce są abstrakcyjne (stal, drewno, plastik połączone w "jednostki")

| Źródło | Koszt/jednostkę | Surowce/s | Minimalny zapas | Ryzyko |
|--------|-----------------|-----------|-----------------|--------|
| Lokalny dostawca | 10$ | 0.5 | 0 | Brak |
| Hurtownia | 5$ | 2.0 | 100 | Niskie |
| Import | 2$ | 5.0 | 500 | 10% opóźnienie |
| Własna kopalnia | 0$ | 20.0 | 0 | Wymaga inwestycji |

**Zapas surowców:**
- Magazynowany automatycznie
- Maksymalny zapas = 1000 + (liczba magazynów × 5000)
- Surowce nie tracą wartości

---

## System Eventów

### Pozytywne eventy:
| Event | Efekt | Warunek |
|-------|-------|---------|
| Boom gospodarczy | +50% ceny sprzedaży na 5 min | Losowy |
| Dotacja rządowa | +10,000$ jednorazowo | Tier 3+, efektywność > 80% |
| Innowacja technologiczna | +10% efektywności permanentnie | Tier 4+, R&D |
| Kontrakt eksportowy | Duże zamówienie z zagranicy | Tier 3+ |
| Odkrycie złoża | +5000 surowców jednorazowo | Tier 4+, kopalnia |

### Negatywne eventy:
| Event | Efekt | Warunek |
|-------|-------|---------|
| Awaria maszyny | -30% kondycji jednej maszyny | Losowy, częstszy przy niskiej kondycji |
| Strajk | -50% produkcji pracowników na 3 min | Tier 3+, niskie pensje |
| Opóźnienie dostawy | Brak surowców przez 2 min | Import aktywny |
| Wypadek przy pracy | -15% efektywności na 5 min | Losowy |
| Kontrola BHP | -20% produkcji na 2 min, możliwa kara | Tier 2+ |
| Wzrost cen surowców | +50% koszt surowców na 5 min | Losowy |
| Konkurencja | -20% ceny sprzedaży na 3 min | Tier 4+ |

---

## Prestige System

Po osiągnięciu Tier 5 i spełnieniu warunków:
- **"Sprzedaj korporację"** - resetuj grę z bonusami
- **Wymagania:** Tier 5, 10M$ zarobków, efektywność 100%

**Bonusy za Prestige:**
- +X% do produkcji bazowej
- +X% startowych surowców
- +X% startowej efektywności
- Odblokowanie specjalnych budynków

---

## UI/UX

### Główny ekran:
```
┌─────────────────────────────────────────────────┐
│  TIER 3: Średnia Fabryka           [65% → T4]  │
├─────────────────────────────────────────────────┤
│  💰 $125,000    📦 5,234 surowców               │
│  ⚙️ Efektywność: 82%    🔧 Kondycja: 75%        │
│  📈 +$45.5/s    📦 +2.3/s                       │
├─────────────────────────────────────────────────┤
│  [Napraw maszyny - 5000$]  [Zamów surowce]     │
├─────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ Linia    │  │ Robot    │  │ Magazyn  │      │
│  │ montażowa│  │ x2       │  │ x3       │      │
│  │ x1       │  │ $40/s    │  │ +3k zap. │      │
│  │ $15/s    │  │ [Kup]    │  │ [Kup]    │      │
│  └──────────┘  └──────────┘  └──────────┘      │
├─────────────────────────────────────────────────┤
│  📋 Kontrakt: Zamówienie krajowe - 3:45        │
│  ⚠️ Event: Kontrola BHP! [-20% produkcji]       │
└─────────────────────────────────────────────────┘
```

---

## Implementacja - Kolejność

### Faza 1: Podstawy systemu
1. [x] Konfiguracja tierów i budynków w `gamedata.ts` (prefiks i1_, i2_, i3_, i4_, i5_)
   - Wszystkie 5 tierów zdefiniowane z budynkami
   - 26 unikalnych budynków przemysłowych
   - `resourcesPerSecond` dodane do BuildingDefinition
   - Helper functions zaktualizowane: `getTierDefinition(tier, path)`, `getTiersForPath(path)`
2. [x] System surowców (druga waluta dla Industrial) - pole `resources` w bazie danych
   - `resources Float @default(50)` w schema.prisma
3. [x] Pola `efficiency` i `machineCondition` w bazie danych
   - `efficiency Float @default(100)` w schema.prisma
   - `machineCondition Float @default(100)` w schema.prisma
4. [x] GameState type w gameActions.ts zaktualizowany
   - Dodane: resources, efficiency, machineCondition
   - saveGame przyjmuje nowe pola
   - upgradeTier używa getTiersForPath(path)
5. [x] useGameStore.ts - PEŁNA IMPLEMENTACJA:
   - [x] Interfejs z polami: resources, efficiency, machineCondition, resourcesPerSecond
   - [x] Wartości początkowe: resources=50, efficiency=100, machineCondition=100, resourcesPerSecond=0
   - [x] Sygnatury akcji: setResources, addResources, setEfficiency, setMachineCondition, repairMachines
   - [x] Implementacje akcji Industrial (repairMachines z kosztem skalowanym wg tieru)
   - [x] initializeFromServer ustawia pola Industrial (resources, efficiency, machineCondition)
   - [x] tick() - obsługa mechanik Industrial:
     - Machine condition decay (-1%/min dla Tier 1-2)
     - Automatyczna naprawa z i3_maintenance (do 90%)
     - Zużycie/produkcja surowców
   - [x] updateProductionRates() - oblicza resourcesPerSecond i mnożniki Industrial:
     - Efficiency multiplier (0-150%)
     - Machine condition multiplier (wpływ kondycji na produkcję)
     - Resource availability multiplier (braki surowców spowalniają produkcję)
6. [x] UI dla surowców w Dashboard
   - Statystyki Industrial: Surowce, Efektywność, Kondycja maszyn, Łączne zarobki
   - BuildingCard pokazuje resourcesPerSecond dla budynków Industrial
   - Tier tabs używają getTiersForPath(path) zamiast hardcoded MEDIA_TIERS
   - DEV przyciski debug dla Industrial

### Faza 2: Mechaniki podstawowe
7. [x] System efektywności (0-150%) - wpływ na produkcję (zaimplementowany w updateProductionRates)
8. [x] System kondycji maszyn (0-100%) - wpływ na produkcję (zaimplementowany w updateProductionRates)
9. [x] Funkcja repairMachines() - naprawia maszyny (+20% kondycji za koszt)
10. [x] Automatyczna konserwacja (Tier 3+ z budynkiem i3_maintenance) - zaimplementowana w tick()
11. [x] Przycisk "Napraw" w UI dla Tier 1-2 - w Dashboard z Progress bar kondycji
12. [x] Wymagania tierów zaktualizowane o resources i efficiency (TierRequirement, checkTierRequirements)

### Faza 3: Pracownicy i koszty Industrial
13. [x] System pensji pracowników Industrial (15% produkcji) - analogiczny do Media
    - Budynki i2_workers i i3_training odliczają 15% produkcji na pensje
    - Zaimplementowane w updateProductionRates()
14. [x] UI panelu zarządzania fabryką
    - FactoryPanel.tsx z kondycją, efektywnością, surowcami
    - Wyświetla pracowników, koszty stałe, wpływ na rynek (Tier 5)

### Faza 4: Kontrakty i eventy Industrial
15. [x] System kontraktów produkcyjnych w contracts.ts:
    - Nowy typ "production" dla Industrial
    - 5 poziomów kontraktów: lokalne, regionalne, krajowe, rządowe, międzynarodowe
    - Nagrody: money, reputation, efficiency, resources
    - Kary: reputation, efficiency
    - Wymagania: minResources, minEfficiency
16. [x] ContractPanel zaktualizowany dla Industrial:
    - Nowy typ kontraktu "Produkcja" z kolorem pomarańczowym
    - Tooltip z opisem Industrial contracts
    - Wyświetlanie nagród/kar efficiency i resources
17. [x] generateContractOffer przyjmuje path, resources, efficiency
18. [x] checkContracts obsługuje Industrial nagrody (efficiency, resources)
19. [x] Eventy przemysłowe - pozytywne w events.ts:
    - economic_boom: +50% produkcji przez 5 min
    - government_grant: +10,000$ i +5 reputation
    - tech_innovation: +10% efficiency i +10 reputation
    - export_contract: +25,000$ i +8 reputation
    - resource_discovery: +5000 surowców
20. [x] Eventy przemysłowe - negatywne w events.ts:
    - machine_breakdown: -30% kondycji maszyn, -500$
    - strike: -50% produkcji przez 3 min
    - delivery_delay: -100 surowców
    - workplace_accident: -15% efficiency przez 5 min, -1000$
    - safety_inspection: -20% produkcji przez 2 min, -2000$
    - resource_price_hike: -200 surowców, -1000$
    - competition: -20% produkcji przez 3 min
21. [x] triggerEvent obsługuje Industrial effects (resources, efficiency, machineCondition)
22. [x] rollForEvent przyjmuje path i efficiency
23. [x] EventNotification włączony dla Industrial path

### Faza 5: Zaawansowane mechaniki
18. [x] System importu z ryzykiem opóźnień (i3_import - 10% szansa na opóźnienie)
    - rollForEvent sprawdza czy gracz ma i3_import i zwiększa szansę delivery_delay
    - Szansa: 3% bazowa + 10% za każdy kanał importowy
19. [ ] Strajki i związki zawodowe (Tier 4+) - częściowo (event "strike" istnieje)
20. [x] R&D i innowacje (i4_rnd - losowe permanentne bonusy)
    - Event tech_innovation wymaga i4_rnd
    - Daje +10% efficiency permanentnie
21. [x] Własne surowce - kopalnia (i4_mine - event z bonusem)
    - Event resource_discovery wymaga i4_mine
    - Daje +5000 surowców

### Faza 6: Endgame
22. [x] Budynki Tier 5 zdefiniowane w gamedata.ts
23. [x] Prestige system dla Industrial (analogiczny do Media)
    - Bonusy startowe: surowce i efektywność
    - PrestigePanel z UI dla Industrial (pomarańczowy motyw)
    - calculatePrestigeReward uwzględnia resources i efficiency
24. [x] Wpływ na rynek (Tier 5 - wpływ produkcji na ceny)
    - Logarytmiczna skala bonusu (do +50%)
    - Wyświetlanie w FactoryPanel
    - Aktywuje się gdy produkcja > 500$/s

---

## Status implementacji: 2026-01-28

### UKOŃCZONE (Fazy 1-6):

**Backend / Store:**
- [x] Wszystkie tiery i budynki Industrial w gamedata.ts (26 budynków)
- [x] Baza danych z polami: resources, efficiency, machineCondition
- [x] useGameStore.ts z pełną obsługą Industrial:
  - Stan: resources, efficiency, machineCondition, resourcesPerSecond
  - Akcje: setResources, addResources, setEfficiency, setMachineCondition, repairMachines
  - Tick: decay maszyn, automatyczna konserwacja, zużycie surowców
  - Produkcja: mnożniki efficiency, kondycji i dostępności surowców
- [x] Zapisywanie/wczytywanie stanu Industrial w gameActions.ts
- [x] System pensji pracowników Industrial (15% dla i2_workers, i3_training)
- [x] System importu z ryzykiem opóźnień (i3_import zwiększa szansę delivery_delay)
- [x] R&D system (tech_innovation wymaga i4_rnd)
- [x] Kopalnia bonus (resource_discovery wymaga i4_mine)
- [x] Prestige system dla Industrial (startowe surowce i efektywność)

**UI:**
- [x] Dashboard z Industrial stats (Surowce, Efektywność, Kondycja, Łączne zarobki)
- [x] Przycisk "Napraw maszyny" dla Tier 1-2 z Progress bar
- [x] BuildingCard pokazuje resourcesPerSecond
- [x] Tier tabs używają getTiersForPath(path)
- [x] DEV przyciski debug dla Industrial
- [x] PrestigePanel z pomarańczowym motywem dla Industrial

**Kontrakty:**
- [x] 5 poziomów kontraktów produkcyjnych (lokalne → międzynarodowe)
- [x] ContractPanel zaktualizowany dla Industrial
- [x] Nagrody/kary efficiency i resources

**Eventy:**
- [x] 5 pozytywnych eventów Industrial (w tym R&D i kopalnia z wymaganymi budynkami)
- [x] 7 negatywnych eventów Industrial (w tym zwiększone ryzyko dla importu)
- [x] EventNotification działa dla Industrial

### POZOSTAŁE DO ZROBIENIA:
Wszystkie główne funkcjonalności zostały zaimplementowane!

---

## Balans - Porównanie z Media

| Aspekt | Media | Industrial |
|--------|-------|------------|
| Druga waluta | Followers | Surowce |
| Główna metryka | Reputacja (0-100) | Efektywność (0-150%) |
| Decay | Content decay (-2%/min) | Zużycie maszyn (-1%/min) |
| Aktywność | Publikuj (+10% na 30s) | Napraw (+20% kondycji) |
| Pracownicy | Morale (50-120%) | Pensje (15% produkcji) |
| Eventy negatywne | Skandale | Strajki, awarie |
| Eventy pozytywne | Viral, sponsor | Boom, dotacja |

---

## Notatki Techniczne

**Prefiks budynków:** `i` (np. i1_workshop, i2_machine, i3_assembly)

- Surowce jako osobne pole w bazie (resources: Float)
- Efektywność jako mnożnik produkcji
- Kondycja maszyn przechowywana w stanie (machineCondition: Float)
- Konsumpcja surowców = suma (building.resourcesPerSecond × count) - ujemne wartości = zużycie
- Produkcja efektywna = baseProduction × (resources / consumption) × efficiency × condition

---

## Przykładowe Czasy Progresji

| Milestone | Szacowany czas |
|-----------|----------------|
| Tier 2 | 30-60 minut |
| Tier 3 | 3-5 godzin |
| Tier 4 | 1-2 dni |
| Tier 5 | 1 tydzień |
| Pełne ukończenie | 2-3 tygodnie |
