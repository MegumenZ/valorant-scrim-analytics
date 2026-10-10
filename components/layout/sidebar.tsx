"use client";

/* eslint-disable @next/next/no-img-element -- Native logo image avoids Vercel image optimization usage. */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Swords,
  PlusCircle,
  Users,
  Map as MapIcon,
  ChevronRight,
  ChevronLeft,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useUserRole } from "./role-context";
import { useTranslation } from "@/lib/i18n/context";

export function Sidebar({ className, onClose }: { className?: string; onClose?: () => void }) {
  const pathname = usePathname();
  const { isAdmin } = useUserRole();
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);

  const isNewMatchActive = pathname.startsWith("/matches/new") || pathname.includes("/edit");

  const navItems = [
    {
      label: t.common.dashboard,
      href: "/",
      icon: LayoutDashboard,
    },
    {
      label: t.common.matches,
      href: "/matches",
      icon: Swords,
    },
    {
      label: t.common.roster,
      href: "/roster",
      icon: Users,
    },
    {
      label: t.common.mapAnalytics,
      href: "/maps",
      icon: MapIcon,
    },
  ];

  return (
    <aside
      className={cn(
        "flex h-full flex-col select-none border-r border-[#1C2433] bg-[#090C10] transition-[width] duration-200",
        collapsed ? "w-[76px]" : "w-64",
        className
      )}
    >
      {/* Brand Header */}
      <div className={`flex items-center border-b border-[#1C2433] py-4 ${collapsed ? "flex-col gap-2 px-2" : "gap-3 px-4"}`}>
        <div className="w-9 h-9 rounded-lg bg-[#161D28] border border-[#2A364F] flex items-center justify-center p-1.5 shadow-sm shrink-0">
          <img
            src="/team-sc-logo.png"
            alt="Team SC Logo"
            width={36}
            height={36}
            className="w-full h-full object-contain"
          />
        </div>
        {!collapsed && <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold text-white tracking-tight leading-tight">
            Team SC
          </h2>
          <p className="text-xs text-[#94A3B8] font-normal truncate">
            {t.nav.scrimAnalytics}
          </p>
        </div>}
        <button type="button" aria-label={collapsed ? t.nav.expandSidebar : t.nav.collapseSidebar} title={collapsed ? t.nav.expandSidebar : t.nav.collapseSidebar} onClick={() => setCollapsed((value) => !value)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#CBD5E1] hover:bg-[#161D28] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4655]">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Primary Highlighted Action for Admin */}
      {isAdmin && (
        <div className={`pt-3 pb-1 ${collapsed ? "px-2" : "px-3"}`}>
          <Link
            href="/matches/new"
            onClick={onClose}
            aria-label={collapsed ? t.common.recordScrim : undefined}
            title={collapsed ? t.common.recordScrim : undefined}
            className={cn("flex min-h-11 w-full items-center justify-center gap-2 rounded-lg px-2 py-2.5 text-xs font-semibold tracking-wide text-white transition-all hover:bg-red-600 active:scale-[0.98]", isNewMatchActive ? "bg-red-500 ring-1 ring-red-300/60" : "bg-red-600")}
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            {!collapsed && <span>{t.common.recordScrim}</span>}
          </Link>
        </div>
      )}

      {/* Navigation Menu */}
      <div className={`min-h-0 flex-1 space-y-1 overflow-y-auto py-3 ${collapsed ? "px-2" : "px-3"}`}>
        {!collapsed && <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[#CBD5E1]">{t.nav.overview}</div>}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : item.href === "/matches"
              ? pathname === "/matches" || (pathname.startsWith("/matches/") && !pathname.startsWith("/matches/new") && !pathname.includes("/edit"))
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              title={collapsed ? item.label : undefined}
              aria-label={collapsed ? item.label : undefined}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex min-h-11 items-center gap-3 rounded-lg border-y border-r px-3 py-2.5 text-xs font-medium transition-colors group",
                collapsed && "justify-center px-0",
                isActive ? "border-y-[#1C2433] border-r-[#1C2433] border-l-2 border-l-[#FF4655] bg-[#0C1017] font-semibold text-white" : "border-y-transparent border-r-transparent border-l-2 border-l-transparent text-[#CBD5E1] hover:bg-[#141A24] hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive ? "text-[#FF4655]" : "text-[#CBD5E1] group-hover:text-white"
                  )}
                />
                {!collapsed && <span>{item.label}</span>}
              </div>

            </Link>
          );
        })}
      </div>

      {/* Clean Minimalist Footer */}
      <div className={`border-t border-[#1C2433] ${collapsed ? "p-3" : "p-4"}`}>
        <div className={`flex items-center text-xs text-[#CBD5E1] ${collapsed ? "justify-center" : "justify-between"}`}>
          <div className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 shrink-0 text-[#CBD5E1]" />
            {!collapsed && <span>Team SC Official</span>}
          </div>
          {!collapsed && <span className="text-[11px]">2026</span>}
        </div>
      </div>
    </aside>
  );
}


