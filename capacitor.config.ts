import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.empireofchoice.game',
  appName: 'Empire of Choice',
  webDir: 'out',

  // PRODUCTION: aplikacja ładuje się z Vercel
  server: {
    url: 'https://empire-of-choice.vercel.app',
    androidScheme: 'https',
  },

  android: {
    // Pozwól na połączenia HTTP podczas developmentu
    allowMixedContent: true,

    // Splash screen
    backgroundColor: '#0f172a', // slate-900 (tło gry)
  },

  plugins: {
    // Splash screen configuration
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0f172a',
      showSpinner: true,
      spinnerColor: '#22c55e', // green-500
    },
  },
};

export default config;
