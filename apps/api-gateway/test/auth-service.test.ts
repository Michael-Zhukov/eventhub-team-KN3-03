
import assert from "node:assert/strict";
import { test } from "node:test";
import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../src/auth/auth.service";

const exampleUser = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "student@example.com",
  role: "USER" as const,
  createdAt: new Date(),
  passwordHash: "stored-hash",
};

test("registration normalizes email", async () => {
  let savedEmail = "";

  const prisma = {
    user: {
      create: async ({ data }: { data: { email: string } }) => {
        savedEmail = data.email;
        return exampleUser;
      },
    },
  };

  const service = Object.create(AuthService.prototype) as AuthService & {
    prisma: typeof prisma;
  };

  service.prisma = prisma;
  service.hashPassword = async () => "hashed-password";

  await service.register("  STUDENT@Example.COM  ", "TestPassword123!");

  assert.equal(savedEmail, "student@example.com");
});

test("duplicate email returns 409 Conflict", async () => {
  const prisma = {
    user: {
      create: async () => {
        throw { code: "P2002" };
      },
    },
  };

  const service = Object.create(AuthService.prototype) as AuthService & {
    prisma: typeof prisma;
  };

  service.prisma = prisma;
  service.hashPassword = async () => "hashed-password";

  await assert.rejects(
    service.register("student@example.com", "TestPassword123!"),
    (error: unknown) =>
      error instanceof ConflictException &&
      error.getStatus() === 409,
  );
});

test("unknown email returns 401", async () => {
  const prisma = {
    user: {
      findUnique: async () => null,
    },
  };

  const service = Object.create(AuthService.prototype) as AuthService & {
    prisma: typeof prisma;
    dummyPasswordHash: Promise<string>;
  };

  service.prisma = prisma;
  service.dummyPasswordHash = Promise.resolve("dummy-hash");
  service.verifyPassword = async () => false;

  await assert.rejects(
    service.login("unknown@example.com", "TestPassword123!"),
    (error: unknown) =>
      error instanceof UnauthorizedException &&
      error.getStatus() === 401 &&
      error.message === "Invalid credentials",
  );
});

test("incorrect password returns the same 401", async () => {
  const prisma = {
    user: {
      findUnique: async () => exampleUser,
    },
  };

  const service = Object.create(AuthService.prototype) as AuthService & {
    prisma: typeof prisma;
  };

  service.prisma = prisma;
  service.verifyPassword = async () => false;

  await assert.rejects(
    service.login("student@example.com", "WrongPassword123!"),
    (error: unknown) =>
      error instanceof UnauthorizedException &&
      error.getStatus() === 401 &&
      error.message === "Invalid credentials",
  );
});
