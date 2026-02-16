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
            <button
              onClick={(e) => {
                e.stopPropagation();
                onProfileClick?.();
              }}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
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
            </button>
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
                ref={videoRef}
                src={story.mediaUrl}
                className="w-full h-full object-cover"
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

          {/* Video mute/unmute button */}
          {isVideo && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
              }}
              className="absolute bottom-24 right-4 z-10 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          )}

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
