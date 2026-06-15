import { PrismaClient } from "@prisma/client";
import { isBuildPhase } from "@/lib/runtime";

const BUILD_STUB_DATABASE_URL =
  "postgresql://build:build@127.0.0.1:5432/build?schema=public";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function resolveDatabaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  return url;
}

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const datasourceUrl = isBuildPhase()
      ? process.env.DATABASE_URL?.trim() || BUILD_STUB_DATABASE_URL
      : resolveDatabaseUrl();

    globalForPrisma.prisma = new PrismaClient({
      datasourceUrl,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }

  return globalForPrisma.prisma;
}
