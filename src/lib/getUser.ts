"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export type AuthUser = {
  id: string;
  email: string | null;
  name: string | null;
};

/**
 * Get current user from either:
 * 1. Our custom session-token cookie (Play Games auth)
 * 2. NextAuth session (web Google/credentials auth)
 */
export async function getUser(): Promise<AuthUser | null> {
  // First check our custom session token (for Play Games auth)
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session-token")?.value;

  if (sessionToken) {
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    });

    if (session && session.expires > new Date()) {
      return {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      };
    }
  }

  // Fall back to NextAuth session
  const nextAuthSession = await auth();
  if (nextAuthSession?.user?.id) {
    return {
      id: nextAuthSession.user.id,
      email: nextAuthSession.user.email || null,
      name: nextAuthSession.user.name || null,
    };
  }

  return null;
}
