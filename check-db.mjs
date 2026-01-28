import { config } from 'dotenv';
// Load production environment
config({ path: '.env.production.local' });

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

console.log("Connecting to:", connectionString.replace(/:[^:@]+@/, ':***@'));

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  // Get all users with their saves
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      gameSaves: {
        select: {
          id: true,
          name: true,
          money: true,
          lastPlayedAt: true,
          lastProductionPerSecond: true,
          chosenPath: true,
          buildings: true,
        }
      }
    }
  });

  console.log("\n=== All Users and Saves (PRODUCTION) ===\n");
  for (const user of users) {
    console.log(`User: ${user.name || user.email}`);
    for (const save of user.gameSaves) {
      const secondsAgo = Math.floor((Date.now() - new Date(save.lastPlayedAt).getTime()) / 1000);
      const buildingTypes = Object.keys(save.buildings || {}).length;
      const totalBuildings = Object.values(save.buildings || {}).reduce((a, b) => a + b, 0);
      console.log(`  Save: ${save.name}
    Path: ${save.chosenPath}
    Money: ${save.money.toFixed(2)}
    lastProductionPerSecond: ${save.lastProductionPerSecond}
    lastPlayedAt: ${secondsAgo} seconds ago
    Buildings: ${JSON.stringify(save.buildings)}
    (${buildingTypes} types, ${totalBuildings} total)
`);
    }
    console.log("");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
