"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Story, Companion } from "@/types";

interface StoryViewerProps {
  stories: Story[];
  companion: Companion;
  initialIndex?: number;
  onClose: () => void;
  onViewed: (storyId: string) => void;
  onPrevCompanion?: () => void;
  onNextCompanion?: () => void;
}

export function StoryViewer({
  stories,
  companion,
  initialIndex = 0,
  onClose,
  onViewed,
  onPrevCompanion,
  onNextCompanion,
}: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const story = stories[currentIndex];
  const duration = 5000; // 5 seconds per story

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

  useEffect(() => {
    if (story && !story.viewed) {
      onViewed(story.id);
    }
  }, [story, onViewed]);

  useEffect(() => {
    if (isPaused) return;

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
  }, [currentIndex, isPaused, goNext]);

  const handleTap = (e: React.MouseEvent) => {
    const x = e.clientX;
    const width = window.innerWidth;
    if (x < width / 3) {
      goPrev();
    } else if (x > (width * 2) / 3) {
      goNext();
    }
  };

  const handleTouchStart = () => setIsPaused(true);
  const handleTouchEnd = () => setIsPaused(false);

  if (!story) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black"
      >
        <div
          className="relative w-full h-full"
          onClick={handleTap}
          onMouseDown={handleTouchStart}
          onMouseUp={handleTouchEnd}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Progress bars */}
          <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 p-3 pt-safe">
            {stories.map((_, i) => (
              <div
                key={i}
                className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden"
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
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 rounded-full overflow-hidden">
                <Image
                  src={companion.avatar}
                  alt={companion.name}
                  fill
                  className="object-cover"
                  sizes="32px"
                />
              </div>
              <span className="text-white text-sm font-medium">
                {companion.name}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="text-white p-2"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation arrows */}
          {onPrevCompanion && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrevCompanion();
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 text-white/70 hover:text-white"
            >
              <ChevronLeft size={32} />
            </button>
          )}
          {onNextCompanion && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNextCompanion();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 text-white/70 hover:text-white"
            >
              <ChevronRight size={32} />
            </button>
          )}

          {/* Content */}
          <motion.div
            key={story.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full h-full"
          >
            {story.type === "video" ? (
              <video
                src={story.mediaUrl}
                className="w-full h-full object-cover"
                autoPlay
                muted
                playsInline
              />
            ) : (
              <Image
                src={story.mediaUrl}
                alt={story.caption || ""}
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
            )}
          </motion.div>

          {/* Caption */}
          {story.caption && (
            <div className="absolute bottom-16 left-0 right-0 z-10 px-6">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={story.id}
                className="text-white text-center text-lg font-medium drop-shadow-lg"
              >
                {story.caption}
              </motion.p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
