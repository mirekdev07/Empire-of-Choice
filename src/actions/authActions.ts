"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export async function register(
  email: string,
  password: string,
  name?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: "Użytkownik z tym emailem już istnieje" };
    }

    // Validate password
    if (password.length < 6) {
      return { success: false, error: "Hasło musi mieć minimum 6 znaków" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    const errorMessage = error instanceof Error ? error.message : "Nieznany błąd";
    return { success: false, error: `Wystąpił błąd: ${errorMessage}` };
  }
}

export async function login(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    // NextAuth v5 throws NEXT_REDIRECT which must be re-thrown
    if (isRedirectError(error)) {
      throw error;
    }
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "Nieprawidłowy email lub hasło" };
        default:
          return { success: false, error: "Wystąpił błąd podczas logowania" };
      }
    }
    console.error("Login error:", error);
    return { success: false, error: "Wystąpił błąd podczas logowania" };
  }
}

export async function logout() {
  await signOut({ redirect: false });
}
