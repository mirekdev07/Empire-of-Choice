import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  const saves = await prisma.gameSave.findMany({
    select: {
      id: true,
      name: true,
      money: true,
      lastPlayedAt: true,
      lastProductionPerSecond: true,
      chosenPath: true,
      buildings: true,
    }
  });

  console.log("=== GameSaves in DB ===");
  for (const save of saves) {
    const secondsAgo = Math.floor((Date.now() - new Date(save.lastPlayedAt).getTime()) / 1000);
    const buildingCount = Object.keys(save.buildings || {}).length;
    const totalBuildings = Object.values(save.buildings || {}).reduce((a, b) => a + b, 0);
    console.log(`
Save: ${save.name} (${save.id})
  Path: ${save.chosenPath}
  Money: ${save.money}
  lastProductionPerSecond: ${save.lastProductionPerSecond}
  lastPlayedAt: ${save.lastPlayedAt}
  Time since last play: ${secondsAgo} seconds
  Buildings: ${JSON.stringify(save.buildings)}
  Building types: ${buildingCount}, Total count: ${totalBuildings}
`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
