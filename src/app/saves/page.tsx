"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUserSaves, createSave, selectSave, deleteSave, SaveInfo } from "@/actions/gameActions";
import { PathType } from "@/config/gamedata";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatMoney } from "@/lib/engine";

const paths: { id: PathType; name: string; icon: string; color: string; description: string }[] = [
  {
    id: "MEDIA",
    name: "Media",
    icon: "🎬",
    color: "purple",
    description: "Followers, kontrakty, eventy",
  },
  {
    id: "INDUSTRIAL",
    name: "Przemysł",
    icon: "🏭",
    color: "orange",
    description: "Stabilna produkcja",
  },
  {
    id: "FINANCE",
    name: "Finanse",
    icon: "💹",
    color: "green",
    description: "Ryzyko i zyski",
  },
];

export default function SavesPage() {
  const router = useRouter();
  const [saves, setSaves] = useState<SaveInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewSave, setShowNewSave] = useState(false);
  const [selectedPath, setSelectedPath] = useState<PathType | null>(null);
  const [saveName, setSaveName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadSaves();
  }, []);

  const loadSaves = async () => {
    setIsLoading(true);
    const userSaves = await getUserSaves();
    setSaves(userSaves);
    setIsLoading(false);
  };

  const handleCreateSave = async () => {
    if (!selectedPath) return;
    setIsCreating(true);

    const result = await createSave(selectedPath, saveName || undefined);
    if (result.success) {
      router.push("/dashboard");
    }
    setIsCreating(false);
  };

  const handleSelectSave = async (saveId: string) => {
    const result = await selectSave(saveId);
    if (result.success) {
      router.push("/dashboard");
    }
  };

  const handleDeleteSave = async (saveId: string) => {
    await deleteSave(saveId);
    setDeleteConfirm(null);
    loadSaves();
  };

  const getPathColor = (path: PathType) => {
    switch (path) {
      case "MEDIA": return "purple";
      case "INDUSTRIAL": return "orange";
      case "FINANCE": return "green";
    }
  };

  const getPathIcon = (path: PathType) => {
    switch (path) {
      case "MEDIA": return "🎬";
      case "INDUSTRIAL": return "🏭";
      case "FINANCE": return "💹";
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pl-PL", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Ładowanie zapisów...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <span className="text-5xl">👑</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Twoje zapisy gry</h1>
          <p className="text-slate-400">Wybierz zapis lub stwórz nowy</p>
        </div>

        {/* Existing saves */}
        {saves.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Kontynuuj grę</h2>
            <div className="grid gap-4">
              {saves.map((save) => {
                const color = getPathColor(save.path);
                const icon = getPathIcon(save.path);

                return (
                  <Card
                    key={save.id}
                    className={`bg-slate-800/80 border-slate-700 hover:border-${color}-500/50 transition-all cursor-pointer`}
                    onClick={() => deleteConfirm !== save.id && handleSelectSave(save.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-14 h-14 rounded-xl bg-${color}-500/20 flex items-center justify-center text-3xl`}
                          >
                            {icon}
                          </div>
                          <div>
                            <h3 className="text-white font-semibold text-lg">{save.name}</h3>
                            <div className="flex items-center gap-3 text-sm text-slate-400">
                              <span>Tier {save.currentTier}</span>
                              <span>•</span>
                              <span>${formatMoney(save.money)}</span>
                              <span>•</span>
                              <span>{formatMoney(save.followers)} followers</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                              Ostatnio: {formatDate(save.lastPlayedAt)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {deleteConfirm === save.id ? (
                            <>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSave(save.id);
                                }}
                              >
                                Potwierdź
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirm(null);
                                }}
                              >
                                Anuluj
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                className={`bg-${color}-600 hover:bg-${color}-700`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectSave(save.id);
                                }}
                              >
                                Graj
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-slate-400 hover:text-red-400"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirm(save.id);
                                }}
                              >
                                🗑️
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* New save section */}
        {!showNewSave ? (
          <div className="text-center">
            {saves.length < 5 ? (
              <Button
                onClick={() => setShowNewSave(true)}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700"
              >
                + Nowy zapis gry
              </Button>
            ) : (
              <p className="text-slate-500">Osiągnięto limit 5 zapisów</p>
            )}
          </div>
        ) : (
          <Card className="bg-slate-800/80 border-slate-700">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Nowy zapis</h2>

              {/* Save name */}
              <div className="mb-6">
                <label className="block text-sm text-slate-400 mb-2">
                  Nazwa zapisu (opcjonalna)
                </label>
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="np. Moje imperium medialne"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Path selection */}
              <div className="mb-6">
                <label className="block text-sm text-slate-400 mb-3">
                  Wybierz ścieżkę
                </label>
                <div className="grid md:grid-cols-3 gap-4">
                  {paths.map((path) => (
                    <button
                      key={path.id}
                      onClick={() => setSelectedPath(path.id)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedPath === path.id
                          ? `border-${path.color}-500 bg-${path.color}-500/20`
                          : "border-slate-600 bg-slate-700/30 hover:border-slate-500"
                      }`}
                    >
                      <span className="text-4xl block mb-2">{path.icon}</span>
                      <h3 className={`font-semibold ${
                        selectedPath === path.id ? `text-${path.color}-400` : "text-white"
                      }`}>
                        {path.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">{path.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={handleCreateSave}
                  disabled={!selectedPath || isCreating}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700"
                >
                  {isCreating ? "Tworzenie..." : "Rozpocznij grę"}
                </Button>
                <Button
                  onClick={() => {
                    setShowNewSave(false);
                    setSelectedPath(null);
                    setSaveName("");
                  }}
                  variant="outline"
                  className="border-slate-600"
                >
                  Anuluj
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Back link */}
        <div className="text-center mt-8">
          <Link href="/" className="text-slate-400 hover:text-white transition-colors">
            ← Powrót do strony głównej
          </Link>
        </div>
      </div>
    </div>
  );
}
