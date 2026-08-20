"use client";

import React, { useState } from "react";
import { getAgentIcon, VALORANT_AGENTS } from "@/lib/data/valorant";

interface AgentAvatarProps {
  agentName: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function AgentAvatar({
  agentName,
  className = "",
  size = "md",
}: AgentAvatarProps) {
  const [hasError, setHasError] = useState(false);

  const agentInfo = VALORANT_AGENTS.find((a) => a.name === agentName);
  const iconUrl = getAgentIcon(agentName);

  const sizeClasses = {
    sm: "w-5 h-5 text-[9px]",
    md: "w-6 h-6 text-[10px]",
    lg: "w-8 h-8 text-xs",
  }[size];

  if (hasError || !iconUrl) {
    const initials = agentName.substring(0, 2).toUpperCase();
    return (
      <div
        className={`rounded-full bg-[#161D28] border border-[#2A364F] flex items-center justify-center font-bold text-white shrink-0 select-none ${sizeClasses} ${className}`}
        style={{ borderColor: agentInfo?.color || "#38BDF8" }}
        title={agentName}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={iconUrl}
      alt={agentName}
      onError={() => setHasError(true)}
      className={`rounded-full bg-[#161D28] border border-[#2A364F] object-cover shrink-0 select-none ${sizeClasses} ${className}`}
      loading="lazy"
      decoding="async"
    />
  );
}
