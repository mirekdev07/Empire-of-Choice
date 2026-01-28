import { config } from 'dotenv';
config({ path: '.env.production.local' });

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const save = await prisma.gameSave.findFirst({
    where: { name: "Media #1" },
  });

  if (!save) {
    console.log("Save not found");
    return;
  }

  const now = new Date();
  const lastPlayed = new Date(save.lastPlayedAt);
  const secondsElapsed = Math.floor((now.getTime() - lastPlayed.getTime()) / 1000);

  console.log("=== CURRENT STATE ===");
  console.log(`Money in DB: ${save.money.toFixed(2)}`);
  console.log(`lastPlayedAt: ${lastPlayed.toISOString()}`);
  console.log(`secondsElapsed: ${secondsElapsed}`);
  console.log(`lastProductionPerSecond: ${save.lastProductionPerSecond}`);

  if (secondsElapsed > 30 && save.lastProductionPerSecond > 0) {
    const cappedSeconds = Math.min(secondsElapsed, 28800);
    const offlineEarnings = Math.floor(save.lastProductionPerSecond * cappedSeconds * 0.20);
    console.log(`\nOFFLINE EARNINGS WOULD BE: +${offlineEarnings}`);
    console.log(`New money would be: ${(save.money + offlineEarnings).toFixed(2)}`);
  } else {
    console.log(`\nNO OFFLINE EARNINGS (need >30s, have ${secondsElapsed}s)`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
