import "dotenv/config";
import * as argon2 from "argon2";
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
    description: "Frontend Conference Event",
    startsAt: new Date("2026-10-10T10:00:00Z"),
    venueId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    minPriceAmount: 500,
    currency: "UAH",
    availableSeats: 120,
    organizerId: "11111111-2222-3333-4444-555555555552", // organizer 1
  },
{
  id: "22222222-2222-4222-8222-222222222222",
  title: "Backend Meetup",
  description: "Backend Meetup Event",
  startsAt: new Date("2026-10-10T10:00:00Z"),
  venueId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  minPriceAmount: 300,
  currency: "UAH",
  availableSeats: 80,
  organizerId: "11111111-2222-3333-4444-555555555552", // organizer 1
},
{
  id: "33333333-3333-4333-8333-333333333333",
  title: "JavaScript Workshop",
  description: "JavaScript Workshop Event",
  startsAt: new Date("2026-10-11T12:00:00Z"),
  venueId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
  minPriceAmount: 700,
  currency: "UAH",
  availableSeats: 45,
  organizerId: "11111111-2222-3333-4444-555555555552", // organizer 1
},
{
  id: "44444444-4444-4444-8444-444444444444",
  title: "TypeScript Workshop",
  description: "TypeScript Workshop Event",
  startsAt: new Date("2026-10-12T14:00:00Z"),
  venueId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
  minPriceAmount: 600,
  currency: "UAH",
  availableSeats: 60,
  organizerId: "11111111-2222-3333-4444-555555555552", // organizer 1
},
{
  id: "55555555-5555-4555-8555-555555555555",
  title: "Node.js Advanced",
  description: "Node.js Deep Dive",
  startsAt: new Date("2026-10-13T10:00:00Z"),
  venueId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  minPriceAmount: 800,
  currency: "UAH",
  availableSeats: 50,
  organizerId: "11111111-2222-3333-4444-555555555552", // organizer 1
},
{
  id: "018f2c1e-4a7b-7c3d-9e1f-2a5b6c7d8ea8",
  title: "React Native Masterclass",
  description: "Mobile App Development",
  startsAt: new Date("2026-10-14T11:00:00Z"),
  venueId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  minPriceAmount: 900,
  currency: "UAH",
  availableSeats: 40,
  organizerId: "11111111-2222-3333-4444-555555555553", // organizer 2
},
{
  id: "77777777-7777-4777-8777-777777777777",
  title: "GraphQL Architecture",
  description: "Designing Production APIs",
  startsAt: new Date("2026-10-15T15:00:00Z"),
  venueId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
  minPriceAmount: 450,
  currency: "UAH",
  availableSeats: 75,
  organizerId: "11111111-2222-3333-4444-555555555553", // organizer 2
},
{
  id: "88888888-8888-4888-8888-888888888888",
  title: "Docker & K8s for Devs",
  description: "DevOps Basics",
  startsAt: new Date("2026-10-16T09:00:00Z"),
  venueId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
  minPriceAmount: 1000,
  currency: "UAH",
  availableSeats: 30,
  organizerId: "11111111-2222-3333-4444-555555555553", // organizer 2
},
{
  id: "99999999-9999-4999-8999-999999999999",
  title: "Next.js Production Ready",
  description: "Server Components & SSR",
  startsAt: new Date("2026-10-17T13:00:00Z"),
  venueId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  minPriceAmount: 550,
  currency: "UAH",
  availableSeats: 90,
  organizerId: "11111111-2222-3333-4444-555555555553", // organizer 2
},
{
  id: "aaaaaaaa-1111-4aaa-8aaa-aaaaaaaaaaaa",
  title: "Cybersecurity Essentials",
  description: "OWASP Top 10 Practice",
  startsAt: new Date("2026-10-18T10:00:00Z"),
  venueId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  minPriceAmount: 1200,
  currency: "UAH",
  availableSeats: 25,
  organizerId: "11111111-2222-3333-4444-555555555553", // organizer 2
},
];

async function main(): Promise<void> {
const dynamicHash = await argon2.hash("eventhub-demo-2026");

  const users = [
    {
      id: "11111111-2222-3333-4444-555555555551",
      email: "student@example.com",
      passwordHash: dynamicHash,
      role: "USER" as const,
      emailVerified: false,
    },
    {
      id: "11111111-2222-3333-4444-555555555552",
      email: "organizer@example.com",
      passwordHash: dynamicHash,
      role: "ORGANIZER" as const,
      emailVerified: true,
    },
    {
      id: "11111111-2222-3333-4444-555555555553",
      email: "organizer2@example.com",
      passwordHash: dynamicHash,
      role: "ORGANIZER" as const,
      emailVerified: true,
    },
    {
      id: "11111111-2222-3333-4444-555555555554",
      email: "admin@example.com",
      passwordHash: dynamicHash,
      role: "ADMIN" as const,
      emailVerified: true,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: user,
      create: user,
    });
  }

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

  console.log("Seed completed successfully. Created 4 users, 4 venues, 10 events.");
}

main()
.catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
})
.finally(async () => {
  await prisma.$disconnect();
});

