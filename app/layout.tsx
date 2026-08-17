import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { RoleProvider } from "@/components/layout/role-context";

export const metadata: Metadata = {
  title: "Valorant Scrim Analytics Platform | Tactical HUD",
  description:
    "Aplikasi analitik dan pencatatan statistik scrimmage tim esports Valorant berkecepatan tinggi dengan arsitektur Zero-Cost.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body className="bg-[#090D16] text-slate-100 antialiased min-h-screen">
        <RoleProvider>
          <div className="flex h-screen overflow-hidden">
            {/* Desktop Tactical Sidebar */}
            <div className="hidden lg:flex shrink-0">
              <Sidebar />
            </div>

            {/* Main Application Container */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">{children}</div>
              </main>
            </div>
          </div>
        </RoleProvider>
      </body>
    </html>
  );
}
