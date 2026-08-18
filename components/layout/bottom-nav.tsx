"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Swords,
  Users,
  Map as MapIcon,
  PlusCircle,
} from "lucide-react";
import { useUserRole } from "./role-context";

export function BottomNav() {
  const pathname = usePathname();
  const { isAdmin } = useUserRole();

  // Don't show bottom nav on login page
  if (pathname.startsWith("/login")) {
    return null;
  }

  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: LayoutDashboard,
      active: pathname === "/",
    },
    {
      label: "Scrims",
      href: "/matches",
      icon: Swords,
      active: pathname.startsWith("/matches") && !pathname.startsWith("/matches/new") && !pathname.includes("/edit"),
    },
    ...(isAdmin
      ? [
          {
            label: "Catat",
            href: "/matches/new",
            icon: PlusCircle,
            active: pathname === "/matches/new",
            isAction: true,
          },
        ]
      : []),
    {
      label: "Roster",
      href: "/roster",
      icon: Users,
      active: pathname.startsWith("/roster") || pathname.startsWith("/players"),
    },
    {
      label: "Maps",
      href: "/maps",
      icon: MapIcon,
      active: pathname.startsWith("/maps"),
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090D14]/95 backdrop-blur-lg border-t border-[#1f2c42] px-2 py-1.5 safe-bottom select-none shadow-2xl">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.isAction) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-4 group"
              >
                <div className="w-11 h-11 rounded-full bg-[#FF4655] border-2 border-[#090D14] shadow-lg shadow-[#FF4655]/40 flex items-center justify-center text-white group-active:scale-95 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-display text-[10px] font-bold text-[#FF4655] uppercase tracking-wider mt-0.5">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-all ${
                item.active
                  ? "text-[#FF4655] font-display font-bold scale-105"
                  : "text-[#8b9bb4] hover:text-white"
              }`}
            >
              <Icon className={`w-5 h-5 ${item.active ? "text-[#FF4655]" : ""}`} />
              <span className="font-display text-[10px] font-bold uppercase tracking-wider mt-0.5">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
