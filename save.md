# Offline Earnings System

## Jak działa

### 1. Zapisywanie produkcji (podczas gry)
Przy każdym auto-save (co 15 sekund) oraz przy zamknięciu karty:
- `GameLoop.tsx` wywołuje `saveGame()` lub `/api/save`
- Zapisuje `lastProductionPerSecond` = aktualny `moneyPerSecond`
- Zapisuje `lastPlayedAt` = aktualny timestamp
- Zapisuje `buildings` jako JSON

### 2. Obliczanie przy powrocie
W `getGameState()` (server-side, wywoływane w `page.tsx`):
```
secondsElapsed = now - lastPlayedAt

Jeśli secondsElapsed > 30 && lastProductionPerSecond > 0:
  cappedSeconds = min(secondsElapsed, 28800)  // max 8h
  offlineEarnings = lastProductionPerSecond × cappedSeconds × 0.20

  money += offlineEarnings
  totalEarnings += offlineEarnings
  → Zapisuje do bazy
  → Zwraca offlineEarnings i offlineSeconds do klienta
```

### 3. Modal
`Dashboard.tsx` otrzymuje `initialState` z `page.tsx` (server component).
Jeśli `initialState.offlineEarnings > 0`, pokazuje modal.

## Formuła
```
earnings = lastProductionPerSecond × min(sekundy, 28800) × 0.20
```
- 20% normalnej produkcji
- Max 8 godzin (28800 sekund)

## Stan w bazie (produkcja)

Krystian Proc - Media #1:
- `lastProductionPerSecond: 1098.5` ✓
- `buildings: 19 types, 221 total` ✓
- Dane zapisują się poprawnie

## Problem

Modal nie wyświetla się mimo że:
- `lastProductionPerSecond > 0`
- `buildings` są zapisane
- Czas offline > 30 sekund

## Pliki

- `src/actions/gameActions.ts:238` - `getGameState()` oblicza offline earnings
- `src/app/api/save/route.ts` - API route dla keepalive save
- `src/components/GameLoop.tsx` - auto-save co 15s
- `src/components/Dashboard.tsx:28` - `OfflineEarningsModal` komponent
- `src/app/dashboard/page.tsx` - wywołuje `getGameState()` server-side
