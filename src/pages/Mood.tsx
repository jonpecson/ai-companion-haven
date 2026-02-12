import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import type { MoodType, MoodTheme } from '@/types';

const moods: Record<MoodType, MoodTheme> = {
  calm: {
    name: 'Calm',
    emoji: '🌊',
    description: 'Peaceful and serene conversations',
    gradient: 'from-blue-500 to-teal-500',
    bgClass: 'from-blue-900/30 to-teal-900/30',
  },
  romantic: {
    name: 'Romantic',
    emoji: '💕',
    description: 'Warm and heartfelt connections',
    gradient: 'from-pink-500 to-rose-500',
    bgClass: 'from-pink-900/30 to-rose-900/30',
  },
  playful: {
    name: 'Playful',
    emoji: '✨',
    description: 'Fun, energetic, and lighthearted',
    gradient: 'from-orange-500 to-yellow-500',
    bgClass: 'from-orange-900/30 to-yellow-900/30',
  },
  deep: {
    name: 'Deep Talk',
    emoji: '🌙',
    description: 'Meaningful and philosophical',
    gradient: 'from-purple-500 to-indigo-500',
    bgClass: 'from-purple-900/30 to-indigo-900/30',
  },
};

const Mood = () => {
  const navigate = useNavigate();
  const { mood, setMood, companions } = useApp();

  return (
    <div className="min-h-screen p-4 pt-6">
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold text-foreground mb-2">
        How are you feeling?
      </motion.h1>
      <p className="text-sm text-muted-foreground mb-6">Choose a mood to set the vibe</p>

      <div className="grid grid-cols-2 gap-3 mb-8">
        {(Object.entries(moods) as [MoodType, MoodTheme][]).map(([key, m], i) => (
          <motion.button
            key={key}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => setMood(key)}
            className={`relative rounded-2xl p-6 text-left overflow-hidden transition-all ${
              mood === key ? 'ring-2 ring-primary scale-[1.02]' : ''
            }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${m.gradient} opacity-20`} />
            <div className="relative">
              <span className="text-3xl block mb-2">{m.emoji}</span>
              <h3 className="font-semibold text-foreground">{m.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{m.description}</p>
            </div>
          </motion.button>
        ))}
      </div>

      <motion.div
        key={mood}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-6 bg-gradient-to-br ${moods[mood].bgClass}`}
      >
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">SUGGESTED FOR YOUR MOOD</h2>
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {companions.slice(0, 3).map(c => (
            <button
              key={c.id}
              onClick={() => navigate(`/chat/${c.id}`)}
              className="flex flex-col items-center gap-2 flex-shrink-0"
            >
              <img src={c.avatar} alt={c.name} className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/30" />
              <span className="text-xs text-foreground">{c.name}</span>
            </button>
          ))}
        </div>
      </motion.div>

      <div className={`mt-4 rounded-2xl p-4 bg-gradient-to-br ${moods[mood].bgClass}`}>
        <h3 className="text-xs text-muted-foreground mb-3">CHAT PREVIEW</h3>
        <div className="space-y-2">
          <div className="glass px-3 py-2 rounded-xl rounded-bl-sm max-w-[70%] text-sm text-foreground">
            How are you feeling today?
          </div>
          <div className={`px-3 py-2 rounded-xl rounded-br-sm max-w-[70%] ml-auto text-sm text-white bg-gradient-to-r ${moods[mood].gradient}`}>
            I'm in a {moods[mood].name.toLowerCase()} mood ✨
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mood;
