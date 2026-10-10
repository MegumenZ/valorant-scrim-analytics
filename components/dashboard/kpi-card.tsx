import Link from "next/link";
import { CircleHelp } from "lucide-react";

interface KpiCardProps {
  href?: string;
  title: string;
  value: string | number;
  subtitle: string;
  definition?: string;
  detail?: string;
  variant?: "default" | "win" | "loss" | "highlight" | "amber" | "neutral" | "trade";
}

export function KpiCard({ href, title, value, subtitle, definition, detail, variant = "neutral" }: KpiCardProps) {
  const valueColor = variant === "win" ? "text-emerald-400" : variant === "loss" ? "text-[#FF4655]" : "text-white";
  const cardClass = `flex min-h-[148px] flex-col justify-between rounded-xl border border-[#1C2433] bg-[#0C1017] p-6 ${href ? "group cursor-pointer transition-shadow hover:ring-1 hover:ring-[#FF4655] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4655]" : ""}`;
  const accessibleLabel = `${title}: ${value}. ${subtitle}${definition ? `. ${definition}` : ""}`;
  const content = <>
    <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#CBD5E1]">{title}{definition && <span title={definition} aria-hidden="true" className="inline-flex"><CircleHelp className="h-3.5 w-3.5" /></span>}</span>
    <span className={`mt-3 font-sans text-4xl font-bold leading-none tabular-nums ${valueColor}`}>{value}</span>
    <span className="mt-3 text-xs leading-relaxed text-[#CBD5E1]">{subtitle}</span>
    {detail && <span className="mt-1 text-[11px] leading-relaxed text-[#CBD5E1]">{detail}</span>}
  </>;
  return href ? <Link href={href} aria-label={accessibleLabel} className={cardClass}>{content}</Link> : <div className={cardClass}>{content}</div>;
}
