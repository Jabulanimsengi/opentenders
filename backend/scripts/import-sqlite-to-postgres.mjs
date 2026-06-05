import { DatabaseSync } from 'node:sqlite';
import { PrismaClient } from '@prisma/client';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const prisma = new PrismaClient();

const DATA_TABLES = [
  'Tender',
  'User',
  'TenderSource',
  'Organization',
  'Subscription',
  'OrganizationMember',
  'EmailVerificationToken',
  'Award',
  'SavedSearch',
  'Bookmark',
  'TenderNote',
  'ExternalScrapeRun',
  'ExternalScrapeError',
  'ExternalTenderChangeLog',
];

const BOOLEAN_COLUMNS = new Set([
  'Tender.briefingCompulsory',
  'TenderSource.active',
  'SavedSearch.alertsEnabled',
]);

const DATE_TIME_COLUMNS = new Set([
  'Tender.publishedDate',
  'Tender.closingDate',
  'Tender.briefingDate',
  'Tender.scrapedAt',
  'Tender.createdAt',
  'Tender.updatedAt',
  'Award.date',
  'Award.createdAt',
  'User.emailVerifiedAt',
  'User.createdAt',
  'Subscription.startDate',
  'Subscription.endDate',
  'Subscription.createdAt',
  'Subscription.updatedAt',
  'Organization.createdAt',
  'Organization.updatedAt',
  'OrganizationMember.joinedAt',
  'OrganizationMember.createdAt',
  'OrganizationMember.updatedAt',
  'EmailVerificationToken.expiresAt',
  'EmailVerificationToken.usedAt',
  'EmailVerificationToken.createdAt',
  'SavedSearch.lastAlertedAt',
  'SavedSearch.createdAt',
  'Bookmark.createdAt',
  'TenderNote.createdAt',
  'TenderNote.updatedAt',
  'TenderSource.lastScrapedAt',
  'TenderSource.createdAt',
  'TenderSource.updatedAt',
  'ExternalScrapeRun.startedAt',
  'ExternalScrapeRun.finishedAt',
  'ExternalScrapeError.createdAt',
  'ExternalTenderChangeLog.createdAt',
]);

const BATCH_SIZE = Number(process.env.SQLITE_IMPORT_BATCH_SIZE || 250);

function quoteIdentifier(identifier) {
  return `"${identifier.replaceAll('"', '""')}"`;
}

function normalizeValue(table, column, value) {
  if (value === undefined) return null;
  if (value === null) return null;
  if (BOOLEAN_COLUMNS.has(`${table}.${column}`)) return Boolean(value);
  if (DATE_TIME_COLUMNS.has(`${table}.${column}`)) {
    if (typeof value === 'number') return new Date(value);
    return new Date(value);
  }
  return value;
}

function getSqliteColumns(db, table) {
  return db
    .prepare(`PRAGMA table_info(${quoteIdentifier(table)})`)
    .all()
    .map((column) => column.name);
}

function sqliteTableExists(db, table) {
  return Boolean(
    db
      .prepare(
        `SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`,
      )
      .get(table),
  );
}

async function getPostgresColumns(table) {
  const rows = await prisma.$queryRawUnsafe(
    `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
      ORDER BY ordinal_position
    `,
    table,
  );
  return rows.map((row) => row.column_name);
}

function getSqliteCount(db, table) {
  return db
    .prepare(`SELECT COUNT(*) AS count FROM ${quoteIdentifier(table)}`)
    .get().count;
}

async function getPostgresCount(table) {
  const rows = await prisma.$queryRawUnsafe(
    `SELECT COUNT(*)::int AS count FROM ${quoteIdentifier(table)}`,
  );
  return rows[0]?.count || 0;
}

async function truncatePostgresTables() {
  const tableList = DATA_TABLES.map(quoteIdentifier).join(', ');
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tableList} CASCADE`);
}

async function insertRows(table, columns, rows) {
  if (!rows.length) return;

  const quotedColumns = columns.map(quoteIdentifier).join(', ');
  const values = [];
  const rowPlaceholders = rows.map((row) => {
    const placeholders = columns.map((column) => {
      values.push(normalizeValue(table, column, row[column]));
      return `$${values.length}`;
    });
    return `(${placeholders.join(', ')})`;
  });

  await prisma.$executeRawUnsafe(
    `INSERT INTO ${quoteIdentifier(table)} (${quotedColumns}) VALUES ${rowPlaceholders.join(', ')}`,
    ...values,
  );
}

async function importTable(db, table) {
  if (!sqliteTableExists(db, table)) {
    console.log(`${table}: skipped, table does not exist in SQLite`);
    return;
  }

  const sqliteColumns = getSqliteColumns(db, table);
  const postgresColumns = await getPostgresColumns(table);
  const columns = postgresColumns.filter((column) =>
    sqliteColumns.includes(column),
  );
  const total = getSqliteCount(db, table);

  if (!columns.length) {
    console.log(`${table}: skipped, no shared columns`);
    return;
  }

  for (let offset = 0; offset < total; offset += BATCH_SIZE) {
    const rows = db
      .prepare(
        `SELECT ${columns.map(quoteIdentifier).join(', ')}
         FROM ${quoteIdentifier(table)}
         LIMIT ? OFFSET ?`,
      )
      .all(BATCH_SIZE, offset);
    await insertRows(table, columns, rows);
  }

  const imported = await getPostgresCount(table);
  console.log(`${table}: ${imported}/${total} rows imported`);
}

async function main() {
  const sqlitePath = resolve(
    process.argv[2] || process.env.SQLITE_DATABASE_PATH || 'prisma/dev.db',
  );

  if (!existsSync(sqlitePath)) {
    throw new Error(`SQLite database not found: ${sqlitePath}`);
  }

  console.log(`Importing SQLite data from ${sqlitePath}`);
  console.log('Truncating PostgreSQL data tables...');
  await truncatePostgresTables();

  const db = new DatabaseSync(sqlitePath, { readOnly: true });
  try {
    for (const table of DATA_TABLES) {
      await importTable(db, table);
    }
  } finally {
    db.close();
  }

  console.log('SQLite to PostgreSQL import completed.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
