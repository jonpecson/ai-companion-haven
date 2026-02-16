export interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Companion {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  category: 'girls' | 'guys' | 'anime';
  personality: {
    friendliness: number;
    humor: number;
    intelligence: number;
    romantic: number;
    flirty: number;
    dominant?: number;
  };
  tags: string[];
  age: number;
  status: 'online' | 'offline';
  style?: 'realistic' | 'anime';
  scenario?: string;
  greeting?: string;
  appearance?: {
    ethnicity?: string;
    eyeColor?: string;
    hairColor?: string;
    hairStyle?: string;
    bodyType?: string;
    height?: string;
  };
  interests?: string[];
  communicationStyle?: string;
  galleryUrls?: string[];
  isFeatured?: boolean;
  messageCount?: number;
  createdAt?: string;
}

export interface Story {
  id: string;
  companionId: string;
  type: 'image' | 'video';
  mediaUrl: string;
  caption?: string;
  viewed: boolean;
  orderIndex: number;
  expiresAt: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: 'user' | 'ai';
  content: string;
  imageUrl?: string;
  isGeneratingImage?: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  userId?: string;
  companionId: string;
  companion?: Companion;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  createdAt: string;
}

export interface Memory {
  id: string;
  userId: string;
  companionId: string;
  eventType: 'chat' | 'story_view' | 'milestone' | 'mood_change';
  metadata: Record<string, unknown>;
  createdAt: string;
}

export type MoodType = 'calm' | 'romantic' | 'playful' | 'deep';

export type PhotoType = 'selfie' | 'portrait' | 'full_body' | 'candid' | 'flirty' | 'cute' | 'romantic';

export interface Mood {
  id: string;
  userId: string;
  moodType: MoodType;
  createdAt: string;
}

export interface MoodTheme {
  name: string;
  emoji: string;
  description: string;
  gradient: string;
  bgClass: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
