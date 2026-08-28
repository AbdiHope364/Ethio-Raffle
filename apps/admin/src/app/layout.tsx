import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "@raffle/shared";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";

export const metadata: Metadata = {
  title: "LuckyEthio Raffle — Admin Operations Portal",
  description: "Administrative console for raffle lifecycle, agent approvals, financial ledger, and provably fair live draws.",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-950 text-slate-100 flex min-h-screen">
        <I18nProvider>
          <AdminSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <AdminHeader />
            <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
              {children}
            </main>
          </div>
        </I18nProvider>
      </body>
    </html>
  );
}

