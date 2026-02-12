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
  };
  tags: string[];
  age: number;
  status: 'online' | 'offline';
}

export interface Story {
  id: string;
  companionId: string;
  type: 'image' | 'video';
  content: string;
  caption?: string;
  viewed: boolean;
  timestamp: string;
  duration: number;
}

export interface Message {
  id: string;
  companionId: string;
  sender: 'user' | 'companion';
  content: string;
  timestamp: string;
  type: 'text' | 'voice' | 'image';
}

export interface Memory {
  id: string;
  companionId: string;
  type: 'chat' | 'memory' | 'story' | 'milestone';
  content: string;
  timestamp: string;
  icon: string;
}

export type MoodType = 'calm' | 'romantic' | 'playful' | 'deep';

export interface MoodTheme {
  name: string;
  emoji: string;
  description: string;
  gradient: string;
  bgClass: string;
}
