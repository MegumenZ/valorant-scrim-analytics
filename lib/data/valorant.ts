export const VALORANT_MAPS = [
  "Ascent",
  "Bind",
  "Haven",
  "Split",
  "Icebox",
  "Breeze",
  "Fracture",
  "Pearl",
  "Lotus",
  "Sunset",
  "Abyss",
  "Summit",
] as const;

export type ValorantMap = typeof VALORANT_MAPS[number];

export interface MapDetails {
  name: string;
  location: string;
  callout: string;
  color: string;
  splash: string;
  listViewIcon: string;
}

export const MAP_METADATA: Record<ValorantMap, MapDetails> = {
  Ascent: {
    name: "Ascent",
    location: "Venice, Italy",
    callout: "Open mid area with mechanical doors",
    color: "from-sky-900 to-indigo-950",
    splash: "https://media.valorant-api.com/maps/7eaecc1b-4337-bbf6-6ab9-04b8f06b3319/splash.png",
    listViewIcon: "https://media.valorant-api.com/maps/7eaecc1b-4337-bbf6-6ab9-04b8f06b3319/listviewicon.png",
  },
  Bind: {
    name: "Bind",
    location: "Rabat, Morocco",
    callout: "Two sites with one-way teleporters",
    color: "from-amber-900 to-stone-950",
    splash: "https://media.valorant-api.com/maps/2c9d57ec-4431-9c5e-2939-8f9ef6dd5cba/splash.png",
    listViewIcon: "https://media.valorant-api.com/maps/2c9d57ec-4431-9c5e-2939-8f9ef6dd5cba/listviewicon.png",
  },
  Haven: {
    name: "Haven",
    location: "Thimphu, Bhutan",
    callout: "Three sites (A, B, C) layout",
    color: "from-emerald-900 to-slate-950",
    splash: "https://media.valorant-api.com/maps/2bee0dc9-4ffe-519b-1cbd-7fbe763a6047/splash.png",
    listViewIcon: "https://media.valorant-api.com/maps/2bee0dc9-4ffe-519b-1cbd-7fbe763a6047/listviewicon.png",
  },
  Split: {
    name: "Split",
    location: "Tokyo, Japan",
    callout: "Elevated sites with rope ascenders",
    color: "from-purple-900 to-slate-950",
    splash: "https://media.valorant-api.com/maps/d960549e-485c-e861-8d71-aa9d1aed12a2/splash.png",
    listViewIcon: "https://media.valorant-api.com/maps/d960549e-485c-e861-8d71-aa9d1aed12a2/listviewicon.png",
  },
  Icebox: {
    name: "Icebox",
    location: "Bennett Island, Russia",
    callout: "Multi-level verticality & ziplines",
    color: "from-cyan-900 to-blue-950",
    splash: "https://media.valorant-api.com/maps/e2ad5c54-4114-a870-9641-8ea21279579a/splash.png",
    listViewIcon: "https://media.valorant-api.com/maps/e2ad5c54-4114-a870-9641-8ea21279579a/listviewicon.png",
  },
  Breeze: {
    name: "Breeze",
    location: "Bermuda Triangle",
    callout: "Expansive sightlines & long range duels",
    color: "from-teal-900 to-cyan-950",
    splash: "https://media.valorant-api.com/maps/2fb9a4fd-47b8-4e7d-a969-74b4046ebd53/splash.png",
    listViewIcon: "https://media.valorant-api.com/maps/2fb9a4fd-47b8-4e7d-a969-74b4046ebd53/listviewicon.png",
  },
  Fracture: {
    name: "Fracture",
    location: "Santa Fe, New Mexico, USA",
    callout: "H-shaped layout with split attacker spawns",
    color: "from-emerald-900 to-amber-950",
    splash: "https://media.valorant-api.com/maps/b529448b-4d60-346e-e89e-00a4c527a405/splash.png",
    listViewIcon: "https://media.valorant-api.com/maps/b529448b-4d60-346e-e89e-00a4c527a405/listviewicon.png",
  },
  Pearl: {
    name: "Pearl",
    location: "Lisbon, Portugal (Omega Earth)",
    callout: "Underwater geo-dome without special gimmicks",
    color: "from-blue-900 to-teal-950",
    splash: "https://media.valorant-api.com/maps/fd267378-4d1d-484f-ff52-77821ed10dc2/splash.png",
    listViewIcon: "https://media.valorant-api.com/maps/fd267378-4d1d-484f-ff52-77821ed10dc2/listviewicon.png",
  },
  Lotus: {
    name: "Lotus",
    location: "Western Ghats, India",
    callout: "Three sites with rotating stone doors",
    color: "from-rose-900 to-amber-950",
    splash: "https://media.valorant-api.com/maps/2fe4ed3a-450a-948b-6d6b-e89a78e680a9/splash.png",
    listViewIcon: "https://media.valorant-api.com/maps/2fe4ed3a-450a-948b-6d6b-e89a78e680a9/listviewicon.png",
  },
  Sunset: {
    name: "Sunset",
    location: "Los Angeles, USA",
    callout: "Classic three-lane tactical structure",
    color: "from-orange-900 to-rose-950",
    splash: "https://media.valorant-api.com/maps/92584fbe-486a-b1b2-9faa-39b0f486b498/splash.png",
    listViewIcon: "https://media.valorant-api.com/maps/92584fbe-486a-b1b2-9faa-39b0f486b498/listviewicon.png",
  },
  Abyss: {
    name: "Abyss",
    location: "Unknown Location",
    callout: "Zero-boundary map with fall hazards",
    color: "from-blue-950 to-indigo-950",
    splash: "https://media.valorant-api.com/maps/224b0a95-48b9-f703-1bd8-67aca101a61f/splash.png",
    listViewIcon: "https://media.valorant-api.com/maps/224b0a95-48b9-f703-1bd8-67aca101a61f/listviewicon.png",
  },
  Summit: {
    name: "Summit",
    location: "Mount Sanqing, Jiangxi, China",
    callout: "Radiant academy hub with destructible terrain walls",
    color: "from-slate-900 to-indigo-950",
    splash: "https://media.valorant-api.com/maps/756da597-416b-c0f2-f47b-afbdf28670bc/splash.png",
    listViewIcon: "https://media.valorant-api.com/maps/756da597-416b-c0f2-f47b-afbdf28670bc/listviewicon.png",
  },
};

export const VALORANT_ROLES = [
  "Duelist",
  "Initiator",
  "Controller",
  "Sentinel",
  "Flex",
] as const;

export type ValorantRole = typeof VALORANT_ROLES[number];

export interface AgentInfo {
  name: string;
  role: Exclude<ValorantRole, "Flex">;
  color: string;
  icon: string;
}

export const VALORANT_AGENTS: AgentInfo[] = [
  { name: "Astra", role: "Controller", color: "#A855F7", icon: "https://media.valorant-api.com/agents/41fb69c1-4189-7b37-f117-bcaf1e96f1bf/displayicon.png" },
  { name: "Breach", role: "Initiator", color: "#EA580C", icon: "https://media.valorant-api.com/agents/5f8d3a7f-467b-97f3-062c-13acf203c006/displayicon.png" },
  { name: "Brimstone", role: "Controller", color: "#D97706", icon: "https://media.valorant-api.com/agents/9f0d8ba9-4140-b941-57d3-a7ad57c6b417/displayicon.png" },
  { name: "Chamber", role: "Sentinel", color: "#EAB308", icon: "https://media.valorant-api.com/agents/22697a3d-45bf-8dd7-4fec-84a9e28c69d7/displayicon.png" },
  { name: "Clove", role: "Controller", color: "#F472B6", icon: "https://media.valorant-api.com/agents/1dbf2edd-4729-0984-3115-daa5eed44993/displayicon.png" },
  { name: "Cypher", role: "Sentinel", color: "#E2E8F0", icon: "https://media.valorant-api.com/agents/117ed9e3-49f3-6512-3ccf-0cada7e3823b/displayicon.png" },
  { name: "Deadlock", role: "Sentinel", color: "#67E8F9", icon: "https://media.valorant-api.com/agents/cc8b64c8-4b25-4ff9-6e7f-37b4da43d235/displayicon.png" },
  { name: "Fade", role: "Initiator", color: "#94A3B8", icon: "https://media.valorant-api.com/agents/dade69b4-4f5a-8528-247b-219e5a1facd6/displayicon.png" },
  { name: "Gekko", role: "Initiator", color: "#A3E635", icon: "https://media.valorant-api.com/agents/e370fa57-4757-3604-3648-499e1f642d3f/displayicon.png" },
  { name: "Harbor", role: "Controller", color: "#06B6D4", icon: "https://media.valorant-api.com/agents/95b78ed7-4637-86d9-7e41-71ba8c293152/displayicon.png" },
  { name: "Iso", role: "Duelist", color: "#818CF8", icon: "https://media.valorant-api.com/agents/0e38b510-41a8-5780-5e8f-568b2a4f2d6c/displayicon.png" },
  { name: "Jett", role: "Duelist", color: "#38BDF8", icon: "https://media.valorant-api.com/agents/add6443a-41bd-e414-f6ad-e58d267f4e95/displayicon.png" },
  { name: "KAY/O", role: "Initiator", color: "#0284C7", icon: "https://media.valorant-api.com/agents/601dbbe7-43ce-be57-2a40-4abd24953621/displayicon.png" },
  { name: "Killjoy", role: "Sentinel", color: "#FBBF24", icon: "https://media.valorant-api.com/agents/1e58de9c-4950-5125-93e9-a0aee9f98746/displayicon.png" },
  { name: "Neon", role: "Duelist", color: "#22D3EE", icon: "https://media.valorant-api.com/agents/bb2a4828-46eb-8cd1-e765-15848195d751/displayicon.png" },
  { name: "Omen", role: "Controller", color: "#6366F1", icon: "https://media.valorant-api.com/agents/8e253930-4c05-31dd-1b6c-968525494517/displayicon.png" },
  { name: "Phoenix", role: "Duelist", color: "#F97316", icon: "https://media.valorant-api.com/agents/eb93336a-449b-9c1b-0a54-a891f7921d69/displayicon.png" },
  { name: "Raze", role: "Duelist", color: "#FB923C", icon: "https://media.valorant-api.com/agents/f94c3b30-42be-e959-889c-5aa313dba261/displayicon.png" },
  { name: "Reyna", role: "Duelist", color: "#C084FC", icon: "https://media.valorant-api.com/agents/a3bfb853-43b2-7238-a4f1-ad90e9e46bcc/displayicon.png" },
  { name: "Sage", role: "Sentinel", color: "#34D399", icon: "https://media.valorant-api.com/agents/569fdd95-4d10-43ab-ca70-79becc718b46/displayicon.png" },
  { name: "Skye", role: "Initiator", color: "#4ADE80", icon: "https://media.valorant-api.com/agents/6f2a04ca-43e0-be17-7f36-b3908627744d/displayicon.png" },
  { name: "Sova", role: "Initiator", color: "#38BDF8", icon: "https://media.valorant-api.com/agents/320b2a48-4d9b-a075-30f1-1f93a9b638fa/displayicon.png" },
  { name: "Tejo", role: "Initiator", color: "#F59E0B", icon: "https://media.valorant-api.com/agents/b444168c-4e35-8076-db47-ef9bf368f384/displayicon.png" },
  { name: "Viper", role: "Controller", color: "#10B981", icon: "https://media.valorant-api.com/agents/707eab51-4836-f488-046a-cda6bf494859/displayicon.png" },
  { name: "Vyse", role: "Sentinel", color: "#C084FC", icon: "https://media.valorant-api.com/agents/efba5359-4016-a1e5-7626-b1ae76895940/displayicon.png" },
  { name: "Waylay", role: "Duelist", color: "#FACC15", icon: "https://media.valorant-api.com/agents/df1cb487-4902-002e-5c17-d28e83e78588/displayicon.png" },
  { name: "Yoru", role: "Duelist", color: "#60A5FA", icon: "https://media.valorant-api.com/agents/7f94d92c-4234-0a36-9646-3a87eb8b5c89/displayicon.png" },
];

export const AGENT_ROLE_COLORS: Record<ValorantRole, { badge: string; text: string; bg: string }> = {
  Duelist: { badge: "bg-rose-500/15 text-rose-400 border-rose-500/30", text: "text-rose-400", bg: "bg-rose-500" },
  Initiator: { badge: "bg-amber-500/15 text-amber-400 border-amber-500/30", text: "text-amber-400", bg: "bg-amber-500" },
  Controller: { badge: "bg-purple-500/15 text-purple-400 border-purple-500/30", text: "text-purple-400", bg: "bg-purple-500" },
  Sentinel: { badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", text: "text-emerald-400", bg: "bg-emerald-500" },
  Flex: { badge: "bg-sky-500/15 text-sky-400 border-sky-500/30", text: "text-sky-400", bg: "bg-sky-500" },
};

export function getAgentInfo(agentName: string): AgentInfo | undefined {
  return VALORANT_AGENTS.find(
    (a) => a.name.toLowerCase() === agentName.toLowerCase()
  );
}

export function getAgentIcon(agentName: string): string {
  const agent = getAgentInfo(agentName);
  return agent ? agent.icon : "https://media.valorant-api.com/agents/add6443a-41bd-e414-f6ad-e58d267f4e95/displayicon.png";
}

export function getMapDetails(mapName: string): MapDetails | undefined {
  return MAP_METADATA[mapName as ValorantMap];
}

export function getMapSplash(mapName: string): string {
  const map = getMapDetails(mapName);
  return map ? map.splash : "https://media.valorant-api.com/maps/7eaecc1b-4337-bbf6-6ab9-04b8f06b3319/splash.png";
}

export function getMapListViewIcon(mapName: string): string {
  const map = getMapDetails(mapName);
  return map ? map.listViewIcon : "https://media.valorant-api.com/maps/7eaecc1b-4337-bbf6-6ab9-04b8f06b3319/listviewicon.png";
}

