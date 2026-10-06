import { Injectable } from "@nestjs/common";
import type { Event } from "@eventhub/contracts";

import { PrismaService } from "../prisma.service";

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

@Injectable()
export class EventRepository {
  constructor(private readonly prisma: PrismaService) {}

  async find(params: FindParams): Promise<Event[]> {
    const rows = await this.prisma.event.findMany({
      where: {
        ...(params.city
          ? {
              venue: {
                city: {
                  equals: params.city,
                  mode: "insensitive",
                },
              },
            }
          : {}),
        ...(params.from
          ? {
              startsAt: {
                gte: new Date(`${params.from}T00:00:00Z`),
              },
            }
          : {}),
        ...(params.after
          ? {
              OR: [
                {
                  startsAt: {
                    gt: new Date(params.after.startsAt),
                  },
                },
                {
                  startsAt: new Date(params.after.startsAt),
                  id: {
                    gt: params.after.id,
                  },
                },
              ],
            }
          : {}),
      },
      include: {
        venue: true,
      },
      orderBy: [
        {
          startsAt: "asc",
        },
        {
          id: "asc",
        },
      ],
      take: params.limit + 1,
    });

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      ...(row.description !== null
        ? { description: row.description }
        : {}),
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

  async byId(id: string): Promise<Event | undefined> {
    const row = await this.prisma.event.findUnique({
      where: {
        id,
      },
      include: {
        venue: true,
      },
    });

    if (!row) {
      return undefined;
    }

    return {
      id: row.id,
      title: row.title,
      ...(row.description !== null
        ? { description: row.description }
        : {}),
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
    };
  }
}