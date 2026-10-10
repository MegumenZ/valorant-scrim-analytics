import { describe, expect, it } from "vitest";
import { VALORANT_AGENTS } from "@/lib/data/valorant";
import { opponentPlayerStatSchema, playerStatSchema } from "@/lib/validations/match";
import { filterAgents, getAgentPanelPosition, isAgentSelectedElsewhere, moveAgentHighlight, moveGroupedAgentGridHighlight } from "@/lib/utils/agent-picker";

describe("agent picker helpers", () => {
  it("filters by case-insensitive name prefix", () => {
    expect(filterAgents(VALORANT_AGENTS, "ka").map(({ name }) => name)).toEqual(["KAY/O"]);
    expect(filterAgents(VALORANT_AGENTS, "  JE").map(({ name }) => name)).toEqual(["Jett"]);
    expect(filterAgents(VALORANT_AGENTS, "missing")).toEqual([]);
  });

  it("moves highlight and wraps through available results", () => {
    expect(moveAgentHighlight(-1, 1, 3)).toBe(0);
    expect(moveAgentHighlight(2, 1, 3)).toBe(0);
    expect(moveAgentHighlight(0, -1, 3)).toBe(2);
    expect(moveAgentHighlight(0, 1, 0)).toBe(-1);
  });

  it("moves the keyboard highlight across grid rows and columns", () => {
    const roleGroups = ["Duelist", "Initiator", "Controller", "Sentinel"].map((role) => VALORANT_AGENTS.filter((agent) => agent.role === role));
    expect(moveGroupedAgentGridHighlight(0, "ArrowRight", roleGroups, 8)).toBe(1);
    expect(moveGroupedAgentGridHighlight(7, "ArrowRight", roleGroups, 8)).toBe(8);
    expect(moveGroupedAgentGridHighlight(0, "ArrowDown", roleGroups, 8)).toBe(8);
    expect(moveGroupedAgentGridHighlight(8, "ArrowUp", roleGroups, 8)).toBe(0);
    expect(moveGroupedAgentGridHighlight(0, "ArrowUp", roleGroups, 8)).toBe(0);
    expect(moveGroupedAgentGridHighlight(7, "ArrowDown", roleGroups, 6)).toBe(9);
  });

  it("places the panel below when there is room", () => {
    expect(getAgentPanelPosition({ left: 120, right: 160, top: 100, bottom: 140 }, { width: 1440, height: 900 }, { width: 400, height: 340 })).toEqual({ left: 120, top: 148, width: 400, maxHeight: 744, placement: "below" });
  });

  it("flips above an anchor near the bottom and clamps to the viewport", () => {
    expect(getAgentPanelPosition({ left: 700, right: 740, top: 540, bottom: 580 }, { width: 768, height: 600 }, { width: 400, height: 340 })).toEqual({ left: 360, top: 192, width: 400, maxHeight: 524, placement: "above" });
  });

  it("clamps a right-column anchor and limits height when neither side fits", () => {
    expect(getAgentPanelPosition({ left: 360, right: 400, top: 280, bottom: 320 }, { width: 375, height: 600 }, { width: 400, height: 340 })).toEqual({ left: 8, top: 328, width: 359, maxHeight: 264, placement: "below" });
  });

  it("marks duplicates softly while keeping the agent in the selectable results", () => {
    expect(isAgentSelectedElsewhere("Jett", ["jett"])).toBe(true);
    expect(filterAgents(VALORANT_AGENTS, "Jett").map(({ name }) => name)).toContain("Jett");
  });

  it("provides icons or a component fallback for every server-accepted agent", () => {
    for (const agent of VALORANT_AGENTS) {
      expect(agent.icon).toMatch(/^https:\/\/media\.valorant-api\.com\/agents\//);
      expect(playerStatSchema.safeParse({ playerId: "p1", agent: agent.name, kills: 0, deaths: 0, assists: 0, firstKills: 0 }).success).toBe(true);
      expect(opponentPlayerStatSchema.safeParse({ displayName: "Player", agent: agent.name, kills: 0, deaths: 0, assists: 0, firstKills: 0, plants: 0, defuses: 0 }).success).toBe(true);
    }
    expect(playerStatSchema.safeParse({ playerId: "p1", agent: "Unknown agent", kills: 0, deaths: 0, assists: 0, firstKills: 0 }).success).toBe(false);
  });
});
