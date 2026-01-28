# Empire of Choice - Tycoon Idle Game

Gra typu Tycoon/Idle z trzema ścieżkami rozwoju, systemem budynków, kontraktów, eventów i prestige.

## Funkcjonalności

### Zaimplementowane ścieżki

| Ścieżka | Status | Opis |
|---------|--------|------|
| **Media** | ✅ Kompletna | Followers, reputacja, content decay, publikowanie |
| **Industrial** | ✅ Kompletna | Surowce, efektywność, kondycja maszyn, R&D |
| **Finance** | ⏳ Planowana | Ryzyko i zyski, rynek |

### System gry

- **5 tierów rozwoju** - od małego warsztatu/bloga do imperium
- **26+ budynków na ścieżkę** - unikalne dla każdej ścieżki
- **System kontraktów** - zlecenia z nagrodami i karami
- **System eventów** - losowe pozytywne i negatywne wydarzenia
- **System prestige** - reset z permanentnymi bonusami
- **Wiele zapisów gry** - do 5 zapisów na użytkownika
- **Zarobki offline** - do 8 godzin zarobków podczas nieobecności

### Mechaniki ścieżek

#### Media
- **Content Decay** - produkcja spada bez regularnego publikowania
- **Followers** - druga waluta, potrzebna do awansów
- **Morale zespołu** (Tier 3+) - wpływa na produkcję
- **Synergie budynków** (Tier 2+) - bonusy za kombinacje

#### Industrial
- **Surowce** - potrzebne do produkcji, konsumowane przez budynki
- **Efektywność** (0-150%) - mnożnik produkcji
- **Kondycja maszyn** (0-100%) - wymaga konserwacji
- **Pensje pracowników** - 15% produkcji z budynków z pracownikami
- **Import z ryzykiem** - tańsze surowce, ale ryzyko opóźnień
- **R&D** - losowe permanentne bonusy efektywności
- **Kopalnia** - szansa na odkrycie złóż surowców

---

## Uruchomienie

### Wymagania
- Node.js 18+
- Docker (dla PostgreSQL)

### 1. Uruchom bazę danych
```bash
docker-compose up -d
```

### 2. Zainstaluj zależności
```bash
npm install
```

### 3. Skonfiguruj bazę danych
```bash
npx prisma db push
npx prisma generate
```

### 4. Uruchom aplikację
```bash
npm run dev
```

### 5. Otwórz przeglądarkę
```
http://localhost:3000
```

---

## Technologie

- **Framework**: Next.js 16 (App Router, Server Actions)
- **Język**: TypeScript
- **Baza danych**: PostgreSQL 15
- **ORM**: Prisma 7
- **Autoryzacja**: NextAuth v5
- **State Management**: Zustand
- **UI**: Tailwind CSS + shadcn/ui
- **Konteneryzacja**: Docker Compose

---

## Struktura projektu

```
src/
├── app/                    # Strony (App Router)
│   ├── page.tsx           # Logowanie/rejestracja
│   ├── dashboard/         # Główny widok gry
│   └── saves/             # Zarządzanie zapisami
├── actions/               # Server Actions
│   ├── authActions.ts     # Autoryzacja
│   └── gameActions.ts     # Logika gry
├── components/            # Komponenty React
│   ├── Dashboard.tsx      # Główny dashboard
│   ├── BuildingCard.tsx   # Karty budynków
│   ├── ContractPanel.tsx  # Panel kontraktów
│   ├── PrestigePanel.tsx  # Panel prestige
│   └── ...
├── config/                # Konfiguracja gry
│   ├── gamedata.ts        # Definicje budynków i tierów
│   ├── contracts.ts       # Definicje kontraktów
│   ├── events.ts          # Definicje eventów
│   └── prestige.ts        # Logika prestige
├── store/
│   └── useGameStore.ts    # Zustand store
└── lib/
    ├── engine.ts          # Funkcje matematyczne
    └── prisma.ts          # Klient Prisma
```

---

## Dokumentacja szczegółowa

- `przemysl.md` - szczegółowy plan i status implementacji ścieżki Industrial

---

## TODO

- [ ] Ścieżka Finance (pełna implementacja)
- [ ] Achievements
- [ ] Leaderboard
- [ ] Sound effects
- [ ] Mobile improvements
