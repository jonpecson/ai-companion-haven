"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";
import { Loader2, ImageIcon, Download } from "lucide-react";
import type { Message } from "@/types";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === "user";
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);

  const hasImage = message.imageUrl && !message.isGeneratingImage;
  const isGenerating = message.isGeneratingImage;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className={cn("flex mb-3 lg:mb-4", isUser ? "justify-end" : "justify-start")}
      >
        <div
          className={cn(
            "rounded-2xl",
            hasImage ? "overflow-hidden max-w-[280px] lg:max-w-[320px]" : "max-w-[80%] lg:max-w-[65%] px-4 py-2.5 lg:px-5 lg:py-3",
            isUser
              ? "gradient-primary text-white rounded-br-md"
              : "glass text-foreground rounded-bl-md"
          )}
        >
          {/* Image content */}
          {hasImage && (
            <div className="relative">
              <div
                className="relative cursor-pointer"
                onClick={() => setShowFullImage(true)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={message.imageUrl!}
                  alt="Companion photo"
                  className={cn(
                    "w-full h-auto object-cover transition-opacity duration-300 rounded-t-xl",
                    imageLoaded ? "opacity-100" : "opacity-0"
                  )}
                  onLoad={() => setImageLoaded(true)}
                />
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/50 min-h-[200px]">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
              {message.content && (
                <div className="px-3 py-2 lg:px-4 lg:py-2.5">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Loading state for image generation */}
          {isGenerating && (
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="relative w-10 h-10 rounded-lg bg-muted/30 flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-muted-foreground animate-pulse" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Generating photo...</p>
                <div className="w-24 h-1 bg-muted/30 rounded-full mt-1.5 overflow-hidden">
                  <motion.div
                    className="h-full bg-primary/60 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Text content (when no image) */}
          {!hasImage && !isGenerating && (
            <p className="text-sm lg:text-base leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          )}

          {/* Timestamp */}
          <p
            className={cn(
              "text-[10px] lg:text-xs mt-1",
              hasImage ? "px-3 pb-2" : "",
              isUser ? "text-white/70" : "text-muted-foreground"
            )}
          >
            {formatRelativeTime(message.createdAt)}
          </p>
        </div>
      </motion.div>

      {/* Full image modal */}
      {showFullImage && message.imageUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowFullImage(false)}
        >
          <div className="relative max-w-2xl w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={message.imageUrl}
              alt="Companion photo"
              className="w-full h-auto rounded-lg"
            />
            <a
              href={message.imageUrl}
              download="companion-photo.png"
              className="absolute bottom-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Download className="w-5 h-5 text-white" />
            </a>
          </div>
        </motion.div>
      )}
    </>
  );
}
