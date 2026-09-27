import { Module } from "@nestjs/common";

import { CatalogController } from "./catalog.controller";
import { EventRepository } from "./event.repository";
import { CatalogService } from "./catalog.service";

@Module({
  controllers: [CatalogController],
  providers: [CatalogService, EventRepository],
  exports: [CatalogService],
})
export class CatalogModule {}
