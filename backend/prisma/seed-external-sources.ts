import { PrismaClient } from '@prisma/client';
import { southAfricanExternalSources } from './south-african-external-sources';

const prisma = new PrismaClient();

async function main() {
  const seenTenderUrls = new Set<string>();
  for (const source of southAfricanExternalSources) {
    if (seenTenderUrls.has(source.tenderUrl)) {
      throw new Error(`Duplicate external source URL: ${source.tenderUrl}`);
    }
    seenTenderUrls.add(source.tenderUrl);
  }

  for (const source of southAfricanExternalSources) {
    const existing = await prisma.tenderSource.findFirst({
      where: { tenderUrl: source.tenderUrl },
    });

    if (existing) {
      await prisma.tenderSource.update({
        where: { id: existing.id },
        data: source,
      });
      console.log(`Updated source: ${source.name}`);
      continue;
    }

    await prisma.tenderSource.create({ data: source });
    console.log(`Created source: ${source.name}`);
  }

  console.log(
    `Seeded ${southAfricanExternalSources.length} South African external tender sources.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
