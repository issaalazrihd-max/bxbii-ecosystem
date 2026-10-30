import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import * as nodemailer from "nodemailer";
import { PrismaService } from "../prisma/prisma.service";

const RESET_PURPOSE = "password-reset";
const RESET_TTL = "30m";

/**
 * "Forgot password" flow for app.bxbii.com.
 *
 * Reset tokens are stateless signed JWTs (no new table / migration). The
 * signing secret is JWT_ACCESS_SECRET combined with the user's CURRENT
 * password hash, so a token stops working the moment the password changes —
 * each link is effectively single-use — and also expires after 30 minutes.
 *
 * Email goes out over the same SMTP_* / EMAIL_FROM settings already used for
 * invoice emails. If those aren't configured, nothing is sent and the
 * reason is logged; the public response is identical either way so the
 * endpoint never reveals whether an email address has an account.
 */
@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private secretFor(passwordHash: string) {
    return `${this.config.get<string>("JWT_ACCESS_SECRET")}:${passwordHash}`;
  }

  private smtpConfigured() {
    return !!(
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.EMAIL_FROM
    );
  }

  async requestReset(rawEmail: string): Promise<void> {
    const email = rawEmail.trim().toLowerCase();
    const user = await this.prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    });
    if (!user || user.status !== "ACTIVE") return;

    if (!this.smtpConfigured()) {
      this.logger.warn(
        "Password reset requested but email is not configured (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM).",
      );
      return;
    }

    const token = this.jwt.sign(
      { sub: user.id, purpose: RESET_PURPOSE },
      { secret: this.secretFor(user.passwordHash), expiresIn: RESET_TTL },
    );
    const webAppUrl = (process.env.WEB_APP_URL ?? "https://app.bxbii.com").replace(/\/$/, "");
    const link = `${webAppUrl}/reset-password?token=${encodeURIComponent(token)}`;

    try {
      const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === "true",
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      await transport.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: "Reset your bxbii password / إعادة تعيين كلمة المرور",
        text:
          `Hello ${user.fullName},\n\n` +
          `We received a request to reset the password for your bxbii account.\n` +
          `Open this link within 30 minutes to choose a new password:\n\n${link}\n\n` +
          `If you didn't request this, you can ignore this email — your password won't change.\n\n` +
          `—\n\n` +
          `مرحباً ${user.fullName}،\n\n` +
          `وصلنا طلب لإعادة تعيين كلمة المرور لحسابك في bxbii.\n` +
          `افتح الرابط التالي خلال 30 دقيقة لاختيار كلمة مرور جديدة:\n\n${link}\n\n` +
          `إذا لم تطلب ذلك، تجاهل هذه الرسالة ولن تتغير كلمة المرور.`,
      });
      this.logger.log(`Password reset email sent to user ${user.id}`);
    } catch (err) {
      this.logger.error(`Failed to send password reset email: ${(err as Error).message}`);
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const invalid = new BadRequestException(
      "This reset link is invalid or has expired. Please request a new one.",
    );

    const decoded = this.jwt.decode(token) as { sub?: string; purpose?: string } | null;
    if (!decoded?.sub || decoded.purpose !== RESET_PURPOSE) throw invalid;

    const user = await this.prisma.user.findUnique({ where: { id: decoded.sub } });
    if (!user || user.status !== "ACTIVE") throw invalid;

    try {
      this.jwt.verify(token, { secret: this.secretFor(user.passwordHash) });
    } catch {
      throw invalid;
    }

    const passwordHash = await argon2.hash(newPassword);
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
      // Sign out every existing session for this account.
      this.prisma.refreshToken.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
  }
}
