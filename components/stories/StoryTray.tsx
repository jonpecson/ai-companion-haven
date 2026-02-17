"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Story, Companion } from "@/types";

interface StoryTrayProps {
  stories: Story[];
  companions: Companion[];
  onStoryClick: (companionId: string) => void;
}

export function StoryTray({ stories, companions, onStoryClick }: StoryTrayProps) {
  // Group stories by companion
  const storyGroups = companions
    .map((companion) => ({
      companion,
      stories: stories.filter((s) => s.companionId === companion.id),
      hasUnviewed: stories.some((s) => s.companionId === companion.id && !s.viewed),
    }))
    .filter((group) => group.stories.length > 0);

  return (
    <div className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar py-2 -mx-4 px-4">
      {storyGroups.map(({ companion, hasUnviewed }) => (
        <button
          key={companion.id}
          onClick={() => onStoryClick(companion.id)}
          className="flex flex-col items-center gap-1.5 flex-shrink-0"
        >
          <div
            className={cn(
              "relative p-[2px] rounded-full",
              hasUnviewed
                ? "bg-gradient-to-tr from-primary to-accent"
                : "bg-muted"
            )}
          >
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-background p-[2px]">
              <Image
                src={companion.avatar}
                alt={companion.name}
                fill
                loading="lazy"
                className="object-cover rounded-full"
                sizes="64px"
              />
            </div>
            {companion.status === "online" && (
              <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-green-500 border-2 border-background" />
            )}
          </div>
          <span className="text-[10px] sm:text-[11px] text-muted-foreground truncate max-w-[56px] sm:max-w-[64px]">
            {companion.name}
          </span>
        </button>
      ))}
    </div>
  );
}
