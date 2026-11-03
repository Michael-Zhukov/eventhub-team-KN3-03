

import assert from "node:assert/strict";
import { test } from "node:test";
import * as argon2 from "argon2";

import { AuthService } from "../src/auth/auth.service";

test("password is hashed with Argon2id", async () => {
  const service = Object.create(
    AuthService.prototype,
  ) as AuthService;

  const password = "TestPassword123!";
  const hash = await service.hashPassword(password);

  assert.notEqual(hash, password);
  assert.ok(hash.startsWith("$argon2id$"));
  assert.match(hash, /m=65536,p=\d+,t=3/);
});

test("correct password passes verification", async () => {
  const service = Object.create(
    AuthService.prototype,
  ) as AuthService;

  const password = "TestPassword123!";
  const hash = await service.hashPassword(password);

  assert.equal(
    await service.verifyPassword(hash, password),
    true,
  );
});

test("incorrect password fails verification", async () => {
  const service = Object.create(
    AuthService.prototype,
  ) as AuthService;

  const hash = await service.hashPassword(
    "TestPassword123!",
  );

  assert.equal(
    await service.verifyPassword(
      hash,
      "WrongPassword123!",
    ),
    false,
  );
});
