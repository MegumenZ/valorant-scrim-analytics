"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Swords,
  PlusCircle,
  Users,
  Map as MapIcon,
  Crosshair,
  Shield,
  ChevronRight,
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
    label: "Riwayat Match",
    href: "/matches",
    icon: Swords,
  },
  {
    label: "Catat Match Baru",
    href: "/matches/new",
    icon: PlusCircle,
    badge: "Quick",
    adminOnly: true,
  },
  {
    label: "Roster Tim",
    href: "/roster",
    icon: Users,
  },
  {
    label: "Analitik Map",
    href: "/maps",
    icon: MapIcon,
  },
];

export function Sidebar({ className, onClose }: { className?: string; onClose?: () => void }) {
  const pathname = usePathname();
  const { isAdmin } = useUserRole();

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-[#0e131b] border-r border-[#242e40] w-64 select-none",
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#242e40]/70">
        <div className="w-10 h-10 rounded-xl bg-[#141a24] border border-[#242e40] flex items-center justify-center p-1 shadow-md shrink-0 overflow-hidden">
          <img
            src="/team-sc-logo.png"
            alt="Team SC Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-sm tracking-tight text-slate-100">
              TEAM <span className="text-rose-500">SC</span>
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
              PRO
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Valorant Scrim Hub</p>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Menu Utama
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          if (item.adminOnly && !isAdmin) {
            return null;
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group",
                isActive
                  ? "bg-rose-500/15 text-rose-400 font-semibold border border-rose-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-100 hover:bg-[#151b26] border border-transparent"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isActive ? "text-rose-400" : "text-slate-400 group-hover:text-slate-200"
                  )}
                />
                <span>{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-rose-500 text-white">
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-rose-400" />}
              </div>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
