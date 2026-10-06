import { Controller, Get, Inject, Param, Query } from "@nestjs/common";

import { CatalogService } from "./catalog.service";

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { EventIdParamDto, ListEventsQueryDto } from "./catalog.dto";

@Controller("events")
export class CatalogController {
  constructor(
    @Inject(CatalogService)
    private readonly catalog: CatalogService,
  ) {}

  @Get()
  list(
    @Query() query: ListEventsQueryDto,
  ): ReturnType<CatalogService["list"]> {
    return this.catalog.list(query);
  }

  @Get(":eventId")
  getOne(@Param() params: EventIdParamDto) {
    return this.catalog.getOne(params.eventId);
  }
}
