import Link from "next/link";
import { CircleHelp } from "lucide-react";

type KpiVariant = "default" | "win" | "loss" | "neutral" | "highlight";

interface KpiCardProps {
  href?: string;
  label: string;
  value: string | number;
  subtitle?: string;
  detail?: string;
  definition?: string;
  variant?: KpiVariant;
}

const VALUE_COLOR: Record<KpiVariant, string> = {
  default: "text-white",
  win: "text-emerald-400",
  loss: "text-[#FF4655]",
  neutral: "text-white",
  highlight: "text-sky-400",
};

export function KpiCard({
  href,
  label,
  value,
  subtitle,
  detail,
  definition,
  variant = "neutral",
}: KpiCardProps) {
  const body = (
    <>
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#94A3B8]">
          {label}
        </span>
        {definition && (
          <span
            title={definition}
            className="inline-flex cursor-help text-[#64748B] hover:text-[#CBD5E1]"
          >
            <CircleHelp className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="sr-only">{definition}</span>
          </span>
        )}
      </div>
      <span
        className={`mt-3 text-4xl font-bold leading-none tabular-nums ${VALUE_COLOR[variant]}`}
      >
        {value}
      </span>
      {subtitle && (
        <span className="mt-3 text-xs leading-relaxed text-[#CBD5E1]">
          {subtitle}
        </span>
      )}
      {detail && (
        <span className="mt-1 text-[11px] leading-relaxed text-[#64748B]">
          {detail}
        </span>
      )}
    </>
  );

  const baseClass =
    "flex min-h-[148px] flex-col justify-between rounded-xl border border-[#1C2433] bg-[#0C1017] p-5";

  if (href) {
    return (
      <Link
        href={href}
        aria-label={`${label}: ${value}${subtitle ? `. ${subtitle}` : ""}`}
        className={`${baseClass} group cursor-pointer transition-all hover:border-[#2A364F] hover:bg-[#0F141C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4655]`}
      >
        {body}
      </Link>
    );
  }
  return <div className={baseClass}>{body}</div>;
}
