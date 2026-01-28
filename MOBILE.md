# Empire of Choice - Wersja Mobilna (Android)

## Wymagania

1. **Android Studio** - [pobierz tutaj](https://developer.android.com/studio)
2. **Java JDK 17+** - Android Studio zainstaluje automatycznie

## Architektura

```
┌─────────────────┐     ┌─────────────────┐
│   Przeglądarka  │     │  Aplikacja APK  │
│   (Next.js)     │     │  (Capacitor)    │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     │
         ┌───────────▼───────────┐
         │   Backend Next.js     │
         │   (Vercel/Railway)    │
         └───────────┬───────────┘
                     │
         ┌───────────▼───────────┐
         │   PostgreSQL          │
         │   (Neon/Supabase)     │
         └───────────────────────┘
```

Aplikacja mobilna łączy się z tym samym serwerem co przeglądarka - jeden postęp gry wszędzie.

---

## Krok 1: Hosting backendu

### Opcja A: Vercel (zalecane)

1. Zarejestruj się na [vercel.com](https://vercel.com)
2. Połącz z repozytorium GitHub
3. Vercel automatycznie zbuduje i wdroży aplikację
4. Otrzymasz URL np. `https://empire-of-choice.vercel.app`

### Opcja B: Railway

1. Zarejestruj się na [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Dodaj PostgreSQL jako serwis

---

## Krok 2: Baza danych w chmurze

### Opcja A: Neon (zalecane - darmowy tier)

1. Zarejestruj się na [neon.tech](https://neon.tech)
2. Utwórz nowy projekt
3. Skopiuj connection string
4. W Vercel dodaj zmienną środowiskową:
   ```
   DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
   ```

### Opcja B: Supabase

1. Zarejestruj się na [supabase.com](https://supabase.com)
2. Utwórz nowy projekt
3. Settings → Database → Connection string

---

## Krok 3: Konfiguracja Capacitor

Edytuj `capacitor.config.ts`:

```typescript
server: {
  // PRODUCTION: ustaw URL hostowanej aplikacji
  url: 'https://TWOJA-APKA.vercel.app',
  androidScheme: 'https',
},
```

---

## Krok 4: Budowanie APK

### Development (testowanie)

```bash
# Synchronizuj pliki z Androidem
npm run cap:sync

# Otwórz w Android Studio
npm run cap:open
```

W Android Studio:
1. Build → Build Bundle(s) / APK(s) → Build APK(s)
2. APK znajdziesz w `android/app/build/outputs/apk/debug/`

### Production (Google Play)

```bash
npm run cap:build:release
```

APK znajdziesz w `android/app/build/outputs/apk/release/`

---

## Krok 5: Testowanie na telefonie

### Opcja A: Kabel USB

1. Włącz "Opcje programistyczne" na telefonie
2. Włącz "Debugowanie USB"
3. Podłącz telefon kablem
4. W Android Studio kliknij "Run"

### Opcja B: Emulator

1. W Android Studio: Tools → Device Manager
2. Create Device → wybierz telefon
3. Pobierz system image (np. API 34)
4. Uruchom emulator

### Opcja C: Instalacja APK

1. Skopiuj plik APK na telefon
2. Otwórz plik → Zainstaluj (może wymagać zezwolenia na nieznane źródła)

---

## Krok 6: Google Play

### Wymagania

1. Konto Google Play Developer ($25 jednorazowo)
2. Podpisany APK lub App Bundle (.aab)
3. Ikony i screenshoty

### Generowanie klucza do podpisu

```bash
keytool -genkey -v -keystore empire-of-choice.keystore -alias empire -keyalg RSA -keysize 2048 -validity 10000
```

### Konfiguracja w Android Studio

1. Build → Generate Signed Bundle / APK
2. Wybierz Android App Bundle (.aab)
3. Użyj wygenerowanego klucza
4. Build

### Upload do Google Play

1. Zaloguj się do [Google Play Console](https://play.google.com/console)
2. Create app
3. Production → Create new release
4. Upload .aab file

---

## Troubleshooting

### "Unable to connect to server"

1. Sprawdź czy URL w `capacitor.config.ts` jest poprawny
2. Sprawdź czy backend działa (otwórz URL w przeglądarce)
3. Sprawdź połączenie internetowe na telefonie

### "SSL Error"

1. Upewnij się że używasz HTTPS w produkcji
2. Sprawdź czy `androidScheme: 'https'` jest ustawione

### Białe ekran po uruchomieniu

1. Sprawdź logi w Android Studio (Logcat)
2. Szukaj błędów JavaScript

---

## Komendy

| Komenda | Opis |
|---------|------|
| `npm run cap:sync` | Synchronizuj pliki z Android |
| `npm run cap:open` | Otwórz projekt w Android Studio |
| `npm run cap:build` | Zbuduj debug APK |
| `npm run cap:build:release` | Zbuduj release APK |

---

## Struktura plików Android

```
android/
├── app/
│   ├── src/main/
│   │   ├── AndroidManifest.xml    # Konfiguracja aplikacji
│   │   ├── assets/public/         # Pliki webowe
│   │   └── res/
│   │       ├── mipmap-*/          # Ikony aplikacji
│   │       └── xml/               # Konfiguracje
│   └── build.gradle               # Zależności
├── gradle/
└── build.gradle
```
