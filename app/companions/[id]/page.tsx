"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, MessageCircle, Heart, Share2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAppStore, useIsFavorite } from "@/lib/store";
import { companionsApi, storiesApi } from "@/lib/api";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import type { Companion, Story } from "@/types";

export default function CompanionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { setCompanions, setStories, toggleFavorite, favorites } = useAppStore();
  const [companion, setCompanion] = useState<Companion | null>(null);
  const [companionStories, setCompanionStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const isFavorite = companion ? favorites.includes(companion.id) : false;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [companionRes, storiesRes] = await Promise.all([
          companionsApi.get(params.id as string),
          storiesApi.getByCompanion(params.id as string).catch(() => ({ data: [] }))
        ]);
        setCompanion(companionRes.data);
        setCompanionStories(storiesRes.data || []);
      } catch {
        // Error handled - companion will be null, showing "not found" state
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id, setCompanions, setStories]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!companion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Companion not found</p>
      </div>
    );
  }

  const personalityTraits = [
    { name: "Friendliness", value: companion.personality.friendliness },
    { name: "Humor", value: companion.personality.humor },
    { name: "Intelligence", value: companion.personality.intelligence },
    { name: "Romantic", value: companion.personality.romantic },
    { name: "Flirty", value: companion.personality.flirty },
  ];

  return (
    <div className="min-h-screen">
      {/* Desktop Layout */}
      <div className="hidden lg:block p-8">
        {/* Back button - Desktop */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Back to Companions</span>
        </button>

        <div className="grid grid-cols-2 gap-10">
          {/* Left - Image */}
          <div className="space-y-4">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
              <Image
                src={companion.avatar}
                alt={companion.name}
                fill
                className="object-cover"
                priority
                sizes="50vw"
              />
              {/* Status Badge */}
              <div className="absolute top-4 left-4 flex items-center gap-2 glass px-3 py-1.5 rounded-full">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full",
                    companion.status === "online" ? "bg-green-500" : "bg-gray-500"
                  )}
                />
                <span className="text-xs font-medium text-foreground capitalize">
                  {companion.status}
                </span>
              </div>
            </div>

            {/* Stories Preview - Desktop */}
            {companionStories.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-muted-foreground">
                    STORIES
                  </h2>
                  <Link
                    href={`/stories?companion=${companion.id}`}
                    className="text-xs text-primary hover:underline"
                  >
                    View all
                  </Link>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {companionStories.slice(0, 4).map((story) => (
                    <Link
                      key={story.id}
                      href={`/stories?companion=${companion.id}`}
                      className="relative aspect-[3/4] rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
                    >
                      <Image
                        src={story.mediaUrl}
                        alt={story.caption || ""}
                        fill
                        className="object-cover"
                        sizes="150px"
                      />
                      {!story.viewed && (
                        <div className="absolute inset-0 ring-2 ring-inset ring-primary rounded-lg" />
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right - Details */}
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl font-bold text-foreground mb-1"
                >
                  {companion.name}
                </motion.h1>
                <p className="text-lg text-muted-foreground">{companion.age} years old</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    toggleFavorite(companion.id);
                    toast.success(isFavorite ? `Removed ${companion.name} from favorites` : `Added ${companion.name} to favorites!`);
                  }}
                  className="p-3 rounded-xl glass hover:bg-muted/80 transition-colors"
                >
                  <Heart
                    size={22}
                    className={cn(
                      "transition-colors",
                      isFavorite ? "fill-red-500 text-red-500" : "text-foreground hover:text-red-500"
                    )}
                  />
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Link copied to clipboard!");
                  }}
                  className="p-3 rounded-xl glass hover:bg-muted/80 transition-colors"
                >
                  <Share2 size={22} className="text-foreground" />
                </button>
              </div>
            </div>

            {/* Bio */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground text-lg leading-relaxed"
            >
              {companion.bio}
            </motion.p>

            {/* Tags */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-2"
            >
              {companion.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 rounded-full glass text-sm text-foreground hover:bg-muted/80 transition-colors cursor-default"
                >
                  {tag}
                </span>
              ))}
            </motion.div>

            {/* Personality */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl p-6"
            >
              <h2 className="text-sm font-semibold text-muted-foreground mb-5">
                PERSONALITY
              </h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                {personalityTraits.map((trait) => (
                  <div key={trait.name}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-foreground font-medium">{trait.name}</span>
                      <span className="text-muted-foreground">{trait.value}%</span>
                    </div>
                    <Slider value={[trait.value]} max={100} disabled />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Start Chat Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Link
                href={`/chat/${companion.id}`}
                className="flex items-center justify-center gap-3 w-full gradient-primary text-primary-foreground py-4 rounded-xl font-medium text-lg hover:opacity-90 transition-opacity"
              >
                <MessageCircle size={22} />
                Start Chatting with {companion.name}
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Hero */}
        <div className="relative h-[50vh]">
          <Image
            src={companion.avatar}
            alt={companion.name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="absolute top-4 left-4 z-10 p-2 rounded-full glass"
          >
            <ArrowLeft size={20} className="text-foreground" />
          </button>

          {/* Actions */}
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <button
              onClick={() => {
                toggleFavorite(companion.id);
                toast.success(isFavorite ? `Removed ${companion.name} from favorites` : `Added ${companion.name} to favorites!`);
              }}
              className="p-2 rounded-full glass"
            >
              <Heart
                size={20}
                className={cn(
                  "transition-colors",
                  isFavorite ? "fill-red-500 text-red-500" : "text-foreground hover:text-red-500"
                )}
              />
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Link copied to clipboard!");
              }}
              className="p-2 rounded-full glass"
            >
              <Share2 size={20} className="text-foreground" />
            </button>
          </div>

          {/* Status */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 mb-2">
              <div
                className={cn(
                  "w-2.5 h-2.5 rounded-full",
                  companion.status === "online" ? "bg-green-500" : "bg-gray-500"
                )}
              />
              <span className="text-sm text-white/80 capitalize">
                {companion.status}
              </span>
            </div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-white"
            >
              {companion.name}, {companion.age}
            </motion.h1>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-6 -mt-4 relative">
          {/* Bio */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground mb-4"
          >
            {companion.bio}
          </motion.p>

          {/* Tags */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-2 mb-6"
          >
            {companion.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full glass text-sm text-foreground"
              >
                {tag}
              </span>
            ))}
          </motion.div>

          {/* Personality */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <h2 className="text-sm font-semibold text-muted-foreground mb-4">
              PERSONALITY
            </h2>
            <div className="space-y-4">
              {personalityTraits.map((trait) => (
                <div key={trait.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground">{trait.name}</span>
                    <span className="text-muted-foreground">{trait.value}%</span>
                  </div>
                  <Slider value={[trait.value]} max={100} disabled />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Stories Preview */}
          {companionStories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-6"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-muted-foreground">
                  STORIES
                </h2>
                <Link
                  href={`/stories?companion=${companion.id}`}
                  className="text-xs text-primary"
                >
                  View all
                </Link>
              </div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {companionStories.slice(0, 4).map((story) => (
                  <Link
                    key={story.id}
                    href={`/stories?companion=${companion.id}`}
                    className="relative w-20 h-28 rounded-lg overflow-hidden flex-shrink-0"
                  >
                    <Image
                      src={story.mediaUrl}
                      alt={story.caption || ""}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                    {!story.viewed && (
                      <div className="absolute inset-0 ring-2 ring-inset ring-primary rounded-lg" />
                    )}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}

          {/* Start Chat Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link
              href={`/chat/${companion.id}`}
              className="flex items-center justify-center gap-2 w-full gradient-primary text-primary-foreground py-4 rounded-xl font-medium"
            >
              <MessageCircle size={20} />
              Start Chatting
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
