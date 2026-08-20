import React from "react";
import { cn } from "@/lib/utils/cn";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  detail?: string;
  code?: string;
  icon?: any;
  variant?: "default" | "win" | "loss" | "highlight" | "amber" | "neutral" | "trade";
}

export function KpiCard({
  title,
  value,
  subtitle,
  detail,
  code,
  variant = "default",
}: KpiCardProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case "win":
        return {
          borderAccent: "border-l-2 border-l-emerald-400",
          valColor: "text-emerald-400",
          statusDot: "bg-emerald-400",
        };
      case "loss":
        return {
          borderAccent: "border-l-2 border-l-[#FF4655]",
          valColor: "text-[#FF4655]",
          statusDot: "bg-[#FF4655]",
        };
      case "trade":
      case "neutral":
        return {
          borderAccent: "border-l-2 border-l-sky-400",
          valColor: "text-white",
          statusDot: "bg-sky-400",
        };
      case "highlight":
        return {
          borderAccent: "border-l-2 border-l-sky-400",
          valColor: "text-white",
          statusDot: "bg-sky-400",
        };
      case "amber":
        return {
          borderAccent: "border-l-2 border-l-amber-400",
          valColor: "text-amber-400",
          statusDot: "bg-amber-400",
        };
      default:
        return {
          borderAccent: "border-l-2 border-l-[#334155]",
          valColor: "text-white",
          statusDot: "bg-[#475569]",
        };
    }
  };

  const style = getVariantClasses();

  return (
    <div
      className={cn(
        "rounded-lg border border-[#1C2433] bg-[#0C1017] p-4 sm:p-5 shadow-sm transition-all duration-200 hover:border-[#2A364F] flex flex-col justify-between relative overflow-hidden",
        style.borderAccent
      )}
    >
      {/* Top Header: Monospace Technical Tag */}
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] font-semibold tracking-wider text-[#94A3B8] uppercase">
          // {title}
        </span>
        {code ? (
          <span className="font-mono text-[10px] text-[#64748B] tracking-widest font-bold">
            [{code}]
          </span>
        ) : (
          <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", style.statusDot)} />
        )}
      </div>

      {/* Hero Metric Number in Game-Native Tactical Typography */}
      <div className="mt-3.5">
        <div
          className={cn(
            "font-tactical text-3xl sm:text-4xl font-extrabold uppercase tracking-tight tabular-nums",
            style.valColor
          )}
        >
          {value}
        </div>

        {/* Inline Monospace Telemetry Subtitle */}
        {subtitle && (
          <div className="mt-1 font-mono text-xs text-[#94A3B8] tracking-tight truncate">
            {subtitle}
          </div>
        )}
        {detail && (
          <div className="mt-0.5 font-mono text-[10px] text-[#64748B] tracking-tight truncate">
            {detail}
          </div>
        )}
      </div>
    </div>
  );
}
