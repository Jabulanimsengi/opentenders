import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BATCH_SIZE = Number(process.env.AWARD_BACKFILL_BATCH_SIZE || 500);

type AwardPayload = {
  suppliers?: Array<{ name?: string }>;
  value?: { amount?: number; currency?: string };
  date?: string;
};

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  let cursor: string | undefined;
  let scanned = 0;
  let tendersWithAwards = 0;
  let awardsSaved = 0;

  while (true) {
    const tenders = await prisma.tender.findMany({
      take: BATCH_SIZE,
      ...(cursor
        ? {
            skip: 1,
            cursor: { id: cursor },
          }
        : {}),
      where: { rawData: { not: null } },
      orderBy: { id: 'asc' },
      select: { id: true, rawData: true },
    });

    if (tenders.length === 0) break;

    for (const tender of tenders) {
      scanned++;
      const awards = extractAwards(tender.rawData);
      if (awards.length === 0) continue;

      tendersWithAwards++;
      awardsSaved += await upsertAwards(tender.id, awards, dryRun);
    }

    cursor = tenders[tenders.length - 1].id;
  }

  console.log(
    JSON.stringify(
      {
        scanned,
        tendersWithAwards,
        awardsSaved,
        dryRun,
      },
      null,
      2,
    ),
  );
}

function extractAwards(rawData?: string | null): AwardPayload[] {
  if (!rawData) return [];

  try {
    const parsed = JSON.parse(rawData);
    return Array.isArray(parsed?.awards) ? parsed.awards : [];
  } catch {
    return [];
  }
}

async function upsertAwards(
  tenderId: string,
  awards: AwardPayload[],
  dryRun: boolean,
) {
  let saved = 0;
  const seenSuppliers = new Set<string>();

  for (const award of awards) {
    const date = parseOptionalDate(award.date);
    const amount =
      typeof award.value?.amount === 'number' &&
      Number.isFinite(award.value.amount)
        ? award.value.amount
        : null;
    const currency = award.value?.currency || 'ZAR';

    for (const supplier of award.suppliers || []) {
      const supplierName = supplier.name?.replace(/\s+/g, ' ').trim();
      if (!supplierName) continue;

      const supplierKey = supplierName.toLowerCase();
      if (seenSuppliers.has(supplierKey)) continue;
      seenSuppliers.add(supplierKey);

      if (!dryRun) {
        await prisma.award.upsert({
          where: {
            tenderId_supplierName: {
              tenderId,
              supplierName,
            },
          },
          update: {
            amount,
            currency,
            date,
          },
          create: {
            tenderId,
            supplierName,
            amount,
            currency,
            date,
          },
        });
      }

      saved++;
    }
  }

  return saved;
}

function parseOptionalDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
