import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { StoryTray } from '@/components/stories/StoryTray';
import { StoryViewer } from '@/components/stories/StoryViewer';

const Stories = () => {
  const [searchParams] = useSearchParams();
  const { stories, companions, markStoryViewed, getCompanion } = useApp();
  const [activeCompanionId, setActiveCompanionId] = useState<string | null>(
    searchParams.get('companion')
  );

  const activeCompanion = activeCompanionId ? getCompanion(activeCompanionId) : null;
  const activeStories = stories.filter(s => s.companionId === activeCompanionId);

  return (
    <div className="min-h-screen p-4 pt-6">
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold text-foreground mb-4">
        Stories
      </motion.h1>

      <StoryTray
        stories={stories}
        companions={companions}
        onStoryClick={setActiveCompanionId}
      />

      <div className="mt-6">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">RECENT STORIES</h2>
        <div className="grid grid-cols-3 gap-2">
          {stories.map((story, i) => {
            const comp = getCompanion(story.companionId);
            return (
              <motion.button
                key={story.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setActiveCompanionId(story.companionId)}
                className="relative aspect-[3/4] rounded-xl overflow-hidden"
              >
                <img src={story.content} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                {!story.viewed && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full gradient-primary" />
                )}
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="flex items-center gap-1.5">
                    {comp && <img src={comp.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />}
                    <span className="text-[10px] text-white font-medium">{comp?.name}</span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {activeCompanion && activeStories.length > 0 && (
        <StoryViewer
          stories={activeStories}
          companion={activeCompanion}
          onClose={() => setActiveCompanionId(null)}
          onViewed={markStoryViewed}
        />
      )}
    </div>
  );
};

export default Stories;
