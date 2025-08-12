import { PrismaClient } from "@prisma/client";

declare global {
  // Allow global Prisma client across hot reloads in dev
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ["query", "warn", "error"],
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
