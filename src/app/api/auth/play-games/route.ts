import { NextResponse } from "next/server";
import { google } from "googleapis";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

export async function POST(request: Request) {
  try {
    const { serverAuthCode, playerId, displayName } = await request.json();

    if (!playerId) {
      return NextResponse.json(
        { error: "Missing playerId" },
        { status: 400 }
      );
    }

    let email: string;
    let name: string = displayName || "Player";
    let image: string | null = null;

    if (serverAuthCode) {
      // Full verification with serverAuthCode
      try {
        const { tokens } = await oauth2Client.getToken(serverAuthCode);

        if (tokens.access_token) {
          oauth2Client.setCredentials(tokens);
          const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
          const userInfo = await oauth2.userinfo.get();

          email = userInfo.data.email || `${playerId}@playgames.google.com`;
          name = userInfo.data.name || displayName || "Player";
          image = userInfo.data.picture || null;
        } else {
          // Fallback to playerId-based email
          email = `${playerId}@playgames.google.com`;
        }
      } catch (tokenError) {
        console.error("Token exchange failed, using playerId:", tokenError);
        email = `${playerId}@playgames.google.com`;
      }
    } else {
      // No serverAuthCode - use playerId as identifier (temporary solution)
      console.log("No serverAuthCode, using playerId for auth:", playerId);
      email = `${playerId}@playgames.google.com`;
    }

    // Find user by playGamesId first, then by email
    let user = await prisma.user.findUnique({
      where: { playGamesId: playerId },
    });

    if (!user) {
      user = await prisma.user.findUnique({
        where: { email },
      });
    }

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          name,
          image,
          playGamesId: playerId,
        },
      });
    } else {
      // Update existing user with Play Games ID if not set
      if (!user.playGamesId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { playGamesId: playerId, image: image || user.image },
        });
      }
    }

    // Create session token
    const sessionToken = uuidv4();
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Store session
    await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expires,
      },
    });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("session-token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      },
    });
  } catch (error) {
    console.error("Play Games auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed: " + (error instanceof Error ? error.message : "unknown") },
      { status: 500 }
    );
  }
}
