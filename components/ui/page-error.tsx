"use client";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/context";

export function PageError({ reset }: { reset: () => void }) {
  const { language } = useTranslation();
  const en = language === "en";
  return <section role="alert" className="mx-auto max-w-xl rounded-xl border border-[#2A364F] bg-[#0C1017] p-8 text-center">
    <h1 className="text-lg font-bold text-white">{en ? "This page could not be loaded" : "Halaman ini tidak dapat dimuat"}</h1>
    <p className="mt-2 text-sm text-[#CBD5E1]">{en ? "Try again to reload the latest page data." : "Coba lagi untuk memuat ulang data halaman."}</p>
    <Button className="mt-5" onClick={reset}>{en ? "Try again" : "Coba lagi"}</Button>
  </section>;
}
