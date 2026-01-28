"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLocale } from "@/actions/localeActions";
import { Locale } from "@/i18n/request";

const LANGUAGES: { code: Locale; name: string; flag: string }[] = [
  { code: "pl", name: "Polski", flag: "🇵🇱" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
];

export function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const currentLang = LANGUAGES.find((l) => l.code === currentLocale) || LANGUAGES[0];

  const handleLocaleChange = (locale: Locale) => {
    setIsOpen(false);
    startTransition(async () => {
      await setLocale(locale);
      router.refresh();
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-sm text-slate-300 hover:text-white disabled:opacity-50"
      >
        <span className="text-base">{currentLang.flag}</span>
        <span className="hidden sm:inline">{currentLang.name}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-full left-0 mb-1 w-36 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLocaleChange(lang.code)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                  currentLocale === lang.code
                    ? "bg-slate-700 text-white"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
                {currentLocale === lang.code && (
                  <svg className="w-4 h-4 ml-auto text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
