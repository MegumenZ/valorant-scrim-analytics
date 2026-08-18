import type { Metadata } from "next";
import { Rajdhani, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { RoleProvider } from "@/components/layout/role-context";

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-rajdhani",
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
    <html lang="id" className={`dark ${rajdhani.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-[#080B10] text-[#ECE8E1] antialiased min-h-screen font-sans selection:bg-[#FF4655] selection:text-white">
        <RoleProvider>
          <div className="flex h-screen overflow-hidden">
            {/* Desktop Tactical Sidebar */}
            <div className="hidden lg:flex shrink-0">
              <Sidebar />
            </div>

            {/* Main Application Container */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-8 pb-24 lg:pb-8">
                <div className="max-w-7xl mx-auto">{children}</div>
              </main>
            </div>
          </div>

          {/* Mobile Ergonomic Bottom Navigation Bar */}
          <BottomNav />
        </RoleProvider>
      </body>
    </html>
  );
}
