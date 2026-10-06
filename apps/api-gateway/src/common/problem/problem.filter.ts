import type {
  ArgumentsHost,
  ExceptionFilter} from "@nestjs/common";
import {
  Catch
} from "@nestjs/common";

import { toProblem } from "./problem.mapper";
@Catch()
export class ProblemFilter implements ExceptionFilter {
  catch(err: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const problem = toProblem(err);

    response
      .status(problem.status)
      .type("application/problem+json")
      .json({
        ...problem,
        instance: request.originalUrl,
      });
  }
}
