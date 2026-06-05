import { PrismaClient } from '@prisma/client';
import { ExternalScraperRegistryService } from '../src/external-sources/external-scraper-registry.service';
import { ExternalSourcesService } from '../src/external-sources/external-sources.service';
import { ExternalTenderImportService } from '../src/external-sources/external-tender-import.service';

const prisma = new PrismaClient();
const registry = new ExternalScraperRegistryService();
const importer = new ExternalTenderImportService(prisma as never);
const service = new ExternalSourcesService(prisma as never, registry, importer);

async function main() {
  const result = await service.scrapeAllActive();
  console.log(
    JSON.stringify(
      {
        success: result.success,
        runs: result.runs.map((run: Record<string, unknown>) => ({
          sourceName: run.sourceName,
          status: run.status,
          found: run.numberOfTendersFound,
          created: run.numberOfTendersCreated,
          updated: run.numberOfTendersUpdated,
          duplicates: run.numberOfDuplicatesFound,
          errorMessage: run.errorMessage,
        })),
      },
      null,
      2,
    ),
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
