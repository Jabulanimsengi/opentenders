import { writeFileSync } from 'fs';
import { PrismaClient } from '@prisma/client';
import { ExternalScraperRegistryService } from '../src/external-sources/external-scraper-registry.service';
import { ExternalTenderImportService } from '../src/external-sources/external-tender-import.service';
import {
  ExternalTenderResult,
  TenderSourceRecord,
} from '../src/external-sources/types';
import { southAfricanExternalSources } from './south-african-external-sources';

type ValidationResult = {
  name: string;
  tenderUrl: string;
  sourceType: string;
  province: string | null;
  scrapeMethod: string;
  status: 'success' | 'empty' | 'failed';
  found: number;
  imported?: {
    created: number;
    updated: number;
    duplicates: number;
  };
  sampleTitles: string[];
  error?: string;
};

const prisma = new PrismaClient();
const registry = new ExternalScraperRegistryService();
const importer = new ExternalTenderImportService(prisma as never);

async function main() {
  const options = parseOptions(process.argv.slice(2));
  const sources = await loadSources();
  const selected = sources.slice(options.start, options.start + options.limit);
  const results: ValidationResult[] = [];

  for (const [index, source] of selected.entries()) {
    const ordinal = options.start + index + 1;
    process.stdout.write(
      `[${ordinal}/${sources.length}] Validating ${source.name} ... `,
    );

    const result = await validateSource(source, {
      activateSuccess: options.activateSuccess,
      importSuccess: options.importSuccess,
    });
    results.push(result);
    console.log(`${result.status} (${result.found})`);
  }

  const summary = summarize(results);
  writeFileSync(
    options.output,
    `${JSON.stringify({ summary, results }, null, 2)}\n`,
  );

  console.log(JSON.stringify(summary, null, 2));
  console.log(`Validation results written to ${options.output}`);
}

async function loadSources(): Promise<TenderSourceRecord[]> {
  const dbSources = await prisma.tenderSource.findMany({
    orderBy: { name: 'asc' },
  });

  if (dbSources.length > 0) {
    return dbSources.map((source) => source as TenderSourceRecord);
  }

  return southAfricanExternalSources.map((source, index) => ({
    ...source,
    id: `catalog-${index + 1}`,
    lastScrapedAt: null,
  }));
}

async function validateSource(
  source: TenderSourceRecord,
  options: { activateSuccess: boolean; importSuccess: boolean },
): Promise<ValidationResult> {
  try {
    const scraper = registry.getScraper(source);
    const output = await scraper.scrape(source);
    const sampleTitles = sample(output.results);
    const status = output.results.length > 0 ? 'success' : 'empty';
    const result: ValidationResult = {
      name: source.name,
      tenderUrl: source.tenderUrl,
      sourceType: source.sourceType,
      province: source.province ?? null,
      scrapeMethod: source.scrapeMethod,
      status,
      found: output.results.length,
      sampleTitles,
    };

    if (status === 'success' && options.activateSuccess) {
      await prisma.tenderSource.update({
        where: { id: source.id },
        data: { active: true },
      });
    }

    if (status === 'success' && options.importSuccess) {
      const stats = await importer.importResults(source, output.results);
      result.imported = {
        created: stats.created,
        updated: stats.updated,
        duplicates: stats.duplicates,
      };
    }

    return result;
  } catch (error) {
    return {
      name: source.name,
      tenderUrl: source.tenderUrl,
      sourceType: source.sourceType,
      province: source.province ?? null,
      scrapeMethod: source.scrapeMethod,
      status: 'failed',
      found: 0,
      sampleTitles: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

function sample(results: ExternalTenderResult[]) {
  return results
    .map((result) => result.title)
    .filter((title): title is string => Boolean(title))
    .slice(0, 3);
}

function summarize(results: ValidationResult[]) {
  const success = results.filter((result) => result.status === 'success');
  const empty = results.filter((result) => result.status === 'empty');
  const failed = results.filter((result) => result.status === 'failed');

  return {
    checked: results.length,
    success: success.length,
    empty: empty.length,
    failed: failed.length,
    tendersFound: results.reduce((total, result) => total + result.found, 0),
    successfulSites: success.map((result) => result.name),
  };
}

function parseOptions(argv: string[]) {
  const options = {
    start: 0,
    limit: Number.MAX_SAFE_INTEGER,
    activateSuccess: false,
    importSuccess: false,
    output: 'prisma/external-source-validation-results.json',
  };

  for (const arg of argv) {
    const [key, value] = arg.split('=');
    if (key === '--start') options.start = Number(value || 0);
    if (key === '--limit') options.limit = Number(value || options.limit);
    if (key === '--output' && value) options.output = value;
    if (key === '--activate-success') options.activateSuccess = true;
    if (key === '--import-success') options.importSuccess = true;
  }

  return options;
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
