"use client";

import Link from "next/link";
import { PlusCircle, Menu, X, Shield, LogOut, LogIn, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserRole } from "./role-context";
import { useState } from "react";
import { Sidebar } from "./sidebar";

export function Header() {
  const { user, isAdmin, logout, isLoading } = useUserRole();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#242e40] bg-[#0b0e14]/90 backdrop-blur-md px-4 lg:px-6 select-none">
        {/* Left Section: Mobile Menu Toggle & Team Info */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-lg border border-[#242e40] bg-[#141a24] text-slate-200 hover:bg-[#1c2432]"
            aria-label="Buka Menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141a24] border border-[#242e40]">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-xs font-bold text-slate-100 tracking-wide">
                Team Alpha
              </span>
              <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">| Scrim Tracker</span>
            </div>
          </div>
        </div>

        {/* Right Section: User Profile & Rapid Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Authenticated User Profile Display */}
          {!isLoading && user ? (
            <div className="flex items-center gap-2.5 bg-[#141a24] border border-[#242e40] pl-2 pr-1.5 py-1 rounded-xl">
              {/* Avatar */}
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-6 h-6 rounded-full border border-slate-600 shrink-0"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-[#1c2432] text-slate-300 flex items-center justify-center text-[10px] font-bold">
                  {user.username.substring(0, 2).toUpperCase()}
                </div>
              )}

              {/* Name & Role */}
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-100 leading-tight">
                  {user.globalName || user.username}
                </span>
                <span className={`text-[9px] font-bold leading-tight ${
                  isAdmin ? "text-rose-400" : "text-sky-400"
                }`}>
                  {isAdmin ? "ADMIN / IGL" : "SQUAD MEMBER"}
                </span>
              </div>

              {/* Role Badge for Mobile */}
              <span className={`md:hidden px-1.5 py-0.5 rounded text-[9px] font-bold ${
                isAdmin ? "bg-rose-500/20 text-rose-400" : "bg-sky-500/20 text-sky-400"
              }`}>
                {isAdmin ? "ADMIN" : "MEMBER"}
              </span>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-[#1c2432] rounded-lg transition-colors cursor-pointer"
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
              <Button size="sm" className="hidden sm:inline-flex gap-1.5 font-bold shadow-md shadow-rose-950/40 h-8">
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Catat Match</span>
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
