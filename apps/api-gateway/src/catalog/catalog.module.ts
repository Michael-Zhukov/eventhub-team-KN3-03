import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { CatalogService } from "./catalog.service";
import { CatalogController } from "./catalog.controller";
import { OrganizerController } from "./organizer.controller";
import { EventRepository } from "./event.repository";
import { PrismaService } from "../prisma.service";

@Module({
  imports: [
    JwtModule.register({}),
  ],
  controllers: [CatalogController, OrganizerController],
  providers: [CatalogService, EventRepository, PrismaService],
  exports: [CatalogService],
})
export class CatalogModule {}
