"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StreamingMessageProps {
  content: string;
  isComplete?: boolean;
}

export function StreamingMessage({ content, isComplete }: StreamingMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="flex mb-3 lg:mb-4 justify-start"
    >
      <div
        className={cn(
          "max-w-[80%] lg:max-w-[65%] rounded-2xl px-4 py-2.5 lg:px-5 lg:py-3",
          "glass text-foreground rounded-bl-md"
        )}
      >
        <p className="text-sm lg:text-base leading-relaxed whitespace-pre-wrap">
          {content}
          {!isComplete && (
            <motion.span
              className="inline-block w-0.5 h-4 bg-primary ml-0.5 align-middle"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
            />
          )}
        </p>
      </div>
    </motion.div>
  );
}
