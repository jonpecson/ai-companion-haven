"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, Search, Plus } from "lucide-react";
import { useAppStore, useConversations, useCompanions } from "@/lib/store";
import { companionsApi } from "@/lib/api";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { Companion, Conversation } from "@/types";

interface ConversationListProps {
  className?: string;
  onSelectConversation?: (companionId: string) => void;
}

export function ConversationList({ className, onSelectConversation }: ConversationListProps) {
  const pathname = usePathname();
  const conversations = useConversations();
  const companions = useCompanions();
  const { messages, setCompanions } = useAppStore();

  // Fetch companions if not loaded
  useEffect(() => {
    if (companions.length === 0) {
      companionsApi.list({ pageSize: 50 }).then((res) => {
        setCompanions(res.data);
      }).catch(() => {});
    }
  }, [companions.length, setCompanions]);

  // Build conversation list from messages (for now, since we're using local state)
  const activeCompanionIds = Object.keys(messages).filter(id => messages[id]?.length > 0);

  // Create conversation items from active chats
  const conversationItems = activeCompanionIds.map(companionId => {
    const companion = companions.find(c => c.id === companionId);
    const chatMessages = messages[companionId] || [];
    const lastMessage = chatMessages[chatMessages.length - 1];

    return {
      companionId,
      companion,
      lastMessage: lastMessage?.content || "",
      lastMessageAt: lastMessage?.createdAt || new Date().toISOString(),
    };
  }).sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

  // Get current companion ID from URL
  const currentCompanionId = pathname.startsWith("/chat/") ? pathname.split("/chat/")[1] : null;

  return (
    <div className={cn("flex flex-col h-full bg-card/50 backdrop-blur-xl", className)}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Messages</h2>
          <Link
            href="/companions"
            className="p-2 rounded-full hover:bg-muted/50 transition-colors"
            title="New conversation"
          >
            <Plus size={20} className="text-muted-foreground" />
          </Link>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full bg-muted/50 rounded-xl pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {conversationItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <MessageCircle size={28} className="text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm mb-2">No conversations yet</p>
            <Link
              href="/companions"
              className="text-primary text-sm hover:underline"
            >
              Start chatting with a companion
            </Link>
          </div>
        ) : (
          <div className="py-2">
            {conversationItems.map(({ companionId, companion, lastMessage, lastMessageAt }) => {
              const isActive = currentCompanionId === companionId;

              return (
                <Link
                  key={companionId}
                  href={`/chat/${companionId}`}
                  onClick={() => onSelectConversation?.(companionId)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors",
                    isActive && "bg-primary/10"
                  )}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden">
                      {companion?.avatar ? (
                        <Image
                          src={companion.avatar}
                          alt={companion?.name || "Companion"}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <MessageCircle size={20} className="text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    {/* Online indicator */}
                    {companion?.status === "online" && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className={cn(
                        "font-medium text-sm truncate",
                        isActive ? "text-primary" : "text-foreground"
                      )}>
                        {companion?.name || "Unknown Companion"}
                      </h3>
                      <span className="text-[10px] text-muted-foreground flex-shrink-0 ml-2">
                        {formatRelativeTime(lastMessageAt)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {lastMessage || "Start chatting..."}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Access - Recent Companions */}
      {companions.length > 0 && conversationItems.length < companions.length && (
        <div className="border-t border-border p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Start a Chat
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {companions
              .filter(c => !activeCompanionIds.includes(c.id))
              .slice(0, 5)
              .map(companion => (
                <Link
                  key={companion.id}
                  href={`/chat/${companion.id}`}
                  className="flex-shrink-0 flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div className="relative w-10 h-10 rounded-full overflow-hidden">
                    <Image
                      src={companion.avatar}
                      alt={companion.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground truncate max-w-[60px]">
                    {companion.name.split(" ")[0]}
                  </span>
                </Link>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
