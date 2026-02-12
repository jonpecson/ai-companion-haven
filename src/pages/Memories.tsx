import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

const Memories = () => {
  const { memories, getCompanion } = useApp();

  const sorted = [...memories].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const grouped: Record<string, typeof memories> = {};
  sorted.forEach(m => {
    const date = new Date(m.timestamp).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    });
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(m);
  });

  return (
    <div className="min-h-screen p-4 pt-6">
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold text-foreground mb-2">
        Memories
      </motion.h1>
      <p className="text-sm text-muted-foreground mb-6">Your journey with AI companions</p>

      <div className="space-y-6">
        {Object.entries(grouped).map(([date, mems]) => (
          <div key={date}>
            <h2 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Clock size={12} />
              {date}
            </h2>
            <div className="space-y-3 ml-2 border-l border-border pl-4">
              {mems.map((mem, i) => {
                const comp = getCompanion(mem.companionId);
                return (
                  <motion.div
                    key={mem.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass rounded-xl p-4 flex items-center gap-3 relative"
                  >
                    <div className="absolute -left-[22px] w-3 h-3 rounded-full gradient-primary border-2 border-background" />
                    <span className="text-2xl">{mem.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{mem.content}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(mem.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {comp && ` · ${comp.name}`}
                      </p>
                    </div>
                    {comp && (
                      <img src={comp.avatar} alt={comp.name} className="w-8 h-8 rounded-full object-cover" />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Memories;
