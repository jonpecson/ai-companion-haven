"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Upload,
  Sparkles,
  Loader2,
  Wand2,
  User,
  Heart,
  MessageCircle,
  Palette,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { companionsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { IconSidebar } from "@/components/layout/IconSidebar";
import { TopBar } from "@/components/layout/TopBar";

type Step = "basics" | "personality" | "appearance" | "communication" | "preview";

const steps: { id: Step; title: string; icon: React.ElementType }[] = [
  { id: "basics", title: "Basics", icon: User },
  { id: "personality", title: "Personality", icon: Heart },
  { id: "appearance", title: "Appearance", icon: Palette },
  { id: "communication", title: "Communication", icon: MessageCircle },
  { id: "preview", title: "Preview", icon: Eye },
];

const avatarOptions = [
  { url: "/images/companions/mia.jpg", name: "Mia" },
  { url: "/images/companions/sofia.jpg", name: "Sofia" },
  { url: "/images/companions/emma.jpg", name: "Emma" },
  { url: "/images/companions/aria.jpg", name: "Aria" },
  { url: "/images/companions/alex.jpg", name: "Alex" },
  { url: "/images/companions/ryan.jpg", name: "Ryan" },
  { url: "/images/companions/atlas.jpg", name: "Atlas" },
  { url: "/images/companions/kai.jpg", name: "Kai" },
  { url: "/images/companions/sakura.jpg", name: "Sakura" },
  { url: "/images/companions/luna.jpg", name: "Luna" },
  { url: "/images/companions/nova.jpg", name: "Nova" },
];

const suggestedTags = [
  "Empathetic", "Witty", "Playful", "Creative", "Adventurous",
  "Romantic", "Intellectual", "Mysterious", "Cheerful", "Calm",
  "Energetic", "Deep Thinker", "Supportive", "Flirty", "Confident",
];

const communicationStyles = [
  { id: "friendly", name: "Friendly", emoji: "😊", description: "Warm and approachable" },
  { id: "flirty", name: "Flirty", emoji: "😏", description: "Playful and teasing" },
  { id: "romantic", name: "Romantic", emoji: "💕", description: "Sweet and affectionate" },
  { id: "intellectual", name: "Intellectual", emoji: "🧠", description: "Thoughtful and deep" },
  { id: "playful", name: "Playful", emoji: "🎉", description: "Fun and energetic" },
  { id: "mysterious", name: "Mysterious", emoji: "🌙", description: "Enigmatic and intriguing" },
];

const categoryOptions = [
  { id: "girls", label: "Girls", emoji: "👩" },
  { id: "guys", label: "Guys", emoji: "👨" },
  { id: "anime", label: "Anime", emoji: "✨" },
];

export default function CreateCompanionPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("basics");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    age: 22,
    bio: "",
    category: "girls" as "girls" | "guys" | "anime",
    avatar: avatarOptions[0].url,
    personality: {
      friendliness: 75,
      humor: 60,
      intelligence: 70,
      romantic: 65,
      flirty: 50,
    },
    tags: [] as string[],
    greeting: "",
    scenario: "",
    communicationStyle: "friendly",
    interests: [] as string[],
    appearance: {
      hairColor: "",
      eyeColor: "",
      style: "",
    },
  });

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const validateStep = (): boolean => {
    switch (currentStep) {
      case "basics":
        if (!formData.name.trim()) {
          toast.error("Please enter a name for your companion");
          return false;
        }
        if (formData.name.length < 2) {
          toast.error("Name must be at least 2 characters");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (!validateStep()) return;

    if (isLastStep) {
      await handleCreate();
    } else {
      setCurrentStep(steps[currentStepIndex + 1].id);
    }
  };

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      const response = await companionsApi.create({
        name: formData.name,
        category: formData.category,
        bio: formData.bio || `Meet ${formData.name}, your new AI companion!`,
        avatar: formData.avatar,
        personality: formData.personality,
        tags: formData.tags.length > 0 ? formData.tags : ["Friendly"],
        age: formData.age,
        greeting: formData.greeting,
        scenario: formData.scenario,
        communicationStyle: formData.communicationStyle,
        interests: formData.interests,
        appearance: formData.appearance,
      });

      if (response.data?.id) {
        toast.success(`${formData.name} has been created successfully!`);
        router.push("/companions");
      }
    } catch (error) {
      toast.error("Failed to create companion. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
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

  const updatePersonality = (trait: string, value: number) => {
    setFormData((prev) => ({
      ...prev,
      personality: { ...prev.personality, [trait]: value },
    }));
  };

  return (
    <div className="flex min-h-screen bg-background">
      <IconSidebar />
      <main className="flex-1 lg:ml-16">
        <TopBar />
        <div className="p-4 lg:p-6">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6 lg:mb-8">
              <button
                onClick={handleBack}
                className="p-2 rounded-full glass hover:bg-muted/50 transition-colors"
              >
                <ArrowLeft size={20} className="text-foreground" />
              </button>
              <div className="flex-1">
                <h1 className="text-xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="text-primary" size={24} />
                  Create Your Companion
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Design your perfect AI companion
                </p>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="flex gap-2 lg:gap-4 mb-8 overflow-x-auto no-scrollbar pb-2">
              {steps.map((step, i) => {
                const Icon = step.icon;
                const isActive = i === currentStepIndex;
                const isCompleted = i < currentStepIndex;

                return (
                  <button
                    key={step.id}
                    onClick={() => i < currentStepIndex && setCurrentStep(step.id)}
                    disabled={i > currentStepIndex}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full transition-all flex-shrink-0",
                      isActive && "gradient-primary text-white shadow-lg",
                      isCompleted && "bg-primary/20 text-primary cursor-pointer hover:bg-primary/30",
                      !isActive && !isCompleted && "glass text-muted-foreground"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                      isActive && "bg-white/20",
                      isCompleted && "bg-primary text-white",
                      !isActive && !isCompleted && "bg-muted"
                    )}>
                      {isCompleted ? <Check size={14} /> : <Icon size={14} />}
                    </div>
                    <span className="text-sm font-medium hidden sm:block">{step.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="mb-8"
              >
                {/* Step 1: Basics */}
                {currentStep === "basics" && (
                  <div className="grid lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="glass rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                          <User size={20} className="text-primary" />
                          Basic Information
                        </h3>

                        <div className="space-y-4">
                          <div>
                            <label className="text-sm text-muted-foreground mb-2 block">
                              Companion Name *
                            </label>
                            <Input
                              value={formData.name}
                              onChange={(e) =>
                                setFormData((prev) => ({ ...prev, name: e.target.value }))
                              }
                              placeholder="Enter a name..."
                              className="bg-muted/50 text-base py-6"
                              maxLength={50}
                            />
                          </div>

                          <div>
                            <label className="text-sm text-muted-foreground mb-2 block">
                              Age: {formData.age} years old
                            </label>
                            <Slider
                              value={[formData.age]}
                              onValueChange={([age]) =>
                                setFormData((prev) => ({ ...prev, age }))
                              }
                              min={18}
                              max={35}
                              className="mt-2"
                            />
                          </div>

                          <div>
                            <label className="text-sm text-muted-foreground mb-3 block">
                              Category
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                              {categoryOptions.map((cat) => (
                                <button
                                  key={cat.id}
                                  onClick={() =>
                                    setFormData((prev) => ({ ...prev, category: cat.id as typeof formData.category }))
                                  }
                                  className={cn(
                                    "p-4 rounded-xl text-center transition-all hover:scale-105",
                                    formData.category === cat.id
                                      ? "gradient-primary text-white shadow-lg"
                                      : "glass text-foreground hover:bg-muted/50"
                                  )}
                                >
                                  <span className="text-2xl block mb-1">{cat.emoji}</span>
                                  <span className="text-sm font-medium">{cat.label}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="glass rounded-2xl p-6">
                        <label className="text-sm text-muted-foreground mb-2 block">
                          Bio / Description
                        </label>
                        <textarea
                          value={formData.bio}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, bio: e.target.value }))
                          }
                          placeholder="Describe your companion's personality and background..."
                          rows={4}
                          className="w-full bg-muted/50 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                          maxLength={500}
                        />
                        <p className="text-xs text-muted-foreground mt-2 text-right">
                          {formData.bio.length}/500
                        </p>
                      </div>
                    </div>

                    <div className="glass rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-4">
                        Choose Avatar
                      </h3>
                      <div className="grid grid-cols-5 gap-3">
                        {avatarOptions.map((avatar) => (
                          <button
                            key={avatar.url}
                            onClick={() => setFormData((prev) => ({ ...prev, avatar: avatar.url }))}
                            className={cn(
                              "relative aspect-square rounded-xl overflow-hidden transition-all hover:scale-105",
                              formData.avatar === avatar.url
                                ? "ring-4 ring-primary ring-offset-2 ring-offset-background"
                                : "ring-2 ring-transparent hover:ring-muted"
                            )}
                          >
                            <Image
                              src={avatar.url}
                              alt={avatar.name}
                              fill
                              className="object-cover"
                              sizes="100px"
                            />
                            {formData.avatar === avatar.url && (
                              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                <Check className="text-white" size={24} />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Selected Avatar Preview */}
                      <div className="mt-6 flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
                        <div className="relative w-20 h-20 rounded-full overflow-hidden ring-4 ring-primary/20">
                          <Image
                            src={formData.avatar}
                            alt="Selected"
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>
                        <div>
                          <p className="text-foreground font-medium">
                            {formData.name || "Your Companion"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formData.age} years old • {categoryOptions.find(c => c.id === formData.category)?.label || formData.category}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Personality */}
                {currentStep === "personality" && (
                  <div className="grid lg:grid-cols-2 gap-8">
                    <div className="glass rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                        <Heart size={20} className="text-primary" />
                        Personality Traits
                      </h3>

                      <div className="space-y-6">
                        {Object.entries(formData.personality).map(([trait, value]) => (
                          <div key={trait}>
                            <div className="flex justify-between mb-2">
                              <span className="text-foreground capitalize font-medium">{trait}</span>
                              <span className="text-primary font-bold">{value}%</span>
                            </div>
                            <Slider
                              value={[value]}
                              onValueChange={([newValue]) => updatePersonality(trait, newValue)}
                              max={100}
                            />
                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                              <span>Low</span>
                              <span>High</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="glass rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-4">
                        Personality Tags
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Select up to 5 tags that describe your companion
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {suggestedTags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            disabled={!formData.tags.includes(tag) && formData.tags.length >= 5}
                            className={cn(
                              "px-4 py-2 rounded-full text-sm font-medium transition-all",
                              formData.tags.includes(tag)
                                ? "gradient-primary text-white shadow-md"
                                : "glass text-muted-foreground hover:bg-muted/50 disabled:opacity-50"
                            )}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>

                      <div className="mt-6 p-4 bg-muted/30 rounded-xl">
                        <p className="text-sm text-muted-foreground mb-2">
                          Selected ({formData.tags.length}/5):
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {formData.tags.length > 0 ? (
                            formData.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                              >
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-sm">No tags selected</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Appearance */}
                {currentStep === "appearance" && (
                  <div className="grid lg:grid-cols-2 gap-8">
                    <div className="glass rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                        <Palette size={20} className="text-primary" />
                        Appearance Details
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="text-sm text-muted-foreground mb-2 block">
                            Hair Color
                          </label>
                          <Input
                            value={formData.appearance.hairColor}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                appearance: { ...prev.appearance, hairColor: e.target.value },
                              }))
                            }
                            placeholder="e.g., Black, Blonde, Brown..."
                            className="bg-muted/50"
                          />
                        </div>

                        <div>
                          <label className="text-sm text-muted-foreground mb-2 block">
                            Eye Color
                          </label>
                          <Input
                            value={formData.appearance.eyeColor}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                appearance: { ...prev.appearance, eyeColor: e.target.value },
                              }))
                            }
                            placeholder="e.g., Blue, Brown, Green..."
                            className="bg-muted/50"
                          />
                        </div>

                        <div>
                          <label className="text-sm text-muted-foreground mb-2 block">
                            Style
                          </label>
                          <Input
                            value={formData.appearance.style}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                appearance: { ...prev.appearance, style: e.target.value },
                              }))
                            }
                            placeholder="e.g., Casual, Elegant, Sporty..."
                            className="bg-muted/50"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="glass rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-4">
                        Interests
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        What does your companion enjoy?
                      </p>

                      <Input
                        placeholder="Type an interest and press Enter..."
                        className="bg-muted/50 mb-4"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && e.currentTarget.value.trim()) {
                            const interest = e.currentTarget.value.trim();
                            if (!formData.interests.includes(interest) && formData.interests.length < 10) {
                              setFormData((prev) => ({
                                ...prev,
                                interests: [...prev.interests, interest],
                              }));
                              e.currentTarget.value = "";
                            }
                          }
                        }}
                      />

                      <div className="flex flex-wrap gap-2">
                        {formData.interests.map((interest) => (
                          <span
                            key={interest}
                            className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm flex items-center gap-2"
                          >
                            {interest}
                            <button
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  interests: prev.interests.filter((i) => i !== interest),
                                }))
                              }
                              className="hover:text-red-500"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                        {formData.interests.length === 0 && (
                          <span className="text-muted-foreground text-sm">No interests added yet</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Communication */}
                {currentStep === "communication" && (
                  <div className="grid lg:grid-cols-2 gap-8">
                    <div className="glass rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                        <MessageCircle size={20} className="text-primary" />
                        Communication Style
                      </h3>

                      <div className="grid grid-cols-2 gap-3">
                        {communicationStyles.map((style) => (
                          <button
                            key={style.id}
                            onClick={() =>
                              setFormData((prev) => ({ ...prev, communicationStyle: style.id }))
                            }
                            className={cn(
                              "p-4 rounded-xl text-left transition-all hover:scale-105",
                              formData.communicationStyle === style.id
                                ? "gradient-primary text-white shadow-lg"
                                : "glass hover:bg-muted/50"
                            )}
                          >
                            <span className="text-2xl block mb-2">{style.emoji}</span>
                            <p className="font-medium">{style.name}</p>
                            <p className={cn(
                              "text-xs mt-1",
                              formData.communicationStyle === style.id
                                ? "text-white/80"
                                : "text-muted-foreground"
                            )}>
                              {style.description}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="glass rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-foreground mb-4">
                          Custom Greeting
                        </h3>
                        <textarea
                          value={formData.greeting}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, greeting: e.target.value }))
                          }
                          placeholder="How should your companion greet users? e.g., 'Hey there! I'm so happy to meet you!'"
                          rows={3}
                          className="w-full bg-muted/50 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                        />
                      </div>

                      <div className="glass rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-foreground mb-4">
                          Scenario / Backstory
                        </h3>
                        <textarea
                          value={formData.scenario}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, scenario: e.target.value }))
                          }
                          placeholder="Set the scene! e.g., 'You meet at a coffee shop where they work as a barista...'"
                          rows={3}
                          className="w-full bg-muted/50 rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 5: Preview */}
                {currentStep === "preview" && (
                  <div className="grid lg:grid-cols-2 gap-8">
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden max-w-sm mx-auto lg:max-w-none">
                      <Image
                        src={formData.avatar}
                        alt={formData.name || "Preview"}
                        fill
                        className="object-cover"
                        sizes="400px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">
                            Online
                          </span>
                          <span className="px-2 py-1 rounded-full bg-white/10 text-white/80 text-xs">
                            {categoryOptions.find(c => c.id === formData.category)?.label || formData.category}
                          </span>
                        </div>
                        <h3 className="text-white font-bold text-2xl">
                          {formData.name || "Your Companion"}, {formData.age}
                        </h3>
                        <p className="text-white/70 text-sm line-clamp-2 mt-2">
                          {formData.bio || "A wonderful companion waiting to chat."}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-3">
                          {formData.tags.slice(0, 4).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 rounded-full bg-white/10 text-white/80 text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="glass rounded-2xl p-6">
                        <h4 className="text-sm font-semibold text-muted-foreground mb-4">
                          PERSONALITY TRAITS
                        </h4>
                        <div className="space-y-3">
                          {Object.entries(formData.personality).map(([trait, value]) => (
                            <div key={trait} className="flex items-center gap-3">
                              <span className="text-foreground capitalize w-24 text-sm">{trait}</span>
                              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full gradient-primary rounded-full transition-all"
                                  style={{ width: `${value}%` }}
                                />
                              </div>
                              <span className="text-primary font-medium text-sm w-10 text-right">
                                {value}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="glass rounded-2xl p-6">
                        <h4 className="text-sm font-semibold text-muted-foreground mb-3">
                          COMMUNICATION STYLE
                        </h4>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {communicationStyles.find((s) => s.id === formData.communicationStyle)?.emoji}
                          </span>
                          <div>
                            <p className="text-foreground font-medium capitalize">
                              {formData.communicationStyle}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {communicationStyles.find((s) => s.id === formData.communicationStyle)?.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      {formData.greeting && (
                        <div className="glass rounded-2xl p-6">
                          <h4 className="text-sm font-semibold text-muted-foreground mb-3">
                            GREETING
                          </h4>
                          <p className="text-foreground italic">"{formData.greeting}"</p>
                        </div>
                      )}

                      <div className="glass rounded-2xl p-4 bg-primary/5 border border-primary/20">
                        <div className="flex items-center gap-3">
                          <Sparkles className="text-primary" size={24} />
                          <div>
                            <p className="text-foreground font-medium">Ready to create!</p>
                            <p className="text-sm text-muted-foreground">
                              Your companion will be saved and ready to chat
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex gap-4 lg:max-w-md lg:ml-auto">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isSubmitting}
                className="flex-1 py-6"
              >
                {isFirstStep ? "Cancel" : "Back"}
              </Button>
              <Button
                variant="gradient"
                onClick={handleNext}
                disabled={isSubmitting}
                className="flex-1 py-6"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Creating...
                  </>
                ) : isLastStep ? (
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
