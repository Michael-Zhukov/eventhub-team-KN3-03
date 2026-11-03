
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";

import {
  generateRefreshToken,
  generateTokenFamilyId,
  hashRefreshToken,
} from "../src/auth/refresh-token.utils";

test("refresh token contains 32 random bytes", () => {
  const token = generateRefreshToken();

  assert.equal(Buffer.from(token, "base64url").length, 32);
  assert.match(token, /^[A-Za-z0-9_-]+$/);
});

test("refresh tokens are unique", () => {
  const first = generateRefreshToken();
  const second = generateRefreshToken();

  assert.notEqual(first, second);
});

test("refresh token is stored as a SHA-256 hash", () => {
  const token = generateRefreshToken();
  const expected = createHash("sha256")
    .update(token)
    .digest("hex");

  assert.equal(hashRefreshToken(token), expected);
  assert.notEqual(hashRefreshToken(token), token);
});

test("same refresh token always produces the same hash", () => {
  const token = generateRefreshToken();

  assert.equal(hashRefreshToken(token), hashRefreshToken(token));
});

test("different refresh tokens produce different hashes", () => {
  const first = generateRefreshToken();
  const second = generateRefreshToken();

  assert.notEqual(hashRefreshToken(first), hashRefreshToken(second));
});

test("token family IDs are valid UUIDs", () => {
  const familyId = generateTokenFamilyId();

  assert.match(
    familyId,
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  );
});
