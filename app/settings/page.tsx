"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  User,
  Bell,
  Moon,
  Sun,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  ChevronDown,
  Palette,
  Volume2,
  Globe,
  X,
} from "lucide-react";
import { useAppStore, usePreferences } from "@/lib/store";
import { config } from "@/lib/config";
import { IconSidebar } from "@/components/layout/IconSidebar";
import { TopBar } from "@/components/layout/TopBar";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

type SettingPanel = "profile" | "notifications" | "privacy" | "appearance" | "sound" | "language" | "help" | null;

export default function SettingsPage() {
  const router = useRouter();
  const logout = useAppStore((state) => state.logout);
  const { setPreferences } = useAppStore();
  const preferences = usePreferences();
  const [activePanel, setActivePanel] = useState<SettingPanel>(null);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/");
  };

  const togglePanel = (panel: SettingPanel) => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  // Settings panel content components
  const renderPanelContent = (panel: SettingPanel) => {
    switch (panel) {
      case "profile":
        return (
          <div className="p-4 space-y-4 border-t border-border">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Display Name</label>
              <input
                type="text"
                value={preferences.displayName}
                onChange={(e) => setPreferences({ displayName: e.target.value })}
                className="w-full bg-secondary rounded-lg px-4 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Enter your name"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Your display name is shown in conversations and memories.
            </p>
          </div>
        );

      case "notifications":
        return (
          <div className="p-4 space-y-4 border-t border-border">
            <ToggleSetting
              label="Enable Notifications"
              description="Receive notifications from the app"
              value={preferences.notificationsEnabled}
              onChange={(v) => setPreferences({ notificationsEnabled: v })}
            />
            <ToggleSetting
              label="Message Notifications"
              description="Get notified for new messages"
              value={preferences.messageNotifications}
              onChange={(v) => setPreferences({ messageNotifications: v })}
              disabled={!preferences.notificationsEnabled}
            />
            <ToggleSetting
              label="Story Notifications"
              description="Get notified for new stories"
              value={preferences.storyNotifications}
              onChange={(v) => setPreferences({ storyNotifications: v })}
              disabled={!preferences.notificationsEnabled}
            />
          </div>
        );

      case "privacy":
        return (
          <div className="p-4 space-y-4 border-t border-border">
            <ToggleSetting
              label="Show Online Status"
              description="Let companions see when you're online"
              value={preferences.showOnlineStatus}
              onChange={(v) => setPreferences({ showOnlineStatus: v })}
            />
            <ToggleSetting
              label="Read Receipts"
              description="Show when you've read messages"
              value={preferences.showReadReceipts}
              onChange={(v) => setPreferences({ showReadReceipts: v })}
            />
          </div>
        );

      case "appearance":
        return (
          <div className="p-4 space-y-4 border-t border-border">
            <div>
              <label className="text-sm text-muted-foreground mb-3 block">Theme</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setPreferences({ theme: "light" })}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition-all",
                    preferences.theme === "light"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-muted-foreground"
                  )}
                >
                  <Sun size={18} />
                  <span className="text-sm font-medium">Light</span>
                </button>
                <button
                  onClick={() => setPreferences({ theme: "dark" })}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition-all",
                    preferences.theme === "dark"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-muted-foreground"
                  )}
                >
                  <Moon size={18} />
                  <span className="text-sm font-medium">Dark</span>
                </button>
              </div>
            </div>
          </div>
        );

      case "sound":
        return (
          <div className="p-4 space-y-4 border-t border-border">
            <ToggleSetting
              label="Sound Effects"
              description="Enable sound effects in the app"
              value={preferences.soundEnabled}
              onChange={(v) => setPreferences({ soundEnabled: v })}
            />
            <div className={cn(!preferences.soundEnabled && "opacity-50 pointer-events-none")}>
              <label className="text-sm text-muted-foreground mb-3 block">
                Volume: {preferences.volume}%
              </label>
              <Slider
                value={[preferences.volume]}
                onValueChange={([v]) => setPreferences({ volume: v })}
                max={100}
                step={1}
              />
            </div>
          </div>
        );

      case "language":
        return (
          <div className="p-4 space-y-4 border-t border-border">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Language</label>
              <select
                value={preferences.language}
                onChange={(e) => setPreferences({ language: e.target.value })}
                className="w-full bg-secondary rounded-lg px-4 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="ja">日本語</option>
                <option value="ko">한국어</option>
                <option value="zh">中文</option>
              </select>
            </div>
            <p className="text-xs text-muted-foreground">
              Language settings apply to the user interface only.
            </p>
          </div>
        );

      case "help":
        return (
          <div className="p-4 space-y-4 border-t border-border">
            <div className="space-y-3">
              <HelpItem
                question="How do I chat with companions?"
                answer="Navigate to a companion's profile and click 'Start Chatting' to begin a conversation."
              />
              <HelpItem
                question="What is Mood Mode?"
                answer="Mood Mode adjusts how companions respond to you. Choose from Calm, Romantic, Playful, or Deep to personalize your experience."
              />
              <HelpItem
                question="How do Stories work?"
                answer="Stories are short updates from your companions that expire after 24 hours. Tap to view and swipe to navigate."
              />
              <HelpItem
                question="Can I create my own companion?"
                answer="Yes! Visit the Create page to design a custom AI companion with your preferred personality and appearance."
              />
            </div>
            <a
              href="mailto:support@nectar.ai"
              className="block text-center text-sm text-primary hover:underline mt-4"
            >
              Contact Support
            </a>
          </div>
        );

      default:
        return null;
    }
  };

  const settingsSections = [
    {
      title: "Account",
      items: [
        { id: "profile" as const, icon: User, label: "Profile", description: "Manage your profile information" },
        { id: "notifications" as const, icon: Bell, label: "Notifications", description: "Configure notification preferences" },
        { id: "privacy" as const, icon: Shield, label: "Privacy", description: "Control your privacy settings" },
      ],
    },
    {
      title: "Preferences",
      items: [
        { id: "appearance" as const, icon: Palette, label: "Appearance", description: "Theme and display settings" },
        { id: "sound" as const, icon: Volume2, label: "Sound", description: "Audio and voice settings" },
        { id: "language" as const, icon: Globe, label: "Language", description: "Change app language" },
      ],
    },
    {
      title: "Support",
      items: [
        { id: "help" as const, icon: HelpCircle, label: "Help Center", description: "Get help and support" },
      ],
    },
  ];

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
                  <div className="glass rounded-xl lg:rounded-2xl overflow-hidden">
                    {section.items.map((item, itemIndex) => {
                      const Icon = item.icon;
                      const isOpen = activePanel === item.id;
                      return (
                        <div key={item.id} className={itemIndex > 0 ? "border-t border-border" : ""}>
                          <button
                            onClick={() => togglePanel(item.id)}
                            className="w-full flex items-center gap-4 p-4 lg:p-5 hover:bg-muted/30 transition-colors text-left"
                          >
                            <div className="flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center rounded-xl bg-primary/10">
                              <Icon className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-foreground lg:text-lg">{item.label}</h3>
                              <p className="text-xs lg:text-sm text-muted-foreground">{item.description}</p>
                            </div>
                            <ChevronDown
                              className={cn(
                                "h-5 w-5 text-muted-foreground transition-transform",
                                isOpen && "rotate-180"
                              )}
                            />
                          </button>
                          <AnimatePresence>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                {renderPanelContent(item.id)}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}

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
                      <p className="font-semibold text-foreground">{preferences.displayName}</p>
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

// Helper Components
function ToggleSetting({
  label,
  description,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className={cn("flex items-center justify-between", disabled && "opacity-50")}>
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        onClick={() => !disabled && onChange(!value)}
        disabled={disabled}
        className={cn(
          "relative h-6 w-11 rounded-full transition-colors",
          value ? "bg-primary" : "bg-muted"
        )}
      >
        <div
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
            value ? "left-5" : "left-0.5"
          )}
        />
      </button>
    </div>
  );
}

function HelpItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/30 transition-colors"
      >
        <span className="text-sm font-medium text-foreground">{question}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <p className="px-3 pb-3 text-sm text-muted-foreground">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
