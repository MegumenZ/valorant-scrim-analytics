import { db } from "./index";
import { players, matches, matchPlayerStats } from "./schema";

export async function seedInitialData() {
  console.log("Seeding initial Valorant scrim data...");

  // 1. Insert Initial Players (Roster)
  const rosterData = [
    {
      id: "p1-f0rsaken",
      name: "f0rsakeN",
      riotId: "f0rsakeN#PRX",
      primaryRole: "Flex" as const,
      discordId: "f0rsaken_prx",
      isActive: true,
    },
    {
      id: "p2-jinggg",
      name: "Jinggg",
      riotId: "Jinggg#PRX",
      primaryRole: "Duelist" as const,
      discordId: "jinggg_prx",
      isActive: true,
    },
    {
      id: "p3-mindfreak",
      name: "mindfreak",
      riotId: "mindfreak#PRX",
      primaryRole: "Controller" as const,
      discordId: "mindfreak_prx",
      isActive: true,
    },
    {
      id: "p4-d4v41",
      name: "d4v41",
      riotId: "d4v41#PRX",
      primaryRole: "Initiator" as const,
      discordId: "d4v41_prx",
      isActive: true,
    },
    {
      id: "p5-something",
      name: "something",
      riotId: "something#PRX",
      primaryRole: "Duelist" as const,
      discordId: "something_prx",
      isActive: true,
    },
    {
      id: "p6-monyet",
      name: "Monyet",
      riotId: "monyet#PRX",
      primaryRole: "Controller" as const,
      discordId: "monyet_prx",
      isActive: false, // sub
    },
  ];

  for (const player of rosterData) {
    await db.insert(players).values(player).onConflictDoNothing();
  }

  // 2. Insert Past Scrim Matches
  const scrims = [
    {
      id: "m-scrim-01",
      matchDate: "2026-08-16",
      map: "Ascent" as const,
      opponentName: "Alter Ego",
      scoreTeam: 13,
      scoreOpponent: 9,
      result: "WIN" as const,
      startSide: "ATTACK" as const,
      vodUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      notes: "Mid control di ronde buy sangat solid, retake A site terkoordinasi rapi dengan recon dart.",
      stats: [
        { playerId: "p1-f0rsaken", agent: "Jett", acs: 285, kills: 22, deaths: 12, assists: 4, adr: 180.2, hsPercent: 28.5, firstKills: 5, firstDeaths: 2, clutchesWon: 1, kastPercent: 78 },
        { playerId: "p2-jinggg", agent: "Raze", acs: 240, kills: 18, deaths: 14, assists: 6, adr: 155.0, hsPercent: 22.0, firstKills: 4, firstDeaths: 3, clutchesWon: 0, kastPercent: 73 },
        { playerId: "p3-mindfreak", agent: "Omen", acs: 195, kills: 14, deaths: 11, assists: 9, adr: 128.4, hsPercent: 32.0, firstKills: 1, firstDeaths: 1, clutchesWon: 2, kastPercent: 82 },
        { playerId: "p4-d4v41", agent: "Fade", acs: 180, kills: 12, deaths: 13, assists: 11, adr: 115.0, hsPercent: 25.0, firstKills: 2, firstDeaths: 1, clutchesWon: 0, kastPercent: 86 },
        { playerId: "p5-something", agent: "Cypher", acs: 160, kills: 11, deaths: 10, assists: 5, adr: 102.3, hsPercent: 20.0, firstKills: 0, firstDeaths: 1, clutchesWon: 1, kastPercent: 77 },
      ],
    },
    {
      id: "m-scrim-02",
      matchDate: "2026-08-15",
      map: "Bind" as const,
      opponentName: "Boom Esports",
      scoreTeam: 11,
      scoreOpponent: 13,
      result: "LOSS" as const,
      startSide: "DEFENSE" as const,
      vodUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      notes: "Kalah di pistol round babak kedua. Eksekusi Hookah B site sering terhambat utility Viper lawan.",
      stats: [
        { playerId: "p2-jinggg", agent: "Raze", acs: 260, kills: 21, deaths: 17, assists: 5, adr: 168.0, hsPercent: 25.0, firstKills: 5, firstDeaths: 4, clutchesWon: 1, kastPercent: 71 },
        { playerId: "p5-something", agent: "Yoru", acs: 235, kills: 19, deaths: 16, assists: 4, adr: 152.0, hsPercent: 29.0, firstKills: 4, firstDeaths: 3, clutchesWon: 1, kastPercent: 75 },
        { playerId: "p1-f0rsaken", agent: "Skye", acs: 190, kills: 14, deaths: 16, assists: 12, adr: 124.0, hsPercent: 26.0, firstKills: 1, firstDeaths: 2, clutchesWon: 0, kastPercent: 79 },
        { playerId: "p3-mindfreak", agent: "Brimstone", acs: 175, kills: 13, deaths: 15, assists: 8, adr: 118.0, hsPercent: 28.0, firstKills: 0, firstDeaths: 1, clutchesWon: 2, kastPercent: 75 },
        { playerId: "p4-d4v41", agent: "Viper", acs: 165, kills: 12, deaths: 17, assists: 9, adr: 110.0, hsPercent: 24.0, firstKills: 1, firstDeaths: 2, clutchesWon: 0, kastPercent: 67 },
      ],
    },
    {
      id: "m-scrim-03",
      matchDate: "2026-08-15",
      map: "Haven" as const,
      opponentName: "Rex Regum Qeon",
      scoreTeam: 13,
      scoreOpponent: 5,
      result: "WIN" as const,
      startSide: "ATTACK" as const,
      vodUrl: "",
      notes: "Dominasi total di A Long dan Garage. Entry timing jinggg dan f0rsaken sangat sinkron.",
      stats: [
        { playerId: "p3-mindfreak", agent: "Omen", acs: 265, kills: 19, deaths: 7, assists: 8, adr: 172.0, hsPercent: 36.0, firstKills: 3, firstDeaths: 0, clutchesWon: 2, kastPercent: 94 },
        { playerId: "p1-f0rsaken", agent: "Breach", acs: 245, kills: 16, deaths: 8, assists: 14, adr: 160.0, hsPercent: 30.0, firstKills: 2, firstDeaths: 1, clutchesWon: 1, kastPercent: 89 },
        { playerId: "p2-jinggg", agent: "Phoenix", acs: 230, kills: 16, deaths: 10, assists: 5, adr: 148.0, hsPercent: 24.0, firstKills: 4, firstDeaths: 2, clutchesWon: 0, kastPercent: 83 },
        { playerId: "p5-something", agent: "Jett", acs: 215, kills: 15, deaths: 9, assists: 3, adr: 138.0, hsPercent: 28.0, firstKills: 3, firstDeaths: 2, clutchesWon: 0, kastPercent: 78 },
        { playerId: "p4-d4v41", agent: "Sova", acs: 185, kills: 12, deaths: 7, assists: 10, adr: 120.0, hsPercent: 31.0, firstKills: 1, firstDeaths: 0, clutchesWon: 1, kastPercent: 94 },
      ],
    },
    {
      id: "m-scrim-04",
      matchDate: "2026-08-14",
      map: "Lotus" as const,
      opponentName: "Talon Esports",
      scoreTeam: 13,
      scoreOpponent: 10,
      result: "WIN" as const,
      startSide: "ATTACK" as const,
      vodUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      notes: "Rotasi cepat B to C bekerja efektif di ronde late. Setup C site lockdown kuat.",
      stats: [
        { playerId: "p5-something", agent: "Jett", acs: 270, kills: 23, deaths: 14, assists: 4, adr: 174.0, hsPercent: 33.0, firstKills: 6, firstDeaths: 3, clutchesWon: 1, kastPercent: 78 },
        { playerId: "p1-f0rsaken", agent: "Fade", acs: 220, kills: 17, deaths: 15, assists: 13, adr: 142.0, hsPercent: 27.0, firstKills: 2, firstDeaths: 1, clutchesWon: 1, kastPercent: 83 },
        { playerId: "p2-jinggg", agent: "Raze", acs: 210, kills: 16, deaths: 16, assists: 6, adr: 139.0, hsPercent: 21.0, firstKills: 3, firstDeaths: 4, clutchesWon: 0, kastPercent: 70 },
        { playerId: "p4-d4v41", agent: "Killjoy", acs: 195, kills: 14, deaths: 12, assists: 7, adr: 129.0, hsPercent: 30.0, firstKills: 1, firstDeaths: 1, clutchesWon: 2, kastPercent: 87 },
        { playerId: "p3-mindfreak", agent: "Omen", acs: 160, kills: 11, deaths: 14, assists: 10, adr: 105.0, hsPercent: 26.0, firstKills: 0, firstDeaths: 1, clutchesWon: 1, kastPercent: 74 },
      ],
    },
    {
      id: "m-scrim-05",
      matchDate: "2026-08-13",
      map: "Sunset" as const,
      opponentName: "DRX",
      scoreTeam: 8,
      scoreOpponent: 13,
      result: "LOSS" as const,
      startSide: "DEFENSE" as const,
      vodUrl: "",
      notes: "Kesulitan contest Mid Courtyard saat lawan double controller. Perlu perbaikan default positioning.",
      stats: [
        { playerId: "p1-f0rsaken", agent: "Yoru", acs: 235, kills: 17, deaths: 16, assists: 3, adr: 152.0, hsPercent: 29.0, firstKills: 3, firstDeaths: 3, clutchesWon: 1, kastPercent: 71 },
        { playerId: "p2-jinggg", agent: "Raze", acs: 215, kills: 15, deaths: 17, assists: 4, adr: 141.0, hsPercent: 23.0, firstKills: 4, firstDeaths: 4, clutchesWon: 0, kastPercent: 67 },
        { playerId: "p5-something", agent: "Gekko", acs: 180, kills: 12, deaths: 15, assists: 8, adr: 120.0, hsPercent: 27.0, firstKills: 1, firstDeaths: 2, clutchesWon: 0, kastPercent: 71 },
        { playerId: "p4-d4v41", agent: "Cypher", acs: 170, kills: 11, deaths: 14, assists: 5, adr: 112.0, hsPercent: 28.0, firstKills: 0, firstDeaths: 1, clutchesWon: 1, kastPercent: 76 },
        { playerId: "p3-mindfreak", agent: "Omen", acs: 155, kills: 10, deaths: 15, assists: 7, adr: 101.0, hsPercent: 25.0, firstKills: 0, firstDeaths: 1, clutchesWon: 1, kastPercent: 67 },
      ],
    },
    {
      id: "m-scrim-06",
      matchDate: "2026-08-12",
      map: "Ascent" as const,
      opponentName: "Gen.G Esports",
      scoreTeam: 13,
      scoreOpponent: 7,
      result: "WIN" as const,
      startSide: "ATTACK" as const,
      vodUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      notes: "Sangat disiplin anti-eco. D4v41 dan Mindfreak clutching di ronde-ronde kritis.",
      stats: [
        { playerId: "p4-d4v41", agent: "Sova", acs: 260, kills: 19, deaths: 9, assists: 12, adr: 170.0, hsPercent: 35.0, firstKills: 2, firstDeaths: 0, clutchesWon: 2, kastPercent: 90 },
        { playerId: "p1-f0rsaken", agent: "Jett", acs: 250, kills: 18, deaths: 11, assists: 5, adr: 162.0, hsPercent: 30.0, firstKills: 4, firstDeaths: 2, clutchesWon: 1, kastPercent: 85 },
        { playerId: "p5-something", agent: "Reyna", acs: 230, kills: 17, deaths: 12, assists: 3, adr: 150.0, hsPercent: 32.0, firstKills: 3, firstDeaths: 2, clutchesWon: 0, kastPercent: 80 },
        { playerId: "p2-jinggg", agent: "KAY/O", acs: 190, kills: 13, deaths: 12, assists: 9, adr: 125.0, hsPercent: 24.0, firstKills: 2, firstDeaths: 2, clutchesWon: 0, kastPercent: 80 },
        { playerId: "p3-mindfreak", agent: "Omen", acs: 170, kills: 11, deaths: 10, assists: 11, adr: 112.0, hsPercent: 28.0, firstKills: 0, firstDeaths: 0, clutchesWon: 1, kastPercent: 85 },
      ],
    },
  ];

  for (const scrim of scrims) {
    const { stats, ...matchInfo } = scrim;
    await db.insert(matches).values(matchInfo).onConflictDoNothing();
    for (const stat of stats) {
      await db.insert(matchPlayerStats).values({
        id: `stat-${scrim.id}-${stat.playerId}`,
        matchId: scrim.id,
        ...stat,
      }).onConflictDoNothing();
    }
  }

  console.log("Seeding complete!");
}
