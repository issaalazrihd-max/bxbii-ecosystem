import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@edusec/db";

/**
 * Wraps the shared @edusec/db Prisma client in Nest's DI/lifecycle so every
 * module (auth, branches, students, ...) injects the same connection pool
 * instead of creating its own.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
