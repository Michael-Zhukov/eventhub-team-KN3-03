import { api } from "./client"; // Перевірте шлях до вашого openapi-fetch клієнта

export interface CatalogFilters {
  city?: string;
  from?: string;
}

export interface EventPage {
  items: any[];
  nextCursor?: string | null;
}

const PAGE_SIZE = 6; // Зменшіть до 6 елементів, щоб побачити роботу гортання

export async function fetchEvents(filters: CatalogFilters, cursor?: string): Promise<EventPage> {
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

  if (error) throw error; // Найважливіший рядок!
  return data as EventPage;
}
