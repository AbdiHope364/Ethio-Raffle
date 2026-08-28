import type { Metadata, Viewport } from "next";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/context";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import DemoSwitcher from "@/components/common/DemoSwitcher";

export const metadata: Metadata = {
  title: "zendegi Raffle — Provably Fair Ticket Platform",
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
    <html lang="en">
      <body className="antialiased text-slate-900 bg-slate-50 flex flex-col min-h-screen">
        <I18nProvider>
          <DemoSwitcher />
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
