import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | null | undefined;
};

// Prevent connection during build
const createPrismaClient = (): PrismaClient | null => {
  if (process.env.SKIP_ENV_VALIDATION || !process.env.DATABASE_URL) {
    return null;
  }
  
  try {
    return new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  } catch (error) {
    console.error("Failed to create Prisma client:", error);
    return null;
  }
};

export const prisma: PrismaClient | null =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production" && prisma) {
  globalForPrisma.prisma = prisma;
}

