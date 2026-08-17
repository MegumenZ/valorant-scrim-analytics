import React from "react";
import Link from "next/link";
import { Shield, ShieldAlert, Lock, Sparkles, CheckCircle2, Crosshair, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { isDiscordConfigured } from "@/lib/auth/discord";

export const dynamic = "force-dynamic";

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();
  if (user) {
    redirect("/");
  }

  const { error } = await searchParams;

  const errorMessages: Record<string, string> = {
    state_mismatch: "Gagal memvalidasi token keamanan (State Mismatch). Kemungkinan sesi login telah kedaluwarsa atau terjadi pemalsuan request.",
    rate_limited: "Terlalu banyak percobaan login dalam waktu singkat. Harap tunggu beberapa saat untuk melindungi sistem dari serangan brute force.",
    unconfigured: "Kredensial Discord OAuth belum dikonfigurasi di file environment (.env). Anda dapat menggunakan tombol Demo Login di bawah untuk mencoba aplikasi.",
    oauth_failed: "Gagal melakukan otentikasi dengan Discord. Silakan coba lagi.",
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 shadow-xl shadow-rose-950/50 mb-2">
            <Crosshair className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            VALO<span className="text-rose-500">SCRIM</span> ANALYTICS
          </h1>
          <p className="text-xs text-slate-400">
            Masuk untuk mengakses analitik scrimmage, catatan evaluasi, dan rekap squad.
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3 shadow-lg">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-rose-200 mb-0.5">Peringatan Keamanan / Login:</span>
              <p className="leading-relaxed">{errorMessages[error] || decodeURIComponent(error)}</p>
            </div>
          </div>
        )}

        {/* Main Login Card */}
        <div className="rounded-2xl border border-[#242e40] bg-[#141a24] p-6 sm:p-7 shadow-2xl space-y-6">
          <div className="space-y-1 text-center">
            <h2 className="text-base font-bold text-slate-100">
              Otentikasi Akun Discord
            </h2>
            <p className="text-xs text-slate-400">
              Sistem akan membaca ID Discord Anda untuk menentukan hak akses (Admin / Member).
            </p>
          </div>

          {/* Primary Discord Login Button */}
          <div className="space-y-3">
            <a href="/api/auth/discord" className="block w-full">
              <button
                type="button"
                className="w-full h-11 px-4 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-xs sm:text-sm tracking-wide transition-all shadow-lg shadow-indigo-950/50 flex items-center justify-center gap-3 active:scale-[0.98] cursor-pointer"
              >
                {/* Discord SVG Logo */}
                <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 127.14 96.36">
                  <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,45.91,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,45.91,96.12,53,91.08,65.69,84.69,65.69Z" />
                </svg>
                <span>Masuk dengan Discord</span>
              </button>
            </a>

            {!isDiscordConfigured && (
              <p className="text-[11px] text-amber-400/90 text-center font-medium bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                Mode Dev: Kredensial Discord OAuth belum diatur. Silakan gunakan opsi Demo Login di bawah.
              </p>
            )}
          </div>

          {/* Quick Demo Logins (Only shown in Development or when Discord is unconfigured) */}
          {(!isDiscordConfigured || process.env.NODE_ENV !== "production") && (
            <div className="pt-4 border-t border-[#242e40] space-y-2.5">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
                Atau Uji Coba Cepat (Mode Demo Dev)
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <a href="/api/auth/demo?role=ADMIN" className="block">
                  <Button variant="secondary" size="sm" className="w-full text-xs gap-1.5 h-9 font-semibold">
                    <Shield className="w-3.5 h-3.5 text-rose-400" />
                    <span>Demo Admin / IGL</span>
                  </Button>
                </a>
                <a href="/api/auth/demo?role=MEMBER" className="block">
                  <Button variant="secondary" size="sm" className="w-full text-xs gap-1.5 h-9 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                    <span>Demo Member</span>
                  </Button>
                </a>
              </div>
            </div>
          )}

          {/* Security Features Badge List */}
          <div className="pt-3 border-t border-[#242e40]/70 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Anti-Brute Force</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>Encrypted JWE</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>PKCE Anti-CSRF</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Auto Whitelist Role</span>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link href="/" className="text-xs text-slate-400 hover:text-slate-200 inline-flex items-center gap-1">
            <span>Kembali ke Halaman Utama</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
