"use client";

import { useState, useEffect } from "react";
import { useGameStore } from "@/store/useGameStore";
import { PATHS } from "@/config/gamedata";
import { signOut } from "next-auth/react";
import { getUnclaimedAchievementsCount } from "@/actions/gameActions";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { SaveSwitcher } from "./SaveSwitcher";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslations, useLocale } from "next-intl";
import { Locale } from "@/i18n/request";

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [unclaimedAchievements, setUnclaimedAchievements] = useState(0);
  const path = useGameStore((state) => state.path);
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

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const navItems = [
    {
      href: "/dashboard",
      label: t("nav.dashboard"),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      href: "/achievements",
      label: t("nav.achievements"),
      badge: unclaimedAchievements,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
    },
    {
      href: "/ranking",
      label: t("nav.ranking"),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Mobile hamburger button - positioned to not overlap with content */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-3 left-3 z-50 p-2.5 rounded-xl bg-slate-800/90 backdrop-blur-sm text-white md:hidden border border-slate-700 shadow-lg active:scale-95 transition-transform"
        aria-label="Open menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile overlay with fade animation */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile Menu - slide from left with better design */}
      <div
        className={`fixed inset-y-0 left-0 z-[70] w-[280px] bg-gradient-to-b from-slate-900 to-slate-950 md:hidden transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header with logo and close button */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div>
            <h1 className="text-lg font-bold text-white">{t("app.title")}</h1>
            <p className="text-xs text-slate-500">{t("app.subtitle")}</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex flex-col h-[calc(100%-64px)] overflow-y-auto">
          {/* Path info */}
          {pathInfo && path && (
            <div className="p-4">
              <div
                className="p-3 rounded-xl border"
                style={{
                  backgroundColor: pathInfo.color + "10",
                  borderColor: pathInfo.color + "30"
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: pathInfo.color }}
                  />
                  <span className="font-semibold text-sm" style={{ color: pathInfo.color }}>
                    {t(`paths.${path}.name`)}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{t(`paths.${path}.description`)}</p>
              </div>
            </div>
          )}

          {/* Save switcher */}
          <div className="px-4 pb-4">
            <SaveSwitcher />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative ${
                      isActive(item.href)
                        ? "text-white bg-slate-800 shadow-md"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                    }`}
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="absolute right-3 min-w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1.5">
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Bottom section */}
          <div className="mt-auto p-4 border-t border-slate-800 space-y-3">
            <LanguageSwitcher currentLocale={locale} />
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="font-medium">{t("nav.logout")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar - unchanged */}
      <aside className="hidden md:flex w-64 bg-slate-900 border-r border-slate-800 p-4 pb-8 flex-col h-screen overflow-y-auto">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">{t("app.title")}</h1>
          <p className="text-sm text-slate-500">{t("app.subtitle")}</p>
        </div>

        {/* Path info */}
        {pathInfo && path && (
          <div
            className="p-4 rounded-lg mb-4"
            style={{ backgroundColor: pathInfo.color + "15" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: pathInfo.color }}
              />
              <span className="font-semibold" style={{ color: pathInfo.color }}>
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
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors relative ${
                    isActive(item.href)
                      ? "text-white bg-slate-800"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  {item.icon}
                  {item.label}
                  {item.badge && item.badge > 0 && (
                    <span className="absolute top-1 right-2 min-w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Language switcher & Logout */}
        <div className="mt-auto pt-4 pb-4 border-t border-slate-800 space-y-3">
          <LanguageSwitcher currentLocale={locale} />
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800"
            onClick={handleLogout}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {t("nav.logout")}
          </Button>
        </div>
      </aside>
    </>
  );
}
