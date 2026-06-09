# Offline Earnings System

## Jak działa (ROZWIĄZANE)

### Problem
Przy zamknięciu karty, `beforeunload` wysyłał zapis przez `/api/save`, który aktualizował `lastPlayedAt`. Gdy użytkownik wracał, `getGameState()` widział że "ostatnia aktywność" była ułamek sekundy temu, więc `secondsElapsed ≈ 0`.

### Rozwiązanie: System Heartbeat (dwie daty)

#### 1. Dwa pola czasowe w bazie
- `lastPlayedAt` - aktualizowane przy KAŻDYM zapisie (również keepalive przy zamknięciu)
- `lastHeartbeat` - aktualizowane TYLKO podczas aktywnej gry (Server Action)

#### 2. Kto aktualizuje co
| Źródło | lastPlayedAt | lastHeartbeat |
|--------|--------------|---------------|
| `saveGame()` Server Action (co 15s) | ✓ | ✓ |
| `/api/save` keepalive (przy zamknięciu) | ✓ | ❌ |

#### 3. Obliczanie offline earnings
```typescript
// getGameState() używa lastHeartbeat, NIE lastPlayedAt
const lastHeartbeat = new Date(save.lastHeartbeat);
const secondsElapsed = Math.floor(Math.abs(now.getTime() - lastHeartbeat.getTime()) / 1000);

if (secondsElapsed > 60 && productionRate > 0) {
  offlineEarnings = Math.floor(productionRate * cappedSeconds * 0.20);
  // Update database i reset heartbeat
}
```

## Formuła
```
earnings = lastProductionPerSecond × min(sekundy, 28800) × 0.20
```
- 20% normalnej produkcji
- Max 8 godzin (28800 sekund)
- Minimum 60 sekund offline

## Konfiguracja

### prisma/schema.prisma
```prisma
lastPlayedAt            DateTime   @default(now()) @db.Timestamptz
lastHeartbeat           DateTime   @default(now()) @db.Timestamptz
lastProductionPerSecond Float      @default(0)
```

### page.tsx
```typescript
export const dynamic = 'force-dynamic';
export const revalidate = 0;
noStore();
```

## Pliki

- `src/actions/gameActions.ts:242` - `getGameState()` oblicza offline (używa lastHeartbeat)
- `src/actions/gameActions.ts:502` - `saveGame()` aktualizuje lastHeartbeat
- `src/app/api/save/route.ts` - keepalive (NIE aktualizuje lastHeartbeat)
- `src/components/GameLoop.tsx` - auto-save co 15s
- `src/components/Dashboard.tsx` - `OfflineEarningsModal`

## Status: ✅ DZIAŁA
