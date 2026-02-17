"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Companion } from "@/types";

interface CompanionCardProps {
  companion: Companion;
  index?: number;
}

export function CompanionCard({ companion, index = 0 }: CompanionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={`/companions/${companion.id}`}
        className="block group"
      >
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden glass lg:hover:ring-2 lg:hover:ring-primary/50 transition-all duration-300">
          <Image
            src={companion.avatar}
            alt={companion.name}
            fill
            loading="lazy"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent lg:group-hover:from-black/90 transition-colors" />

          {/* Status indicator */}
          <div className="absolute top-3 right-3 lg:top-4 lg:right-4">
            <div className={cn(
              "w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full",
              companion.status === "online" ? "bg-green-500 animate-pulse-ring" : "bg-gray-500"
            )} />
          </div>

          {/* Chat hint on hover - Desktop only */}
          <div className="hidden lg:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium">
              View Profile
            </span>
          </div>

          {/* Info */}
          <div className="absolute bottom-0 left-0 right-0 p-3 lg:p-4">
            <h3 className="text-white font-semibold text-sm lg:text-base mb-0.5 lg:mb-1">
              {companion.name}, {companion.age}
            </h3>
            <p className="text-white/70 text-xs lg:text-sm line-clamp-2">
              {companion.bio}
            </p>
            <div className="flex flex-wrap gap-1 lg:gap-1.5 mt-2">
              {companion.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full bg-white/10 text-white/80 text-[10px] lg:text-xs lg:px-2.5 lg:py-1"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
