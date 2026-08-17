"use client";

import Link from "next/link";
import { PlusCircle, Menu, X, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserRole } from "./role-context";
import { useState } from "react";
import { Sidebar } from "./sidebar";

export function Header() {
  const { role, setRole, isAdmin } = useUserRole();
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
              <span className="text-[11px] text-slate-400 font-medium">| Scrim Tracker</span>
            </div>
          </div>
        </div>

        {/* Right Section: Role Switcher & Rapid CTA */}
        <div className="flex items-center gap-3">
          {/* RBAC Role Switcher */}
          <div className="flex items-center p-0.5 rounded-lg border border-[#242e40] bg-[#141a24] text-xs">
            <button
              onClick={() => setRole("ADMIN")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                role === "ADMIN"
                  ? "bg-rose-500 text-white shadow-sm font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Admin/IGL: Akses catat, edit, dan hapus match"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin / IGL</span>
            </button>
            <button
              onClick={() => setRole("MEMBER")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                role === "MEMBER"
                  ? "bg-[#20293a] text-slate-100 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Member: Akses melihat data scrim dan profil"
            >
              <User className="w-3.5 h-3.5" />
              <span>Member</span>
            </button>
          </div>

          {/* Quick Record CTA for Admin */}
          {isAdmin && (
            <Link href="/matches/new">
              <Button size="sm" className="hidden sm:inline-flex gap-1.5 font-bold shadow-md shadow-rose-950/40">
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
