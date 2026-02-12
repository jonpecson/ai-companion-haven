import type { Message } from '@/types';

export const messages: Record<string, Message[]> = {
  luna: [
    { id: 'm1', companionId: 'luna', sender: 'companion', content: 'Hey there! I was just thinking about you 💕', timestamp: '2024-01-15T10:00:00', type: 'text' },
    { id: 'm2', companionId: 'luna', sender: 'user', content: 'Hey Luna! How are you doing today?', timestamp: '2024-01-15T10:01:00', type: 'text' },
    { id: 'm3', companionId: 'luna', sender: 'companion', content: "I'm doing great now that you're here! I was listening to some music and it reminded me of our last conversation about dreams.", timestamp: '2024-01-15T10:02:00', type: 'text' },
    { id: 'm4', companionId: 'luna', sender: 'user', content: "That's sweet! What song were you listening to?", timestamp: '2024-01-15T10:03:00', type: 'text' },
    { id: 'm5', companionId: 'luna', sender: 'companion', content: "It was \"Moonlight Sonata\" by Beethoven. Something about the melody just speaks to the soul, don't you think? 🎵", timestamp: '2024-01-15T10:04:00', type: 'text' },
  ],
  kai: [
    { id: 'mk1', companionId: 'kai', sender: 'companion', content: "What's up? Just finished reading this amazing book.", timestamp: '2024-01-15T09:00:00', type: 'text' },
    { id: 'mk2', companionId: 'kai', sender: 'user', content: 'Oh nice, what book?', timestamp: '2024-01-15T09:01:00', type: 'text' },
    { id: 'mk3', companionId: 'kai', sender: 'companion', content: 'Dune by Frank Herbert. The worldbuilding is insane. Have you read it?', timestamp: '2024-01-15T09:02:00', type: 'text' },
  ],
  sakura: [
    { id: 'ms1', companionId: 'sakura', sender: 'companion', content: 'Hiiii! 🌸 What are we doing today?', timestamp: '2024-01-15T11:00:00', type: 'text' },
    { id: 'ms2', companionId: 'sakura', sender: 'user', content: 'Hey Sakura! Just chilling, you?', timestamp: '2024-01-15T11:01:00', type: 'text' },
    { id: 'ms3', companionId: 'sakura', sender: 'companion', content: 'I just beat the hardest boss in my game! It took me like 50 tries 😤 But I did it! 🎮✨', timestamp: '2024-01-15T11:02:00', type: 'text' },
  ],
  atlas: [],
  nova: [
    { id: 'mn1', companionId: 'nova', sender: 'companion', content: 'The universe whispered something to me today... it said to check on you. How are you feeling?', timestamp: '2024-01-15T22:00:00', type: 'text' },
  ],
};
