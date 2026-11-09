import "reflect-metadata";
import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import cookieParser from "cookie-parser";
import type {
  INestApplication} from "@nestjs/common";
import {
  ConflictException,
  UnauthorizedException,
} from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import request from "supertest";

import { AuthController } from "../src/auth/auth.controller";
import { AuthService } from "../src/auth/auth.service";
import { RefreshTokenService } from "../src/auth/refresh-token.service";
import { ZodValidationPipe } from "../src/common/validation/zod-validation.pipe";
import { ProblemFilter } from "../src/common/problem/problem.filter";

const email = "student@example.com";
const password = "StrongPassword123!";

const user = {
  id: "00000000-0000-4000-8000-000000000001",
  email,
  role: "USER",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
};

let app: INestApplication;
let registered = false;
let currentRefreshToken = "refresh-token-1";

const authMock = {
  register: async () => {
    if (registered) {
      throw new ConflictException("Email already registered");
    }
    registered = true;
    return user;
  },
  login: async (_email: string, suppliedPassword: string) => {
    if (suppliedPassword !== password) {
      throw new UnauthorizedException("Invalid credentials");
    }
    return { accessToken: "access-token-1", user };
  },
  createRefreshToken: async () => currentRefreshToken,
  getProfile: async () => user,
};

const refreshMock = {
  rotate: async (token: string) => {
    if (token !== currentRefreshToken) {
      throw new UnauthorizedException("Invalid refresh token");
    }
    currentRefreshToken = "refresh-token-2";
    return { userId: user.id, refreshToken: currentRefreshToken };
  },
  revokeFamily: async () => undefined,
};

const jwtMock = {
  signAsync: async () => "access-token-2",
};

before(async () => {
  const module = await Test.createTestingModule({
    controllers: [AuthController],
    providers: [
      { provide: AuthService, useValue: authMock },
      { provide: RefreshTokenService, useValue: refreshMock },
      { provide: JwtService, useValue: jwtMock },
    ],
  }).compile();

  app = module.createNestApplication();
  app.use(cookieParser());
  app.useGlobalPipes(new ZodValidationPipe());
  app.useGlobalFilters(new ProblemFilter());
  await app.init();
});

after(async () => {
  if (app) await app.close();
});

test("register returns 201", async () => {
  const response = await request(app.getHttpServer())
    .post("/auth/register")
    .send({ email, password });

  assert.equal(response.status, 201);
  assert.equal(response.body.email, email);
});

test("duplicate registration returns 409", async () => {
  const response = await request(app.getHttpServer())
    .post("/auth/register")
    .send({ email, password });

  assert.equal(response.status, 409);
  assert.match(response.headers["content-type"], /application\/problem\+json/);
});

test("login returns 200 and sets refresh cookie", async () => {
  const response = await request(app.getHttpServer())
    .post("/auth/login")
    .send({ email, password });

  assert.equal(response.status, 200);
  assert.ok(response.body.accessToken);
  assert.match(
    String(response.headers["set-cookie"]),
    /HttpOnly/,
  );
});

test("incorrect one-character password returns 401", async () => {
  const response = await request(app.getHttpServer())
    .post("/auth/login")
    .send({ email, password: "x" });

  assert.equal(response.status, 401);
  assert.match(response.headers["content-type"], /application\/problem\+json/);
});

test("refresh without cookie returns 401", async () => {
  const response = await request(app.getHttpServer())
    .post("/auth/refresh");

  assert.equal(response.status, 401);
});

test("refresh with cookie returns 200 and rotates token", async () => {
  const response = await request(app.getHttpServer())
    .post("/auth/refresh")
    .set("Cookie", "refresh_token=refresh-token-1");

  assert.equal(response.status, 200);
  assert.ok(response.body.accessToken);
});

test("logout returns 204", async () => {
  const response = await request(app.getHttpServer())
    .post("/auth/logout");

  assert.equal(response.status, 204);
  assert.match(
    String(response.headers["set-cookie"]),
    /refresh/,
  );
});
