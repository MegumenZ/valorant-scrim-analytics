import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { RoleProvider } from "@/components/layout/role-context";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
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
    <html lang="id" className={`dark ${plusJakartaSans.variable}`}>
      <body className="bg-[#090C10] text-[#F1F5F9] font-sans antialiased min-h-screen selection:bg-[#FF4655] selection:text-white">
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
