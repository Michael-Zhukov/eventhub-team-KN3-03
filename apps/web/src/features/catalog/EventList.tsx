import { useQuery } from "@tanstack/react-query";
import { fetchEvents } from "../../api/queries";
import { eventKeys } from "../../api/queryKeys"; // ключи кеша

export function EventList() {
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", "list", { limit: 20 }], // Ключ для кеша
    queryFn: () => fetchEvents({ limit: 20 }),
                                                       staleTime: 1000 * 60 * 5, // Кеш свежий 5 минут
  });

  // 1. Состояние загрузки (Pending)
  if (isPending) {
    return <p>Завантаження подій...</p>;
  }

  // 2. Состояние ошибки (Error)
  if (isError) {
    return <p role="alert">{error instanceof Error ? error.message : "Помилка"}</p>;
  }

  const events = data?.items ?? [];

  // 3. Пустое состояние (Empty)
  if (events.length === 0) {
    return <p>Порожньо. Подій не знайдено.</p>;
  }

  // 4. Отображение данных
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
