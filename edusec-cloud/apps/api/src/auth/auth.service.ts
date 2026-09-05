import { createHmac, randomBytes } from "node:crypto";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import { PrismaService } from "../prisma/prisma.service";

export interface AccessTokenPayload {
  sub: string; // user id
  tenantId: string;
  email: string;
  primaryBranchId: string | null;
  roles: string[];
  permissions: string[];
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  /** Validates credentials and returns the user with roles/permissions resolved. Never throws details that reveal whether the email exists. */
  async validateCredentials(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } },
      },
    });

    if (!user || user.status !== "ACTIVE") {
      throw new UnauthorizedException("Invalid email or password.");
    }

    const passwordOk = await argon2.verify(user.passwordHash, password);
    if (!passwordOk) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    return user;
  }

  private buildAccessPayload(user: Awaited<ReturnType<AuthService["validateCredentials"]>>): AccessTokenPayload {
    const roles = user.roles.map((ur) => ur.role.code);
    const permissions = Array.from(
      new Set(user.roles.flatMap((ur) => ur.role.permissions.map((rp) => rp.permission.code))),
    );

    return {
      sub: user.id,
      tenantId: user.tenantId,
      email: user.email,
      primaryBranchId: user.primaryBranchId,
      roles,
      permissions,
    };
  }

  private signAccessToken(payload: AccessTokenPayload) {
    return this.jwt.sign(payload, {
      secret: this.config.get<string>("JWT_ACCESS_SECRET"),
      expiresIn: this.config.get<string>("JWT_ACCESS_TTL", "15m"),
    });
  }

  private hashRefreshToken(rawToken: string) {
    const secret = this.config.get<string>("JWT_REFRESH_SECRET")!;
    return createHmac("sha256", secret).update(rawToken).digest("hex");
  }

  private async issueRefreshToken(userId: string) {
    const rawToken = randomBytes(64).toString("hex");
    const ttlDays = 7; // mirrors JWT_REFRESH_TTL default of 7d
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: this.hashRefreshToken(rawToken),
        expiresAt: new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000),
      },
    });
    return rawToken;
  }

  async login(email: string, password: string) {
    const user = await this.validateCredentials(email, password);
    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    const accessToken = this.signAccessToken(this.buildAccessPayload(user));
    const refreshToken = await this.issueRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        primaryBranchId: user.primaryBranchId,
        roles: user.roles.map((ur) => ur.role.code),
      },
    };
  }

  /** Rotates a refresh token: the presented token is revoked and a new pair is issued. */
  async refresh(rawToken: string) {
    const tokenHash = this.hashRefreshToken(rawToken);
    const existing = await this.prisma.refreshToken.findFirst({
      where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
      include: {
        user: {
          include: {
            roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } },
          },
        },
      },
    });

    if (!existing) {
      throw new UnauthorizedException("Refresh token is invalid or has expired.");
    }

    await this.prisma.refreshToken.update({ where: { id: existing.id }, data: { revokedAt: new Date() } });

    const accessToken = this.signAccessToken(this.buildAccessPayload(existing.user));
    const refreshToken = await this.issueRefreshToken(existing.user.id);

    return { accessToken, refreshToken };
  }

  async logout(rawToken: string) {
    const tokenHash = this.hashRefreshToken(rawToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
