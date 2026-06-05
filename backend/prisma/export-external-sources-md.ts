import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { PrismaClient } from '@prisma/client';
import { southAfricanExternalSources } from './south-african-external-sources';

type SourceForMarkdown = {
  name: string;
  sourceType: string;
  province: string | null;
  scrapeMethod: string;
  active: boolean;
  tenderUrl: string;
};

const prisma = new PrismaClient();
const outputPath = join(
  process.cwd(),
  '..',
  'docs',
  'external-tender-sources.md',
);

async function main() {
  const dbSources = await prisma.tenderSource.findMany({
    orderBy: [{ active: 'desc' }, { sourceType: 'asc' }, { name: 'asc' }],
    select: {
      name: true,
      sourceType: true,
      province: true,
      scrapeMethod: true,
      active: true,
      tenderUrl: true,
    },
  });
  const sources: SourceForMarkdown[] =
    dbSources.length > 0
      ? dbSources
      : southAfricanExternalSources.map((source) => ({
          name: source.name,
          sourceType: source.sourceType,
          province: source.province,
          scrapeMethod: source.scrapeMethod,
          active: source.active,
          tenderUrl: source.tenderUrl,
        }));

  const activeCount = sources.filter((source) => source.active).length;
  const domains = new Set(
    sources.map((source) => new URL(source.tenderUrl).hostname),
  );

  const lines = [
    '# External Tender Sources',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    `Total sources: ${sources.length}`,
    `Active validated sources: ${activeCount}`,
    `Unique domains: ${domains.size}`,
    '',
    'Sources are kept inactive until they pass live validation. Active sources are the ones currently eligible for scheduled scraping.',
    '',
    '| # | Active | Type | Province | Method | Source | URL |',
    '|---:|:---:|---|---|---|---|---|',
    ...sources.map((source, index) =>
      [
        index + 1,
        source.active ? 'Yes' : 'No',
        escapeMarkdown(source.sourceType),
        escapeMarkdown(source.province || 'National / Multiple'),
        escapeMarkdown(source.scrapeMethod),
        escapeMarkdown(source.name),
        `[Open](${source.tenderUrl})`,
      ].join(' | '),
    ),
    '',
  ];

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${lines.join('\n')}\n`);
  console.log(`Wrote ${sources.length} sources to ${outputPath}`);
}

function escapeMarkdown(value: string) {
  return value.replace(/\|/g, '\\|');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
