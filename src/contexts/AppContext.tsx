import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { companions as mockCompanions } from '@/mock/companions';
import { stories as mockStories } from '@/mock/stories';
import { messages as mockMessages } from '@/mock/messages';
import { memories as mockMemories } from '@/mock/memories';
import type { Companion, Story, Message, Memory, MoodType } from '@/types';

interface AppContextType {
  companions: Companion[];
  stories: Story[];
  messages: Record<string, Message[]>;
  memories: Memory[];
  mood: MoodType;
  setMood: (mood: MoodType) => void;
  markStoryViewed: (storyId: string) => void;
  addMessage: (companionId: string, message: Message) => void;
  getCompanion: (id: string) => Companion | undefined;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [stories, setStories] = useState<Story[]>(mockStories);
  const [messageMap, setMessageMap] = useState<Record<string, Message[]>>(mockMessages);
  const [mood, setMood] = useState<MoodType>('romantic');

  const markStoryViewed = useCallback((storyId: string) => {
    setStories(prev => prev.map(s => s.id === storyId ? { ...s, viewed: true } : s));
  }, []);

  const addMessage = useCallback((companionId: string, message: Message) => {
    setMessageMap(prev => ({
      ...prev,
      [companionId]: [...(prev[companionId] || []), message],
    }));
  }, []);

  const getCompanion = useCallback((id: string) => {
    return mockCompanions.find(c => c.id === id);
  }, []);

  return (
    <AppContext.Provider
      value={{
        companions: mockCompanions,
        stories,
        messages: messageMap,
        memories: mockMemories,
        mood,
        setMood,
        markStoryViewed,
        addMessage,
        getCompanion,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
