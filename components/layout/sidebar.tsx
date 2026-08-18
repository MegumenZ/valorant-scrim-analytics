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
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useUserRole } from "./role-context";

const navItems = [
  {
    idx: "01",
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    idx: "02",
    label: "Riwayat Scrim",
    href: "/matches",
    icon: Swords,
  },
  {
    idx: "03",
    label: "Catat Match",
    href: "/matches/new",
    icon: PlusCircle,
    badge: "ACT",
    adminOnly: true,
  },
  {
    idx: "04",
    label: "Roster Skuad",
    href: "/roster",
    icon: Users,
  },
  {
    idx: "05",
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
        "flex flex-col h-full bg-[#090D14] border-r border-[#1f2c42] w-64 select-none relative",
        className
      )}
    >
      {/* Tactical Grid Overlay */}
      <div className="absolute inset-0 bg-tactical-grid opacity-40 pointer-events-none" />

      {/* Brand Header */}
      <div className="relative flex items-center gap-3 px-5 py-4 border-b border-[#1f2c42] bg-[#0c111a]/80">
        <div className="w-10 h-10 rounded-md bg-[#121824] border border-[#2b3d5c] flex items-center justify-center p-1.5 shadow-md shrink-0 relative group">
          <img
            src="/team-sc-logo.png"
            alt="Team SC Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-display font-black text-sm tracking-wider text-white">
              TEAM <span className="text-[#FF4655]">SC</span>
            </span>
            <span className="font-display text-[9px] font-black px-1.5 py-0.2 rounded-[2px] bg-[#FF4655]/20 text-[#FF4655] border border-[#FF4655]/40">
              VCT
            </span>
          </div>
          <p className="text-[10px] font-mono-stat text-[#8b9bb4] tracking-tight truncate">
            // TACTICAL.SCRIM.HUB
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <div className="relative flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="flex items-center justify-between px-3 pb-2 text-[10px] font-mono-stat text-[#54657e] uppercase tracking-widest">
          <span>// NAVIGATION</span>
          <span>SYS.01</span>
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
                "flex items-center justify-between px-3 py-2 rounded-md text-xs font-display uppercase tracking-wider transition-all group relative",
                isActive
                  ? "bg-[#FF4655]/15 text-white font-bold border-l-2 border-[#FF4655] shadow-sm shadow-[#FF4655]/10"
                  : "text-[#8b9bb4] hover:text-white hover:bg-[#121824] border-l-2 border-transparent"
              )}
            >
              <div className="flex items-center gap-2.5">
                <span className="font-mono-stat text-[10px] text-[#54657e] group-hover:text-[#8b9bb4]">
                  {item.idx}
                </span>
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isActive ? "text-[#FF4655]" : "text-[#8b9bb4] group-hover:text-white"
                  )}
                />
                <span className="tracking-wide">{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {item.badge && (
                  <span className="px-1.5 py-0.2 text-[9px] font-mono-stat font-bold rounded-[2px] bg-[#FF4655] text-white">
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#FF4655]" />}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Tactical Status Telemetry Footer */}
      <div className="relative p-3.5 border-t border-[#1f2c42] bg-[#0c111a]/80">
        <div className="p-2 rounded border border-[#1f2c42] bg-[#080B10] flex items-center justify-between text-[10px] font-mono-stat">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10E7B2] animate-pulse" />
            <span className="text-[#10E7B2] font-bold">GRID_ONLINE</span>
          </div>
          <span className="text-[#54657e]">V2.4.0</span>
        </div>
      </div>
    </aside>
  );
}

