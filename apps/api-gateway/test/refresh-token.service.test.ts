
import assert from "node:assert/strict";
import { test } from "node:test";
import { UnauthorizedException } from "@nestjs/common";

import { RefreshTokenService } from "../src/auth/refresh-token.service";
import { hashRefreshToken } from "../src/auth/refresh-token.utils";

type StoredToken = {
  id: string;
  userId: string;
  familyId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  revokedAt: Date | null;
};

function createTestService(initialTokens: StoredToken[]) {
  const tokens = [...initialTokens];
  const warnings: string[] = [];

  const prisma = {
    refreshToken: {
      findUnique: async ({
        where,
      }: {
        where: { tokenHash: string };
      }) => {
        return tokens.find(
          (token) => token.tokenHash === where.tokenHash,
        ) ?? null;
      },

      updateMany: async ({
        where,
        data,
      }: {
        where: {
          id?: string;
          familyId?: string;
          usedAt?: null;
          revokedAt?: null;
        };
        data: {
          usedAt?: Date;
          revokedAt?: Date;
        };
      }) => {
        let count = 0;

        for (const token of tokens) {
          if (where.id !== undefined && token.id !== where.id) {
            continue;
          }

          if (
            where.familyId !== undefined &&
            token.familyId !== where.familyId
          ) {
            continue;
          }

          if (
            "usedAt" in where &&
            where.usedAt === null &&
            token.usedAt !== null
          ) {
            continue;
          }

          if (
            "revokedAt" in where &&
            where.revokedAt === null &&
            token.revokedAt !== null
          ) {
            continue;
          }

          if (data.usedAt !== undefined) {
            token.usedAt = data.usedAt;
          }

          if (data.revokedAt !== undefined) {
            token.revokedAt = data.revokedAt;
          }

          count++;
        }

        return { count };
      },

      create: async ({
        data,
      }: {
        data: {
          userId: string;
          familyId: string;
          tokenHash: string;
          expiresAt: Date;
        };
      }) => {
        const created: StoredToken = {
          id: `token-${tokens.length + 1}`,
          ...data,
          usedAt: null,
          revokedAt: null,
        };

        tokens.push(created);
        return created;
      },
    },
  };

  const service = Object.create(
    RefreshTokenService.prototype,
  ) as RefreshTokenService & {
    prisma: typeof prisma;
    logger: { warn: (message: string) => void };
  };

  service.prisma = prisma;
  service.logger = {
    warn: (message: string) => {
      warnings.push(message);
    },
  };

  return { service, tokens, warnings };
}

function makeStoredToken(
  rawToken: string,
  overrides: Partial<StoredToken> = {},
): StoredToken {
  return {
    id: "token-1",
    userId: "user-1",
    familyId: "family-1",
    tokenHash: hashRefreshToken(rawToken),
    expiresAt: new Date(Date.now() + 60_000),
    usedAt: null,
    revokedAt: null,
    ...overrides,
  };
}

test("valid refresh token rotates successfully", async () => {
  const oldToken = "original-refresh-token";
  const { service, tokens } = createTestService([
    makeStoredToken(oldToken),
  ]);

  const result = await service.rotate(oldToken);

  assert.equal(result.userId, "user-1");
  assert.notEqual(result.refreshToken, oldToken);
  assert.ok(tokens[0].usedAt instanceof Date);
  assert.equal(tokens.length, 2);
  assert.equal(tokens[1].familyId, "family-1");
  assert.equal(
    tokens[1].tokenHash,
    hashRefreshToken(result.refreshToken),
  );
});

test("unknown refresh token returns 401", async () => {
  const { service } = createTestService([]);

  await assert.rejects(
    service.rotate("unknown-refresh-token"),
    (error: unknown) =>
      error instanceof UnauthorizedException &&
      error.getStatus() === 401,
  );
});

test("expired refresh token returns 401", async () => {
  const oldToken = "expired-refresh-token";
  const { service, tokens } = createTestService([
    makeStoredToken(oldToken, {
      expiresAt: new Date(Date.now() - 60_000),
    }),
  ]);

  await assert.rejects(
    service.rotate(oldToken),
    (error: unknown) =>
      error instanceof UnauthorizedException &&
      error.getStatus() === 401,
  );

  assert.equal(tokens.length, 1);
});

test("reuse of old token revokes entire family and logs warning", async () => {
  const oldToken = "original-refresh-token";
  const { service, tokens, warnings } = createTestService([
    makeStoredToken(oldToken),
  ]);

  const result = await service.rotate(oldToken);

  await assert.rejects(
    service.rotate(oldToken),
    (error: unknown) =>
      error instanceof UnauthorizedException &&
      error.getStatus() === 401,
  );

  assert.ok(tokens.every((token) => token.revokedAt !== null));
  assert.ok(
    warnings.some((message) =>
      message.includes("Refresh token reuse detected"),
    ),
  );

  await assert.rejects(
    service.rotate(result.refreshToken),
    UnauthorizedException,
  );
});

test("logout revokes all tokens in the family", async () => {
  const oldToken = "logout-refresh-token";
  const { service, tokens } = createTestService([
    makeStoredToken(oldToken),
  ]);

  const result = await service.rotate(oldToken);

  await service.revokeFamily(result.refreshToken);

  assert.ok(tokens.every((token) => token.revokedAt !== null));

  await assert.rejects(
    service.rotate(result.refreshToken),
    UnauthorizedException,
  );
});
