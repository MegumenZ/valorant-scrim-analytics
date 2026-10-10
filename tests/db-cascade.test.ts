import { afterEach, describe, expect, it } from "vitest";
import { createClient, type Client } from "@libsql/client";

describe("SQLite foreign key behavior", () => {
  let client: Client | undefined;

  afterEach(() => client?.close());

  it("enables foreign keys and cascades match deletion to both stat tables", async () => {
    client = createClient({ url: "file::memory:" });
    await client.execute("PRAGMA foreign_keys = ON");
    const pragma = await client.execute("PRAGMA foreign_keys");
    expect(Number(pragma.rows[0]?.foreign_keys)).toBe(1);

    await client.batch([
      "CREATE TABLE matches (id TEXT PRIMARY KEY, idempotency_key TEXT UNIQUE)",
      "CREATE TABLE players (id TEXT PRIMARY KEY)",
      "CREATE TABLE match_player_stats (id TEXT PRIMARY KEY, match_id TEXT NOT NULL REFERENCES matches(id) ON DELETE CASCADE, player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE)",
      "CREATE TABLE opponent_match_player_stats (id TEXT PRIMARY KEY, match_id TEXT NOT NULL REFERENCES matches(id) ON DELETE CASCADE)",
      "INSERT INTO matches VALUES ('match-1', 'retry-key')",
      "INSERT INTO players VALUES ('player-1')",
      "INSERT INTO match_player_stats VALUES ('team-stat-1', 'match-1', 'player-1')",
      "INSERT INTO opponent_match_player_stats VALUES ('opponent-stat-1', 'match-1')",
    ]);
    await expect(client.execute("INSERT INTO matches VALUES ('duplicate', 'retry-key')")).rejects.toThrow();
    await client.execute("DELETE FROM matches WHERE id = 'match-1'");
    const [teamStats, opponentStats] = await Promise.all([
      client.execute("SELECT COUNT(*) AS count FROM match_player_stats WHERE match_id = 'match-1'"),
      client.execute("SELECT COUNT(*) AS count FROM opponent_match_player_stats WHERE match_id = 'match-1'"),
    ]);
    expect(Number(teamStats.rows[0]?.count)).toBe(0);
    expect(Number(opponentStats.rows[0]?.count)).toBe(0);
  });
});
