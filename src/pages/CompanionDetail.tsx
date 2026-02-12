import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { CompanionCard } from '@/components/companions/CompanionCard';

const CompanionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { companions, stories, getCompanion } = useApp();
  const companion = getCompanion(id || '');

  if (!companion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Companion not found</p>
      </div>
    );
  }

  const companionStories = stories.filter(s => s.companionId === companion.id);
  const similar = companions.filter(c => c.id !== companion.id && c.category === companion.category).slice(0, 4);

  return (
    <div className="min-h-screen pb-24">
      <div className="relative h-[50vh]">
        <img src={companion.avatar} alt={companion.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 p-2 glass rounded-full z-10">
          <ArrowLeft size={20} className="text-foreground" />
        </button>
      </div>

      <div className="px-4 -mt-12 relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-bold text-foreground">
            {companion.name}
          </motion.h1>
          <span className={`px-2 py-0.5 rounded-full text-xs ${companion.status === 'online' ? 'bg-green-500/20 text-green-400' : 'bg-muted text-muted-foreground'}`}>
            {companion.status}
          </span>
        </div>

        <p className="text-muted-foreground text-sm leading-relaxed mb-4">{companion.bio}</p>

        <div className="flex flex-wrap gap-2 mb-6">
          {companion.tags.map(tag => (
            <span key={tag} className="glass px-3 py-1.5 rounded-full text-xs text-foreground">{tag}</span>
          ))}
        </div>

        <h2 className="text-sm font-semibold text-muted-foreground mb-3">PERSONALITY</h2>
        <div className="space-y-3 mb-6">
          {Object.entries(companion.personality).map(([key, val]) => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground capitalize w-24">{key}</span>
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${val}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full gradient-primary rounded-full"
                />
              </div>
              <span className="text-xs text-muted-foreground w-8">{val}%</span>
            </div>
          ))}
        </div>

        {companionStories.length > 0 && (
          <>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3">STORIES</h2>
            <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6">
              {companionStories.map(s => (
                <div key={s.id} className="w-20 h-28 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={s.content} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </>
        )}

        {similar.length > 0 && (
          <>
            <h2 className="text-sm font-semibold text-muted-foreground mb-3">SIMILAR COMPANIONS</h2>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {similar.map((c, i) => (
                <CompanionCard key={c.id} companion={c} index={i} />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="fixed bottom-20 left-0 right-0 p-4 z-40">
        <button
          onClick={() => navigate(`/chat/${companion.id}`)}
          className="w-full gradient-primary py-4 rounded-2xl text-primary-foreground font-semibold flex items-center justify-center gap-2 shadow-lg"
        >
          <MessageCircle size={20} />
          Start Chatting with {companion.name}
        </button>
      </div>
    </div>
  );
};

export default CompanionDetail;
