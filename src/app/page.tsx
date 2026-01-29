"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

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
          <p className="text-slate-400">Loading...</p>
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
          <p className="text-slate-400">Redirecting...</p>
        </div>
      </div>
    );
  }

  const paths = [
    {
      id: "INDUSTRIAL",
      name: "Industrial",
      icon: "🏭",
      color: "orange",
      bgGradient: "from-orange-500/20 to-orange-900/20",
      borderColor: "border-orange-500/50",
      textColor: "text-orange-400",
      description: "Build an industrial empire from a small garage to giant mega-complexes.",
      features: [
        "Stable and predictable production",
        "Perfect for beginners",
        "Factories, steel mills, refineries",
        "No random modifiers"
      ],
      difficulty: "Easy",
    },
    {
      id: "MEDIA",
      name: "Media & Entertainment",
      icon: "🎬",
      color: "purple",
      bgGradient: "from-purple-500/20 to-purple-900/20",
      borderColor: "border-purple-500/50",
      textColor: "text-purple-400",
      description: "Become an influencer and build your media empire from a blog to a global TV network.",
      features: [
        "Followers and reputation system",
        "Sponsorship contracts and collaborations",
        "Viral events and scandals",
        "5 career development tiers"
      ],
      difficulty: "Medium",
    },
    {
      id: "FINANCE",
      name: "Finance",
      icon: "💹",
      color: "green",
      bgGradient: "from-green-500/20 to-green-900/20",
      borderColor: "border-green-500/50",
      textColor: "text-green-400",
      description: "Invest in the stock market and manage funds to build a financial empire.",
      features: [
        "Dynamic market multiplier (0.5x - 2.0x)",
        "High risk, high reward",
        "Stocks, funds, hedge funds",
        "Cryptocurrency exchange"
      ],
      difficulty: "Hard",
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
            Tycoon Idle Game
          </p>

          <p className="text-lg text-slate-500 mb-10 max-w-3xl mx-auto">
            Choose your path and build a business empire.
            Manage resources, progress through 5 tiers and become a legend in your industry.
          </p>

          {/* CTA Button */}
          <Button
            onClick={() => router.push("/auth")}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-white text-lg px-10 py-6 rounded-xl shadow-lg shadow-purple-500/25 transition-all hover:scale-105"
          >
            🎮 Start Playing
          </Button>

          {/* Stats */}
          <div className="flex justify-center gap-8 mt-12 text-slate-400">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">3</p>
              <p className="text-sm">Development Paths</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">5</p>
              <p className="text-sm">Progression Tiers</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">∞</p>
              <p className="text-sm">Prestige System</p>
            </div>
          </div>
        </div>
      </section>

      {/* Paths Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
          Choose Your Path
        </h2>
        <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
          Each path offers unique mechanics and challenges. Choose the one that fits your playstyle.
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
            Game Features
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-800/50 rounded-xl p-6 text-center border border-slate-700">
              <span className="text-4xl mb-4 block">📈</span>
              <h3 className="text-lg font-semibold text-white mb-2">Tier System</h3>
              <p className="text-slate-400 text-sm">
                Progress through 5 levels, unlock new buildings and abilities
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 text-center border border-slate-700">
              <span className="text-4xl mb-4 block">📝</span>
              <h3 className="text-lg font-semibold text-white mb-2">Contracts</h3>
              <p className="text-slate-400 text-sm">
                Accept orders from sponsors and collaborate with other creators
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 text-center border border-slate-700">
              <span className="text-4xl mb-4 block">👑</span>
              <h3 className="text-lg font-semibold text-white mb-2">Prestige</h3>
              <p className="text-slate-400 text-sm">
                Sell your empire and start over with permanent bonuses
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 text-center border border-slate-700">
              <span className="text-4xl mb-4 block">⚡</span>
              <h3 className="text-lg font-semibold text-white mb-2">Events</h3>
              <p className="text-slate-400 text-sm">
                Random events affecting your game - viral hits, scandals and more
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to build your empire?
        </h2>
        <p className="text-slate-400 mb-8">
          Join now and start your journey to success. The game is completely free!
        </p>
        <Button
          onClick={() => router.push("/auth")}
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-white text-lg px-10 py-6 rounded-xl shadow-lg shadow-purple-500/25 transition-all hover:scale-105"
        >
          🚀 Play for Free
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
