# System Zapisywania i Offline Earnings (v2)

## Zmiany w architekturze

### Przed (problematyczne)
- Budynki przechowywane w osobnej tabeli `Building` (relacja Prisma)
- Zapisywanie wymagało wielu operacji upsert
- `beforeunload` używało async Server Action (niezawodne)
- Offline earnings obliczane z budynków w bazie (mogły być nieaktualne)

### Teraz (zoptymalizowane)
- Budynki przechowywane jako **JSON** w polu `buildings` tabeli `GameSave`
- **Atomowy zapis** - wszystko w jednym zapytaniu SQL
- `beforeunload` używa **fetch z keepalive** do `/api/save`
- Offline earnings obliczane z **zapisanego snapshotu produkcji** (`lastProductionPerSecond`)

---

## Struktura danych

### GameSave (Prisma)
```prisma
model GameSave {
  // ... inne pola ...
  buildings               Json       @default("{}")  // Record<string, number>
  lastProductionPerSecond Float      @default(0)     // Snapshot dla offline
  lastPlayedAt            DateTime   @default(now()) @db.Timestamptz
}
```

---

## Przepływ zapisywania

### 1. Auto-save (GameLoop.tsx) - co 15 sekund
```
GameLoop wykrywa że minęło 15s (SAVE_INTERVAL)
  ↓
Wywołuje saveGame() z całym stanem:
  - money, followers, buildings (JSON)
  - lastProductionPerSecond = moneyPerSecond (snapshot!)
  ↓
saveGame() wykonuje JEDEN update do PostgreSQL
  ↓
lastPlayedAt jest aktualizowany (updateLastPlayedAt = true)
```

### 2. Zapis przy ukryciu karty (visibilitychange)
```
document.hidden = true
  ↓
Natychmiast wywołuje saveGame() z pełnym stanem
```

### 3. Zapis przy zamknięciu przeglądarki (beforeunload)
```
Użytkownik zamyka przeglądarkę/kartę
  ↓
fetch("/api/save", { keepalive: true }) ← KLUCZOWE!
  ↓
Przeglądarka GWARANTUJE ukończenie requestu nawet po zamknięciu
  ↓
/api/save wykonuje atomowy update do bazy
```

---

## Przepływ offline earnings

### Przy ładowaniu gry (getGameState)
```
getGameState() pobiera save z bazy
  ↓
Oblicza: secondsElapsed = now - lastPlayedAt
  ↓
Jeśli secondsElapsed > 30 i lastProductionPerSecond > 0:
  ↓
  offlineEarnings = lastProductionPerSecond * min(secondsElapsed, 28800) * 0.20
  ↓
  Dodaje do money i zapisuje do bazy
  ↓
Zwraca zaktualizowany stan
```

### Formuła offline earnings
```
earnings = lastProductionPerSecond × cappedSeconds × 0.20

gdzie:
- lastProductionPerSecond = snapshot produkcji z ostatniego zapisu
- cappedSeconds = min(secondsElapsed, 28800)  // max 8 godzin
- 0.20 = 20% normalnej produkcji
```

---

## Diagram przepływu

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRZEGLĄDARKA                              │
│                                                                  │
│  ┌──────────────────┐    ┌──────────────────┐                   │
│  │   Zustand Store  │◄───│    GameLoop      │                   │
│  │   (stan w RAM)   │    │  (tick + save)   │                   │
│  └────────┬─────────┘    └────────┬─────────┘                   │
│           │                       │                              │
│           │            ┌──────────┴──────────┐                  │
│           │            │                     │                  │
│           │      co 15s/visibility    beforeunload              │
│           │            │                     │                  │
│           │            ▼                     ▼                  │
│           │    ┌──────────────┐      ┌──────────────┐          │
│           │    │  saveGame()  │      │ fetch +      │          │
│           │    │ Server Action│      │ keepalive    │          │
│           │    └──────┬───────┘      └──────┬───────┘          │
└───────────┼───────────┼──────────────────────┼───────────────────┘
            │           │                      │
            │           ▼                      ▼
┌───────────┼───────────────────────────────────────────────────────┐
│           │                   SERWER                              │
│           │                                                       │
│           │           ┌──────────────┐  ┌──────────────┐         │
│           │           │ Server Action│  │ /api/save    │         │
│           │           │  saveGame()  │  │ Route Handler│         │
│           │           └──────┬───────┘  └──────┬───────┘         │
│           │                  │                 │                  │
│           │                  └────────┬────────┘                  │
│           │                           ▼                           │
│           │                  ┌──────────────────┐                │
│           │                  │    PostgreSQL    │                │
│           │                  │  ┌────────────┐  │                │
│           │                  │  │  GameSave  │  │                │
│           │                  │  │  - money   │  │                │
│           │                  │  │  - buildings (JSON)            │
│           │                  │  │  - lastProductionPerSecond     │
│           │                  │  │  - lastPlayedAt                │
│           │                  │  └────────────┘  │                │
│           │                  └────────┬─────────┘                │
│           │                           │                          │
│           │                  ┌────────┴─────────┐                │
│           │                  │  getGameState()  │                │
│           │                  │ + offline calc   │                │
│           │                  └────────┬─────────┘                │
└───────────┼───────────────────────────┼──────────────────────────┘
            │                           │
            ▼                           ▼
┌───────────────────────────────────────────────────────────────────┐
│  initializeFromServer() ◄─────────────┘                          │
│  (aktualizuje Zustand Store)                                      │
└───────────────────────────────────────────────────────────────────┘
```

---

## Kluczowe ulepszenia

1. **Atomowy zapis** - buildings jako JSON, wszystko w jednym UPDATE
2. **keepalive** - gwarantuje zapis przy zamknięciu przeglądarki
3. **Snapshot produkcji** - offline earnings nie zależą od budynków w bazie
4. **Krótszy interwał** - 15s zamiast 30s = max 15s utraconego progresu
5. **Brak relacji** - usunięta tabela Building, prostszy model

---

## Checklist debugowania

1. **Czy `/api/save` działa?**
   - Sprawdź Network tab w DevTools przy zamykaniu karty
   - Request powinien mieć status "pending" → "200"

2. **Czy `lastProductionPerSecond` jest zapisywane?**
   - Sprawdź w bazie po kilku sekundach gry
   - Powinno być > 0 jeśli masz budynki

3. **Czy `lastPlayedAt` jest aktualne?**
   - Timestamp w bazie powinien być bliski czasowi zamknięcia

4. **Czy budynki są w JSON?**
   - Pole `buildings` powinno wyglądać jak: `{"f1_savings": 3, "f1_bonds": 2}`
