import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const venues = [
  {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    name: "Odesa Hall",
    city: "Одеса",
  },
  {
    id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    name: "Kyiv Hub",
    city: "Київ",
  },
  {
    id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    name: "Lviv Center",
    city: "Львів",
  },
  {
    id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
    name: "Odesa Hub",
    city: "Одеса",
  },
];

const events = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    title: "Frontend Conference",
    startsAt: new Date("2026-10-10T10:00:00Z"),
    venueId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    minPriceAmount: 500,
    currency: "UAH",
    availableSeats: 120,
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    title: "Backend Meetup",
    startsAt: new Date("2026-10-10T10:00:00Z"),
    venueId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    minPriceAmount: 300,
    currency: "UAH",
    availableSeats: 80,
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    title: "JavaScript Workshop",
    startsAt: new Date("2026-10-11T12:00:00Z"),
    venueId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    minPriceAmount: 700,
    currency: "UAH",
    availableSeats: 45,
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    title: "TypeScript Workshop",
    startsAt: new Date("2026-10-12T14:00:00Z"),
    venueId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
    minPriceAmount: 600,
    currency: "UAH",
    availableSeats: 60,
  },
];

async function main(): Promise<void> {
  for (const venue of venues) {
    await prisma.venue.upsert({
      where: { id: venue.id },
      update: venue,
      create: venue,
    });
  }

  for (const event of events) {
    await prisma.event.upsert({
      where: { id: event.id },
      update: event,
      create: event,
    });
  }

  console.log("Seed completed successfully.");
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });