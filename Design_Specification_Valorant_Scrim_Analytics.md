# UI/UX Design Specification & Design System
# Valorant Scrim Analytics Platform

> **Versi Desain:** 1.0 (Architecture Baseline)  
> **Design Framework:** Tailwind CSS + shadcn/ui  
> **Tema Utama:** Tactical Dark Mode & Compact HUD  
> **Target Viewport:** Desktop (Primary Data Entry) & Mobile (Viewer/Player Profile)  
> **Standar Aksesibilitas:** WCAG 2.1 AA Compliant  

---

## 1. Filosofi & Prinsip Desain UI/UX

1. **Tactical HUD Aesthetic:** Nuansa *dark gaming dashboard* bernuansa tactical shooter (Gunmetal Slate dengan aksen Radiant Red) yang mencerminkan identitas kompetitif Valorant tanpa mengurangi keterbacaan data.
2. **High Density & Zero Clutter:** Tata letak data yang rapat (*compact tabular layout*), memaksimalkan ruang kerja untuk menampilkan seluruh metrik krusial tanpa animasi berat yang membebani browser.
3. **Keyboard-First Rapid Workflow:** Formulir input dirancang untuk navigasi penuh menggunakan tombol `Tab` dan `Enter` agar IGL/manager dapat mengisi 1 match dan 5 pemain dalam tempo < 90 detik.

---

## 2. Design Tokens & Sistem Warna

### 2.1 Palet Warna Utama

| Token Name | Hex Code | Tailwind Class | Penggunaan pada Antarmuka |
| :--- | :--- | :--- | :--- |
| **Brand Primary** | `#FF4655` | `bg-rose-500` | Tombol CTA utama (*Submit Match*), active navigation indicator, primary badge. |
| **App Shell Dark** | `#090D16` / `#0F172A` | `bg-slate-950/900` | Background dasar aplikasi dan sidebar background. |
| **Card / Surface** | `#1E293B` | `bg-slate-800` | Kontainer tabel data, kartu KPI, popover modal, dan dropdown sheet. |
| **Border Outline** | `#334155` | `border-slate-700` | Garis batas kartu, pemisah baris tabel, dan input border. |
| **Status: WIN** | `#10B981` | `text-emerald-500` / `bg-emerald-500/10` | Indikator kemenangan, badge "WIN", bar chart kemenangan map. |
| **Status: LOSS** | `#EF4444` | `text-red-500` / `bg-red-500/10` | Indikator kekalahan, badge "LOSS", bar chart kekalahan map. |
| **Status: DRAW** | `#F59E0B` | `text-amber-500` / `bg-amber-500/10` | Badge status seri, warning alert. |
| **Combat Highlight** | `#38BDF8` | `text-sky-400` | Indikator MVP Match, ACS tertinggi, dan opening duel ratio unggul. |

---

## 3. Tipografi & Sistem Spasial

* **UI & Navigation Font:** `Inter`, `sans-serif` (Sangat bersih untuk label form, tombol, dan header).
* **Data & Numerical Font:** `JetBrains Mono` atau `Geist Mono` dengan konfigurasi `font-variant-numeric: tabular-nums` agar seluruh angka pada kolom ACS, K/D/A, ADR, dan HS% sejajar vertikal secara presisi.
* **Scale & Sizing:**
  * Base grid unit: 4px / 8px.
  * Form input height: `36px` (`h-9`) untuk memadatkan matriks form 5 pemain agar muat dalam 1 layar laptop tanpa scrolling berlebih.
  * Card padding: `12px` (compact) hingga `16px` (standard).

---

## 4. Arsitektur Komponen UI (Atomic Hierarchy)

```
[Atoms]      : Badge, Avatar, Input Box, Select Dropdown, Tooltip
   ↓
[Molecules]  : StatKpiCard, PlayerRowInput, MapProgressBar, OutcomeBadge
   ↓
[Organisms]  : MatchInputMatrix, TeamLeaderboardTable, AcsTrendChart, HistoryTable
   ↓
[Templates]  : AppShellLayout (Sidebar + Sticky Header + Dynamic Content)
```

---

## 5. Wireframe & Spesifikasi Layout

### 5.1 Layout Global Shell (Sidebar + Navigation)

```text
+-------------------------------------------------------------------------------------------------------+
| [VALO STATS LOGO]  |  [Active Team: Team Alpha v]               | [Search...] | [Admin: Coach v] [DP] |
+--------------------+----------------------------------------------------------------------------------+
| (•) Dashboard      |                                                                                  |
| ( ) Match History  |                                  MAIN CONTENT AREA                               |
| (+) New Scrim Map  |                        (Dynamic Container Max-W 1440px)                          |
| ( ) Roster & Stats |                                                                                  |
| ( ) Map Analytics  |                                                                                  |
+--------------------+----------------------------------------------------------------------------------+
```

### 5.2 Wireframe Dashboard Utama (`/dashboard`)

```text
+-------------------------------------------------------------------------------------------------------+
| DASHBOARD UTAMA                                                    [ Filter Waktu: 30 Hari Terakhir v]|
+-------------------------------------------------------------------------------------------------------+
| [ TOTAL MATCHES ]       | [ WIN RATE TIM ]         | [ TEAM AVG ACS ]        | [ MAP TERKUAT ]        |
|  48 Maps                |  62.5% (30W - 18L)       |  214.2 ACS              |  Ascent (80.0% WR)     |
|  +12% vs bulan lalu     |  Attack: 54% | Def: 68%  |  Avg ADR: 142.6         |  8 Win - 2 Loss        |
+-------------------------------------------------------------------------------------------------------+
| GRAFIK WIN RATE PER MAP (Recharts Bar)               | TREN COMBAT SCORE TIM (5 Match Terakhir)       |
| Ascent   [████████████████░░░░] 80% (8-2)            | 250 |        /\                                |
| Bind     [████████████░░░░░░░░] 60% (6-4)            | 200 |  /\   /  \   /\                         |
| Haven    [████████░░░░░░░░░░░░] 40% (4-6)            | 150 | /  \_/    \_/  \                        |
| Lotus    [██████████████░░░░░░] 70% (7-3)            | 100 |___________________                      |
| Sunset   [██████████░░░░░░░░░░] 50% (5-5)            |      M1   M2   M3   M4   M5                  |
+-------------------------------------------------------------------------------------------------------+
| LOG SCRIM TERAKHIR                                                               [ Lihat Semua Match >] |
+-------------------------------------------------------------------------------------------------------+
| Tanggal    | Map     | Lawan            | Skor    | Result | Sisi Awal | Top Fragger (ACS) | Aksi     |
| 2026-08-16 | Ascent  | Alter Ego        | 13 - 9  | [WIN]  | Attack    | F0rsakeN (285)    | [Detail] |
| 2026-08-15 | Bind    | Boom Esports     | 11 - 13 | [LOSS] | Defense   | Jinggg (240)      | [Detail] |
| 2026-08-15 | Haven   | Rex Regum Qeon   | 13 - 5  | [WIN]  | Attack    | Mindfreak (265)   | [Detail] |
+-------------------------------------------------------------------------------------------------------+
| LEADERBOARD INDIVIDU ROSTER (Musim Berjalan)                                                          |
+-------------------------------------------------------------------------------------------------------+
| Pemain       | Role       | Match | Avg ACS | Avg ADR | K/D Ratio | HS %  | FK / FD  | Clutch (1vX)  |
| F0rsakeN     | Duelist    | 48    | 245.8   | 162.1   | 1.34      | 28.4% | 42 / 25  | 8 Clutches    |
| Jinggg       | Duelist    | 45    | 238.2   | 158.4   | 1.25      | 24.1% | 38 / 30  | 5 Clutches    |
| D4v41        | Initiator  | 48    | 205.1   | 135.0   | 1.08      | 31.0% | 18 / 12  | 6 Clutches    |
| Mindfreak    | Controller | 48    | 192.4   | 128.2   | 1.02      | 26.5% | 12 / 14  | 11 Clutches   |
| Something    | Flex       | 42    | 220.6   | 144.5   | 1.18      | 29.2% | 31 / 22  | 7 Clutches    |
+-------------------------------------------------------------------------------------------------------+
```

### 5.3 Wireframe Formulir Pengisian Scrim Cepat (`/matches/new`)

```text
+-------------------------------------------------------------------------------------------------------+
| CATAT PERTANDINGAN SCRIM BARU                                              [ Upload Scoreboard (OCR) ]|
+-------------------------------------------------------------------------------------------------------+
| METADATA PERTANDINGAN                                                                                 |
| Tanggal Match*       Pilihan Map*       Nama Tim Lawan*      Skor Tim*   Skor Lawan*   Sisi Awal*     |
| [ 2026-08-17     ]  [ Ascent        v] [ Alter Ego        ] [ 13      ] [ 9       ]  [ Attack     v]|
|                                                             (Hasil Otomatis: [ WIN (13-9) ])          |
| Link VOD / YouTube (Opsional)                                                                         |
| [ https://www.youtube.com/watch?v=xxxxxxxx                                                          ] |
+-------------------------------------------------------------------------------------------------------+
| STATISTIK 5 PEMAIN (Mendukung Navigasi Tab Keyboard)                                                 |
| Pemain*       Agent*      ACS*   Kills*  Deaths* Assists*  ADR*    HS %   FK    FD   Clutch  Live K/D |
|-------------------------------------------------------------------------------------------------------|
| [F0rsakeN v] [Jett     v] [285 ] [ 22  ] [ 12  ] [  4   ] [180.2] [28 ] [ 5 ] [ 2 ] [ 1  ]  1.83 KD  |
| [Jinggg   v] [Raze     v] [240 ] [ 18  ] [ 14  ] [  6   ] [155.0] [22 ] [ 4 ] [ 3 ] [ 0  ]  1.28 KD  |
| [Mindfreakv] [Omen     v] [195 ] [ 14  ] [ 11  ] [  9   ] [128.4] [32 ] [ 1 ] [ 1 ] [ 2  ]  1.27 KD  |
| [D4v41    v] [Fade     v] [180 ] [ 12  ] [ 13  ] [ 11   ] [115.0] [25 ] [ 2 ] [ 1 ] [ 0  ]  0.92 KD  |
| [Somethingv] [Cypher   v] [160 ] [ 11  ] [ 10  ] [  5   ] [102.3] [20 ] [ 0 ] [ 1 ] [ 1  ]  1.10 KD  |
+-------------------------------------------------------------------------------------------------------+
| EVALUASI & CATATAN TAKTIS IGL / COACH                                                                 |
| [ Mid control di ronde buy sangat solid, namun eksekusi retake B-site masih terlambat utility smoke. ]|
+-------------------------------------------------------------------------------------------------------+
|                                                      [ Reset Form ]   [ + SIMPAN & PUBLISH MATCH ]    |
+-------------------------------------------------------------------------------------------------------+
```

---

## 6. Spesifikasi Interaksi & Alur UX (User Experience Flows)

1. **Auto-Populate Starting Roster:** Saat halaman form dibuka, 5 pemain inti langsung terpasang secara default. Pengguna cukup memilih agent yang dimainkan.
2. **Sequential Tab-Indexing:** Tombol `Tab` berpindah sekuensial:  
   `ACS` $\rightarrow$ `Kills` $\rightarrow$ `Deaths` $\rightarrow$ `Assists` $\rightarrow$ `ADR` $\rightarrow$ `HS%` $\rightarrow$ `FK` $\rightarrow$ `FD` $\rightarrow$ `Clutches Won` $\rightarrow$ *pindah ke baris pemain berikutnya*.
3. **Live Computed Feedback:** K/D ratio dan hasil pertandingan (`WIN`/`LOSS`) dihitung secara *real-time* di antarmuka tanpa reload halaman.
4. **Optimistic Revalidation:** Setelah menekan tombol submit, Next.js Server Action melakukan invalidasi cache, dan data visual langsung diperbarui secara instan.

---

## 7. Standar Responsivitas & Aksesibilitas Layar

| Breakpoint Layar | Target Penggunaan | Strategi Adaptasi Tata Letak |
| :--- | :--- | :--- |
| **Desktop ($\ge$ 1280px)** | Input Data IGL & Analisis Coach | Tampilan penuh *wide spreadsheet grid*, multi-column KPI cards, dual chart side-by-side. |
| **Tablet (768px – 1024px)** | Coach Reviewing Table | Sidebar menyusut menjadi *icon-only mini sidebar*, tabel statistik pemain mengaktifkan *horizontal scroll*. |
| **Mobile (< 768px)** | Pemain Cek Performa Pribadi | Layout bertransformasi menjadi *single column card stack*, grafik ditampilkan vertikal, tabel beralih ke mode ringkas accordion. |
