import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, eyebrow, action }: PageHeaderProps) {
  return <header className="flex flex-col justify-between gap-4 border-b border-[#1C2433] pb-5 sm:flex-row sm:items-end">
    <div className="min-w-0">
      {eyebrow && <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FF4655]">{eyebrow}</p>}
      <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h1>
      {description && <p className="mt-1 text-sm leading-relaxed text-[#CBD5E1]">{description}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </header>;
}
