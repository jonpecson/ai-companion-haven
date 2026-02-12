import type { Memory } from '@/types';

export const memories: Memory[] = [
  { id: 'mem1', companionId: 'luna', type: 'chat', content: 'You chatted with Luna for 20 minutes', timestamp: '2024-01-15T10:30:00', icon: '💬' },
  { id: 'mem2', companionId: 'luna', type: 'memory', content: 'Luna remembered you like coffee', timestamp: '2024-01-15T10:25:00', icon: '☕' },
  { id: 'mem3', companionId: 'luna', type: 'story', content: "You viewed Luna's story", timestamp: '2024-01-15T18:05:00', icon: '📸' },
  { id: 'mem4', companionId: 'sakura', type: 'chat', content: 'You chatted with Sakura about gaming', timestamp: '2024-01-15T11:30:00', icon: '🎮' },
  { id: 'mem5', companionId: 'kai', type: 'memory', content: 'Kai remembered your favorite book', timestamp: '2024-01-15T09:15:00', icon: '📚' },
  { id: 'mem6', companionId: 'nova', type: 'milestone', content: '7-day streak with Nova!', timestamp: '2024-01-14T00:00:00', icon: '🔥' },
  { id: 'mem7', companionId: 'luna', type: 'milestone', content: 'You and Luna shared 100 messages!', timestamp: '2024-01-13T00:00:00', icon: '🎉' },
  { id: 'mem8', companionId: 'atlas', type: 'chat', content: 'Atlas shared workout tips with you', timestamp: '2024-01-12T15:00:00', icon: '💪' },
  { id: 'mem9', companionId: 'sakura', type: 'story', content: "You viewed Sakura's cherry blossom story", timestamp: '2024-01-12T18:30:00', icon: '🌸' },
  { id: 'mem10', companionId: 'nova', type: 'memory', content: 'Nova remembered you love stargazing', timestamp: '2024-01-11T22:00:00', icon: '⭐' },
];
