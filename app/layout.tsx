import type { Metadata } from "next";
import { Toaster } from "sonner";
import { BottomNav } from "@/components/layout/BottomNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nectar AI - Your AI Companion",
  description: "Connect, chat, and create meaningful bonds with AI companions",
  manifest: "/manifest.json",
  themeColor: "#0a0a0a",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Nectar AI",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background antialiased">
        {/* Main Content */}
        <main className="min-h-screen pb-24 lg:pb-0">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav />

        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
