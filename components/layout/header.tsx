"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PlusCircle, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserRole } from "./role-context";

export function Header() {
  const pathname = usePathname();
  const { user, isAdmin, logout, isLoading } = useUserRole();

  const getPageTitle = () => {
    if (pathname === "/") return "Dashboard";
    if (pathname.startsWith("/matches/new")) return "Catat Scrim";
    if (pathname.includes("/edit")) return "Edit Scrim";
    if (pathname.startsWith("/matches/")) return "Detail Match";
    if (pathname.startsWith("/matches")) return "Riwayat Match";
    if (pathname.startsWith("/roster")) return "Roster Pemain";
    if (pathname.startsWith("/players/")) return "Profil Pemain";
    if (pathname.startsWith("/maps")) return "Statistik Map";
    if (pathname.startsWith("/login")) return "Masuk Akun";
    return "Scrim Analytics";
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#1C2433] bg-[#090C10]/90 backdrop-blur-md px-4 sm:px-6 select-none">
      {/* Left Section: Brand & Page Context */}
      <div className="flex items-center gap-2.5 min-w-0">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <img
            src="/team-sc-logo.png"
            alt="Team SC"
            className="w-5 h-5 object-contain shrink-0"
          />
          <span className="font-bold text-sm text-white tracking-tight">
            Team SC
          </span>
        </Link>
        <span className="text-[#2A364F] font-normal">/</span>
        <span className="font-medium text-xs text-[#94A3B8] truncate max-w-[130px] sm:max-w-none">
          {getPageTitle()}
        </span>
      </div>

      {/* Right Section: User Profile & Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {!isLoading && user ? (
          <div className="flex items-center gap-2 bg-[#0F141C] border border-[#1C2433] pl-2 pr-1.5 py-1 rounded-lg">
            {/* Avatar */}
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.username}
                className="w-6 h-6 rounded-full border border-[#2A364F] shrink-0"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-[#161D28] text-[#F1F5F9] flex items-center justify-center text-[10px] font-bold">
                {user.username.substring(0, 2).toUpperCase()}
              </div>
            )}

            {/* Name & Role */}
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-white leading-tight truncate max-w-[120px]">
                {user.globalName || user.username}
              </span>
              <span className={`text-[10px] font-medium leading-tight ${
                isAdmin ? "text-rose-400" : "text-sky-400"
              }`}>
                {isAdmin ? "Admin / IGL" : "Member"}
              </span>
            </div>

            {/* Mobile Compact Role Badge */}
            <span className={`sm:hidden px-1.5 py-0.5 rounded text-[9px] font-semibold ${
              isAdmin ? "bg-rose-500/15 text-rose-400" : "bg-sky-500/15 text-sky-400"
            }`}>
              {isAdmin ? "Admin" : "Member"}
            </span>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="p-1 text-[#94A3B8] hover:text-rose-400 hover:bg-[#161D28] rounded-md transition-colors cursor-pointer"
              title="Keluar (Logout)"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : !isLoading && (
          <Link href="/login">
            <Button variant="secondary" size="sm" className="gap-1.5 text-xs h-8">
              <LogIn className="w-3.5 h-3.5 text-[#5865F2]" />
              <span>Login</span>
            </Button>
          </Link>
        )}

        {/* Quick Record CTA for Admin (Desktop only, hidden when already on new/edit match page) */}
        {isAdmin && !pathname.startsWith("/matches/new") && !pathname.includes("/edit") && (
          <Link href="/matches/new" className="hidden md:inline-flex">
            <Button size="sm" className="gap-1.5 font-semibold h-8 shadow-sm">
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Catat Scrim</span>
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}

