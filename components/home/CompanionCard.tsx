"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, MessageCircle, Sparkles } from "lucide-react";
import type { Companion } from "@/types";

interface CompanionCardProps {
  companion: Companion;
}

export function CompanionCard({ companion }: CompanionCardProps) {
  const messageCount = companion.messageCount
    ? companion.messageCount > 1000
      ? `${(companion.messageCount / 1000).toFixed(1)}k`
      : String(companion.messageCount)
    : "0";

  return (
    <Link
      href={`/chat/${companion.id}`}
      className="group relative overflow-hidden rounded-xl card-gradient card-shadow cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:glow-primary"
    >
      <div className="aspect-[3/4] overflow-hidden">
        <Image
          src={companion.avatar}
          alt={companion.name}
          fill
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
        />
        <div className="absolute inset-0 overlay-gradient" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 space-y-1.5 sm:space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-base sm:text-lg font-bold text-foreground">{companion.name}</h3>
          <span className="text-xs sm:text-sm text-muted-foreground">{companion.age}</span>
        </div>
        <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {companion.bio}
        </p>
        <div className="flex items-center gap-3 sm:gap-4 pt-0.5 sm:pt-1">
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
            <MessageCircle className="h-3 w-3" />
            <span>{messageCount}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
            <Heart className="h-3 w-3" />
            <span>{companion.tags?.length || 0}</span>
          </div>
        </div>
      </div>

      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="rounded-full bg-primary/90 p-1.5 sm:p-2 glow-primary">
          <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-primary-foreground" />
        </div>
      </div>

      {/* Online Status */}
      {companion.status === "online" && (
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
          <div className="flex items-center gap-1.5 rounded-full bg-black/50 px-2 py-1 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] text-white/80">Online</span>
          </div>
        </div>
      )}
    </Link>
  );
}
