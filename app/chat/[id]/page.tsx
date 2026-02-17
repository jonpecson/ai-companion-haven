"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MoreVertical, Info, Heart, Loader2, Camera, PanelLeftClose, PanelLeft, Home } from "lucide-react";
import { toast } from "sonner";
import { useAppStore, useMood } from "@/lib/store";
import { companionsApi, chatApi } from "@/lib/api";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { StreamingMessage } from "@/components/chat/StreamingMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { ConversationList } from "@/components/chat/ConversationList";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { generateId, getSessionId, cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import type { Message, MoodType, Companion } from "@/types";

const moodBg: Record<MoodType, string> = {
  calm: "from-blue-900/20 to-teal-900/20",
  romantic: "from-pink-900/20 to-rose-900/20",
  playful: "from-orange-900/20 to-yellow-900/20",
  deep: "from-purple-900/20 to-indigo-900/20",
};


export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { messages, setMessages, addMessage, addConversation, addMemory, toggleFavorite, favorites } = useAppStore();
  const currentMood = useMood();
  const [isTyping, setIsTyping] = useState(false);
  const [companion, setCompanion] = useState<Companion | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [showConversations, setShowConversations] = useState(true);
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasLoadedHistory = useRef(false);

  const companionId = params.id as string;

  useEffect(() => {
    const fetchCompanionAndHistory = async () => {
      try {
        setLoading(true);
        const response = await companionsApi.get(companionId);
        setCompanion(response.data);

        // Add to conversations list
        addConversation({
          id: `conv-${companionId}`,
          companionId,
          companion: response.data,
          createdAt: new Date().toISOString(),
        });

        // Load chat history from database only once and if local storage is empty
        if (!hasLoadedHistory.current) {
          hasLoadedHistory.current = true;
          const localMessages = useAppStore.getState().messages[companionId] || [];
          if (localMessages.length === 0) {
            try {
              const sessionId = getSessionId();
              const historyResponse = await chatApi.getPublicHistory(companionId, sessionId);
              if (historyResponse.data && historyResponse.data.length > 0) {
                // Convert API response to Message format
                const dbMessages: Message[] = historyResponse.data.map((msg: { id: string; sender: string; content: string; imageUrl?: string; createdAt: string }) => ({
                  id: msg.id,
                  conversationId: `conv-${companionId}`,
                  sender: msg.sender as "user" | "ai",
                  content: msg.content,
                  imageUrl: msg.imageUrl,
                  createdAt: msg.createdAt,
                }));
                setMessages(companionId, dbMessages);
              }
            } catch {
              // Database fetch failed - continue with local storage
            }
          }
        }
      } catch {
        // Companion fetch failed - handled by loading state
      } finally {
        setLoading(false);
      }
    };

    fetchCompanionAndHistory();
  }, [companionId, addConversation, setMessages]);

  const chatMessages = messages[companionId] || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isTyping, streamingContent]);

  const handleSend = useCallback(
    async (content: string, imageUrl?: string) => {
      if (!companion) return;

      const userMessage: Message = {
        id: generateId(),
        conversationId: `conv-${companionId}`,
        sender: "user",
        content,
        imageUrl,
        createdAt: new Date().toISOString(),
      };

      addMessage(companionId, userMessage);

      // If only image with no text, don't call AI
      if (!content && imageUrl) {
        return;
      }

      // Start streaming
      setIsStreaming(true);
      setStreamingContent("");

      const aiMessageId = generateId();
      let fullResponse = "";

      try {
        // Build conversation history for context
        const history = chatMessages.slice(-10).map(msg => ({
          role: msg.sender === "user" ? "user" : "assistant",
          content: msg.content,
        }));

        // Use streaming API
        const response = await fetch("/api/chat/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companionId,
            message: content,
            mood: currentMood,
            history,
          }),
        });

        if (!response.ok) {
          throw new Error("Stream request failed");
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.content) {
                    fullResponse += data.content;
                    setStreamingContent(fullResponse);
                  }
                  if (data.done) {
                    // Streaming complete
                    setIsStreaming(false);

                    // Add the complete message
                    const aiMessage: Message = {
                      id: aiMessageId,
                      conversationId: `conv-${companionId}`,
                      sender: "ai",
                      content: fullResponse,
                      createdAt: new Date().toISOString(),
                    };
                    addMessage(companionId, aiMessage);
                    setStreamingContent("");

                    // Add memory for this chat interaction
                    addMemory({
                      id: `mem-${generateId()}`,
                      userId: "user1",
                      companionId,
                      eventType: "chat",
                      metadata: {
                        content: `You chatted with ${companion.name}`,
                        icon: "message-circle",
                      },
                      createdAt: new Date().toISOString(),
                    });

                    // Save messages to database (async, don't wait)
                    const sessionId = getSessionId();
                    chatApi.savePublicMessages({
                      sessionId,
                      companionId,
                      messages: [
                        {
                          id: userMessage.id,
                          sender: userMessage.sender,
                          content: userMessage.content,
                          imageUrl: userMessage.imageUrl,
                          createdAt: userMessage.createdAt,
                        },
                        {
                          id: aiMessageId,
                          sender: "ai",
                          content: fullResponse,
                          createdAt: new Date().toISOString(),
                        },
                      ],
                    }).catch(() => {
                      // Database save failed - messages are still in local storage
                    });
                  }
                } catch {
                  // Parse error - continue
                }
              }
            }
          }
        }
      } catch {
        // Streaming failed - show fallback message
        setIsStreaming(false);
        setStreamingContent("");
        const aiMessage: Message = {
          id: generateId(),
          conversationId: `conv-${companionId}`,
          sender: "ai",
          content: "Sorry, I'm having a moment. Could you say that again?",
          createdAt: new Date().toISOString(),
        };
        addMessage(companionId, aiMessage);
      } finally {
        setIsTyping(false);
      }
    },
    [companion, companionId, addMessage, addMemory, currentMood, chatMessages]
  );

  // Request photo button handler
  const handleRequestPhoto = useCallback(async () => {
    if (!companion || isTyping || isStreaming) return;

    // Ask companion for a selfie
    handleSend("Send me a cute selfie!");
  }, [companion, isTyping, isStreaming, handleSend]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!companion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Companion not found</p>
          <Link href="/companions" className="text-primary hover:underline">
            Browse companions
          </Link>
        </div>
      </div>
    );
  }

  const personalityTraits = [
    { name: "Friendliness", value: companion.personality?.friendliness || 75 },
    { name: "Humor", value: companion.personality?.humor || 60 },
    { name: "Intelligence", value: companion.personality?.intelligence || 70 },
    { name: "Romantic", value: companion.personality?.romantic || 65 },
  ];

  return (
    <div className={`flex h-screen bg-gradient-to-b ${moodBg[currentMood]} bg-background`}>
      {/* Conversations Sidebar - Desktop Only */}
      <AnimatePresence>
        {showConversations && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 288, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="hidden lg:block border-r border-border overflow-hidden flex-shrink-0"
          >
            <ConversationList className="w-72" />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between p-3 lg:p-4 glass border-b border-border z-10">
          <div className="flex items-center gap-2 lg:gap-3">
            {/* Toggle conversations sidebar - Desktop */}
            <button
              onClick={() => setShowConversations(!showConversations)}
              className="hidden lg:flex p-2 hover:bg-muted/50 rounded-full transition-colors"
              title={showConversations ? "Hide conversations" : "Show conversations"}
            >
              {showConversations ? (
                <PanelLeftClose size={20} className="text-muted-foreground" />
              ) : (
                <PanelLeft size={20} className="text-muted-foreground" />
              )}
            </button>

            {/* Back button - Mobile */}
            <button
              onClick={() => router.back()}
              className="lg:hidden hover:bg-muted/50 p-2 rounded-full transition-colors"
            >
              <ArrowLeft size={20} className="text-foreground" />
            </button>

            {/* Home button */}
            <Link
              href="/"
              className="p-2 hover:bg-muted/50 rounded-full transition-colors"
              title="Go to home"
            >
              <Home size={20} className="text-muted-foreground" />
            </Link>

            {/* Companion Info */}
            <div className="relative w-10 h-10 lg:w-11 lg:h-11 rounded-full overflow-hidden ring-2 ring-primary/20">
              <Image
                src={companion.avatar}
                alt={companion.name}
                fill
                className="object-cover"
                sizes="44px"
              />
            </div>
            <div>
              <h2 className="text-sm lg:text-base font-semibold text-foreground">
                {companion.name}
              </h2>
              <p className="text-[10px] lg:text-xs text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                online
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 lg:gap-2">
            <button
              onClick={handleRequestPhoto}
              disabled={isTyping || isStreaming}
              className="p-2 lg:p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-colors disabled:opacity-50"
              title="Request photo"
            >
              <Camera size={18} className="lg:w-5 lg:h-5" />
            </button>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className={`p-2 lg:p-2.5 rounded-full transition-colors ${showInfo ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
            >
              <Info size={18} className="lg:w-5 lg:h-5" />
            </button>
            <button className="lg:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-colors">
              <MoreVertical size={18} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-3xl mx-auto">
            {chatMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center py-12 lg:py-20">
                <div className="relative w-20 h-20 lg:w-28 lg:h-28 rounded-full overflow-hidden mb-4 ring-4 ring-primary/20">
                  <Image
                    src={companion.avatar}
                    alt={companion.name}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                </div>
                <h3 className="text-foreground font-semibold mb-1 text-lg lg:text-xl">
                  Start chatting with {companion.name}
                </h3>
                <p className="text-xs lg:text-sm text-muted-foreground mb-4 max-w-md">
                  {companion.greeting || "Say hello to begin your conversation!"}
                </p>
                {companion.tags && companion.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {companion.tags.slice(0, 4).map(tag => (
                      <span key={tag} className="px-3 py-1 rounded-full glass text-xs text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
            {chatMessages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isStreaming && streamingContent && (
              <StreamingMessage content={streamingContent} isComplete={false} />
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="lg:px-6">
          <div className="max-w-3xl mx-auto">
            <ChatInput onSend={handleSend} disabled={isTyping || isStreaming} />
          </div>
        </div>
      </div>

      {/* Desktop Sidebar - Companion Info */}
      <AnimatePresence>
        {showInfo && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="hidden md:block border-l border-border glass overflow-hidden flex-shrink-0"
          >
            <div className="w-[280px] h-full overflow-y-auto">
              <div className="p-6">
                {/* Avatar */}
                <div className="relative aspect-square rounded-2xl overflow-hidden mb-4">
                  <Image
                    src={companion.avatar}
                    alt={companion.name}
                    fill
                    className="object-cover"
                    sizes="280px"
                  />
                </div>

                {/* Name & Status */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{companion.name}</h3>
                    <p className="text-sm text-muted-foreground">{companion.age} years old</p>
                  </div>
                  <button
                    onClick={() => {
                      toggleFavorite(companion.id);
                      const isFav = favorites.includes(companion.id);
                      toast.success(isFav ? `Removed ${companion.name} from favorites` : `Added ${companion.name} to favorites!`);
                    }}
                    className="p-2 rounded-full glass hover:bg-muted/50 transition-colors"
                  >
                    <Heart
                      size={20}
                      className={cn(
                        "transition-colors",
                        favorites.includes(companion.id) ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-500"
                      )}
                    />
                  </button>
                </div>

                {/* Bio */}
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  {companion.bio}
                </p>

                {/* Tags */}
                {companion.tags && companion.tags.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-xs font-semibold text-muted-foreground mb-2">INTERESTS</h4>
                    <div className="flex flex-wrap gap-2">
                      {companion.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 rounded-full glass text-xs text-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Personality */}
                <div className="mb-6">
                  <h4 className="text-xs font-semibold text-muted-foreground mb-3">PERSONALITY</h4>
                  <div className="space-y-3">
                    {personalityTraits.map(trait => (
                      <div key={trait.name}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-foreground">{trait.name}</span>
                          <span className="text-muted-foreground">{trait.value}%</span>
                        </div>
                        <Slider value={[trait.value]} max={100} disabled />
                      </div>
                    ))}
                  </div>
                </div>

                {/* View Profile Link */}
                <Link
                  href={`/companions/${companion.id}`}
                  className="block w-full text-center py-2.5 rounded-xl glass text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
                >
                  View Full Profile
                </Link>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
