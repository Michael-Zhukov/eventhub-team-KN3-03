



import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";

import { PrismaService } from "../prisma.service";
import {
  generateRefreshToken,
  generateTokenFamilyId,
  hashRefreshToken,
} from "./refresh-token.utils";

@Injectable()
export class AuthService {
  private dummyPasswordHash: Promise<string>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {
    this.dummyPasswordHash = this.hashPassword(
      "DummyPasswordForTimingProtection123!",
    );
  }

  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
    });
  }

  async verifyPassword(
    hash: string,
    password: string,
  ): Promise<boolean> {
    return argon2.verify(hash, password);
  }

  async register(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const passwordHash = await this.hashPassword(password);

    try {
      return await this.prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
        },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2002"
      ) {
        throw new ConflictException("Email already registered");
      }

      throw error;
    }
  }

  async login(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    const hashToVerify =
      user?.passwordHash ?? (await this.dummyPasswordHash);

    const passwordValid = await this.verifyPassword(
      hashToVerify,
      password,
    );

    if (!user || !passwordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      role: user.role,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException("Unauthorized");
    }

    return user;
  }

  async createRefreshToken(userId: string): Promise<string> {
    const token = generateRefreshToken();
    const familyId = generateTokenFamilyId();

    const refreshTtlDays = Number(
      process.env.REFRESH_TTL_DAYS ?? 30,
    );

    const expiresAt = new Date(
      Date.now() + refreshTtlDays * 24 * 60 * 60 * 1000,
    );

    await this.prisma.refreshToken.create({
      data: {
        userId,
        familyId,
        tokenHash: hashRefreshToken(token),
        expiresAt,
      },
    });

    return token;
  }
}
