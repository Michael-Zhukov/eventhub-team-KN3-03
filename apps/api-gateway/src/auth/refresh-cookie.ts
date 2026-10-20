
export const REFRESH_COOKIE_NAME = "refresh_token";

export const REFRESH_COOKIE_PATH = "/auth";

export function refreshCookieOptions() {
  const days = Number(process.env.REFRESH_TTL_DAYS ?? 30);

  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: REFRESH_COOKIE_PATH,
    maxAge: days * 24 * 60 * 60 * 1000,
  };
}
