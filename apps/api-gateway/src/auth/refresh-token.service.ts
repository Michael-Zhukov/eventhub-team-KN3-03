

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

    if (existing.usedAt || existing.revokedAt) {
      await this.prisma.refreshToken.updateMany({
        where: { familyId: existing.familyId },
        data: { revokedAt: new Date() },
      });

      this.logger.warn("Refresh token reuse detected");

      throw new UnauthorizedException("Invalid refresh token");
    }

    if (existing.expiresAt <= new Date()) {
      throw new UnauthorizedException("Refresh token expired");
    }

    const updated = await this.prisma.refreshToken.updateMany({
      where: {
        id: existing.id,
        usedAt: null,
        revokedAt: null,
      },
      data: { usedAt: new Date() },
    });

    if (updated.count !== 1) {
      await this.prisma.refreshToken.updateMany({
        where: { familyId: existing.familyId },
        data: { revokedAt: new Date() },
      });

      this.logger.warn("Refresh token reuse detected");

      throw new UnauthorizedException("Invalid refresh token");
    }

    const newToken = generateRefreshToken();

    await this.prisma.refreshToken.create({
      data: {
        userId: existing.userId,
        familyId: existing.familyId,
        tokenHash: hashRefreshToken(newToken),
        expiresAt: new Date(
          Date.now() +
            Number(process.env.REFRESH_TTL_DAYS ?? 30) *
              24 *
              60 *
              60 *
              1000,
        ),
      },
    });

    return {
      refreshToken: newToken,
      userId: existing.userId,
    };
  }

  async revokeFamily(token: string): Promise<void> {
    const existing = await this.prisma.refreshToken.findUnique({
      where: {
        tokenHash: hashRefreshToken(token),
      },
    });

    if (!existing) {
      return;
    }

    await this.prisma.refreshToken.updateMany({
      where: {
        familyId: existing.familyId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }
}
