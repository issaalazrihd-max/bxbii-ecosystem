import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

const OLD_ADMIN_EMAIL = "admin@bxbii.local";
const NEW_ADMIN_EMAIL = "issaalazrioman@gmail.com";

/**
 * One-time, idempotent rename of the seeded Super Admin's placeholder email
 * (admin@bxbii.local, which can't receive mail) to the owner's real address,
 * requested directly by the owner so the "Forgot password" flow can reach
 * him. Runs on API start-up because Railway deploys don't run migrations
 * automatically. After the first successful run the old address no longer
 * exists, so every later start is a no-op. Password, roles and branch
 * access are untouched.
 */
@Injectable()
export class AdminEmailUpdateService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminEmailUpdateService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap() {
    try {
      const oldUser = await this.prisma.user.findUnique({ where: { email: OLD_ADMIN_EMAIL } });
      if (!oldUser) return;

      const clash = await this.prisma.user.findUnique({ where: { email: NEW_ADMIN_EMAIL } });
      if (clash) {
        this.logger.warn(`Not renaming ${OLD_ADMIN_EMAIL}: ${NEW_ADMIN_EMAIL} already belongs to another user.`);
        return;
      }

      await this.prisma.user.update({ where: { id: oldUser.id }, data: { email: NEW_ADMIN_EMAIL } });
      this.logger.log(`Super Admin email updated from ${OLD_ADMIN_EMAIL} to ${NEW_ADMIN_EMAIL}.`);
    } catch (err) {
      // Never block the API from starting over this.
      this.logger.error(`Admin email update skipped: ${(err as Error).message}`);
    }
  }
}
