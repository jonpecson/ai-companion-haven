"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppStore, useCompanions } from "@/lib/store";
import { companionsApi } from "@/lib/api";
import { IconSidebar } from "@/components/layout/IconSidebar";
import { TopBar } from "@/components/layout/TopBar";
import { ConversationList } from "@/components/chat/ConversationList";
import { Loader2, MessageCircle } from "lucide-react";

export default function ConversationsPage() {
  const router = useRouter();
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

  // Check if there are any active conversations
  const activeCompanionIds = Object.keys(messages).filter(id => messages[id]?.length > 0);

  // Handle conversation selection
  const handleSelectConversation = (companionId: string) => {
    router.push(`/chat/${companionId}`);
  };

  if (companions.length === 0) {
    return (
      <div className="flex min-h-screen bg-background">
        <IconSidebar />
        <main className="flex-1 lg:ml-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Fixed Icon Sidebar - Desktop */}
      <IconSidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-16 flex flex-col lg:flex-row">
        {/* Mobile View - Full page conversation list */}
        <div className="lg:hidden flex-1">
          <TopBar />
          <ConversationList
            className="flex-1"
            onSelectConversation={handleSelectConversation}
          />
        </div>

        {/* Desktop View - Split layout */}
        <div className="hidden lg:flex flex-1 h-screen">
          {/* Conversations List */}
          <div className="w-80 border-r border-border flex-shrink-0">
            <ConversationList onSelectConversation={handleSelectConversation} />
          </div>

          {/* Empty State / Welcome */}
          <div className="flex-1 flex items-center justify-center bg-card/30">
            <div className="text-center max-w-md p-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-10 h-10 text-primary" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">Your Messages</h2>
              <p className="text-muted-foreground mb-6">
                {activeCompanionIds.length > 0
                  ? "Select a conversation from the sidebar to continue chatting."
                  : "Start a conversation with one of your AI companions. They're always ready to chat!"}
              </p>
              {activeCompanionIds.length === 0 && (
                <Link
                  href="/companions"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:brightness-110 transition-all glow-primary"
                >
                  Find a Companion
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
