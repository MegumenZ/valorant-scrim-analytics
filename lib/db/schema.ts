import { sqliteTable, text, integer, real, uniqueIndex, index } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

// 1. PLAYERS TABLE (Roster Tracked Players)
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
  attachments: text("attachments"), // JSON stringified array of MatchAttachment
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

// 4. USERS TABLE (Authenticated Discord OAuth Users)
export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  discordId: text("discord_id").notNull().unique(),
  username: text("username").notNull(),
  globalName: text("global_name"),
  avatar: text("avatar"),
  role: text("role", { enum: ["ADMIN", "COACH", "MEMBER"] }).notNull().default("MEMBER"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
  uniqueIndex("users_discord_id_idx").on(table.discordId),
]);

// 5. SESSIONS TABLE
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
  index("sessions_user_id_idx").on(table.userId),
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

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert;

export type Match = typeof matches.$inferSelect;
export type NewMatch = typeof matches.$inferInsert;

export type MatchPlayerStat = typeof matchPlayerStats.$inferSelect;
export type NewMatchPlayerStat = typeof matchPlayerStats.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export interface MatchAttachment {
  id: string;
  name: string;
  type: "image" | "pdf";
  mimeType: string;
  dataUrl: string;
  sizeBytes: number;
  originalSize: number;
  uploadedAt: string;
}
