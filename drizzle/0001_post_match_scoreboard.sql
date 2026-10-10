CREATE TABLE match_player_stats_new (
  id TEXT PRIMARY KEY NOT NULL,
  match_id TEXT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  agent TEXT NOT NULL,
  acs INTEGER,
  kills INTEGER NOT NULL,
  deaths INTEGER NOT NULL,
  assists INTEGER NOT NULL,
  adr REAL,
  hs_percent REAL,
  first_kills INTEGER NOT NULL DEFAULT 0,
  first_deaths INTEGER,
  clutches_won INTEGER,
  kast_percent REAL,
  plants INTEGER,
  defuses INTEGER
);
--> statement-breakpoint
INSERT INTO match_player_stats_new (id, match_id, player_id, agent, acs, kills, deaths, assists, adr, hs_percent, first_kills, first_deaths, clutches_won, kast_percent)
SELECT id, match_id, player_id, agent, acs, kills, deaths, assists, adr, hs_percent, first_kills, first_deaths, clutches_won, kast_percent FROM match_player_stats;
--> statement-breakpoint
DROP TABLE match_player_stats;
--> statement-breakpoint
ALTER TABLE match_player_stats_new RENAME TO match_player_stats;
--> statement-breakpoint
CREATE UNIQUE INDEX match_player_unique_idx ON match_player_stats (match_id, player_id);
--> statement-breakpoint
CREATE INDEX stats_match_idx ON match_player_stats (match_id);
--> statement-breakpoint
CREATE INDEX stats_player_idx ON match_player_stats (player_id);
--> statement-breakpoint
CREATE TABLE opponent_match_player_stats (
  id TEXT PRIMARY KEY NOT NULL,
  match_id TEXT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  agent TEXT NOT NULL,
  kills INTEGER NOT NULL,
  deaths INTEGER NOT NULL,
  assists INTEGER NOT NULL,
  first_kills INTEGER NOT NULL DEFAULT 0,
  plants INTEGER NOT NULL DEFAULT 0,
  defuses INTEGER NOT NULL DEFAULT 0
);
--> statement-breakpoint
CREATE INDEX opponent_stats_match_idx ON opponent_match_player_stats (match_id);
--> statement-breakpoint
ALTER TABLE matches ADD COLUMN attachments TEXT;
--> statement-breakpoint
ALTER TABLE matches ADD COLUMN round_timeline TEXT;
--> statement-breakpoint
ALTER TABLE matches ADD COLUMN idempotency_key TEXT;
--> statement-breakpoint
CREATE UNIQUE INDEX matches_idempotency_key_idx ON matches (idempotency_key);
