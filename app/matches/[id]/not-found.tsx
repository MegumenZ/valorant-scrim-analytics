"use client";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
export default function MatchNotFound() { const { language } = useTranslation(); const en = language === "en"; return <section className="mx-auto max-w-xl rounded-xl border border-[#1C2433] bg-[#0C1017] p-8 text-center"><h1 className="text-lg font-bold text-white">{en ? "Scrim not found" : "Scrim tidak ditemukan"}</h1><p className="mt-2 text-sm text-[#CBD5E1]">{en ? "This scrim record may have been removed." : "Catatan scrim ini mungkin sudah dihapus."}</p><Link href="/matches"><Button className="mt-5">{en ? "Back to scrim history" : "Kembali ke riwayat scrim"}</Button></Link></section>; }
