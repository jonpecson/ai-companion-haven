"use client";

import { motion } from "framer-motion";
import { useAppStore, useMood } from "@/lib/store";
import { cn } from "@/lib/utils";
import { IconSidebar } from "@/components/layout/IconSidebar";
import { TopBar } from "@/components/layout/TopBar";
import type { MoodType, MoodTheme } from "@/types";

const moodThemes: Record<MoodType, MoodTheme> = {
  calm: {
    name: "Calm",
    emoji: "🧘",
    description: "Peaceful and relaxed conversations",
    gradient: "from-blue-500 to-teal-500",
    bgClass: "from-blue-900/30 to-teal-900/30",
  },
  romantic: {
    name: "Romantic",
    emoji: "💕",
    description: "Sweet and heartfelt connections",
    gradient: "from-pink-500 to-rose-500",
    bgClass: "from-pink-900/30 to-rose-900/30",
  },
  playful: {
    name: "Playful",
    emoji: "🎉",
    description: "Fun and lighthearted vibes",
    gradient: "from-orange-500 to-yellow-500",
    bgClass: "from-orange-900/30 to-yellow-900/30",
  },
  deep: {
    name: "Deep",
    emoji: "🌌",
    description: "Meaningful and philosophical talks",
    gradient: "from-purple-500 to-indigo-500",
    bgClass: "from-purple-900/30 to-indigo-900/30",
  },
};

export default function MoodPage() {
  const currentMood = useMood();
  const setMood = useAppStore((state) => state.setMood);

  const handleMoodSelect = (mood: MoodType) => {
    setMood(mood);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <IconSidebar />
      <main className="flex-1 lg:ml-16">
        <TopBar />
        <div
          className={cn(
            "min-h-screen p-4 lg:p-6 bg-gradient-to-b",
            moodThemes[currentMood].bgClass,
            "transition-all duration-500"
          )}
        >
          {/* Desktop Grid Layout */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-start max-w-6xl mx-auto">
            {/* Left Column - Current Mood */}
            <div className="lg:sticky lg:top-24">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center lg:text-left mb-8"
              >
                <h1 className="text-2xl lg:text-4xl font-bold text-foreground mb-2">AI Mood Mode</h1>
                <p className="text-muted-foreground text-sm lg:text-base">
                  Choose how you want your conversations to feel
                </p>
              </motion.div>

              {/* Current Mood Display */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="text-center lg:text-left mb-8 lg:mb-12"
              >
                <div
                  className={cn(
                    "inline-flex items-center justify-center w-24 h-24 lg:w-32 lg:h-32 rounded-full text-5xl lg:text-6xl mb-4",
                    "bg-gradient-to-br",
                    moodThemes[currentMood].gradient
                  )}
                >
                  {moodThemes[currentMood].emoji}
                </div>
                <h2 className="text-xl lg:text-2xl font-semibold text-foreground">
                  {moodThemes[currentMood].name} Mode
                </h2>
                <p className="text-sm lg:text-base text-muted-foreground mt-1">
                  {moodThemes[currentMood].description}
                </p>
              </motion.div>

              {/* Info Card - Desktop */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="hidden lg:block glass rounded-2xl p-6"
              >
                <h4 className="text-sm font-semibold text-foreground mb-4">
                  How Mood Mode Works
                </h4>
                <ul className="text-sm text-muted-foreground space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-primary text-lg">•</span>
                    Changes the conversation style of your AI companions
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary text-lg">•</span>
                    Adapts the chat interface theme to match your mood
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary text-lg">•</span>
                    Personalizes AI responses to fit the selected atmosphere
                  </li>
                </ul>
              </motion.div>
            </div>

            {/* Right Column - Mood Selection */}
            <div>
              <div className="space-y-3 lg:space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground mb-4">
                  SELECT MOOD
                </h3>

                {(Object.entries(moodThemes) as [MoodType, MoodTheme][]).map(
                  ([mood, theme], index) => (
                    <motion.button
                      key={mood}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      onClick={() => handleMoodSelect(mood)}
                      className={cn(
                        "w-full flex items-center gap-4 p-4 lg:p-5 rounded-xl lg:rounded-2xl transition-all",
                        currentMood === mood
                          ? `bg-gradient-to-r ${theme.gradient} text-white shadow-lg`
                          : "glass text-foreground hover:bg-muted/50 hover:scale-[1.02]"
                      )}
                    >
                      <span className="text-3xl lg:text-4xl">{theme.emoji}</span>
                      <div className="flex-1 text-left">
                        <h4 className="font-semibold lg:text-lg">{theme.name}</h4>
                        <p
                          className={cn(
                            "text-sm",
                            currentMood === mood ? "text-white/80" : "text-muted-foreground"
                          )}
                        >
                          {theme.description}
                        </p>
                      </div>
                      {currentMood === mood && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-white/20 flex items-center justify-center"
                        >
                          <div className="w-3 h-3 lg:w-4 lg:h-4 rounded-full bg-white" />
                        </motion.div>
                      )}
                    </motion.button>
                  )
                )}
              </div>

              {/* Info Card - Mobile Only */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-8 glass rounded-xl p-4 lg:hidden"
              >
                <h4 className="text-sm font-semibold text-foreground mb-2">
                  How Mood Mode Works
                </h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Changes the conversation style of your AI companions
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Adapts the chat interface theme to match your mood
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Personalizes AI responses to fit the selected atmosphere
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
