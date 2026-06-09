# Empire of Choice — Tycoon Idle Game

Idle / strategiczna gra zarządzania imperium. Trzy ścieżki rozwoju (Media, Przemysł, Finanse), system kontraktów, eventów, prestige, ranking, wielojęzyczność. Aplikacja webowa (Next.js) z buildem mobilnym na Android + integracja Google Play Games.

**Live:** https://empire-of-choice.vercel.app

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-7-2d3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?logo=postgresql)
![NextAuth](https://img.shields.io/badge/NextAuth-v5-purple)
![Capacitor](https://img.shields.io/badge/Capacitor-Android-119eff?logo=capacitor)

---

## Status

| Funkcja | Status |
|---------|--------|
| Ścieżka Media | ✅ Kompletna |
| Ścieżka Industrial | ✅ Kompletna |
| Ścieżka Finance | ✅ Kompletna |
| System osiągnięć (65 achievementów) | ✅ |
| Ranking graczy | ✅ |
| Wielojęzyczność (PL, EN, DE) | ✅ |
| Zarobki offline | ✅ |
| System kontraktów | ✅ |
| System eventów | ✅ |
| System prestige | ✅ |
| Autentykacja (email + Google) | ✅ |
| Build Android + Google Play Games | ✅ |

---

## Funkcjonalności

### Główne systemy

- **3 ścieżki rozwoju** — Media, Przemysł, Finanse
- **5 tierów** — od małego startupu do imperium
- **65 osiągnięć** — z nagrodami pieniężnymi
- **Ranking graczy** — dla każdej ścieżki osobno
- **System kontraktów** — zlecenia z nagrodami
- **System eventów** — losowe wydarzenia wymagające wyborów
- **System prestige** — reset z permanentnymi bonusami
- **Do 5 zapisów gry** — na użytkownika
- **Zarobki offline** — do 8 godzin (20% produkcji), heartbeat system

### Ścieżka Media

Content Decay (produkcja spada bez publikowania) • Followers (druga waluta) • Morale zespołu (Tier 3+) • Synergie budynków (Tier 2+).

### Ścieżka Industrial

Surowce konsumowane przez produkcję • Efektywność 0-150% • Kondycja maszyn 0-100% • R&D (bonusy efektywności).

### Ścieżka Finance

AUM (Assets Under Management) • Rating kredytowy (D do AAA) • Dźwignia 1x-20x • Fazy rynku (bull/stable/correction/bear/crash) • Hedging (Tier 3+).

---

## Stack

- **Next.js 16** (App Router, Server Actions) + React 19 + TypeScript
- **Prisma 7** ORM + **PostgreSQL** (Neon serverless lub lokalny Postgres przez docker-compose)
- **NextAuth v5** + Google OAuth
- **Zustand** (`useGameStore`) — stan klienta
- **Tailwind CSS** + **shadcn/ui**
- **next-intl** — i18n (PL / EN / DE)
- **Capacitor 8** + Google Play Games Plugin (Android)
- **Vercel** deploy

---

## Quick start

```bash
git clone https://github.com/<user>/empire-of-choice.git
cd empire-of-choice
npm install

cp .env.example .env
# Wypełnij: DATABASE_URL, AUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

# Opcja A — lokalny Postgres przez Docker
docker-compose up -d
# Opcja B — Neon serverless (wklej DATABASE_URL z Neon do .env)

npx prisma generate
npx prisma db push

npm run dev
```

Otwórz http://localhost:3000.

---

## Skrypty

| Komenda | Opis |
| --- | --- |
| `npm run dev` | Start dev |
| `npm run build` | Build (Prisma generate → db push → next build) |
| `npm run start` | Production server |
| `npm run lint` | ESLint |
| `npm run cap:sync` | Capacitor → Android |
| `npm run cap:open` | Otwiera w Android Studio |

---

## Build mobilny (Android)

```bash
npm run build
npm run cap:sync
npm run cap:open
```

Konfiguracja: `capacitor.config.ts`. App ID: `com.empireofchoice.game`. Gra wykorzystuje **Google Play Games Services** — wymaga konfiguracji w Google Play Console (Web Client ID musi być w `android/app/src/main/res/values/strings.xml`).

**Uwaga:** `*.jks`, `*.keystore`, `*.apk`, `*.aab` są w `.gitignore` — keystore podpisujący release **nigdy** nie idzie do repo.

---

## Struktura projektu

```
src/
├── app/
│   ├── page.tsx           # Landing
│   ├── auth/              # Logowanie/rejestracja
│   ├── saves/             # Wybór zapisów
│   ├── dashboard/         # Główny widok gry
│   ├── achievements/      # Osiągnięcia
│   ├── ranking/           # Ranking graczy
│   ├── setup-profile/     # Setup po pierwszym logowaniu
│   ├── privacy/           # Polityka prywatności (Play Store)
│   └── api/
│       ├── auth/          # NextAuth + play-games
│       └── save/          # Sync sejwów
├── actions/               # Server Actions
├── components/            # FinancePanel, Sidebar, LanguageSwitcher, SaveSwitcher, ...
├── config/                # gamedata.ts (firmy, eventy, koszty, achievements, contracts, prestige)
├── i18n/                  # Konfiguracja i18n
├── messages/              # Tłumaczenia (pl / en / de)
├── store/                 # useGameStore (Zustand)
├── plugins/               # PlayGamesPlugin (Capacitor)
├── lib/                   # getUser, util
└── types/

prisma/
└── schema.prisma          # Users, Saves, Achievements, Rankings

android/                   # Wygenerowane przez Capacitor
docker-compose.yml         # Lokalny Postgres + pgAdmin
```

---

## Docker — lokalny Postgres

`docker-compose up -d` postawi:

- **Postgres 15** na `localhost:5432`
- **pgAdmin** na [http://localhost:5050](http://localhost:5050)

Dane do logowania zmień w `docker-compose.yml` przed wystawieniem czegokolwiek na zewnątrz.

---

## Deploy

Production: **Vercel** + Neon PostgreSQL + Google OAuth.

```bash
vercel --prod
```

Wszystkie zmienne (`GOOGLE_CLIENT_SECRET`, `AUTH_SECRET`, `DATABASE_URL`) — w panelu Vercel.

---

## TODO

- [ ] Efekty dźwiękowe
- [ ] Ulepszenia mobilne
- [ ] Więcej języków (FR, ES)
- [ ] Dark/Light mode toggle

---

## Licencja

Projekt portfolio / prywatny.
