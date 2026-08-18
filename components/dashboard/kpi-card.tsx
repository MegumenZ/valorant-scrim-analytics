import React from "react";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
      borderGlow: "hover:border-[#2b3d5c]",
      iconBg: "bg-[#141d2b] text-[#8b9bb4] border-[#1f2c42]",
      textValue: "text-white",
      tagColor: "text-[#8b9bb4]",
      accentBar: "bg-[#8b9bb4]",
    },
    win: {
      borderGlow: "hover:border-[#10E7B2]/50",
      iconBg: "bg-[#10E7B2]/10 text-[#10E7B2] border-[#10E7B2]/30",
      textValue: "text-[#10E7B2]",
      tagColor: "text-[#10E7B2]",
      accentBar: "bg-[#10E7B2]",
    },
    loss: {
      borderGlow: "hover:border-[#FF4655]/50",
      iconBg: "bg-[#FF4655]/10 text-[#FF4655] border-[#FF4655]/30",
      textValue: "text-[#FF4655]",
      tagColor: "text-[#FF4655]",
      accentBar: "bg-[#FF4655]",
    },
    highlight: {
      borderGlow: "hover:border-[#FF4655]/50",
      iconBg: "bg-[#FF4655]/10 text-[#FF4655] border-[#FF4655]/30",
      textValue: "text-white",
      tagColor: "text-[#FF4655]",
      accentBar: "bg-[#FF4655]",
    },
    amber: {
      borderGlow: "hover:border-[#FFD166]/50",
      iconBg: "bg-[#FFD166]/10 text-[#FFD166] border-[#FFD166]/30",
      textValue: "text-[#FFD166]",
      tagColor: "text-[#FFD166]",
      accentBar: "bg-[#FFD166]",
    },
  };

  const style = variantStyles[variant];

  return (
    <div className={cn("relative rounded-lg border border-[#1f2c42] bg-[#0c111a]/95 p-4 sm:p-5 shadow-lg backdrop-blur-sm transition-all duration-200 group overflow-hidden", style.borderGlow)}>
      {/* Top Accent Strip */}
      <div className={cn("absolute top-0 left-0 right-0 h-[2px] opacity-80", style.accentBar)} />

      {/* Header Row: Telemetry Tag & Icon */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1f2c42]/60">
        <div className="flex items-center gap-1.5">
          <span className="font-mono-stat text-[10px] text-[#54657e] tracking-widest">//</span>
          <span className="font-display font-bold uppercase text-xs text-[#8b9bb4] tracking-wider">
            {title}
          </span>
        </div>
        <div className={cn("p-1.5 rounded-[4px] border", style.iconBg)}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Value Display */}
      <div className="mt-3">
        <div className={cn("font-display font-black text-3xl sm:text-4xl tracking-wider tabular-nums leading-none", style.textValue)}>
          {value}
        </div>
        {subtitle && (
          <p className="mt-2 font-mono-stat text-xs text-[#ece8e1] font-semibold tracking-tight">
            {subtitle}
          </p>
        )}
        {detail && (
          <p className="mt-0.5 font-mono-stat text-[10px] text-[#54657e]">
            {detail}
          </p>
        )}
      </div>
    </div>
  );
}

