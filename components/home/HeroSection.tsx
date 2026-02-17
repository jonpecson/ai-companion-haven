"use client";

import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-secondary p-4 sm:p-6 md:p-8 lg:p-12">
      {/* Ambient glow */}
      <div className="absolute right-0 top-0 h-40 w-40 sm:h-64 sm:w-64 rounded-full bg-primary/20 blur-[80px] sm:blur-[100px] translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 h-32 w-32 sm:h-40 sm:w-40 rounded-full bg-primary/10 blur-[60px] sm:blur-[80px] -translate-x-1/2 translate-y-1/2" />

      <div className="relative z-10 max-w-lg">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/15 px-4 py-1.5 text-xs font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          AI-Powered Companions
        </div>

        <h2 className="font-display text-2xl font-bold leading-tight text-foreground sm:text-3xl md:text-4xl">
          Craft your Perfect{" "}
          <span className="text-gradient">AI Companion</span>
        </h2>

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Create personalized AI companions with unique personalities, appearances, and stories.
          Your imagination is the only limit.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3 sm:gap-4">
          <Link
            href="/create"
            className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 sm:px-6 sm:py-3 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 glow-primary"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/companions"
            className="flex items-center gap-2 rounded-full border border-border px-5 py-2.5 sm:px-6 sm:py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Browse All
          </Link>
        </div>
      </div>
    </section>
  );
}
