/**
 * One-way sync: Turso production -> local SQLite.
 *
 * Reads every row from the shared data tables on Turso and replaces the same
 * tables in ./data/scrims.db. Read-only on Turso; destructive on local (a
 * timestamped backup is written first).
 *
 * Usage:
 *   npm run db:sync-local
 *
 * Env (put in .env or .env.local — names are distinct from the app's own
 * TURSO_DATABASE_URL so this script never affects the running dev server):
 *   SYNC_TURSO_URL    e.g. libsql://scrim-db-megumenz.aws-ap-northeast-1.turso.io
 *   SYNC_TURSO_TOKEN  Turso auth token with read access
 */
import { createClient } from "@libsql/client";
import { copyFileSync, existsSync } from "node:fs";

const LOCAL_PATH = "./data/scrims.db";
const LOCAL_URL = `file:${LOCAL_PATH}`;

// Parents first for inserts; reversed for deletes.
const DATA_TABLES = [
  "players",
  "matches",
  "match_player_stats",
  "opponent_match_player_stats",
];

const INSERT_CHUNK = 200;

function readEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing ${name}. Add it to .env (or .env.local), then run: npm run db:sync-local`,
    );
  }
  return value;
}

function backupLocalDb() {
  if (!existsSync(LOCAL_PATH)) {
    throw new Error(
      `Local DB not found at ${LOCAL_PATH}. Start the dev server once to create it.`,
    );
  }
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const base = `${LOCAL_PATH}.${stamp}.bak`;
  for (const suffix of ["", "-wal", "-shm"]) {
    const src = LOCAL_PATH + suffix;
    if (existsSync(src)) copyFileSync(src, base + suffix);
  }
  console.log(`[backup] ${base}`);
}

async function listTables(client) {
  const result = await client.execute(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'",
  );
  return new Set(result.rows.map((row) => String(row.name)));
}

async function readTable(client, table) {
  const result = await client.execute(`SELECT * FROM ${table}`);
  return { columns: result.columns, rows: result.rows };
}

async function writeTable(client, table, columns, rows) {
  if (rows.length === 0) return;
  const columnList = columns.join(", ");
  const rowPlaceholder = `(${columns.map(() => "?").join(", ")})`;
  for (let i = 0; i < rows.length; i += INSERT_CHUNK) {
    const chunk = rows.slice(i, i + INSERT_CHUNK);
    const values = chunk.map(() => rowPlaceholder).join(", ");
    const args = chunk.flatMap((row) => columns.map((col) => row[col] ?? null));
    await client.execute({
      sql: `INSERT INTO ${table} (${columnList}) VALUES ${values}`,
      args,
    });
  }
}

async function main() {
  const remoteUrl = readEnv("SYNC_TURSO_URL");
  const remoteToken = readEnv("SYNC_TURSO_TOKEN");

  if (!/^(libsql|https):\/\//.test(remoteUrl)) {
    throw new Error(
      "SYNC_TURSO_URL must be a remote libsql:// or https:// URL.",
    );
  }

  backupLocalDb();

  const remote = createClient({ url: remoteUrl, authToken: remoteToken });
  const local = createClient({ url: LOCAL_URL });

  const [remoteTables, localTables] = await Promise.all([
    listTables(remote),
    listTables(local),
  ]);

  const tables = DATA_TABLES.filter(
    (name) => remoteTables.has(name) && localTables.has(name),
  );

  if (tables.length === 0) {
    throw new Error("No shared data tables found between Turso and local DB.");
  }
  console.log(`[sync] tables: ${tables.join(", ")}`);

  await local.execute("BEGIN");
  try {
    for (const table of [...tables].reverse()) {
      await local.execute(`DELETE FROM ${table}`);
    }
    for (const table of tables) {
      const { columns, rows } = await readTable(remote, table);
      await writeTable(local, table, columns, rows);
      console.log(`[sync] ${table}: ${rows.length} rows`);
    }
    await local.execute("COMMIT");
  } catch (error) {
    await local.execute("ROLLBACK");
    throw error;
  }

  console.log("[done] local DB now mirrors Turso data tables.");
}

main().catch((error) => {
  console.error(`[error] ${error.message}`);
  process.exit(1);
});
