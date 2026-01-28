# Media i Rozrywka - Szczegółowy Plan Rozwoju

## Koncepcja

Gracz zaczyna jako początkujący twórca treści i wspina się po szczeblach kariery medialnej. Każdy **Tier** reprezentuje etap kariery i wymaga spełnienia określonych warunków, aby odblokować kolejny. Progresja jest wolniejsza, bardziej satysfakcjonująca i realistyczna.

---

## System Tierów (Etapy Kariery)

### 🌱 TIER 1: Początkujący Twórca (Start)
**Opis:** Zaczynasz w swoim pokoju z laptopem i marzeniami. Wszystko robisz sam.

**Dostępne aktywa:**
| ID | Nazwa | Koszt bazowy | Produkcja/s | Opis |
|----|-------|--------------|-------------|------|
| m1_blog | Blog osobisty | 50 | 0.1 | Piszesz artykuły w wolnym czasie |
| m1_social | Konto Social Media | 100 | 0.2 | Posty na Instagram/TikTok |
| m1_freelance | Zlecenia freelance | 300 | 0.5 | Piszesz teksty dla innych |

**Mechaniki Tier 1:**
- Ręczne klikanie "Publikuj" daje bonus +10% do produkcji na 30s
- Content decay: -2% co minutę (brak regularności = spadek)
- Maksymalnie 10 sztuk każdego aktywa

**Warunki odblokowania Tier 2:**
- [ ] Osiągnij 5,000$ łącznych zarobków
- [ ] Posiadaj minimum 5 blogów LUB 5 kont social media
- [ ] Zdobądź 1,000 "followersów" (nowa waluta)

---

### 📈 TIER 2: Rozpoznawalny Twórca
**Opis:** Ludzie zaczynają Cię rozpoznawać. Możesz myśleć o tym poważniej.

**Odblokowuje:**
| ID | Nazwa | Koszt bazowy | Produkcja/s | Opis |
|----|-------|--------------|-------------|------|
| m2_youtube | Kanał YouTube | 2,000 | 3 | Twój własny kanał |
| m2_podcast | Podcast | 1,500 | 2 | Cotygodniowe odcinki |
| m2_newsletter | Newsletter | 800 | 1.5 | Płatna subskrypcja |
| m2_merch | Sklep z merch | 3,000 | 4 | Koszulki, kubki z Twoim logo |

**Nowe mechaniki:**
- **Followers** - nowa waluta, zdobywana pasywnie z aktywów Tier 1 ✅
- **Sponsorzy** - losowe oferty sponsorskie (mini-eventy) ✅
- **Collaborations** - możliwość "połączenia" dwóch aktywów dla bonusu (synergie: YouTube+Podcast, Social+YouTube, itp.) ✅
- Content decay spowolniony do -1% co minutę ✅

**Warunki odblokowania Tier 3:**
- [ ] Osiągnij 50,000$ łącznych zarobków
- [ ] Posiadaj 10,000 followersów
- [ ] Posiadaj minimum 3 kanały YouTube LUB 5 podcastów
- [ ] Ukończ pierwszy kontrakt sponsorski

---

### 🏢 TIER 3: Profesjonalista / Mała Agencja
**Opis:** Nie możesz już wszystkiego robić sam. Czas zatrudnić ludzi.

**Odblokowuje:**
| ID | Nazwa | Koszt bazowy | Produkcja/s | Opis |
|----|-------|--------------|-------------|------|
| m3_editor | Montażysta | 10,000 | 8 | Ktoś montuje Twoje filmy |
| m3_writer | Copywriter | 8,000 | 6 | Ktoś pisze za Ciebie |
| m3_manager | Social Media Manager | 15,000 | 12 | Zarządza Twoimi kontami |
| m3_studio | Małe studio | 50,000 | 25 | Własne miejsce do nagrywania |
| m3_agency | Mikro-agencja | 100,000 | 40 | Reprezentujesz innych twórców |

**Nowe mechaniki:**
- **Pracownicy** - mają "morale" (wpływa na produkcję)
- **Koszty stałe** - pensje zjadają część produkcji (np. 20%)
- **Reputacja** - nowa metryka, wpływa na oferty sponsorskie
- **Umowy długoterminowe** - stabilny dochód przez X czasu
- Content decay wyłączony (masz ludzi od tego)

**Warunki odblokowania Tier 4:**
- [ ] Osiągnij 500,000$ łącznych zarobków
- [ ] Posiadaj 100,000 followersów
- [ ] Zatrudnij minimum 5 pracowników
- [ ] Reputacja minimum 50/100
- [ ] Podpisz 3 umowy długoterminowe

---

### 🌟 TIER 4: Influencer / Studio Produkcyjne
**Opis:** Jesteś kimś w branży. Marki same do Ciebie przychodzą.

**Odblokowuje:**
| ID | Nazwa | Koszt bazowy | Produkcja/s | Opis |
|----|-------|--------------|-------------|------|
| m4_brand_deal | Umowa z marką | 200,000 | 100 | Ekskluzywna współpraca |
| m4_production | Studio produkcyjne | 500,000 | 200 | Produkujesz content dla innych |
| m4_app | Własna aplikacja | 300,000 | 150 | Twoja platforma dla fanów |
| m4_course | Kurs online | 150,000 | 80 | "Jak zostać influencerem" |
| m4_talent | Agencja talentów | 750,000 | 300 | Zarządzasz gwiazdami |

**Nowe mechaniki:**
- **Konkurencja** - inni influencerzy walczą o te same deale
- **Skandale** - losowe negatywne eventy (trzeba zarządzać PR) ✅
- **Dywersyfikacja** - bonus za posiadanie różnych typów aktywów (+5% za każdy unikalny typ, max 50%) ✅
- **Pasywni inwestorzy** - możesz pozyskać funding (opcjonalne)

**Warunki odblokowania Tier 5:**
- [ ] Osiągnij 5,000,000$ łącznych zarobków
- [ ] Posiadaj 1,000,000 followersów
- [ ] Reputacja minimum 75/100
- [ ] Posiadaj studio produkcyjne
- [ ] Przetrwaj 3 skandale bez utraty >50% followersów

---

### 👑 TIER 5: Imperium Medialne
**Opis:** Jesteś potentatem. Twoje decyzje wpływają na całą branżę.

**Odblokowuje:**
| ID | Nazwa | Koszt bazowy | Produkcja/s | Opis |
|----|-------|--------------|-------------|------|
| m5_network | Sieć kanałów | 5,000,000 | 1,500 | Multi-Channel Network |
| m5_streaming | Platforma streamingowa | 20,000,000 | 5,000 | Twój własny "Netflix" |
| m5_record_label | Wytwórnia muzyczna | 10,000,000 | 3,000 | Podpisujesz artystów |
| m5_media_house | Dom mediowy | 50,000,000 | 10,000 | Konglomerat mediowy |
| m5_acquisition | Przejęcia | varies | varies | Kupujesz konkurencję |

**Nowe mechaniki:**
- **Wpływ na rynek** - Twoje decyzje wpływają na ceny/trendy
- **Lobbing** - możesz wpływać na "regulacje" (eventy)
- **Dziedzictwo** - budowanie czegoś trwałego
- **Prestiż** - końcowa punktacja/ranking

---

## System Followersów (Druga Waluta)

| Źródło | Followers/s | Uwagi |
|--------|-------------|-------|
| Blog (Tier 1) | 0.01 | Bardzo wolno |
| Social Media (Tier 1) | 0.05 | Główne źródło na start |
| YouTube (Tier 2) | 0.5 | 10x szybciej |
| Viralowy post | +1000 jednorazowo | Losowy event |
| Skandal | -20% total | Losowy negatywny event |

**Followers są potrzebni do:**
- Odblokowania tierów
- Lepszych ofert sponsorskich
- Wyższej reputacji
- Niektórych aktywów (np. Brand Deal wymaga 500k followers)

---

## System Reputacji

**Skala:** 0-100

**Co zwiększa reputację:**
- Regularne publikowanie (+1/dzień aktywności)
- Ukończone kontrakty (+5 każdy)
- Milestone'y followersów (+10 za każdy x10)
- Pozytywne eventy (+5-20)

**Co zmniejsza reputację:**
- Brak aktywności przez 24h (-2/dzień)
- Nieukończone kontrakty (-10)
- Skandale (-15-30)
- "Sellout" - zbyt dużo reklam (-5)

---

## System Eventów

### Pozytywne eventy:
| Event | Efekt | Warunek |
|-------|-------|---------|
| Viralowy post | +1000 followers, +500$ | Losowy, 2% szansa/godz |
| Oferta sponsorska | Kontrakt wart X$ | Reputacja > 30 |
| Collaboration | +50% produkcji na 1h | Tier 2+ |
| Trending topic | x2 followers przez 30min | Tier 3+ |
| Nagroda branżowa | +20 reputacji, +10k$ | Tier 4+, reputacja > 80 |

### Negatywne eventy:
| Event | Efekt | Warunek |
|-------|-------|---------|
| Hejt w komentarzach | -5% followers | Losowy |
| Kontrowersja | -10 reputacji | Losowy, częstszy przy wysokiej reputacji |
| Copycat | -20% produkcji na 2h | Tier 3+ |
| Skandal | -20% followers, -20 reputacji | Tier 4+, wymaga zarządzania |
| Zmiana algorytmu | -30% produkcji na 24h | Losowy |

---

## Prestige System (Opcjonalnie - Późniejsza Faza)

Po osiągnięciu Tier 5 i spełnieniu warunków:
- **"Sprzedaj imperium"** - resetuj grę z bonusami
- **Bonus:** +X% do wszystkiego w następnej rozgrywce
- **Odblokowania:** Nowe ścieżki (np. "Inwestor medialny")

---

## UI/UX Zmiany

### Główny ekran:
```
┌─────────────────────────────────────────────┐
│  TIER 2: Rozpoznawalny Twórca    [75% → T3] │
├─────────────────────────────────────────────┤
│  💰 $12,450     👥 8,234 followers          │
│  ⭐ Reputacja: 45/100                        │
│  📈 +$2.5/s    👥 +0.3/s                    │
├─────────────────────────────────────────────┤
│  [Tier 1 Assets]  [Tier 2 Assets]  [🔒 T3]  │
│                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ YouTube  │  │ Podcast  │  │Newsletter│  │
│  │ x3       │  │ x2       │  │ x5       │  │
│  │ $9/s     │  │ $4/s     │  │ $7.5/s   │  │
│  │ [Kup]    │  │ [Kup]    │  │ [Kup]    │  │
│  └──────────┘  └──────────┘  └──────────┘  │
├─────────────────────────────────────────────┤
│  📋 Aktywne kontrakty: 2                     │
│  ⚡ Event: Oferta sponsorska! [Zobacz]       │
└─────────────────────────────────────────────┘
```

### Ekran postępu Tier:
```
┌─────────────────────────────────────────────┐
│  Odblokuj Tier 3: Profesjonalista           │
├─────────────────────────────────────────────┤
│  ✅ 50,000$ zarobków (52,340/50,000)        │
│  ⬜ 10,000 followers (8,234/10,000)          │
│  ✅ 3+ kanały YouTube (3/3)                  │
│  ⬜ Pierwszy kontrakt sponsorski (0/1)       │
├─────────────────────────────────────────────┤
│  Postęp: 50% ████████░░░░░░░░               │
└─────────────────────────────────────────────┘
```

---

## Implementacja - Kolejność

### Faza 1: Podstawy nowego systemu
1. [x] Nowy schemat bazy danych (tiers, followers, reputation) ✅
2. [x] Konfiguracja tierów i aktywów w `gamedata.ts` ✅
3. [x] System odblokowywania tierów ✅
4. [x] UI pokazujący aktualny tier i postęp ✅

### Faza 1b: Podstawowe mechaniki
5. [x] Content decay (-2%/min T1, -1%/min T2, wyłączony T3+) ✅
6. [x] Przycisk "Publikuj" (+10% produkcji na 30s) ✅
7. [x] Warunek budynków w odblokowaniu tierów ✅

### Faza 2: Followers i Reputacja
8. [x] System followersów (druga waluta) ✅
9. [x] Mechanika reputacji (zwiększanie/zmniejszanie) ✅
   - +1 reputacji za publikowanie (cooldown 1 min)
   - +10 reputacji za kamienie milowe followers (100, 1k, 10k, 100k, 1M, 10M)
   - -2 reputacji za brak aktywności (5 min dla testów)
10. [x] UI dla nowych metryk ✅
11. [ ] Balansowanie wartości

### Faza 3: Eventy i Kontrakty
12. [x] System eventów (losowych) ✅
    - Pozytywne: viralowy post, oferta sponsorska, kolaboracja, trending, nagroda
    - Negatywne: hejt, kontrowersja, copycat, skandal, zmiana algorytmu
    - Efekty czasowe (mnożniki produkcji) i natychmiastowe (pieniądze, followers, reputacja)
13. [x] System kontraktów/sponsorów ✅ (zintegrowany z eventami)
14. [x] UI dla eventów i kontraktów ✅
    - Popup powiadomień o nowych eventach
    - Pasek aktywnych efektów z odliczaniem czasu
15. [x] Notyfikacje ✅

### Faza 4: Zaawansowane mechaniki
16. [x] System pracowników (Tier 3+) z morale ✅
    - Morale 50-120% wpływa na produktywność pracowników
    - Publikowanie zwiększa morale o 5%
    - Brak aktywności powoduje spadek morale
17. [x] Koszty stałe (pensje) ✅
    - 20% produkcji pracowników idzie na pensje
    - Widoczne w panelu zarządzania zespołem
18. [x] Skandale i zarządzanie PR ✅ (zintegrowane z systemem eventów)
19. [ ] Konkurencja (opcjonalne - może być dodane później)

### Faza 5: Endgame
20. [x] Tier 5 mechaniki ✅ (budynki Tier 5 dostępne)
21. [x] Prestige system ✅
    - Wymaga Tier 5 i 10M$ łącznych zarobków
    - Punkty prestige na podstawie osiągnięć
    - Bonusy: produkcja, startowe pieniądze, followers, reputacja
    - Panel prestige w UI dla Tier 4+
22. [ ] Achievements (opcjonalne - może być dodane później)
23. [ ] Statystyki końcowe (opcjonalne)

---

## Balans - Przykładowe Czasy

| Milestone | Szacowany czas |
|-----------|----------------|
| Tier 2 | 30-60 minut |
| Tier 3 | 3-5 godzin |
| Tier 4 | 1-2 dni |
| Tier 5 | 1 tydzień |
| Pełne ukończenie | 2-3 tygodnie |

---

## Notatki Techniczne

- Followers powinni być przechowywani jako `BigInt` (mogą być bardzo duże)
- Eventy powinny być w osobnej tabeli z czasem wygaśnięcia
- Tier powinien być obliczany dynamicznie na podstawie warunków
- Reputacja powinna być przeliczana co X sekund, nie ciągle
- Rozważyć WebSocket dla real-time eventów
