"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, MessageCircle, User, Sparkles, Clock, Settings } from "lucide-react";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/companions", icon: Compass, label: "Explore" },
  { href: "/chat", icon: MessageCircle, label: "Chats" },
  { href: "/stories", icon: Sparkles, label: "Stories" },
  { href: "/memories", icon: Clock, label: "Memories" },
];

export function IconSidebar() {
  const pathname = usePathname();

  // Hide on individual chat pages
  if (pathname.startsWith("/chat/") && pathname !== "/chat") {
    return null;
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 z-40 hidden lg:flex h-screen w-16 flex-col items-center border-r border-border bg-sidebar py-6 gap-2">
      {/* Logo */}
      <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-primary glow-primary">
        <span className="font-display text-lg font-bold text-primary-foreground">N</span>
      </div>

      {/* Nav items */}
      <nav className="flex flex-1 flex-col items-center gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`group relative flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-200 ${
                active
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              title={item.label}
            >
              <Icon className="h-5 w-5" />
              {active && (
                <div className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Settings */}
      <Link
        href="/settings"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-muted transition-colors hover:bg-secondary"
        title="Settings"
      >
        <Settings className="h-5 w-5 text-muted-foreground" />
      </Link>
    </aside>
  );
}
