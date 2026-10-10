import { AgentInfo } from "@/lib/data/valorant";

export interface AgentAnchorRect { left: number; right: number; top: number; bottom: number }
export interface AgentViewport { width: number; height: number }
export interface AgentPanelSize { width: number; height: number }
export interface AgentPanelPosition { left: number; top: number; width: number; maxHeight: number; placement: "above" | "below" }

export function filterAgents(agents: AgentInfo[], query: string): AgentInfo[] {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return agents;
  return agents.filter((agent) => agent.name.toLocaleLowerCase().startsWith(normalized));
}

export function moveAgentHighlight(current: number, direction: -1 | 1, resultCount: number): number {
  if (resultCount === 0) return -1;
  if (current < 0) return direction === 1 ? 0 : resultCount - 1;
  return (current + direction + resultCount) % resultCount;
}

export function moveGroupedAgentGridHighlight(current: number, key: "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown", groups: AgentInfo[][], columns: number): number {
  const nonEmptyGroups = groups.filter((group) => group.length > 0);
  const allAgents = nonEmptyGroups.flat();
  if (!allAgents.length) return -1;
  const index = Math.max(0, Math.min(current, allAgents.length - 1));
  let offset = 0;
  const groupIndex = nonEmptyGroups.findIndex((group) => {
    const matches = index < offset + group.length;
    if (!matches) offset += group.length;
    return matches;
  });
  const group = nonEmptyGroups[groupIndex];
  const local = index - offset;
  if (key === "ArrowLeft" || key === "ArrowRight") {
    return Math.max(0, Math.min(allAgents.length - 1, index + (key === "ArrowLeft" ? -1 : 1)));
  }
  const row = Math.floor(local / columns);
  const column = local % columns;
  const targetRow = row + (key === "ArrowUp" ? -1 : 1);
  const rowCount = Math.ceil(group.length / columns);
  if (targetRow >= 0 && targetRow < rowCount) {
    return offset + Math.min(group.length - 1, targetRow * columns + column);
  }
  const targetGroupIndex = groupIndex + (key === "ArrowUp" ? -1 : 1);
  const targetGroup = nonEmptyGroups[targetGroupIndex];
  if (!targetGroup) return index;
  const targetGroupStart = nonEmptyGroups.slice(0, targetGroupIndex).reduce((sum, items) => sum + items.length, 0);
  const targetGroupRow = key === "ArrowUp" ? Math.ceil(targetGroup.length / columns) - 1 : 0;
  return targetGroupStart + Math.min(targetGroup.length - 1, targetGroupRow * columns + column);
}

export function getAgentPanelPosition(anchor: AgentAnchorRect, viewport: AgentViewport, panel: AgentPanelSize, margin = 8): AgentPanelPosition {
  const width = Math.min(panel.width, Math.max(0, viewport.width - margin * 2));
  const left = Math.min(Math.max(margin, anchor.left), Math.max(margin, viewport.width - margin - width));
  const availableBelow = Math.max(0, viewport.height - anchor.bottom - margin * 2);
  const availableAbove = Math.max(0, anchor.top - margin * 2);
  const desiredHeight = Math.min(panel.height, 360);
  const placement = availableBelow >= desiredHeight || availableBelow >= availableAbove ? "below" : "above";
  const available = placement === "below" ? availableBelow : availableAbove;
  const maxHeight = Math.max(0, available);
  const height = Math.min(panel.height, maxHeight);
  const top = placement === "below" ? anchor.bottom + margin : anchor.top - margin - height;
  return { left, top, width, maxHeight, placement };
}

export function isAgentSelectedElsewhere(agentName: string, otherSelections: string[]): boolean {
  return Boolean(agentName) && otherSelections.some((name) => name.toLocaleLowerCase() === agentName.toLocaleLowerCase());
}
