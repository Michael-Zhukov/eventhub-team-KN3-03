import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { LoggerModule } from "nestjs-pino";

import { CatalogModule } from "./catalog/catalog.module";
import { HealthModule } from "./health/health.module";
import { ProblemFilter } from "./common/problem/problem.filter";

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        genReqId: (req) => {
          const incomingId = req.headers["x-request-id"];

          if (typeof incomingId === "string" && incomingId.trim()) {
            return incomingId;
          }

          return crypto.randomUUID();
        },
        customReceivedMessage: (req, res) => {
        const requestId = (req as typeof req & { id: string }).id;

          res.setHeader("x-request-id", requestId);
          return `request ${requestId} ${req.method} ${req.url}`;
        },
        customProps: (req) => ({
          requestId: req.id,
        }),
        redact: {
          paths: [
            "req.headers.authorization",
            "req.headers.cookie",
          ],
          censor: "[REDACTED]",
        },
      },
    }),
    HealthModule,
    CatalogModule,
  ],
  providers: [
  {
    provide: APP_FILTER,
    useClass: ProblemFilter,
  },
],
})
export class AppModule {}
