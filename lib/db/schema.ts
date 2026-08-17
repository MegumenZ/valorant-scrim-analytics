import { sqliteTable, text, integer, real, uniqueIndex, index } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

// 1. PLAYERS TABLE
export const players = sqliteTable("players", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  riotId: text("riot_id"),
  primaryRole: text("primary_role", {
    enum: ["Duelist", "Initiator", "Controller", "Sentinel", "Flex"],
  }).notNull().default("Flex"),
  discordId: text("discord_id"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// 2. MATCHES TABLE
export const matches = sqliteTable("matches", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  matchDate: text("match_date").notNull(),
  map: text("map", {
    enum: ["Ascent", "Bind", "Haven", "Split", "Icebox", "Breeze", "Lotus", "Sunset", "Abyss"],
  }).notNull(),
  opponentName: text("opponent_name").notNull(),
  scoreTeam: integer("score_team").notNull(),
  scoreOpponent: integer("score_opponent").notNull(),
  result: text("result", { enum: ["WIN", "LOSS", "DRAW"] }).notNull(),
  startSide: text("start_side", { enum: ["ATTACK", "DEFENSE"] }).notNull().default("ATTACK"),
  vodUrl: text("vod_url"),
  notes: text("notes"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
  index("match_date_idx").on(table.matchDate),
  index("match_map_idx").on(table.map),
]);

// 3. MATCH_PLAYER_STATS TABLE
export const matchPlayerStats = sqliteTable("match_player_stats", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  matchId: text("match_id").notNull().references(() => matches.id, { onDelete: "cascade" }),
  playerId: text("player_id").notNull().references(() => players.id, { onDelete: "cascade" }),
  agent: text("agent").notNull(),
  acs: integer("acs").notNull(),
  kills: integer("kills").notNull(),
  deaths: integer("deaths").notNull(),
  assists: integer("assists").notNull(),
  adr: real("adr").notNull(),
  hsPercent: real("hs_percent"),
  firstKills: integer("first_kills").default(0).notNull(),
  firstDeaths: integer("first_deaths").default(0).notNull(),
  clutchesWon: integer("clutches_won").default(0).notNull(),
  kastPercent: real("kast_percent"),
}, (table) => [
  uniqueIndex("match_player_unique_idx").on(table.matchId, table.playerId),
  index("stats_match_idx").on(table.matchId),
  index("stats_player_idx").on(table.playerId),
]);

// RELATIONS
export const playersRelations = relations(players, ({ many }) => ({
  stats: many(matchPlayerStats),
}));

export const matchesRelations = relations(matches, ({ many }) => ({
  playerStats: many(matchPlayerStats),
}));

export const matchPlayerStatsRelations = relations(matchPlayerStats, ({ one }) => ({
  match: one(matches, {
    fields: [matchPlayerStats.matchId],
    references: [matches.id],
  }),
  player: one(players, {
    fields: [matchPlayerStats.playerId],
    references: [players.id],
  }),
}));

export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert;

export type Match = typeof matches.$inferSelect;
export type NewMatch = typeof matches.$inferInsert;

export type MatchPlayerStat = typeof matchPlayerStats.$inferSelect;
export type NewMatchPlayerStat = typeof matchPlayerStats.$inferInsert;
