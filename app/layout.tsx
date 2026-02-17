import type { Metadata } from "next";
import { Toaster } from "sonner";
import { BottomNav } from "@/components/layout/BottomNav";
import { ThemeProvider } from "@/components/ThemeProvider";
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

// Script to prevent flash of wrong theme
const themeScript = `
  (function() {
    try {
      const stored = localStorage.getItem('nectar-ai-storage');
      if (stored) {
        const data = JSON.parse(stored);
        const theme = data.state?.preferences?.theme;
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        }
      } else {
        // Default to dark theme
        document.documentElement.classList.add('dark');
      }
    } catch (e) {
      document.documentElement.classList.add('dark');
    }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-background antialiased">
        <ThemeProvider>
          {/* Main Content */}
          <main className="min-h-screen pb-24 lg:pb-0">
            {children}
          </main>

          {/* Mobile Bottom Navigation */}
          <BottomNav />

          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
