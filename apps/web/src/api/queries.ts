import { api } from "./client";
import type { paths } from "@eventhub/contracts";

export type EventDto = paths["/events"]["get"]["responses"]["200"]["content"]["application/json"]["items"][number];

export interface CatalogFilters {
  city?: string;
  from?: string;
}

export interface EventPage {
  items: EventDto[];
  nextCursor?: string | null;
}

const PAGE_SIZE = 6;

export async function fetchEvents(filters: CatalogFilters = {}, cursor?: string): Promise<EventPage> {
  const { data, error } = await api.GET("/events", {
    params: {
      query: {
        ...(filters.city ? { city: filters.city } : {}),
                                        ...(filters.from ? { from: filters.from } : {}),
                                        ...(cursor ? { cursor } : {}),
                                        limit: PAGE_SIZE,
      },
    },
  });

  if (error) throw error;
  return data as EventPage;
}
