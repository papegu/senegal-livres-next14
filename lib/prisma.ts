import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Prevent connection during build
const createPrismaClient = (): PrismaClient | null => {
  // Skip Prisma client creation during build or if DATABASE_URL is missing
  if (process.env.SKIP_ENV_VALIDATION || !process.env.DATABASE_URL) {
    console.log("[Prisma] Skipping client creation (build time or missing DATABASE_URL)");
    return null;
  }
  
  try {
    return new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  } catch (error) {
    console.error("[Prisma] Failed to create Prisma client:", error);
    return null;
  }
};

export const prisma = (globalForPrisma.prisma ?? createPrismaClient()) as PrismaClient;

if (process.env.NODE_ENV !== "production" && prisma) {
  globalForPrisma.prisma = prisma;
}

