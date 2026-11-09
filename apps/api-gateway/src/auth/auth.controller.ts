

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import { AuthService } from "./auth.service";
import { LoginRequestDto, RegisterRequestDto } from "./auth.dto";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { RefreshTokenService } from "./refresh-token.service";
import {
  REFRESH_COOKIE_NAME,
  REFRESH_COOKIE_PATH,
  refreshCookieOptions,
} from "./refresh-cookie";

type CookieResponse = {
  cookie: (
    name: string,
    value: string,
    options: ReturnType<typeof refreshCookieOptions>,
  ) => void;
  clearCookie: (
    name: string,
    options: {
      path: string;
      httpOnly: boolean;
      secure: boolean;
      sameSite: "strict";
    },
  ) => void;
};

type AuthRequest = {
  headers: { authorization?: string };
  cookies?: Record<string, string>;
};

@Controller("auth")
export class AuthController {
  constructor(
    @Inject(AuthService)
    private readonly auth: AuthService,
    @Inject(JwtService)
    private readonly jwt: JwtService,
    @Inject(RefreshTokenService)
    private readonly refreshTokens: RefreshTokenService,
  ) {}

  @Post("register")
  register(@Body() body: RegisterRequestDto) {
    return this.auth.register(body.email, body.password);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() body: LoginRequestDto,
    @Res({ passthrough: true }) response: CookieResponse,
  ) {
    const result = await this.auth.login(body.email, body.password);

    const refreshToken = await this.auth.createRefreshToken(
      result.user.id,
    );

    response.cookie(
      REFRESH_COOKIE_NAME,
      refreshToken,
      refreshCookieOptions(),
    );

    return result;
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() request: AuthRequest,
    @Res({ passthrough: true }) response: CookieResponse,
  ) {
    const oldToken = request.cookies?.[REFRESH_COOKIE_NAME];

    if (!oldToken) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    const rotated = await this.refreshTokens.rotate(oldToken);

    const user = await this.auth.getProfile(rotated.userId);

    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      role: user.role,
    });

    response.cookie(
      REFRESH_COOKIE_NAME,
      rotated.refreshToken,
      refreshCookieOptions(),
    );

    return {
      accessToken,
      user,
    };
  }

  @Post("logout")
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() request: AuthRequest,
    @Res({ passthrough: true }) response: CookieResponse,
  ) {
    const token = request.cookies?.[REFRESH_COOKIE_NAME];

    if (token) {
      await this.refreshTokens.revokeFamily(token);
    }

    response.clearCookie(REFRESH_COOKIE_NAME, {
      path: REFRESH_COOKIE_PATH,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async me(@Req() request: AuthRequest) {
    const token = request.headers.authorization!.slice(7);

    const payload = await this.jwt.verifyAsync<{
      sub: string;
      role: string;
    }>(token);

    return this.auth.getProfile(payload.sub);
  }
}
