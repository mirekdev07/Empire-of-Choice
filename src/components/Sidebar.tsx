"use client";

import { useState, useEffect } from "react";
import { useGameStore } from "@/store/useGameStore";
import { PATHS } from "@/config/gamedata";
import { logout } from "@/actions/authActions";
import { getUnclaimedAchievementsCount } from "@/actions/gameActions";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import { SaveSwitcher } from "./SaveSwitcher";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslations, useLocale } from "next-intl";
import { Locale } from "@/i18n/request";

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [unclaimedAchievements, setUnclaimedAchievements] = useState(0);
  const path = useGameStore((state) => state.path);
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();
  const locale = useLocale() as Locale;

  const pathInfo = path ? PATHS[path] : null;

  // Check if a nav item is active
  const isActive = (href: string) => pathname === href;

  // Fetch unclaimed achievements count
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const count = await getUnclaimedAchievementsCount();
        setUnclaimedAchievements(count);
      } catch (error) {
        console.error("Failed to fetch achievements count:", error);
      }
    };

    fetchCount();
    // Refresh every 30 seconds
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/");
    router.refresh();
  };

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-800 text-white md:hidden"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-40
          w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col h-screen
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-xl md:text-2xl font-bold text-white">{t("app.title")}</h1>
          <p className="text-xs md:text-sm text-slate-500">{t("app.subtitle")}</p>
        </div>

        {/* Path info */}
        {pathInfo && path && (
          <div
            className="p-3 md:p-4 rounded-lg mb-4"
            style={{ backgroundColor: pathInfo.color + "15" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: pathInfo.color }}
              />
              <span className="font-semibold text-sm md:text-base" style={{ color: pathInfo.color }}>
                {t(`paths.${path}.name`)}
              </span>
            </div>
            <p className="text-xs text-slate-400">{t(`paths.${path}.description`)}</p>
          </div>
        )}

        {/* Save switcher */}
        <div className="mb-6">
          <SaveSwitcher />
        </div>

        {/* Navigation */}
        <nav className="flex-1">
          <ul className="space-y-2">
            <li>
              <a
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 md:px-4 py-2 rounded-lg transition-colors text-sm md:text-base ${
                  isActive("/dashboard")
                    ? "text-white bg-slate-800"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                {t("nav.dashboard")}
              </a>
            </li>
            <li>
              <a
                href="/achievements"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 md:px-4 py-2 rounded-lg transition-colors text-sm md:text-base relative ${
                  isActive("/achievements")
                    ? "text-white bg-slate-800"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
                {t("nav.achievements")}
                {unclaimedAchievements > 0 && (
                  <span className="absolute top-1 right-2 min-w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                    {unclaimedAchievements > 99 ? "99+" : unclaimedAchievements}
                  </span>
                )}
              </a>
            </li>
            <li>
              <a
                href="/ranking"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 md:px-4 py-2 rounded-lg transition-colors text-sm md:text-base ${
                  isActive("/ranking")
                    ? "text-white bg-slate-800"
                    : "text-slate-300 hover:text-white hover:bg-slate-800"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                {t("nav.ranking")}
              </a>
            </li>
          </ul>
        </nav>

        {/* Language switcher & Logout */}
        <div className="mt-auto pt-4 border-t border-slate-800 space-y-3">
          <LanguageSwitcher currentLocale={locale} />
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800 text-sm md:text-base"
            onClick={handleLogout}
          >
            <svg
              className="w-5 h-5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            {t("nav.logout")}
          </Button>
        </div>
      </aside>
    </>
  );
}
