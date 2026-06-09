"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function LandingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const t = useTranslations("landing");

  // Redirect to saves if already logged in
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push("/saves");
    }
  }, [session, status, router]);

  // Show loading while checking auth
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4" />
          <p className="text-slate-400">{t("loading")}</p>
        </div>
      </div>
    );
  }

  // If authenticated, show loading (redirect will happen)
  if (status === "authenticated") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4" />
          <p className="text-slate-400">{t("redirecting")}</p>
        </div>
      </div>
    );
  }

  const paths = [
    {
      id: "INDUSTRIAL",
      name: t("pathIndustrial.name"),
      icon: "🏭",
      color: "orange",
      bgGradient: "from-orange-500/20 to-orange-900/20",
      borderColor: "border-orange-500/50",
      textColor: "text-orange-400",
      description: t("pathIndustrial.desc"),
      features: t.raw("pathIndustrial.features") as string[],
      difficulty: t("easy"),
    },
    {
      id: "MEDIA",
      name: t("pathMedia.name"),
      icon: "🎬",
      color: "purple",
      bgGradient: "from-purple-500/20 to-purple-900/20",
      borderColor: "border-purple-500/50",
      textColor: "text-purple-400",
      description: t("pathMedia.desc"),
      features: t.raw("pathMedia.features") as string[],
      difficulty: t("medium"),
    },
    {
      id: "FINANCE",
      name: t("pathFinance.name"),
      icon: "💹",
      color: "green",
      bgGradient: "from-green-500/20 to-green-900/20",
      borderColor: "border-green-500/50",
      textColor: "text-green-400",
      description: t("pathFinance.desc"),
      features: t.raw("pathFinance.features") as string[],
      difficulty: t("hard"),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 py-20 text-center">
          {/* Logo */}
          <div className="mb-6">
            <span className="text-6xl">👑</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
            Empire of <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-orange-400">Choice</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-400 mb-4 max-w-2xl mx-auto">
            {t("heroSubtitle")}
          </p>

          <p className="text-lg text-slate-500 mb-10 max-w-3xl mx-auto">
            {t("heroDesc")}
          </p>

          {/* CTA Button */}
          <Button
            onClick={() => router.push("/auth")}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-white text-lg px-10 py-6 rounded-xl shadow-lg shadow-purple-500/25 transition-all hover:scale-105"
          >
            🎮 {t("startPlaying")}
          </Button>

          {/* Stats */}
          <div className="flex justify-center gap-8 mt-12 text-slate-400">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">3</p>
              <p className="text-sm">{t("devPaths")}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">5</p>
              <p className="text-sm">{t("progressionTiers")}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">∞</p>
              <p className="text-sm">{t("prestigeSystem")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Paths Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
          {t("choosePath")}
        </h2>
        <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
          {t("choosePathDesc")}
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {paths.map((path) => (
            <div
              key={path.id}
              className={`relative rounded-2xl border ${path.borderColor} bg-gradient-to-br ${path.bgGradient} p-6 transition-all hover:scale-[1.02] hover:shadow-xl`}
            >
              {/* Difficulty badge */}
              <div className="absolute top-4 right-4">
                <span className={`text-xs px-2 py-1 rounded-full bg-slate-800 ${path.textColor}`}>
                  {path.difficulty}
                </span>
              </div>

              {/* Icon & Title */}
              <div className="text-center mb-6">
                <span className="text-5xl mb-4 block">{path.icon}</span>
                <h3 className={`text-2xl font-bold ${path.textColor}`}>{path.name}</h3>
              </div>

              {/* Description */}
              <p className="text-slate-300 text-center mb-6 min-h-[60px]">
                {path.description}
              </p>

              {/* Features */}
              <ul className="space-y-2 mb-6">
                {path.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-400">
                    <span className={path.textColor}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-900/50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            {t("gameFeatures")}
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-800/50 rounded-xl p-6 text-center border border-slate-700">
              <span className="text-4xl mb-4 block">📈</span>
              <h3 className="text-lg font-semibold text-white mb-2">{t("tierSystem")}</h3>
              <p className="text-slate-400 text-sm">
                {t("tierSystemDesc")}
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 text-center border border-slate-700">
              <span className="text-4xl mb-4 block">📝</span>
              <h3 className="text-lg font-semibold text-white mb-2">{t("contracts")}</h3>
              <p className="text-slate-400 text-sm">
                {t("contractsDesc")}
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 text-center border border-slate-700">
              <span className="text-4xl mb-4 block">👑</span>
              <h3 className="text-lg font-semibold text-white mb-2">{t("prestige")}</h3>
              <p className="text-slate-400 text-sm">
                {t("prestigeDesc")}
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 text-center border border-slate-700">
              <span className="text-4xl mb-4 block">⚡</span>
              <h3 className="text-lg font-semibold text-white mb-2">{t("events")}</h3>
              <p className="text-slate-400 text-sm">
                {t("eventsDesc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {t("readyToBuild")}
        </h2>
        <p className="text-slate-400 mb-8">
          {t("joinNow")}
        </p>
        <Button
          onClick={() => router.push("/auth")}
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-white text-lg px-10 py-6 rounded-xl shadow-lg shadow-purple-500/25 transition-all hover:scale-105"
        >
          🚀 {t("playForFree")}
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>Empire of Choice © 2026 - Tycoon Idle Game</p>
          <p className="mt-2">
            Built with Next.js, TypeScript, Prisma & Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
}
