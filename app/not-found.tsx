"use client";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
export default function NotFound() {
  const { language } = useTranslation();
  const en = language === "en";
  return <section className="mx-auto max-w-xl rounded-xl border border-[#1C2433] bg-[#0C1017] p-8 text-center"><h1 className="text-lg font-bold text-white">{en ? "Page not found" : "Halaman tidak ditemukan"}</h1><p className="mt-2 text-sm text-[#CBD5E1]">{en ? "The page may have moved or the link is incorrect." : "Halaman mungkin sudah dipindahkan atau tautannya keliru."}</p><Link href="/"><Button className="mt-5">{en ? "Back to dashboard" : "Kembali ke dashboard"}</Button></Link></section>;
}
