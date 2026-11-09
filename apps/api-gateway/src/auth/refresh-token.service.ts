import {
  Injectable,
  UnauthorizedException,
  Logger,
} from "@nestjs/common";

import { PrismaService } from "../prisma.service";
import {
  generateRefreshToken,
  hashRefreshToken,
} from "./refresh-token.utils";

@Injectable()
export class RefreshTokenService {
  private readonly logger = new Logger(RefreshTokenService.name);

  constructor(private readonly prisma: PrismaService) {}

  async rotate(oldToken: string) {
    const oldHash = hashRefreshToken(oldToken);

    const existing = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: oldHash },
    });

    if (!existing) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const result = await this.prisma.$transaction(
      async (tx) => {
        await tx.$queryRaw`
          SELECT pg_advisory_xact_lock(
            hashtext('refresh-family'),
            hashtext(${existing.familyId})
          )::text AS lock_acquired
        `;

        const current = await tx.refreshToken.findUnique({
          where: { tokenHash: oldHash },
        });

        if (!current) {
          return { status: "invalid" as const };
        }

        if (current.usedAt || current.revokedAt) {
          await tx.refreshToken.updateMany({
            where: {
              familyId: current.familyId,
              revokedAt: null,
            },
            data: { revokedAt: new Date() },
          });

          return { status: "reuse" as const };
        }

        if (current.expiresAt <= new Date()) {
          return { status: "expired" as const };
        }

        const updated = await tx.refreshToken.updateMany({
          where: {
            id: current.id,
            usedAt: null,
            revokedAt: null,
          },
          data: { usedAt: new Date() },
        });

        if (updated.count !== 1) {
          await tx.refreshToken.updateMany({
            where: {
              familyId: current.familyId,
              revokedAt: null,
            },
            data: { revokedAt: new Date() },
          });

          return { status: "reuse" as const };
        }

        const newToken = generateRefreshToken();

        await tx.refreshToken.create({
          data: {
            userId: current.userId,
            familyId: current.familyId,
            tokenHash: hashRefreshToken(newToken),
            expiresAt: new Date(
              Date.now() +
                Number(process.env.REFRESH_TTL_DAYS ?? 30) *
                  24 * 60 * 60 * 1000,
            ),
          },
        });

        return {
          status: "ok" as const,
          refreshToken: newToken,
          userId: current.userId,
        };
      },
      { maxWait: 10000, timeout: 20000 },
    );

    if (result.status === "reuse") {
      this.logger.warn("Refresh token reuse detected");
      throw new UnauthorizedException("Invalid refresh token");
    }

    if (result.status === "expired") {
      throw new UnauthorizedException("Refresh token expired");
    }

    if (result.status !== "ok") {
      throw new UnauthorizedException("Invalid refresh token");
    }

    return {
      refreshToken: result.refreshToken,
      userId: result.userId,
    };
  }

  async revokeFamily(token: string): Promise<void> {
    const existing = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: hashRefreshToken(token) },
    });

    if (!existing) return;

    await this.prisma.$transaction(
      async (tx) => {
        await tx.$queryRaw`
          SELECT pg_advisory_xact_lock(
            hashtext('refresh-family'),
            hashtext(${existing.familyId})
          )::text AS lock_acquired
        `;

        await tx.refreshToken.updateMany({
          where: {
            familyId: existing.familyId,
            revokedAt: null,
          },
          data: { revokedAt: new Date() },
        });
      },
      { maxWait: 10000, timeout: 20000 },
    );
  }
}
