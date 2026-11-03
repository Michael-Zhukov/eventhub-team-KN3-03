import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import type { Event, EventPage, ListEventsQuery } from "@eventhub/contracts";

import { EventNotFound } from "../common/problem/domain-errors";
import { PrismaService } from "../prisma.service";
import { decodeCursor, encodeCursor } from "./cursor";
import { EventRepository } from "./event.repository";

@Injectable()
export class CatalogService implements OnModuleInit {
  private prisma!: PrismaService;

  constructor(
    @Inject(EventRepository)
    private readonly repo: EventRepository,
    private readonly moduleRef: ModuleRef,
  ) {}

  onModuleInit() {
    this.prisma = this.moduleRef.get(PrismaService, { strict: false });
  }

  private scopeFor(user: any) {
    return user.role === "ADMIN" ? {} : { organizerId: user.id };
  }

  async listOrganizerEvents(user: any): Promise<Event[]> {
    const scope = this.scopeFor(user);

    const rows = await this.prisma.event.findMany({
      where: scope,
      include: {
        venue: true,
      },
      orderBy: [
        { startsAt: "asc" },
        { id: "asc" },
      ],
    });

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      ...(row.description !== null ? { description: row.description } : {}),
      startsAt: row.startsAt.toISOString(),
      venue: {
        id: row.venue.id,
        name: row.venue.name,
        city: row.venue.city,
      },
      minPrice: {
        amount: row.minPriceAmount,
        currency: "UAH",
      },
      availableSeats: row.availableSeats,
    }));
  }

  async updateOrganizerEvent(eventId: string, user: any, data: any): Promise<{ success: boolean }> {
    const event = await this.repo.byId(eventId);

    if (!event) {
      throw new EventNotFound(eventId);
    }

    if (user.role !== "ADMIN") {
      const dbEvent = await this.prisma.event.findUnique({
        where: { id: eventId },
        select: { organizerId: true },
      });

      if (!dbEvent || dbEvent.organizerId !== user.id) {
        throw new EventNotFound(eventId);
      }
    }

    const { id: _, venueId: __, organizerId: ___, ...updateData } = data;

    await this.prisma.event.update({
      where: { id: eventId },
      data: updateData,
    });

    return { success: true };
  }

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




