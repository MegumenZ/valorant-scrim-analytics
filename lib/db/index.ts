import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";
import fs from "fs";
import path from "path";

const url = process.env.TURSO_DATABASE_URL || "file:./data/scrims.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

// Ensure local data directory exists if using local SQLite file
if (url.startsWith("file:")) {
  const filePath = url.replace("file:", "");
  const dir = path.dirname(path.resolve(filePath));
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export const client = createClient({
  url,
  authToken,
});

export const db = drizzle(client, { schema });

// In-memory initialization cache to prevent duplicate remote round-trips
let isInitialized = false;
let initPromise: Promise<void> | null = null;

export async function ensureDbInitialized() {
  if (isInitialized) return;

  if (!initPromise) {
    initPromise = (async () => {
      try {
        // Execute all table creations and indexes in a SINGLE batch network round-trip
        await client.batch([
          `CREATE TABLE IF NOT EXISTS system_metadata (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
          )`,
          `CREATE TABLE IF NOT EXISTS players (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            riot_id TEXT,
            primary_role TEXT NOT NULL DEFAULT 'Flex',
            discord_id TEXT,
            is_active INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
          )`,
          `CREATE TABLE IF NOT EXISTS matches (
            id TEXT PRIMARY KEY,
            match_date TEXT NOT NULL,
            map TEXT NOT NULL,
            opponent_name TEXT NOT NULL,
            score_team INTEGER NOT NULL,
            score_opponent INTEGER NOT NULL,
            result TEXT NOT NULL,
            start_side TEXT NOT NULL DEFAULT 'ATTACK',
            vod_url TEXT,
            notes TEXT,
            attachments TEXT,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
          )`,
          `CREATE TABLE IF NOT EXISTS match_player_stats (
            id TEXT PRIMARY KEY,
            match_id TEXT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
            player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
            agent TEXT NOT NULL,
            acs INTEGER NOT NULL,
            kills INTEGER NOT NULL,
            deaths INTEGER NOT NULL,
            assists INTEGER NOT NULL,
            adr REAL NOT NULL,
            hs_percent REAL,
            first_kills INTEGER NOT NULL DEFAULT 0,
            first_deaths INTEGER NOT NULL DEFAULT 0,
            clutches_won INTEGER NOT NULL DEFAULT 0,
            kast_percent REAL
          )`,
          `CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            discord_id TEXT NOT NULL UNIQUE,
            username TEXT NOT NULL,
            global_name TEXT,
            avatar TEXT,
            role TEXT NOT NULL DEFAULT 'MEMBER',
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
          )`,
          `CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            expires_at INTEGER NOT NULL,
            ip_address TEXT,
            user_agent TEXT,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
          )`,
          `CREATE UNIQUE INDEX IF NOT EXISTS match_player_unique_idx ON match_player_stats (match_id, player_id)`,
          `CREATE INDEX IF NOT EXISTS match_date_idx ON matches (match_date)`,
          `CREATE INDEX IF NOT EXISTS match_map_idx ON matches (map)`,
          `CREATE INDEX IF NOT EXISTS stats_match_idx ON match_player_stats (match_id)`,
          `CREATE INDEX IF NOT EXISTS stats_player_idx ON match_player_stats (player_id)`,
          `CREATE UNIQUE INDEX IF NOT EXISTS users_discord_id_idx ON users (discord_id)`,
          `CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions (user_id)`,
        ]);

        // Non-destructive column addition for existing database files
        try {
          await client.execute("ALTER TABLE matches ADD COLUMN attachments TEXT;");
        } catch {
          // Column already exists, safe to ignore
        }

        // Check if initial seeding has already been performed in the past
        const seedCheck = await client.execute("SELECT value FROM system_metadata WHERE key = 'seeded'");
        const alreadySeeded = seedCheck.rows.length > 0;

        if (!alreadySeeded) {
          // Check player count as secondary guard
          const countResult = await client.execute("SELECT count(*) as count FROM players");
          const rowCount = Number(countResult.rows[0]?.count || 0);
          
          if (rowCount === 0) {
            const { seedInitialData } = await import("./seed");
            await seedInitialData();
          }

          // Mark seed as completed permanently so user deletions are never overwritten
          await client.execute("INSERT OR REPLACE INTO system_metadata (key, value) VALUES ('seeded', 'true')");
        }

        isInitialized = true;
      } catch (err) {
        console.error("Database initialization error:", err);
        // Reset promise on error so retry is possible
        initPromise = null;
        throw err;
      }
    })();
  }

  await initPromise;
}
