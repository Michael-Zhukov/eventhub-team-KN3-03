import type { OnModuleDestroy } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../generated/prisma/client";

@Injectable()
export class PrismaService
extends PrismaClient
implements OnModuleDestroy
{
  constructor() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error("PrismaServiceError: DATABASE_URL is not defined in process.env");
    }

    const adapter = new PrismaPg({ connectionString });

    super({
      adapter,
      log: ["query"],
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}


