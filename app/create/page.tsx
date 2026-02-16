"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Upload, Sparkles } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { cn, generateId } from "@/lib/utils";
import { IconSidebar } from "@/components/layout/IconSidebar";
import { TopBar } from "@/components/layout/TopBar";
import type { Companion } from "@/types";

type Step = "basics" | "personality" | "interests" | "preview";

const steps: { id: Step; title: string }[] = [
  { id: "basics", title: "Basic Info" },
  { id: "personality", title: "Personality" },
  { id: "interests", title: "Interests" },
  { id: "preview", title: "Preview" },
];

const defaultAvatars = [
  "/images/companions/luna.jpg",
  "/images/companions/kai.jpg",
  "/images/companions/sakura.jpg",
  "/images/companions/atlas.jpg",
  "/images/companions/nova.jpg",
];

const suggestedTags = [
  "Empathetic",
  "Witty",
  "Playful",
  "Creative",
  "Adventurous",
  "Romantic",
  "Intellectual",
  "Mysterious",
  "Cheerful",
  "Calm",
  "Energetic",
  "Deep Thinker",
];

export default function CreateCompanionPage() {
  const router = useRouter();
  const { companions, setCompanions } = useAppStore();

  const [currentStep, setCurrentStep] = useState<Step>("basics");
  const [formData, setFormData] = useState({
    name: "",
    age: 22,
    bio: "",
    category: "girls" as Companion["category"],
    avatar: defaultAvatars[0],
    personality: {
      friendliness: 75,
      humor: 60,
      intelligence: 70,
      romantic: 65,
      flirty: 50,
    },
    tags: [] as string[],
  });

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      // Create the companion
      const newCompanion: Companion = {
        id: generateId(),
        name: formData.name || "New Companion",
        avatar: formData.avatar,
        bio: formData.bio || "A wonderful AI companion waiting to chat with you.",
        category: formData.category,
        personality: formData.personality,
        tags: formData.tags.length > 0 ? formData.tags : ["Friendly", "Creative"],
        age: formData.age,
        status: "online",
      };

      setCompanions([...companions, newCompanion]);
      router.push(`/companions/${newCompanion.id}`);
    } else {
      setCurrentStep(steps[currentStepIndex + 1].id);
    }
  };

  const handleBack = () => {
    if (isFirstStep) {
      router.back();
    } else {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  const toggleTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag].slice(0, 5),
    }));
  };

  return (
    <div className="flex min-h-screen bg-background">
      <IconSidebar />
      <main className="flex-1 lg:ml-16">
        <TopBar />
        <div className="p-4 lg:p-6">
          {/* Desktop Container */}
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6 lg:mb-8">
              <button onClick={handleBack} className="p-2 rounded-full glass hover:bg-muted/50 transition-colors">
                <ArrowLeft size={20} className="text-foreground" />
              </button>
              <div className="flex-1">
                <h1 className="text-lg lg:text-2xl font-bold text-foreground">Create Companion</h1>
                <p className="text-xs lg:text-sm text-muted-foreground">
                  Step {currentStepIndex + 1} of {steps.length}: {steps[currentStepIndex].title}
                </p>
              </div>
            </div>

        {/* Progress */}
        <div className="flex gap-2 lg:gap-3 mb-8">
          {steps.map((step, i) => (
            <div key={step.id} className="flex-1">
              <div
                className={cn(
                  "h-1 lg:h-1.5 rounded-full transition-all mb-2",
                  i <= currentStepIndex ? "gradient-primary" : "bg-muted"
                )}
              />
              <p className={cn(
                "hidden lg:block text-xs font-medium",
                i <= currentStepIndex ? "text-primary" : "text-muted-foreground"
              )}>
                {step.title}
              </p>
            </div>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="mb-8"
          >
          {currentStep === "basics" && (
            <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0">
              <div className="space-y-6">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Choose an Avatar
                  </label>
                  <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 lg:flex-wrap lg:overflow-visible">
                    {defaultAvatars.map((avatar) => (
                      <button
                        key={avatar}
                        onClick={() => setFormData((prev) => ({ ...prev, avatar }))}
                        className={cn(
                          "relative w-16 h-16 lg:w-20 lg:h-20 rounded-full overflow-hidden flex-shrink-0 ring-2 transition-all hover:scale-105",
                          formData.avatar === avatar ? "ring-primary ring-offset-2 ring-offset-background" : "ring-transparent"
                        )}
                      >
                        <Image
                          src={avatar}
                          alt="Avatar"
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </button>
                    ))}
                    <button className="w-16 h-16 lg:w-20 lg:h-20 rounded-full glass flex items-center justify-center flex-shrink-0 hover:bg-muted/50 transition-colors">
                      <Upload size={20} className="text-muted-foreground" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Name
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Enter companion name"
                    className="bg-muted/50 lg:text-base lg:py-6"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Age: {formData.age}
                  </label>
                  <Slider
                    value={[formData.age]}
                    onValueChange={([age]) =>
                      setFormData((prev) => ({ ...prev, age }))
                    }
                    min={18}
                    max={35}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Category
                  </label>
                  <div className="flex gap-2 lg:gap-3">
                    {(["girls", "guys", "anime"] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, category: cat }))
                        }
                        className={cn(
                          "flex-1 py-2 lg:py-3 rounded-lg lg:rounded-xl text-sm font-medium capitalize transition-all",
                          formData.category === cat
                            ? "gradient-primary text-white"
                            : "glass text-muted-foreground hover:bg-muted/50"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, bio: e.target.value }))
                    }
                    placeholder="Describe your companion's personality..."
                    rows={4}
                    className="w-full bg-muted/50 rounded-lg lg:rounded-xl px-4 py-3 text-sm lg:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === "personality" && (
            <div className="space-y-6">
              <p className="text-muted-foreground text-sm lg:text-base mb-4 lg:mb-6">
                Adjust personality traits to customize your companion
              </p>

              <div className="lg:grid lg:grid-cols-2 lg:gap-8 space-y-6 lg:space-y-0">
                {Object.entries(formData.personality).map(([trait, value]) => (
                  <div key={trait} className="lg:glass lg:rounded-xl lg:p-4">
                    <div className="flex justify-between text-sm lg:text-base mb-2 lg:mb-3">
                      <span className="text-foreground capitalize font-medium">{trait}</span>
                      <span className="text-muted-foreground">{value}%</span>
                    </div>
                    <Slider
                      value={[value]}
                      onValueChange={([newValue]) =>
                        setFormData((prev) => ({
                          ...prev,
                          personality: { ...prev.personality, [trait]: newValue },
                        }))
                      }
                      max={100}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === "interests" && (
            <div className="space-y-6">
              <p className="text-muted-foreground text-sm lg:text-base mb-4 lg:mb-6">
                Select up to 5 personality tags
              </p>

              <div className="flex flex-wrap gap-2 lg:gap-3">
                {suggestedTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      "px-4 py-2 lg:px-5 lg:py-2.5 rounded-full text-sm lg:text-base font-medium transition-all hover:scale-105",
                      formData.tags.includes(tag)
                        ? "gradient-primary text-white shadow-lg"
                        : "glass text-muted-foreground hover:bg-muted/50"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <p className="text-xs lg:text-sm text-muted-foreground">
                Selected: {formData.tags.length}/5
              </p>
            </div>
          )}

          {currentStep === "preview" && (
            <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden max-w-xs mx-auto lg:max-w-none">
                <Image
                  src={formData.avatar}
                  alt={formData.name || "Preview"}
                  fill
                  className="object-cover"
                  sizes="400px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-6">
                  <h3 className="text-white font-semibold text-lg lg:text-2xl">
                    {formData.name || "Your Companion"}, {formData.age}
                  </h3>
                  <p className="text-white/70 text-sm lg:text-base line-clamp-2 mt-1 lg:mt-2">
                    {formData.bio || "A wonderful companion waiting to chat."}
                  </p>
                  <div className="flex flex-wrap gap-1 lg:gap-2 mt-2 lg:mt-3">
                    {formData.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 lg:px-3 lg:py-1 rounded-full bg-white/10 text-white/80 text-xs lg:text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4 lg:space-y-6">
                <div className="glass rounded-xl lg:rounded-2xl p-4 lg:p-6">
                  <h4 className="text-sm lg:text-base font-semibold text-foreground mb-4">
                    Personality Preview
                  </h4>
                  <div className="grid grid-cols-2 gap-3 lg:gap-4 text-xs lg:text-sm">
                    {Object.entries(formData.personality).map(([trait, value]) => (
                      <div key={trait} className="flex justify-between">
                        <span className="text-muted-foreground capitalize">
                          {trait}
                        </span>
                        <span className="text-foreground font-medium">{value}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="hidden lg:block glass rounded-2xl p-6">
                  <h4 className="text-base font-semibold text-foreground mb-4">
                    All Selected Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                    {formData.tags.length === 0 && (
                      <span className="text-muted-foreground text-sm">No tags selected</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3 lg:gap-4 lg:max-w-md lg:ml-auto">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex-1 lg:py-6"
          >
            {isFirstStep ? "Cancel" : "Back"}
          </Button>
          <Button
            variant="gradient"
            onClick={handleNext}
            className="flex-1 lg:py-6"
          >
            {isLastStep ? (
              <>
                <Sparkles size={16} className="mr-2" />
                Create Companion
              </>
            ) : (
              <>
                Next
                <ArrowRight size={16} className="ml-2" />
              </>
            )}
          </Button>
        </div>
          </div>
        </div>
      </main>
    </div>
  );
}
