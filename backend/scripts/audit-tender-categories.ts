import { mkdir, writeFile } from 'fs/promises';
import { dirname, resolve } from 'path';
import { PrismaClient } from '@prisma/client';
import {
  inferTenderCategory,
  isGenericTenderCategory,
  TENDER_CATEGORIES,
} from '../src/tenders/tender-categories';

const prisma = new PrismaClient();

type TenderCategoryAuditItem = {
  id: string;
  title: string;
  currentCategory: string;
  suggestedCategory: string;
  sourceName: string | null;
};

async function main() {
  const reportPath = resolve(
    process.cwd(),
    process.argv.find((arg) => arg.startsWith('--report='))?.slice(9) ||
      '../docs/tender-category-audit.md',
  );

  const tenders = await prisma.tender.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      sourceName: true,
    },
    orderBy: { updatedAt: 'desc' },
  });

  const conflicts: TenderCategoryAuditItem[] = [];
  const genericSuggestions: TenderCategoryAuditItem[] = [];
  const inferredCounts = new Map<string, number>();
  const currentCounts = new Map<string, number>();
  let unclassified = 0;

  for (const tender of tenders) {
    const currentCategory = tender.category || 'General';
    increment(currentCounts, currentCategory);

    const suggestedCategory = inferTenderCategory(
      [tender.title, tender.description].filter(Boolean).join(' | '),
    );

    if (!suggestedCategory) {
      unclassified++;
      continue;
    }

    increment(inferredCounts, suggestedCategory);

    if (currentCategory === suggestedCategory) continue;

    const item = {
      id: tender.id,
      title: tender.title,
      currentCategory,
      suggestedCategory,
      sourceName: tender.sourceName,
    };

    if (isGenericTenderCategory(currentCategory)) {
      genericSuggestions.push(item);
    } else {
      conflicts.push(item);
    }
  }

  const report = buildReport({
    total: tenders.length,
    unclassified,
    conflicts,
    genericSuggestions,
    currentCounts,
    inferredCounts,
  });

  await mkdir(dirname(reportPath), { recursive: true });
  await writeFile(reportPath, report);

  console.log(
    JSON.stringify(
      {
        total: tenders.length,
        conflicts: conflicts.length,
        genericSuggestions: genericSuggestions.length,
        unclassified,
        reportPath,
      },
      null,
      2,
    ),
  );
}

function increment(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) || 0) + 1);
}

function buildReport(input: {
  total: number;
  unclassified: number;
  conflicts: TenderCategoryAuditItem[];
  genericSuggestions: TenderCategoryAuditItem[];
  currentCounts: Map<string, number>;
  inferredCounts: Map<string, number>;
}) {
  const lines = [
    '# Tender Category Audit',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Summary',
    '',
    `- Total tenders scanned: ${input.total}`,
    `- High-confidence category conflicts: ${input.conflicts.length}`,
    `- Generic categories with better suggestions: ${input.genericSuggestions.length}`,
    `- No high-confidence category detected: ${input.unclassified}`,
    `- Taxonomy categories available: ${TENDER_CATEGORIES.length}`,
    '',
    '## Current Category Counts',
    '',
    ...formatCounts(input.currentCounts),
    '',
    '## Suggested Category Counts',
    '',
    ...formatCounts(input.inferredCounts),
    '',
    '## High-Confidence Conflicts',
    '',
    ...formatItems(input.conflicts),
    '',
    '## Generic Categories With Better Suggestions',
    '',
    ...formatItems(input.genericSuggestions),
    '',
  ];

  return `${lines.join('\n')}\n`;
}

function formatCounts(counts: Map<string, number>) {
  const rows = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  if (rows.length === 0) return ['No categories found.'];
  return [
    '| Category | Count |',
    '| --- | ---: |',
    ...rows.map(
      ([category, count]) => `| ${escapeCell(category)} | ${count} |`,
    ),
  ];
}

function formatItems(items: TenderCategoryAuditItem[]) {
  if (items.length === 0) return ['No items found.'];

  return [
    '| Current | Suggested | Source | Title | ID |',
    '| --- | --- | --- | --- | --- |',
    ...items
      .slice(0, 250)
      .map(
        (item) =>
          `| ${escapeCell(item.currentCategory)} | ${escapeCell(item.suggestedCategory)} | ${escapeCell(item.sourceName || '')} | ${escapeCell(item.title)} | ${item.id} |`,
      ),
    items.length > 250 ? `\nShowing first 250 of ${items.length}.` : '',
  ].filter(Boolean);
}

function escapeCell(value: string) {
  return value.replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
