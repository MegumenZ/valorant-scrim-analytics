import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!url || !/^(libsql|https):\/\//i.test(url)) {
  throw new Error("Set TURSO_DATABASE_URL to a remote libsql:// or https:// URL. Local database URLs are refused.");
}

const client = createClient({ url, authToken });
try {
  // This diagnostic intentionally sends only SELECT and read-only PRAGMA statements.
  const [matchCount, adrResult, timelineResult, foreignKeyResult] = await Promise.all([
    client.execute("SELECT COUNT(*) AS count FROM matches"),
    client.execute(`SELECT
      COUNT(*) AS known_stats,
      SUM(CASE WHEN ROUND(acs * 0.65, 1) = ROUND(adr, 1) THEN 1 ELSE 0 END) AS formula_matches
      FROM match_player_stats WHERE acs IS NOT NULL AND adr IS NOT NULL`).then((value) => ({ value })).catch((error) => ({ error: error.message })),
    client.execute("SELECT round_timeline FROM matches WHERE round_timeline IS NOT NULL").then((value) => ({ value })).catch((error) => ({ error: error.message })),
    client.execute("PRAGMA foreign_keys").catch((error) => ({ pragmaError: error.message })),
  ]);

  let timelineMatches = 0;
  let roundsWithTradeData = 0;
  let tradesWon = 0;
  let tradedDeaths = 0;
  const foreignKeyRow = "pragmaError" in foreignKeyResult ? undefined : foreignKeyResult.rows[0];
  for (const row of timelineResult.value?.rows ?? []) {
    timelineMatches++;
    try {
      const rounds = JSON.parse(String(row.round_timeline));
      if (Array.isArray(rounds)) {
        for (const round of rounds) {
          if (round?.tradesWon != null || round?.tradedDeaths != null) roundsWithTradeData++;
          tradesWon += Number(round?.tradesWon ?? 0);
          tradedDeaths += Number(round?.tradedDeaths ?? 0);
        }
      }
    } catch {
      // Count corrupt timeline rows as present, but do not infer trade data.
    }
  }

  console.log(JSON.stringify({
    matchCount: Number(matchCount.rows[0]?.count ?? 0),
    adrSyntheticFormula: "error" in adrResult ? { checked: false, reason: adrResult.error } : {
      knownStats: Number(adrResult.value.rows[0]?.known_stats ?? 0),
      matches: Number(adrResult.value.rows[0]?.formula_matches ?? 0),
    },
    timeline: "error" in timelineResult ? { checked: false, reason: timelineResult.error } : { matches: timelineMatches, roundsWithTradeData, tradesWon, tradedDeaths },
    foreignKeys: "pragmaError" in foreignKeyResult ? { checked: false, reason: foreignKeyResult.pragmaError } : !foreignKeyRow ? { checked: false, reason: "PRAGMA returned no value" } : {
      checked: true,
      value: Number(foreignKeyRow.foreign_keys ?? Object.values(foreignKeyRow)[0]),
    },
  }, null, 2));
} finally {
  client.close();
}
