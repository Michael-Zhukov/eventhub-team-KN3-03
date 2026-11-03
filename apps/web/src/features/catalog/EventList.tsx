import { useQuery } from "@tanstack/react-query";
import { fetchEvents, type CatalogFilters } from "../../api/queries";
import { eventKeys } from "../../api/queryKeys";
import { useState } from "react";

export function EventList() {
  const [filters] = useState<CatalogFilters>({});

  const { data, isPending, isError, error } = useQuery({
    queryKey: eventKeys.list(filters),
    queryFn: () => fetchEvents(filters),
    staleTime: 1000 * 60 * 5,
  });

  if (isPending) {
    return <p>Завантаження подій...</p>;
  }

  if (isError) {
    return <p role="alert">{error instanceof Error ? error.message : "Помилка"}</p>;
  }

  const events = data?.items ?? [];

  if (events.length === 0) {
    return <p>Порожньо. Подій не знайдено.</p>;
  }

  return (
    <ul className="event-list">
    {events.map((e) => (
      <li key={e.id}>
      <strong>{e.title}</strong> — {e.venue.city},{" "}
      {new Date(e.startsAt).toLocaleString("uk-UA")}
      {" · від "}
      {(e.minPrice.amount / 100).toFixed(2)} грн
      </li>
    ))}
    </ul>
  );
}
