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

// Raw SQL z NOW() - baza oblicza różnicę czasu
const saveWithTime = await prisma.$queryRaw`
  SELECT *,
  EXTRACT(EPOCH FROM (NOW() - "lastPlayedAt"))::integer as "secondsElapsed"
  FROM "GameSave"
  WHERE "id" = ${saveId}
  LIMIT 1
`;

const secondsElapsed = Number(save.secondsElapsed) || 0;
const productionRate = Number(save.lastProductionPerSecond) || 0;

if (secondsElapsed > 30 && productionRate > 0) {
  const cappedSeconds = Math.min(secondsElapsed, 28800); // max 8h
  const offlineEarnings = Math.floor(productionRate * cappedSeconds * 0.20);
  // Dodaje do money, zapisuje do bazy, zwraca offlineEarnings
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
// + raw SQL z NOW() zamiast JS Date
// + Number() dla wszystkich wartości liczbowych
```

## Stan w bazie (produkcja) - DZIAŁA

Krystian Proc - Media #1:
- `lastProductionPerSecond: 1148.5` ✓
- `buildings: 19+ types` ✓
- `lastPlayedAt` aktualizuje się poprawnie ✓

## Problem

**Serwer NIE zwraca `offlineEarnings` do klienta** mimo że:
- Dane w bazie są poprawne
- Lokalnie (check-db.mjs) warunek `secondsElapsed > 30` jest spełniony
- `noStore()` jest wywołane
- `dynamic = 'force-dynamic'` i `revalidate = 0` są ustawione
- Raw SQL z `NOW()` jest używane
- `Number()` jest używane dla wszystkich wartości

Logi klienta pokazują:
```
initialState from server: {
  offlineEarnings: undefined,  // <-- problem
  offlineSeconds: undefined,   // <-- problem
  money: 400590.33             // <-- wartość z bazy BEZ offline earnings
}
```

## Co zostało wypróbowane

1. ❌ `noStore()` w Server Action - nie pomogło
2. ❌ `noStore()` w page.tsx - nie pomogło
3. ❌ `dynamic = 'force-dynamic'` - nie pomogło
4. ❌ `revalidate = 0` - nie pomogło
5. ❌ Raw SQL z `NOW()` zamiast JS Date - nie pomogło
6. ❌ `Number()` dla Decimal values - nie pomogło

## Hipotezy do zbadania

1. **Vercel serverless cold start** - może funkcja jest cachowana na poziomie Lambda?
2. **Connection pooling Neon** - read replica może nie mieć aktualnych danych
3. **Coś blokuje wykonanie warunku if** - mimo że lokalnie działa
4. **Problem z serializacją** - Next.js może nie przekazywać wszystkich pól

## Pliki

- `src/actions/gameActions.ts:242` - `getGameState()` z logiką offline (raw SQL)
- `src/app/api/save/route.ts` - API route dla keepalive save
- `src/components/GameLoop.tsx` - auto-save co 15s
- `src/components/Dashboard.tsx:28` - `OfflineEarningsModal`
- `src/app/dashboard/page.tsx` - Server Component wywołujący getGameState()
