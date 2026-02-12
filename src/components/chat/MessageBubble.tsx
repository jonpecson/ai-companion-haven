import { motion } from 'framer-motion';
import type { Message } from '@/types';

export const MessageBubble = ({ message }: { message: Message }) => {
  const isUser = message.sender === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}
    >
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
          isUser
            ? 'gradient-primary text-primary-foreground rounded-br-md'
            : 'glass text-foreground rounded-bl-md'
        }`}
      >
        {message.type === 'voice' ? (
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-current rounded-full"
                  style={{ height: `${8 + Math.random() * 16}px` }}
                />
              ))}
            </div>
            <span className="text-xs opacity-70">0:15</span>
          </div>
        ) : (
          <p>{message.content}</p>
        )}
        <p className={`text-[10px] mt-1 ${isUser ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  );
};
