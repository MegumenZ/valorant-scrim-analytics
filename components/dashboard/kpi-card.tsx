import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  detail?: string;
  icon: LucideIcon;
  variant?: "default" | "win" | "loss" | "highlight" | "amber";
}

export function KpiCard({
  title,
  value,
  subtitle,
  detail,
  icon: Icon,
  variant = "default",
}: KpiCardProps) {
  const variantStyles = {
    default: {
      iconBg: "bg-[#161D28] text-[#94A3B8] border-[#1C2433]",
      textValue: "text-white",
    },
    win: {
      iconBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      textValue: "text-emerald-400",
    },
    loss: {
      iconBg: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      textValue: "text-rose-400",
    },
    highlight: {
      iconBg: "bg-rose-500/10 text-[#FF4655] border-rose-500/20",
      textValue: "text-white",
    },
    amber: {
      iconBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      textValue: "text-amber-400",
    },
  };

  const style = variantStyles[variant];

  return (
    <div className="rounded-xl border border-[#1C2433] bg-[#0F141C] p-5 shadow-sm transition-all duration-200 hover:border-[#2A364F] flex flex-col justify-between">
      {/* Header Row: Clean Title & Icon */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-[#94A3B8]">
          {title}
        </span>
        <div className={cn("p-2 rounded-lg border", style.iconBg)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      {/* Value Display */}
      <div className="mt-4">
        <div className={cn("text-2xl sm:text-3xl font-bold tracking-tight tabular-nums", style.textValue)}>
          {value}
        </div>
        {subtitle && (
          <p className="mt-1.5 text-xs text-[#CBD5E1] font-medium">
            {subtitle}
          </p>
        )}
        {detail && (
          <p className="mt-0.5 text-[11px] text-[#64748B]">
            {detail}
          </p>
        )}
      </div>
    </div>
  );
}


