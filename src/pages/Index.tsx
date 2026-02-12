import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { CompanionCard } from '@/components/companions/CompanionCard';
import { StoryTray } from '@/components/stories/StoryTray';
import heroImage from '@/assets/hero.jpg';

const categories = [
  { id: 'girls', label: '👩 Girls', gradient: 'from-pink-500 to-rose-500' },
  { id: 'guys', label: '👨 Guys', gradient: 'from-blue-500 to-indigo-500' },
  { id: 'anime', label: '✨ Anime', gradient: 'from-purple-500 to-fuchsia-500' },
];

const Index = () => {
  const navigate = useNavigate();
  const { companions, stories, memories } = useApp();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative h-[60vh] overflow-hidden">
        <img src={heroImage} alt="AI Companion" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-foreground mb-2"
          >
            Find Your AI <span className="text-gradient">Companion</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground mb-4"
          >
            Connect, chat, and create meaningful bonds
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => navigate('/companions')}
            className="gradient-primary px-6 py-3 rounded-full text-primary-foreground font-medium flex items-center gap-2"
          >
            <MessageCircle size={18} />
            Start Chatting
          </motion.button>
        </div>
      </div>

      {/* Stories */}
      <div className="mt-4">
        <h2 className="px-4 text-sm font-semibold text-muted-foreground mb-2">STORIES</h2>
        <StoryTray
          stories={stories}
          companions={companions}
          onStoryClick={(id) => navigate(`/stories?companion=${id}`)}
        />
      </div>

      {/* Categories */}
      <div className="px-4 mt-6">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">CATEGORIES</h2>
        <div className="flex gap-3">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => navigate(`/companions?category=${cat.id}`)}
              className={`flex-1 py-3 rounded-xl bg-gradient-to-r ${cat.gradient} text-white text-sm font-medium`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recent Memories */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground">RECENT MEMORIES</h2>
          <button onClick={() => navigate('/memories')} className="text-xs text-primary">View all</button>
        </div>
        <div className="space-y-2">
          {memories.slice(0, 3).map(mem => (
            <div key={mem.id} className="glass rounded-xl p-3 flex items-center gap-3">
              <span className="text-lg">{mem.icon}</span>
              <p className="text-xs text-muted-foreground flex-1">{mem.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Featured */}
      <div className="px-4 mt-6 mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground">FEATURED COMPANIONS</h2>
          <button onClick={() => navigate('/companions')} className="text-xs text-primary">View all</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {companions.slice(0, 4).map((c, i) => (
            <CompanionCard key={c.id} companion={c} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
