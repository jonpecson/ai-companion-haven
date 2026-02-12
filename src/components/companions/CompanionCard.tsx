import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Companion } from '@/types';

interface CompanionCardProps {
  companion: Companion;
  index?: number;
}

export const CompanionCard = ({ companion, index = 0 }: CompanionCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={() => navigate(`/companions/${companion.id}`)}
      className="glass rounded-2xl overflow-hidden cursor-pointer group hover:border-primary/30 transition-all duration-300"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={companion.avatar}
          alt={companion.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground">{companion.name}</h3>
            {companion.status === 'online' && (
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse-ring" />
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">{companion.bio}</p>
        </div>
      </div>
    </motion.div>
  );
};
