import type { Event } from "@eventhub/contracts";

export const EVENTS: Event[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    title: "Frontend Conference",
    startsAt: "2026-10-10T10:00:00Z",
    venue: {
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      name: "Odesa Hall",
      city: "Одеса",
    },
    minPrice: {
      amount: 500,
      currency: "UAH",
    },
    availableSeats: 120,
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    title: "Backend Meetup",
    startsAt: "2026-10-10T10:00:00Z",
    venue: {
      id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      name: "Kyiv Hub",
      city: "Київ",
    },
    minPrice: {
      amount: 300,
      currency: "UAH",
    },
    availableSeats: 80,
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    title: "JavaScript Workshop",
    startsAt: "2026-10-11T12:00:00Z",
    venue: {
      id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
      name: "Lviv Center",
      city: "Львів",
    },
    minPrice: {
      amount: 700,
      currency: "UAH",
    },
    availableSeats: 45,
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    title: "TypeScript Workshop",
    startsAt: "2026-10-12T14:00:00Z",
    venue: {
      id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
      name: "Odesa Hub",
      city: "Одеса",
    },
    minPrice: {
      amount: 600,
      currency: "UAH",
    },
    availableSeats: 60,
  },
];
