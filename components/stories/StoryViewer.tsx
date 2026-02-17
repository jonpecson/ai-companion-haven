"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react";
import type { Story, Companion } from "@/types";

interface StoryViewerProps {
  stories: Story[];
  companion: Companion;
  initialIndex?: number;
  onClose: () => void;
  onViewed: (storyId: string) => void;
  onPrevCompanion?: () => void;
  onNextCompanion?: () => void;
  onProfileClick?: () => void;
}

export function StoryViewer({
  stories,
  companion,
  initialIndex = 0,
  onClose,
  onViewed,
  onPrevCompanion,
  onNextCompanion,
  onProfileClick,
}: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const story = stories[currentIndex];
  const isVideo = story?.type === "video";
  const duration = isVideo && videoDuration ? videoDuration * 1000 : 5000; // Use video duration or 5 seconds for images

  // Use refs to avoid timer restarts when callbacks change
  const storiesLengthRef = useRef(stories.length);
  const onNextCompanionRef = useRef(onNextCompanion);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    storiesLengthRef.current = stories.length;
  }, [stories.length]);

  useEffect(() => {
    onNextCompanionRef.current = onNextCompanion;
  }, [onNextCompanion]);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Reset index when companion changes
  useEffect(() => {
    setCurrentIndex(0);
    setProgress(0);
    setVideoDuration(null);
  }, [stories]);

  // Handle video pause/play
  useEffect(() => {
    if (videoRef.current && isVideo) {
      if (isPaused) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [isPaused, isVideo]);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev >= storiesLengthRef.current - 1) {
        // Schedule companion change after state update
        setTimeout(() => {
          if (onNextCompanionRef.current) {
            onNextCompanionRef.current();
          } else {
            onCloseRef.current();
          }
        }, 0);
        return prev;
      }
      return prev + 1;
    });
    setProgress(0);
  }, []);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev <= 0) {
        if (onPrevCompanion) {
          setTimeout(() => onPrevCompanion(), 0);
        }
        return prev;
      }
      return prev - 1;
    });
    setProgress(0);
  }, [onPrevCompanion]);

  useEffect(() => {
    if (story && !story.viewed) {
      onViewed(story.id);
    }
  }, [story, onViewed]);

  useEffect(() => {
    if (isPaused) return;

    // For videos, wait until we have the duration
    if (isVideo && !videoDuration) return;

    setProgress(0);
    const startTime = Date.now();
    const storyDuration = isVideo && videoDuration ? videoDuration * 1000 : 5000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / storyDuration) * 100, 100);
      setProgress(newProgress);

      // For images, auto-advance. For videos, let the onEnded handler do it
      if (newProgress >= 100 && !isVideo) {
        clearInterval(interval);
        goNext();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [currentIndex, isPaused, goNext, isVideo, videoDuration]);

  // Reset video duration when story changes
  useEffect(() => {
    setVideoDuration(null);
  }, [currentIndex]);

  // Track touch state for distinguishing tap vs hold
  const touchStartTime = useRef<number>(0);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const isTouchHold = useRef<boolean>(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartTime.current = Date.now();
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isTouchHold.current = false;

    // Start hold timer - pause after 150ms of holding
    setTimeout(() => {
      if (touchStartTime.current > 0) {
        isTouchHold.current = true;
        setIsPaused(true);
      }
    }, 150);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchDuration = Date.now() - touchStartTime.current;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = Math.abs(touchEndX - touchStartX.current);
    const deltaY = Math.abs(touchEndY - touchStartY.current);

    touchStartTime.current = 0;
    setIsPaused(false);

    // If it was a hold (>150ms) or significant movement, don't navigate
    if (isTouchHold.current || deltaX > 30 || deltaY > 30) {
      isTouchHold.current = false;
      return;
    }

    // Quick tap - navigate based on position
    const width = window.innerWidth;
    if (touchEndX < width / 3) {
      goPrev();
    } else if (touchEndX > (width * 2) / 3) {
      goNext();
    }
  };

  const handleMouseDown = () => setIsPaused(true);
  const handleMouseUp = () => setIsPaused(false);

  // Desktop click handler (only for non-touch devices)
  const handleClick = (e: React.MouseEvent) => {
    // Skip if this was a touch event (let touch handlers manage it)
    if (e.detail === 0) return;

    const x = e.clientX;
    const width = window.innerWidth;
    if (x < width / 3) {
      goPrev();
    } else if (x > (width * 2) / 3) {
      goNext();
    }
  };

  if (!story) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black"
        style={{ height: '100dvh' }}
      >
        <div
          className="relative w-full h-full select-none touch-manipulation"
          onClick={handleClick}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Full-screen media container */}
          <div className="absolute inset-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={story.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="relative w-full h-full"
              >
                {story.type === "video" ? (
                  <video
                    ref={videoRef}
                    src={story.mediaUrl}
                    className="absolute inset-0 w-full h-full object-cover"
                    autoPlay
                    muted={isMuted}
                    playsInline
                    loop={false}
                    onLoadedMetadata={(e) => {
                      const video = e.target as HTMLVideoElement;
                      setVideoDuration(video.duration);
                    }}
                    onEnded={goNext}
                  />
                ) : (
                  <img
                    src={story.mediaUrl}
                    alt={story.caption || ""}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Gradient overlays for better UI visibility */}
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 via-black/30 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />
          </div>

          {/* Progress bars - with safe area */}
          <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 px-2 pt-[env(safe-area-inset-top,12px)] pb-2">
            {stories.map((_, i) => (
              <div
                key={i}
                className="flex-1 h-[3px] bg-white/30 rounded-full overflow-hidden"
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

          {/* Header - positioned below progress bars */}
          <div className="absolute top-[calc(env(safe-area-inset-top,12px)+16px)] left-0 right-0 z-20 flex items-center justify-between px-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onProfileClick?.();
              }}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/30">
                <Image
                  src={companion.avatar}
                  alt={companion.name}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
              <div>
                <span className="text-white text-sm font-semibold block drop-shadow-lg">
                  {companion.name}
                </span>
                <span className="text-white/70 text-xs">
                  {currentIndex + 1} of {stories.length}
                </span>
              </div>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="text-white p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={28} />
            </button>
          </div>

          {/* Navigation arrows - hidden on mobile, visible on desktop */}
          {onPrevCompanion && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrevCompanion();
              }}
              className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/30 rounded-full text-white/80 hover:text-white hover:bg-black/50 transition-all"
            >
              <ChevronLeft size={28} />
            </button>
          )}
          {onNextCompanion && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNextCompanion();
              }}
              className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/30 rounded-full text-white/80 hover:text-white hover:bg-black/50 transition-all"
            >
              <ChevronRight size={28} />
            </button>
          )}

          {/* Video mute/unmute button */}
          {isVideo && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
              }}
              className="absolute bottom-[calc(env(safe-area-inset-bottom,20px)+100px)] right-4 z-20 p-3 bg-black/40 backdrop-blur-sm rounded-full text-white hover:bg-black/60 transition-colors"
            >
              {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
            </button>
          )}

          {/* Caption - with safe area */}
          {story.caption && (
            <div className="absolute bottom-[calc(env(safe-area-inset-bottom,20px)+40px)] left-0 right-0 z-20 px-6">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={story.id}
                className="text-white text-center text-lg font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
              >
                {story.caption}
              </motion.p>
            </div>
          )}

          {/* Pause indicator */}
          <AnimatePresence>
            {isPaused && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
              >
                <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-8 bg-white rounded-full" />
                    <div className="w-2 h-8 bg-white rounded-full" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
