"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { companionsApi, storiesApi } from "@/lib/api";
import { IconSidebar } from "@/components/layout/IconSidebar";
import { TopBar } from "@/components/layout/TopBar";
import { HeroSection } from "@/components/home/HeroSection";
import { CategoryFilter, type Category } from "@/components/home/CategoryFilter";
import { CompanionCard } from "@/components/home/CompanionCard";
import { StoryTray } from "@/components/stories/StoryTray";
import { formatRelativeTime } from "@/lib/utils";

export default function HomePage() {
  const { companions, stories, memories, setCompanions, setStories } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category>("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [companionsRes, storiesRes] = await Promise.all([
          companionsApi.list({ pageSize: 50 }),
          storiesApi.list().catch(() => ({ data: [] }))
        ]);
        setCompanions(companionsRes.data || []);
        setStories(storiesRes.data || []);
      } catch {
        // Error handled silently - UI shows empty state
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setCompanions, setStories]);

  // Filter companions by category
  const filteredCompanions = activeCategory === "all"
    ? companions
    : companions.filter((c) => c.category === activeCategory);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Fixed Icon Sidebar - Desktop */}
      <IconSidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-16">
        {/* Top Bar */}
        <TopBar />

        <div className="space-y-6 lg:space-y-8 p-4 lg:p-6">
          {/* Hero Section */}
          <HeroSection />

          {/* Stories Section */}
          <div>
            <h2 className="font-display text-lg lg:text-xl font-bold text-foreground mb-3 lg:mb-4">
              Stories
            </h2>
            <StoryTray
              stories={stories}
              companions={companions}
              onStoryClick={(id) => {
                window.location.href = `/stories?companion=${id}`;
              }}
            />
          </div>

          {/* Popular Companions Section */}
          <div className="space-y-4 lg:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
              <div>
                <h2 className="font-display text-xl lg:text-2xl font-bold text-foreground">Popular Companions</h2>
                <p className="mt-1 text-xs lg:text-sm text-muted-foreground">Discover trending AI characters</p>
              </div>
              <CategoryFilter activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12 lg:py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5">
                {filteredCompanions.map((companion) => (
                  <CompanionCard key={companion.id} companion={companion} />
                ))}
              </div>
            )}

            {!loading && filteredCompanions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No companions found in this category.</p>
                <button
                  onClick={() => setActiveCategory("all")}
                  className="mt-2 text-primary hover:underline text-sm"
                >
                  View all companions
                </button>
              </div>
            )}
          </div>

          {/* Recent Memories - Desktop Sidebar Style */}
          {memories.length > 0 && (
            <div className="lg:hidden">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-lg font-bold text-foreground">Recent Memories</h2>
                <Link href="/memories" className="text-xs text-primary hover:underline">
                  View all
                </Link>
              </div>
              <div className="space-y-2">
                {memories.slice(0, 3).map((mem) => {
                  const companion = companions.find((c) => c.id === mem.companionId);
                  return (
                    <div
                      key={mem.id}
                      className="glass rounded-xl p-3 flex items-center gap-3"
                    >
                      {companion && (
                        <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                          <Image
                            src={companion.avatar}
                            alt={companion.name}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">
                          {(mem.metadata as { content?: string })?.content || "Memory"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatRelativeTime(mem.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
