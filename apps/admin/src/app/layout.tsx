import type { Metadata } from "next";
import "./globals.css";
import { I18nProvider } from "@raffle/shared";
import AdminShell from "@/components/AdminShell";

export const metadata: Metadata = {
  title: "LuckyEthio Raffle — Admin Operations Portal",
  description: "Administrative console for raffle lifecycle, agent approvals, financial ledger, and provably fair live draws.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-950 text-slate-100 min-h-screen">
        <I18nProvider>
          <AdminShell>{children}</AdminShell>
        </I18nProvider>
      </body>
    </html>
  );
}

