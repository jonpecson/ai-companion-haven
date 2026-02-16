"use client";

import { useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  User,
  Bell,
  Moon,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Palette,
  Volume2,
  Globe,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { config } from "@/lib/config";
import { IconSidebar } from "@/components/layout/IconSidebar";
import { TopBar } from "@/components/layout/TopBar";
import { cn } from "@/lib/utils";

const settingsSections = [
  {
    title: "Account",
    items: [
      { icon: User, label: "Profile", description: "Manage your profile information" },
      { icon: Bell, label: "Notifications", description: "Configure notification preferences" },
      { icon: Shield, label: "Privacy", description: "Control your privacy settings" },
    ],
  },
  {
    title: "Preferences",
    items: [
      { icon: Palette, label: "Appearance", description: "Theme and display settings" },
      { icon: Volume2, label: "Sound", description: "Audio and voice settings" },
      { icon: Globe, label: "Language", description: "Change app language" },
    ],
  },
  {
    title: "Support",
    items: [
      { icon: HelpCircle, label: "Help Center", description: "Get help and support" },
    ],
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const logout = useAppStore((state) => state.logout);
  const [darkMode, setDarkMode] = useState(true);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <IconSidebar />
      <main className="flex-1 lg:ml-16">
        <TopBar />
        <div className="p-4 lg:p-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 lg:mb-8"
          >
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your account and preferences
            </p>
          </motion.div>

          {/* Desktop Grid Layout */}
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            {/* Main Settings */}
            <div className="lg:col-span-2 space-y-6">
              {settingsSections.map((section, sectionIndex) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: sectionIndex * 0.1 }}
                >
                  <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                    {section.title}
                  </h2>
                  <div className="glass rounded-xl lg:rounded-2xl overflow-hidden divide-y divide-border">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.label}
                          onClick={() => toast.info(`${item.label} settings coming soon!`)}
                          className="w-full flex items-center gap-4 p-4 lg:p-5 hover:bg-muted/30 transition-colors text-left"
                        >
                          <div className="flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center rounded-xl bg-primary/10">
                            <Icon className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-foreground lg:text-lg">{item.label}</h3>
                            <p className="text-xs lg:text-sm text-muted-foreground">{item.description}</p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              ))}

              {/* Dark Mode Toggle */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                  Display
                </h2>
                <div className="glass rounded-xl lg:rounded-2xl p-4 lg:p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center rounded-xl bg-primary/10">
                        <Moon className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground lg:text-lg">Dark Mode</h3>
                        <p className="text-xs lg:text-sm text-muted-foreground">Use dark theme</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setDarkMode(!darkMode)}
                      className={cn(
                        "relative h-7 w-12 rounded-full transition-colors",
                        darkMode ? "bg-primary" : "bg-muted"
                      )}
                    >
                      <div
                        className={cn(
                          "absolute top-1 h-5 w-5 rounded-full bg-white transition-transform",
                          darkMode ? "left-6" : "left-1"
                        )}
                      />
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Logout */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 p-4 lg:p-5 glass rounded-xl lg:rounded-2xl hover:bg-red-500/10 transition-colors group"
                >
                  <div className="flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center rounded-xl bg-red-500/10">
                    <LogOut className="h-5 w-5 lg:h-6 lg:w-6 text-red-500" />
                  </div>
                  <span className="font-medium text-red-500 lg:text-lg">Log Out</span>
                </button>
              </motion.div>
            </div>

            {/* Sidebar - Desktop Only */}
            <div className="hidden lg:block">
              <div className="sticky top-24 space-y-6">
                {/* Account Info */}
                <div className="glass rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-4">YOUR ACCOUNT</h3>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
                      <User className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Guest User</p>
                      <p className="text-sm text-muted-foreground">Free Plan</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toast.info("Pro plan coming soon!")}
                    className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:brightness-110 transition-all"
                  >
                    Upgrade to Pro
                  </button>
                </div>

                {/* Quick Links */}
                <div className="glass rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-4">QUICK LINKS</h3>
                  <div className="space-y-2">
                    <Link href="/mood" className="block p-3 rounded-xl hover:bg-muted/30 transition-colors">
                      <span className="text-sm text-foreground">Mood Settings</span>
                    </Link>
                    <Link href="/create" className="block p-3 rounded-xl hover:bg-muted/30 transition-colors">
                      <span className="text-sm text-foreground">Create Companion</span>
                    </Link>
                    <Link href="/companions" className="block p-3 rounded-xl hover:bg-muted/30 transition-colors">
                      <span className="text-sm text-foreground">Browse Companions</span>
                    </Link>
                  </div>
                </div>

                {/* App Info */}
                <div className="glass rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-4">APP INFO</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Version</span>
                      <span className="text-foreground">{config.appVersion}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Build</span>
                      <span className="text-foreground">{config.appBuild}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
