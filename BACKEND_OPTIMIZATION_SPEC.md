# Specification & Implementation Guide: Backend Optimization (Turso + Drizzle + Next.js)

Dokumen ini ditujukan sebagai instruksi langsung dan referensi terstruktur untuk **AI Coding Agent** (Cursor, Windsurf, Claude Code, GitHub Copilot Workspace, dsb.) dalam mengimplementasikan perubahan backend pada repositori **Valorant Scrim Analytics**.

---

## 1. System Architecture & Constraints Overview

| Komponen | Teknologi | Pola Implementasi & Batasan |
| :--- | :--- | :--- |
| **Framework** | Next.js 14/15/16 (App Router) | Server Actions untuk mutasi (`lib/actions/`), Route Handlers untuk OAuth/API (`app/api/`). |
| **Database** | Turso (libSQL / SQLite via HTTP) | Stateless HTTP driver (bebas masalah connection pool exhaustion di Serverless). |
| **ORM** | Drizzle ORM (`drizzle-orm/libsql`) | Relational queries (`db.query`), explicit relations, batch mutations (`db.batch`). |
| **Hosting** | Vercel Serverless Functions | Ephemeral memory (no long-lived in-memory state), direct IP extraction. |
| **Rate Limiter** | Upstash Redis (`@upstash/ratelimit`) | REST-based sliding window (stateful multi-instance, free 500k cmd/mo). |
| **Primary Keys** | CUID2 (`@paralleldrive/cuid2`) | Application-generated string PKs untuk memungkinkan batch insert relasional dalam 1 roundtrip. |

---

## 2. Technical Constraints & Critical Rules for AI Agent

1. **Single Roundtrip Rule for `db.batch()`**:
   * Drizzle `db.batch()` mengeksekusi multiple query secara sequential dalam 1 transaksi implicit via 1 HTTP roundtrip ke Turso.
   * `db.batch()` **TIDAK MENDUKUNG** query chaining/piping ID (tidak bisa memakai `.returning({ id })` dari query 1 ke query 2 di batch yang sama).
   * **Wajib**: Generate semua PK (`matchId`, `playerStatId`, `roundDetailId`) di level aplikasi menggunakan `createId()` sebelum batch query disusun.
2. **Server Action Error Boundaries**:
   * Jangan gunakan `schema.parse()` yang melempar exception fatal.
   * **Wajib**: Gunakan `schema.safeParse()` dan bungkus `db.batch()` dalam blok `try/catch`.
   * Kembalikan format seragam `ActionResponse<T>`.
3. **Array Mapping Integrity**:
   * Baik data pemain (`players`) maupun ronde (`rounds`) adalah array `N` baris.
   * **Wajib**: Gunakan `.map()` untuk memetakan setiap entri ke dalam statement `db.insert(...)` individual di dalam `db.batch([])`.
4. **Next.js Caching Invalidation Signature**:
   * Pemanggilan `revalidateTag` wajib menggunakan signature 2 argumen: `revalidateTag(tag, 'max')` untuk mencegah peringatan deprecation.

---

## 3. Step-by-Step File Implementation

### File 1: `lib/types/action.ts`
*Tujuan: Standarisasi kontrak return seluruh Server Actions untuk integrasi aman dengan React frontend.*

```typescript
export type ActionResponse<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string[]>;
    };
```

---

### File 2: `lib/db/schema.ts`
*Tujuan: Definisikan skema SQLite dengan PK berbasis teks, integer mode (timestamp & boolean), serta relasi antar entitas.*

```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// Tabel Matches
export const matches = sqliteTable('matches', {
  id: text('id').primaryKey(),
  mapName: text('map_name').notNull(),
  opponentTeam: text('opponent_team').notNull(),
  teamScore: integer('team_score').notNull(),
  opponentScore: integer('opponent_score').notNull(),
  isWin: integer('is_win', { mode: 'boolean' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// Tabel Player Stats (5 pemain per match)
export const playerStats = sqliteTable('player_stats', {
  id: text('id').primaryKey(),
  matchId: text('match_id')
    .notNull()
    .references(() => matches.id, { onDelete: 'cascade' }),
  playerId: text('player_id').notNull(),
  agent: text('agent').notNull(),
  kills: integer('kills').notNull(),
  deaths: integer('deaths').notNull(),
  assists: integer('assists').notNull(),
  acs: integer('acs').notNull(),
});

// Tabel Round Details (13-25 ronde per match)
export const roundDetails = sqliteTable('round_details', {
  id: text('id').primaryKey(),
  matchId: text('match_id')
    .notNull()
    .references(() => matches.id, { onDelete: 'cascade' }),
  roundNumber: integer('round_number').notNull(),
  winType: text('win_type').notNull(), // 'elimination' | 'defuse' | 'detonate' | 'time'
  side: text('side').notNull(),         // 'attack' | 'defense'
  isWon: integer('is_won', { mode: 'boolean' }).notNull(),
});

// Definisi Relasi untuk Drizzle Query API
export const matchesRelations = relations(matches, ({ many }) => ({
  playerStats: many(playerStats),
  roundDetails: many(roundDetails),
}));

export const playerStatsRelations = relations(playerStats, ({ one }) => ({
  match: one(matches, {
    fields: [playerStats.matchId],
    references: [matches.id],
  }),
}));

export const roundDetailsRelations = relations(roundDetails, ({ one }) => ({
  match: one(matches, {
    fields: [roundDetails.matchId],
    references: [matches.id],
  }),
}));
```

---

### File 3: `lib/actions/matches.ts`
*Tujuan: Server Action mutasi match yang resilient, atomic (1 roundtrip), dan type-safe.*

```typescript
'use server';

import { createId } from '@paralleldrive/cuid2';
import { revalidateTag } from 'next/cache';
import { db } from '@/lib/db';
import { matches, playerStats, roundDetails } from '@/lib/db/schema';
import { matchInputSchema } from '@/lib/validations/match';
import { ActionResponse } from '@/lib/types/action';

export async function createMatchAction(
  rawInput: unknown
): Promise<ActionResponse<{ id: string }>> {
  // 1. Validasi Zod tanpa throw exception
  const parsed = matchInputSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Validasi form gagal. Periksa kembali input Anda.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const validated = parsed.data;
  const matchId = createId();

  // 2. Eksekusi Atomic Batch Insert ke Turso
  try {
    await db.batch([
      // Insert Match Entity
      db.insert(matches).values({
        id: matchId,
        mapName: validated.mapName,
        opponentTeam: validated.opponentTeam,
        teamScore: validated.teamScore,
        opponentScore: validated.opponentScore,
        isWin: validated.isWin,
        createdAt: new Date(),
      }),
      // Insert 5 Player Stats
      ...validated.players.map((player) =>
        db.insert(playerStats).values({
          id: createId(),
          matchId,
          playerId: player.playerId,
          agent: player.agent,
          kills: player.kills,
          deaths: player.deaths,
          assists: player.assists,
          acs: player.acs,
        })
      ),
      // Insert 13-25 Round Details
      ...validated.rounds.map((round) =>
        db.insert(roundDetails).values({
          id: createId(),
          matchId,
          roundNumber: round.roundNumber,
          winType: round.winType,
          side: round.side,
          isWon: round.isWon,
        })
      ),
    ]);
  } catch (err) {
    console.error('[DATABASE_ERROR] Batch insert match failed:', err);
    return {
      success: false,
      error: 'Terjadi kegagalan saat menyimpan data match ke database. Silakan coba lagi.',
    };
  }

  // 3. Invalidate Cache Analitik
  revalidateTag('scrim-analytics', 'max');

  return {
    success: true,
    data: { id: matchId },
  };
}
```

---

### File 4: `lib/auth/rate-limit.ts`
*Tujuan: Rate limiting terdistribusi berbasis Upstash REST untuk endpoint auth dan OAuth callback.*

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Menggunakan UPSTASH_REDIS_REST_URL dan UPSTASH_REDIS_REST_TOKEN dari environment
const redis = Redis.fromEnv();

export const authRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '60 s'), // 10 request per 60 detik
  analytics: false,
  prefix: 'scrim_auth_ratelimit',
});
```

---

### File 5: `lib/utils/analytics.ts`
*Tujuan: Caching komputasi analitik dan agregasi statistik scrim.*

```typescript
import { unstable_cache } from 'next/cache';
import { db } from '@/lib/db';
import { calculateTacticalMetrics } from '@/lib/utils/tactical-expert-engine';

export const getCachedTeamAnalytics = unstable_cache(
  async () => {
    // Single relational query untuk mencegah query loop N+1
    const rawMatches = await db.query.matches.findMany({
      with: {
        playerStats: true,
        roundDetails: true,
      },
      orderBy: (matches, { desc }) => [desc(matches.createdAt)],
    });

    // Jalankan engine kalkulasi analitik
    return calculateTacticalMetrics(rawMatches);
  },
  ['team-scrim-analytics-cache'],
  {
    revalidate: 300, // Revalidate background setiap 5 menit
    tags: ['scrim-analytics'],
  }
);
```

---

## 4. Verification & QA Checklist for AI Agent

- [ ] Pastikan `@paralleldrive/cuid2` terpasang (`npm install @paralleldrive/cuid2`).
- [ ] Pastikan `@upstash/ratelimit` dan `@upstash/redis` terpasang.
- [ ] Pastikan `drizzle-orm` diinisialisasi bersama objek skema: `drizzle(client, { schema })`.
- [ ] Jalankan `npm run build` untuk memverifikasi tidak ada type mismatch pada `ActionResponse` dan `db.batch()`.
- [ ] Uji input payload invalid pada `createMatchAction` dan verifikasi bahwa Server Action mengembalikan object `fieldErrors` tanpa throwing runtime error.
