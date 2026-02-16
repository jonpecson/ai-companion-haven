"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Bell } from "lucide-react";

export function TopBar() {
  const pathname = usePathname();

  // Hide on individual chat pages
  if (pathname.startsWith("/chat/") && pathname !== "/chat") {
    return null;
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-xl">
      <h1 className="font-display text-xl font-bold">
        <span className="text-gradient">Nectar</span>
        <span className="text-foreground"> AI</span>
      </h1>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search companions..."
            className="h-10 w-64 rounded-full bg-secondary pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Mobile search */}
        <button className="sm:hidden flex h-10 w-10 items-center justify-center rounded-full bg-secondary transition-colors hover:bg-muted">
          <Search className="h-5 w-5 text-muted-foreground" />
        </button>

        {/* Notification */}
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-secondary transition-colors hover:bg-muted">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
        </button>

        {/* CTA */}
        <Link
          href="/create"
          className="hidden sm:flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 glow-primary animate-pulse-glow"
        >
          Create AI +
        </Link>
      </div>
    </header>
  );
}
