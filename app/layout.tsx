import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Barlow_Condensed, JetBrains_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { TopProgressBar } from "@/components/layout/top-progress-bar";
import { RoleProvider } from "@/components/layout/role-context";
import { LanguageProvider } from "@/lib/i18n/context";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  variable: "--font-tactical",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Team SC | Valorant Scrim Analytics",
  description:
    "Platform analitik taktis dan evaluasi performa scrimmage resmi Team SC.",
  icons: {
    icon: "/team-sc-logo.png",
    shortcut: "/team-sc-logo.png",
    apple: "/team-sc-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`dark ${plusJakartaSans.variable} ${barlowCondensed.variable} ${jetbrainsMono.variable}`}>
      <body className="h-full overflow-hidden bg-[#090C10] text-[#F1F5F9] font-sans antialiased selection:bg-[#FF4655] selection:text-white">
        <Suspense fallback={null}>
          <TopProgressBar />
        </Suspense>
        <LanguageProvider>
          <RoleProvider>
            <div className="flex h-screen overflow-hidden">
              {/* Desktop Tactical Sidebar */}
              <div className="hidden lg:flex shrink-0">
                <Sidebar />
              </div>

              {/* Main Application Container */}
              <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                <Header />
                <main className="min-h-0 min-w-0 flex-1 overflow-y-auto p-3 pb-24 sm:p-5 lg:p-8 lg:pb-8">
                  <div className="max-w-7xl mx-auto">{children}</div>
                </main>
              </div>
            </div>

            {/* Mobile Ergonomic Bottom Navigation Bar */}
            <BottomNav />
          </RoleProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
