"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Swords,
  PlusCircle,
  Users,
  Map as MapIcon,
  ChevronRight,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useUserRole } from "./role-context";

const navItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Riwayat Scrim",
    href: "/matches",
    icon: Swords,
  },
  {
    label: "Roster Pemain",
    href: "/roster",
    icon: Users,
  },
  {
    label: "Statistik Map",
    href: "/maps",
    icon: MapIcon,
  },
];

export function Sidebar({ className, onClose }: { className?: string; onClose?: () => void }) {
  const pathname = usePathname();
  const { isAdmin } = useUserRole();

  const isNewMatchActive = pathname.startsWith("/matches/new") || pathname.includes("/edit");

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-[#090C10] border-r border-[#1C2433] w-64 select-none",
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#1C2433]">
        <div className="w-9 h-9 rounded-lg bg-[#161D28] border border-[#2A364F] flex items-center justify-center p-1.5 shadow-sm shrink-0">
          <img
            src="/team-sc-logo.png"
            alt="Team SC Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold text-white tracking-tight leading-tight">
            Team SC
          </h2>
          <p className="text-xs text-[#94A3B8] font-normal truncate">
            Scrim Analytics
          </p>
        </div>
      </div>

      {/* Primary Highlighted Action for Admin */}
      {isAdmin && (
        <div className="px-3 pt-3 pb-1">
          <Link
            href="/matches/new"
            onClick={onClose}
            className={cn(
              "flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-lg text-xs font-semibold tracking-wide transition-all shadow-sm",
              isNewMatchActive
                ? "bg-[#FF4655] text-white shadow-md shadow-[#FF4655]/25 ring-2 ring-[#FF4655]/40"
                : "bg-[#FF4655] hover:bg-[#E03A48] text-white shadow-sm shadow-[#FF4655]/20 active:scale-[0.98]"
            )}
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span>Catat Scrim</span>
          </Link>
        </div>
      )}

      {/* Navigation Menu */}
      <div className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
          Menu Utama
        </div>
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
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group",
                isActive
                  ? "bg-[#161D28] text-white font-semibold border border-[#2A364F]"
                  : "text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#161D28]/60 border border-transparent"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isActive ? "text-[#FF4655]" : "text-[#64748B] group-hover:text-[#94A3B8]"
                  )}
                />
                <span>{item.label}</span>
              </div>

              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF4655]" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Clean Minimalist Footer */}
      <div className="p-4 border-t border-[#1C2433]">
        <div className="flex items-center justify-between text-xs text-[#64748B]">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span>Team SC Official</span>
          </div>
          <span className="text-[11px]">Musim 2026</span>
        </div>
      </div>
    </aside>
  );
}


