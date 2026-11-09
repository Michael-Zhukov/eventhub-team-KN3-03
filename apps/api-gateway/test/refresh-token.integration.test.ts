import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { UnauthorizedException } from "@nestjs/common";

import { PrismaService } from "../src/prisma.service";
import { RefreshTokenService } from "../src/auth/refresh-token.service";
import {
  generateRefreshToken,
  hashRefreshToken,
} from "../src/auth/refresh-token.utils";

test("PostgreSQL: concurrent refresh detects reuse and revokes family", async () => {
  const databaseUrl = process.env.DATABASE_URL;

  assert.ok(
    databaseUrl,
    "DATABASE_URL must point to the test database",
  );

  const database = new URL(databaseUrl);

  assert.equal(
    database.pathname,
    "/eventhub_auth_test",
    "Integration test must use eventhub_auth_test",
  );

  const prisma = new PrismaService();
  const service = new RefreshTokenService(prisma);

  const email = `refresh-test-${randomUUID()}@example.test`;
  const familyId = randomUUID();
  const oldToken = generateRefreshToken();

  let userId: string | undefined;

  try {
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: "integration-test-only",
      },
    });

    userId = user.id;

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        familyId,
        tokenHash: hashRefreshToken(oldToken),
        expiresAt: new Date(Date.now() + 60_000),
      },
    });

    const results = await Promise.allSettled([
      service.rotate(oldToken),
      service.rotate(oldToken),
    ]);

    const successful = results.filter(
      (result) => result.status === "fulfilled",
    );

    const rejected = results.filter(
      (result) => result.status === "rejected",
    );

    assert.equal(successful.length, 1);
    assert.equal(rejected.length, 1);

    const failure = rejected[0] as PromiseRejectedResult;

    assert.ok(failure.reason instanceof UnauthorizedException);
    assert.equal(failure.reason.getStatus(), 401);

    const tokens = await prisma.refreshToken.findMany({
      where: { familyId },
    });

    assert.equal(tokens.length, 2);
    assert.ok(
      tokens.every((token) => token.revokedAt !== null),
      "All tokens in the family must be revoked",
    );

    assert.equal(
      tokens.filter((token) => token.usedAt !== null).length,
      1,
    );
  } finally {
    if (userId) {
      await prisma.user.delete({
        where: { id: userId },
      });
    }

    await prisma.$disconnect();
  }
});
