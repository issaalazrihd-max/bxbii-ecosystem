import { PrismaClient } from "@prisma/client";

// Single shared Prisma client instance for the whole monorepo.
// apps/api wraps this in a NestJS provider (see apps/api/src/prisma/prisma.service.ts)
// so it participates in Nest's DI and lifecycle hooks.
export const prisma = new PrismaClient();

export * from "@prisma/client";
