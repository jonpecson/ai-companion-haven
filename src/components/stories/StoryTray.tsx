import { motion } from 'framer-motion';
import type { Story, Companion } from '@/types';

interface StoryTrayProps {
  stories: Story[];
  companions: Companion[];
  onStoryClick: (companionId: string) => void;
}

export const StoryTray = ({ stories, companions, onStoryClick }: StoryTrayProps) => {
  const companionStories = companions
    .filter(c => stories.some(s => s.companionId === c.id))
    .map(c => ({
      companion: c,
      hasUnviewed: stories.some(s => s.companionId === c.id && !s.viewed),
    }));

  return (
    <div className="flex gap-4 overflow-x-auto no-scrollbar px-4 py-3">
      {companionStories.map(({ companion, hasUnviewed }, i) => (
        <motion.button
          key={companion.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
          onClick={() => onStoryClick(companion.id)}
          className="flex flex-col items-center gap-1 flex-shrink-0"
        >
          <div className={`p-0.5 rounded-full ${hasUnviewed ? 'bg-gradient-to-tr from-primary to-accent' : 'bg-muted'}`}>
            <div className="p-0.5 bg-background rounded-full">
              <img
                src={companion.avatar}
                alt={companion.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            </div>
          </div>
          <span className="text-[11px] text-muted-foreground">{companion.name}</span>
        </motion.button>
      ))}
    </div>
  );
};
