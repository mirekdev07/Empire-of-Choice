# Offline Earnings System

## Jak działa (obecna implementacja)

### 1. Zapisywanie produkcji (podczas gry)
Przy każdym auto-save (co 15 sekund) oraz przy zamknięciu karty:
- `GameLoop.tsx` wywołuje `saveGame()` lub `/api/save`
- Zapisuje `lastProductionPerSecond` = aktualny `moneyPerSecond`
- Zapisuje `lastPlayedAt` = `new Date()` (czas serwera)
- Zapisuje `buildings` jako JSON

### 2. Obliczanie przy powrocie
W `getGameState()` (src/actions/gameActions.ts:242):
```typescript
noStore(); // Wyłączenie Next.js Data Cache

const now = new Date();
const lastSave = new Date(save.lastPlayedAt);
const secondsElapsed = Math.floor((now.getTime() - lastSave.getTime()) / 1000);

if (secondsElapsed > 30 && save.lastProductionPerSecond > 0) {
  const cappedSeconds = Math.min(secondsElapsed, 28800); // max 8h
  const offlineEarnings = Math.floor(lastProductionPerSecond * cappedSeconds * 0.20);

  // Dodaje do money i zapisuje do bazy
  // Zwraca offlineEarnings i offlineSeconds do klienta
}
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

## Konfiguracja anti-cache

### page.tsx
```typescript
export const dynamic = 'force-dynamic';
export const revalidate = 0;
noStore(); // w komponencie
```

### gameActions.ts
```typescript
noStore(); // na początku getGameState()
```

## Stan w bazie (produkcja) - DZIAŁA

Krystian Proc - Media #1:
- `lastProductionPerSecond: 1148.5` ✓
- `buildings: 19+ types` ✓
- `lastPlayedAt` aktualizuje się poprawnie ✓

## Problem

**Serwer NIE zwraca `offlineEarnings` do klienta** mimo że:
- Dane w bazie są poprawne
- Lokalnie warunek `secondsElapsed > 30` jest spełniony
- `noStore()` jest wywołane
- `dynamic = 'force-dynamic'` i `revalidate = 0` są ustawione

Logi klienta pokazują:
```
initialState from server: {
  offlineEarnings: undefined,  // <-- problem
  offlineSeconds: undefined,   // <-- problem
  money: 281085.89             // <-- stara wartość z bazy, bez dodania offline
}
```

## Możliwe przyczyny do zbadania

1. **Czas serwera Vercela** - może być inny niż czas w bazie Neon
2. **Cache na poziomie Prisma/PG connection pooling**
3. **Server Action nie wykonuje się świeżo** mimo noStore()
4. **Edge runtime vs Node runtime** - różnice w zachowaniu

## Pliki

- `src/actions/gameActions.ts:242` - `getGameState()` z logiką offline
- `src/app/api/save/route.ts` - API route dla keepalive save
- `src/components/GameLoop.tsx` - auto-save co 15s
- `src/components/Dashboard.tsx:28` - `OfflineEarningsModal`
- `src/app/dashboard/page.tsx` - Server Component wywołujący getGameState()
