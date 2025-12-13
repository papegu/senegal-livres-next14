import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient | null {
  // Return null during build when database is not available
  if (process.env.SKIP_DB_CHECK === "true") {
    return null;
  }
  return new PrismaClient({
    log: ["error"],
  });
}

// Check SKIP_DB_CHECK before using global instance
export const prisma: PrismaClient | null =
  process.env.SKIP_DB_CHECK === "true"
    ? null
    : globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production" && prisma) {
  globalForPrisma.prisma = prisma;
}

