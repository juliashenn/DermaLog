import { NextAuthOptions, User, getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

export const authConfig: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Sign in",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "example@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials || !credentials.email || !credentials.password)
          return null;

        const dbUser = await prisma.user.findFirst({
          where: { email: credentials.email },
        });

        //Verify Password here
        if (
          dbUser &&
          dbUser.password && // ensure it's not null
          await bcrypt.compare(credentials.password, dbUser.password)
        ) {
          const { password, createdAt, ...dbUserWithoutPassword } = dbUser;
          return dbUserWithoutPassword as User;
        }

        return null;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
};

export async function requireAuth() {
  const session = await getServerSession(authConfig);
  if (!session) redirect("/");
  return session;
}

export async function redirectIfAuth() {
  const session = await getServerSession(authConfig);
  if (session) redirect("/dashboard");
  return null;
}

export async function getUserIdByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  return user?.id || null;
}