# Empire of Choice - Tycoon Idle Game

Gra typu Tycoon/Idle z trzema ścieżkami rozwoju, systemem budynków, kontraktów, eventów i prestige.

**Live:** https://empire-of-choice.vercel.app

## Status projektu

### Zaimplementowane funkcjonalności

| Funkcja | Status |
|---------|--------|
| Ścieżka Media | ✅ Kompletna |
| Ścieżka Industrial | ✅ Kompletna |
| Ścieżka Finance | ✅ Kompletna |
| System osiągnięć (65 achievementów) | ✅ Kompletny |
| Ranking graczy | ✅ Kompletny |
| Wielojęzyczność (PL, EN, DE) | ✅ Kompletna |
| Zarobki offline | ✅ Kompletne |
| System kontraktów | ✅ Kompletny |
| System eventów | ✅ Kompletny |
| System prestige | ✅ Kompletny |
| Autentykacja (email + Google) | ✅ Kompletna |

## Funkcjonalności gry

### Główne systemy
- **3 ścieżki rozwoju** - Media, Przemysł, Finanse
- **5 tierów rozwoju** - od małego startupu do imperium
- **65 osiągnięć** - z nagrodami pieniężnymi
- **Ranking graczy** - dla każdej ścieżki osobno
- **System kontraktów** - zlecenia z nagrodami
- **System eventów** - losowe wydarzenia
- **System prestige** - reset z permanentnymi bonusami
- **Do 5 zapisów gry** - na użytkownika
- **Zarobki offline** - do 8 godzin (20% produkcji)

### Ścieżka Media
- Content Decay - produkcja spada bez publikowania
- Followers - druga waluta
- Morale zespołu (Tier 3+)
- Synergie budynków (Tier 2+)

### Ścieżka Industrial
- Surowce - konsumowane przez produkcję
- Efektywność (0-150%)
- Kondycja maszyn (0-100%)
- R&D - bonusy efektywności

### Ścieżka Finance
- AUM (Assets Under Management)
- Rating kredytowy (D do AAA)
- Dźwignia finansowa (1x-20x)
- Fazy rynku (bull, stable, correction, bear, crash)
- Hedging (Tier 3+)

## Technologie

- **Framework**: Next.js 16 (App Router, Server Actions)
- **Język**: TypeScript
- **Baza danych**: PostgreSQL (Neon)
- **ORM**: Prisma 7
- **Autoryzacja**: NextAuth v5
- **State**: Zustand
- **UI**: Tailwind CSS + shadcn/ui
- **i18n**: next-intl
- **Hosting**: Vercel

## Uruchomienie lokalne

### Wymagania
- Node.js 18+
- PostgreSQL (lub Docker)

### Instalacja

```bash
# Zainstaluj zależności
npm install

# Skonfiguruj zmienne środowiskowe
cp .env.example .env
# Uzupełnij DATABASE_URL, NEXTAUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

# Wygeneruj Prisma Client
npx prisma generate

# Zastosuj migracje
npx prisma db push

# Uruchom aplikację
npm run dev
```

Otwórz http://localhost:3000

## Struktura projektu

```
src/
├── app/                    # Strony (App Router)
│   ├── page.tsx           # Landing page
│   ├── auth/              # Logowanie/rejestracja
│   ├── saves/             # Wybór zapisów
│   ├── dashboard/         # Główny widok gry
│   ├── achievements/      # Osiągnięcia
│   └── ranking/           # Ranking graczy
├── actions/               # Server Actions
├── components/            # Komponenty React
├── config/                # Konfiguracja gry
│   ├── gamedata.ts        # Budynki i tiery
│   ├── achievements.ts    # Definicje osiągnięć
│   ├── contracts.ts       # Kontrakty
│   ├── events.ts          # Eventy
│   └── prestige.ts        # Prestige
├── store/                 # Zustand store
├── i18n/                  # Konfiguracja i18n
├── messages/              # Tłumaczenia (pl, en, de)
└── lib/                   # Utilities
```

## TODO (opcjonalne)

- [ ] Efekty dźwiękowe
- [ ] Ulepszenia mobilne
- [ ] Więcej języków
- [ ] Dark/Light mode
