"use client";

import { useState, useRef, type FormEvent, type KeyboardEvent } from "react";
import { Send, Smile, Mic, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 lg:p-5 glass border-t border-border">
      <div className="flex items-end gap-2 lg:gap-3">
        <button
          type="button"
          onClick={() => toast.info("Image sharing coming soon!")}
          className="p-2 lg:p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-colors"
        >
          <ImageIcon size={20} className="lg:w-6 lg:h-6" />
        </button>

        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={disabled}
            rows={1}
            className={cn(
              "w-full bg-muted/50 rounded-2xl px-4 py-2.5 lg:px-5 lg:py-3.5 pr-20 lg:pr-24 text-sm lg:text-base",
              "text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary/50",
              "resize-none min-h-[42px] lg:min-h-[52px] max-h-[120px] lg:max-h-[160px]",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          />
          <div className="absolute right-2 lg:right-3 bottom-1.5 lg:bottom-2.5 flex items-center gap-1">
            <button
              type="button"
              onClick={() => toast.info("Emoji picker coming soon!")}
              className="p-1.5 lg:p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Smile size={18} className="lg:w-5 lg:h-5" />
            </button>
            <button
              type="button"
              onClick={() => toast.info("Voice messages coming soon!")}
              className="p-1.5 lg:p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mic size={18} className="lg:w-5 lg:h-5" />
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className={cn(
            "p-2.5 lg:p-3.5 rounded-full transition-all",
            message.trim() && !disabled
              ? "gradient-primary text-white hover:opacity-90"
              : "bg-muted text-muted-foreground"
          )}
        >
          <Send size={18} className="lg:w-5 lg:h-5" />
        </button>
      </div>
    </form>
  );
}
