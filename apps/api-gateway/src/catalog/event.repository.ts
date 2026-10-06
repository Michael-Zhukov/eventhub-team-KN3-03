import { Injectable } from "@nestjs/common";
import type { Event } from "@eventhub/contracts";

import { EVENTS } from "./seed";

export interface CursorPosition {
  startsAt: string;
  id: string;
}

export interface FindParams {
  city?: string;
  from?: string;
  after?: CursorPosition;
  limit: number;
}

function byStartThenId(a: Event, b: Event): number {
  if (a.startsAt !== b.startsAt) {
    return a.startsAt.localeCompare(b.startsAt);
  }

  return a.id.localeCompare(b.id);
}

@Injectable()
export class EventRepository {
  private readonly events: Event[] = [...EVENTS].sort(byStartThenId);

  async find(params: FindParams): Promise<Event[]> {
    let rows = this.events;

    if (params.city) {
      const needle = params.city.toLocaleLowerCase("uk");

      rows = rows.filter(
        (event) =>
          event.venue.city.toLocaleLowerCase("uk") === needle,
      );
    }

    if (params.from) {
      rows = rows.filter(
        (event) => event.startsAt >= `${params.from}T00:00:00Z`,
      );
    }

    if (params.after) {
      const { startsAt, id } = params.after;

      rows = rows.filter(
        (event) =>
          event.startsAt > startsAt ||
          (event.startsAt === startsAt && event.id > id),
      );
    }

    return rows.slice(0, params.limit + 1);
  }

  async byId(id: string): Promise<Event | undefined> {
    return this.events.find((event) => event.id === id);
  }
}
