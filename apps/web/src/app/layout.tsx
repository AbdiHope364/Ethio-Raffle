import type { Metadata, Viewport } from "next";
import "./globals.css";
import { I18nProvider, ThemeProvider } from "@raffle/shared";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import DemoSwitcher from "@/components/common/DemoSwitcher";

export const metadata: Metadata = {
  title: "LuckyEthio Raffle — Provably Fair Ticket Platform",
  description: "Ethiopia's licensed online and agent raffle ticketing platform. Provably fair SHA-256 draws, Telebirr & CBE payments.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 flex flex-col min-h-screen transition-colors duration-200">
        <ThemeProvider defaultTheme="light">
          <I18nProvider>
            <DemoSwitcher />
            <Navbar />
            <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8">
              {children}
            </main>
            <Footer />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
