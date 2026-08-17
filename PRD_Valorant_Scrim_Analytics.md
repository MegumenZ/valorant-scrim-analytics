# Product Requirement Document (PRD)
# Valorant Scrim Analytics Platform

> **Versi Dokumen:** 1.0 (Final Planning Baseline)  
> **Status:** Approved for Development  
> **Target Deployment:** Vercel + Turso libSQL (Zero-Cost Architecture)  
> **Target Pengguna:** Tim Internal Valorant (Roster 5–10 Anggota)  
> **Total Anggaran:** Rp 0 / Bulan (100% Free-Tier Compliant)  
> **Author:** Engineering & Team Management  

---

## 1. Executive Summary & Latar Belakang

### 1.1 Masalah Utama (Problem Statement)
Selama ini, pencatatan hasil *scrimmage* (latihan tanding) tim esports Valorant umumnya bergantung pada spreadsheet manual (seperti Google Sheets atau Excel). Pendekatan tersebut memiliki kelemahan kritis:
1. **Human Error & Formula Breakage:** Rumus kalkulasi K/D, ADR, dan agregat sering kali terhapus atau keliru diketik saat pengisian terburu-buru pasca-match.
2. **Mobile UX Buruk:** Lembar kerja spreadsheet yang lebar sulit diisi maupun dibaca secara nyaman melalui smartphone.
3. **Minim Visualisasi Taktis:** Sulit melihat agregasi otomatis seperti *win rate* per map, efisiensi *agent pool*, performa sisi serang (*Attack* vs *Defense*), dan rasio *opening duel* (*First Kills* vs *First Deaths*).

### 1.2 Tujuan Produk (Product Goals)
Membangun aplikasi web internal yang terstruktur, cepat, dan modern untuk merekam, memvalidasi, dan menyajikan analitik performa scrim tim dengan arsitektur **serba gratis (Zero-Cost Hosting)** tanpa risiko terkena limitasi kuota (*hitting free tier limits*).

---

## 2. Analisis Resource & Mitigasi Batasan Free Tier

Perhitungan beban didasarkan pada skenario tim aktif (latihan 4–5 sesi/minggu, 3–4 map/sesi $\approx$ 60–80 maps/bulan):

| Komponen | Estimasi Beban Tim (Bulanan) | Batas Free Tier Penyedia | Persentase Terpakai | Status Keamanan |
| :--- | :--- | :--- | :--- | :--- |
| **Database Storage** | ~2–4 MB / tahun (~4 KB / match record) | **Turso:** 9 GB Total Storage | < 0.05% | **Sangat Aman** |
| **Database Operations** | ~2.500 writes, ~20.000 reads / bulan | **Turso:** 25M writes, 1B reads / bln | < 0.01% | **Sangat Aman** |
| **Serverless Invocations** | ~1.000 requests / bulan | **Vercel:** 100.000 Invocations / bln | ~1.0% | **Sangat Aman** |
| **Egress Bandwidth** | ~300–500 MB / bulan | **Vercel:** 100 GB / bln | ~0.4% | **Sangat Aman** |
| **Authentication (OAuth)** | 5–10 akun terdaftar | **Discord OAuth / Auth.js:** Unlimited | 0% (Self-handled) | **Sangat Aman** |

> **Rekomendasi Arsitektur Database:**  
> **Turso (libSQL/SQLite)** dipilih sebagai database utama karena tidak memiliki mekanisme *auto-pause* (berbeda dengan free tier Supabase yang berhenti setelah 7 hari inaktivitas), menyediakan latensi edge global sangat rendah, dan alokasi 9 GB yang mencukupi untuk puluhan tahun data scrim.

---

## 3. Matriks Peran & Hak Akses Pengguna (RBAC)

| Peran (Role) | Target Pengguna | Hak Akses & Otorisasi |
| :--- | :--- | :--- |
| **ADMIN / IGL** | Kapten Tim, Coach, IGL, Manager | • Input data match & statistik 5 pemain secara lengkap.<br>• Edit atau hapus record pertandingan yang keliru.<br>• Tambah, nonaktifkan, atau kelola roster pemain.<br>• Input evaluasi taktis dan tautan VOD pertandingan. |
| **MEMBER** | Seluruh Pemain Aktif & Cadangan | • Melihat dashboard analitik tim & statistik per map.<br>• Melihat profil detail performa masing-masing pemain.<br>• Memperbarui Riot ID dan preferensi akun pribadi.<br>• *Read-only access* terhadap riwayat match dan tautan VOD. |

---

## 4. Spesifikasi Kebutuhan Fungsional (Functional Requirements)

### FR-1: Manajemen Pertandingan (Match Management)
* **Pencatatan Metadata:** Tanggal pertandingan, pilihan map (Ascent, Bind, Haven, Split, Icebox, Breeze, Lotus, Sunset, Abyss), nama lawan, dan sisi awal (*Start Side*: Attack/Defense).
* **Deteksi Hasil Otomatis:** Status `WIN`, `LOSS`, atau `DRAW` dihitung otomatis berdasarkan komparasi skor tim vs lawan.
* **Tautan Media & Catatan:** Penyimpanan URL VOD (YouTube/Twitch) dan catatan evaluasi taktis pasca-game.

### FR-2: Pencatatan Statistik Individu Pemain (Player Stats Entry)
* **Metrik Wajib:** Input 5 pemain per match meliputi: Agent yang dimainkan, Kills, Deaths, Assists, ACS (*Average Combat Score*), dan ADR (*Average Damage per Round*).
* **Metrik Taktis:** First Kills (FK), First Deaths (FD), Clutches Won (1vX).
* **Metrik Akurasi & Konsistensi:** Headshot % (HS%) dan KAST %.
* **Validasi Form:** Mencegah pemilihan pemain duplikat dalam satu match.

### FR-3: Dashboard Analitik Tim
* **Map Performance Breakdown:** Win Rate (%) per map dan rasio kemenangan ronde di sisi Attack vs Defense.
* **Tren Combat Score:** Grafik histori rata-rata ACS tim antar-pertandingan.
* **Head-to-Head Tracker:** Rekam jejak kemenangan/kekalahan melawan tim lawan tertentu.

### FR-4: Profil & Radar Metrik Pemain
* **Statistik Agregat Individu:** Rata-rata ACS, ADR, K/D Ratio, dan HS% sepanjang masa atau filter waktu tertentu.
* **Efisiensi Agent Pool:** Distribusi win rate dan performa tempur saat memainkan agent tertentu.
* **Opening Duel Ratio:** Perbandingan FK/FD untuk mengukur efisiensi entry fragger.

---

## 5. Formulasi Kalkulasi & Rumus Metrik Analitik

Semua metrik turunan dihitung secara dinamis melalui kueri SQL/agregat:

$$\text{K/D Ratio} = \frac{\sum \text{Kills}}{\max(1, \sum \text{Deaths})}$$

$$\text{Total Rounds} = \text{Score}_{\text{Team}} + \text{Score}_{\text{Opponent}}$$

$$\text{Opening Duel Ratio (ODR)} = \frac{\sum \text{First Kills}}{\max(1, \sum \text{First Deaths})}$$

$$\text{Map Win Rate (\%)} = \frac{\text{Total Matches Won on Map}}{\text{Total Matches Played on Map}} \times 100\%$$

---

## 6. Arsitektur Data & Schema Specification (Drizzle ORM)

```typescript
import { sqliteTable, text, integer, real, uniqueIndex, index } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';

// 1. PLAYERS TABLE
export const players = sqliteTable('players', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  riotId: text('riot_id'),
  primaryRole: text('primary_role', { 
    enum: ['Duelist', 'Initiator', 'Controller', 'Sentinel', 'Flex'] 
  }).notNull().default('Flex'),
  discordId: text('discord_id').unique(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// 2. MATCHES TABLE
export const matches = sqliteTable('matches', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  matchDate: text('match_date').notNull(),
  map: text('map', { 
    enum: ['Ascent', 'Bind', 'Haven', 'Split', 'Icebox', 'Breeze', 'Lotus', 'Sunset', 'Abyss'] 
  }).notNull(),
  opponentName: text('opponent_name').notNull(),
  scoreTeam: integer('score_team').notNull(),
  scoreOpponent: integer('score_opponent').notNull(),
  result: text('result', { enum: ['WIN', 'LOSS', 'DRAW'] }).notNull(),
  startSide: text('start_side', { enum: ['ATTACK', 'DEFENSE'] }).notNull().default('ATTACK'),
  vodUrl: text('vod_url'),
  notes: text('notes'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  dateIdx: index('match_date_idx').on(table.matchDate),
  mapIdx: index('match_map_idx').on(table.map),
}));

// 3. MATCH_PLAYER_STATS TABLE
export const matchPlayerStats = sqliteTable('match_player_stats', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  matchId: text('match_id').notNull().references(() => matches.id, { onDelete: 'cascade' }),
  playerId: text('player_id').notNull().references(() => players.id, { onDelete: 'cascade' }),
  agent: text('agent').notNull(),
  acs: integer('acs').notNull(),
  kills: integer('kills').notNull(),
  deaths: integer('deaths').notNull(),
  assists: integer('assists').notNull(),
  adr: real('adr').notNull(),
  hsPercent: real('hs_percent'),
  firstKills: integer('first_kills').default(0).notNull(),
  firstDeaths: integer('first_deaths').default(0).notNull(),
  clutchesWon: integer('clutches_won').default(0).notNull(),
  kastPercent: real('kast_percent'),
}, (table) => ({
  matchPlayerUnique: uniqueIndex('match_player_unique_idx').on(table.matchId, table.playerId),
  matchIdx: index('stats_match_idx').on(table.matchId),
  playerIdx: index('stats_player_idx').on(table.playerId),
}));

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
```

---

## 7. Validasi Input & Server Action

```typescript
// lib/validations/match.ts
import { z } from 'zod';

export const MAPS = ['Ascent', 'Bind', 'Haven', 'Split', 'Icebox', 'Breeze', 'Lotus', 'Sunset', 'Abyss'] as const;

export const playerStatSchema = z.object({
  playerId: z.string().uuid(),
  agent: z.string().min(1),
  acs: z.coerce.number().int().min(0),
  kills: z.coerce.number().int().min(0),
  deaths: z.coerce.number().int().min(0),
  assists: z.coerce.number().int().min(0),
  adr: z.coerce.number().min(0),
  hsPercent: z.coerce.number().min(0).max(100).optional().nullable(),
  firstKills: z.coerce.number().int().min(0).default(0),
  firstDeaths: z.coerce.number().int().min(0).default(0),
  clutchesWon: z.coerce.number().int().min(0).default(0),
  kastPercent: z.coerce.number().min(0).max(100).optional().nullable(),
});

export const createMatchSchema = z.object({
  matchDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  map: z.enum(MAPS),
  opponentName: z.string().min(1).max(50),
  scoreTeam: z.coerce.number().int().min(0),
  scoreOpponent: z.coerce.number().int().min(0),
  startSide: z.enum(['ATTACK', 'DEFENSE']).default('ATTACK'),
  vodUrl: z.string().url().optional().or(z.literal('')),
  notes: z.string().max(500).optional(),
  playerStats: z.array(playerStatSchema).min(1).max(5).refine((stats) => {
    const ids = stats.map(s => s.playerId);
    return new Set(ids).size === ids.length;
  }, { message: 'Terdapat duplikasi pemain' }),
});
```

---

## 8. Alur SOP Input Cepat (< 90 Detik)

1. Buka halaman `/matches/new`.
2. Pilih Map, ketik Tim Lawan, dan isi Skor Akhir (cth: 13–9).
3. 5 Slot pemain aktif otomatis terpasang (cukup pilih Agent masing-masing).
4. Masukkan data statistik: `ACS`, `K`, `D`, `A`, `ADR` dengan berpindah kotak menggunakan tombol `Tab`.
5. Klik **"Simpan Match Data"**. Server action mengeksekusi *atomic transaction* dan me-refresh dashboard dalam < 1 detik.

---

## 9. Roadmap Pengembangan Bertahap

```
[Sprint 1: Core MVP] ────> [Sprint 2: Visual Dashboard] ────> [Sprint 3: Automation & OCR]
```

* **Sprint 1 (Minggu 1–2):** Setup Next.js App Router, Tailwind, Drizzle, Turso DB, Auth Discord, dan Form Input Cepat.
* **Sprint 2 (Minggu 3):** Dashboard Grafik Recharts, Halaman Profil Pemain, Analisis Agent Pool, dan Filter Riwayat Match.
* **Sprint 3 (Minggu 4):** Webhook Notifikasi Discord pasca-scrim, Eksperimen Scoreboard OCR Parser, Ekspor CSV/JSON.

---

## 10. Kriteria Keberhasilan (Success Metrics)

* **Zero-Cost:** Rp 0 pengeluaran hosting dan database.
* **Speed:** Waktu rekapitulasi match konsisten di bawah 90 detik.
* **Reliability:** 0% data loss dengan integritas database ACID transaction.
