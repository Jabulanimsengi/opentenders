import { PrismaClient } from '@prisma/client';
import {
  inferTenderCategory,
  isGenericTenderCategory,
  normaliseTenderCategory,
} from '../src/tenders/tender-categories';

const prisma = new PrismaClient();

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const forceSpecific = process.argv.includes('--force-specific');
  const tenders = await prisma.tender.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      eligibilityCriteria: true,
      specialConditions: true,
      submissionMethod: true,
      tenderNumber: true,
      referenceNumber: true,
      rawData: true,
    },
  });

  let updated = 0;
  let kept = 0;
  let unclassified = 0;
  let skippedSpecific = 0;

  for (const tender of tenders) {
    const currentCategory = tender.category || null;
    const inferred = inferTenderCategory(
      [
        tender.title,
        tender.description,
        tender.eligibilityCriteria,
        tender.specialConditions,
        tender.submissionMethod,
        tender.tenderNumber,
        tender.referenceNumber,
        extractCategoryTextFromRawData(tender.rawData),
      ]
        .filter(Boolean)
        .join(' | '),
    );
    const legacyNormalised = normaliseTenderCategory(currentCategory);
    const nextCategory = inferred || legacyNormalised || null;
    const hasSpecificCategory =
      Boolean(currentCategory) &&
      !isGenericTenderCategory(currentCategory) &&
      !legacyNormalised;

    if (!nextCategory && !isGenericTenderCategory(currentCategory)) {
      unclassified++;
      continue;
    }

    if (nextCategory === currentCategory) {
      kept++;
      continue;
    }

    if (hasSpecificCategory && inferred && inferred !== currentCategory) {
      if (!forceSpecific) {
        skippedSpecific++;
        continue;
      }
    }

    if (!dryRun) {
      await prisma.tender.update({
        where: { id: tender.id },
        data: { category: nextCategory },
      });
    }
    updated++;
  }

  console.log(
    JSON.stringify(
      {
        scanned: tenders.length,
        updated,
        kept,
        unclassified,
        skippedSpecific,
        dryRun,
        forceSpecific,
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

function extractCategoryTextFromRawData(rawData?: string | null) {
  if (!rawData) return '';

  try {
    const parsed = JSON.parse(rawData);
    return [
      parsed?.rawText,
      parsed?.tender?.title,
      parsed?.tender?.description,
      parsed?.tender?.eligibilityCriteria,
      parsed?.tender?.specialConditions,
      Array.isArray(parsed?.tender?.submissionMethod)
        ? parsed.tender.submissionMethod.join(' ')
        : parsed?.tender?.submissionMethod,
      parsed?.tender?.mainProcurementCategory,
    ]
      .filter((value): value is string => typeof value === 'string')
      .join(' | ');
  } catch {
    return '';
  }
}
