import path from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

config({
  path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.env"),
  override: true,
});

const prisma = new PrismaClient();

void (async (): Promise<void> => {
  const customers = await prisma.customer.count();
  const withGeo = await prisma.customer.count({
    where: { AND: [{ latitude: { not: null } }, { longitude: { not: null } }] },
  });
  console.log(JSON.stringify({ customers, withGeo }, null, 2));
})()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
