"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, ChevronLeft, ChevronRight, X, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { companionsApi, storiesApi } from "@/lib/api";
import { IconSidebar } from "@/components/layout/IconSidebar";
import { StoryViewer } from "@/components/stories/StoryViewer";
import { cn } from "@/lib/utils";
import type { Story, Companion } from "@/types";

// Desktop Story Viewer Component (inline, not modal)
function DesktopStoryViewer({
  stories,
  companion,
  onClose,
  onViewed,
  onPrevCompanion,
  onNextCompanion,
  onProfileClick,
}: {
  stories: Story[];
  companion: Companion;
  onClose: () => void;
  onViewed: (storyId: string) => void;
  onPrevCompanion?: () => void;
  onNextCompanion?: () => void;
  onProfileClick: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const story = stories[currentIndex];
  const duration = 5000;

  const goNext = useCallback(() => {
    if (currentIndex >= stories.length - 1) {
      if (onNextCompanion) {
        onNextCompanion();
      } else {
        onClose();
      }
    } else {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
    }
  }, [currentIndex, stories.length, onNextCompanion, onClose]);

  const goPrev = useCallback(() => {
    if (currentIndex <= 0) {
      if (onPrevCompanion) {
        onPrevCompanion();
      }
    } else {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
    }
  }, [currentIndex, onPrevCompanion]);

  // Reset index when companion changes
  useEffect(() => {
    setCurrentIndex(0);
    setProgress(0);
  }, [companion.id]);

  useEffect(() => {
    if (story && !story.viewed) {
      onViewed(story.id);
    }
  }, [story, onViewed]);

  useEffect(() => {
    if (isPaused || story?.type === "video") return;

    setProgress(0);
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        clearInterval(interval);
        goNext();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [currentIndex, isPaused, goNext, story?.type]);

  if (!story) return null;

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black/95 rounded-2xl overflow-hidden">
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 p-4">
        {stories.map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-white rounded-full transition-all duration-75"
              style={{
                width:
                  i < currentIndex
                    ? "100%"
                    : i === currentIndex
                    ? `${progress}%`
                    : "0%",
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-8 left-0 right-0 z-10 flex items-center justify-between px-4">
        <button
          onClick={onProfileClick}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/50">
            <Image
              src={companion.avatar}
              alt={companion.name}
              fill
              className="object-cover"
              sizes="40px"
            />
          </div>
          <div className="text-left">
            <span className="text-white text-sm font-medium block">
              {companion.name}
            </span>
            <span className="text-white/60 text-xs">
              {currentIndex + 1} of {stories.length}
            </span>
          </div>
        </button>
        <button
          onClick={onClose}
          className="text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={goPrev}
        disabled={currentIndex === 0 && !onPrevCompanion}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={32} />
      </button>
      <button
        onClick={goNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 text-white/50 hover:text-white transition-colors"
      >
        <ChevronRight size={32} />
      </button>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={story.id}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="relative w-full h-full"
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {story.type === "video" ? (
            <video
              src={story.mediaUrl}
              className="w-full h-full object-contain"
              autoPlay
              muted
              playsInline
              onEnded={goNext}
            />
          ) : (
            <Image
              src={story.mediaUrl}
              alt={story.caption || ""}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Caption */}
      {story.caption && (
        <div className="absolute bottom-8 left-0 right-0 z-10 px-6">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={story.id}
            className="text-white text-center text-base font-medium drop-shadow-lg"
          >
            {story.caption}
          </motion.p>
        </div>
      )}
    </div>
  );
}

function StoriesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { companions, stories, setCompanions, setStories, markStoryViewed } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [activeCompanionId, setActiveCompanionId] = useState<string | null>(null);

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

  useEffect(() => {
    const companionId = searchParams.get("companion");
    if (companionId) {
      setActiveCompanionId(companionId);
    }
  }, [searchParams]);

  // Get companions with stories
  const companionsWithStories = companions.filter((c) =>
    stories.some((s) => s.companionId === c.id)
  );

  // Auto-select first companion on desktop if none selected
  useEffect(() => {
    if (!loading && companionsWithStories.length > 0 && !activeCompanionId) {
      // Only auto-select on desktop
      if (window.innerWidth >= 1024) {
        setActiveCompanionId(companionsWithStories[0].id);
      }
    }
  }, [loading, companionsWithStories, activeCompanionId]);

  const activeCompanion = companions.find((c) => c.id === activeCompanionId);
  const activeStories = stories
    .filter((s) => s.companionId === activeCompanionId)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  const currentCompanionIndex = companionsWithStories.findIndex(
    (c) => c.id === activeCompanionId
  );

  const handlePrevCompanion = useCallback(() => {
    if (currentCompanionIndex > 0) {
      setActiveCompanionId(companionsWithStories[currentCompanionIndex - 1].id);
    }
  }, [currentCompanionIndex, companionsWithStories]);

  const handleNextCompanion = useCallback(() => {
    if (currentCompanionIndex < companionsWithStories.length - 1) {
      setActiveCompanionId(companionsWithStories[currentCompanionIndex + 1].id);
    } else {
      // Loop back to first
      setActiveCompanionId(companionsWithStories[0]?.id || null);
    }
  }, [currentCompanionIndex, companionsWithStories]);

  const handleClose = () => {
    setActiveCompanionId(null);
    router.push("/stories");
  };

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

      {/* Mobile View */}
      <main className="flex-1 lg:ml-16 lg:hidden">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-foreground mb-6">Stories</h1>

          {/* Story List for Mobile */}
          <div className="space-y-3">
            {companionsWithStories.map((companion) => {
              const companionStories = stories.filter(
                (s) => s.companionId === companion.id
              );
              const unviewedCount = companionStories.filter((s) => !s.viewed).length;
              const hasVideo = companionStories.some((s) => s.type === "video");

              return (
                <button
                  key={companion.id}
                  onClick={() => setActiveCompanionId(companion.id)}
                  className="w-full flex items-center gap-4 glass rounded-xl p-3 text-left hover:bg-muted/30 transition-colors"
                >
                  <div className={cn(
                    "relative w-16 h-16 rounded-full overflow-hidden p-[2px]",
                    unviewedCount > 0
                      ? "bg-gradient-to-tr from-primary to-accent"
                      : "bg-muted"
                  )}>
                    <div className="w-full h-full rounded-full overflow-hidden bg-background">
                      <img
                        src={companion.avatar}
                        alt={companion.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {hasVideo && (
                      <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Play size={10} className="text-white fill-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-foreground font-medium">{companion.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {companionStories.length} stories
                      {unviewedCount > 0 && (
                        <span className="text-primary"> • {unviewedCount} new</span>
                      )}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Story Viewer (fullscreen modal) */}
        {activeCompanion && activeStories.length > 0 && (
          <StoryViewer
            stories={activeStories}
            companion={activeCompanion}
            onClose={handleClose}
            onViewed={markStoryViewed}
            onPrevCompanion={currentCompanionIndex > 0 ? handlePrevCompanion : undefined}
            onNextCompanion={
              currentCompanionIndex < companionsWithStories.length - 1
                ? handleNextCompanion
                : undefined
            }
            onProfileClick={() => router.push(`/companions/${activeCompanion.id}`)}
          />
        )}
      </main>

      {/* Desktop View - Facebook Style */}
      <main className="hidden lg:flex flex-1 ml-16 h-screen">
        {/* Left Sidebar - Companion List */}
        <div className="w-80 border-r border-border bg-background/50 flex flex-col">
          <div className="p-6 border-b border-border">
            <h1 className="text-xl font-bold text-foreground">Stories</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {companionsWithStories.length} companions with stories
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-3 space-y-1">
              {companionsWithStories.map((companion) => {
                const companionStories = stories.filter(
                  (s) => s.companionId === companion.id
                );
                const unviewedCount = companionStories.filter((s) => !s.viewed).length;
                const hasVideo = companionStories.some((s) => s.type === "video");
                const isActive = companion.id === activeCompanionId;

                return (
                  <button
                    key={companion.id}
                    onClick={() => setActiveCompanionId(companion.id)}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-xl p-3 text-left transition-all",
                      isActive
                        ? "bg-primary/10 ring-1 ring-primary/30"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <div className={cn(
                      "relative w-14 h-14 rounded-full overflow-hidden p-[2px] flex-shrink-0",
                      unviewedCount > 0
                        ? "bg-gradient-to-tr from-primary to-accent"
                        : "bg-muted"
                    )}>
                      <div className="w-full h-full rounded-full overflow-hidden bg-background">
                        <img
                          src={companion.avatar}
                          alt={companion.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {hasVideo && (
                        <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                          <Play size={8} className="text-white fill-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={cn(
                        "font-medium truncate",
                        isActive ? "text-primary" : "text-foreground"
                      )}>
                        {companion.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {companionStories.length} stories
                        {unviewedCount > 0 && (
                          <span className="text-primary font-medium"> • {unviewedCount} new</span>
                        )}
                      </p>
                    </div>
                    {isActive && (
                      <div className="w-1.5 h-8 bg-primary rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side - Story Viewer */}
        <div className="flex-1 bg-black/90 flex items-center justify-center p-8">
          {activeCompanion && activeStories.length > 0 ? (
            <div className="w-full max-w-md h-[calc(100vh-4rem)] max-h-[800px]">
              <DesktopStoryViewer
                stories={activeStories}
                companion={activeCompanion}
                onClose={handleClose}
                onViewed={markStoryViewed}
                onPrevCompanion={currentCompanionIndex > 0 ? handlePrevCompanion : undefined}
                onNextCompanion={
                  currentCompanionIndex < companionsWithStories.length - 1
                    ? handleNextCompanion
                    : undefined
                }
                onProfileClick={() => router.push(`/companions/${activeCompanion.id}`)}
              />
            </div>
          ) : (
            <div className="text-center text-white/50">
              <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                <Play size={40} className="text-white/30" />
              </div>
              <p className="text-lg">Select a companion to view their stories</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function StoriesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen p-4 pt-6">Loading...</div>}>
      <StoriesContent />
    </Suspense>
  );
}
