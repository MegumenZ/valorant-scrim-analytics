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
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#1C2433] bg-[#090C10]/90 backdrop-blur-md px-3 sm:px-4 lg:px-6 select-none">
        {/* Left Section: Mobile Menu Toggle & Clean Breadcrumb */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-lg border border-[#1C2433] bg-[#161D28] text-[#F1F5F9] hover:bg-[#202A3B]"
            aria-label="Buka Menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg border border-[#1C2433] bg-[#0F141C]">
              <img
                src="/team-sc-logo.png"
                alt="Team SC"
                className="w-4 h-4 object-contain shrink-0"
              />
              <span className="font-bold text-xs text-white">
                Team SC
              </span>
              <span className="text-[#64748B] font-normal">/</span>
              <span className="font-semibold text-xs text-[#FF4655] truncate max-w-[130px] sm:max-w-none">
                {getPageTitle()}
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: User Profile & Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Authenticated User Profile Display */}
          {!isLoading && user ? (
            <div className="flex items-center gap-2.5 bg-[#0F141C] border border-[#1C2433] pl-2.5 pr-1.5 py-1 rounded-lg">
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
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-white leading-tight">
                  {user.globalName || user.username}
                </span>
                <span className={`text-[10px] font-medium leading-tight ${
                  isAdmin ? "text-rose-400" : "text-sky-400"
                }`}>
                  {isAdmin ? "Admin / IGL" : "Squad Member"}
                </span>
              </div>

              {/* Role Badge for Mobile */}
              <span className={`md:hidden px-1.5 py-0.5 rounded text-[9px] font-semibold ${
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
                <span>Login Discord</span>
              </Button>
            </Link>
          )}

          {/* Quick Record CTA for Admin */}
          {isAdmin && (
            <Link href="/matches/new">
              <Button size="sm" className="hidden sm:inline-flex gap-1.5 font-semibold h-8 shadow-sm">
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
