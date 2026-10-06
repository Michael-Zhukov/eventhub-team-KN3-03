import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({
  adapter,
  log: ["query"],
});

async function main(): Promise<void> {
  console.log("\n--- N+1 DEMO: BAD ---");

  const events = await prisma.event.findMany({
    orderBy: [{ startsAt: "asc" }, { id: "asc" }],
  });

  for (const event of events) {
    await prisma.venue.findUnique({
      where: { id: event.venueId },
    });
  }

  console.log("\n--- END N+1 DEMO ---");
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });