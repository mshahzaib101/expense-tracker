import { Client } from 'pg';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

function escapeIdentifier(value) {
  return `"${value.replaceAll('"', '""')}"`;
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required for e2e database setup.');
  }

  const targetUrl = new URL(databaseUrl);
  const databaseName = targetUrl.pathname.replace(/^\//, '');

  if (!databaseName) {
    throw new Error('DATABASE_URL must include a database name.');
  }

  const adminUrl = new URL(databaseUrl);
  adminUrl.pathname = '/postgres';
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const migrationPath = resolve(
    scriptDir,
    '../prisma/migrations/20260325161225_init/migration.sql',
  );
  const migrationSql = await readFile(migrationPath, 'utf8');

  const client = new Client({
    connectionString: adminUrl.toString(),
  });

  await client.connect();

  try {
    await client.query(
      `
        SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity
        WHERE datname = $1
          AND pid <> pg_backend_pid()
      `,
      [databaseName],
    );

    await client.query(`DROP DATABASE IF EXISTS ${escapeIdentifier(databaseName)}`);
    await client.query(`CREATE DATABASE ${escapeIdentifier(databaseName)}`);
  } finally {
    await client.end();
  }

  const targetClient = new Client({
    connectionString: databaseUrl,
  });

  await targetClient.connect();

  try {
    await targetClient.query(migrationSql);
  } finally {
    await targetClient.end();
  }
}

await main();
