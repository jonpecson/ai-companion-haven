import { create } from "zustand";
import type { User, Companion, Story, Message, Memory, MoodType, Conversation } from "@/types";

interface AppState {
  // User state
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  // Data state
  companions: Companion[];
  stories: Story[];
  messages: Record<string, Message[]>;
  conversations: Conversation[];
  activeConversationId: string | null;
  memories: Memory[];
  currentMood: MoodType;

  // Loading states
  isLoading: boolean;

  // Actions
  setUser: (user: User | null, token?: string | null) => void;
  logout: () => void;
  setCompanions: (companions: Companion[]) => void;
  setStories: (stories: Story[]) => void;
  markStoryViewed: (storyId: string) => void;
  setMessages: (companionId: string, messages: Message[]) => void;
  addMessage: (companionId: string, message: Message) => void;
  updateMessage: (companionId: string, messageId: string, updates: Partial<Message>) => void;
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (companionId: string, updates: Partial<Conversation>) => void;
  setActiveConversation: (conversationId: string | null) => void;
  setMemories: (memories: Memory[]) => void;
  setMood: (mood: MoodType) => void;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  isAuthenticated: false,
  companions: [],
  stories: [],
  messages: {},
  conversations: [],
  activeConversationId: null,
  memories: [],
  currentMood: "romantic",
  isLoading: false,

  // Actions
  setUser: (user, token) => {
    if (token && typeof window !== "undefined") {
      localStorage.setItem("token", token);
    }
    set({ user, token: token ?? get().token, isAuthenticated: !!user });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    set({ user: null, token: null, isAuthenticated: false });
  },

  setCompanions: (companions) => set({ companions }),

  setStories: (stories) => set({ stories }),

  markStoryViewed: (storyId) =>
    set((state) => ({
      stories: state.stories.map((s) =>
        s.id === storyId ? { ...s, viewed: true } : s
      ),
    })),

  setMessages: (companionId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [companionId]: messages },
    })),

  addMessage: (companionId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [companionId]: [...(state.messages[companionId] || []), message],
      },
    })),

  updateMessage: (companionId, messageId, updates) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [companionId]: (state.messages[companionId] || []).map((msg) =>
          msg.id === messageId ? { ...msg, ...updates } : msg
        ),
      },
    })),

  setConversations: (conversations) => set({ conversations }),

  addConversation: (conversation) =>
    set((state) => {
      // Check if conversation already exists
      const exists = state.conversations.find(c => c.companionId === conversation.companionId);
      if (exists) {
        return {
          conversations: state.conversations.map(c =>
            c.companionId === conversation.companionId ? { ...c, ...conversation } : c
          ),
        };
      }
      return {
        conversations: [conversation, ...state.conversations],
      };
    }),

  updateConversation: (companionId, updates) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.companionId === companionId ? { ...conv, ...updates } : conv
      ),
    })),

  setActiveConversation: (conversationId) => set({ activeConversationId: conversationId }),

  setMemories: (memories) => set({ memories }),

  setMood: (mood) => set({ currentMood: mood }),

  setLoading: (loading) => set({ isLoading: loading }),
}));

// Selectors
export const useUser = () => useAppStore((state) => state.user);
export const useIsAuthenticated = () => useAppStore((state) => state.isAuthenticated);
export const useCompanions = () => useAppStore((state) => state.companions);
export const useStories = () => useAppStore((state) => state.stories);
export const useMessages = (companionId: string) =>
  useAppStore((state) => state.messages[companionId] || []);
export const useMemories = () => useAppStore((state) => state.memories);
export const useMood = () => useAppStore((state) => state.currentMood);
export const useLoading = () => useAppStore((state) => state.isLoading);

export const useCompanion = (id: string) =>
  useAppStore((state) => state.companions.find((c) => c.id === id));

export const useConversations = () => useAppStore((state) => state.conversations);
export const useActiveConversationId = () => useAppStore((state) => state.activeConversationId);
