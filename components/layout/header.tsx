"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PlusCircle, Menu, X, Shield, LogOut, LogIn, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserRole } from "./role-context";
import { useState } from "react";
import { Sidebar } from "./sidebar";

export function Header() {
  const pathname = usePathname();
  const { user, isAdmin, logout, isLoading } = useUserRole();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getPageTitle = () => {
    if (pathname === "/") return "Dashboard";
    if (pathname.startsWith("/matches/new")) return "Catat Scrim";
    if (pathname.includes("/edit")) return "Edit Scrim";
    if (pathname.startsWith("/matches/")) return "Detail Match";
    if (pathname.startsWith("/matches")) return "Riwayat Match";
    if (pathname.startsWith("/roster")) return "Roster Skuad";
    if (pathname.startsWith("/players/")) return "Profil Pemain";
    if (pathname.startsWith("/maps")) return "Analitik Map";
    if (pathname.startsWith("/login")) return "Masuk Akun";
    return "Scrim Analytics";
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#1f2c42] bg-[#090D14]/95 backdrop-blur-md px-3 sm:px-4 lg:px-6 select-none">
        {/* Left Section: Mobile Menu Toggle & Tactical Breadcrumb */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded border border-[#1f2c42] bg-[#121824] text-[#ece8e1] hover:bg-[#1a2333]"
            aria-label="Buka Menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded border border-[#1f2c42] bg-[#0e141f]">
              <img
                src="/team-sc-logo.png"
                alt="Team SC"
                className="w-4 h-4 object-contain shrink-0"
              />
              <span className="font-display font-black text-xs text-white tracking-wider">
                TEAM SC
              </span>
              <span className="text-[#54657e] font-mono-stat">//</span>
              <span className="font-display font-bold text-xs text-[#FF4655] uppercase tracking-wider truncate max-w-[130px] sm:max-w-none">
                {getPageTitle()}
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: User Profile & Tactical Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Authenticated User Profile Display */}
          {!isLoading && user ? (
            <div className="flex items-center gap-2 bg-[#0e141f] border border-[#1f2c42] pl-2 pr-1.5 py-1 rounded">
              {/* Avatar */}
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-6 h-6 rounded-full border border-[#2b3d5c] shrink-0"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-[#121824] text-[#ece8e1] flex items-center justify-center text-[10px] font-mono-stat font-bold">
                  {user.username.substring(0, 2).toUpperCase()}
                </div>
              )}

              {/* Name & Role */}
              <div className="hidden md:flex flex-col text-left font-display">
                <span className="text-xs font-bold text-white leading-tight uppercase">
                  {user.globalName || user.username}
                </span>
                <span className={`text-[9px] font-mono-stat font-bold leading-tight ${
                  isAdmin ? "text-[#FF4655]" : "text-[#00F5D4]"
                }`}>
                  {isAdmin ? "SYS_ADMIN // IGL" : "SQUAD_MEMBER"}
                </span>
              </div>

              {/* Role Badge for Mobile */}
              <span className={`md:hidden px-1.5 py-0.2 rounded-[2px] font-mono-stat text-[9px] font-bold ${
                isAdmin ? "bg-[#FF4655]/20 text-[#FF4655]" : "bg-[#00F5D4]/20 text-[#00F5D4]"
              }`}>
                {isAdmin ? "ADMIN" : "MEMBER"}
              </span>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="p-1.5 text-[#8b9bb4] hover:text-[#FF4655] hover:bg-[#121824] rounded transition-colors cursor-pointer"
                title="Keluar (Logout)"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : !isLoading && (
            <Link href="/login">
              <Button variant="secondary" size="sm" className="gap-1.5 text-xs h-8 border-[#5865F2]/40 text-[#8ea1e1] hover:bg-[#5865F2]/20">
                <LogIn className="w-3.5 h-3.5 text-[#5865F2]" />
                <span>Login Discord</span>
              </Button>
            </Link>
          )}

          {/* Quick Record CTA for Admin */}
          {isAdmin && (
            <Link href="/matches/new">
              <Button size="sm" className="hidden sm:inline-flex gap-1.5 font-display font-black h-8 shadow-md shadow-[#FF4655]/20">
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Catat Scrim</span>
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex flex-col w-72 max-w-full z-50">
            <Sidebar onClose={() => setMobileMenuOpen(false)} />
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-[#141a24] border border-[#242e40] text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
