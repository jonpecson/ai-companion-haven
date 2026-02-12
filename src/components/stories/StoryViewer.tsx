import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { Story, Companion } from '@/types';

interface StoryViewerProps {
  stories: Story[];
  companion: Companion;
  onClose: () => void;
  onViewed: (storyId: string) => void;
}

export const StoryViewer = ({ stories, companion, onClose, onViewed }: StoryViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const story = stories[currentIndex];
  const duration = (story?.duration || 5) * 1000;

  const goNext = useCallback(() => {
    setCurrentIndex(prev => {
      if (prev >= stories.length - 1) {
        setTimeout(onClose, 0);
        return prev;
      }
      return prev + 1;
    });
    setProgress(0);
  }, [stories.length, onClose]);

  const goPrev = useCallback(() => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
    setProgress(0);
  }, []);

  useEffect(() => {
    if (story) onViewed(story.id);
    setProgress(0);
    const timer = setTimeout(goNext, duration);
    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + (100 / (duration / 50)), 100));
    }, 50);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [currentIndex, duration, goNext, onViewed, story]);

  const handleTap = (e: React.MouseEvent) => {
    const x = e.clientX;
    const width = window.innerWidth;
    if (x < width / 3) goPrev();
    else goNext();
  };

  if (!story) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black"
    >
      <div className="relative w-full h-full" onClick={handleTap}>
        {/* Progress bars */}
        <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 p-3">
          {stories.map((_, i) => (
            <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-75"
                style={{
                  width: i < currentIndex ? '100%' : i === currentIndex ? `${progress}%` : '0%',
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-8 left-0 right-0 z-10 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <img src={companion.avatar} alt={companion.name} className="w-8 h-8 rounded-full object-cover" />
            <span className="text-white text-sm font-medium">{companion.name}</span>
          </div>
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="text-white p-2">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <img src={story.content} alt={story.caption || ''} className="w-full h-full object-cover" />

        {/* Caption */}
        {story.caption && (
          <div className="absolute bottom-16 left-0 right-0 z-10 px-6">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={story.id}
              className="text-white text-center text-lg font-medium drop-shadow-lg"
            >
              {story.caption}
            </motion.p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
