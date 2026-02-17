"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Bell } from "lucide-react";

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // Hide on individual chat pages
  if (pathname.startsWith("/chat/") && pathname !== "/chat") {
    return null;
  }

  const handleSearch = (e?: FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/companions?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowMobileSearch(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-xl">
      <h1 className="font-display text-xl font-bold">
        <span className="text-gradient">Nectar</span>
        <span className="text-foreground"> AI</span>
      </h1>

      <div className="flex items-center gap-3">
        {/* Search - Desktop */}
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search companions..."
            className="h-10 w-48 lg:w-64 rounded-full bg-secondary pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Mobile search button */}
        <button
          onClick={() => setShowMobileSearch(!showMobileSearch)}
          className="sm:hidden flex h-10 w-10 items-center justify-center rounded-full bg-secondary transition-colors hover:bg-muted"
        >
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

      {/* Mobile Search Dropdown */}
      {showMobileSearch && (
        <div className="absolute top-16 left-0 right-0 p-4 bg-background/95 backdrop-blur-xl border-b border-border sm:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search companions..."
              autoFocus
              className="w-full h-10 rounded-full bg-secondary pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
      )}
    </header>
  );
}
