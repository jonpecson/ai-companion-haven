import { motion } from 'framer-motion';

export const TypingIndicator = () => (
  <div className="flex justify-start mb-3">
    <div className="glass px-4 py-3 rounded-2xl rounded-bl-md">
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-muted-foreground"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  </div>
);
