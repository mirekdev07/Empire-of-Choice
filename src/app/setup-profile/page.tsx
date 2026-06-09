"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { checkNeedsDisplayName, getCurrentDisplayName, setDisplayName } from "@/actions/gameActions";
import { setLocale } from "@/actions/localeActions";
import { Locale } from "@/i18n/request";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const LANGUAGES: { code: Locale; name: string; flag: string }[] = [
  { code: "pl", name: "Polski", flag: "PL" },
  { code: "en", name: "English", flag: "EN" },
  { code: "de", name: "Deutsch", flag: "DE" },
];

export default function SetupProfilePage() {
  const router = useRouter();
  const [currentName, setCurrentName] = useState("");
  const [newName, setNewName] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<Locale>("en");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      // Check if user needs to set display name
      const needsDisplayName = await checkNeedsDisplayName();
      if (!needsDisplayName) {
        // Already set, redirect to saves
        router.push("/saves");
        return;
      }

      // Get current name (from Google)
      const name = await getCurrentDisplayName();
      if (name) {
        setCurrentName(name);
        setNewName(name); // Pre-fill with current name
      }

      // Detect browser language
      const browserLang = navigator.language.split("-")[0];
      if (browserLang === "en") setSelectedLanguage("en");
      else if (browserLang === "de") setSelectedLanguage("de");
      else setSelectedLanguage("pl");

      setIsLoading(false);
    };
    init();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Save language preference
    await setLocale(selectedLanguage);

    // Save display name
    const result = await setDisplayName(newName);

    if (result.success) {
      router.push("/saves");
    } else {
      setError(result.error || "Wystapil blad");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Ladowanie...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800/80 border-slate-700">
        <CardContent className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <span className="text-5xl block mb-4">👤</span>
            <h1 className="text-2xl font-bold text-white mb-2">
              {selectedLanguage === "en" ? "Setup your profile" : selectedLanguage === "de" ? "Profil einrichten" : "Skonfiguruj profil"}
            </h1>
            <p className="text-slate-400 text-sm">
              {selectedLanguage === "en"
                ? "Choose your language and player name."
                : selectedLanguage === "de"
                ? "Wahle deine Sprache und deinen Spielernamen."
                : "Wybierz jezyk i nazwe gracza."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Language selection */}
            <div className="mb-6">
              <label className="block text-sm text-slate-400 mb-2">
                Jezyk / Language
              </label>
              <div className="grid grid-cols-3 gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setSelectedLanguage(lang.code)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                      selectedLanguage === lang.code
                        ? "border-purple-500 bg-purple-500/20"
                        : "border-slate-600 bg-slate-700/30 hover:border-slate-500"
                    }`}
                  >
                    <span className="text-lg font-bold bg-slate-600 px-2 py-1 rounded">{lang.flag}</span>
                    <span className={`text-xs ${
                      selectedLanguage === lang.code ? "text-purple-400" : "text-slate-400"
                    }`}>
                      {lang.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Player name */}
            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-2">
                {selectedLanguage === "en" ? "Player name" : selectedLanguage === "de" ? "Spielername" : "Nazwa gracza"}
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={selectedLanguage === "en" ? "Enter name..." : selectedLanguage === "de" ? "Name eingeben..." : "Wpisz nazwe..."}
                maxLength={20}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                autoFocus
              />
              <p className="text-xs text-slate-500 mt-1">
                2-20 {selectedLanguage === "en" ? "characters" : selectedLanguage === "de" ? "Zeichen" : "znakow"}
              </p>
            </div>

            {/* Current Google name hint */}
            {currentName && (
              <div className="mb-4 p-3 bg-slate-700/30 rounded-lg border border-slate-600">
                <p className="text-xs text-slate-400">
                  {selectedLanguage === "en"
                    ? "Your Google name:"
                    : selectedLanguage === "de"
                    ? "Dein Google-Name:"
                    : "Twoja nazwa z Google:"}{" "}
                  <span className="text-slate-300">{currentName}</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {selectedLanguage === "en"
                    ? "You can change it to a nickname."
                    : selectedLanguage === "de"
                    ? "Du kannst ihn zu einem Spitznamen andern."
                    : "Mozesz ja zmienic na pseudonim."}
                </p>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              disabled={isSubmitting || newName.trim().length < 2}
              className="w-full bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700"
            >
              {isSubmitting
                ? selectedLanguage === "en" ? "Saving..." : selectedLanguage === "de" ? "Speichern..." : "Zapisywanie..."
                : selectedLanguage === "en" ? "Confirm" : selectedLanguage === "de" ? "Bestatigen" : "Potwierdz"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
