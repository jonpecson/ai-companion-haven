"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import {
  MessageCircle,
  Image as ImageIcon,
  Flame,
  PartyPopper,
  Coffee,
  BookOpen,
  Dumbbell,
  Flower2,
  Star,
  Gamepad2,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { companionsApi } from "@/lib/api";
import { formatRelativeTime, cn } from "@/lib/utils";
import { IconSidebar } from "@/components/layout/IconSidebar";
import { TopBar } from "@/components/layout/TopBar";
import type { Memory, Companion } from "@/types";

const iconMap: Record<string, React.ElementType> = {
  "message-circle": MessageCircle,
  image: ImageIcon,
  flame: Flame,
  "party-popper": PartyPopper,
  coffee: Coffee,
  "book-open": BookOpen,
  dumbbell: Dumbbell,
  "flower-2": Flower2,
  star: Star,
  "gamepad-2": Gamepad2,
};

const eventTypeColors: Record<string, string> = {
  chat: "from-blue-500 to-blue-600",
  story_view: "from-purple-500 to-purple-600",
  milestone: "from-yellow-500 to-orange-500",
  mood_change: "from-pink-500 to-rose-500",
};

function MemoryIcon({ iconName }: { iconName?: string }) {
  const Icon = iconMap[iconName || "message-circle"] || MessageCircle;
  return <Icon size={16} />;
}

// Generate dynamic memories based on real companions
function generateMemories(companions: Companion[]): Memory[] {
  if (companions.length === 0) return [];

  const memoryTemplates = [
    { eventType: "chat", content: "You chatted with {name} for 20 minutes", icon: "message-circle" },
    { eventType: "milestone", content: "{name} remembered your favorite thing", icon: "star" },
    { eventType: "story_view", content: "You viewed {name}'s story", icon: "image" },
    { eventType: "chat", content: "Deep conversation with {name}", icon: "message-circle" },
    { eventType: "milestone", content: "7-day streak with {name}!", icon: "flame" },
    { eventType: "milestone", content: "You and {name} shared 50 messages!", icon: "party-popper" },
    { eventType: "chat", content: "{name} shared something special with you", icon: "coffee" },
    { eventType: "story_view", content: "You viewed {name}'s new photos", icon: "image" },
    { eventType: "milestone", content: "{name} recommended you something", icon: "book-open" },
    { eventType: "chat", content: "Fun chat session with {name}", icon: "gamepad-2" },
  ];

  const memories: Memory[] = [];
  const now = Date.now();

  // Generate memories for each companion
  companions.forEach((companion, companionIndex) => {
    // Each companion gets 1-3 memories
    const numMemories = Math.min(3, Math.floor(Math.random() * 3) + 1);

    for (let i = 0; i < numMemories; i++) {
      const template = memoryTemplates[(companionIndex + i) % memoryTemplates.length];
      const hoursAgo = (companionIndex * 4 + i * 2 + 1) * 3600000; // Spread memories over time

      memories.push({
        id: `mem-${companion.id}-${i}`,
        userId: "user1",
        companionId: companion.id,
        eventType: template.eventType as Memory["eventType"],
        metadata: {
          content: template.content.replace("{name}", companion.name),
          icon: template.icon,
        },
        createdAt: new Date(now - hoursAgo).toISOString(),
      });
    }
  });

  // Sort by date (most recent first)
  return memories.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export default function MemoriesPage() {
  const { companions, memories, setCompanions, setMemories } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await companionsApi.list({ pageSize: 50 });
        const companionData = response.data || [];
        setCompanions(companionData);

        // Only generate placeholder memories if there are no real memories yet
        if (memories.length === 0) {
          const generatedMemories = generateMemories(companionData);
          setMemories(generatedMemories);
        }
      } catch {
        // Error handled silently
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setCompanions, setMemories, memories.length]);

  // Group memories by date
  const groupedMemories = memories.reduce(
    (groups: Record<string, Memory[]>, memory) => {
      const date = new Date(memory.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let key: string;
      if (date.toDateString() === today.toDateString()) {
        key = "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        key = "Yesterday";
      } else {
        key = date.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
        });
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(memory);
      return groups;
    },
    {}
  );

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <IconSidebar />
        <main className="flex-1 lg:ml-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <IconSidebar />
      <main className="flex-1 lg:ml-16">
        <TopBar />
        <div className="p-4 lg:p-6">
          {/* Header */}
          <div className="lg:flex lg:items-end lg:justify-between lg:mb-8 mb-6">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl lg:text-3xl font-bold text-foreground mb-2"
              >
                Memory Timeline
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-muted-foreground text-sm lg:text-base"
              >
                Your journey with your companions
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="hidden lg:block text-sm text-muted-foreground"
            >
              {memories.length} memories recorded
            </motion.div>
          </div>

          {/* Desktop Grid Layout */}
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            {/* Timeline - Main Content */}
            <div className="lg:col-span-2">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 lg:left-8 top-0 bottom-0 w-0.5 bg-border" />

                {Object.entries(groupedMemories).map(([date, dateMemories], groupIndex) => (
                  <div key={date} className="mb-8">
                    <motion.h2
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: groupIndex * 0.1 }}
                      className="text-sm font-semibold text-muted-foreground mb-4 ml-14 lg:ml-20 lg:text-base"
                    >
                      {date}
                    </motion.h2>

                    <div className="space-y-4">
                      {dateMemories.map((memory, index) => {
                        const companion = companions.find(
                          (c) => c.id === memory.companionId
                        );
                        const metadata = memory.metadata as {
                          content?: string;
                          icon?: string;
                        };

                        return (
                          <motion.div
                            key={memory.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: groupIndex * 0.1 + index * 0.05 }}
                            className="relative flex items-start gap-4"
                          >
                            {/* Timeline dot */}
                            <div
                              className={cn(
                                "relative z-10 w-12 h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center text-white bg-gradient-to-br",
                                eventTypeColors[memory.eventType]
                              )}
                            >
                              <MemoryIcon iconName={metadata.icon} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 glass rounded-xl p-4 lg:p-5 hover:bg-muted/30 transition-colors">
                              <div className="flex items-start gap-3 lg:gap-4">
                                {companion && (
                                  <Link
                                    href={`/companions/${companion.id}`}
                                    className="relative w-10 h-10 lg:w-12 lg:h-12 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-transparent hover:ring-primary/50 transition-all"
                                  >
                                    <Image
                                      src={companion.avatar}
                                      alt={companion.name}
                                      fill
                                      className="object-cover"
                                      sizes="48px"
                                    />
                                  </Link>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-foreground text-sm lg:text-base">
                                    {metadata.content || "Memory"}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1 lg:mt-2">
                                    {companion && (
                                      <span className="text-xs lg:text-sm text-primary font-medium">
                                        {companion.name}
                                      </span>
                                    )}
                                    <span className="text-xs lg:text-sm text-muted-foreground">
                                      {formatRelativeTime(memory.createdAt)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {memories.length === 0 && (
                  <div className="text-center py-12 lg:py-24 ml-14 lg:ml-20">
                    <p className="text-muted-foreground text-lg">No memories yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Start chatting with companions to create memories!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar - Desktop Only */}
            <div className="hidden lg:block">
              <div className="sticky top-24 space-y-6">
                {/* Stats Card */}
                <div className="glass rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-4">MEMORY STATS</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total Memories</span>
                      <span className="text-foreground font-medium">{memories.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Chat Messages</span>
                      <span className="text-foreground font-medium">
                        {memories.filter(m => m.eventType === 'chat').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Milestones</span>
                      <span className="text-foreground font-medium">
                        {memories.filter(m => m.eventType === 'milestone').length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Companions with Memories */}
                <div className="glass rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-4">COMPANIONS</h3>
                  <div className="space-y-3">
                    {companions.slice(0, 5).map(companion => {
                      const count = memories.filter(m => m.companionId === companion.id).length;
                      return (
                        <Link
                          key={companion.id}
                          href={`/companions/${companion.id}`}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/30 transition-colors"
                        >
                          <div className="relative w-10 h-10 rounded-full overflow-hidden">
                            <Image
                              src={companion.avatar}
                              alt={companion.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{companion.name}</p>
                            <p className="text-xs text-muted-foreground">{count} memories</p>
                          </div>
                        </Link>
                      );
                    })}
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
