import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/getUser";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/save
 * Reliable save endpoint that works with keepalive/sendBeacon
 * Used for beforeunload to ensure data is saved before browser closes
 */
export async function POST(request: NextRequest) {
  try {
    const authUser = await getUser();
    if (!authUser?.id) {
      console.log("[API/save] Unauthorized - no session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { currentSaveId: true },
    });

    if (!user?.currentSaveId) {
      return NextResponse.json({ error: "No save selected" }, { status: 400 });
    }

    const body = await request.json();
    const {
      money,
      followers,
      totalEarnings,
      reputation,
      resources,
      efficiency,
      machineCondition,
      buildings,
      lastProductionPerSecond,
      // Finance fields
      aum,
      creditRating,
      leverage,
      marketPhase,
      crashesSurvived,
      hedgingEnabled,
      // Contract fields
      activeContracts,
      autoAcceptContracts,
      autoAcceptMinReward,
      completedContractsCount,
      completedLongTermCount,
      completedCollaborationsCount,
    } = body;

    // Log what we're saving for debugging
    console.log("[API/save] Saving:", {
      saveId: user.currentSaveId,
      money,
      buildings: buildings ? Object.keys(buildings).length + " types" : "undefined",
      lastProductionPerSecond,
    });

    // Atomic update - everything in one query
    await prisma.gameSave.update({
      where: { id: user.currentSaveId },
      data: {
        money: money ?? undefined,
        followers: followers ?? undefined,
        totalEarnings: totalEarnings ?? undefined,
        reputation: reputation ?? undefined,
        resources: resources ?? undefined,
        efficiency: efficiency ?? undefined,
        machineCondition: machineCondition ?? undefined,
        buildings: buildings ?? undefined,
        lastProductionPerSecond: lastProductionPerSecond ?? undefined,
        // Finance fields
        aum: aum ?? undefined,
        creditRating: creditRating ?? undefined,
        leverage: leverage ?? undefined,
        marketPhase: marketPhase ?? undefined,
        crashesSurvived: crashesSurvived ?? undefined,
        hedgingEnabled: hedgingEnabled ?? undefined,
        // Contract fields
        activeContracts: activeContracts ?? undefined,
        autoAcceptContracts: autoAcceptContracts ?? undefined,
        autoAcceptMinReward: autoAcceptMinReward ?? undefined,
        completedContractsCount: completedContractsCount ?? undefined,
        completedLongTermCount: completedLongTermCount ?? undefined,
        completedCollaborationsCount: completedCollaborationsCount ?? undefined,
        // Always update lastPlayedAt on save
        lastPlayedAt: new Date(),
        // NOTE: We do NOT update lastHeartbeat here!
        // This endpoint is used by keepalive/beforeunload when page closes.
        // lastHeartbeat should only be updated during active gameplay (via saveGame Server Action)
        // This separation allows offline earnings to work correctly.
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save error:", error);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}
