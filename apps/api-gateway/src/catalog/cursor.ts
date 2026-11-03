import { InvalidCursor } from "../common/problem/domain-errors";
import type { CursorPosition } from "./event.repository";

export function encodeCursor(position: CursorPosition): string {
  return Buffer.from(
    `${position.startsAt}|${position.id}`,
    "utf8",
  ).toString("base64url");
}

export function decodeCursor(raw: string): CursorPosition {
  let decoded: string;

  try {
    decoded = Buffer.from(raw, "base64url").toString("utf8");
  } catch {
    throw new InvalidCursor(raw);
  }

  const parts = decoded.split("|");

  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new InvalidCursor(raw);
  }

  return {
    startsAt: parts[0],
    id: parts[1],
  };
}
