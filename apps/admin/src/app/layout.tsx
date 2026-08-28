import type { Metadata, Viewport } from "next";
import "./globals.css";
import { I18nProvider, ThemeProvider } from "@raffle/shared";
import AdminShell from "@/components/AdminShell";

export const metadata: Metadata = {
  title: "LuckyEthio Raffle — Admin Operations Portal",
  description: "Administrative console for raffle lifecycle, agent approvals, financial ledger, and provably fair live draws.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-slate-950 dark:bg-slate-950 text-slate-100 min-h-screen transition-colors duration-200">
        <ThemeProvider defaultTheme="dark">
          <I18nProvider>
            <AdminShell>{children}</AdminShell>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

