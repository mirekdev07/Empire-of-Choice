"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const router = useRouter();

  const paths = [
    {
      id: "INDUSTRIAL",
      name: "Przemysł",
      icon: "🏭",
      color: "orange",
      bgGradient: "from-orange-500/20 to-orange-900/20",
      borderColor: "border-orange-500/50",
      textColor: "text-orange-400",
      description: "Buduj imperium przemysłowe od małego garażu po gigantyczne megakompleksy.",
      features: [
        "Stabilna i przewidywalna produkcja",
        "Idealna dla początkujących graczy",
        "Fabryki, huty stali, rafinerie",
        "Brak losowych modyfikatorów"
      ],
      difficulty: "Łatwy",
    },
    {
      id: "MEDIA",
      name: "Media & Rozrywka",
      icon: "🎬",
      color: "purple",
      bgGradient: "from-purple-500/20 to-purple-900/20",
      borderColor: "border-purple-500/50",
      textColor: "text-purple-400",
      description: "Zostań influencerem i zbuduj swoje imperium medialne od bloga po globalną sieć TV.",
      features: [
        "System followers i reputacji",
        "Kontrakty sponsorskie i kolaboracje",
        "Eventy viralne i skandale",
        "5 tierów rozwoju kariery"
      ],
      difficulty: "Średni",
    },
    {
      id: "FINANCE",
      name: "Finanse",
      icon: "💹",
      color: "green",
      bgGradient: "from-green-500/20 to-green-900/20",
      borderColor: "border-green-500/50",
      textColor: "text-green-400",
      description: "Inwestuj na giełdzie i zarządzaj funduszami, aby zbudować finansowe imperium.",
      features: [
        "Dynamiczny mnożnik rynku (0.5x - 2.0x)",
        "Wysokie ryzyko, wysokie zyski",
        "Akcje, fundusze, hedge fundy",
        "Giełda kryptowalut"
      ],
      difficulty: "Trudny",
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
            Wybierz swoją ścieżkę i zbuduj imperium biznesowe.
            Zarządzaj zasobami, rozwijaj się przez 5 tierów i zostań legendą w swojej branży.
          </p>

          {/* CTA Button */}
          <Button
            onClick={() => router.push("/auth")}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-white text-lg px-10 py-6 rounded-xl shadow-lg shadow-purple-500/25 transition-all hover:scale-105"
          >
            🎮 Rozpocznij grę
          </Button>

          {/* Stats */}
          <div className="flex justify-center gap-8 mt-12 text-slate-400">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">3</p>
              <p className="text-sm">Ścieżki rozwoju</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">5</p>
              <p className="text-sm">Tierów progresji</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">∞</p>
              <p className="text-sm">System Prestige</p>
            </div>
          </div>
        </div>
      </section>

      {/* Paths Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
          Wybierz swoją ścieżkę
        </h2>
        <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto">
          Każda ścieżka oferuje unikalne mechaniki i wyzwania. Wybierz tę, która pasuje do Twojego stylu gry.
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
            Funkcje gry
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-800/50 rounded-xl p-6 text-center border border-slate-700">
              <span className="text-4xl mb-4 block">📈</span>
              <h3 className="text-lg font-semibold text-white mb-2">System Tierów</h3>
              <p className="text-slate-400 text-sm">
                Rozwijaj się przez 5 poziomów, odblokowuj nowe budynki i możliwości
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 text-center border border-slate-700">
              <span className="text-4xl mb-4 block">📝</span>
              <h3 className="text-lg font-semibold text-white mb-2">Kontrakty</h3>
              <p className="text-slate-400 text-sm">
                Przyjmuj zlecenia od sponsorów i współpracuj z innymi twórcami
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 text-center border border-slate-700">
              <span className="text-4xl mb-4 block">👑</span>
              <h3 className="text-lg font-semibold text-white mb-2">Prestige</h3>
              <p className="text-slate-400 text-sm">
                Sprzedaj imperium i zacznij od nowa z permanentnymi bonusami
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 text-center border border-slate-700">
              <span className="text-4xl mb-4 block">⚡</span>
              <h3 className="text-lg font-semibold text-white mb-2">Eventy</h3>
              <p className="text-slate-400 text-sm">
                Losowe wydarzenia wpływające na Twoją grę - virale, skandale i więcej
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Gotowy zbudować swoje imperium?
        </h2>
        <p className="text-slate-400 mb-8">
          Dołącz teraz i rozpocznij swoją drogę do sukcesu. Gra jest całkowicie darmowa!
        </p>
        <Button
          onClick={() => router.push("/auth")}
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-white text-lg px-10 py-6 rounded-xl shadow-lg shadow-purple-500/25 transition-all hover:scale-105"
        >
          🚀 Zagraj za darmo
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
