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
      iconBg: "bg-[#1c2432] text-slate-300 border-[#242e40]",
      textValue: "text-slate-100",
    },
    win: {
      iconBg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      textValue: "text-emerald-400",
    },
    loss: {
      iconBg: "bg-rose-500/15 text-rose-400 border-rose-500/30",
      textValue: "text-rose-400",
    },
    highlight: {
      iconBg: "bg-rose-500/15 text-rose-400 border-rose-500/30",
      textValue: "text-rose-400",
    },
    amber: {
      iconBg: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      textValue: "text-amber-400",
    },
  };

  const style = variantStyles[variant];

  return (
    <Card className="hover:border-[#334155] transition-all bg-[#141a24]">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">
            {title}
          </span>
          <div className={cn("p-2 rounded-lg border", style.iconBg)}>
            <Icon className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3">
          <div className={cn("text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums", style.textValue)}>
            {value}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-300 font-medium">
              {subtitle}
            </p>
          )}
          {detail && (
            <p className="mt-0.5 text-[11px] text-slate-400">
              {detail}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
