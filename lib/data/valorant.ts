export const VALORANT_MAPS = [
  "Ascent",
  "Bind",
  "Haven",
  "Split",
  "Icebox",
  "Breeze",
  "Lotus",
  "Sunset",
  "Abyss",
] as const;

export type ValorantMap = typeof VALORANT_MAPS[number];

export const MAP_METADATA: Record<ValorantMap, { name: string; location: string; callout: string; color: string }> = {
  Ascent: { name: "Ascent", location: "Venice, Italy", callout: "Open mid area with mechanical doors", color: "from-sky-900 to-indigo-950" },
  Bind: { name: "Bind", location: "Rabat, Morocco", callout: "Two sites with one-way teleporters", color: "from-amber-900 to-stone-950" },
  Haven: { name: "Haven", location: "Thimphu, Bhutan", callout: "Three sites (A, B, C) layout", color: "from-emerald-900 to-slate-950" },
  Split: { name: "Split", location: "Tokyo, Japan", callout: "Elevated sites with rope ascenders", color: "from-purple-900 to-slate-950" },
  Icebox: { name: "Icebox", location: "Bennett Island, Russia", callout: "Multi-level verticality & ziplines", color: "from-cyan-900 to-blue-950" },
  Breeze: { name: "Breeze", location: "Bermuda Triangle", callout: "Expansive sightlines & long range duels", color: "from-teal-900 to-cyan-950" },
  Lotus: { name: "Lotus", location: "Western Ghats, India", callout: "Three sites with rotating stone doors", color: "from-rose-900 to-amber-950" },
  Sunset: { name: "Sunset", location: "Los Angeles, USA", callout: "Classic three-lane tactical structure", color: "from-orange-900 to-rose-950" },
  Abyss: { name: "Abyss", location: "Unknown Location", callout: "Zero-boundary map with fall hazards", color: "from-blue-950 to-indigo-950" },
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
}

export const VALORANT_AGENTS: AgentInfo[] = [
  // Duelists
  { name: "Jett", role: "Duelist", color: "#38BDF8" },
  { name: "Raze", role: "Duelist", color: "#FB923C" },
  { name: "Reyna", role: "Duelist", color: "#C084FC" },
  { name: "Yoru", role: "Duelist", color: "#60A5FA" },
  { name: "Phoenix", role: "Duelist", color: "#F97316" },
  { name: "Neon", role: "Duelist", color: "#22D3EE" },
  { name: "Iso", role: "Duelist", color: "#818CF8" },

  // Initiators
  { name: "Sova", role: "Initiator", color: "#38BDF8" },
  { name: "Fade", role: "Initiator", color: "#94A3B8" },
  { name: "Breach", role: "Initiator", color: "#EA580C" },
  { name: "Skye", role: "Initiator", color: "#4ADE80" },
  { name: "KAY/O", role: "Initiator", color: "#0284C7" },
  { name: "Gekko", role: "Initiator", color: "#A3E635" },
  { name: "Tejo", role: "Initiator", color: "#F59E0B" },

  // Controllers
  { name: "Omen", role: "Controller", color: "#6366F1" },
  { name: "Brimstone", role: "Controller", color: "#D97706" },
  { name: "Viper", role: "Controller", color: "#10B981" },
  { name: "Astra", role: "Controller", color: "#A855F7" },
  { name: "Harbor", role: "Controller", color: "#06B6D4" },
  { name: "Clove", role: "Controller", color: "#F472B6" },

  // Sentinels
  { name: "Killjoy", role: "Sentinel", color: "#FBBF24" },
  { name: "Cypher", role: "Sentinel", color: "#E2E8F0" },
  { name: "Sage", role: "Sentinel", color: "#34D399" },
  { name: "Chamber", role: "Sentinel", color: "#EAB308" },
  { name: "Deadlock", role: "Sentinel", color: "#67E8F9" },
  { name: "Vyse", role: "Sentinel", color: "#C084FC" },
];

export const AGENT_ROLE_COLORS: Record<ValorantRole, { badge: string; text: string; bg: string }> = {
  Duelist: { badge: "bg-rose-500/15 text-rose-400 border-rose-500/30", text: "text-rose-400", bg: "bg-rose-500" },
  Initiator: { badge: "bg-amber-500/15 text-amber-400 border-amber-500/30", text: "text-amber-400", bg: "bg-amber-500" },
  Controller: { badge: "bg-purple-500/15 text-purple-400 border-purple-500/30", text: "text-purple-400", bg: "bg-purple-500" },
  Sentinel: { badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", text: "text-emerald-400", bg: "bg-emerald-500" },
  Flex: { badge: "bg-sky-500/15 text-sky-400 border-sky-500/30", text: "text-sky-400", bg: "bg-sky-500" },
};
