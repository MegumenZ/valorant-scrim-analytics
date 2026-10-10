"use client";

/* eslint-disable @next/next/no-img-element -- Native images keep local brand and Discord avatars outside Vercel image optimization. */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, LogIn, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserRole } from "./role-context";
import { useTranslation } from "@/lib/i18n/context";

export function Header() {
  const pathname = usePathname();
  const { user, logout, isLoading } = useUserRole();
  const { t, language, setLanguage } = useTranslation();

  const getPageTitle = () => {
    if (pathname === "/") return t.header.dashboardTitle;
    if (pathname.startsWith("/matches/new")) return t.header.newMatchTitle;
    if (pathname.includes("/edit")) return t.header.editMatchTitle;
    if (pathname.startsWith("/matches/")) return t.header.matchDetailTitle;
    if (pathname.startsWith("/matches")) return t.header.matchHistoryTitle;
    if (pathname.startsWith("/roster")) return t.header.rosterTitle;
    if (pathname.startsWith("/players/")) return t.header.playerProfileTitle;
    if (pathname.startsWith("/maps")) return t.header.mapAnalyticsTitle;
    if (pathname.startsWith("/login")) return t.header.loginTitle;
    return t.header.defaultTitle;
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#1C2433] bg-[#090C10]/90 backdrop-blur-md px-4 sm:px-6 select-none">
      {/* Left Section: Brand & Page Context */}
      <div className="flex items-center gap-2.5 min-w-0">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <img
            src="/team-sc-logo.png"
            alt="Team SC"
            width={20}
            height={20}
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

      {/* Right Section: Language Switcher, User Profile & Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Tactical Language Switcher Pill */}
        <div className="flex items-center bg-[#0F141C] border border-[#1C2433] rounded-lg p-0.5 shadow-sm text-xs">
          <button
            type="button"
            onClick={() => setLanguage("id")}
            className={`px-2 py-1 rounded text-[11px] font-bold transition-all flex items-center gap-1 ${
              language === "id"
                ? "bg-[#161D28] text-white shadow-xs border border-[#2A364F]"
                : "text-[#94A3B8] hover:text-white"
            }`}
            title="Bahasa Indonesia"
          >
            <span>🇮🇩</span>
            <span className="hidden sm:inline">ID</span>
          </button>
          <button
            type="button"
            onClick={() => setLanguage("en")}
            className={`px-2 py-1 rounded text-[11px] font-bold transition-all flex items-center gap-1 ${
              language === "en"
                ? "bg-[#161D28] text-white shadow-xs border border-[#2A364F]"
                : "text-[#94A3B8] hover:text-white"
            }`}
            title="English (US/PH)"
          >
            <span>🇺🇸</span>
            <span className="hidden sm:inline">EN</span>
          </button>
        </div>

        {!isLoading && user ? (
          <div className="flex items-center gap-2 bg-[#0F141C] border border-[#1C2433] pl-2 pr-1.5 py-1 rounded-lg">
            {/* Avatar */}
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.username}
                width={24}
                height={24}
                className="w-6 h-6 rounded-full border border-[#2A364F] shrink-0"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-[#161D28] text-[#F1F5F9] flex items-center justify-center text-[10px] font-bold">
                {user.username.substring(0, 2).toUpperCase()}
              </div>
            )}

            {/* Name & Role */}
            <div className="flex min-w-0 flex-col text-left">
              <span className="text-xs font-semibold text-white leading-tight truncate max-w-[120px]">
                <span className="hidden sm:inline">{user.globalName || user.username}</span>
                <span className="sm:hidden">{(user.globalName || user.username).slice(0, 12)}</span>
              </span>
              <span className={`text-[10px] font-medium leading-tight ${
                user.role === "ADMIN" ? "text-rose-300" : user.role === "COACH" ? "text-sky-300" : "text-[#CBD5E1]"
              }`}>
                {user.role === "ADMIN" ? t.common.admin : user.role === "COACH" ? t.common.coach : t.common.member}{user.isDemo && <span className="ml-1.5 rounded border border-amber-400/30 bg-amber-400/10 px-1 text-amber-200">{t.common.demo}</span>}
              </span>
            </div>

            {/* Mobile Compact Role Badge */}

            {/* Logout Button */}
            <button
              onClick={logout}
              aria-label={t.common.logout}
              className="min-h-11 min-w-11 flex items-center justify-center text-[#94A3B8] hover:text-rose-400 hover:bg-[#161D28] rounded-md transition-colors cursor-pointer"
              title={t.common.logout}
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : !isLoading && (
          <Link href="/login">
            <Button variant="secondary" size="sm" className="gap-1.5 text-xs h-8">
              <LogIn className="w-3.5 h-3.5 text-[#5865F2]" />
              <span>{t.common.login}</span>
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}

