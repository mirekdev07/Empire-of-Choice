import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // For Google OAuth, create user if doesn't exist
      if (account?.provider === "google" && user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          // Create new user for Google sign-in
          const newUser = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || user.email.split("@")[0],
              // No password for OAuth users
            },
          });
          user.id = newUser.id;
        } else {
          user.id = existingUser.id;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        // For OAuth, we need to get the DB user id
        if (account?.provider === "google" && user.email) {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
          });
          if (dbUser) {
            token.id = dbUser.id;
          }
        } else {
          token.id = user.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
  },
});
