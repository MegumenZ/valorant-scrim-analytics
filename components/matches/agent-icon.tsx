"use client";

/* eslint-disable @next/next/no-img-element -- Existing CDN icons avoid Vercel image optimization usage. */

import { useState } from "react";
import { getAgentIcon, getAgentInfo } from "@/lib/data/valorant";

export function AgentIcon({ agentName, size = 28 }: { agentName: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const info = getAgentInfo(agentName);
  if (failed || !info) {
    return <span aria-hidden="true" className="inline-flex shrink-0 items-center justify-center rounded-full border border-slate-600 bg-slate-800 font-bold text-slate-100" style={{ width: size, height: size, fontSize: Math.max(9, Math.round(size * 0.35)) }}>{agentName.slice(0, 2).toUpperCase()}</span>;
  }
  return <img src={getAgentIcon(agentName)} alt={agentName} width={size} height={size} loading="lazy" decoding="async" onError={() => setFailed(true)} className="shrink-0 rounded-full border border-slate-700 bg-slate-800 object-cover" />;
}

export function AgentBadge({ agentName }: { agentName: string }) {
  return <span className="inline-flex items-center gap-2"><AgentIcon agentName={agentName} size={28} /><span>{agentName}</span></span>;
}
