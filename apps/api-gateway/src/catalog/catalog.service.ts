import { Inject, Injectable } from "@nestjs/common";
import type { Event, EventPage, ListEventsQuery } from "@eventhub/contracts";

import { EventNotFound } from "../common/problem/domain-errors";
import { decodeCursor, encodeCursor } from "./cursor";
import { EventRepository } from "./event.repository";

@Injectable()
export class CatalogService {
  constructor(
    @Inject(EventRepository)
    private readonly repo: EventRepository,
  ) {}

  async list(query: ListEventsQuery): Promise<EventPage> {
    const after = query.cursor ? decodeCursor(query.cursor) : undefined;

    const rows = await this.repo.find({
      city: query.city,
      from: query.from,
      after,
      limit: query.limit,
    });

    const hasMore = rows.length > query.limit;
    const items = hasMore ? rows.slice(0, query.limit) : rows;
    const last = items.at(-1);

    return {
      items,
      nextCursor: hasMore && last ? encodeCursor(last) : null,
    };
  }

  async getOne(eventId: string): Promise<Event> {
    const event = await this.repo.byId(eventId);

    if (!event) {
      throw new EventNotFound(eventId);
    }

    return event;
  }
}
