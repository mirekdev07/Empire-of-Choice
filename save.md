# Offline Earnings System

## Jak działa

### 1. Zapisywanie produkcji (podczas gry)
Przy każdym auto-save (co 15 sekund) oraz przy zamknięciu karty:
- `GameLoop.tsx` wywołuje `saveGame()` lub `/api/save`
- Zapisuje `lastProductionPerSecond` = aktualny `moneyPerSecond` z Zustand store
- Zapisuje `lastPlayedAt` = aktualny timestamp
- Zapisuje `buildings` jako JSON

### 2. Obliczanie przy powrocie
W `getGameState()` (wywoływane przy ładowaniu strony):
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
`Dashboard.tsx` pokazuje modal jeśli `initialState.offlineEarnings > 0`

## Wymagania do działania

1. **Budynki muszą być zapisane** w polu JSON `buildings` w bazie
2. **lastProductionPerSecond > 0** - wymaga budynków które produkują
3. **Czas offline > 30 sekund**

## Formuła
```
earnings = lastProductionPerSecond × min(sekundy, 28800) × 0.20
```
- 20% normalnej produkcji
- Max 8 godzin (28800 sekund)

## Aktualny problem

**W bazie `buildings = {}` i `lastProductionPerSecond = 0`**

Prawdopodobne przyczyny:
1. Migracja z tabeli `Building` do JSON nie przeniosła danych
2. Auto-save może nie działać (sprawdzić logi Vercela)

## Pliki

- `src/actions/gameActions.ts` - `getGameState()`, `saveGame()`
- `src/app/api/save/route.ts` - API route dla keepalive save
- `src/components/GameLoop.tsx` - auto-save co 15s
- `src/components/Dashboard.tsx` - modal offline earnings
