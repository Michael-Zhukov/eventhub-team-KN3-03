import { Module } from "@nestjs/common";

import { PrismaService } from "../prisma.service";
import { CatalogController } from "./catalog.controller";
import { EventRepository } from "./event.repository";
import { CatalogService } from "./catalog.service";

@Module({
  controllers: [CatalogController],
  providers: [CatalogService, EventRepository, PrismaService],
  exports: [CatalogService],
})
export class CatalogModule {}