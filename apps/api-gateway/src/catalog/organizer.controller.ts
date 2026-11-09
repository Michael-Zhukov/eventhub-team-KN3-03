import { Controller, Get, Patch, Param, Body, UseGuards, HttpCode, Req } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../common/authz/roles.guard";
import { Roles } from "../common/authz/roles.decorator";
import { CatalogService } from "./catalog.service";

@Controller("organizer/events")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ORGANIZER", "ADMIN")
export class OrganizerController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  async list(@Req() req: any) {
    return this.catalogService.listOrganizerEvents(req.user);
  }

  @Patch(":eventId")
  @HttpCode(200)
  async update(
    @Param("eventId") eventId: string,
               @Req() req: any,
               @Body() body: any,
  ) {
    return this.catalogService.updateOrganizerEvent(eventId, req.user, body);
  }
}

