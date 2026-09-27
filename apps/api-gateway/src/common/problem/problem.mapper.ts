import { HttpException } from "@nestjs/common";
import type { Problem } from "@eventhub/contracts";

import {
  EventNotFound,
  InvalidCursor,
  RequestValidationFailed,
} from "./domain-errors";

export interface ProblemBody extends Problem {
  instance?: string;
  errors?: RequestValidationFailed["issues"];
}

export function toProblem(err: unknown): ProblemBody {
  if (err instanceof RequestValidationFailed) {
    return {
      type: "/errors/invalid-query",
      title: "Некоректний параметр запиту",
      status: 400,
      detail: err.issues
        .map((issue) => `${issue.field}: ${issue.message}`)
        .join("; "),
      errors: err.issues,
    };
  }

  if (err instanceof EventNotFound) {
    return {
      type: "/errors/not-found",
      title: "Подію не знайдено",
      status: 404,
      detail: err.message,
    };
  }

  if (err instanceof InvalidCursor) {
    return {
      type: "/errors/invalid-cursor",
      title: "Некоректний cursor",
      status: 400,
      detail: err.message,
    };
  }
  if (err instanceof HttpException) {
    const status = err.getStatus();
    const response = err.getResponse();

    return {
      type: "about:blank",
      title: err.name,
      status,
      detail:
        typeof response === "string"
          ? response
          : typeof response === "object" &&
              response !== null &&
              "message" in response
            ? String(response.message)
            : err.message,
    };
  }
  return {
    type: "about:blank",
    title: "Внутрішня помилка сервера",
    status: 500,
  };
}
